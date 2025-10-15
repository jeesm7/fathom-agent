# 💾 Data Persistence Guide

## ✅ Yes, Your Data is Saved!

Here's exactly what persists when you close and reopen the app:

---

## 🗄️ What's Saved in the Database (Permanent)

### ✅ **Prompts** - FULLY SAVED
- **Where**: SQLite database (`prisma/dev.db`)
- **Persists**: Forever, even if you restart your computer
- **When you edit prompts**: Changes saved immediately to database
- **Status**: ✅ **PERMANENT STORAGE**

### ✅ **Examples** - FULLY SAVED
- **Where**: SQLite database (`prisma/dev.db`)
- **Persists**: Forever, even if you restart your computer
- **When you upload**: Files saved to Google Drive + reference in database
- **Status**: ✅ **PERMANENT STORAGE**

### ✅ **Runs & Logs** - FULLY SAVED
- **Where**: SQLite database (`prisma/dev.db`)
- **Persists**: Complete history of all processing runs
- **Includes**: Transcripts, outputs, deliverables, timestamps
- **Status**: ✅ **PERMANENT STORAGE**

---

## 🌐 What's Saved in Browser (Temporary)

### ⚠️ **Integrations Config** - BROWSER STORAGE
- **Where**: Browser localStorage (not database)
- **Persists**: As long as you don't clear browser cache
- **Limitation**: Only in the browser where you configured it
- **Status**: ⚠️ **BROWSER-SPECIFIC**

**Why browser storage?**
- For demo/development convenience
- To let you test without committing secrets
- Easy to configure in the UI

---

## 🔒 Production-Grade Storage (Recommended)

### For Permanent Integration Storage:

**Copy values to `.env` file instead:**

```bash
# From the Integrations page, copy your values to:
cd "/Users/jessmason/Desktop/fathom agent"
nano .env

# Then add:
OPENAI_API_KEY=sk-proj-...
OPENAI_VECTOR_STORE_ID=vs_...
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
TAVILY_API_KEY=tvly-...
FATHOM_WEBHOOK_SECRET=your-secret
```

**Benefits of .env storage:**
- ✅ Persists across browser clears
- ✅ Works with any browser
- ✅ Standard production practice
- ✅ Can be version controlled (add to .gitignore for security)
- ✅ Shared across the entire app

---

## 📊 Current Storage Locations

| Data Type | Storage | Persists On Restart | Persists Browser Clear | Production Ready |
|-----------|---------|---------------------|------------------------|------------------|
| **Prompts** | SQLite Database | ✅ Yes | ✅ Yes | ✅ Yes |
| **Examples** | SQLite Database | ✅ Yes | ✅ Yes | ✅ Yes |
| **Runs/Logs** | SQLite Database | ✅ Yes | ✅ Yes | ✅ Yes |
| **Integrations** | localStorage | ✅ Yes | ❌ No | ⚠️ Use .env |

---

## 🔄 How to Migrate Integrations to .env

### Step 1: Get Your Current Values
1. Go to http://localhost:3000/integrations
2. Scroll down to "Environment Variables" section
3. Copy the entire code block

### Step 2: Save to .env File
```bash
cd "/Users/jessmason/Desktop/fathom agent"
nano .env  # or use your favorite editor

# Paste the values, then save:
# Ctrl+O, Enter, Ctrl+X (in nano)
```

### Step 3: Restart the App
```bash
# Stop the server (Ctrl+C)
npm run dev
```

Now your integrations are **permanently saved** and will work in any browser! 🎉

---

## 🧹 What Happens When You Clear Browser Data?

### If You Clear Browser Cache/Data:
- ❌ **Integrations**: Lost (use .env instead!)
- ✅ **Prompts**: Safe (in database)
- ✅ **Examples**: Safe (in database)
- ✅ **Runs**: Safe (in database)

### If You Restart Computer:
- ✅ **Everything persists!** (if using .env for integrations)

### If You Delete the Project Folder:
- ❌ **Everything lost** (including database)
- 💡 **Backup**: `prisma/dev.db` is your database file

---

## 💡 Best Practices

### For Development (Current Setup):
1. ✅ Use Integrations page for quick testing
2. ✅ Prompts & Examples auto-saved to database
3. ✅ View logs anytime in Logs page

### For Production:
1. ✅ Move all integrations to `.env` file
2. ✅ Backup `prisma/dev.db` regularly
3. ✅ Use PostgreSQL for production (update DATABASE_URL)
4. ✅ Set up automated backups

---

## 📁 Database File Location

Your SQLite database:
```
/Users/jessmason/Desktop/fathom agent/prisma/dev.db
```

**This file contains ALL your:**
- Prompts (current: seeded defaults + your edits)
- Examples (uploaded documents metadata)
- Runs (processing history)
- Outputs (generated documents)

**To backup:** Just copy this file!
```bash
cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db
```

---

## 🎯 Summary

**RIGHT NOW:**
- ✅ Prompts: **Saved in database** (permanent)
- ✅ Examples: **Saved in database** (permanent)  
- ✅ Runs/Logs: **Saved in database** (permanent)
- ⚠️ Integrations: **Browser storage** (temporary)

**RECOMMENDED:**
Move integrations to `.env` file for **100% permanent storage across all browsers!**

**You're all set!** Your data is safe! 🎉

