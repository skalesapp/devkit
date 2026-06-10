# Skales DevKit

Developer tools, documentation, and examples for building with [Skales](https://skales.app), the local-first AI desktop agent.

Compatible with Skales Desktop **v10.0.3 - v11.2.7** (v11.2.7 verified) · DevKit v0.2.0 · Node.js 18+ · MIT License

## What's New in v0.2.0

- **CLI MCP Commands** — list, test, add, remove, and inspect logs for MCP servers from the terminal
- **CLI Scheduled Tasks** — manage cron jobs via `skales cron` subcommands
- **License changed to MIT** — full freedom for commercial integrations and forks
- **Desktop compatibility** — v10.0.3 and later, verified through v11.2.7
- **API reference expanded** — MCP, DevKit status, DevKit docs, and Scheduled Task control endpoints documented
- **CLI versioned independently** — `cli/package.json` added

## What's Inside

- **[API Reference](docs/api-reference.md)** — Full REST API for chat, tools, memory, sessions, and scheduling
- **[Agent Skills](docs/agent-skills.md)** — Create and share SKILL.md files compatible with Claude Code, Codex, Copilot, and Cursor
- **[MCP Servers](docs/mcp-servers.md)** — Model Context Protocol setup and templates
- **[Provider Guides](docs/providers.md)** — Setup for 11+ AI providers (Ollama, LM Studio, OpenRouter, OpenAI, Anthropic, Google, and more)
- **[Integration Docs](docs/integrations.md)** — Notion, Todoist, Spotify, GitHub, Google Drive, Home Assistant, Telegram, Discord, and more
- **[Migration Guide](docs/migration.md)** — Import from ChatGPT, Claude, Copilot, Gemini, Hermes, OpenClaw
- **[Example Skills](examples/skills/)** — Ready-to-use SKILL.md templates
- **[Architecture Overview](docs/architecture.md)** — How Skales works under the hood

## Quick Start

1. Download [Skales](https://skales.app)
2. Create a `devkit/` folder in your Skales data directory (see below)
3. Restart Skales — under Settings → Skills, a **DevKit** toggle appears
4. Enable it. The Developer section appears in the sidebar.

See the [Getting Started Guide](docs/getting-started.md) for detailed setup.

## Enable DevKit

Create a `devkit/` folder in your Skales data directory:

| Platform | Path |
|----------|------|
| macOS / Linux | `~/.skales-data/devkit/` |
| Windows | `%APPDATA%/skales/devkit/` |

Add a `devkit.json` configuration file:

```json
{
  "enabled": true,
  "version": "0.2.0",
  "api": {
    "enabled": true,
    "token": "your-secret-token"
  },
  "cli": {
    "enabled": true
  }
}
```

Restart Skales. The Developer section appears in the sidebar.

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
node skales.js migrate --from hermes   # Import from Hermes
node skales.js mcp                     # List configured MCP servers
node skales.js mcp test filesystem     # Test an MCP server connection
node skales.js cron                    # List scheduled tasks
node skales.js cron add daily "0 9 * * *" "Summarize yesterday's activity"
```

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

Import in Skales: **Settings → Agent Skills → Import** → paste a GitHub URL or local folder path.

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
| [Architecture](docs/architecture.md) | How Skales works internally |

## Links

- [Skales App](https://skales.app)
- [Skales GitHub](https://github.com/skalesapp)
- [Discover Feed](https://skales.app/discover)

## License

MIT. See [LICENSE](LICENSE) for the full text.

Skales Desktop itself is BSL-1.1 (converts to Apache 2.0 in 2030). The DevKit is MIT so integrations, forks, and commercial work built on top have maximum freedom.

Built by [Mario Simic](https://github.com/skalesapp), Vienna.
