# Fathom Agent - AI Document Generator

A production-grade TypeScript application that listens for Fathom AI call-finished webhooks, classifies transcripts, performs web research, and automatically generates proposals, legal research, service agreements, scope of work documents, and follow-up email drafts using OpenAI and Google APIs.

## 🚀 Features

- **Automated Document Generation**: Creates multiple document types from meeting transcripts
- **AI-Powered Classification**: Intelligently determines what deliverables to generate
- **Web Research Integration**: Uses OpenAI Responses API with web_search or Tavily fallback
- **Vector Store Learning**: Learns from your example documents to match your style
- **Google Workspace Integration**: Creates Docs, stores in Drive, drafts Gmail emails
- **Futuristic Admin UI**: Beautiful dark theme with glassmorphic design
- **Production-Ready**: BullMQ job queue, Prisma ORM, NextAuth security

## 📋 Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + TailwindCSS + shadcn/ui + Framer Motion
- **Backend**: Next.js API routes + Node 20
- **Auth**: NextAuth v5 with Google OAuth
- **Queue**: BullMQ with Redis
- **Database**: Prisma (SQLite dev, Postgres prod)
- **AI**: OpenAI API with Responses, web_search, file_search
- **Google**: Gmail, Docs, Drive APIs
- **Testing**: Vitest + Playwright

## 🛠️ Setup

### Prerequisites

- Node.js 20+
- Redis server running
- Google Cloud Platform project with OAuth configured
- OpenAI API account
- Fathom account (optional, for webhook testing)

### 1. Clone and Install

```bash
cd "fathom agent"
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required Variables:**

```env
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-here

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_ALLOWED_EMAILS_CSV=your.email@example.com

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_VECTOR_STORE_ID=vs_...  # Create in OpenAI dashboard

# Fathom
FATHOM_WEBHOOK_SECRET=your-webhook-secret

# Google Drive Folder IDs (create folders in Drive, get IDs from URL)
PROPOSALS_DRIVE_FOLDER_ID=1a2b3c...
LEGAL_RESEARCH_DRIVE_FOLDER_ID=1a2b3c...
SERVICE_AGREEMENTS_DRIVE_FOLDER_ID=1a2b3c...
SCOPE_OF_WORK_DRIVE_FOLDER_ID=1a2b3c...
RESEARCH_ATTACHMENTS_DRIVE_FOLDER_ID=1a2b3c...

# Redis (local or cloud)
REDIS_URL=redis://localhost:6379
```

### 3. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable APIs:
   - Gmail API
   - Google Docs API
   - Google Drive API
4. Configure OAuth consent screen:
   - User type: Internal or External
   - Add scopes:
     - `openid`
     - `email`
     - `profile`
     - `https://www.googleapis.com/auth/gmail.compose`
     - `https://www.googleapis.com/auth/gmail.modify`
     - `https://www.googleapis.com/auth/documents`
     - `https://www.googleapis.com/auth/drive.file`
5. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID and Client Secret to `.env`

### 4. OpenAI Vector Store Setup

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Navigate to Vector Stores
3. Create a new vector store
4. Copy the Vector Store ID (starts with `vs_`) to `.env`

### 5. Database Setup

```bash
# Run migrations and seed default prompts
npm run setup
```

This creates the SQLite database and seeds default prompt templates.

### 6. Start Redis

Make sure Redis is running:

```bash
# macOS with Homebrew
brew services start redis

# Or run manually
redis-server
```

### 7. Start the Application

**Terminal 1 - Next.js App:**
```bash
npm run dev
```

**Terminal 2 - BullMQ Worker:**
```bash
npm run worker
```

**Terminal 3 - Prisma Studio (optional):**
```bash
npm run db:studio
```

Visit http://localhost:3000 and sign in with your Google account.

## 📖 Usage

### Method 1: Test Run (Manual)

1. Navigate to Dashboard
2. Paste a meeting transcript in the "Quick Test Run" box
3. Click "Run Test"
4. Watch the Logs page for real-time processing
5. Generated documents will appear with links

### Method 2: Fathom Webhook (Production)

1. Configure your Fathom webhook to point to:
   ```
   https://your-domain.com/api/webhooks/fathom
   ```

2. Set the webhook secret in Fathom settings and in your `.env`

3. When a meeting ends in Fathom, the webhook will trigger automatically

### Settings Page

Configure all your API keys and settings directly in the UI:

- **OpenAI Configuration**: API key, models, vector store
- **Google Drive Folders**: Specify where documents are created
- **Gmail & Fathom**: Email settings and webhook secrets
- **Additional Services**: Tavily, Redis, allowed users

All settings are stored in browser localStorage for demo purposes. In production, use environment variables.

### Prompts Page

Customize AI generation prompts for each deliverable type:

- Edit system prompts and user templates
- Adjust temperature, top_p, max_tokens
- Use variables like `{{transcript}}`, `{{examples}}`, `{{research}}`
- Test prompts with sample transcripts

### Examples Page

Upload example documents to guide AI generation:

- Upload PDFs, DOCX files
- Classify as proposal, agreement, SOW, etc.
- Files are indexed in OpenAI Vector Store
- AI matches your style and tone automatically

## 🔍 How It Works

### Processing Pipeline

1. **Webhook Received** → Verify HMAC signature
2. **Create Run** → Store in database with transcript
3. **Enqueue Job** → Add to BullMQ queue
4. **Classify Deliverables** → AI determines what to generate
5. **Gather Context** → Search vector store for examples
6. **Perform Research** → Web search for legal/technical questions
7. **Generate Documents** → Create Google Docs in specified folders
8. **Create Email Draft** → Draft follow-up in Gmail
9. **Finalize** → Save outputs with share links

