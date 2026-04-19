# Skales DevKit API Reference

Complete API reference for the Skales DevKit. All endpoints run on a local development server and require authentication.

## Base URL

```
http://localhost:3000
```

You can configure the base URL using the `SKALES_URL` environment variable:
```bash
export SKALES_URL=http://localhost:5000
```

## Authentication

All API endpoints require the `Authorization` header with a Bearer token:

```
Authorization: Bearer your-devkit-token
```

Generate or retrieve your token from:
- **Settings** → **DevKit** → **Generate Token** in the Skales application

**Note**: Replace `your-token` with your actual token in all examples below.

## Error Handling

All endpoints return standard HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (invalid parameters) |
| 401 | Unauthorized (invalid/missing token) |
| 404 | Not Found (resource doesn't exist) |
| 500 | Server Error |

Error responses include a message:
```json
{
  "error": "Description of what went wrong"
}
```

---

## Chat Endpoints

### POST /api/cli/chat
Send a message and receive a streaming response via Server-Sent Events (SSE).

**Request:**
```bash
curl -X POST http://localhost:3000/api/cli/chat \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the current system status?",
    "sessionId": "optional-session-id"
  }'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | The user message to send |
| `sessionId` | string | No | Session ID to continue a conversation. If omitted, a new session is created |

**Response (Server-Sent Events):**

The response is streamed as multiple SSE events. Each event has a type and data:

```
event: text
data: "The current system"

event: text
data: " status is healthy"

event: tool_call
data: {"id": "tool_1", "name": "get_status", "args": {}}

event: tool_result
data: {"id": "tool_1", "result": {"status": "ok"}}

event: text
data: " with 8 active tools."

event: done
data: {"sessionId": "session-123", "usage": {"input_tokens": 42, "output_tokens": 120}}
```

**Event Types:**
- `text`: Streamed text output from the AI
- `tool_call`: The AI invoked a tool (includes tool name and arguments)
- `tool_result`: Result of a tool invocation
- `done`: Conversation complete (includes final session ID and token usage)
- `error`: An error occurred during processing

**Example (using curl with line buffering):**
```bash
curl -N http://localhost:3000/api/cli/chat \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"message": "List my memories"}'
```

---

## Tools Endpoints

### GET /api/cli/tools
List all available tools that the AI can use.

**Request:**
```bash
curl http://localhost:3000/api/cli/tools \
  -H "Authorization: Bearer your-token"
```

**Response:**
```json
{
  "tools": [
    {
      "name": "list_memories",
      "description": "List all stored memories",
      "enabled": true
    },
    {
      "name": "create_memory",
      "description": "Create a new memory entry",
      "enabled": true
    },
    {
      "name": "get_status",
      "description": "Get current system status",
      "enabled": true
    }
  ]
}
```

---

## Model Configuration Endpoints

### GET /api/cli/model
Get the current AI model provider and model configuration.

**Request:**
```bash
curl http://localhost:3000/api/cli/model \
  -H "Authorization: Bearer your-token"
```

**Response:**
```json
{
  "provider": "anthropic",
  "model": "claude-opus",
  "baseUrl": "https://api.anthropic.com/v1",
  "enabled": true
}
```

**Fields:**
| Field | Description |
|-------|-------------|
| `provider` | Model provider (e.g., "anthropic", "openai") |
| `model` | Model name or identifier |
| `baseUrl` | Base API URL for the provider |
| `enabled` | Whether this model configuration is active |

---

### PUT /api/cli/model
Switch to a different AI model provider or model.

**Request:**
```bash
curl -X PUT http://localhost:3000/api/cli/model \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "model": "gpt-4"
  }'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `provider` | string | Yes | Provider name (e.g., "anthropic", "openai") |
| `model` | string | Yes | Model identifier for that provider |

**Response:**
```json
{
  "success": true,
  "provider": "openai",
  "model": "gpt-4",
  "message": "Model configuration updated"
}
```

---

## Memory Endpoints

### GET /api/cli/memory
List all stored memories with their metadata.

**Request:**
```bash
curl http://localhost:3000/api/cli/memory \
  -H "Authorization: Bearer your-token"
```

**Response:**
```json
{
  "memories": [
    {
      "id": "mem-001",
      "category": "preferences",
      "content": "User prefers concise responses",
      "extracted_at": "2026-04-02T10:30:00Z",
      "keywords": ["style", "communication"]
    },
    {
      "id": "mem-002",
      "category": "facts",
      "content": "Primary project uses React and Node.js",
      "extracted_at": "2026-04-02T11:45:00Z",
      "keywords": ["tech", "stack"]
    }
  ],
  "count": 2
}
```

