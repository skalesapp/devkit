# Integrations Setup Guide

Skales connects to external services and to your own machine. Most of it is
configured under **Settings → Integrations**; a few areas have their own tab
(**API Connector**) or their own settings section elsewhere.

Read the next section first. Whether an integration card is even visible, and
whether its tools are offered to the model, depends on add-ons.

---

## How add-on gating works

Skales capabilities are grouped into **add-ons**. You switch them on and off on
the **Add-Ons** page (sidebar) or in the Add-Ons section of
**Settings → Integrations**.

Three states matter:

**Off** — the integration's settings card is hidden in the Standard settings
view, and, more importantly, its tools are not offered to the model at all. The
model does not "know about but decline" a switched-off add-on; the tools are
simply absent from the turn. If you asked Skales to post to Slack and it says it
cannot, check the add-on first.

**Core** — always on and not switchable. These are capabilities rather than
accounts: weather, summarizing, document reading, web search, system monitor,
local file chat, screenshot vision, VirusTotal, Wrapped. Switching them off
would make Skales worse at being Skales, so there is no switch.

**Parked** — the add-on still works completely for whoever has it on, but it is
no longer offered on the Add-Ons page and its sidebar entry is gone. Nothing you
had is taken away; the door is. Currently parked: HF Spaces, Templates, Lio,
Organization, Workflow, Playbooks.

**Retired** — force-disabled and refused if something tries to switch it on. See the
**Retired integrations** section below.

There is also a **Standard / Advanced** switch on the settings page. Advanced
shows every section; Standard shows core sections plus the sections belonging to
add-ons you have on. It is a sight, not a state — nothing you switched on is
lost by changing views.

---

## 1. Notion

**Add-on**: `notion`. The card and its tools appear once the add-on is on.

**Overview**: Integrate with your Notion workspace to manage pages, databases, and information.

