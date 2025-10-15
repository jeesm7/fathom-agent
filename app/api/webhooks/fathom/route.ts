import { NextRequest, NextResponse } from "next/server";
import {
  verifyFathomSignature,
  parseTranscript,
  FathomWebhookPayload,
} from "@/lib/fathom/webhook";
import { prisma } from "@/lib/prisma";
import { enqueueMeeting } from "@/lib/queue/meeting-queue";

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-fathom-signature");
    const secret = process.env.FATHOM_WEBHOOK_SECRET;

    if (!secret) {
      console.error("FATHOM_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    // Verify signature
    if (!signature) {
      console.warn("Missing X-Fathom-Signature header");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      );
    }

    if (!verifyFathomSignature(rawBody, signature, secret)) {
      console.warn("Invalid Fathom signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse payload
    const payload: FathomWebhookPayload = JSON.parse(rawBody);

    // Check if we already have this meeting (idempotency)
    const existingRun = await prisma.run.findUnique({
      where: { meetingId: payload.meeting.id },
    });

    if (existingRun) {
      console.log(`Meeting ${payload.meeting.id} already processed`);
      return NextResponse.json({
        success: true,
        runId: existingRun.id,
        message: "Already processed",
      });
    }

    // Parse transcript
    let transcript = parseTranscript(payload.transcript);

    // If no transcript in webhook, fetch via Fathom API
    if (!transcript && process.env.FATHOM_API_KEY) {
      try {
        const response = await fetch(
          `https://api.fathom.video/v1/meetings/${payload.meeting.id}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.FATHOM_API_KEY}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          transcript = parseTranscript(data.transcript);
        }
      } catch (error) {
        console.error("Failed to fetch transcript from Fathom API:", error);
      }
    }

    if (!transcript) {
      return NextResponse.json(
        { error: "No transcript available" },
        { status: 400 }
      );
    }

    // Create run
    const run = await prisma.run.create({
      data: {
        meetingId: payload.meeting.id,
        fathomExternalId: payload.meeting.id,
        status: "pending",
        transcript,
        metadata: JSON.stringify({
          meeting_title: payload.meeting.title,
          call_url: payload.meeting.call_url,
          started_at: payload.meeting.started_at,
          ended_at: payload.meeting.ended_at,
          invitees: payload.calendar_invitees,
          summary: payload.summary,
          notes: payload.notes,
        }),
      },
    });

    // Enqueue job
    await enqueueMeeting({
      runId: run.id,
      meetingId: payload.meeting.id,
      fathomExternalId: payload.meeting.id,
      transcript,
      metadata: {
        meeting_title: payload.meeting.title,
        call_url: payload.meeting.call_url,
        invitees: payload.calendar_invitees,
        prospect_email: payload.calendar_invitees?.[0]?.email,
      },
    });

    // Quick response
    return NextResponse.json({
      success: true,
      runId: run.id,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

