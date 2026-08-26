# Skales DevKit API Reference

Every endpoint below was read out of Skales Desktop 12.8.4 — path, method, request body, and response shape. Where an earlier version of this reference described a different shape, the app's shape is the one documented here.

## Base URL

```
http://localhost:3000
```

Skales walks ports **3000 through 3009** and binds the first free one, so a second instance or any other process on 3000 moves the whole API. If a request reaches nothing, check the port first:

```bash
export SKALES_URL=http://localhost:3001
```

`SKALES_URL` is what the CLI reads. For curl, substitute the port yourself.

## Authentication

Every `/api/cli/*` route except `devkit-status` and `devkit-docs` requires the DevKit token as a Bearer header:

```
Authorization: Bearer <your devkit token>
```

The token is the value you wrote into `api.token` in `~/.skales-data/devkit/devkit.json`. You choose it; nothing in the app generates it. The CLI reads it from `SKALES_DEVKIT_TOKEN` or from the same file — note the `_DEVKIT_` in the middle, `SKALES_TOKEN` is not read anywhere.

### Which credential each route accepts

| Routes | Accepts |
|---|---|
| `chat`, `tools`, `model`, `memory`, `status`, `sessions`, `cron` | **Bearer only.** The DevKit token, nothing else. |
| the `mcp` family | Bearer **or** a valid `x-skales-token` (the app's own `SKALES_API_TOKEN`). |
| `devkit-status`, `devkit-docs` | no auth. |

The middleware that guards the rest of the app's API carves `/api/cli/*` out entirely, because an external CLI cannot know `SKALES_API_TOKEN`. That is why these routes carry their own gate — and why `x-skales-token` is validated in the route rather than assumed valid.

### Auth failures

| Status | Body | Cause |
|---|---|---|
| 403 | `{"error":"DevKit not enabled"}` | No `devkit.json`, or `enabled` is not `true`. |
| 500 | `{"error":"DevKit token not configured"}` | The file was found but `api.token` is empty or missing — most often a token written at the top level instead of inside `api`. |
| 401 | `{"error":"Invalid DevKit token"}` | The Bearer token does not match. Compared in constant time. |

## Error Handling

Errors are JSON with a single `error` string:

```json
{ "error": "id parameter is required" }
```

| Status | Meaning |
|---|---|
| 400 | Missing or invalid field in the request |
| 401 / 403 / 500 | See the auth table above |
| 404 | The named session, memory, task or MCP server does not exist |
| 405 | Wrong HTTP method for that path — Next.js answers this for any method the route does not export |
| 500 | Unhandled server-side error, with the message passed through |

---

## Chat

### POST /api/cli/chat

Send a message and stream the answer, with full tool calling.

**Request**

```json
{ "message": "What's on my calendar today?", "sessionId": "optional-session-id" }
```

Without `sessionId` a new session titled "CLI Session" is created; its id arrives in the final event.

**Response**: `text/event-stream`.

There are **no `event:` lines**. Every frame is a single `data:` line carrying a JSON object with a `type` field:

```
data: {"type":"tool_call","tool":"list_calendar_events","args":{"date":"today"}}

data: {"type":"tool_result","tool":"list_calendar_events","result":"3 events"}

data: {"type":"text","content":"You have three events today..."}

data: {"type":"done","sessionId":"session_1755800000000"}
```

| `type` | Fields | Meaning |
|---|---|---|
| `text` | `content` | The assistant's answer. Emitted once, as a whole — this is a streamed transport, not a token-by-token stream. |
| `tool_call` | `tool`, `args` | The agent is about to run a tool. `tool` is the name, `args` the parsed arguments object. Emitted for the first call of a batch. |
| `tool_result` | `tool`, `result` | One frame per result. `result` is a display string, truncated to about 200 characters — not the full tool output. |
| `tool_error` | `tool`, `error` | Tool execution threw. The turn ends after this. |
| `error` | `error` | The turn failed. |
| `done` | `sessionId` | Always last. Carries the session id and nothing else — there is no token usage in this stream. |

The fields are `tool`, `args`, `result`. There is no `id` and no `name`.

A turn runs at most 40 orchestrator iterations, with a repeat guard that stops a model looping one identical tool call.

**Example**

```bash
curl -N -X POST http://localhost:3000/api/cli/chat \
  -H "Authorization: Bearer $SKALES_DEVKIT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What tools do you have?"}'
```

Pulling just the text out of the stream:

```bash
... | grep '"type":"text"'
```

---

## Tools

### GET /api/cli/tools

```json
{
  "tools": [
    { "name": "web_fetch", "description": "Fetch a URL and return its text", "enabled": true }
  ]
}
```

`enabled` reflects the add-on gating in Settings: a tool whose add-on is switched off is listed but not offered to the model.

---

## Model Configuration

### GET /api/cli/model

```json
{ "provider": "anthropic", "model": "claude-sonnet-5", "baseUrl": "", "enabled": true }
```

Values come from `settings.json`: `activeProvider` and that provider's entry. An unconfigured provider reports `"unknown"` as the model.

### PUT /api/cli/model

```json
{ "provider": "openrouter", "model": "openai/gpt-5" }
```

```json
{ "success": true, "provider": "openrouter", "model": "openrouter/model-id" }
```

There is no `message` field.

| Status | Cause |
|---|---|
| 400 `Both provider and model are required` | One of the two is missing |
| 400 `Unknown provider: <id>` | The provider has no entry in `settings.json`. Configure it once in Settings > Providers; the API will not create it. |

The call sets `activeProvider`, writes the model, and sets that provider's `enabled` to true. The model string is **not** validated against the provider's catalogue.

---

## Memory

### GET /api/cli/memory

```json
{
  "memories": [
    {
      "id": "mem_a1b2c3d4e5f6a7b8",
      "category": "preference",
      "content": "Prefers dark mode",
      "source_conversation_id": "session_1755800000000",
      "extracted_at": 1755800000000,
      "relevance_keywords": ["ui", "theme"]
    }
  ],
  "count": 1
}
```

`extracted_at` is **epoch milliseconds**, not an ISO string. The keyword field is `relevance_keywords`. Newest first.

### POST /api/cli/memory

```json
{ "content": "Prefers dark mode", "category": "preference", "keywords": ["ui"] }
```

| Field | Required | Notes |
|---|---|---|
| `content` | yes | 400 without it |
| `category` | no | Defaults to `fact`. Any string is accepted; the CLI colours `preference`, `fact`, `action_item`, `contact`, `url`, `location`, `topic`. |
| `keywords` | no | Array; anything else becomes `[]`. Stored as `relevance_keywords`. |

Response — the memory is **wrapped**:

```json
{ "success": true, "memory": { "id": "mem_...", "category": "preference", "content": "...", "source_conversation_id": "devkit-cli", "extracted_at": 1755800000000, "relevance_keywords": ["ui"] } }
```

Memories written this way carry `source_conversation_id: "devkit-cli"`.

### DELETE /api/cli/memory?id=&lt;id&gt;

```json
{ "success": true, "deleted": "mem_a1b2c3d4e5f6a7b8" }
```

400 without `id`, 404 `Memory not found` for an unknown one.

---

## Scheduled Tasks

Skales calls these **cron jobs**. The route family is `/api/cli/cron`.

### GET /api/cli/cron

```json
{
  "jobs": [
    {
      "id": "1755800000000-a1b2c3d4",
      "name": "Morning summary",
      "schedule": "0 9 * * *",
      "task": "Summarize yesterday's activity",
      "agent": "researcher",
      "enabled": true,
      "createdAt": 1755800000000,
      "lastRun": 1755886400000,
      "nextRun": "2026-08-23T09:00:00.000Z",
      "scheduleHuman": "daily at 9:00"
    }
  ],
  "count": 1
}
```

The array is called **`jobs`**, not `tasks`. `nextRun` and `scheduleHuman` are computed per request from the cron expression, so `nextRun` in the response is an ISO string. `createdAt` and `lastRun` are epoch milliseconds. `agent` and `sessionId` appear only on jobs that have them.

### POST /api/cli/cron

```json
{ "name": "Morning summary", "schedule": "0 9 * * *", "task": "Summarize yesterday's activity" }
```

| Field | Required | Notes |
|---|---|---|
| `name` | yes | The label shown in the app |
| `schedule` | yes | 5-field cron: minute hour day month weekday |
| `task` | yes | What the agent should do |
| `description` | no | If present it **replaces** `task` in the stored job |
| `agent` | no | An agent id; the job then runs as that agent |

```json
{ "success": true, "job": { "id": "1755800000000-a1b2c3d4", "createdAt": 1755800000000, "name": "Morning summary", "schedule": "0 9 * * *", "task": "Summarize yesterday's activity", "enabled": true } }
```

The `id` is assigned by Skales and returned here. Every other cron endpoint takes that id, not the name.

| Status | Cause |
|---|---|
| 400 `name, schedule, and task are required` | A field is missing. This is what you get for sending `{id, schedule, prompt}`. |
| 400 `Invalid cron expression` | `schedule` did not parse |

Creation de-duplicates: an identical job that already exists is returned instead of a second copy.

### DELETE /api/cli/cron?id=&lt;id&gt;

Deletion lives on the **query form**. `/api/cli/cron/{id}` exports only `PATCH`, so a path-style DELETE answers **405**, not 404.

```json
{ "success": true }
```

An unknown id is **200 with `{"success": false}`**, not a 404. Check the flag, not just the status.

### PATCH /api/cli/cron/{id}

```json
{ "enabled": false }
```

```json
{ "id": "1755800000000-a1b2c3d4", "enabled": false }
```

400 without a boolean `enabled`; 404 `No scheduled task with id "..."` for an unknown id. Needs Desktop v12.5.7.

### POST /api/cli/cron/{id}/run

No body. Fires the task now, outside its schedule, and does not count as the scheduled execution.

```json
{ "id": "1755800000000-a1b2c3d4", "triggered_at": "2026-08-22T14:00:00.000Z", "status": "queued", "taskId": "1755886400000-b2c3d4e5" }
```

`taskId` is present when the run produced a task record. 404 for an unknown id. Needs Desktop v12.5.7.

---

## System Status

### GET /api/cli/status

GET only — `POST` answers 405.

```json
{
  "app": "Skales",
  "version": "12.8.4",
  "author": "Mario Simic",
  "homepage": "https://skales.app",
  "provider": "anthropic",
  "model": "claude-sonnet-5",
  "memory_count": 12,
  "session_count": 34,
  "tools_count": 0,
  "uptime_ms": 45000,
  "devkit_version": "0.5.0",
  "timestamp": 1755800000000
}
```

`tools_count` is the length of `capabilities.json` in the data directory — a self-description file, not the tool registry. It reads 0 on installs that have never written one. For the real list, call `GET /api/cli/tools`.

`uptime_ms` is the server process's uptime. `version` is the Skales Desktop version; `devkit_version` is the `version` string out of your `devkit.json`.

---

## DevKit Status

### GET /api/cli/devkit-status

No auth. This is what the sidebar, top navigation and icon rail poll to decide whether to show the API Playground and Debug Panel entries. From v12.9.10 the Developer section itself hangs on the DevKit add-on instead, so this endpoint answering `false` no longer means the section is hidden — the DevKit page stays there to offer the setup.

```json
{ "enabled": true, "version": "0.5.0" }
```

When DevKit is off: `{ "enabled": false, "version": null }`. There are no `desktop_version`, `features` or `data_dir` fields.

---

## DevKit Docs

### GET /api/cli/devkit-docs

No auth, but it does require DevKit to be enabled (403 otherwise).

It returns the **content** of `DEVKIT.md` from your `devkit/` folder, not a list of documents:

```json
{ "content": "# Skales DevKit\n\n..." }
```

With no `DEVKIT.md` next to your `devkit.json` you get a placeholder string instead, and the Developer > Docs tab shows it. Copy this repository's [`DEVKIT.md`](../DEVKIT.md) into `~/.skales-data/devkit/` to fill the tab.

---

## MCP (Model Context Protocol)

This family accepts either the DevKit Bearer token or a valid `x-skales-token`.

### GET /api/cli/mcp

```json
{
  "servers": [
    { "name": "filesystem", "transport": "stdio", "status": "connected", "tools": 11, "enabled": true }
  ]
}
```

| `status` | Meaning |
|---|---|
| `disabled` | `enabled` is false |
| `connected` | enabled, with a live client in the pool |
| `stopped` | enabled, no live client — lazy connect has not been triggered, or the client was reaped |

### POST /api/cli/mcp

Adds or updates one server. Answers **201**.

| Field | Required | Notes |
|---|---|---|
| `name` | yes | The identifier; sending the same name again updates that server |
| `transport` | no | `stdio` (default), `sse`, or `http`. `type` is accepted as an alias. |
| `command` | for `stdio` | Executable |
| `args` | no | Array |
| `env` | no | Object of environment variables |
| `url` | for `sse`/`http` | Endpoint |
| `headers` | no | Object of request headers |
| `enabled` | no | Defaults to true |

```json
{ "success": true, "server": { "name": "filesystem", "type": "stdio", "command": "npx", "args": ["-y","@modelcontextprotocol/server-filesystem","/tmp"], "env": {}, "enabled": true } }
```

Note the response uses `type` where the request used `transport`. 400 for a missing `name`, an unknown transport, a `stdio` server without `command`, or an `sse`/`http` server without `url`.

The route upserts **one** server per call. `skales mcp add` accepts a file holding a single object, an array, or `{ "servers": [...] }`, and posts each entry in turn.

### POST /api/cli/mcp/test

```json
{ "name": "filesystem" }
```

```json
{ "name": "filesystem", "ok": true, "latency_ms": 142, "tools": 11 }
```

A failed test is still 200, with `ok: false` and an `error` string.

### GET /api/cli/mcp/{name}

```json
{ "server": { "name": "github", "type": "stdio", "command": "npx", "args": ["..."], "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..." }, "enabled": true } }
```

**The response contains the server's `env` block in clear text**, including any API keys stored there. Do not log it or pipe it anywhere shared.

### DELETE /api/cli/mcp/{name}

```json
{ "success": true, "name": "github" }
```

404 for an unknown name. Log files for the server are removed too.

### POST /api/cli/mcp/{name}/start

```json
{ "success": true, "name": "filesystem", "toolCount": 11 }
```

### POST /api/cli/mcp/{name}/stop

```json
{ "success": true, "name": "filesystem" }
```

### GET /api/cli/mcp/{name}/logs?lines=&lt;n&gt;

`lines` defaults to 200 and is capped at 1000.

```json
{ "name": "filesystem", "lines": [ { "t": "2026-08-22T14:00:00.000Z", "stream": "stderr", "msg": "server started" } ] }
```

---

## Sessions

### GET /api/cli/sessions

```json
{
  "sessions": [
    {
      "id": "session_1755800000000",
      "title": "Calendar questions",
      "provider": "anthropic",
      "model": "claude-sonnet-5",
      "messageCount": 12,
      "createdAt": 1755800000000,
      "updatedAt": 1755886400000,
      "agentId": "researcher"
    }
  ],
  "count": 1
}
```

**camelCase, and the timestamps are epoch milliseconds** — not `created_at` / `updated_at` / `message_count`, and not ISO strings. `agentId` appears only on sessions bound to an agent. Newest first by `updatedAt`.

### GET /api/cli/sessions?id=&lt;id&gt;

The single session is **wrapped**:

```json
{ "session": { "id": "session_1755800000000", "title": "Calendar questions", "messages": [ { "role": "user", "content": "...", "timestamp": 1755800000000 } ], "createdAt": 1755800000000, "updatedAt": 1755886400000 } }
```

404 `Session not found` for an unknown id.

### DELETE /api/cli/sessions?id=&lt;id&gt;

```json
{ "success": true, "deleted": "session_1755800000000" }
```

---

## Beyond /api/cli/\*

The seventeen routes above are the DevKit surface. They are not the whole API: Skales Desktop registers roughly a hundred further route groups under `/api/` — agents, autopilot, workflows, skills, custom-skills, skales-local, skales-iq, swarm, codework, ide, flow, studio, buddy, planner, playbooks, browser, wordpress, mcp, a2a, scheduler, and more.

Those groups are **not** DevKit routes and do not accept the DevKit token. They sit behind the app's own middleware gate and expect `SKALES_API_TOKEN` in an `x-skales-token` header — the token from Settings > Security > Remote access. They also have no compatibility promise: they are the app's internal surface and change between releases without notice, which is why they are not documented endpoint-by-endpoint here.

To see what a given build exposes:

```bash
export SKALES_API_TOKEN=<token from Settings, Security, Remote access>
curl -s http://localhost:3000/api/health -H "x-skales-token: $SKALES_API_TOKEN"
```

and read [Capabilities](./capabilities.md) for what each area does, where its data lives, and which of them are reachable at all without the desktop window.

---

## Complete Example

```bash
#!/bin/bash
BASE="${SKALES_URL:-http://localhost:3000}"
TOKEN="$SKALES_DEVKIT_TOKEN"
AUTH=(-H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")

# Start a conversation and keep the session id from the done event
SESSION=$(curl -sN -X POST "$BASE/api/cli/chat" "${AUTH[@]}" \
  -d '{"message":"Remember that I prefer concise answers."}' \
  | grep '"type":"done"' | sed 's/.*"sessionId":"\([^"]*\)".*/\1/')

# Continue in the same session
curl -sN -X POST "$BASE/api/cli/chat" "${AUTH[@]}" \
  -d "{\"message\":\"What did I just tell you?\",\"sessionId\":\"$SESSION\"}" \
  | grep '"type":"text"'

# Schedule a daily job and keep the id it hands back
JOB=$(curl -s -X POST "$BASE/api/cli/cron" "${AUTH[@]}" \
  -d '{"name":"Morning summary","schedule":"0 9 * * *","task":"Summarize yesterday"}' \
  | sed 's/.*"id":"\([^"]*\)".*/\1/')

curl -s -X POST "$BASE/api/cli/cron/$JOB/run" "${AUTH[@]}"
curl -s "$BASE/api/cli/status" "${AUTH[@]}"
```

## Performance Notes

- No rate limiting. The API is local; the ceiling is your machine and your provider's own limits.
- `devkit.json` is cached for 10 seconds, so a token change takes up to that long to apply.
- A chat turn runs up to 40 orchestrator iterations. Long tool chains take as long as the tools do; the CLI's own request timeout is 120 seconds for chat and 30 for everything else.
- Memories and sessions are one JSON file each, read from disk per request. Thousands of them make the list endpoints proportionally slower.

## Support

- [GitHub Discussions](https://github.com/skalesapp/skales/discussions)
- [Discover feed](https://feed.skales.app)

There is no DevKit log-level setting in the app. To see what a request actually did, use the Debug Panel under Developer, or `skales mcp logs <name>` for MCP servers.
