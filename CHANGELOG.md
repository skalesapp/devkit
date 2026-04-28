# Skales DevKit Changelog

All notable changes to the Skales DevKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).


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
