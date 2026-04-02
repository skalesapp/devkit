#!/bin/bash
# Generate a daily report using Skales AI
# Add to crontab: 0 9 * * * /path/to/daily-report.sh

SKALES_URL="${SKALES_URL:-http://localhost:3000}"
TOKEN="${SKALES_TOKEN:-your-token}"

MESSAGE="Generate a brief daily report: summarize my recent tasks, check my calendar for today, and list any unread emails."

curl -s -X POST "$SKALES_URL/api/cli/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"$MESSAGE\"}" | \
  grep '"type":"text"' | \
  sed 's/.*"content":"\(.*\)".*/\1/' | \
  tr -d '\n'

echo ""
