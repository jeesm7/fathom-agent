# Setup Guide - Step by Step

This guide will walk you through setting up the Fathom Agent from scratch.

## Prerequisites Checklist

- [ ] Node.js 20+ installed
- [ ] Redis installed and running
- [ ] Google account
- [ ] OpenAI account with API access
- [ ] (Optional) Fathom account

## Step 1: Install Dependencies

```bash
cd "fathom agent"
npm install
```

## Step 2: Set Up Google Cloud Project

### 2.1 Create Project

1. Go to https://console.cloud.google.com
2. Click "Create Project"
3. Name it "Fathom Agent" (or your choice)
4. Click "Create"

### 2.2 Enable APIs

1. In the Cloud Console, go to "APIs & Services" → "Library"
2. Search and enable these APIs:
   - **Gmail API**
   - **Google Docs API**
   - **Google Drive API**

### 2.3 Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (or "Internal" if you have Google Workspace)
3. Fill in:
   - App name: "Fathom Agent"
   - User support email: your email
   - Developer contact: your email
4. Click "Save and Continue"
5. Click "Add or Remove Scopes"
6. Add these scopes:
   - `openid`
   - `email`
   - `profile`
   - `.../auth/gmail.compose`
   - `.../auth/gmail.modify`
   - `.../auth/documents`
   - `.../auth/drive.file`
7. Click "Update" and "Save and Continue"
8. Add your email as a test user
9. Click "Save and Continue" and "Back to Dashboard"

### 2.4 Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "Fathom Agent Web Client"
5. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - (Add production URL later)
6. Click "Create"
7. **Copy the Client ID and Client Secret** - you'll need these for `.env`

## Step 3: Set Up OpenAI

### 3.1 Get API Key

1. Go to https://platform.openai.com
2. Navigate to "API Keys"
3. Click "Create new secret key"
4. Name it "Fathom Agent"
5. **Copy the key** - you won't see it again

### 3.2 Create Vector Store

1. In OpenAI Platform, go to "Vector Stores"
2. Click "Create vector store"
3. Name it "Fathom Agent Examples"
4. Click "Create"
5. **Copy the Vector Store ID** (starts with `vs_`)

## Step 4: Set Up Google Drive Folders

1. Go to https://drive.google.com
2. Create these folders:
   - "Fathom Proposals"
   - "Fathom Legal Research"
   - "Fathom Service Agreements"
   - "Fathom Scope of Work"
   - "Fathom Research Attachments"

3. For each folder, get the ID:
   - Open the folder
   - Look at the URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Copy the `FOLDER_ID_HERE` part

## Step 5: Configure Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
# Generate a random secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

# From Google Cloud Console (Step 2.4)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Your email (must match Google account)
GOOGLE_ALLOWED_EMAILS_CSV=your.email@example.com

# From OpenAI (Step 3)
OPENAI_API_KEY=sk-proj-...
OPENAI_VECTOR_STORE_ID=vs_...

# From Google Drive (Step 4)
PROPOSALS_DRIVE_FOLDER_ID=1a2b3c4d5e...
LEGAL_RESEARCH_DRIVE_FOLDER_ID=1f2g3h4i5j...
SERVICE_AGREEMENTS_DRIVE_FOLDER_ID=1k2l3m4n5o...
SCOPE_OF_WORK_DRIVE_FOLDER_ID=1p2q3r4s5t...
RESEARCH_ATTACHMENTS_DRIVE_FOLDER_ID=1u2v3w4x5y...

# Fathom (generate a random secret)
FATHOM_WEBHOOK_SECRET=$(openssl rand -hex 32)

# Redis (default for local)
REDIS_URL=redis://localhost:6379

# Database (default for local SQLite)
DATABASE_URL=file:./dev.db
```

## Step 6: Set Up Database

```bash
# Run migrations and seed default prompts
npm run setup
```

This will:
- Create the SQLite database
- Run all migrations
- Seed 5 default prompt templates

## Step 7: Start Redis

### macOS (Homebrew)
```bash
brew services start redis
```

### Linux
```bash
sudo systemctl start redis
```

### Docker
```bash
docker run -d -p 6379:6379 redis:alpine
```

### Verify Redis is running
```bash
redis-cli ping
# Should return: PONG
```

## Step 8: Start the Application

Open **3 terminal windows**:

### Terminal 1 - Next.js App
```bash
npm run dev
```
Wait for "Ready" message, then open http://localhost:3000

### Terminal 2 - BullMQ Worker
```bash
npm run worker
```
Should show "Starting BullMQ workers..." and "Meeting worker started"

### Terminal 3 - Prisma Studio (Optional)
```bash
npm run db:studio
```
Opens database viewer at http://localhost:5555

## Step 9: First Sign In

1. Go to http://localhost:3000
2. Click "Sign in with Google"
3. Select your Google account
4. Review permissions and click "Allow"
5. You should be redirected to the Dashboard

**If you get an access denied error:**
- Check that your email is in `GOOGLE_ALLOWED_EMAILS_CSV`
- Restart the dev server

## Step 10: Test the System

### Option A: Quick Test Run

1. In the Dashboard, find "Quick Test Run"
2. Enter a meeting title: "Test Discovery Call"
3. Paste this sample transcript:

```
John: Hi Sarah, thanks for meeting with me today. I'd like to discuss our data compliance requirements.

