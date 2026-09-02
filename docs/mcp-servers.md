---
summary: "MCP support in Skales: what the protocol is, how servers are configured, and how their tools reach the agent."
read_when:
  - you are connecting an MCP server or debugging one whose tools never appear
  - you need the Skales-side configuration shape for an MCP server
---

# MCP (Model Context Protocol) Servers

The Model Context Protocol (MCP) is an open standard for connecting AI assistants to external tools, services, and data sources. Skales DevKit includes full MCP support for extending AI capabilities beyond built-in tools.

## What is MCP?

The Model Context Protocol enables:

- **Standardized Integration**: A common interface for connecting external services
- **Tool Discovery**: Automatic detection of available tools from services
- **Secure Communication**: Authentication and permission management
- **Real-time Data**: Access to live data from services during conversations
- **Cross-platform Compatibility**: Works with Claude, Copilot, Cursor, and other tools

MCP servers expose resources and tools that the AI can use through JSON-RPC protocol calls.

## MCP Configuration

MCP servers are configured in:

```
~/.skales-data/mcp-servers.json
```

This JSON file defines all available MCP servers and their connection settings.

### Configuration File Format

The top-level key is **`servers`**, and it holds an **array**. It is not an object map, and it is not called `mcpServers`. A file in any other shape parses to zero servers, silently — Skales falls back to an empty list rather than reporting a format error, so a hand-written file in the wrong shape looks like "MCP is broken" rather than "the file is wrong".

```json
{
  "servers": [
    {
      "name": "filesystem",
      "type": "stdio",
      "enabled": true,
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
      "env": {}
    },
    {
      "name": "notion",
      "type": "http",
      "enabled": true,
      "url": "https://mcp.notion.com/mcp",
      "oauth": true
    }
  ]
}
```

`name` is the identifier, not a display label — it is what `skales-dev mcp test <name>` and the tool prefix `mcp_<server>_<tool>` use, so keep it short and stable.

### Server Configuration Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Identifier for the server; must be unique |
| `type` | string | Yes | Transport: `"stdio"`, `"sse"`, or `"http"` |
| `enabled` | boolean | Yes | A disabled server contributes no tools |
| `command` | string | stdio only | Command to execute (e.g. `npx`, `node`, `python`) |
| `args` | array | stdio only | Command arguments |
| `env` | object | No | Environment variables for the child process |
| `url` | string | sse / http | Endpoint |
| `headers` | object | No | HTTP headers, for static-token servers |
| `oauth` | boolean | No | Mark a remote server as OAuth-protected: Skales surfaces a Sign-in affordance and attaches the stored bearer token instead of a static key |
| `timeoutMs` | number | No | How long a single tool call may run. Default 5 minutes, clamped to 5s–30min. Discovery calls keep their own short timeout regardless. |

Editing the file by hand is supported, but the `skales-dev mcp add` command and the MCP Servers screen in Settings write the same file and validate as they go.

### Transport Types

**stdio (Standard Input/Output)**

Child processes that communicate through stdin/stdout. Good for:
- Self-hosted servers
- Services running locally
- Secure, no network exposure
- File system access servers

**http (Streamable HTTP)**

The transport of the 2025 MCP spec: a single endpoint, one POST per request, an optional SSE upgrade for server-initiated messages, and session continuity through an `Mcp-Session-Id` header. Prefer this for any remote server that offers it.

**sse (legacy HTTP + SSE)**

The older two-endpoint HTTP transport. Good for:
- Cloud services (Notion, GitHub, Slack)
- Remote APIs
- Services with web endpoints
- Easier to debug with browser tools

---

## Built-in MCP Server Templates

Skales includes pre-configured templates for popular services. These are starting points; you'll need to configure with your credentials.

### Notion

Connect to Notion workspaces and access databases and pages.

```json
{
  "servers": [
    {
        "name": "notion",
        "type": "sse",
        "enabled": false,
        "url": "https://api.notion.com/v1/mcp",
        "headers": {
          "Authorization": "Bearer your-notion-token",
          "Notion-Version": "2024-02-15"
        }
    }
  ]
}
```

**Tools Provided:**
- `mcp_notion_list_databases` - List all databases
- `mcp_notion_query_database` - Query a database with filters
- `mcp_notion_get_page` - Retrieve a page
- `mcp_notion_update_page` - Update page properties