**Getting Started**:
1. Visit [notion.so/my-integrations](https://notion.so/my-integrations)
2. Click "Create new integration"
3. Name it "Skales" and grant permissions
4. Copy the Internal Integration Token
5. In Skales: **Settings → Integrations → Notion → Paste Token**
6. Grant access to specific Notion pages/databases you want Skales to use

**Available Tools**:
- `notion_search` — Search across your entire workspace
- `notion_create_page` — Create new pages in specified databases
- `notion_update` — Update page content and properties
- `notion_list_databases` — List all accessible databases

**Use Cases**:
- Save important information to Notion automatically
- Query your Notion knowledge base
- Create project tasks or meeting notes
- Synchronize external data into Notion

**Permissions**: Grant access only to databases and pages you want Skales to modify. You can revoke access anytime.

---

## 2. Todoist

**Add-on**: `todoist`. The card and its tools appear once the add-on is on.

**Overview**: Manage your task list directly from Skales.

**Getting Started**:
1. Go to [todoist.com/app/settings/integrations/developer](https://todoist.com/app/settings/integrations/developer)
2. Copy your API Token
3. In Skales: **Settings → Integrations → Todoist → Paste API Token**

**Available Tools**:
- `todoist_list_tasks` — Retrieve your task list (with filters)
- `todoist_create_task` — Create new tasks with due dates and projects
- `todoist_complete_task` — Mark tasks as complete

**Use Cases**:
- Create tasks from conversations
- Check your task list without leaving Skales
- Complete tasks programmatically
- Organize work by project and priority

**Authentication**: Your API token is personal and private. Never share it.

---

## 3. Spotify

**Add-on**: `spotify`. The card and its tools appear once the add-on is on.

**Overview**: Control music playback and discover music directly from Skales.

**Getting Started**:
1. In Skales: **Settings → Integrations → Spotify**
2. Click "Connect with Spotify"
3. Authorize Skales to access your Spotify account (via OAuth)
4. You'll be redirected to confirm—approve the requested permissions

**Available Tools**:
- `spotify_now_playing` — Get currently playing track and stats
- `spotify_play` — Play a specific track, album, or playlist
- `spotify_pause` — Pause playback
- `spotify_next` — Skip to next track
- `spotify_search` — Search for songs, artists, or playlists

**Use Cases**:
- Control music while working
- Search for new music in conversation
- Get information about your current track
- Create playlists dynamically

**Privacy**: Skales only accesses music-related permissions. Your data is never stored on Skales servers.

---

## 4. Home Assistant

**Add-on**: `smart_home`. The card and its tools appear once the add-on is on.

**Overview**: Control smart home devices and monitor their status.

**Getting Started**:
1. Open your Home Assistant instance (e.g., `https://yourname.duckdns.org:8123`)
2. Go to **Profile** (bottom left) → **Long-Lived Access Tokens**
3. Create a new token named "Skales"
4. Copy the token
5. In Skales: **Settings → Integrations → Home Assistant**
6. Paste your Home Assistant URL and the token

**Available Tools**:
- `ha_get_states` — Get current state of all devices
- `ha_call_service` — Execute any Home Assistant service
- `ha_toggle_light` — Turn lights on/off or adjust brightness
- `ha_set_temperature` — Set thermostat temperature

**Use Cases**:
- Control lights, doors, thermostats from conversation
- Check device status (is the front door locked?)
- Create automations triggered by conversations
- Monitor energy usage

**Security**: Use a Long-Lived Token rather than your main password. Tokens can be revoked instantly if compromised.

**Advanced**: Home Assistant is self-hosted by default. If using a public URL, ensure SSL is enabled and use a strong token.

---

## 5. Google Drive

**Add-on**: `google_drive`. The card and its tools appear once the add-on is on.

**Overview**: Manage files in your Google Drive.

**Getting Started**:
1. In Skales: **Settings → Integrations → Google Drive**
2. Click "Connect with Google"
3. Select your Google account and grant file access permissions
4. You'll be redirected to confirm—approve the requested permissions

**Available Tools**:
- `drive_list_files` — List files in a folder
- `drive_search` — Search for files by name or content
- `drive_upload` — Upload files to Drive
- `drive_download` — Download files locally

**Use Cases**:
- Search documents without leaving Skales
- Upload conversation transcripts to Drive
- Access shared files quickly
- Organize files programmatically

**Privacy**: Skales uses OAuth and doesn't store your credentials. Google controls access permissions.

---

## 6. Telegram

**Add-on**: `telegram`. The card and its tools appear once the add-on is on.

**Overview**: Send and receive messages via Telegram.

**Getting Started**:
1. Open Telegram and search for **@BotFather**
2. Type `/newbot` and follow the prompts
3. Name your bot and choose a username
4. BotFather will give you a Bot Token (keep it secret)
5. In Skales: **Settings → Integrations → Telegram → Paste Bot Token**

**Available Features**:
- Send messages to users who add your bot
- Receive messages and process them with Skales
- Create interactive bot commands

**Use Cases**:
- Get Skales notifications on Telegram
- Control Skales from Telegram
- Build Telegram bot automations

**Security**: Bot tokens are sensitive. Never share them publicly.

---

## 7. Discord

**Add-on**: `discord`. The card and its tools appear once the add-on is on.

**Overview**: Connect Skales to Discord for channel messaging and automation.

**Getting Started**:
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" tab and create a bot
4. Copy the Bot Token
5. In Skales: **Settings → Integrations → Discord → Paste Bot Token**
6. In the Developer Portal, set permissions (Send Messages, Read Message History)
7. Generate an OAuth2 URL and invite your bot to your server

**Available Features**:
- Send messages to channels
- Read messages from channels
- React to messages
- Create threads and posts

**Use Cases**:
- Post updates to team channels
- Monitor Discord for mentions
- Automate channel management
- Create Discord bots that use Skales

**Security**: Keep your bot token private. If compromised, regenerate it immediately.

---

## 8. WhatsApp

**Add-on**: `whatsapp`. The card and its tools appear once the add-on is on.

**Overview**: Send and receive messages via WhatsApp Web.

**Getting Started**:
1. In Skales: **Settings → Integrations → WhatsApp**
2. Click "Scan QR Code"
3. Open WhatsApp on your phone and go to **Settings → Linked Devices**
4. Scan the QR code displayed in Skales
5. Your phone must stay connected for messages to flow

**Available Features**:
- Send messages to contacts and groups
- Receive incoming messages
- Real-time message synchronization

**Use Cases**:
- Receive alerts via WhatsApp
- Send messages programmatically
- Create WhatsApp automation workflows

**Important**: WhatsApp Web requires your phone to be online. If your phone loses connection, messages won't sync until it reconnects.

**Privacy**: Skales acts as a Web client. Your messages are still encrypted end-to-end by WhatsApp.

---

## 9. Signal

**Add-on**: `signal`. The card and its tools appear once the add-on is on.

**Overview**: Secure messaging integration via Signal.

**Getting Started**:
1. Install Signal on your computer or use Signal Desktop
2. Install signal-cli on your system (see [signal-cli documentation](https://github.com/AsamK/signal-cli))
3. Register your Signal account with signal-cli
4. Note the signal-cli socket or config path
5. In Skales: **Settings → Integrations → Signal**
6. Configure the path to your signal-cli installation

**Available Features**:
- Send encrypted messages
- Receive incoming messages
- Group messaging support

**Use Cases**:
- Send secure notifications
- Build privacy-focused automations
- Integrate with Signal groups

**Privacy**: Signal uses end-to-end encryption. Even Skales cannot read message content—only send/receive envelope metadata.

---

## 10. Slack

**Add-on**: `slack`. The card and its tools appear once the add-on is on.

**Overview**: Connect Skales to Slack for team collaboration and messaging.

**Getting Started**:
1. Go to [Slack API Dashboard](https://api.slack.com/apps)
2. Create a new app
3. Go to the "Bot Token Scopes" section and add permissions (chat:write, chat:read, etc.)
4. Install the app to your workspace
5. Copy the Bot User OAuth Token (starts with `xoxb-`)
6. In Skales: **Settings → Integrations → Slack → Paste Bot Token**

**Available Features**:
- Send messages to channels
- Read channel messages
- Mention users and groups
- Upload files
- Respond to slash commands

**Use Cases**:
- Post summaries to Slack channels
- Monitor team discussions
- Create Slack workflows powered by Skales
- Build interactive Slack bots

**Permissions**: Request only the scopes you need. Users see what your bot can do.

**Security**: Bot tokens can be rotated in the Slack API dashboard if compromised.

---

## 11. Google Calendar

**Add-on**: `googleCalendar`. The card and its tools appear once the add-on is on.

**Overview**: Manage calendar events and sync schedules.

**Getting Started**:
1. In Skales: **Settings → Integrations → Google Calendar**
2. Click "Connect with Google"
3. Select your Google account and grant calendar access
4. Approve the requested permissions

**Available Tools**:
- `list_calendar_events` — read events in a date range
- `create_calendar_event` — create an event
- `update_calendar_event` — change an existing event
- `delete_calendar_event` — remove an event
- `generate_day_plan` — build a plan for a day from your events and tasks
- `push_plan_to_calendar` — write that plan back to the calendar

They require the add-on **and** a configured calendar.

**A second add-on, `calendar_sync`**, appears in the same Productivity
Integrations section. It handles synchronization and contributes no tools of its
own — every model-facing calendar tool above hangs on `googleCalendar`.

**Use Cases**:
- Check your schedule without leaving Skales
- Schedule follow-ups based on conversations
- Have Skales lay out a workable day and write it to the calendar

**Privacy**: Skales uses OAuth and respects Google's privacy controls.

---

## 12. Twitter/X

**Add-on**: `twitter`. The card and its tools appear once the add-on is on.

**Overview**: Post tweets and monitor your Twitter/X account.

**Getting Started**:
1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Create a developer account and application
3. Go to "Keys and Tokens" and generate API keys:
   - API Key (Consumer Key)
   - API Secret Key (Consumer Secret)
   - Access Token
   - Access Token Secret
4. In Skales: **Settings → Integrations → Twitter/X**
5. Paste all four credentials

**Available Tools**:
- `post_tweet` — Post a new tweet
- `read_mentions` — Get recent mentions of your account
- `read_timeline` — Read your home timeline
- `reply_to_tweet` — Reply to a specific tweet

**Use Cases**:
- Share updates and announcements
- Monitor mentions and engagement
- Respond to followers programmatically
- Create tweet threads from conversations

**Rate Limits**: Twitter API has rate limits. Skales respects these to avoid account throttling.

**Security**: Keep your API credentials private. Rotate them if exposed.

---

## 13. VirusTotal

**Add-on**: core. Always on, cannot be switched off.

**Overview**: Scan files and URLs for security threats.

**Getting Started**:
1. Visit [virustotal.com](https://virustotal.com)
2. Create a free account
3. Go to your profile and generate an API key
4. In Skales: **Settings → Integrations → VirusTotal → Paste API Key**

**Available Tools**:
- Scan files for malware
- Check URLs for phishing/malware
- Review scan results from multiple antivirus engines

**Use Cases**:
- Verify file safety before downloading
- Check suspicious URLs
- Audit file integrity
- Security research

**Quota**: Free tier allows a limited number of API requests per day. Check your usage in the VirusTotal dashboard.

---

## 14. Email (SMTP/IMAP)

**Add-on**: `email`. The card and its tools appear once the add-on is on.

**Overview**: Send and receive emails from Skales.

**Getting Started**:

### For Sending (SMTP):
1. Note your email provider's SMTP settings:
   - **Gmail**: `smtp.gmail.com:587` (use [App Password](https://support.google.com/accounts/answer/185833))
   - **Outlook**: `smtp-mail.outlook.com:587`
   - **Custom**: Check your provider's documentation
2. In Skales: **Settings → Integrations → Email (SMTP)**
3. Enter your email, password, and SMTP server details

### For Reading (IMAP):
1. Note your email provider's IMAP settings:
   - **Gmail**: `imap.gmail.com:993`
   - **Outlook**: `imap-mail.outlook.com:993`
   - **Custom**: Check your provider's documentation
2. In Skales: **Settings → Integrations → Email (IMAP)**
3. Enter your email, password, and IMAP server details

**Available Features**:
- Send emails programmatically
- Read incoming emails
- Filter by folder and sender
- Automatic email processing

**Use Cases**:
- Send notifications via email
- Process incoming emails automatically
- Create email-based workflows
- Archive important conversations

**Security**:
- Use App Passwords instead of your main password when possible
- Enable 2FA on your email account
- Store credentials securely in Skales

**Gmail-Specific**: Google requires an App Password (16 characters) for third-party apps. Regular passwords won't work.

---

## 15. Obsidian

**Add-on**: none. The tools appear as soon as at least one vault folder is
connected. Settings section: **Settings → Integrations → Obsidian Vaults**.

**Getting started**: add the folder of your vault on the Obsidian Vaults card
and give it an alias. You can connect more than one. The same card sets the
filing format used when Skales writes a note.

**Available tools**:
- `obsidian_list_vaults` — list the connected vaults
- `obsidian_search` — full-text search across a vault
- `obsidian_read` — read a note
- `obsidian_list_folder` — list a folder inside a vault
- `obsidian_create_note` — create a note
- `obsidian_append_to_note` — append to an existing note

**Scope**: the tools only reach the folders listed on that card. Removing a
vault there removes the access, and nothing in the vault is copied into the
Skales data directory.

---

## 16. WordPress

**Add-on**: `wordpress`. You also need the site URL and an application
password or token. Settings section: **Settings → Integrations → WordPress**.

This is the largest tool family in Skales — roughly 45 tools covering posts,
pages, media, comments, taxonomy, menus, widgets, blocks, design, SEO, and
WooCommerce. Representative names:

- Connection and inventory: `wordpress_connect`, `wordpress_site_inventory`,
  `wordpress_get_settings`, `wordpress_update_settings`
- Content: `wordpress_list_posts`, `wordpress_create_post`,
  `wordpress_update_post`, `wordpress_list_pages`, `wordpress_create_page`,
  `wordpress_update_page`, `wordpress_delete_content`
- Media: `wordpress_list_media`, `wordpress_upload_media`,
  `wordpress_set_featured_image`
- Comments: `wordpress_list_comments`, `wordpress_moderate_comment`,
  `wordpress_reply_comment`
- Structure: `wordpress_list_terms`, `wordpress_list_menus`,
  `wordpress_save_menu`, `wordpress_list_widgets`
- Blocks: `wordpress_list_reusable_blocks`, `wordpress_serialize_blocks`,
  `wordpress_validate_blocks`, `wordpress_elementor_page`
- Design and SEO: `wordpress_get_design`, `wordpress_update_global_styles`,
  `wordpress_update_custom_css`, `wordpress_get_seo`, `wordpress_update_seo`
- WooCommerce: `wordpress_woo_list_products`, `wordpress_woo_bulk_price`
- Maintenance: `wordpress_clear_cache`

**Note**: switching the `wordpress` add-on off removes this whole family from
the model's tool list, even though the `/wordpress` page has no sidebar entry
of its own.

---

## 17. MCP Servers

**Add-on**: `mcp_servers`. Settings section:
**Settings → Integrations → MCP Servers**.

MCP (Model Context Protocol) servers are the general extension mechanism.
Configure a server on that card — command, arguments, environment, or a remote
URL — and its tools become available to the model.

**Tool names are not fixed.** Every tool of every enabled server is exposed as
`mcp_<server>_<tool>`, grouped under `mcp:<server>`. When tool retrieval is
active, the group has to be pulled in with `load_tools` before its tools can be
called.

**Two switches, not one**: the `mcp_servers` add-on gates the settings card and
the surface, but which tools actually load is decided by the per-server
`enabled` flag in the server list. A server switched off there contributes
nothing even with the add-on on.

**OAuth**: remote MCP servers that require authorization are handled from the
same card, using dynamic client registration and PKCE. There is no tool for
this; it is a browser flow you complete once per server.

**GitHub**: the supported way to reach GitHub is an MCP server
(`@modelcontextprotocol/server-github`). See the Retired section.

---

## 18. API Connector

**Add-on**: none, but the settings tab is Advanced-only. Settings tab:
**Settings → API Connector** (switch the settings page to **Advanced** to see
it).

Define a REST endpoint once — base URL, authentication, headers — and the model
can call it.

**Available tools**:
- `connector_request` — call a configured connector. Appears only once at least
  one connector exists.
- `create_connector` — define a new connector from chat. Appears only when
  safety mode is set to skip approvals; under the default safety setting you
  create connectors on the settings tab yourself.

---

## 19. Web search and web reading (Tavily, Jina)

**Add-on**: `web_search` — core, always on. Settings sections:
**Settings → Integrations → Tavily Web Search** (core) and
**Settings → Integrations → Jina Reader** (Advanced view).

**`search_web`** is the single search tool and it is provider-agnostic: it runs
against DuckDuckGo, Tavily, Brave, or SearXNG depending on what you configured.
The tool's own description is rewritten at runtime to name the configured
provider. If no usable provider is configured, the tool is removed from the
turn rather than offered and failing.

**Jina is not a tool.** It is a backend choice for reading a page. The reading
tools are `fetch_web_page` and `extract_web_text`; setting the web extractor to
Jina changes how they fetch, and their results are tagged `[Jina]`. Setting a
Jina API key does not add anything to the tool list.

---

## 20. FTP / SFTP

**Add-on**: none for the main tools; you need a saved FTP profile. Settings
section: **Settings → Integrations → FTP / SFTP Profiles** (Advanced view).

**Available tools**:
- `ftp_publish` — publish content to a configured profile
- `ftp_list` — list a remote directory
- `ftp_download` — download a remote file

**`ftp_upload`** is separate: it deploys a Lio project using that project's
deploy configuration, and it is gated on the `codework` add-on.

---

## 21. Teams and Agent-to-Agent (A2A)

**Add-on**: none — core. Settings section:
**Settings → Integrations → Teams & Agent-to-Agent (A2A)**.

A2A is an **inbound** protocol: it publishes an agent card, issues a pairing
token, and rate-limits incoming requests, so another agent or another machine
can reach this Skales instance. There is no `team_*` or `a2a_*` tool for the
model to call — it is a door in, not a tool out.

For delegating work from inside Skales, the relevant tools are
`dispatch_subtasks` (core, delegates to subagents on this machine) and
`delegate_swarm_task` (see Swarm).

---

## 22. Swarm

**Add-on**: `swarm`. You also need the swarm daemon running and at least one
peer online. Settings section: **Settings → Advanced → Agent Swarm**.

Swarm distributes a task across peer machines running Skales.

**Available tool**: `delegate_swarm_task`

Swarm is off by default and stays off until you switch it on: it fans a task
out over several models at once, which costs something the moment it runs.

---

## 23. Webhooks

**Add-on**: `webhooks`.

Webhooks are **inbound only**. External automations POST into Skales to trigger
something; there is no tool the model can call to send a webhook. If you want
the model to make outbound HTTP calls, use the API Connector.

---

## 24. Google Docs

**Add-on**: `google_docs`, plus a working Google credential covering Docs.
Settings section: **Settings → Integrations → Productivity Integrations**.

**Available tools**:
- `google_docs_create` — create a document
- `google_docs_get_text` — read a document's text
- `google_docs_insert_text` — insert text into a document

---

## 25. Google Places

**Add-on**: `google_places`, plus a Google Places API key. Settings section:
**Settings → Integrations → Google Places**.

**Available tools**:
- `search_places` — find places near a location
- `get_directions` — routing between two points
- `geocode_address` — turn an address into coordinates

---

## 26. YouTube

**Add-on**: `youtube`, plus either an API key or a Google account whose grant
covers YouTube. Settings sections:
**Settings → Integrations → Productivity Integrations** and
**Settings → Integrations → Social OAuth**.

**Available tools**:
- `youtube_search` — search videos
- `youtube_video_details` — metadata for one video
- `youtube_channel_info` — channel metadata
- `youtube_trending` — trending videos
- `youtube_captions` — fetch a video's captions

---

## 27. Computer Use

**Add-on**: `computer_use`.

Desktop control: the model can look at the screen and drive mouse and keyboard.

**Available tools**:
- `computer_screenshot` — capture the screen
- `computer_click`, `computer_type`, `computer_key`, `computer_scroll` — input
- `computer_read_field` — read the content of a field
- `computer_find` — locate an element on screen

Separate and differently gated: `screenshot_desktop` and `camera_snapshot`,
which follow the Vision Provider configuration and the core
`vision_screenshots` capability rather than this add-on.

**Security**: this add-on lets the model act on your desktop outside Skales.
Leave it off unless you want that.

---

## 28. Network Scanner

**Add-on**: `network_scanner`. No credentials needed.

**Available tool**: `scan_network` — discover hosts and open ports on the local
network.

Off by default.

---

## 29. Lio

**Add-on**: `lio_ai`. Parked — the sidebar entry is gone, but the add-on and
its page still work for anyone who has it on, and `/lio` is reachable by typing
the route. Settings section: **Settings → Integrations → Lio**.

Lio is block coding for children and families. It is a **surface, not a tool
family**: there is no `lio_*` tool. Lio projects are listed with the generic
`list_projects` tool and deployed with `ftp_upload`.

---

## 30. Newsletter

**Add-on**: none — core. Settings section:
**Settings → Integrations → Newsletter**.

An opt-in for product update emails: your address and a consent checkbox. It is
not an integration the model can use, and it exposes no tool.

---

## Disabling and Removing Integrations

There are two levels, and they do different things.

**Clear the credentials** — open the integration's card under
**Settings → Integrations** and remove the token, key, or connection. The
add-on stays on, the tools stay offered, and they will fail until you enter
credentials again.

**Switch the add-on off** — on the **Add-Ons** page. The tools stop being
offered to the model entirely and the settings card disappears from the Standard
view. Your stored credentials are not deleted; switching the add-on back on
restores the integration as it was.

For a clean break, do both: clear the credentials, then switch the add-on off.
Also revoke Skales' access on the service's own side (bot token, OAuth app,
API key), because that is the only step that stops the credential from working
anywhere.

---

## Troubleshooting Integration Issues

**"Connection Failed"**:
- Verify your API key or token is correct
- Check that your account has the necessary permissions
- Ensure your credentials haven't expired (some services rotate keys)

**"Access Denied"**:
- Check that you granted the required permissions during OAuth
- Disconnect and reconnect to re-authorize
- Some services require you to approve third-party access in their settings

**"Rate Limited"**:
- Some APIs have rate limits. Skales respects these limits
- Wait a few minutes before retrying
- Check your service's API quota dashboard

**"Integration Not Showing"**:
- Check the **Add-Ons** page. A switched-off add-on hides its settings card in
  the Standard settings view.
- Switch the settings page from **Standard** to **Advanced**. Some sections
  (Jina, FTP, API Connector, Hooks, HTTP Request, Swarm) only appear there.
- If it is in the **Retired integrations** section below, it is gone on purpose.

**"Skales says it cannot do this"**:
- The most common cause is a switched-off add-on. Its tools are not offered to
  the model at all, so the model has nothing to refuse with.
- Second most common: the add-on is on but has no credentials yet.

---

## Best Practices

1. **Use service-specific credentials**: bot tokens, app passwords, or scoped
   API keys rather than your main account password.
2. **Minimal permissions**: grant only the scopes Skales actually needs. Every
   scope you grant is a scope the model can use.
3. **Switch off what you do not use**: an add-on that is off contributes no
   tools to the turn. That is smaller attack surface and a shorter tool list
   for the model to choose from.
4. **Review access on the service side**: check the connected-apps list of each
   service periodically and revoke what you no longer use. Clearing a card in
   Skales does not revoke anything upstream.
5. **Rotate credentials**: regenerate keys and tokens on a schedule, and
   immediately if one has been exposed.

---

## Retired integrations

These are not available and cannot be switched back on. Their ids are kept only
so that old settings files still load; the app force-disables them on start.

**GitHub** — the native GitHub skill is gone. Its personal-access-token UI was
wired to code with no runtime callers, so it did nothing. GitHub still works,
through an MCP server (`@modelcontextprotocol/server-github`) configured under
**Settings → Integrations → MCP Servers**. That is the supported path.

**Casting (DLNA)** — URL casting worked, but mirroring a window or streaming
media to a TV needs a LAN media server and a per-device transcode matrix. It was
withdrawn rather than shipped half-working.

**Playground** — withdrawn pending a rework. The page, its settings tab, and its
Add-Ons card are hidden for everyone, including users who previously had it on.

---

## Questions

- Discussions: <https://github.com/skalesapp/skales/discussions>
- Requests for an integration that is not listed here: the **Feedback** form in
  the app, or `request@skales.app`.
