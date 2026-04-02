# Integrations Setup Guide

Skales connects to 14 external services, enabling powerful workflows across productivity, smart home, social, and development tools. Configure integrations in **Settings → Integrations**.

---

## 1. Notion

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

**Overview**: Manage calendar events and sync schedules.

**Getting Started**:
1. In Skales: **Settings → Integrations → Google Calendar**
2. Click "Connect with Google"
3. Select your Google account and grant calendar access
4. Approve the requested permissions

**Available Tools**:
- List events in specified date ranges
- Create new calendar events
- Update existing events
- Delete events

**Use Cases**:
- Check your schedule without leaving Skales
- Create meeting notes automatically
- Schedule follow-ups based on conversations
- Sync external calendars

**Privacy**: Skales uses OAuth and respects Google's privacy controls.

---

## 12. Twitter/X

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

## Disabling and Removing Integrations

1. Go to **Settings → Integrations**
2. Click the integration you want to disable
3. Click "Disconnect" or "Remove"
4. Your data is not deleted; you can reconnect anytime
5. Any tools provided by that integration will be unavailable

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
- Some integrations are optional features. Enable them in Settings
- Restart Skales if you just added them
- Check that your plan supports this integration

---

## Best Practices

1. **Use Service-Specific Credentials**: Create bot tokens, app passwords, or service-specific keys rather than using your main password
2. **Minimal Permissions**: Grant only the permissions Skales actually needs
3. **Monitor Access**: Regularly check your service's connected apps and revoke access you no longer use
4. **Rotate Credentials**: Periodically regenerate API keys and tokens as a security best practice
5. **Environment Variables**: For advanced users, consider using environment variables to manage sensitive credentials