**How to get a token:**
1. Visit [notion.so/integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Copy the Internal Integration Token
4. Add the integration to your Notion workspace

---

### GitHub

Connect to GitHub repositories, manage issues, PRs, and access code.

```json
{
  "servers": [
    {
        "name": "github",
        "type": "sse",
        "enabled": false,
        "url": "https://api.github.com/graphql",
        "headers": {
          "Authorization": "Bearer your-github-token"
        }
    }
  ]
}
```

**Tools Provided:**
- `mcp_github_list_repositories` - List accessible repositories
- `mcp_github_search_code` - Search code across repos
- `mcp_github_get_issue` - Retrieve issue details
- `mcp_github_create_issue` - Create new issues
- `mcp_github_list_pull_requests` - List pull requests

**How to get a token:**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `read:org`
4. Copy the token and add to your config

---

### Google Drive

Access files and folders in Google Drive.

```json
{
  "servers": [
    {
        "name": "google-drive",
        "type": "sse",
        "enabled": false,
        "url": "https://www.googleapis.com/drive/v3",
        "headers": {
          "Authorization": "Bearer your-google-token"
        }
    }
  ]
}
```

**Tools Provided:**
- `mcp_gdrive_list_files` - List files and folders
- `mcp_gdrive_search_files` - Search by name or content
- `mcp_gdrive_get_file_content` - Read file contents
- `mcp_gdrive_upload_file` - Upload files
- `mcp_gdrive_create_folder` - Create new folders

**How to get a token:**
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Use the token with Skales DevKit

---

### Slack

Send messages, read channels, and manage Slack workspaces.

```json
{
  "servers": [
    {
        "name": "slack",
        "type": "sse",
        "enabled": false,
        "url": "https://slack.com/api",
        "headers": {
          "Authorization": "Bearer xoxb-your-bot-token"
        }
    }
  ]
}
```

**Tools Provided:**
- `mcp_slack_list_channels` - List all channels
- `mcp_slack_get_messages` - Retrieve channel messages
- `mcp_slack_send_message` - Post messages to channels
- `mcp_slack_upload_file` - Share files in channels
- `mcp_slack_get_user_info` - Get user information

**How to set up:**
1. Create a Slack App: [api.slack.com/apps](https://api.slack.com/apps)
2. Enable Bot Token Scopes: `channels:read`, `chat:write`, `files:write`
3. Install to workspace
4. Copy Bot User OAuth Token (starts with `xoxb-`)

---

### Filesystem

Access local files and directories (sandboxed for security).

```json
{
  "servers": [
    {
        "name": "filesystem",
        "type": "stdio",
        "enabled": true,
        "command": "node",
        "args": ["/path/to/@modelcontextprotocol/server-filesystem/dist/index.js"],
        "env": {
          "ALLOWED_PATHS": "/home/user/projects,/tmp"
        }
    }
  ]
}
```

**Tools Provided:**
- `mcp_filesystem_read_file` - Read file contents
- `mcp_filesystem_write_file` - Create or update files
- `mcp_filesystem_list_directory` - List files in a directory
- `mcp_filesystem_delete_file` - Remove files

**Security Note:**
Set `ALLOWED_PATHS` to restrict which directories can be accessed. Use comma-separated paths.

---

## Adding a Custom MCP Server

### Example: Creating a Custom API Server

1. Create your server file (`my-server.js`):

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// MCP-compatible endpoint
app.post('/api/tools', (req, res) => {
  res.json({
    tools: [
      {
        name: "fetch_weather",
        description: "Get current weather",
        inputSchema: {
          type: "object",
          properties: {
            city: { type: "string" }
          }
        }
      }
    ]
  });
});

app.post('/api/call', (req, res) => {
  const { tool, params } = req.body;

  if (tool === "fetch_weather") {
    res.json({ weather: "sunny", temp: 75 });
  }
});

app.listen(4000, () => console.log('Server ready'));
```

2. Add to `mcp-servers.json`:

```json
{
  "servers": [
    {
        "name": "custom-weather",
        "type": "sse",
        "enabled": true,
        "url": "http://localhost:4000",
        "headers": {
          "Authorization": "Bearer your-api-key"
        }
    }
  ]
}
```

3. Restart Skales to load the new server

---

## How Tools Are Discovered

When Skales starts, it:

1. Reads `mcp-servers.json`
2. Connects to each enabled server
3. Queries available tools via JSON-RPC
4. Prefixes tool names with `mcp_<server-name>_<tool-name>`
5. Makes tools available to the AI in chat

**Example:** A GitHub server with a `list_repos` tool becomes `mcp_github_list_repos` in conversations.

### Verifying Tools Are Available

Check the API Playground:
1. Open Skales → Developer → API Playground
2. Go to the Tools tab
3. Search for `mcp_` to see all MCP tools
4. Each tool shows its parameters and description

Or use the API:
```bash
curl http://localhost:3000/api/cli/tools \
  -H "Authorization: Bearer your-token" | jq .
```

---

## Transport Protocols Explained

### stdio (Standard I/O)

**How it works:**
- Skales starts the server process
- Communicates via stdin/stdout pipes
- Process terminates when Skales closes

**Advantages:**
- No network exposure
- Direct process control
- Local-only operation
- Better for sensitive data

**Use cases:**
- Filesystem access
- Local development tools
- Sensitive APIs

**Example config:**
```json
{
  "command": "python",
  "args": ["./my_server.py"],
  "env": {
    "LOG_LEVEL": "debug"
  }
}
```

### SSE (Server-Sent Events)

**How it works:**
- Server runs independently
- Skales connects via HTTP
- Bidirectional JSON-RPC over persistent HTTP connection

**Advantages:**
- Servers can run remotely
- Easier to debug (use browser DevTools)
- Can restart independently
- Better for web services

**Use cases:**
- Cloud APIs (Notion, GitHub, Slack)
- Remote services
- Public APIs

**Example config:**
```json
{
  "url": "https://api.example.com/mcp",
  "headers": {
    "Authorization": "Bearer token"
  }
}
```

---

## Example: Setting Up a Filesystem MCP Server

A complete walkthrough of setting up the filesystem server for local file access:

### Step 1: Install the Server Package

```bash
npm install @modelcontextprotocol/server-filesystem
```

### Step 2: Add to mcp-servers.json

```json
{
  "servers": [
    {
      "name": "filesystem",
      "type": "stdio",
      "enabled": true,
      "command": "node",
      "args": [
        "./node_modules/@modelcontextprotocol/server-filesystem/dist/index.js",
        "/home/user/projects",
        "/tmp"
      ],
      "env": {}
    }
  ]
}
```

### Step 3: Configure Allowed Paths

Edit the args to specify directories that can be accessed:

Every path after the script path is a directory the server may touch:

```json
"args": [
  "./node_modules/@modelcontextprotocol/server-filesystem/dist/index.js",
  "/home/user/projects",
  "/home/user/documents",
  "/tmp"
]
```

JSON has no comments; the file must parse or Skales loads zero servers.

### Step 4: Restart Skales

Close and reopen the Skales application to load the server.

### Step 5: Test in Chat

Try a message like:
```
List the files in /home/user/projects
```

The AI now has access to your filesystem through the `mcp_filesystem_*` tools.

---

## Authentication and Security

### Storing Secrets Securely

Never hardcode tokens in mcp-servers.json. Instead, use environment variables:

```json
{
  "github": {
    "type": "sse",
    "enabled": true,
    "url": "https://api.github.com/graphql",
    "headers": {
      "Authorization": "Bearer ${GITHUB_TOKEN}"
    }
  }
}
```

Then set the environment variable:

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

Skales will automatically expand `${VARIABLE_NAME}` syntax.

### Permission Best Practices

1. **Create API tokens with minimal scopes**
   - GitHub: Only enable needed permissions
   - Google: Use service account with limited scopes
   - Notion: Create integration with access to specific databases

2. **Rotate tokens regularly**
   - Set calendar reminders to refresh tokens
   - Monitor token usage in provider dashboards
   - Revoke tokens immediately if compromised

3. **Audit access**
   - Check Slack app activity logs
   - Review GitHub token usage
   - Monitor Google Cloud audit logs

---

## Troubleshooting MCP Servers

### Server Not Connecting

**Problem:** "Connection refused" or "timeout"

**Diagnosis:**
1. Check if server is running
2. Verify connection details are correct
3. Check firewall settings (for SSE servers)

**Solution:**
```bash
# For stdio servers, test directly
node ./my-server.js

# For SSE servers, test with curl
curl -H "Authorization: Bearer token" https://api.example.com/mcp
```

### Tools Not Appearing

**Problem:** Tools don't show up in the Tools list

**Diagnosis:**
1. Read the server's own output: `skales-dev mcp logs <name>`
2. Check `mcp-servers.json` syntax — a parse error, or a top-level key other than `servers`, yields zero servers with no message
3. Verify the server is `enabled: true` and that `skales-dev mcp test <name>` reports `ok`

**Solution:**
1. Restart Skales application
2. Check logs at `~/.skales-data/logs/`
3. Verify server responds with tool definitions

### Authentication Errors

**Problem:** 401, 403, or "Unauthorized" errors

**Diagnosis:**
1. Check token is valid in the provider's dashboard
2. Verify token hasn't expired
3. Check token permissions/scopes

**Solution:**
1. Generate a new token from the provider
2. Update mcp-servers.json with new token
3. Restart Skales

### Performance Issues

**Problem:** Slow responses or timeouts when using MCP tools

**Diagnosis:**
1. Check server performance metrics
2. Monitor network latency (for SSE servers)
3. Check for rate limiting

**Solution:**
1. Reduce concurrent tool calls
2. Increase timeout values in config
3. Check server logs for errors
4. Consider using caching for frequently accessed data

---

## Best Practices

### Organization

The file is one flat array; there is no grouping or nesting. Keep servers apart by name instead — a short, stable `name` becomes the tool prefix (`mcp_<server>_<tool>`), so `github` reads better in a tool list than `dev-github-primary`.

Servers you are not using should be `"enabled": false` rather than deleted: a disabled server contributes no tools and costs no connection, and its configuration is still there when you want it back.

### Monitoring

Enable logging and periodically review:
- Which servers are used most
- Error rates and failure patterns
- Performance metrics

### Updates

Keep MCP server packages up-to-date:

```bash
npm update @modelcontextprotocol/*
```

### Testing

Test new MCP servers in isolation:
1. Use the API Playground
2. Try simple operations first
3. Gradually increase complexity
4. Monitor logs for issues

---

## Common MCP Server Patterns

### Authentication Flow

```javascript
// SSE server with authentication
app.post('/api/auth', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!isValidToken(token)) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  res.json({ authenticated: true });
});
```

### Error Handling

```javascript
// Proper error response format
try {
  const result = await tool.execute(params);
  res.json({ result });
} catch (error) {
  res.status(400).json({
    error: error.message,
    code: error.code
  });
}
```

### Rate Limiting

```javascript
// Client-side rate limiting
const queue = [];
const rateLimit = 100; // requests per minute

function executeWithRateLimit(tool, params) {
  if (queue.length >= rateLimit) {
    return { error: "Rate limit exceeded" };
  }
  queue.push({ tool, params });
  // ... execute after delay
}
```

---

## Advanced Configuration

### Per-server call timeout

A single tool call may run for five minutes by default. Servers that legitimately take longer — video analysis, large scrapes, renders — can raise it per server with `timeoutMs`, clamped to between 5 seconds and 30 minutes:

```json
{
  "servers": [
    {
      "name": "video-analysis",
      "type": "stdio",
      "enabled": true,
      "command": "npx",
      "args": ["-y", "some-video-mcp-server"],
      "timeoutMs": 900000
    }
  ]
}
```

Discovery calls (initialize, tools/list) keep their own short timeout regardless: a server that needs minutes to *list* its tools is broken, not busy.

### OAuth servers

Remote servers that sign you in instead of taking a static key are marked `"oauth": true`. Skales then shows a Sign-in affordance for that server and attaches the stored bearer token on every call; you do not put a token in `headers`.

There is no conditional loading, no per-context activation, and no primary/fallback pair. A server is `enabled` or it is not.

---

## Support and Resources

- **MCP Specification**: [modelcontextprotocol.io](https://modelcontextprotocol.io/)
- **Official Servers**: [github.com/modelcontextprotocol](https://github.com/modelcontextprotocol)
- **Community Servers**: Search GitHub for "mcp-server"
- **Skales Docs**: [docs.skales.app](https://docs.skales.app)

For setup help:
1. Check the [Getting Started Guide](./getting-started.md)
2. Review the [API Reference](./api-reference.md)
3. Ask in [GitHub Discussions](https://github.com/skalesapp/skales/discussions)

---

## Key Takeaways

- MCP is an open protocol for connecting AI to external tools
- Configure servers in `~/.skales-data/mcp-servers.json`, as an array under the key `servers`
- Use `stdio` for local servers, `http` for modern remote ones, `sse` for older remote ones
- Tools are auto-discovered and prefixed with `mcp_`
- Built-in templates for Notion, GitHub, Google Drive, Slack, Filesystem
- Store credentials in environment variables, not config files
- Test servers in the API Playground before using in chat
