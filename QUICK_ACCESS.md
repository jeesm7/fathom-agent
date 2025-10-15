# 🚀 Quick Access Guide

## Easy Ways to Open the App

### 1. **Simplest Method** (New!)
```bash
npm run open
```
This will open http://localhost:3000 in your default browser.

### 2. **Command Line**
```bash
open http://localhost:3000
```

### 3. **Direct Browser**
Just visit: http://localhost:3000

---

## 📱 Main Pages

| Page | URL | Purpose |
|------|-----|---------|
| **Dashboard** | http://localhost:3000/dashboard | Main hub, run tests, view stats |
| **Integrations** | http://localhost:3000/integrations | Configure APIs (OpenAI, Google, Fathom, Tavily) |
| **Prompts** | http://localhost:3000/prompts | Edit AI prompt templates |
| **Examples** | http://localhost:3000/examples | Upload example documents |
| **Logs** | http://localhost:3000/logs | View processing history & timelines |

---

## 🛠️ Full Workflow

### Start Everything
```bash
# Terminal 1: Web app
npm run dev

# Terminal 2: Background workers (optional, for processing jobs)
npm run worker
```

### Open the App
```bash
# In Terminal 3, or just:
npm run open
```

### For Production
```bash
npm run build
npm start
npm run open  # Opens production build
```

---

## 💡 Pro Tips

### Bookmark These
- Dashboard: http://localhost:3000/dashboard
- Integrations: http://localhost:3000/integrations

### Keyboard Shortcut
1. Open your browser
2. Press `Cmd+L` (focus address bar)
3. Type: `localhost:3000`
4. Press Enter

### Custom Alias (Optional)
Add to your `~/.zshrc`:
```bash
alias fathom-open="open http://localhost:3000/dashboard"
```

Then just run:
```bash
fathom-open
```

---

## 🎯 Quick Commands Reference

| Command | Action |
|---------|--------|
| `npm run dev` | Start development server |
| `npm run open` | Open app in browser |
| `npm run worker` | Start background job workers |
| `npm run db:studio` | Open Prisma database UI |
| `npm test` | Run tests |

That's it! Your app is just one command away! 🚀

