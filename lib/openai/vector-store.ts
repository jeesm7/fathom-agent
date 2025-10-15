import { openai, VECTOR_STORE_ID } from "./client";
import fs from "fs";

export async function uploadFileToVectorStore(
  filePath: string,
  metadata: Record<string, any> = {}
): Promise<string> {
  if (!VECTOR_STORE_ID) {
    throw new Error("Vector store ID not configured");
  }

  // Upload file to OpenAI
  const file = await openai.files.create({
    file: fs.createReadStream(filePath),
    purpose: "assistants",
  });

  // Add file to vector store
  await openai.beta.vectorStores.files.create(VECTOR_STORE_ID, {
    file_id: file.id,
  });

  return file.id;
}

export async function uploadBufferToVectorStore(
  buffer: Buffer,
  filename: string,
  metadata: Record<string, any> = {}
): Promise<string> {
  if (!VECTOR_STORE_ID) {
    throw new Error("Vector store ID not configured");
  }

  // Create a temporary file
  const tempPath = `/tmp/${filename}`;
  fs.writeFileSync(tempPath, buffer);

  try {
    const fileId = await uploadFileToVectorStore(tempPath, metadata);
    return fileId;
  } finally {
    // Clean up temp file
    fs.unlinkSync(tempPath);
  }
}

export async function removeFileFromVectorStore(
  fileId: string
): Promise<void> {
  if (!VECTOR_STORE_ID) {
    throw new Error("Vector store ID not configured");
  }

  await openai.beta.vectorStores.files.del(VECTOR_STORE_ID, fileId);
  await openai.files.del(fileId);
}

export async function listVectorStoreFiles(): Promise<any[]> {
  if (!VECTOR_STORE_ID) {
    return [];
  }

  const files = await openai.beta.vectorStores.files.list(VECTOR_STORE_ID);
  return files.data;
}

