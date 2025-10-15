# Google OAuth Setup Guide

Follow these steps to enable Google login and Google Workspace integrations.

## Step 1: Google Cloud Console Setup

### 1.1 Create a Project
1. Go to https://console.cloud.google.com
2. Click "Create Project" or select an existing one
3. Name it "Fathom Agent" (or your choice)

### 1.2 Enable Required APIs
1. Go to "APIs & Services" → "Library"
2. Search and enable these APIs:
   - **Gmail API**
   - **Google Docs API**  
   - **Google Drive API**

### 1.3 Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (or "Internal" if you have Google Workspace)
3. Fill in:
   - App name: "Fathom Agent"
   - User support email: your email
   - Developer contact: your email
4. Click "Save and Continue"

5. **Add Scopes:**
   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `openid`
     - `email`
     - `profile`
     - `.../auth/gmail.compose`
     - `.../auth/gmail.modify`
     - `.../auth/documents`
     - `.../auth/drive.file`
   - Click "Update" and "Save and Continue"

6. **Add Test Users** (for External apps):
   - Add your email as a test user
   - Click "Save and Continue"

### 1.4 Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Name: "Fathom Agent Web Client"
5. **Authorized redirect URIs:**
   - Add: `http://localhost:3000/api/auth/callback/google`
   - For production, add: `https://your-domain.com/api/auth/callback/google`
6. Click "Create"
7. **Copy the Client ID and Client Secret** - you'll need these!

## Step 2: Update Environment Variables

Add these to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret-here

# Required for NextAuth
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

# Optional: Restrict access to specific emails
GOOGLE_ALLOWED_EMAILS_CSV=your.email@example.com
```

## Step 3: Create Google Drive Folders

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
   - Copy the folder ID

4. Add to `.env`:
```env
PROPOSALS_DRIVE_FOLDER_ID=your-folder-id
LEGAL_RESEARCH_DRIVE_FOLDER_ID=your-folder-id
SERVICE_AGREEMENTS_DRIVE_FOLDER_ID=your-folder-id
SCOPE_OF_WORK_DRIVE_FOLDER_ID=your-folder-id
RESEARCH_ATTACHMENTS_DRIVE_FOLDER_ID=your-folder-id
```

## Step 4: Restart the App

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 5: Test Google Login

1. Go to http://localhost:3000/integrations
2. You should see Google Workspace status as "Connected"
3. Upload an example document to test Drive integration

## Troubleshooting

### "Error 403: access_denied"
- Make sure you added your email as a test user in OAuth consent screen
- Check that all required scopes are added

### "Redirect URI mismatch"
- Verify the redirect URI in Google Console exactly matches: `http://localhost:3000/api/auth/callback/google`
- No trailing slashes!

### "Missing permissions"
- Double-check all APIs are enabled (Gmail, Docs, Drive)
- Make sure all scopes are added to OAuth consent screen

## What This Enables

Once configured, you'll be able to:
- ✅ Sign in with Google
- ✅ Create Google Docs for proposals and research
- ✅ Store documents in organized Drive folders
- ✅ Create Gmail drafts with follow-up emails
- ✅ Upload example documents to Drive and vector store

---

**Note:** The app works WITHOUT Google OAuth - you just won't have document generation or Gmail features until configured.

