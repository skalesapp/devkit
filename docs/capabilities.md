---
summary: The honest map of what Skales Desktop can do, where each area's data lives, and which areas have no HTTP route at all.
read_when:
  - you need to know whether a Skales area is reachable over HTTP or only from its own window
  - you are answering what Skales can do and must not overstate the API surface
---

# Capabilities

The DevKit's seventeen `/api/cli/*` routes cover chat, tools, memory, sessions, models, scheduling and MCP. Skales Desktop 12.8.4 does considerably more than that, and until now none of it was written down here. This page is the honest map: what each area is, where its data lives, how you reach it, and — where that is the answer — that you cannot reach it over HTTP at all.

Two things are true of everything below:

- **There is no hosted Skales.** Every surface here runs inside a Skales Desktop process on a machine you control. Nothing works without the app running.
- **Most of it is not an API.** Skales is a desktop app, and most of these areas are driven by server actions from its own window, not by documented REST routes. Where a REST route exists it is named below. Where none exists, that is said plainly rather than glossed over.

## How to reach the non-DevKit API

Routes outside `/api/cli/*` do **not** accept the DevKit token. They sit behind the app's own gate and expect the app's API token:

```
x-skales-token: <token from Settings > Security > Remote access>
```

That gate is only armed when the token exists, which happens when remote access or swarm is enabled. Without it the server binds to `127.0.0.1` and only refuses requests that declare a foreign origin.

These routes are the app's internal surface. They change between releases without notice and carry no compatibility promise — the DevKit routes are the ones you can build against. Treat everything below as a description of what the app does, not as a stable contract.

---

## Agents

Named agent definitions: name, emoji, description, system prompt, optionally a fixed provider and model, a capability list, a tool list, and assigned skills. Usable from chat, from Skales Code, from a team run, and from the Organization surface.

**Where** — Sidebar → Agents (`/agents`). The same panel opens as a popup from the chat sidebar.

**Data** — `~/.skales-data/agents/definitions/<id>.json`, one file per agent; execution records under `agents/executions/`; the team roster in `agents/multitask-roster.json`.

**API** — one route, read-only: `GET /api/agents` → `{ agents: [...] }`. Creating, editing, deleting and running agents are server actions, not REST.

**Worth knowing**

- Nine agents are built in: coder, writer, analyst, planner, ceo, cto, marketing, researcher, pm. A definition file with the same id replaces the built-in.
- A team roster always starts with the default agent and holds at most six.
- An agent marked isolated runs without your facts, memory or knowledge graph, with an explicit tool allowlist and a workspace root inside the data directory. The allowlist and the workspace root only take effect in that mode.
- Subagents are a separate, closed set of roles. A model cannot pick an agent persona for a subtask; you list which of your agents may be used as subagents, and the model may only choose by name from that list.

## Autopilot

A task board with an interview, a master plan, kanban columns, and a background runner that works tasks autonomously.

**Where** — Sidebar → Cockpit (`/autopilot`). Optional; it follows the `autopilot` add-on.

**Data** — `tasks.json`, `autopilot_logs.json`, `user_profile.json` and `autopilot-cost-state.json` in the data directory; configuration lives in `settings.json` under `autopilotConfig`, with the on/off intent in `isAutonomousMode`.

**API**

| Route | Purpose |
|---|---|
| `GET /api/autopilot?resource=tasks\|logs\|profile\|status\|stats` | Read one slice. `logs` also takes `limit` and `taskId`. |
| `POST /api/autopilot` | `{ action, ...payload }` — add, edit and cancel tasks, draft and commit plans, approve and retry, toggle the runner, save config, resume after a cost pause. |
| `POST /api/autopilot/interview` | One interview turn. |
| `POST /api/autopilot/plan` | Generate a master plan. |
| `GET /api/autopilot/standup` | Daily standup report. |
| `GET /api/autonomous` | Runner status plus task counts by state. |
| `POST /api/autonomous` | `{ enabled: boolean }` — starts or stops the heartbeat. |

**Worth knowing**

- The heartbeat ticks every five minutes.
- `GET /api/autonomous` reports whether the heartbeat is alive. That is not the same as whether Autopilot is on: other features keep the heartbeat running with Autopilot off.
- `POST /api/autonomous` toggles the in-process heartbeat only. The persisted intent — the one that survives a restart — is set through `POST /api/autopilot` with `toggle_runner`.
- There is a spend guard with a calls-per-hour ceiling and a pause-after-N-tasks rule. A paused runner is resumed deliberately, with the `resume_cost_pause` action.

