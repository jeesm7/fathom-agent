import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

interface EmailDraft {
  to: string;
  subject: string;
  body: string;
  threadId?: string;
  messageId?: string;
}

export async function createGmailDraft(
  auth: OAuth2Client,
  draft: EmailDraft
) {
  const gmail = google.gmail({ version: "v1", auth });

  // Build email in RFC 2822 format
  const messageParts = [
    `To: ${draft.to}`,
    `Subject: ${draft.subject}`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    draft.body,
  ];

  // Add threading headers if provided
  if (draft.messageId) {
    messageParts.splice(2, 0, `In-Reply-To: ${draft.messageId}`);
    messageParts.splice(3, 0, `References: ${draft.messageId}`);
  }

  const message = messageParts.join("\r\n");
  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const draftRequest: any = {
    message: {
      raw: encodedMessage,
    },
  };

  if (draft.threadId) {
    draftRequest.message.threadId = draft.threadId;
  }

  const response = await gmail.users.drafts.create({
    userId: "me",
    requestBody: draftRequest,
  });

  return {
    draftId: response.data.id!,
    messageId: response.data.message?.id,
  };
}

export async function getDraft(auth: OAuth2Client, draftId: string) {
  const gmail = google.gmail({ version: "v1", auth });

  const response = await gmail.users.drafts.get({
    userId: "me",
    id: draftId,
  });

  return response.data;
}

export async function listDrafts(auth: OAuth2Client, maxResults = 10) {
  const gmail = google.gmail({ version: "v1", auth });

  const response = await gmail.users.drafts.list({
    userId: "me",
    maxResults,
  });

  return response.data.drafts || [];
}

