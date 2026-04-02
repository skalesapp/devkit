#!/bin/bash
# Batch rename files using Skales AI
# Usage: ./batch-rename.sh "rename all .jpeg files to .jpg"

SKALES_URL="${SKALES_URL:-http://localhost:3000}"
TOKEN="${SKALES_TOKEN:-your-token}"

if [ -z "$1" ]; then
  echo "Usage: $0 \"rename instruction\""
  exit 1
fi

curl -N -X POST "$SKALES_URL/api/cli/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"$1\"}"

echo ""