## Workflows

Reusable goal templates written by hand: a name, a trigger slug, an objective, ordered steps with optional tool hints, acceptance criteria, and typed parameters. Invoked from chat as `/goal-<trigger>`.

**Where** — the `/workflow` page exists and works, but its sidebar entry is parked, so today the route is reached by typing it. The add-on stays on and workflows already saved keep running.

**Data** — `~/.skales-data/workflows.json`.

**API** — one route, read-only: `GET /api/workflows` → `{ workflows: [...] }`. It answers 200 with an empty array on any error. Writing is a server action.

**Worth knowing** — at most 60 workflows; the trigger namespace is fixed to `goal-`; fourteen slugs are reserved (`goal`, `new`, `clear`, `model`, `stop`, `export`, `theme`, `help`, `killswitch`, `incognito`, `search`, `rag`, `projects`, `persona`, `workflow`). A workflow compiles to an objective brief with a Steps and a Done-when block; from there a run is an ordinary goal run.

## Skills

Two separate systems share one page. The page is called **Custom Skills**. There is no "Agent Skills" section in Settings, and `/skills` is the **Add-Ons** screen, which is something else again — those are feature switches.

### Agent Skills (SKILL.md)

Instruction text, no code. See [agent-skills.md](./agent-skills.md) for the format.

- Imported skills live in `~/.skales-data/agent-skills/<name>/SKILL.md`, with optional `scripts/` and `references/` folders beside it.
- The on/off state file lives **inside** `agent-skills/`, as `agent-skills-state.json`. It is opt-out: no file means everything is on.
- **28 skills ship built in**, read-only, gated by the same state file.
- Import from a GitHub URL, a local folder, or pasted text. A GitHub import takes at most 100 files and 2 MB, one level deep, and only from `scripts/` and `references/`.
- Two REST routes exist: `POST /api/agent-skills/fork` (paste a SKILL.md, max 48 KB) and `POST /api/agent-skills/generate` (have a model write one). There is no route to list, toggle or delete skills.

**Progressive disclosure** — while the combined body length of model-invocable skills stays under about 12,000 characters, every body goes into the prompt. Above that, the prompt carries a manifest of name and shortened description, plus the full body of any skill the message names. A `read_skill` tool loads a body on demand. Skills marked user-invoked never appear in the manifest; they enter only when a human names them.

### Custom Skills (JavaScript)

Executable skills, stored as `~/.skales-data/skills/<file>.js` with a `manifest.json` beside them. A custom skill can carry its own UI and then earns its own sidebar entry.

| Route | Purpose |
|---|---|
| `GET /api/custom-skills` | List with metadata |
| `PATCH /api/custom-skills?id=` | Toggle, or patch name/icon/category/description/menu entry |
| `DELETE /api/custom-skills?id=` | Remove |
| `GET /api/custom-skills/active` | The ones with a UI, for the sidebar |
| `POST /api/custom-skills/execute` | `{ skillId, input? }` |
| `POST /api/custom-skills/generate`, `/fix` | Have a model write or repair one; the result is syntax-checked and test-run before install |
| `POST /api/custom-skills/upload` | `.js`, `.ts` or `.zip`, base64 |
| `GET /api/custom-skills/export?skillId=` | ZIP with source and metadata |
| `POST /api/custom-skills/fork` | Fork one from the Discover feed |

There is no "Record a Skill" feature. A skill is written, generated, imported or forked.

## Skales Local

Models that run on your own machine, with the server included — no Ollama or LM Studio install required. The runtime is llama.cpp's server in router mode: one process pointed at a directory, one preset per `.gguf`.

**Where** — its own Settings tab; provider id `skales_local`, keyless.

**Data** — models in `~/.skales-data/local-models/`, flat, plus `installed.json`, `model-settings.json` and a catalog cache. The server binary, when not bundled, lands under `~/.skales-data/llama/<platform>-<arch>/`.

**Ports** — 8234, falling back through 8238. The port that was actually taken is written back into the provider's base URL, so the default `http://127.0.0.1:8234/v1` is a starting point, not a guarantee.

**Platform support** — macOS arm64 (Metal, CPU), macOS x64 (CPU only), Windows x64 and Linux x64 (Vulkan, CPU). No arm64 build for Windows or Linux.

