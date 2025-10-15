import crypto from "crypto";

export function verifyFathomSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");

  // Timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export interface FathomWebhookPayload {
  meeting: {
    id: string;
    call_url: string;
    started_at: string;
    ended_at: string;
    title?: string;
  };
  calendar_invitees?: Array<{
    email: string;
    name?: string;
  }>;
  transcript?: Array<{
    text: string;
    speaker?: string;
    timestamp?: number;
  }>;
  summary?: string;
  notes?: string;
}

export function parseTranscript(
  transcript?: Array<{ text: string; speaker?: string }>
): string {
  if (!transcript || transcript.length === 0) {
    return "";
  }

  return transcript
    .map((entry) => {
      const speaker = entry.speaker || "Unknown";
      return `${speaker}: ${entry.text}`;
    })
    .join("\n\n");
}

