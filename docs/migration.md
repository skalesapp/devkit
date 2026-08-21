# Data Migration Guide

Skales can import conversation history from other AI tools. This guide covers
every source the importer actually supports, what it writes, and what it does
not.

---

## Overview

**Where the importer lives**: **Settings → Advanced → Migration Importer**
(in a German UI: **Einstellungen → Erweitert**). It is a grid of source cards;
you click the card for your source and pick the exported file.

**What gets imported**:

- Conversations, as real chat sessions. They appear in **History** with the
  title prefix `[Imported: <source>]`.
- A memory snippet per imported conversation, so the text is findable from
  memory search.

**What does not get imported**:

- API keys. No export format contains them, and the importer does not write
  provider credentials. Add your keys yourself under **Settings → AI Providers**.
- Skills, tools, agents, or add-on configuration.
- Images, attachments, and audio. Only the text of a message is read.
- Live sessions or anything requiring a login to the source service.

**Batch limit**: 500 conversations per import. A larger export has to be split
and imported in several passes; the importer refuses the request rather than
truncating it silently.

**Where the data lands**:

```
~/.skales-data/
├── sessions/     # one file per imported conversation (this is what History shows)
├── memories/     # one text snippet per imported conversation
└── imported/     # the raw parse result, kept as a backup of each import run
```

**Non-destructive**: the file you select is only read, never moved or deleted.

**Repeat imports are not de-duplicated.** Each run creates new sessions, so
importing the same export twice gives you two copies. Delete the earlier
sessions in History if you re-import.

---

## 1. ChatGPT

**Export from ChatGPT**:

Request your data under **Settings → Data Controls → Export**. You receive a
download link by email; unzip the archive and keep `conversations.json`. This is
the file the Skales card asks for.

**Import into Skales**: **Settings → Advanced → Migration Importer → ChatGPT**,
then select `conversations.json`.

**What is read**: every conversation in the export, its title, its user and
assistant messages, and the message timestamps.

---

## 2. Claude

**Export from Claude**:

Request your data under **Settings → Export**. The Skales card asks for the
`claude_conversations.json` file from that export.

**Import into Skales**: **Settings → Advanced → Migration Importer → Claude**,
then select the conversations JSON.

**What is read**: conversation names, user and assistant message text, and
creation timestamps. Attachments and artifacts are not carried over.

---

## 3. GitHub Copilot Chat

This is GitHub Copilot Chat in the IDE, not the Microsoft Copilot consumer
assistant.

**Export from VS Code**: use the **Export Chat** action in the Copilot Chat
view. It writes a single Markdown file.

**Import into Skales**: **Settings → Advanced → Migration Importer →
GitHub Copilot Chat**, then select the `.md` file.

**What is read**: the alternating turns of the export. Code fences, links, and
command blocks are kept verbatim, because Skales renders imported messages with
the same Markdown pipeline.

---

## 4. Google Gemini

