# Skales DevKit Changelog

All notable changes to the Skales DevKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).


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
