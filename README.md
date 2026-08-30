# Skales DevKit

Developer tools, documentation, and examples for building with [Skales](https://skales.app), the local-first AI desktop agent.

DevKit **v0.5.0** · requires Skales Desktop **v12.5.2 or later** · verified against **v12.8.4** · Node.js 18+ · MIT License

## Read this first: the DevKit lives in the app now

The DevKit is shipped **inside Skales Desktop** as an add-on, and the app writes
it out for you with a working token. That is the route to take. This repository
is kept readable so existing links and checkouts keep working, but it is no
longer where the DevKit is developed, and it can be behind the copy in your app.

The CLI installs as **`skales-dev`**. The plain `skales` command belongs to the
app's own launcher, which opens a folder in Skales Code; this one talks to an
app that is already running. Invoking it as `node cli/skales.js ...`, which is
what most of this README does, is unaffected.

## Ships inside Skales Desktop

From **Skales Desktop v12.9.10** onwards you do not have to fetch this repository at all: a copy of the DevKit is bundled with the app, and three clicks set it up with a token already filled in.

1. **Settings → Add-Ons → DevKit.** The add-on is off by default, so switch it on. A **Developer** section appears in the sidebar.
2. **Developer → DevKit.** The page opens with a **Set up DevKit** card.
3. **Press the button.** The app writes `~/.skales-data/devkit/` out of its own copy — the `cli/` folder, `docs/`, `examples/`, `DEVKIT.md`, `README.md`, `LICENSE`, and a `devkit.json` that is switched on and carries a fresh API token. The card names the exact path it wrote.

Nothing is overwritten. A devkit that is already there is left alone and a token that already exists is never replaced, so pressing the button twice is safe and a program you already handed the token to keeps working. Switching the add-on back off only puts the sidebar section away; the folder stays where it is.

The manual route below still works, and it is the one to use on an older Skales, on a source checkout, or when you want the newest DevKit rather than the one your app version shipped with. The bundled copy is a snapshot of this repository at the app's release, so it can be behind what you are reading here.

## What's New in v0.5.0

- **Three broken CLI commands work.** `skales cron` read the wrong key and always reported no tasks; `skales cron add` sent the wrong field names and always answered 400; `skales cron remove` never fell back, because the path form answers 405 rather than 404. All three are fixed against the contract the app actually serves.
- **The setup guide no longer produces an unreadable config.** It told you to put `token` at the top level of `devkit.json`. The app reads `api.token`, so every call answered 500.
- **The API reference describes the real payloads.** v0.4.0 verified that every path and method existed. It did not verify what came back — and chat SSE, sessions, memory, cron, `devkit-status` and `devkit-docs` were all documented in shapes the app has never sent.
- **`mcp-servers.json` is documented correctly.** It is an array under `servers`, not an object map under `mcpServers`. A file written to the old documentation loaded zero servers, silently.
- **New: [Capabilities](docs/capabilities.md).** Agents, autopilot, workflows, skills, Skales Local, IQ, Iris, Flow, Buddy, Skales Code, Codework, Obsidian, Teams, Swarm, A2A, WordPress — what they are, where their data lives, and where there is honestly no API to call.
- **New: `DEVKIT.md`.** The app's Developer → Docs tab renders this file from your devkit folder. The repository never shipped one, so that tab read "not found" for everyone.
- **The content docs match 12.8.4.** 26 providers instead of 11, 257 tools instead of "60+", Custom Skills instead of "Agent Skills", the retired GitHub integration no longer advertised, dead links removed.

## What's New in v0.4.0

- **`skales mcp start <name>` and `skales mcp stop <name>`.** Both endpoints have existed in Desktop since v10.1.0; the CLI never called them and the API reference never listed them.
- **The API reference tells the truth about tokens.** It used to send you to a "Settings, DevKit, Generate Token" button that does not exist. The token is a value you choose and write into `devkit.json`, and the reference now says so, names both credentials `/api/cli/*` accepts, and explains why that route is outside the app's middleware gate.
- **`GET /api/cli/mcp/{name}` is documented**, including the warning that its response carries the server's `env` block.
- **The stale "MCP endpoints are forward-looking" note is gone.** They ship since Desktop v10.1.0.
- **Endpoint audit against Desktop v12.7.1.** Every path in the reference exists in the app, with the methods documented. Nothing in the docs is aspirational any more.

## What's New in v0.3.0

- **DevKit works on a normal installed app.** The installer does not ship a `devkit/` folder and its install directory is read-only, so the old "put `devkit.json` in the installation folder" instruction never worked on a shipped app. Desktop v12.5.2 and this CLI both read it from `~/.skales-data/devkit/` instead.
- **The local API is actually authenticated.** A gate on the internal `/api/cli/*` route accepted any non-empty token. Desktop v12.5.2 closes it — update the app so the CLI authenticates for real.
- **`SKALES_DEVKIT_TOKEN`** supplies the token with no config file, for scripts and CI. **`SKALES_DEVKIT_CONFIG`** points at a specific `devkit.json`.
- **A missing config prints where it looked** and how to fix it, instead of a bare error.
- **Scheduled-task control works.** `PATCH /api/cli/cron/{id}` (pause / resume) and `POST /api/cli/cron/{id}/run` (fire now) have been in the API reference since v0.2.0 and answered 404 on every Desktop version, because neither had been built. They exist as of Desktop v12.5.7.

## What's Inside

- **[API Reference](docs/api-reference.md)** — Full REST API for chat, tools, memory, sessions, and scheduling
- **[Agent Skills](docs/agent-skills.md)** — Create and share SKILL.md files compatible with Claude Code, Codex, Copilot, and Cursor
- **[MCP Servers](docs/mcp-servers.md)** — Model Context Protocol setup and templates
- **[Provider Guides](docs/providers.md)** — Setup for all 26 AI providers (Ollama, LM Studio, Skales Local, OpenRouter, OpenAI, Anthropic, Google, and more)
- **[Integration Docs](docs/integrations.md)** — Notion, Todoist, Spotify, Google Drive, Home Assistant, Telegram, Discord, Obsidian, WordPress, and more
- **[Migration Guide](docs/migration.md)** — Import from ChatGPT, Claude, GitHub Copilot Chat, Gemini, Cherry Studio, AionUi, Hermes, OpenClaw
- **[Capabilities](docs/capabilities.md)** — What Skales does beyond the DevKit surface, and how much of it is reachable from outside the app
- **[Example Skills](examples/skills/)** — Ready-to-use SKILL.md templates
- **[Architecture Overview](docs/architecture.md)** — How Skales works under the hood

## Quick Start

1. Download [Skales](https://skales.app). **v12.5.2 or later** is required; scheduled-task pause, resume and run-now need **v12.5.7**.
2. On **v12.9.10 or later**: switch DevKit on under Settings → Add-Ons, then press **Set up DevKit** on the Developer → DevKit page. You are done.
3. On anything older, or by hand: put a `devkit/devkit.json` in your Skales data directory (see below) and restart Skales. The Developer section appears in the sidebar.

See the [Getting Started Guide](docs/getting-started.md) for detailed setup.

## Enable DevKit by hand

This is the manual route. On Skales Desktop v12.9.10 and later the **Set up DevKit** button writes all of it for you — see [Ships inside Skales Desktop](#ships-inside-skales-desktop) above.

Create a `devkit/` folder in your Skales **data directory** and add a `devkit.json`. The data directory is writable, which the app's install folder is not, so this is the one location that works on a normal install.

| Platform | Path |
|----------|------|
| macOS / Linux | `~/.skales-data/devkit/devkit.json` |
| Windows | `%USERPROFILE%\.skales-data\devkit\devkit.json` |

```json
{
  "enabled": true,
  "version": "0.5.0",
  "api": {
    "enabled": true,
    "token": "your-secret-token"
  },
  "cli": {
    "enabled": true
  }
}
```

Pick your own value for `token` and keep it private (it authenticates the CLI). The token must sit at `api.token` — a top-level `token` is not read, and every call then answers 500. Restart Skales; the Developer section appears in the sidebar, once the DevKit add-on is on (v12.9.10 and later: Settings → Add-Ons → DevKit; before that the section needed no add-on).

The CLI reads the same file, so the token matches automatically. You can also pass it as `SKALES_DEVKIT_TOKEN` instead of a file.

Copy `DEVKIT.md` into the same folder to fill the app's Developer → Docs tab:

```bash
cp DEVKIT.md ~/.skales-data/devkit/
```

The app binds the first free port between 3000 and 3009. If the CLI reaches nothing, set `SKALES_URL` to the port it actually took.

## CLI

The DevKit includes a standalone CLI for interacting with Skales from your terminal. Requires Node.js 18+ and zero npm dependencies.

```bash
cd cli/
node skales.js chat            # Interactive chat
node skales.js chat "Hello"    # One-shot message
node skales.js tools           # List available tools
node skales.js model           # Show current model
node skales.js status          # System status
node skales.js memory          # Browse memories
node skales.js sessions        # List chat sessions
node skales.js mcp                     # List configured MCP servers
node skales.js mcp test filesystem     # Test an MCP server connection
node skales.js cron                    # List scheduled tasks
node skales.js cron add daily "0 9 * * *" "Summarize yesterday's activity"
node skales.js cron remove <id>        # The id comes from 'cron' or 'cron add'
```

`skales migrate --from hermes|openclaw` also exists. It is a local convenience that reads those two tools' files and writes memories and settings straight into the data directory — it is not a front end for the app's importer, and it does not carry over skills or API keys. To import a conversation history, use **Settings → Advanced → Migrate** in the app.

## Agent Skills (SKILL.md)

Skales supports the open SKILL.md format. Skills are portable text files that teach the AI agent how to perform specific tasks.

```
my-skill/
└── SKILL.md
```

```markdown
---
name: My Custom Skill
description: What this skill does
version: 1.0.0
---

# Instructions

Your skill instructions here. The AI agent follows
these when the skill is active.
```

Import in Skales on the **Custom Skills** page: a GitHub URL, a local folder, or pasted text. Only `name` and `description` are required in the frontmatter — see [agent-skills.md](docs/agent-skills.md) for the fields Skales actually reads.

28 skills ship built in.

### Skill Sources

- [Anthropic Official Skills](https://github.com/anthropics/skills)
- [Community Skills (1000+)](https://github.com/VoltAgent/awesome-agent-skills)
- [Skills Catalog (58K+)](https://claude-plugins.dev)

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/getting-started.md) | Enable DevKit and first steps |
| [API Reference](docs/api-reference.md) | REST API with curl examples |
| [Agent Skills](docs/agent-skills.md) | Create, import, and share skills |
| [MCP Servers](docs/mcp-servers.md) | External tool integration |
| [Providers](docs/providers.md) | AI provider setup |
| [Integrations](docs/integrations.md) | Third-party service setup |
| [Migration](docs/migration.md) | Import from other tools |
| [Capabilities](docs/capabilities.md) | What the DevKit does not cover, and why |
| [Architecture](docs/architecture.md) | How Skales works internally |

## Links

- [Skales App](https://skales.app)
- [Skales GitHub](https://github.com/skalesapp)
- [Skales Plugins](https://github.com/skalesapp/plugins) — community plugin registry: list your plugin, or install one from any repository
- [Discussions](https://github.com/skalesapp/skales/discussions)
- [Discover Feed](https://feed.skales.app)

## License

MIT. See [LICENSE](LICENSE) for the full text.

Skales Desktop itself is BSL-1.1 (converts to Apache 2.0 in 2030). The DevKit is MIT so integrations, forks, and commercial work built on top have maximum freedom.

Built by [Mario Simic](https://github.com/skalesapp), Vienna.
