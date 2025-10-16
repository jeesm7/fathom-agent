# 🚀 Railway Environment Variables Setup

## Required Environment Variables for Railway

Copy these into Railway's environment variables section:

### **1. Database (Auto-configured by Railway)**
```
DATABASE_URL=(Railway will auto-populate this)
REDIS_URL=(Railway will auto-populate this)
```

### **2. Required API Keys**
```
# OpenAI (Required)
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_VECTOR_STORE_ID=vs_your-vector-store-id

# Google OAuth (Required for Docs/Gmail)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here

# NextAuth (Generate new secret)
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-app.railway.app

# Fathom Webhook (Optional but recommended)
FATHOM_WEBHOOK_SECRET=your-webhook-secret

# Tavily Search (Optional fallback)
TAVILY_API_KEY=tvly-your-key

# Google Drive Folder IDs (Optional)
PROPOSALS_DRIVE_FOLDER_ID=your-folder-id
LEGAL_RESEARCH_DRIVE_FOLDER_ID=your-folder-id
SERVICE_AGREEMENTS_DRIVE_FOLDER_ID=your-folder-id
SCOPE_OF_WORK_DRIVE_FOLDER_ID=your-folder-id
RESEARCH_ATTACHMENTS_DRIVE_FOLDER_ID=your-folder-id
```

## 📋 Next Steps

1. ✅ Code deployed to Railway
2. ⏳ Set environment variables (in Railway dashboard)
3. ⏳ Get your production URL
4. ⏳ Test the webhook endpoint
5. ⏳ Configure Fathom webhook

## 🔧 How to Add Environment Variables in Railway

1. **In Railway dashboard** → Click your service
2. **Click "Variables" tab**
3. **Add each variable** one by one
4. **Click "Deploy"** to restart with new variables

Your webhook will be: `https://your-app.railway.app/api/webhooks/fathom`
