import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGoogleClient } from "@/lib/google/auth";
import { uploadFileToDrive } from "@/lib/google/drive";
import { uploadBufferToVectorStore } from "@/lib/openai/vector-store";

export async function POST(request: NextRequest) {
  // TODO: Add authentication when NextAuth is configured
  // For now, try to get the first user
  const user = await prisma.user.findFirst();
  if (!user?.id) {
    return NextResponse.json(
      { error: "No user configured. Please sign in with Google first." },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const kind = formData.get("kind") as string;
    const title = formData.get("title") as string;

    if (!file || !kind || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const auth = await getGoogleClient(user.id);

    // Upload to Google Drive
    const folderId = process.env.RESEARCH_ATTACHMENTS_DRIVE_FOLDER_ID;
    const driveFile = await uploadFileToDrive(
      auth,
      file.name,
      file.type,
      buffer,
      folderId
    );

    // Upload to OpenAI Vector Store
    let vectorStoreFileId: string | undefined;
    try {
      vectorStoreFileId = await uploadBufferToVectorStore(
        buffer,
        file.name,
        { kind }
      );
    } catch (error) {
      console.error("Failed to upload to vector store:", error);
    }

    // Save to database
    const exampleDoc = await prisma.exampleDoc.create({
      data: {
        driveFileId: driveFile.id,
        mimeType: driveFile.mimeType,
        title,
        vectorStoreFileId,
        kind,
      },
    });

    return NextResponse.json(exampleDoc);
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

