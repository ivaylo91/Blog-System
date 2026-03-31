#!/usr/bin/env bash
# Usage: NETLIFY_AUTH_TOKEN=... SITE_ID=... ./scripts/netlify-set-upstash-env.sh
# This script patches Netlify site build environment to add UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, and CSP_REPORT_ONLY.

set -euo pipefail

if [[ -z "${NETLIFY_AUTH_TOKEN:-}" || -z "${SITE_ID:-}" ]]; then
  echo "Please set NETLIFY_AUTH_TOKEN and SITE_ID environment variables before running."
  exit 1
fi

read -r -p "UPSTASH_REDIS_REST_URL: " UPSTASH_REDIS_REST_URL
read -r -p "UPSTASH_REDIS_REST_TOKEN: " UPSTASH_REDIS_REST_TOKEN
read -r -p "CSP_REPORT_ONLY (0 or 1): " CSP_REPORT_ONLY

echo "Patching Netlify site environment..."

PATCH_PAYLOAD=$(jq -n --arg url "$UPSTASH_REDIS_REST_URL" --arg token "$UPSTASH_REDIS_REST_TOKEN" --arg csp "$CSP_REPORT_ONLY" '{build_settings: {env: {UPSTASH_REDIS_REST_URL: $url, UPSTASH_REDIS_REST_TOKEN: $token, CSP_REPORT_ONLY: $csp}}}')

curl -s -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${NETLIFY_AUTH_TOKEN}" \
  -d "$PATCH_PAYLOAD" \
  "https://api.netlify.com/api/v1/sites/${SITE_ID}" | jq -C '.'

echo "Done. Verify in Netlify site settings -> Build & deploy -> Environment."
