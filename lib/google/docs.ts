import { google, docs_v1 } from "googleapis";
import { OAuth2Client } from "google-auth-library";

export async function createGoogleDoc(
  auth: OAuth2Client,
  title: string,
  folderId?: string
) {
  const docs = google.docs({ version: "v1", auth });
  const drive = google.drive({ version: "v3", auth });

  // Create the document
  const doc = await docs.documents.create({
    requestBody: {
      title,
    },
  });

  const docId = doc.data.documentId!;

  // Move to folder if specified
  if (folderId) {
    await drive.files.update({
      fileId: docId,
      addParents: folderId,
      fields: "id, parents",
    });
  }

  return docId;
}

export async function updateGoogleDoc(
  auth: OAuth2Client,
  documentId: string,
  content: string
) {
  const docs = google.docs({ version: "v1", auth });

  // Get current doc to find end index
  const doc = await docs.documents.get({ documentId });
  const endIndex = doc.data.body?.content?.[0]?.endIndex || 1;

  // Build requests to insert content
  const requests: docs_v1.Schema$Request[] = [
    {
      insertText: {
        location: { index: 1 },
        text: content,
      },
    },
  ];

  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests,
    },
  });
}

export async function getDocShareUrl(
  auth: OAuth2Client,
  fileId: string,
  makePublic = false
) {
  const drive = google.drive({ version: "v3", auth });

  if (makePublic) {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
  }

  const file = await drive.files.get({
    fileId,
    fields: "webViewLink",
  });

  return file.data.webViewLink || "";
}

