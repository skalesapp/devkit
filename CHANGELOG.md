# Skales DevKit Changelog

All notable changes to the Skales DevKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).


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