---

### POST /api/cli/memory
Create a new memory entry.

**Request:**
```bash
curl -X POST http://localhost:3000/api/cli/memory \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "User is migrating from Express to Fastify",
    "category": "facts",
    "keywords": ["migration", "backend"]
  }'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | The memory content |
| `category` | string | Yes | Category (e.g., "preferences", "facts", "context") |
| `keywords` | array | No | Search keywords to tag this memory |

**Response:**
```json
{
  "id": "mem-003",
  "category": "facts",
  "content": "User is migrating from Express to Fastify",
  "extracted_at": "2026-04-02T12:00:00Z",
  "keywords": ["migration", "backend"]
}
```

---

### DELETE /api/cli/memory
Delete a memory by ID.

**Request:**
```bash
curl -X DELETE "http://localhost:3000/api/cli/memory?id=mem-001" \
  -H "Authorization: Bearer your-token"
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Memory ID to delete |

**Response:**
```json
{
  "success": true,
  "message": "Memory deleted"
}
```

---

## Scheduled Tasks Endpoints

### GET /api/cli/cron
List all scheduled tasks.

**Request:**
```bash
curl http://localhost:3000/api/cli/cron \
  -H "Authorization: Bearer your-token"
```

**Response:**
```json
{
  "tasks": [
    {
      "id": "task-001",
      "name": "Daily backup",
      "schedule": "0 2 * * *",
      "task": "backup_database",
      "nextRun": "2026-04-03T02:00:00Z",
      "lastRun": "2026-04-02T02:00:00Z",
      "enabled": true
    },
    {
      "id": "task-002",
      "name": "Weekly report",
      "schedule": "0 9 * * 1",
      "task": "generate_report",
      "nextRun": "2026-04-07T09:00:00Z",
      "enabled": true
    }
  ],
  "count": 2
}
```

---

### POST /api/cli/cron
Create a new scheduled task.

**Request:**
```bash
curl -X POST http://localhost:3000/api/cli/cron \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hourly sync",
    "schedule": "0 * * * *",
    "task": "sync_data"
  }'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Human-readable task name |
| `schedule` | string | Yes | Cron expression (5-field format) |
| `task` | string | Yes | Task identifier or command to execute |

**Response:**
```json
{
  "id": "task-003",
  "name": "Hourly sync",
  "schedule": "0 * * * *",
  "task": "sync_data",
  "nextRun": "2026-04-02T14:00:00Z",
  "enabled": true
}
```

**Cron Format:**
```
minute hour dayOfMonth month dayOfWeek
0      2    *          *     *          (Daily at 2 AM)
0      9    *          *     1-5        (Weekdays at 9 AM)
*/15   *    *          *     *          (Every 15 minutes)
0      0    1          *     *          (First day of month)
```

---

### DELETE /api/cli/cron
Delete a scheduled task.

**Request:**
```bash
curl -X DELETE "http://localhost:3000/api/cli/cron?id=task-001" \
  -H "Authorization: Bearer your-token"
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Task ID to delete |

**Response:**
```json
{
  "success": true,
  "message": "Task deleted"
}
```

---

### PATCH /api/cli/cron/{id}
Toggle a scheduled task's enabled state without deleting it.

**Request:**
```bash
curl -X PATCH "http://localhost:3000/api/cli/cron/task-001" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `enabled` | boolean | Yes | `true` to enable, `false` to pause |

**Response:**
```json
{
  "id": "task-001",
  "enabled": false
}
```

---

### POST /api/cli/cron/{id}/run
Fire a scheduled task immediately, outside its schedule. Useful for testing.

**Request:**
```bash
curl -X POST "http://localhost:3000/api/cli/cron/task-001/run" \
  -H "Authorization: Bearer your-token"
```

**Response:**
```json
{
  "id": "task-001",
  "triggered_at": "2026-04-19T18:30:00Z",
  "status": "queued"
}
```

Note: `run` is a forward-looking endpoint targeted for Skales Desktop v10.1+. Older Desktop versions return 404 and the CLI prints a fallback message.

---

## System Status Endpoints

### GET /api/cli/status
Get the current system status and statistics.

**Request:**
```bash
curl http://localhost:3000/api/cli/status \
  -H "Authorization: Bearer your-token"