Sarah: Of course! What specifically are you concerned about?

John: We're launching a new SMS campaign and want to make sure we're TCPA compliant. We'll be using an autodialer system.

Sarah: That's a great concern. TCPA regulations are strict about autodialers. You'll need express written consent from recipients, and you must honor opt-out requests immediately.

John: Got it. We also need a formal proposal with pricing for your consulting services. Can you help us draft a compliance policy?

Sarah: Absolutely. I can prepare a comprehensive proposal including legal research on TCPA requirements, a service agreement, and a detailed scope of work for the compliance policy creation.

John: Perfect. What's your availability for next steps?

Sarah: I'll send you a follow-up email with all the documents by end of week.
```

4. Click "Run Test"
5. Go to **Logs** page to watch processing
6. When complete, you'll see generated documents with links

### Option B: Configure Fathom Webhook

1. Log in to Fathom
2. Go to Settings → Integrations → Webhooks
3. Add a new webhook:
   - URL: `http://localhost:3000/api/webhooks/fathom` (or use ngrok for testing)
   - Event: "New meeting content ready"
   - Secret: (copy from your `.env` FATHOM_WEBHOOK_SECRET)
4. Have a meeting in Fathom
5. Watch the webhook trigger automatically

## Step 11: Customize Prompts

1. Go to **Prompts** page
2. Click "Edit" on any prompt template
3. Modify the system or user template
4. Adjust temperature, top_p, max_tokens
5. Click "Save"
6. Run another test to see the changes

## Step 12: Upload Example Documents

1. Go to **Examples** page
2. Enter a title: "Q4 2024 Proposal Template"
3. Select document type: "Proposal"
4. Upload a PDF or DOCX file
5. Click "Upload to Vector Store"
6. The AI will now use this as a style reference

## Troubleshooting

### "Redis connection failed"
```bash
# Check if Redis is running
redis-cli ping

# If not, start it
brew services start redis  # macOS
sudo systemctl start redis # Linux
```

### "Unauthorized" error on sign in
- Check `GOOGLE_ALLOWED_EMAILS_CSV` matches your Google email exactly
- Restart dev server: `Ctrl+C` then `npm run dev`

### Worker not processing jobs
- Check Terminal 2 for errors
- Verify Redis is running
- Check BullMQ queue: `redis-cli` → `KEYS bull:meeting:*`

### Google API errors
- Verify all APIs are enabled in Cloud Console
- Check OAuth redirect URI matches exactly
- Ensure scopes are added to OAuth consent screen
- Try disconnecting and reconnecting in Settings

### No documents generated
- Check OpenAI API key is valid
- Verify Drive folder IDs are correct
- Check worker logs for errors
- Try viewing in Prisma Studio to see job status

## Next Steps

### In Production

1. **Deploy to hosting platform** (Vercel, Railway, Render)
2. **Add Postgres database** (update `DATABASE_URL`)
3. **Use Redis cloud service** (update `REDIS_URL`)
4. **Add production OAuth redirect** in Google Console
5. **Update environment variables** in hosting dashboard
6. **Configure Fathom webhook** with production URL

### Enhance the System

1. **Add more prompt templates** via Prompts page
2. **Upload your example documents** via Examples page
3. **Configure deep research** (set `OPENAI_DEEP_RESEARCH_ENABLED=true`)
4. **Add Tavily API key** for fallback web search
5. **Customize deliverable types** in classification logic

### Monitor and Maintain

1. **Check Logs page** regularly for job status
2. **Review Prisma Studio** for database insights
3. **Monitor Redis memory** usage
4. **Track OpenAI API costs** in OpenAI dashboard
5. **Backup database** regularly (Prisma migrations + data)

## Support

If you encounter issues:

1. Check this guide thoroughly
2. Review error messages in terminal
3. Check Logs page in the app
4. Verify all environment variables are set
5. Ensure Redis is running
6. Check Google/OpenAI API quotas

---

**Congratulations!** 🎉 Your Fathom Agent is now set up and ready to generate documents automatically from meeting transcripts.

