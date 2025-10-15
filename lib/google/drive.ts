import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { Readable } from "stream";

export async function uploadFileToDrive(
  auth: OAuth2Client,
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer,
  folderId?: string
) {
  const drive = google.drive({ version: "v3", auth });

  const fileMetadata: any = {
    name: fileName,
  };

  if (folderId) {
    fileMetadata.parents = [folderId];
  }

  const media = {
    mimeType,
    body: Readable.from(fileBuffer),
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id, name, mimeType, webViewLink",
  });

  return {
    id: file.data.id!,
    name: file.data.name!,
    mimeType: file.data.mimeType!,
    webViewLink: file.data.webViewLink || "",
  };
}

export async function downloadFileFromDrive(
  auth: OAuth2Client,
  fileId: string
) {
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.get(
    {
      fileId,
      alt: "media",
    },
    { responseType: "arraybuffer" }
  );

  return Buffer.from(response.data as ArrayBuffer);
}

export async function getFileMetadata(auth: OAuth2Client, fileId: string) {
  const drive = google.drive({ version: "v3", auth });

  const file = await drive.files.get({
    fileId,
    fields: "id, name, mimeType, webViewLink, createdTime",
  });

  return file.data;
}

