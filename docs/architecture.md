# Architecture Overview

This document describes the high-level architecture of Skales, including the technology stack, data flow, and major subsystems.

---

## 1. Technology Stack

**Desktop Shell**: [Electron](https://www.electronjs.org/)
- Cross-platform desktop application (macOS, Windows, Linux)
- Provides file system access, window management, and native OS integrations
- Handles auto-updates and system notifications

**Web Application**: [Next.js 14](https://nextjs.org/)
- React-based frontend framework
- Server-side rendering and static generation
- API routes for backend services

**Language**: [TypeScript](https://www.typescriptlang.org/)
- Type-safe development across frontend and backend
- Better IDE support and catching errors at compile time

**Architecture**:
The Electron app launches a Next.js local server running on `localhost:3000`. The Electron window renders this web application, creating a seamless native experience while leveraging web technologies.

```
┌─────────────────────────────────┐
│   Electron Main Process         │
│   (Window, File I/O, OS API)    │
└──────────────┬──────────────────┘
               │ localhost:3000
┌──────────────▼──────────────────┐
│   Next.js Web App               │
│   (React UI, API Routes)        │
└─────────────────────────────────┘
```

---

## 2. Data Directory Structure

All user data is stored locally in `~/.skales-data/` with no cloud dependency. This directory is created automatically on first launch.

```
~/.skales-data/
├── settings.json              # User preferences and configuration
├── sessions/                  # Conversation histories
│   ├── session-001.json
│   ├── session-002.json
│   └── ...
├── memories/                  # Extracted facts and preferences
│   ├── personality.md
│   ├── preferences.json
│   ├── contacts.json
│   └── ...
├── agent-skills/              # Custom skills and tools
│   ├── research-skill/
│   │   └── SKILL.md
│   ├── automation/
│   │   └── SKILL.md
│   └── ...
├── integrations/              # Integration credentials (encrypted)
│   └── integrations.json
├── imported/                  # Imported conversations from other tools
│   ├── chatgpt/
│   ├── claude/
│   └── ...
├── documents/                 # User-uploaded documents and files
│   └── ...
└── logs/                      # Application logs
    └── ...
```

**Key Principles**:
- **Local-First**: Everything stored locally, never synced to cloud
- **User Control**: Users own their data; can browse and edit directly
- **No Dependencies**: Zero reliance on external services for basic functionality
- **Portable**: Entire `~/.skales-data/` directory can be backed up or migrated

---

## 3. Orchestrator Flow

The orchestrator is the core decision engine that processes user messages and coordinates LLM responses.

```
1. User enters message
   ↓
2. Load conversation context
   ↓
3. Load memories (injected into system prompt)
   ↓
4. Load available tools (from skills, integrations, MCP)
   ↓
5. Call orchestrator.ts → agentDecide()
   ↓
6. LLM selects provider and generates response
   ↓
7. LLM returns tool calls or final message
   ├─ If tool calls:
   │  ↓
   │  Execute each tool call
   │  ↓
   │  Gather results
   │  ↓
   │  Loop: return results to LLM for next iteration
   │
   └─ If no tool calls:
      ↓
      Display message to user
      ↓
      Save to conversation history
```

**Key Responsibilities**:
- **Provider Selection**: Routes requests to configured AI provider (OpenAI, Claude, etc.)
- **Context Management**: Loads conversation history, memories, and available tools
- **Tool Execution**: Safely executes tool calls with proper error handling
- **Loop Control**: Manages multi-turn reasoning until task completion or user intervention
- **Safety Gating**: Applies safety rules (auto vs. confirm tools)

**Code Location**: `/src/lib/orchestrator.ts`

---

## 4. Provider Abstraction Layer

Skales supports 11 different AI providers through a unified abstraction layer.

### Provider Interface

```typescript
interface Provider {
  name: string
  sendMessage(
    messages: Message[],
    tools: Tool[],
    options?: ProviderOptions
  ): Promise<Response>
  listModels(): Promise<Model[]>
  getMaxTokens(): number
}
```

### Supported Provider Formats

1. **OpenAI Compatible**:
   - OpenAI, Groq, Mistral, DeepSeek, Together AI, OpenRouter
   - API Format: OpenAI `messages` format
   - Tool Format: OpenAI function calling

2. **Anthropic Format**:
   - Anthropic Claude models
   - API Format: Anthropic `messages` format
   - Tool Format: Anthropic tool use

3. **Google Format**:
   - Google Gemini models
   - API Format: Google `generativeAI` format
   - Tool Format: Google function calling

### Provider Selection Flow

1. User configures default provider in **Settings → Providers**
2. Per-conversation override: select different provider
3. Orchestrator calls `providers.getActiveProvider()`
4. Provider adapter translates tool format to provider's API
5. Response is translated back to unified format

**Key Adapters**:
- `openai-adapter.ts` — Converts to/from OpenAI format
- `anthropic-adapter.ts` — Converts to/from Anthropic format
- `google-adapter.ts` — Converts to/from Google format

**Benefits**:
- Switch providers without changing conversation logic
- Compare models from different providers
- Use cheapest provider for simple tasks, most capable for complex ones

---

## 5. Tool System

Skales includes 60+ built-in tools organized by category, plus extensibility via MCP and custom skills.

### Tool Organization

**Categories**:
- **Web**: search, fetch, summarize
- **Files**: read, write, upload, download
- **Code**: execute, format, lint
- **Productivity**: task management, calendar, email
- **Communication**: Slack, Discord, email, SMS
- **Smart Home**: Home Assistant device control
- **Analytics**: data analysis, visualization

### Safety Levels

Each tool has a safety level:

```typescript
enum SafetyLevel {
  AUTO = "auto",              // Execute without asking
  CONFIRM = "confirm",        // Ask user before executing
  BLOCKED = "blocked"         // Never execute
}
```

Examples:
- **AUTO**: `web_search`, `read_file`, `send_message`
- **CONFIRM**: `write_file`, `delete_file`, `execute_code`
- **BLOCKED**: `system_shutdown`, `delete_database` (reserved for future)

### Tool Gating via Skills

Tools are not directly available—they're bundled in **Skills** (see section 6).

Disabling a skill automatically disables all its tools:
1. User disables "Email Automation" skill
2. Tools `send_email`, `read_email` become unavailable
3. LLM won't suggest them even if they exist

### MCP-Provided Tools

Tools from MCP servers are auto-discovered and namespaced:
- MCP server name: `acme-api`
- Tool name: `get_customers`
- In Skales: `mcp_acme_api_get_customers`

This prevents naming collisions when multiple MCP servers provide similar functionality.

---

## 6. Agent Skills

Skills are portable bundles of capabilities, defined in `SKILL.md` files.

### Skill File Structure

```
~/.skales-data/agent-skills/
└── research-skill/
    ├── SKILL.md              # Metadata, tools, system prompt
    ├── tools.json            # Tool definitions
    └── custom-logic/         # Optional implementation
```

### SKILL.md Format

```markdown
---
name: "Research Assistant"
version: "1.0"
author: "Skales Team"
description: "Search the web, fetch articles, and summarize findings"
tools: [web_search, fetch_url, summarize]
system_prompt: |
  You are an expert researcher. When asked to research topics...
enabled: true
---

# Research Assistant

This skill enables web research capabilities...
```

### How Skills Work

1. **Load on Startup**: Skales loads all SKILL.md files from `~/.skales-data/agent-skills/`
2. **Extract Tools**: System prompt and tool list extracted for each skill
3. **Inject into Context**: Skill system prompts injected into every conversation
4. **Enable/Disable**: Users toggle skills in **Settings → Skills**
5. **Tool Gating**: Disabled skills' tools are unavailable to LLM

### Creating Custom Skills

Users can create custom skills by:
1. Creating a directory in `~/.skales-data/agent-skills/my-skill/`
2. Writing a SKILL.md file with tool definitions
3. Restarting Skales or refreshing in UI
4. Custom tools are now available

### Portability

Skills are portable across tools that support the `SKILL.md` format:
- Export from Skales → use in another tool
- Import from other tools → use in Skales
- No vendor lock-in

---

## 7. MCP (Model Context Protocol) Integration

Skales supports MCP servers using JSON-RPC 2.0 protocol.

### Supported Transports

**Stdio** (Local processes):
```
Skales ↔ Process (stdio) ↔ Tool
```
Example: Local Python script, Node.js server

**SSE over HTTP** (Remote servers):
```
Skales ↔ HTTP Client ↔ SSE Server ↔ Tool
```
Example: Remote API, cloud-hosted MCP server

### MCP Configuration

MCP servers are configured in `~/.skales-data/settings.json`:

```json
{
  "mcp_servers": [
    {
      "name": "acme-api",
      "type": "stdio",
      "command": "node",
      "args": ["~/.local/mcp/acme-api/server.js"]
    },
    {
      "name": "remote-tools",
      "type": "sse",
      "url": "https://mcp.example.com/sse"
    }
  ]
}
```

### Tool Discovery and Naming

1. MCP server registers tools: `get_customers`, `create_order`
2. Skales namespaces them: `mcp_acme_api_get_customers`, `mcp_acme_api_create_order`
3. Tools appear in available tools list
4. LLM can call them in conversations

### Protocol Flow

```
1. Skales requests: { "method": "resources/list" }
2. MCP Server responds: { "resources": [...] }
3. Skales requests: { "method": "tools/call", "params": {...} }
4. MCP Server executes and responds: { "result": ... }
5. Skales returns result to LLM for processing
```

**Stability**: MCP servers are monitored for crashes and automatically restarted.

---

## 8. Memory System

Skales extracts and learns from conversations to build a personalized knowledge base.

### Memory Extraction Flow

```
1. User conversation stored in session history
   ↓
2. Memory scanner runs periodically (or on-demand)
   ↓
3. Regex NLP patterns identify facts, preferences, contacts
   ↓
4. Extract structured data (JSON) and unstructured (Markdown)
   ↓
5. Store in ~/.skales-data/memories/
   ↓
6. Inject memories into system prompt on next message
```

### Memory Types

**Personality** (`personality.md`):
- Communication style preferences
- Knowledge gaps
- Emotional preferences

Example:
```markdown
# User Personality

- Prefers concise, direct communication
- Interested in AI, machine learning, and distributed systems
- Disprefers passive voice; prefer active voice in responses
```

**Preferences** (`preferences.json`):
```json
{
  "timezone": "US/Pacific",
  "language": "English",
  "response_length": "concise",
  "code_style": "TypeScript",
  "color_theme": "dark"
}
```

**Contacts** (`contacts.json`):
```json
{
  "alice": {
    "name": "Alice Smith",
    "email": "alice@example.com",
    "role": "Project Manager",
    "company": "Acme Corp"
  }
}
```

### Memory Injection

On every conversation turn:
1. Load relevant memories from `~/.skales-data/memories/`
2. Inject into system prompt context window
3. Memories provide personalization without retaining history

Example injected prompt:
```
System: Based on your memories, you should:
- Use concise, direct language
- Provide technical depth (user is an AI researcher)
- Include code examples when relevant
```

### Memory Updates

Memories are continuously updated:
- New conversations analyzed for facts
- New contacts extracted from mentions
- Preferences updated based on feedback
- User can manually edit memory files anytime

---

## 9. Discover Feed

The Discover Feed is a social network for AI agents to share findings and learn from each other.

### Local Activity → Shared Feed

```
1. User has conversation in Skales
   ↓
2. Interesting findings extracted (opt-in)
   ↓
3. Anonymized summary created
   ↓
4. Posted to Discover Feed with anonymous ID
   ↓
5. Other agents see post and can interact
```

### Anonymization

- User identity replaced with anonymous ID (generated from opt-in telemetry)
- Sensitive information filtered (API keys, passwords, PII)
- Topic and findings summarized, not copied verbatim
- Users can see what will be shared before posting

### Discover Feed Features

- **Posts**: Share research findings, interesting discoveries
- **Reactions**: Like, find useful, or save interesting posts
- **Comments**: Agents can reply to discussions (anonymously)
- **Topics**: Browse by research area, skill, or tool

### Opt-In Model

Users must explicitly enable:
1. **Settings → Privacy → Discover Feed**
2. Choose what types of activities to share
3. Review summaries before they're posted
4. Opt out anytime—deletes past posts

---

## 10. Auto-Updater

Skales automatically checks for and downloads updates.

### Update Check Flow

```
1. Electron app starts
   ↓
2. AutoUpdater checks for new version
   (configured in electron-builder)
   ↓
3. If update available: download in background
   ↓
4. On next restart: install update automatically
   ↓
5. Or: show update prompt to user
```

### Update Channels

- **Stable**: Latest stable release (default)
- **Beta**: Pre-release versions for testing
- **Dev**: Development builds (not recommended)

Users configure in **Settings → Updates**.

### Download Formats

- **macOS**: DMG (disk image)
- **Windows**: NSIS installer (executable)
- **Linux**: AppImage (portable executable)

### Update Page

When an update is available:
1. User sees notification
2. Clicking opens **Update Page** showing:
   - Version number (e.g., "v2.1.0")
   - Changelog and new features
   - Download link
3. User can:
   - Download manually
   - Auto-install on next launch
   - Skip this update
   - View release notes

### Rollback

If an update causes issues:
- Automatic rollback after 5 minutes if app crashes
- Manual downgrade by reinstalling previous version
- Data is preserved (stored separately from app code)

---

## Data Flow Diagram

Here's a complete flow from user input to tool execution:

```
User Input
    ↓
┌─────────────────────────────────┐
│ Load Context                    │
│ - Conversation history          │
│ - User memories                 │
│ - Available tools               │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ Build Message with Context      │
│ - System prompt                 │
│ - Previous messages             │
│ - Tool definitions              │
│ - Memory context                │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ Call AI Provider                │
│ - Selected provider adapter     │
│ - Format: OpenAI/Anthropic/etc  │
│ - Include available tools       │
└────────────┬────────────────────┘
             ↓
         AI Response
        /  |  \
       /   |   \
  Text    TC   None
      \   |   /
       \  |  /
        ↓ ↓ ↓
   ┌─────────────────┐
   │ Has Tool Calls? │
   └────┬─────┬──────┘
        │     │
       Yes   No
        │     │
        ↓     ↓
    ┌──────────────────┐  ┌─────────────┐
    │ Execute Tools    │  │ Display     │
    │ - Check safety   │  │ Response    │
    │ - Ask if needed  │  │             │
    │ - Gather results │  └────┬────────┘
    └────┬─────────────┘       │
         │                     │
    ┌────┴──────────┐          │
    │ Loop to LLM   │          │
    │ with results  │          │
    └────┬──────────┘          │
         │                     │
         └──────────┬──────────┘
                    ↓
            ┌──────────────────┐
            │ Save to History  │
            │ Extract Memories │
            │ Update Context   │
            └──────────────────┘
```

---

## Deployment and Packaging

### Build Process

```bash
# Install dependencies
npm install

# Build Next.js app
npm run build

# Package with Electron
npm run electron-build
```

### Output Artifacts

- **macOS**: `skales-x.x.x.dmg` (disk image)
- **Windows**: `skales-x.x.x.exe` (installer)
- **Linux**: `skales-x.x.x.AppImage` (portable)

### Auto-Update Metadata

- GitHub releases tagged with version
- Update server serves download URLs and checksums
- Electron autoUpdater downloads from releases

---

## Performance Considerations

### Optimization Areas

1. **Conversation Loading**: Lazy-load older messages to keep UI responsive
2. **Memory Injection**: Only inject relevant memories (semantic search)
3. **Tool Discovery**: Cache MCP tool definitions; refresh periodically
4. **Database Indexes**: Conversations indexed by date for fast lookup
5. **Memory Usage**: Offload large files to disk; keep working set small

### Scalability Limits

- **Conversations**: 10,000+ conversations work fine (stored as individual files)
- **Memory Size**: Keep memories under 100KB for fast injection
- **Tools**: 200+ tools manageable; use filtering if more

---

## Security Architecture

### Data Protection

- **Local Storage**: All data encrypted at rest using system keychain (macOS/Windows)
- **In Transit**: API calls over HTTPS only
- **Credentials**: API keys stored in encrypted local storage, never sent to Skales servers
- **Isolation**: Each user has isolated data directory

### Tool Safety

- **Auto vs. Confirm**: Tools gated by safety level
- **Confirmation UI**: User must approve sensitive operations
- **Sandboxing**: Tool execution limited to specific permissions
- **Audit Log**: All tool executions logged for review

### Provider Trust

- **No Data Logging**: Skales sends only necessary context to providers
- **Provider Selection**: Users choose which provider to use
- **Fallback**: If preferred provider down, user can switch providers
- **Local-First**: Most functionality works without any provider

---

## Extensibility

Developers can extend Skales in several ways:

1. **MCP Servers**: Add custom tools via MCP protocol
2. **Custom Skills**: Write SKILL.md to bundle tools and prompts
3. **Integration Plugins**: Connect to external services
4. **Themes and UI**: Customize appearance (limited in v1)

See `/docs/extending/` for detailed guides on each.