**API** — `GET /api/skales-local` probes the server and reports what is reachable, what is installed, whether the binary is present, and which model covers which modality. Starting and stopping the server is not an HTTP operation; it is driven from the app. `GET|POST /api/skales-local/voice` manages local speech models. `/api/local-models` covers the catalogue, downloads (with an SSE progress stream), import from a file, a URL or an existing Ollama/LM Studio install, per-model settings, and what is currently loaded.

**Limits** — only `.gguf` files run on the llama runtime. A URL import without a checksum is marked unverified rather than refused.

## Skales IQ

A hosted provider with a free trial, provider id `skales_iq`, no API key.

Skales never talks to the upstream model directly: every call goes to the Skales relay, which holds the key and applies a per-user spending cap. **The upstream model is masked** — the provider and every `skales-iq*` model id render as "Skales IQ" everywhere, and the real model name never reaches the client.

**Entitlement** — the relay decides which modalities (chat, vision, image, video, music, tts, stt, embeddings) and which features are available, along with the remaining budget. Three rules hold: unknown means no; offline means the last known state; and your own API keys are never gated by this — the entitlement check only applies when the effective provider is Skales IQ.

**API** — `POST /api/skales-iq/activate` (requires an email and explicit consent), `GET /api/skales-iq/status`, `POST /api/skales-iq/reactivate`, `POST /api/skales-iq/forget` (erasure at the relay plus locally), `POST /api/skales-iq/speak`. The trial token is stored separately from `settings.json`.

## Iris

A voice-only surface: a particle field, an eye, and one line of text. No composer, no message list. The conversation is an ordinary Skales session — same file, same model, same tools — so anything heavy is handed off to the window that owns it.

**Where** — Sidebar → Iris (`/iris`). In the desktop app it opens in its own window. It follows the `iris` add-on, and the voice settings (TTS, STT, call mode) live in the Voice tab behind that add-on.

**API** — none of its own. Iris uses the shared speech routes: `POST /api/tts/say`, `POST /api/voice/transcribe`, `POST /api/voice/local-speak`, and Skales IQ's `speak` route when IQ provides the voice.

## Flow and Studio

Flow is the conversational design workspace: a prompt goes in, the Skales agent runs, real project files are written, and a live preview sits alongside. It is not a second agent loop — it binds the existing chat engine to a project folder with file edits pre-approved and shell and deploy still gated.

**Where** — Sidebar → Studio opens the Flow window, which also hosts Studio Classic and Lio. In a browser, `/studio/flow` renders on its own.

**Data** — projects under `~/.skales-data/workspace/projects/<id>/`, with versions content-addressed inside the project and a trash folder beside it. Brand kits in `~/.skales-data/brand/`.

**API** — `/api/flow` has exactly two routes, both GET, both for archived versions: one file out of a version, and a version as a ZIP. The live preview is served by `/api/code/preview/...`. Studio's own group is large (image, video, music, 3D, text, publishing, voice) and is driven from its window.

Needs the `studio` add-on.

## Buddy

An animated companion in a small frameless window. It runs the same multi-step agent loop the messaging channels use, in its own dedicated session rather than your active chat, with a persona and a daily transcript.

**Data** — `~/.skales-data/buddy-session.json` and one file per day under `~/.skales-data/buddy/`.

**API** — `POST /api/buddy-chat` for a turn, `/api/buddy-chat/approve` for pending tool calls, `/api/buddy-chat/open` to point the main window at the Buddy session, `GET|POST /api/buddy-memory` for the daily transcript, `GET /api/buddy-notifications` to drain the queue, and `/api/buddy-skins` for appearance.

Approving a tool call does not end the turn: the loop continues on its remaining budget.

## Skales Code and Codework

Two different surfaces.

**Skales Code** (`/code`) opens in its own window in the desktop app. It is explicitly not a second engine: a coding session is a chat session bound to a folder, using the same tools, modes and session store, with its own editor theme. `GET /api/ide/preview/...` serves a session folder so a preview iframe can load real relative assets; the `/api/code/` group covers build, plan, snapshot, checkpoint restore, preview, ZIP export and deploy configuration.

**Codework** (`/codework`) is the GUI for an autonomous coding agent — file tree, activity log, diff viewer, terminal. Its scope boundary is the chosen project folder. Its sidebar entry is parked, so the route exists but has no door; the add-on stays, because it also gates the Codework tools in chat. Routes: `POST /api/codework/run` (SSE), `/approve`, `/preview`, `/commit-message`. State under `~/.skales-data/codework/`.

