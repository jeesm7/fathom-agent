import { prisma } from "@/lib/prisma";
import { generateContent } from "@/lib/openai/generation";
import { getGoogleClient } from "@/lib/google/auth";
import { createGmailDraft } from "@/lib/google/gmail";

export async function generateFollowupEmail(
  runId: string,
  transcript: string,
  metadata?: Record<string, any>
) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found for Google API access");

  const auth = await getGoogleClient(user.id);

  // Get all outputs for this run to include links
  const outputs = await prisma.output.findMany({
    where: { runId },
  });

  const outputLinks = outputs
    .filter((o) => o.shareUrl)
    .map((o) => `- ${o.type}: ${o.shareUrl}`)
    .join("\n");

  // Generate email content
  const emailBody = await generateContent({
    promptKey: "followup_email",
    variables: {
      transcript,
      outputs: outputLinks,
      metadata: JSON.stringify(metadata || {}),
    },
  });

  // Extract prospect email from metadata or use fallback
  const prospectEmail =
    metadata?.prospect_email ||
    metadata?.invitees?.[0]?.email ||
    process.env.GMAIL_DRAFT_FALLBACK_TO ||
    "prospect@example.com";

  const subject = `Follow-up: ${metadata?.meeting_title || "Our Meeting"}`;

  // Create Gmail draft
  const { draftId, messageId } = await createGmailDraft(auth, {
    to: prospectEmail,
    subject,
    body: emailBody,
  });

  // Save output
  const output = await prisma.output.create({
    data: {
      runId,
      type: "FOLLOWUP_EMAIL",
      title: subject,
      gmailDraftId: draftId,
      extraJson: JSON.stringify({
        to: prospectEmail,
        messageId,
        attachedOutputs: outputs.length,
      }),
    },
  });

  return output;
}

