import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enqueueMeeting } from "@/lib/queue/meeting-queue";

export async function POST(request: NextRequest) {
  // TODO: Add authentication when NextAuth is configured

  try {
    const body = await request.json();
    const { transcript, meetingTitle } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript required" },
        { status: 400 }
      );
    }

    // Create test run
    const meetingId = `test-${Date.now()}`;

    const run = await prisma.run.create({
      data: {
        meetingId,
        status: "pending",
        transcript,
        metadata: JSON.stringify({
          meeting_title: meetingTitle || "Test Run",
          test: true,
        }),
      },
    });

    // Enqueue job
    await enqueueMeeting({
      runId: run.id,
      meetingId,
      transcript,
      metadata: {
        meeting_title: meetingTitle || "Test Run",
        test: true,
      },
    });

    return NextResponse.json({
      success: true,
      runId: run.id,
    });
  } catch (error) {
    console.error("Test run error:", error);
    return NextResponse.json(
      { error: "Test run failed" },
      { status: 500 }
    );
  }
}

