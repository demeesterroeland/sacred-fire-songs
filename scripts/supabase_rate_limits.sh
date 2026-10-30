#!/usr/bin/env bash
# Determine the root directory of the project
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load environment variables from .env.local
if [ -f "$ROOT_DIR/.env.local" ]; then
  # shellcheck disable=SC2046  # word splitting into KEY=VALUE pairs is intended
  export $(grep -v '^#' "$ROOT_DIR/.env.local" | xargs)
fi

# Use variables from environment
export SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN}"
export PROJECT_REF="${SUPABASE_PROJECT_ID}"

if [ -z "$SUPABASE_ACCESS_TOKEN" ] || [ -z "$PROJECT_REF" ]; then
  echo "Error: SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_ID not set."
  echo "Make sure they are defined in your .env.local file."
  exit 1
fi

# Get current rate limits
curl -X GET "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  | jq 'to_entries | map(select(.key | startswith("rate_limit_"))) | from_entries'

# Update rate limits
curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rate_limit_anonymous_users": 10,
    "rate_limit_email_sent": 10,
    "rate_limit_sms_sent": 10,
    "rate_limit_verify": 10,
    "rate_limit_token_refresh": 10,
    "rate_limit_otp": 10,
    "rate_limit_web3": 10
  }'