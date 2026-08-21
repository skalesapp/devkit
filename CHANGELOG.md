# Skales DevKit Changelog

All notable changes to the Skales DevKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).


## v0.5.0 - 2026-08-22

Audited against Skales Desktop v12.8.4. v0.4.0 checked paths and methods; this
release checks the payloads behind them. Three CLI commands were broken by that
gap, and the setup guide produced a config file the app could not read.

### Fixed

- `skales cron` listed nothing, ever. It read `data.tasks`; the route answers `{ jobs, count }`. It now reads `jobs`, prints the id each subcommand needs, and shows the human-readable schedule the route sends along.
- `skales cron add` always answered 400. It sent `{id, schedule, prompt}`; the route requires `{name, schedule, task}`. The command is now `skales cron add <name> "<schedule>" "<task>"`, takes an optional `--agent <id>`, and prints the id Skales assigned.
- `skales cron remove` always failed with "Unknown error". `/api/cli/cron/{id}` carries no DELETE handler, so Next answers 405, not 404, and the fallback to the query form never fired. It now falls through on 405 as well, and reports an unknown id honestly instead of claiming success — deletion answers 200 with `success: false` when nothing matched.
- `skales cron enable`, `disable` and `run` claimed Desktop did not support them. They have shipped since v12.5.7; a 404 from these routes now means the id does not exist, and the message says so.
- `skales mcp add` refused the `examples/mcp/example-server.json` shipped in this repository, because the file is an array and the route upserts one server per call. The command now accepts a single object, an array, or `{ "servers": [...] }`.
- `getting-started.md` produced a `devkit.json` with `token` at the top level and a `features` block the app does not read. The app reads `api.token`; a top-level token means every call answers 500. The guide now documents what the app actually reads and what it ignores.
- `SKALES_TOKEN` appeared in the docs and both example scripts. The CLI reads `SKALES_DEVKIT_TOKEN`; nothing reads `SKALES_TOKEN`.
- `mcp-servers.md` documented `~/.skales-data/mcp-servers.json` as an object map under `mcpServers`. Skales reads an **array** under `servers`, and falls back to an empty list without complaint — a file written to the old documentation loaded zero servers. Every example in that page is corrected, and the invented `loadOn`, nested-group and primary/fallback shapes are gone.
- The chat SSE contract was wrong in every detail: it described named `event:` lines and `tool_call {id,name,args}`, `done {usage}`. The stream carries only `data:` lines with a `type` field; the fields are `tool`, `args`, `result`; there is a `tool_error` type; and `done` carries the session id and nothing else.
- `devkit-status` and `devkit-docs` were documented with responses the app has never sent. `devkit-status` answers `{ enabled, version }`. `devkit-docs` answers `{ content }` — the text of a `DEVKIT.md` in your devkit folder, not a list of documents.
- Response shapes corrected throughout: memory (`extracted_at` is epoch ms, `relevance_keywords`, `{success, memory}`), sessions (camelCase, epoch ms, a `{session}` wrapper), status (`author`, `homepage`, `timestamp`, and `tools_count` coming from `capabilities.json` rather than the tool registry), `PUT /api/cli/model` (no `message`), deletes (`{success, deleted}`), `POST /api/cli/mcp` (201, `http` transport, `headers`).
- The auth section claimed `/api/cli/*` accepts `x-skales-token` throughout. Only the MCP family does; every other route takes the DevKit bearer token alone.
- The port is documented as a range. Skales walks 3000–3009 and binds the first free one, which makes `SKALES_URL` the first thing to check, not a footnote.
- `curl -X POST` on `/api/cli/status`, which answers 405. It is a GET.
- Dead `community.skales.app` links, in three places.
- "Settings → DevKit → Log Level → Debug", in two places. There is no such setting.

### Added

- **`docs/capabilities.md`** — what Skales Desktop 12.8.4 does beyond the DevKit surface: agents, autopilot, workflows, skills, Skales Local, Skales IQ, Iris, Flow and Studio, Buddy, Skales Code and Codework, Obsidian, Teams, Swarm, A2A and WordPress. Each one with its data location, its routes where they exist, and a plain statement where none does. A DevKit that reaches 17 of about 100 route groups and says so is more useful than one that stays quiet about it.
- **`DEVKIT.md`** — the file `Developer → Docs` renders. The repository never shipped one, so anyone following the README saw "not found" on that tab permanently. Copy it into `~/.skales-data/devkit/`.
- MCP configuration gained the `http` transport, the `oauth` flag, and the per-server `timeoutMs`, all of which the app has supported and none of which were written down.

### Changed

