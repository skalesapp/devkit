# Skales DevKit

This file is what **Developer → Docs** renders inside Skales. Copy it next to your `devkit.json`:

```bash
cp DEVKIT.md ~/.skales-data/devkit/
```

Without it, the Docs tab shows a placeholder — the route reads this one file and nothing else.

---

## Enable DevKit

`~/.skales-data/devkit/devkit.json`:

```json
{
  "enabled": true,
  "version": "0.5.0",
  "api": { "enabled": true, "token": "your-secret-token" },
  "cli": { "enabled": true }
}
```

The token is a value you choose. It lives at `api.token` — a top-level `token` is not read, and every call then answers 500. Restart Skales after creating the file.

## The API in one page

Base URL `http://localhost:3000`, but Skales walks ports 3000–3009, so check which one it took. Every route below except the last two needs `Authorization: Bearer <your token>`.

| Method | Path | Answers |
|---|---|---|
| POST | `/api/cli/chat` | SSE, `data: {"type":...}` frames: `text{content}`, `tool_call{tool,args}`, `tool_result{tool,result}`, `tool_error{tool,error}`, `done{sessionId}` |
| GET | `/api/cli/tools` | `{ tools: [{name, description, enabled}] }` |
| GET | `/api/cli/model` | `{ provider, model, baseUrl, enabled }` |
| PUT | `/api/cli/model` | `{ success, provider, model }` |
| GET | `/api/cli/memory` | `{ memories: [...], count }` — `extracted_at` is epoch ms, keywords are `relevance_keywords` |
| POST | `/api/cli/memory` | `{ success, memory }` |
| DELETE | `/api/cli/memory?id=` | `{ success, deleted }` |
| GET | `/api/cli/cron` | `{ jobs: [...], count }` — **`jobs`**, not `tasks` |
| POST | `/api/cli/cron` | body `{ name, schedule, task }`, answers `{ success, job }` |
| DELETE | `/api/cli/cron?id=` | `{ success }` — the query form; the path form has no DELETE |
| PATCH | `/api/cli/cron/{id}` | `{ id, enabled }` |
| POST | `/api/cli/cron/{id}/run` | `{ id, triggered_at, status }` |
| GET | `/api/cli/status` | app, version, provider, model, counts, uptime |
| GET | `/api/cli/sessions` | `{ sessions: [...], count }` — camelCase, epoch ms |
| GET | `/api/cli/sessions?id=` | `{ session: {...} }` |
| DELETE | `/api/cli/sessions?id=` | `{ success, deleted }` |
| GET/POST/DELETE | `/api/cli/mcp*` | list, add, test, start, stop, logs, remove |
| GET | `/api/cli/devkit-status` | `{ enabled, version }` — no auth |
| GET | `/api/cli/devkit-docs` | `{ content }` — this file — no auth |

Full request and response shapes: `docs/api-reference.md` in the DevKit repository.

## CLI

```bash
node cli/skales.js status
node cli/skales.js chat "summarize my day"
node cli/skales.js tools
node cli/skales.js cron
node cli/skales.js cron add nightly "0 3 * * *" "Tidy the workspace"
node cli/skales.js mcp list
```

The token comes from `SKALES_DEVKIT_TOKEN`, or from the same `devkit.json` the app reads. The base URL comes from `SKALES_URL`.

## Links

- Repository: <https://github.com/skalesapp/devkit>
- Discussions: <https://github.com/skalesapp/skales/discussions>
- Discover feed: <https://feed.skales.app>