```

**Response:**
```json
{
  "app": "Skales",
  "version": "10.0.3",
  "provider": "anthropic",
  "model": "claude-opus",
  "memory_count": 15,
  "session_count": 3,
  "tools_count": 12,
  "uptime_ms": 3600000,
  "devkit_version": "0.2.0"
}
```

**Fields:**
| Field | Description |
|-------|-------------|
| `app` | Application name |
| `version` | Skales application version |
| `provider` | Current AI model provider |
| `model` | Current AI model in use |
| `memory_count` | Number of stored memories |
| `session_count` | Number of active sessions |
| `tools_count` | Number of available tools |
| `uptime_ms` | Application uptime in milliseconds |
| `devkit_version` | DevKit version |

---

## DevKit Status

### GET /api/cli/devkit-status
Returns information about the active DevKit installation: enabled state, version, feature flags, data directory.

**Request:**
```bash
curl http://localhost:3000/api/cli/devkit-status \
  -H "Authorization: Bearer your-token"
```

**Response:**
```json
{
  "enabled": true,
  "devkit_version": "0.2.0",
  "desktop_version": "10.0.3",
  "features": {
    "api": true,
    "cli": true
  },
  "data_dir": "/Users/mario/.skales-data/devkit"
}
```

**Fields:**
| Field | Description |
|-------|-------------|
| `enabled` | Whether DevKit is active (driven by `devkit.json`) |
| `devkit_version` | Version from the DevKit `package.json` |
| `desktop_version` | Running Skales Desktop version |
| `features` | Per-subsystem toggles from `devkit.json` |
| `data_dir` | Absolute path to the resolved DevKit data directory |

---

## DevKit Docs

### GET /api/cli/devkit-docs
Returns the list of bundled documentation files available to the Developer → Docs viewer in the Skales sidebar.

**Request:**
```bash
curl http://localhost:3000/api/cli/devkit-docs \
  -H "Authorization: Bearer your-token"
```

**Response:**
```json
{
  "docs": [
    { "slug": "getting-started", "title": "Getting Started", "path": "docs/getting-started.md" },
    { "slug": "api-reference", "title": "API Reference", "path": "docs/api-reference.md" },
    { "slug": "agent-skills", "title": "Agent Skills", "path": "docs/agent-skills.md" },
    { "slug": "mcp-servers", "title": "MCP Servers", "path": "docs/mcp-servers.md" },
    { "slug": "providers", "title": "Providers", "path": "docs/providers.md" },
    { "slug": "integrations", "title": "Integrations", "path": "docs/integrations.md" },
    { "slug": "migration", "title": "Migration", "path": "docs/migration.md" },
    { "slug": "architecture", "title": "Architecture", "path": "docs/architecture.md" }
  ]
}
```

---

## MCP (Model Context Protocol)

Manage MCP server connections from the CLI. See [mcp-servers.md](./mcp-servers.md) for protocol details, transport types, and server templates.

> **Note:** MCP management endpoints are forward-looking. Older Skales Desktop versions that do not yet implement `/api/cli/mcp*` return 404; the CLI falls back to a clear error message. MCP itself (invoking configured servers) has worked for several releases. These endpoints are the CLI management layer.

### GET /api/cli/mcp
List currently configured MCP servers with runtime status.

**Request:**
```bash
curl http://localhost:3000/api/cli/mcp \
  -H "Authorization: Bearer your-token"
```

**Response:**
```json
{
  "servers": [
    {
      "name": "filesystem",
      "transport": "stdio",
      "status": "connected",
      "tools": 12,
      "enabled": true
    },
    {
      "name": "github",
      "transport": "stdio",
      "status": "disabled",
      "tools": 0,
      "enabled": false
    }
  ]
}
```

---

### POST /api/cli/mcp/test
Run a live connection check against a configured MCP server.

**Request:**
```bash
curl -X POST http://localhost:3000/api/cli/mcp/test \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "filesystem"}'
```

**Response:**
```json
{
  "name": "filesystem",
  "ok": true,
  "latency_ms": 42,
  "tools": 12
}
```

On failure the response includes `"ok": false` and an `"error"` field describing the cause.

---

### POST /api/cli/mcp
Add or upsert an MCP server configuration.

**Request:**
```bash
curl -X POST http://localhost:3000/api/cli/mcp \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "notion",
    "transport": "stdio",
    "command": "npx",
    "args": ["-y", "@notionhq/notion-mcp-server"],
    "env": { "NOTION_TOKEN": "secret_xxx" }
  }'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique server identifier |