- `providers.md`: 11 providers to **26**, with the model names the app actually offers. It was recommending GPT-4o, o1, Claude Sonnet 4, Gemini 2.5 and Grok 2. LM Studio is its own provider, not an example under "Custom".
- `architecture.md`: 60+ tools to **257**, with the real categories and the real safety levels. Tool gating runs through **add-ons**, not skills. The three adapter files it described do not exist, the orchestrator path was wrong, memory is one JSON file per memory rather than `personality.md` and friends, and the update channels and five-minute auto-rollback were never real.
- `agent-skills.md`: the surface is called **Custom Skills** and is a page, not a settings section; `/skills` is **Add-Ons**. The state file lives inside `agent-skills/` and is opt-out. `version` and `metadata.compatible_with` are declared Required and Read in the old text; neither is read at all. Adds the 28 built-in skills, progressive disclosure and `read_skill`, and the paste, generate and fork import paths.
- `integrations.md`: the GitHub integration is retired in the app and is no longer advertised as available; add-on gating is explained; the integrations that existed but went unmentioned are listed.
- `migration.md`: adds Cherry Studio, AionUi and Markdown; "Microsoft Copilot" is GitHub Copilot Chat; Hermes is a SQLite file and OpenClaw a `.jsonl` bundle, not directories; the unimplemented promises about mapping API keys and carrying over skills are gone; Migrate lives in the **Advanced** tab.
- The CLI version is one number again. `cli/package.json` said 0.3.0 while the binary reported 0.4.0.

### Compatibility

- Requires Skales Desktop v12.5.2 or later. Scheduled-task pause, resume and run-now need v12.5.7. Verified against v12.8.4.


## v0.4.0 - 2026-08-09

Audited against Skales Desktop v12.7.1. Every documented endpoint was checked
against the routes the app actually registers.

### Added

- `skales mcp start <name>` and `skales mcp stop <name>`. `POST /api/cli/mcp/{name}/start` and `/stop` have been in Desktop since v10.1.0, but no CLI command called them and the API reference did not list them.
- `GET /api/cli/mcp/{name}` documented, with a note that the response includes the server's `env` block and should be treated as a secret.

### Fixed

- The API reference told you to get your token from "Settings, DevKit, Generate Token". No such button exists. The token is a value you pick and write into `devkit.json` in `~/.skales-data/devkit/`, and the reference now shows the file.
- The authentication section now names both credentials `/api/cli/*` accepts (the DevKit bearer token, and `x-skales-token` checked against `SKALES_API_TOKEN`), and says why that route sits outside the app's middleware gate.
- Removed the note calling the MCP management endpoints "forward-looking". They have shipped since Desktop v10.1.0.

### Compatibility

- Requires Skales Desktop v12.5.2 or later. Scheduled-task pause, resume and run-now need v12.5.7. Verified against v12.7.1.


## v0.3.0 - 2026-07-20

Aligned with Skales Desktop v12.5.2. DevKit now works on a normal installed app.

### Fixed

- DevKit is reachable on a packaged install. The installer does not ship the `devkit/` folder and its install directory is read-only, so the previously documented "put `devkit.json` in the installation folder" never worked on a shipped app. Skales Desktop v12.5.2 and this CLI both read `devkit.json` from `~/.skales-data/devkit/` (the writable data dir), so enabling DevKit no longer requires a dev checkout.
- A local `/api/cli/*` request no longer passes without a valid token. A gate on the internal command route accepted any non-empty token; Skales Desktop v12.5.2 closes it. Update the desktop app so the CLI authenticates for real.

### Added

- The CLI looks for `devkit.json` in `~/.skales-data/devkit/` first (matching the app), then the repo layout for a dev checkout.
- `SKALES_DEVKIT_TOKEN` supplies the token with no config file, for scripts and CI.
- `SKALES_DEVKIT_CONFIG` points at a specific `devkit.json`.
- A missing config now prints where it looked and how to fix it, instead of a bare error.

### Compatibility

- Requires Skales Desktop v12.5.2 or later for the data-dir config and the closed auth gate. Earlier desktops still work if a `devkit.json` sits in the install folder they were built to read.


## v0.2.1 — 2026-06-10

Compatibility release for Skales Desktop v11.2.7 "Reliance".

### Fixed

- CLI access works again on protected setups: Skales Desktop v11.2.7 restores the DevKit CLI route access that the remote API protection (introduced desktop-side) had blocked. Update Skales Desktop to v11.2.7 or later for CLI use.
- Documentation corrected: DevKit is enabled via `devkit.json` in the Skales installation folder (the previously documented Settings toggle and token generator do not exist), and the install-path table now points to the installation folder instead of the data directory.
- The `cron enable/disable/run` subcommands now state honestly that Skales Desktop does not support them yet, instead of claiming they need v10.1+.

### Compatibility

- Verified against Skales Desktop v11.2.7. Earlier desktops from v10.0.3 keep working for everything except the v11-only surfaces.


## v0.2.0 — 2026-04-28

Aligned with Skales Desktop v10.1.0 "Design" release. No new CLI commands or breaking API changes in this version.

### Compatibility

- Skales Desktop v10.0.3+ (DevKit needs the MCP management backend introduced in v10.0.3).
- Skales Desktop v10.1.0 fully supported with the same API surface.


## v0.2.0 — Initial DevKit Release

- CLI MCP commands (list, test, add, remove, logs).
- CLI Scheduled Tasks via `skales cron` subcommands.
- License changed to MIT.
- Desktop compatibility pinned to v10.0.3+.
- API reference expanded for MCP, DevKit status, DevKit docs, and Scheduled Task control endpoints.
- CLI versioned independently via `cli/package.json`.
