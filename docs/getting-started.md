---
summary: The path from a fresh Skales install to a working CLI and a first successful API call.
read_when:
  - a developer is setting up the DevKit for the first time
  - you need the system requirements or the minimum Skales version for a DevKit feature
---

# Getting Started with Skales DevKit

This guide takes you from a fresh Skales install to a working CLI and a first API call.

## System Requirements

- **Operating System**: macOS 11+, Windows 10+, or Linux (Ubuntu 20.04+, Fedora 33+)
- **Skales Desktop**: v12.5.2 or later (scheduled-task pause, resume and run-now need v12.5.7)
- **Node.js**: 18 or higher, for the CLI
- **Disk Space**: about 500MB for Skales

Check your Node.js version:

```bash
node --version
```

## 1. Install Skales

Download the installer for your platform from [skales.app](https://skales.app), run it, and launch the app once so it creates its data directory.

## 2. Enable DevKit

**On Skales Desktop v12.9.10 or later, skip this section.** The app carries its own copy of the DevKit: switch **DevKit** on under Settings → Add-Ons, open **Developer → DevKit**, and press **Set up DevKit**. It writes everything below for you, token included, and overwrites nothing that is already there. Come back here if you are on an older Skales, are running a source checkout, or want a newer DevKit than the one your app shipped with.

DevKit is switched on by a single file: `devkit.json` inside a `devkit/` folder in the Skales **data directory**.

| Platform | Path |
|----------|------|
| macOS / Linux | `~/.skales-data/devkit/devkit.json` |
| Windows | `%USERPROFILE%\.skales-data\devkit\devkit.json` |

The data directory is the only location that works on a normal install: the installer does not ship a `devkit/` folder, and the install directory is read-only. Setting `SKALES_DATA_DIR` moves the whole data directory, and `devkit/` moves with it.

```bash
mkdir -p ~/.skales-data/devkit
```

Then write `~/.skales-data/devkit/devkit.json`:

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

Pick your own value for `token`. It is not generated anywhere in the app — there is no "Generate Token" button — and it is the credential the CLI and every `/api/cli/*` call present as `Authorization: Bearer <token>`. Keep it private and out of version control.

Restart Skales. The **Developer** section appears in the sidebar, the top navigation and the icon rail.

### What the app actually reads

| Key | Read by the app | Effect |
|-----|-----------------|--------|
| `enabled` | yes | The whole gate. `false` or a missing file means every `/api/cli/*` route answers **403 DevKit not enabled** and the Developer section stays hidden. |
| `api.token` | yes | The Bearer token. Missing or empty means **500 DevKit token not configured** — the file exists, so the gate opens, but there is nothing to compare against. |
| `version` | yes | Reported back by `GET /api/cli/status` (`devkit_version`) and `GET /api/cli/devkit-status`. Cosmetic. |
| `api.enabled`, `cli.enabled`, `features.*` | no | Part of the config shape, not consulted at runtime. Nothing turns off by setting them to `false`. |

The token lives at `api.token`, **not** at the top level. A top-level `token` is read as "no token configured" and every call answers 500.

`SKALES_DEVKIT=1` in the environment forces `enabled` on for a dev run, but the token still has to come from the file.

## 3. What Appears After Setup

The **Developer** section holds three surfaces:

- **API Playground** — call the DevKit endpoints from inside the app
- **Debug Panel** — the same memory, session, tool and status readers the REST routes serve, so the two can never disagree
- **Docs** — renders `DEVKIT.md` from your `devkit/` folder. It is a viewer for a file you supply; with no `DEVKIT.md` next to your `devkit.json` it shows a placeholder. Copying this repository's `DEVKIT.md` there fills it.

## 4. Use the CLI

The CLI is a single zero-dependency file in this repository, `cli/skales.js`. It is not installed into the data directory by anything — run it from your clone.

```bash
git clone https://github.com/skalesapp/devkit
cd devkit/cli
node skales.js status
```

It finds your token in this order:

1. `SKALES_DEVKIT_TOKEN` (environment)
2. `SKALES_DEVKIT_CONFIG` (path to a specific `devkit.json`)
3. `~/.skales-data/devkit/devkit.json` — the same file the app reads
4. `../devkit.json`, relative to `cli/`, for a dev checkout

The variable is `SKALES_DEVKIT_TOKEN`. `SKALES_TOKEN` is not read by anything.

```bash
node skales.js chat "summarize my day"   # one-shot message
node skales.js chat                      # interactive session
node skales.js tools                     # list the tools the agent can call
node skales.js cron                      # list scheduled tasks
```

`node skales.js help` prints the full command list.

## 5. Your First API Call

`GET`, not `POST` — `/api/cli/status` exports only a GET handler and answers 405 to anything else.

```bash
curl http://localhost:3000/api/cli/status \
  -H "Authorization: Bearer your-secret-token"
```

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

`tools_count` counts the entries in `capabilities.json` in the data directory, which is a self-description file the app maintains — it is not the number of tools the agent can call. `GET /api/cli/tools` is the honest count.

### The port is not always 3000

Skales walks **3000 to 3009** and binds the first free port, so a second instance or any other process on 3000 moves it. If a call or the CLI reaches nothing, check the port before anything else and point both at the right one:

```bash
export SKALES_URL=http://localhost:3001
```

This is the first thing to check, not a footnote.

## Data Storage

```
~/.skales-data/
├── devkit/
│   ├── devkit.json          # DevKit config and token
│   └── DEVKIT.md            # optional, rendered by Developer > Docs
├── settings.json            # provider, model, and app settings
├── memories/                # one JSON file per memory
├── sessions/                # one JSON file per chat session
├── agent-skills/            # custom skills, one folder per skill
├── agents/                  # agent definitions
├── mcp-servers.json         # MCP server configuration
└── cron/                    # scheduled tasks, one JSON file each
```

Never commit this directory: it holds your API keys and the DevKit token.

## Troubleshooting

### The Developer section does not appear
On v12.9.10 and later, check the add-on first: Settings → Add-Ons → **DevKit**. It is off by default, and with it off the section is hidden no matter what `devkit.json` says. Switching it back off later never deletes the folder.

Otherwise, quit and relaunch Skales completely. The config is cached for 10 seconds inside a running app, but the sidebar reads its state on navigation, so a full restart is the reliable path. Check that the file is valid JSON — a parse error is silently treated as "no DevKit".

### 403 `DevKit not enabled`
`devkit.json` is missing, is not at `~/.skales-data/devkit/devkit.json`, or does not have `"enabled": true`.

### 500 `DevKit token not configured`
The file was found but `api.token` is empty or missing. The usual cause is a token written at the top level instead of inside `api`.

### 401 `Invalid DevKit token`
The token presented does not match `api.token`. Compare the two, and remember the CLI reads `SKALES_DEVKIT_TOKEN` first — a stale value there wins over the file.

### The CLI cannot connect
Skales is not running, or it is not on the port you are calling. See "The port is not always 3000" above.

### Permission denied on devkit.json
```bash
chmod 755 ~/.skales-data/devkit
chmod 644 ~/.skales-data/devkit/devkit.json
```

## Next Steps

- [API Reference](./api-reference.md) — every endpoint with its real request and response shape
- [Capabilities](./capabilities.md) — what Skales can do beyond the DevKit surface
- [Custom Skills](./agent-skills.md) — extend the agent with SKILL.md files
- [MCP Servers](./mcp-servers.md) — connect external tools

Questions and bug reports: [GitHub Discussions](https://github.com/skalesapp/skales/discussions). The [Discover feed](https://feed.skales.app) carries shared skills and workflows.
