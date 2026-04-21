# Data Migration Guide

Skales makes it easy to import conversations, memories, and settings from other AI tools. This guide covers all supported migration sources and the migration process.

---

## Overview

**What Gets Imported**:
- Conversation histories and threads
- Memories and extracted facts
- System prompts and personas
- API keys (automatically mapped to Skales providers)
- Custom skills and tools

**What Doesn't Get Imported**:
- Images and attachments (may be supported in future versions)
- Voice recordings and audio files
- Real-time data or live sessions

**Data Storage**:
- Imported conversations: `~/.skales-data/imported/`
- Memories: `~/.skales-data/memories/`
- Skills and configurations: `~/.skales-data/agent-skills/`

**Safe Migration**: Source files are never deleted during migration. You can safely reimport multiple times.

---

## 1. ChatGPT

**Overview**: Import conversations from OpenAI's ChatGPT.

**Step 1: Export from ChatGPT**:
1. Log in to [chat.openai.com](https://chat.openai.com)
2. Click your profile (bottom left) → **Settings**
3. Go to **Data Controls** → **Export Data**
4. Request your data export (typically takes 24-48 hours)
5. You'll receive an email with a download link
6. Download and unzip the exported file (contains `conversations.json`)

**Step 2: Import into Skales**:
1. In Skales: **Settings → Data → Migrate**
2. Click **Import**
3. Select "ChatGPT" from the provider dropdown
4. Upload your `conversations.json` file
5. Click **Import** to begin the migration

**What Gets Imported**:
- All conversations and messages
- Conversation titles and metadata
- Timestamps
- Model information (GPT-4, GPT-3.5, etc.)

**Mapped Data**:
- ChatGPT conversations → Skales conversation history
- OpenAI API key (if present) → Skales OpenAI provider (if you add your key)

**Note**: Your API key is not included in the export. You'll need to add it separately in **Settings → Providers → OpenAI** if you want to continue using GPT models.

---

## 2. Claude

**Overview**: Import conversations from Anthropic's Claude.

**Step 1: Export from Claude**:
1. Log in to [claude.ai](https://claude.ai)
2. Click your profile (top right) → **Settings**
3. Go to **Data & Privacy** → **Export Conversations**
4. Select the conversations you want to export
5. Download the exported JSON file

**Step 2: Import into Skales**:
1. In Skales: **Settings → Data → Migrate**
2. Click **Import**
3. Select "Claude" from the provider dropdown
4. Upload your conversation JSON file
5. Click **Import** to begin the migration

**What Gets Imported**:
- Conversation threads and messages
- Assistant responses and tool usage
- File references and artifacts
- Metadata and timestamps

**Mapped Data**:
- Claude conversations → Skales conversation history
- Tool calls and results → Skales activity log

**API Key**: Your Anthropic API key is not included in exports. Add it in **Settings → Providers → Anthropic** to continue using Claude models.

---

## 3. Microsoft Copilot

**Overview**: Import conversations from Microsoft's Copilot.

**Step 1: Export from Microsoft Copilot**:
1. Log in to your Microsoft account where you use Copilot
2. Go to **Settings** → **Privacy & Data**
3. Select **Download Your Data**
4. Choose conversations to include
5. Submit the request and wait for the email
6. Download and extract the provided file

**Step 2: Import into Skales**:
1. In Skales: **Settings → Data → Migrate**
2. Click **Import**
3. Select "Microsoft Copilot" from the provider dropdown
4. Upload the conversation JSON file
5. Click **Import**

**What Gets Imported**:
- Copilot conversations and messages
- Response metadata
- Web search results referenced
- Code snippets and artifacts

**Note**: Copilot integration credentials are not migrated. Configure your preferred provider separately.

---

## 4. Google Gemini

**Overview**: Import conversations from Google's Gemini.

**Step 1: Export from Google Gemini**:
1. Log in to [gemini.google.com](https://gemini.google.com)
2. Click your profile (top right) → **Settings**
3. Go to **Data & Privacy**
4. Select **Export Conversations**
5. Download your conversation data (Google Takeout format or direct download)
6. Extract the provided JSON file

**Step 2: Import into Skales**:
1. In Skales: **Settings → Data → Migrate**
2. Click **Import**
3. Select "Google Gemini" from the provider dropdown
4. Upload the conversation JSON file
5. Click **Import**

**What Gets Imported**:
- Gemini conversations and messages
- Images and multimodal content references
- Response metadata
- Model version information

**Mapped Data**:
- Gemini conversations → Skales conversation history
- Google API key (if present) → Skales Google AI provider

---

## 5. Hermes

**Overview**: Migrate from the Hermes AI framework using CLI.

**Step 1: Prepare Hermes Config**:
Hermes stores data in `~/.hermes/` with the following structure:
```
~/.hermes/
├── config.json          # API keys and provider config
├── memories/            # Extracted facts and preferences
├── skills/              # Custom skills and tools
└── conversations/       # Chat history
```

**Step 2: Run Migration**:
1. Open terminal in your Skales directory
2. Run: `node skales.js migrate --from hermes`
3. This reads from `~/.hermes/` automatically
4. Migrated data is saved to `~/.skales-data/`

**Preview Migration**:
Before committing, preview what will be imported:
```bash
node skales.js migrate --from hermes --dry-run
```

**What Gets Imported**:
- API keys from `config.json` → Mapped to Skales providers
- Memories from `~/.hermes/memories/` → `~/.skales-data/memories/`
- Skills from `~/.hermes/skills/` → `~/.skales-data/agent-skills/`
- Conversations → `~/.skales-data/imported/hermes/`

**API Key Mapping**:
- Hermes OpenAI key → Skales OpenAI provider
- Hermes Anthropic key → Skales Anthropic provider
- Other provider keys → Automatically mapped where possible

**Note**: Original Hermes data is never deleted. You can safely run migration multiple times.

---

## 6. OpenClaw

**Overview**: Migrate from OpenClaw using CLI.

**Step 1: Prepare OpenClaw Config**:
OpenClaw stores data in `~/.openclaw/` with the following structure:
```
~/.openclaw/
├── SOUL.md              # System prompt and persona
├── MEMORY.md            # Memories and facts
├── config.json          # Settings and API keys
├── skills/              # Custom skills
└── conversations/       # Chat history
```

**Step 2: Run Migration**:
1. Open terminal in your Skales directory
2. Run: `node skales.js migrate --from openclaw`
3. This reads from `~/.openclaw/` automatically
4. Migrated data is saved to `~/.skales-data/`

**Preview Migration**:
Before committing, preview what will be imported:
```bash
node skales.js migrate --from openclaw --dry-run
```

**What Gets Imported**:
- `SOUL.md` (system prompt) → Skales system prompt
- `MEMORY.md` → `~/.skales-data/memories/personality.md`
- API keys from `config.json` → Mapped to Skales providers
- Skills from `~/.openclaw/skills/` → `~/.skales-data/agent-skills/`
- Conversations → `~/.skales-data/imported/openclaw/`

**Persona Handling**:
Your OpenClaw persona (SOUL.md) becomes your Skales system prompt. You can edit it afterward in **Settings → System Prompt**.

**Note**: OpenClaw data directory remains unchanged. Safe for multiple migrations.

---

## 7. Generic JSON/Markdown

**Overview**: Import conversations in standard JSON or Markdown format.

**JSON Format**:
Conversations can be imported as a JSON array of messages:
```json
[
  {
    "role": "user",
    "content": "What is the capital of France?"
  },
  {
    "role": "assistant",
    "content": "The capital of France is Paris."
  }
]
```

**Markdown Format**:
Conversations can also be markdown files with the format:
```markdown
# Conversation Title

**User**: What is the capital of France?

**Assistant**: The capital of France is Paris.

**User**: Tell me more about it.

**Assistant**: Paris is the largest city in France...
```

**Import Steps**:
1. In Skales: **Settings → Data → Migrate**
2. Click **Import**
3. Select "Generic JSON/Markdown"
4. Upload your conversation file
5. Enter a title for the imported conversation
6. Click **Import**

**Supported Fields** (for JSON):
- `role` — "user" or "assistant"
- `content` — Message text
- `timestamp` — Optional ISO timestamp
- `model` — Optional model name
- `tokens` — Optional token count

**Advantages**:
- Import conversations from custom tools or scripts
- Migrate from unsupported AI services
- Create conversation archives from logs

---

## Detailed Migration Process

### Step-by-Step for Web UI Migration

1. **Access Settings**:
   - Click **Settings** (gear icon, top right)
   - Navigate to **Data** tab

2. **Start Migration**:
   - Click **Migrate** button
   - Select **Import** option

3. **Choose Source**:
   - Select your data source from the dropdown
   - (ChatGPT, Claude, Hermes, Generic JSON, etc.)

4. **Provide Credentials or File**:
   - For web services: You may need to log in
   - For file-based sources: Upload your exported file
   - For CLI migrations: Run the command in terminal

5. **Configure Import Options**:
   - Choose which conversations/memories to import
   - Optionally map old API keys to new providers
   - Set folder organization preferences

6. **Review Summary**:
   - Preview what will be imported
   - Check for any warnings or conflicts
   - Confirm the import

7. **Wait for Completion**:
   - Migration typically takes 1-5 minutes depending on data size
   - Large imports (1000+ conversations) may take longer
   - You'll see a success notification when complete

8. **Verify**:
   - Check **Conversations** to see imported discussions
   - Check **Settings → Memories** to see extracted facts
   - Review imported skills in **Settings → Skills**

### CLI Migration Workflow

```bash
# 1. Dry-run to preview changes
node skales.js migrate --from hermes --dry-run

# 2. Run actual migration
node skales.js migrate --from hermes

# 3. Check import status
node skales.js migrate --status

# 4. View imported data location
ls ~/.skales-data/imported/
```

---

## Handling Import Issues

**"Unsupported Format"**:
- Ensure your file is valid JSON or markdown
- Check that JSON is properly formatted (use [jsonlint.com](https://jsonlint.com) to validate)
- For markdown, ensure user/assistant messages are clearly labeled

**"API Key Mismatch"**:
- Your old API keys may not match Skales provider names
- After migration, manually configure your keys in **Settings → Providers**
- You'll be prompted to verify API keys during import

**"Partial Import"**:
- Some conversations may fail to import if they contain unsupported data
- Check the migration report for details
- You can re-import the failed items manually

**"Missing Memories"**:
- Memory extraction may not work perfectly for all conversation styles
- You can add/edit memories manually in **Settings → Memories**
- Memories are continuously learned from new conversations

**"Large Data Error"**:
- Importing 10,000+ conversations may timeout
- Try importing in smaller batches
- Contact support if you have very large datasets

---

## After Migration

### Review and Organize

1. **Check Conversations**:
   - Go to **Conversations** tab
   - Verify imported conversations appear
   - Review conversation titles (edit if needed)

2. **Review Memories**:
   - Go to **Settings → Memories**
   - Check extracted facts about you
   - Edit or remove inaccurate memories

3. **Update Providers**:
   - Go to **Settings → Providers**
   - Configure API keys for services you want to use
   - Some keys may have been migrated; verify they work

4. **Check Skills**:
   - Go to **Settings → Skills**
   - Enable/disable imported skills as needed
   - Test custom skills to ensure they work

### Set Up New Workflows

After migration, you have access to all your historical context. Now:
- Create new conversations building on past discussions
- Use imported memories for personalized responses
- Leverage imported skills for specialized tasks
- Connect integrations that were in your old setup

---

## Best Practices

1. **Backup Original Data**: Keep your original exported files as a backup
2. **Test Import First**: Try importing a single conversation first before importing everything
3. **Verify Sensitive Data**: Check that API keys and credentials are handled securely
4. **Update Preferences**: Your old tool's preferences may not translate—update in Skales settings
5. **Clean Up**: Delete old exported files once migration is confirmed successful

---

## Data Locations

All migrated data lives in your Skales data directory:

```
~/.skales-data/
├── imported/               # Imported conversations
│   ├── chatgpt/
│   ├── claude/
│   ├── hermes/
│   └── openclaw/
├── memories/               # Extracted facts and preferences
│   ├── personality.md
│   ├── preferences.json
│   └── contacts.json
├── agent-skills/           # Imported custom skills
├── settings.json           # Your configuration
└── conversations/          # New conversations created in Skales
```

You can safely browse and edit these files if needed (especially memories and skills).

---

## Troubleshooting Migration

**Still using old tool?**

Don't delete your old setup yet. Keep both running in parallel during the transition:
1. Complete migration in Skales
2. Verify all data migrated correctly
3. Use Skales for new conversations for a week or two
4. Once confident, you can stop using the old tool

**Need to re-migrate?**

Run migration again anytime:
- It won't duplicate conversations (uses content hash to detect duplicates)
- New conversations from the source will be added
- Existing conversations are skipped

**Want to rollback?**

Skales doesn't modify your original data sources:
- Your ChatGPT/Claude accounts remain unchanged
- Your Hermes/OpenClaw directories are untouched
- Simply delete the imported folder in `~/.skales-data/` if needed
- You can always re-import later
