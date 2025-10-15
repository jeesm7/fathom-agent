# Testing the Fathom Agent

Complete guide to testing your Fathom Agent installation.

## Prerequisites for Testing

- Application is running (see QUICKSTART.md)
- Redis is running
- Worker is running
- You're signed in at http://localhost:3000

## Test 1: Quick Test Run (No External APIs)

This test requires only OpenAI to be configured.

### Steps:

1. Go to **Dashboard**
2. In "Quick Test Run" section:
   - **Meeting Title**: "Legal Compliance Discovery"
   - **Transcript**: Paste this:

```
John: Hi Sarah, thanks for meeting today. We're launching a new SMS marketing campaign.

Sarah: Great! Tell me about your approach.

John: We'll be using an autodialer to reach potential customers. We have about 50,000 contacts.

Sarah: That raises TCPA compliance concerns. Are you familiar with the Telephone Consumer Protection Act?

John: Not really. What do we need to know?

Sarah: TCPA requires express written consent before you can use an autodialer. There are specific rules about opt-out mechanisms and calling times.

John: This sounds complex. Can you research the requirements and send us a proposal for compliance consulting?

Sarah: Absolutely. I'll prepare comprehensive legal research on TCPA requirements, draft a service agreement, create a detailed scope of work, and send you a follow-up email with everything.

John: Perfect. What's the timeline?

Sarah: I can have the proposal ready by Friday, and we can start implementation the following week.
```

3. Click **"Run Test"**

### Expected Results:

1. **Immediate**: Success message with Run ID
2. **Within 5-30 seconds**:
   - Go to Logs page
   - See the run appear with "processing" status
   - Watch it change to "completed"
   - See deliverables: PROPOSAL, LEGAL_RESEARCH, FOLLOWUP_EMAIL (possibly SERVICE_AGREEMENT, SCOPE_OF_WORK)

### Verify:

- Check that deliverables were classified correctly
- Note: Documents won't be created if Google Drive folder IDs aren't set
- Check worker terminal for detailed logs

## Test 2: With Google APIs Configured

Requires Google OAuth connected and Drive folder IDs set.

### Prerequisites:

1. Go to **Settings** page
2. Verify these are set:
   - All 5 Google Drive Folder IDs
   - Gmail settings

### Run the Same Test:

Follow Test 1 steps above.

### Expected Results:

Within 30-60 seconds, you should see:

1. **In Logs page**: 
   - Run shows "completed"
   - Multiple outputs with "View" links

2. **In Google Drive**:
   - Check your Proposals folder → New Google Doc created
   - Check Legal Research folder → New Google Doc with disclaimer
   - (Others depending on classification)

3. **In Gmail**:
   - Go to Gmail
   - Open "Drafts"
   - See a new draft with subject like "Follow-up: Legal Compliance Discovery"
   - Draft includes links to generated documents

### Verify Document Content:

Open each Google Doc and verify:
- **Proposal**: Has sections for scope, pricing, timeline
- **Legal Research**: Has TCPA information, citations, disclaimer
- **Service Agreement**: Has contract sections (if generated)
- **Scope of Work**: Has deliverables and timeline (if generated)

## Test 3: Prompts Customization

### Steps:

1. Go to **Prompts** page
2. Click **Edit** on "Proposal" template
3. Change the system prompt to:
   ```
   You are a creative proposal writer. Use engaging language and include emojis where appropriate.
   ```
4. Click **Save**
5. Run Test 1 again with a new transcript
6. Compare the new proposal style to the previous one

### Expected Result:

The new proposal should have a more creative, emoji-filled tone.

## Test 4: Vector Store Examples

### Prerequisites:

- OpenAI Vector Store ID configured in Settings
- Have a sample proposal PDF or DOCX

### Steps:

1. Go to **Examples** page
2. Fill in:
   - **Title**: "Standard Proposal Template"
   - **Type**: "Proposal"
   - **File**: Upload your sample proposal
3. Click **Upload to Vector Store**

### Expected Result:

- Success message
- File appears in "Uploaded Examples" section
- File is stored in Research Attachments Drive folder

### Test the Effect:

1. Run Test 1 again
2. The generated proposal should now match the style of your uploaded example

## Test 5: Fathom Webhook (Local Testing)

### Prerequisites:

- Install ngrok: `brew install ngrok` (macOS)
- Have a Fathom account

### Steps:

1. **Start ngrok**:
   ```bash
   ngrok http 3000
   ```

2. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

3. **Configure Fathom Webhook**:
   - Go to Fathom settings
   - Add webhook URL: `https://abc123.ngrok.io/api/webhooks/fathom`
   - Set secret from your `.env` FATHOM_WEBHOOK_SECRET
   - Event: "New meeting content ready"

