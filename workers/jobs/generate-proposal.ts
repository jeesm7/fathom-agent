import { prisma } from "@/lib/prisma";
import { generateContent } from "@/lib/openai/generation";
import { searchVectorStore } from "@/lib/openai/research";
import { getGoogleClient } from "@/lib/google/auth";
import { createGoogleDoc, updateGoogleDoc, getDocShareUrl } from "@/lib/google/docs";

export async function generateProposal(
  runId: string,
  transcript: string,
  metadata?: Record<string, any>
) {
  // Find first user (admin) for Google API access
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found for Google API access");

  const auth = await getGoogleClient(user.id);

  // Search for example proposals
  const examples = await searchVectorStore(
    "business proposal examples with pricing and scope",
    "proposal"
  );

  const exampleContext = examples.length > 0 ? examples.join("\n\n") : "";

  // Generate proposal content
  const content = await generateContent({
    promptKey: "proposal",
    variables: {
      transcript,
      examples: exampleContext,
      metadata: JSON.stringify(metadata || {}),
    },
  });

  // Create Google Doc
  const folderId = process.env.PROPOSALS_DRIVE_FOLDER_ID;
  const title = `Proposal - ${metadata?.meeting_title || "Meeting"} - ${new Date().toISOString().split("T")[0]}`;

  const docId = await createGoogleDoc(auth, title, folderId);
  await updateGoogleDoc(auth, docId, content);
  const shareUrl = await getDocShareUrl(auth, docId, true);

  // Save output
  const output = await prisma.output.create({
    data: {
      runId,
      type: "PROPOSAL",
      title,
      docsId: docId,
      driveFileId: docId,
      shareUrl,
      extraJson: JSON.stringify({ exampleCount: examples.length }),
    },
  });

  return output;
}

