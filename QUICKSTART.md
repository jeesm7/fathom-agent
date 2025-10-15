# Quick Start Guide

Get up and running with Fathom Agent in 10 minutes.

## Prerequisites

- Node.js 20+ installed
- Redis running locally (`brew install redis` on macOS)
- Google account
- OpenAI API key

## 1. Install & Configure

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate NextAuth secret
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env

# Edit .env and add at minimum:
# - GOOGLE_CLIENT_ID (from Google Cloud Console)
# - GOOGLE_CLIENT_SECRET (from Google Cloud Console)
# - GOOGLE_ALLOWED_EMAILS_CSV (your email)
# - OPENAI_API_KEY (from OpenAI)
```

## 2. Set Up Database

```bash
npm run setup
```

This creates the database and seeds default prompts.

## 3. Start Services

**Terminal 1 - Start Redis:**
```bash
redis-server
```

**Terminal 2 - Start Next.js:**
```bash
npm run dev
```

**Terminal 3 - Start Worker:**
```bash
npm run worker
```

## 4. Test It Out

1. Open http://localhost:3000
2. Sign in with Google
3. Go to Dashboard
4. Paste this test transcript:

```
John: We need a proposal for our new project.
Sarah: I can help with that. What's the scope?
John: We need a mobile app with user authentication.
Sarah: I'll draft a proposal with timeline and pricing.
```

5. Click "Run Test"
6. Check the Logs page to see processing
7. View generated documents when complete

## 5. Configure Settings

Go to Settings page and add:

- **OpenAI Vector Store ID**: Create one at https://platform.openai.com
- **Google Drive Folder IDs**: Create folders in Drive and get IDs from URLs
- **Other API keys**: Fathom webhook secret, Tavily (optional)

## Next Steps

- Read [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup
- Read [README.md](README.md) for full documentation
- Customize prompts in the Prompts page
- Upload example documents in the Examples page
- Configure Fathom webhook for production use

## Troubleshooting

**Redis error?**
```bash
brew services start redis  # macOS
redis-cli ping            # Should return PONG
```

**Auth error?**
- Your email must be in `GOOGLE_ALLOWED_EMAILS_CSV`
- Restart dev server after .env changes

**No documents generated?**
- Check worker terminal for errors
- Verify OpenAI API key is valid
- Ensure Drive folder IDs are set (or leave empty for root)

---

Need help? Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for step-by-step instructions.

