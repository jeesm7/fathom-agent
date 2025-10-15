# Fathom Webhook Integration Guide

## Overview

This application automatically processes Fathom meeting recordings using webhooks. When a meeting ends and the transcript is ready, Fathom sends a webhook notification to your application, which then:

1. ✅ Verifies the webhook signature (HMAC-SHA256)
2. ✅ Extracts the transcript and meeting metadata
3. ✅ Classifies what deliverables to generate (proposals, legal research, etc.)
4. ✅ Performs web research on relevant topics
5. ✅ Generates documents using OpenAI and your example templates
6. ✅ Creates Google Docs and Gmail drafts
7. ✅ Provides a beautiful UI to monitor everything

## How Fathom Webhooks Work

### Webhook Trigger
Fathom sends a POST request to your configured endpoint when:
- A meeting recording is completed
- The AI has finished processing the transcript
- The summary and notes are ready

### Event: `call.ended` or `meeting.ready`

The webhook is triggered automatically after each call. No manual intervention needed!

## Webhook Payload Structure

Our implementation expects the following payload from Fathom:

```typescript
{
  "meeting": {
    "id": "mtg_123abc",           // Unique meeting ID
    "call_url": "https://...",     // Video recording URL
    "started_at": "2024-01-15T10:00:00Z",
    "ended_at": "2024-01-15T11:00:00Z",
    "title": "Client Discovery Call"
  },
  "calendar_invitees": [
    {
      "email": "client@example.com",
      "name": "John Doe"
    }
  ],
  "transcript": [
    {
      "speaker": "John Doe",
      "text": "Thanks for meeting with me today...",
      "timestamp": 0
    },
    {
      "speaker": "You",
      "text": "Of course! Let's discuss your needs...",
      "timestamp": 5
    }
  ],
  "summary": "AI-generated summary...",
  "notes": "AI-generated notes..."
}
```

## Security: Webhook Signature Verification

### How It Works

Fathom signs each webhook with HMAC-SHA256 to ensure authenticity:

1. Fathom creates a signature using your secret key
2. Sends it in the `X-Fathom-Signature` header
3. Our app verifies the signature before processing

### Our Implementation

```typescript
// lib/fathom/webhook.ts
export function verifyFathomSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

**✅ This prevents unauthorized requests from triggering your pipeline!**

## Setup Instructions

### 1. Generate a Webhook Secret

```bash
openssl rand -hex 32
```

Add this to your `.env` file:
```env
FATHOM_WEBHOOK_SECRET=your-generated-secret-here
```

### 2. Configure Fathom Webhook (Production)

1. **Log in to Fathom**: Go to [fathom.video](https://fathom.video)
2. **Navigate to Webhooks**: Settings → Integrations → Webhooks
3. **Create New Webhook**:
   - **URL**: `https://your-domain.com/api/webhooks/fathom`
   - **Event**: "Meeting Ready" or "Call Ended"
   - **Secret**: Paste your `FATHOM_WEBHOOK_SECRET`
4. **Save**: Fathom will now send webhooks automatically!

### 3. Local Development Testing

Since Fathom needs a public URL, use **ngrok** for local testing:

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# Start your app
npm run dev

# In another terminal, expose port 3000
ngrok http 3000
```

You'll get a public URL like: `https://abc123.ngrok.io`

**Configure in Fathom**:
- URL: `https://abc123.ngrok.io/api/webhooks/fathom`
- Secret: Your `FATHOM_WEBHOOK_SECRET`

### 4. Test the Webhook

#### Option A: Real Fathom Meeting
1. Have a meeting recorded by Fathom
2. Wait for processing to complete
3. Fathom automatically sends webhook
4. Check your logs: `http://localhost:3000/logs`

#### Option B: Manual Test (Postman/curl)

```bash
curl -X POST http://localhost:3000/api/webhooks/fathom \
  -H "Content-Type: application/json" \
  -H "X-Fathom-Signature: $(echo -n '{"meeting":{"id":"test_123"}}' | openssl dgst -sha256 -hmac 'your-secret' | cut -d' ' -f2)" \
  -d '{
    "meeting": {
      "id": "test_123",
      "call_url": "https://fathom.video/call/test",
      "started_at": "2024-01-15T10:00:00Z",
      "ended_at": "2024-01-15T11:00:00Z",
      "title": "Test Call"
    },
    "calendar_invitees": [
      {
        "email": "test@example.com",
        "name": "Test User"
      }
    ],
    "transcript": [
      {
        "speaker": "Client",
        "text": "We need a comprehensive proposal for our new project.",
        "timestamp": 0
      }
    ],
    "summary": "Discussion about new project proposal"
  }'
```

