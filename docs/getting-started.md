# Getting Started with Skales DevKit

Welcome to the Skales DevKit! This guide will help you set up and start using the development tools for the Skales application.

## System Requirements

Before you begin, ensure your system meets these requirements:

- **Operating System**: macOS 11+, Windows 10+, or Linux (Ubuntu 20.04+, Fedora 33+)
- **Node.js**: Version 18 or higher (required for CLI operations)
- **Disk Space**: Minimum 500MB for Skales and DevKit
- **Memory**: 2GB RAM minimum recommended

You can check your Node.js version with:
```bash
node --version
```

## Installation

1. **Download Skales**
   - Visit [skales.app](https://skales.app) and download the installer for your operating system
   - Follow the platform-specific installation prompts

2. **Launch Skales**
   - Start the Skales application
   - You should see the main window with the sidebar

## Enabling Developer Mode

1. Place the DevKit folder (containing `devkit.json`) in the Skales installation directory (see the install-path table in the README)
2. Set `"enabled": true` and your token in `devkit.json`
3. Restart Skales - the DevKit surfaces (Developer Docs, Debug Panel, API Playground) become available

## Setting Up the DevKit Folder

The DevKit stores its configuration and data in your user directory:

1. Create the DevKit folder:
   ```bash
   mkdir -p ~/.skales-data/devkit
   ```

2. Create a `devkit.json` configuration file in this folder:
   ```bash
   ~/.skales-data/devkit/devkit.json
   ```

3. Add the following configuration:
   ```json
   {
     "enabled": true,
     "token": "your-devkit-token-here",
     "features": {
       "apiPlayground": true,
       "debugPanel": true,
       "docs": true,
       "cliAccess": true
     }
   }
   ```

## DevKit Configuration (devkit.json)

The `devkit.json` file controls how the DevKit behaves:

| Setting | Type | Description |
|---------|------|-------------|
| `enabled` | boolean | Enable/disable the entire DevKit |
| `token` | string | Authentication token for API access (set your own value here; the CLI sends it as a Bearer token) |
| `features.apiPlayground` | boolean | Enable the interactive API Playground in the UI |
| `features.debugPanel` | boolean | Enable the Debug Panel for viewing logs and state |
| `features.docs` | boolean | Enable inline documentation viewer |
| `features.cliAccess` | boolean | Enable CLI access to DevKit APIs |

## What Appears After Setup

Once enabled, you'll see a new **Developer** section in the sidebar containing:

- **API Playground**: Interactive interface to test API endpoints in real-time
- **Debug Panel**: View application logs, state changes, and performance metrics
- **Docs**: Built-in documentation viewer for all DevKit features

## Using the CLI

The Skales DevKit includes a CLI for programmatic access:

1. Navigate to the CLI directory:
   ```bash
   cd ~/.skales-data/devkit/cli
   ```

2. Run the Skales CLI:
   ```bash
   node skales.js
   ```

3. You'll see a prompt where you can enter commands and interact with the DevKit APIs

### CLI Features
- Send messages to the AI
- Query available tools
- Manage memories
- Create and manage scheduled tasks
- View system status

## Your First API Call

To make your first API call, you can use curl from the command line:

```bash
curl -X POST http://localhost:3000/api/cli/status \
  -H "Authorization: Bearer your-devkit-token" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "app": "Skales",
  "version": "10.0.3",
  "provider": "anthropic",
  "model": "claude-opus",
  "memory_count": 0,
  "session_count": 0,
  "tools_count": 8,
  "uptime_ms": 45000,
  "devkit_version": "0.2.0"
}
```

For more detailed API documentation, see [api-reference.md](./api-reference.md).

## Data Storage

All DevKit data and configuration is stored in your user's home directory:

```
~/.skales-data/
├── devkit/
│   ├── devkit.json          # Configuration file
│   ├── cli/                 # CLI tools
│   └── sessions/            # Chat session history
├── agent-skills/            # Agent skill definitions
├── mcp-servers.json         # MCP server configuration
└── logs/                    # Application logs
```

Never commit these directories to version control as they contain sensitive tokens.

## Troubleshooting

### DevKit Not Showing in Sidebar
- **Issue**: Developer section doesn't appear after enabling
- **Solution**: Restart the Skales application completely (quit and relaunch)

### 401 Unauthorized Errors
- **Issue**: API calls return 401 errors
- **Cause**: Invalid or missing token in devkit.json
- **Solution**:
  1. Set a new token value in the `token` field of devkit.json
  2. Use the same token in the CLI (SKALES_TOKEN env or cli config)
  3. Restart Skales

### CLI Cannot Connect
- **Issue**: "Cannot connect to Skales" error when running skales.js
- **Cause**: Skales application is not running or listening on port 3000
- **Solution**:
  1. Ensure Skales application is running
  2. Check that no other application is using port 3000
  3. Try setting the SKALES_URL environment variable: `export SKALES_URL=http://localhost:3000`

### Permission Denied on devkit.json
- **Issue**: Cannot create or modify devkit.json
- **Cause**: File permissions issue
- **Solution**:
  ```bash
  chmod 755 ~/.skales-data/devkit
  chmod 644 ~/.skales-data/devkit/devkit.json
  ```

## Next Steps

- Read the [API Reference](./api-reference.md) to learn about available endpoints
- Explore [Agent Skills](./agent-skills.md) for extending AI capabilities
- Set up [MCP Servers](./mcp-servers.md) to connect external tools and services

For additional help, visit the [Skales community](https://community.skales.app) or check the built-in documentation in the DevKit Docs viewer.