**Export from Google**: Gemini conversations come out through
[Google Takeout](https://takeout.google.com) as
`Takeout/My Activity/Gemini Apps/MyActivity.json`.

**Import into Skales**: **Settings → Advanced → Migration Importer → Gemini**,
then select `MyActivity.json`.

**Limitation of the source format**: the Takeout activity log records one entry
per prompt and generally does not contain the model's replies. Imported Gemini
conversations are therefore mostly your own prompts, with responses filled in
only where the export happens to carry them.

---

## 5. OpenClaw

**What to select**: an OpenClaw session log. OpenClaw writes append-only
`.jsonl` files, one JSON object per line, under `~/.openclaw/sessions/` and
`~/.openclaw/agents/<agentId>/sessions/`. You can select a single
`session-<id>.jsonl` file, or the `~/.openclaw` directory itself, in which case
every session log below it is read.

There is no "export bundle" step in OpenClaw; the session logs are the export.

**Import into Skales**: **Settings → Advanced → Migration Importer → OpenClaw**.

**What is read**: user and assistant turns. Tool and system events in the log
become system messages, so the context survives without being attributed to
you.

---

## 6. Hermes

**What to select**: the Hermes SQLite database file. Hermes keeps its state in
a single SQLite file under `~/.hermes/`; the name varies by release
(`state.db`, `hermes.db`, `agent.db`, `sessions.sqlite`). The file picker
filters for `.db`, `.sqlite`, and `.sqlite3`.

**Import into Skales**: **Settings → Advanced → Migration Importer → Hermes**.

**What is read**: sessions and their messages from the database. Personality
files sitting next to the database (`SOUL.md`, `USER.md`, `AGENTS.md`,
`MEMORY.md`) are picked up as system context on the imported conversations.

---

## 7. Cherry Studio

**What to select**: a Cherry Studio topic file, or the folder containing them.
Cherry Studio stores one JSON file per topic in its profile directory:

- macOS: `~/Library/Application Support/CherryStudio/Data/Topics/`
- Windows: `%APPDATA%/CherryStudio/Data/Topics/`
- Linux: `~/.config/CherryStudio/Data/Topics/`

Newer builds may use an `assistants/<id>/topics/` layout instead; selecting the
parent folder works for both.

**Import into Skales**: **Settings → Advanced → Migration Importer →
Cherry Studio**.

---

## 8. AionUi

**What to select**: the AionUi config folder, or the message file inside it.
AionUi persists chat as JSON-in-`.txt` files:

- macOS: `~/Library/Application Support/AionUi/config/`
- Windows: `%APPDATA%/AionUi/config/`
- Linux: `~/.config/AionUi/config/`

The two files that matter are `aionui-chat.txt` (conversations) and
`aionui-chat-message.txt` (messages). Selecting the config folder lets the
importer find both.

**Import into Skales**: **Settings → Advanced → Migration Importer → AionUi**.

**What is read**: text and reasoning messages. Tool calls, permission prompts,
and status messages are skipped, because they are UI runtime rather than
transcript.

---

## 9. Markdown files

**What to select**: any `.md` or `.txt` file.

**Import into Skales**: **Settings → Advanced → Migration Importer →
Markdown Files**.

**How it is read**: the whole file becomes one imported conversation with a
single message. The title is taken from the first heading line. This is meant
for archiving notes and transcripts you want searchable, not for reconstructing
a turn-by-turn dialogue.

---

## 10. Generic JSON

**What to select**: any JSON file with a `messages` array.

Two shapes are accepted. A single conversation:

```json
{
  "title": "Trip planning",
  "messages": [
    { "role": "user", "content": "What is the capital of France?" },
    { "role": "assistant", "content": "The capital of France is Paris." }
  ]
}
```

Or an array of such objects, each imported as its own conversation.

**Fields that are read**:

- `role` — `user`, `human`, `assistant`, or `model`. Anything else becomes a
  system message.
- `content` — the message text. `text` and `parts[].text` are accepted as
  alternatives.
- `title` or `name` — the conversation title. Defaults to
  "Imported Conversation".

Other fields are ignored.

**Import into Skales**: **Settings → Advanced → Migration Importer →
Generic JSON**.

---

## The `skales migrate` CLI command

The devkit CLI has a separate, narrower migration command:

```bash
node skales.js migrate --from hermes
node skales.js migrate --from openclaw
node skales.js migrate --from hermes --dry-run
```

It is not the same code path as the Migration Importer in the app, and it is
not a way to import conversations. Use the app for conversation history.

**What the CLI reads**:

- `--from hermes`: `~/.hermes/cli-config.yaml` (provider, model, API key
  entries), `~/.hermes/memory/`, and a listing of `~/.hermes/skills/`
- `--from openclaw`: `~/.openclaw/SOUL.md`, `~/.openclaw/MEMORY.md`,
  `~/.openclaw/config.json` / `config.yaml` / `.env`, and a listing of
  `~/.openclaw/skills/`

**What the CLI writes**:

- Memory entries into `~/.skales-data/memories/`
- For OpenClaw, `SOUL.md` becomes the system prompt in
  `~/.skales-data/settings.json`. You can edit it afterwards under
  **Settings → General → Soul / System Identity**.
- API keys found in the source config are written into
  `~/.skales-data/settings.json`, but only into provider entries that already
  exist there. Confirm afterwards under **Settings → AI Providers**.

**What the CLI does not do**: it does not import conversations, and it does not
copy skills. Skills found in the source directory are counted in the report and
left where they are.

`--dry-run` prints the report and writes nothing.

---

## Handling import problems

**"Unknown source"** — the source id sent with the request is not one the
importer knows. Use the cards in the Migration Importer rather than calling the
endpoint by hand.

**"Import limited to 500 conversations per batch"** — the export is larger than
one batch. ChatGPT and Claude exports are JSON arrays, so they can be split into
several files and imported one after another.

**"File not found" / nothing imported** — check that you selected the file the
card asks for. The format each card expects is printed on the card itself.

**Nothing in History after a successful import** — imported sessions carry the
`[Imported: <source>]` title prefix; search History for `Imported`.

**Memories look truncated** — memory snippets keep the first 2000 characters of
each message. The full text stays in the imported session.

---

## After migration

1. **Check History**: imported conversations are there, prefixed
   `[Imported: <source>]`. Rename them if you want.
2. **Check the Memory page**: the imported snippets are searchable there and
   can be edited or removed.
3. **Set up providers**: **Settings → AI Providers**. Nothing was migrated
   here; imported sessions are historical and are not bound to a provider. Pick
   one when you continue a conversation.
4. **Set up add-ons and skills yourself**: **Add-Ons** for built-in
   capabilities, **Custom Skills** for skills you author. Neither is touched by
   an import.

---

## Best practices

1. Keep the original export file until you have confirmed the import.
2. Import one conversation first if you are unsure about a format, then the
   rest.
3. Import large exports in batches rather than one 500-conversation run.
4. Remember that a repeat import duplicates rather than updates.

---

## Rolling back

Skales never modifies the source:

- Your ChatGPT, Claude, and Gemini accounts are untouched.
- Your Hermes, OpenClaw, Cherry Studio, and AionUi directories are untouched.

To undo an import, delete the imported sessions in History, or remove the
matching files from `~/.skales-data/sessions/`, `~/.skales-data/memories/`, and
`~/.skales-data/imported/`. You can import again at any time.

---

## Questions and missing sources

- Discussions: <https://github.com/skalesapp/skales/discussions>
- Requests for a source that is not listed here: the **Feedback** form in the
  app, or `request@skales.app`.