| `transport` | string | Yes | `stdio` or `sse` |
| `command` | string | stdio only | Executable to launch |
| `args` | array | No | Arguments passed to `command` |
| `env` | object | No | Environment variables for the child process |
| `url` | string | sse only | Endpoint URL for SSE transport |
| `enabled` | boolean | No | Defaults to `true` |

---

### DELETE /api/cli/mcp/{name}
Remove an MCP server configuration. The server is stopped if running.

**Request:**
```bash
curl -X DELETE "http://localhost:3000/api/cli/mcp/notion" \
  -H "Authorization: Bearer your-token"
```

**Response:**
```json
{ "success": true, "name": "notion" }
```

---

### GET /api/cli/mcp/{name}/logs
Return recent stdout/stderr lines from the server process.

**Request:**
```bash
curl "http://localhost:3000/api/cli/mcp/filesystem/logs?lines=100" \
  -H "Authorization: Bearer your-token"
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lines` | number | No | Number of trailing lines to return. Default 100. |

**Response:**
```json
{
  "name": "filesystem",
  "lines": [
    { "stream": "stdout", "t": "2026-04-19T18:30:00Z", "msg": "server ready" },
    { "stream": "stderr", "t": "2026-04-19T18:30:05Z", "msg": "warn: large file" }
  ]
}
```

---

## Session Endpoints

### GET /api/cli/sessions
List all chat sessions.

**Request:**
```bash
curl http://localhost:3000/api/cli/sessions \
  -H "Authorization: Bearer your-token"
```

**Response:**
```json
{
  "sessions": [
    {
      "id": "session-001",
      "title": "Debugging API issues",
      "created_at": "2026-04-02T10:00:00Z",
      "updated_at": "2026-04-02T11:30:00Z",
      "message_count": 8
    },
    {
      "id": "session-002",
      "title": "Project planning",
      "created_at": "2026-04-01T14:00:00Z",
      "updated_at": "2026-04-02T09:15:00Z",
      "message_count": 15
    }
  ],
  "count": 2
}
```

---

### GET /api/cli/sessions?id=<id>
Get a specific session with all its messages.

**Request:**
```bash
curl "http://localhost:3000/api/cli/sessions?id=session-001" \
  -H "Authorization: Bearer your-token"
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Session ID to retrieve |

**Response:**
```json
{
  "id": "session-001",
  "title": "Debugging API issues",
  "created_at": "2026-04-02T10:00:00Z",
  "updated_at": "2026-04-02T11:30:00Z",
  "messages": [
    {
      "role": "user",
      "content": "Why is the API returning 500 errors?",
      "timestamp": "2026-04-02T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Let me check the error logs and help diagnose this issue.",
      "timestamp": "2026-04-02T10:00:30Z"
    }
  ],
  "message_count": 8
}
```

---

### DELETE /api/cli/sessions?id=<id>
Delete a session and all its messages.

**Request:**
```bash
curl -X DELETE "http://localhost:3000/api/cli/sessions?id=session-001" \
  -H "Authorization: Bearer your-token"
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Session ID to delete |

**Response:**
```json
{
  "success": true,
  "message": "Session deleted"
}
```

---

## Complete Example: Building a Chat Application

Here's a complete example of using the DevKit API to build a simple chat interface:

```bash
#!/bin/bash

TOKEN="your-token"
BASE_URL="http://localhost:3000"

# Create a new session and get the session ID
SESSION=$(curl -s -X POST $BASE_URL/api/cli/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}' | grep -o '"sessionId":"[^"]*' | cut -d'"' -f4)

echo "Created session: $SESSION"

# Send another message in the same session
curl -N -X POST $BASE_URL/api/cli/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"What is my current model?\", \"sessionId\": \"$SESSION\"}"

# Check system status
curl $BASE_URL/api/cli/status \
  -H "Authorization: Bearer $TOKEN" | jq .

# List all sessions
curl $BASE_URL/api/cli/sessions \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## Rate Limiting and Performance

- No explicit rate limiting is enforced in development mode
- For production use, implement appropriate rate limiting based on your needs
- SSE connections remain open until completion; limit concurrent connections as needed
- Large memory lists (>1000 entries) may impact performance; consider pagination

---

## Support and Debugging

For API debugging:

1. Enable detailed logging: Settings → DevKit → Log Level → Debug
2. Check application logs: `~/.skales-data/logs/`
3. Use the API Playground in the DevKit UI for interactive testing
4. Review the Debug Panel for real-time API activity

For additional help, consult the [Getting Started Guide](./getting-started.md) or visit the Skales community forums.