### Deliverable Types

- **PROPOSAL**: Business proposals with pricing and scope
- **LEGAL_RESEARCH**: Legal analysis with citations and disclaimers
- **SERVICE_AGREEMENT**: Contract with terms and conditions
- **SCOPE_OF_WORK**: Detailed SOW with deliverables and timeline
- **FOLLOWUP_EMAIL**: Gmail draft with summary and next steps

### AI Classification

The system uses lightweight heuristics + LLM classification:

- Analyzes transcript for intent and topics
- Checks for legal keywords (TCPA, compliance, regulation, etc.)
- Confidence threshold of 0.55 (configurable)
- Allows multiple deliverables per meeting

## 🧪 Testing

### Unit Tests (Vitest)

```bash
npm run test
```

Tests cover:
- Webhook signature verification
- Transcript parsing
- Gmail MIME encoding
- Base64 URL encoding

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

Smoke tests for:
- Prompts page rendering
- Editing functionality
- Settings persistence

### Interactive Test UI

```bash
npm run test:ui
```

## 📁 Project Structure

```
fathom-agent/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # NextAuth
│   │   ├── webhooks/     # Fathom webhook
│   │   ├── prompts/      # Prompt CRUD
│   │   ├── files/        # File upload
│   │   ├── test/         # Test runner
│   │   └── runs/         # Run history
│   ├── dashboard/        # Main dashboard
│   ├── prompts/          # Prompt editor
│   ├── examples/         # Example upload
│   ├── settings/         # Configuration
│   ├── logs/             # Activity logs
│   └── auth/             # Auth pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── navigation.tsx    # Nav sidebar
├── lib/                   # Utilities
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # Prisma client
│   ├── utils.ts          # Helpers
│   ├── google/           # Google API helpers
│   ├── openai/           # OpenAI helpers
│   ├── queue/            # BullMQ setup
│   └── fathom/           # Webhook utils
├── workers/              # BullMQ workers
│   ├── index.ts          # Worker entry
│   ├── meeting-worker.ts # Main processor
│   └── jobs/             # Job handlers
├── prisma/               # Database
│   ├── schema.prisma     # Schema
│   ├── seed.ts           # Default prompts
│   └── migrations/       # Migrations
├── tests/                # Tests
│   ├── webhook.test.ts   # Unit tests
│   ├── gmail.test.ts     # Unit tests
│   └── prompts.spec.ts   # E2E tests
└── types/                # TypeScript types
```

## 🚀 Deployment

### Railway / Render / Vercel

1. Set environment variables in platform dashboard
2. Add Postgres database addon
3. Update `DATABASE_URL` to Postgres connection string
4. Deploy main branch
5. Run migrations: `npm run db:migrate`
6. Run seed: `npm run db:seed`

### Worker Deployment

Deploy the worker separately or use a process manager:

```bash
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npx prisma generate
CMD ["npm", "run", "worker"]
```

### Environment Variables (Production)

Update these for production:

- `NEXTAUTH_URL=https://your-domain.com`
- `NEXTAUTH_SECRET=<strong-secret>`
- `DATABASE_URL=postgresql://...`
- `REDIS_URL=redis://your-redis-host:6379`
- Set all Google folder IDs
- Configure webhook URL in Fathom

## 🔐 Security

- **Webhook Verification**: Timing-safe HMAC comparison
- **Authentication**: Email allowlist with NextAuth
- **Secrets**: Never logged or exposed in UI
- **Rate Limiting**: Built into API routes
- **Token Refresh**: Automatic OAuth token renewal
- **Idempotency**: Duplicate webhook protection via Run.meetingId

## 📝 API Reference

### POST /api/webhooks/fathom

Fathom webhook endpoint.

**Headers:**
- `X-Fathom-Signature`: HMAC-SHA256 signature

**Body:**
```json
{
  "meeting": {
    "id": "abc123",
    "call_url": "https://...",
    "started_at": "2024-01-01T10:00:00Z",
    "ended_at": "2024-01-01T11:00:00Z"
  },
  "transcript": [...],
  "calendar_invitees": [...]
}
```

**Response:**
```json
{
  "success": true,
  "runId": "run_123"
}
```

### POST /api/test/run

Manual test run.

**Body:**
```json
{
  "transcript": "Meeting transcript here...",
  "meetingTitle": "Client Discovery Call"
}
```

### GET /api/prompts

List all prompt templates.

### PUT /api/prompts/:id

Update prompt template.

### POST /api/files/upload

Upload example document to vector store.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Redis Connection Error

```bash
# Make sure Redis is running
redis-cli ping
# Should return: PONG
```

### Google OAuth Errors

- Verify redirect URI matches exactly in Google Console
- Check that all required scopes are enabled
- Ensure email is in `GOOGLE_ALLOWED_EMAILS_CSV`

### Worker Not Processing Jobs

- Check Redis connection
- Verify worker is running: `npm run worker`
- Check logs for errors
- Inspect queue in Redis: `redis-cli` → `KEYS bull:meeting:*`

### Vector Store Not Working

- Verify `OPENAI_VECTOR_STORE_ID` is set
- Check that files were uploaded successfully
- Ensure vector store exists in OpenAI dashboard

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review logs in the Logs page
3. Check Prisma Studio for database state
4. Inspect BullMQ jobs in Redis

---

Built with ❤️ using Next.js, OpenAI, and Google APIs