4. **Have a test meeting** in Fathom

5. **Wait for processing**:
   - Webhook should trigger when meeting ends
   - Check Logs page for new run
   - Documents should be generated

### Expected Result:

Automatic processing triggered by real Fathom meeting.

## Test 6: Classification Logic

Test that different transcripts trigger different deliverables.

### Test Cases:

**Case 1: Pure Legal** (Should trigger LEGAL_RESEARCH)
```
Lawyer: We need to understand TCPA compliance for our robocall system.
Client: What are the regulations?
Lawyer: I'll research the statutes and case law.
```

**Case 2: Pure Proposal** (Should trigger PROPOSAL)
```
Client: We need a proposal for website redesign.
Consultant: I'll send pricing and timeline.
```

**Case 3: Contract Only** (Should trigger SERVICE_AGREEMENT)
```
Client: Let's formalize our agreement.
Consultant: I'll draft the service contract.
```

**Case 4: Kitchen Sink** (Should trigger multiple)
```
Client: We need legal research, a proposal, a contract, and project scope.
Consultant: I'll prepare all of those.
```

### Verify:

Check Logs page → Expand each run → See correct deliverables list

## Test 7: Error Handling

### Test Invalid OpenAI Key:

1. Go to Settings
2. Change OpenAI API Key to "sk-invalid"
3. Run a test
4. Expected: Job fails gracefully, error in Logs

### Test Missing Drive Folder:

1. Settings → Set Proposals Folder ID to "invalid-id"
2. Run a test
3. Expected: Proposal generation fails, other deliverables succeed

### Test Redis Down:

1. Stop Redis: `brew services stop redis`
2. Try to run a test
3. Expected: Immediate error message
4. Restart: `brew services start redis`

## Test 8: Performance & Load

### Single Job:

- Typical processing time: 10-60 seconds
- Depends on:
  - OpenAI API latency
  - Number of deliverables
  - Google API response time

### Multiple Jobs:

1. Queue 5 test runs quickly
2. Watch worker process them sequentially
3. Check Redis for queue status:
   ```bash
   redis-cli
   KEYS bull:meeting:*
   ```

### Expected Behavior:

- Jobs process in order (FIFO)
- Worker concurrency: 5 (configurable)
- Failed jobs retry 3 times with exponential backoff

## Running Automated Tests

### Unit Tests (Vitest):

```bash
npm run test
```

**Expected Output:**
```
✓ tests/webhook.test.ts (3 tests)
✓ tests/gmail.test.ts (2 tests)

Test Files  2 passed (2)
Tests  5 passed (5)
```

### E2E Tests (Playwright):

```bash
npm run test:e2e
```

**Expected Output:**
```
Running 3 tests using 1 worker

✓ prompts.spec.ts:5:5 › should display prompts page title
✓ prompts.spec.ts:10:5 › should allow editing a prompt
✓ prompts.spec.ts:25:5 › should have temperature controls

3 passed (3s)
```

### Interactive Test UI:

```bash
npm run test:ui
```

Opens browser at http://localhost:51204 with visual test runner.

## Troubleshooting Tests

### Test Fails: "Redis connection failed"

```bash
# Check Redis
redis-cli ping

# Start if needed
brew services start redis
```

### Test Fails: "Unauthorized"

- Sign in at http://localhost:3000 first
- Check GOOGLE_ALLOWED_EMAILS_CSV in .env

### Test Fails: "OpenAI API error"

- Verify API key is valid
- Check OpenAI account has credits
- Try with lower rate limit

### No Documents Created

- Check all Google Drive folder IDs are correct
- Verify Google OAuth scopes include drive.file
- Check worker terminal for specific errors

### Slow Processing

- OpenAI API can be slow during peak times
- Web research adds 5-15 seconds
- Deep research can take 30-60 seconds

## Success Checklist

After testing, you should have:

- [ ] Successfully run a test transcript
- [ ] Seen jobs appear in Logs with "completed" status
- [ ] Received Google Docs in Drive folders
- [ ] Found Gmail draft in Drafts folder
- [ ] Edited a prompt and seen the change
- [ ] Uploaded an example document
- [ ] Verified webhook signature (if using Fathom)
- [ ] Passed unit tests
- [ ] Passed E2E tests

## Next Steps

Once all tests pass:

1. Configure for production (see README.md)
2. Set up monitoring and alerts
3. Deploy to hosting platform
4. Configure production Fathom webhook
5. Add your team's example documents
6. Customize prompts for your use case

---

For issues during testing, check SETUP_GUIDE.md troubleshooting section.

