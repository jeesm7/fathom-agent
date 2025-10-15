import { prisma } from "@/lib/prisma";
import { generateContent } from "@/lib/openai/generation";
import { performWebResearch } from "@/lib/openai/research";
import { getGoogleClient } from "@/lib/google/auth";
import { createGoogleDoc, updateGoogleDoc, getDocShareUrl } from "@/lib/google/docs";

export async function generateLegalResearch(
  runId: string,
  transcript: string,
  metadata?: Record<string, any>
) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found for Google API access");

  const auth = await getGoogleClient(user.id);

  // Perform deep research
  const useDeepResearch = process.env.OPENAI_DEEP_RESEARCH_ENABLED === "true";
  const researchQuery = `Legal research based on this discussion: ${transcript.slice(0, 1000)}`;

  const research = await performWebResearch(researchQuery, useDeepResearch);

  // Generate legal research document
  const content = await generateContent({
    promptKey: "legal_research",
    variables: {
      transcript,
      research: research.synthesis,
      citations: JSON.stringify(research.citations),
    },
  });

  // Add disclaimer header
  const disclaimer = `⚠️ LEGAL DISCLAIMER: This document is for informational purposes only and does not constitute legal advice. Consult with a qualified attorney for legal guidance.\n\n---\n\n`;
  const fullContent = disclaimer + content;

  // Create Google Doc
  const folderId = process.env.LEGAL_RESEARCH_DRIVE_FOLDER_ID;
  const title = `Legal Research - ${metadata?.meeting_title || "Meeting"} - ${new Date().toISOString().split("T")[0]}`;

  const docId = await createGoogleDoc(auth, title, folderId);
  await updateGoogleDoc(auth, docId, fullContent);
  const shareUrl = await getDocShareUrl(auth, docId, true);

  // Save output
  const output = await prisma.output.create({
    data: {
      runId,
      type: "LEGAL_RESEARCH",
      title,
      docsId: docId,
      driveFileId: docId,
      shareUrl,
      extraJson: JSON.stringify({
        citationCount: research.citations.length,
        sources: research.sources,
      }),
    },
  });

  return output;
}