## What Happens After Webhook Received?

### 1. **Webhook Endpoint** (`/api/webhooks/fathom`)
   - ✅ Verifies signature
   - ✅ Checks for duplicate (idempotency)
   - ✅ Parses transcript
   - ✅ Creates `Run` record in database
   - ✅ Enqueues job to BullMQ
   - ✅ Returns 200 OK immediately

### 2. **Worker Processing** (Background)
   - 🤖 Classifies deliverables (AI-powered)
   - 🔍 Performs web research (OpenAI + Tavily)
   - 📄 Generates documents (OpenAI with your prompts)
   - 📁 Creates Google Docs in Drive folders
   - ✉️ Creates Gmail drafts
   - ✅ Updates `Run` status to "completed"

### 3. **Monitor Progress**
   - Dashboard: Real-time status updates
   - Logs: Detailed timeline of each job
   - Outputs: Links to generated Docs and Gmail drafts

## Troubleshooting

### ❌ "Invalid signature" Error

**Cause**: Webhook secret mismatch

**Fix**:
1. Check your `.env` file has correct `FATHOM_WEBHOOK_SECRET`
2. Verify the secret matches what's configured in Fathom
3. Restart your server: `npm run dev`

### ❌ "No transcript available" Error

**Cause**: Transcript not included in webhook payload

**Fix**:
1. Add `FATHOM_API_KEY` to `.env` (optional)
2. App will automatically fetch transcript from Fathom API
3. Or ensure Fathom includes transcript in webhook payload

### ❌ Webhook Not Triggering

**Checklist**:
- [ ] Webhook URL is correct in Fathom settings
- [ ] URL is publicly accessible (use ngrok for local)
- [ ] Port 3000 is open and server is running
- [ ] Check Fathom webhook logs for delivery status
- [ ] Check your app logs: `http://localhost:3000/logs`

### ❌ "Meeting already processed" Message

**Cause**: Duplicate webhook (expected behavior)

**Fix**: This is normal! Our app prevents duplicate processing using `meetingId` as unique key.

## Advanced Configuration

### Custom Transcript Parsing

Edit `lib/fathom/webhook.ts`:

```typescript
export function parseTranscript(
  transcript?: Array<{ text: string; speaker?: string }>
): string {
  // Customize format here
  return transcript
    .map((entry) => `${entry.speaker}: ${entry.text}`)
    .join("\n\n");
}
```

### Fallback Transcript Fetching

If webhook doesn't include transcript, app automatically tries Fathom API:

```typescript
// app/api/webhooks/fathom/route.ts
if (!transcript && process.env.FATHOM_API_KEY) {
  const response = await fetch(
    `https://api.fathom.video/v1/meetings/${payload.meeting.id}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FATHOM_API_KEY}`,
      },
    }
  );
  const data = await response.json();
  transcript = parseTranscript(data.transcript);
}
```

## Production Deployment

### 1. Deploy Your App
```bash
# Vercel
vercel deploy

# Or Railway
railway up

# Or any Node.js host
```

### 2. Update Fathom Webhook URL
```
https://your-production-domain.com/api/webhooks/fathom
```

### 3. Environment Variables
Ensure all production env vars are set:
- `FATHOM_WEBHOOK_SECRET` ✅
- `OPENAI_API_KEY` ✅
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` ✅
- Drive folder IDs ✅

### 4. Monitor
- Use your app's Logs page
- Check Fathom webhook delivery logs
- Set up error alerts (Sentry, etc.)

## API Reference

### Webhook Endpoint

**POST** `/api/webhooks/fathom`

**Headers:**
- `Content-Type: application/json`
- `X-Fathom-Signature: <hmac-sha256-signature>`

**Response:**
```json
{
  "success": true,
  "runId": "clx123abc"
}
```

**Status Codes:**
- `200`: Successfully processed
- `401`: Invalid signature
- `400`: Missing transcript or invalid payload
- `500`: Server error

## Summary

✅ **Automatic Processing**: Fathom webhook triggers on call completion  
✅ **Secure**: HMAC-SHA256 signature verification  
✅ **Idempotent**: Prevents duplicate processing  
✅ **Async**: BullMQ job queue for background processing  
✅ **Reliable**: Fallback transcript fetching via API  
✅ **Observable**: Real-time monitoring in admin UI  

**Your tool is production-ready! 🚀**

When you have a Fathom meeting, everything happens automatically:
1. Meeting ends → Fathom processes
2. Fathom sends webhook → Your app receives
3. Worker generates documents → Google Docs created
4. Gmail drafts sent → You review and send

**No manual intervention required!** ✨