## Obsidian

A vault is a folder read live, not a copy — every access hits the disk so Skales sees what Obsidian sees. There is deliberately no import step.

**Setup** — Settings → Integrations → Obsidian vaults. Stored in `settings.json` as `obsidianVaults` (a list of `{ path, alias }`) and `obsidianFormat` (folder, template, tag, filename pattern). Several vaults with aliases are supported.

**Tools** — `obsidian_list_vaults`, `obsidian_list_folder`, `obsidian_search` (supports `tag:name`), `obsidian_read` run without confirmation; `obsidian_create_note` and `obsidian_append_to_note` ask first.

**Limits** — up to 5000 notes per vault, 2 MB per note body; hidden folders and `node_modules` are never entered. Writing is limited to the harmless pair: **create new** and **append**. Nothing is ever overwritten — a create against an existing file is refused with a pointer to append.

Wiki links are resolved including aliases, headings, block ids and embeds; links inside code blocks are ignored, and unresolved targets are reported as unresolved rather than guessed.

**API** — none. Access runs through server actions used by the Memory page and the settings card.

## Teams, Swarm and A2A

Three different mechanisms, often confused.

**Teams** (`/team`) is a messenger between two Skales desktops. They pair over the existing end-to-end encrypted relay with a six-digit code; afterwards both the people and the agents on either side can talk, and a shared plan sits between them. Conversations are stored per peer under `~/.skales-data/teams/`, capped at 500 messages each. There is **no HTTP API**; everything is server actions. Off by default.

**Swarm** (`/swarm`) is LAN delegation to other Skales instances, discovered over mDNS or added by `IP:port`. Off by default.

| Route | Notes |
|---|---|
| `GET /api/swarm/ping` | No auth. Reports hostname, name, version, platform — nothing else. |
| `POST /api/swarm/execute-task` | Three gates: accepting delegations must be switched on, a shared agent secret must be configured, and the caller must present it. Fails closed. A delegated task cannot delegate onward. |
| `POST /api/swarm/connect-peer` | Add or remove a manual peer. |
| `GET\|POST /api/swarm/history` | Last 100 entries, persisted. |
| `POST\|GET /api/swarm/task-result` | Result drop-off and polling. **In memory only** — results do not survive a restart. |

Turning Swarm on binds the server to all interfaces, which also arms the API token gate for every other route.

**A2A** is this instance answering as an Agent2Agent-speaking agent, so a foreign agent can discover and task it. There is no page for it; it is configured in Settings and off by default, with a token generated on first activation.

- `GET /api/a2a/agent-card` — the discovery document. With A2A off it answers **404**, not 403: the instance simply stays invisible.
- `POST /api/a2a/message` — accepts a plain `text`, or an A2A message with text parts. 401 with a `WWW-Authenticate` header on a bad token, 429 with `Retry-After` when rate-limited.

Limits: 20 calls per minute, input capped at 16,000 characters, and **text only** — no tools, no files, no shell for external callers. Machine actions stay behind the app's own UI. A2A is also not carved out of the app's middleware, so with remote access enabled a caller needs both the app token and the A2A token.

## WordPress

Skales talks to a WordPress site through the [Skales Connector plugin](https://github.com/skalesapp/wordpress), not through the WordPress REST API directly. Desktop 12.8.4 carries 47 WordPress tools covering posts, pages, media, terms, comments, menus, widgets, theme and global styles, settings and permalinks, blocks, site inventory, Elementor, WooCommerce products, SEO fields and cache clearing.

Authentication is a bearer token issued by the plugin. The desktop tools and the plugin routes are paired one-to-one and machine-checked, but the plugin version matters: a site on an older connector will not have the newer routes, and those tools will fail with a route-not-found error from WordPress.

## What the DevKit does not cover

No CLI command and no DevKit endpoint exists for: agents, autopilot, workflows, custom skills, agent skills, Skales Local, Skales IQ, Iris, Flow, Studio, Buddy, Skales Code, Codework, Obsidian, Teams, Swarm, A2A or WordPress. Everything above is reached from the app, from its own API behind `SKALES_API_TOKEN`, or not over HTTP at all.

That is a statement of scope, not a roadmap. If you need one of these from outside the app, say so in [GitHub Discussions](https://github.com/skalesapp/skales/discussions) — a DevKit route is worth building when someone is actually building against it.
