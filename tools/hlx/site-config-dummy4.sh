#!/usr/bin/env bash
# HLX admin site config for ynaka-adobe / dummy4
# Captured from tools.aem.live (POST with JSON body + x-auth-token).
#
# Usage:
#   export HLX_AUTH_TOKEN="…"   # Full JWT from DevTools → Network → x-auth-token (starts with eyJ…)
#   ./tools/hlx/site-config-dummy4.sh post   # apply tools/hlx/dummy4-request.json
#   ./tools/hlx/site-config-dummy4.sh get    # fetch current config (optional token)
#
# Body file override: BODY_FILE=/path/to.json ./tools/hlx/site-config-dummy4.sh post
#
# If the site never appears: this endpoint saves config for an existing site name; you may still
# need to create the site in Cloud Manager / https://tools.aem.live first, and use a valid JWT.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
URL="https://admin.hlx.page/config/ynaka-adobe/sites/dummy4.json"
BODY="${BODY_FILE:-${DIR}/dummy4-request.json}"

curl_json() {
  local method=$1
  shift
  local tmp out code
  tmp="$(mktemp)"
  code="$(curl -sS -o "$tmp" -w "%{http_code}" "$@")"
  out="$(cat "$tmp")"
  rm -f "$tmp"
  if [[ -n "$out" ]]; then
    echo "$out"
  fi
  echo "HTTP $code" >&2
  if [[ "$code" -lt 200 || "$code" -ge 300 ]]; then
    echo "Request failed. Use a full JWT in HLX_AUTH_TOKEN (from a real admin/tools request), not a short key." >&2
    return 1
  fi
  return 0
}

cmd="${1:-post}"
case "$cmd" in
  get)
    if [[ -n "${HLX_AUTH_TOKEN:-}" ]]; then
      curl_json GET -X GET "$URL" \
        -H 'accept: */*' \
        -H "x-auth-token: ${HLX_AUTH_TOKEN}"
    else
      curl_json GET -X GET "$URL" -H 'accept: */*'
    fi
    ;;
  post)
    : "${HLX_AUTH_TOKEN:?Set HLX_AUTH_TOKEN (JWT for admin.hlx.page)}"
    [[ -f "$BODY" ]] || { echo "Missing body file: $BODY" >&2; exit 1; }
    curl_json POST -X POST "$URL" \
      -H 'accept: */*' \
      -H 'content-type: application/json' \
      -H 'origin: https://tools.aem.live' \
      -H 'referer: https://tools.aem.live/' \
      -H "x-auth-token: ${HLX_AUTH_TOKEN}" \
      --data-binary @"$BODY"
    ;;
  *)
    echo "usage: $0 [get|post]  (default: post)" >&2
    exit 1
    ;;
esac
