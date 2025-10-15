import { prisma } from "@/lib/prisma";
import { generateContent } from "@/lib/openai/generation";
import { searchVectorStore } from "@/lib/openai/research";
import { getGoogleClient } from "@/lib/google/auth";
import { createGoogleDoc, updateGoogleDoc, getDocShareUrl } from "@/lib/google/docs";

export async function generateScopeOfWork(
  runId: string,
  transcript: string,
  metadata?: Record<string, any>
) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found for Google API access");

  const auth = await getGoogleClient(user.id);

  // Search for example SOWs
  const examples = await searchVectorStore(
    "scope of work SOW examples with deliverables",
    "sow"
  );

  const exampleContext = examples.length > 0 ? examples.join("\n\n") : "";

  // Generate SOW content
  const content = await generateContent({
    promptKey: "scope_of_work",
    variables: {
      transcript,
      examples: exampleContext,
      metadata: JSON.stringify(metadata || {}),
    },
  });

  // Create Google Doc
  const folderId = process.env.SCOPE_OF_WORK_DRIVE_FOLDER_ID;
  const title = `Scope of Work - ${metadata?.meeting_title || "Meeting"} - ${new Date().toISOString().split("T")[0]}`;

  const docId = await createGoogleDoc(auth, title, folderId);
  await updateGoogleDoc(auth, docId, content);
  const shareUrl = await getDocShareUrl(auth, docId, true);

  // Save output
  const output = await prisma.output.create({
    data: {
      runId,
      type: "SCOPE_OF_WORK",
      title,
      docsId: docId,
      driveFileId: docId,
      shareUrl,
      extraJson: JSON.stringify({ exampleCount: examples.length }),
    },
  });

  return output;
}

