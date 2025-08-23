#!/bin/sh
set -eu

# --- Config ---
ROOT="${ROOT:-$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)}"
API_BASE="${API_BASE:-http://localhost:5050}"
EMAIL="${EMAIL:-owner@test.com}"
PASSWORD="${PASSWORD:-Owner123!}"

echo "== ROOT: $ROOT"
echo "== API_BASE: $API_BASE"

# --- Discover routes from server code ---
echo "== Discovering routes in server/ =="
cd "$ROOT/server"

# temp files
ROUTES_FILE="$(mktemp -t routes.XXXXXX)"
trap 'rm -f "$ROUTES_FILE" "$LOGIN_FILE" 2>/dev/null || true' EXIT HUP INT TERM

# extract "METHOD PATH"
# supports app.get('/x'), router.post("/y")
grep -RhoE "(router|app)\.(get|post|put|patch|delete)[[:space:]]*\\([[:space:]]*['\"][^'\"[:space:]]+" . \
  | sed -E "s/.*\.(get|post|put|patch|delete)[[:space:]]*\\([[:space:]]*'([^']+).*/\1 \2/I" \
  | sed -E "s/.*\.(get|post|put|patch|delete)[[:space:]]*\\([[:space:]]*\"([^\"]+).*/\1 \2/I" \
  | tr 'A-Z' 'a-z' \
  | sort -u > "$ROUTES_FILE" || true

sed 's/^/  /' "$ROUTES_FILE" || true

# --- Login to get token ---
echo "== LOGIN =="
LOGIN_FILE="$(mktemp -t login.XXXXXX)"
curl -sS -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" > "$LOGIN_FILE" || true

TOKEN=""
if command -v jq >/dev/null 2>&1; then
  TOKEN="$(jq -r '.token // empty' < "$LOGIN_FILE" || true)"
elif command -v python3 >/dev/null 2>&1; then
  TOKEN="$(python3 - <<'PY' "$LOGIN_FILE" 2>/dev/null || true
import sys, json
try:
    data=json.load(open(sys.argv[1]))
    print(data.get("token",""))
except Exception:
    print("")
PY
)"
else
  # naive fallback (best-effort)
  TOKEN="$(sed -n 's/.*"token"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$LOGIN_FILE" | head -n1 || true)"
fi

if [ -n "$TOKEN" ]; then
  echo "OK token acquired (${#TOKEN} chars)"
  AUTHZ_HEADER="Authorization: Bearer $TOKEN"
else
  echo "!! No token from /api/auth/login (protected routes may return 401/403)"
  AUTHZ_HEADER=""
fi

# --- Core endpoints by module (safe GETs) ---
echo "== SMOKE: core endpoints (modules) =="
for URL in \
  /api/me \
  /api/menu/data \
  /api/settings \
  /api/admin/system-settings \
  /api/admin/users \
  /api/admin/roles \
  /api/admin/postbacks \
  /api/postbacks \
  /api/advertiser/postbacks \
  /api/notifications \
  /api/admin/notifications \
  /api/stats/summary \
  /api/stats/timeseries \
  /api/analytics/overview \
; do
  printf -- "-- GET %s\n" "$URL"
  if [ -n "$AUTHZ_HEADER" ]; then
    curl -sS -o /dev/null -w "HTTP %{http_code} %header{content-type}\n" \
      -H "$AUTHZ_HEADER" "$API_BASE$URL" || echo "ERR"
  else
    curl -sS -o /dev/null -w "HTTP %{http_code} %header{content-type}\n" \
      "$API_BASE$URL" || echo "ERR"
  fi
done

# --- Discovered routes pass ---
echo "== SMOKE: discovered routes =="
# For some known paths, enforce POST; otherwise use GET (safer)
while IFS= read -r LINE; do
  [ -z "$LINE" ] && continue
  METHOD="$(printf %s "$LINE" | awk '{print $1}')"
  PATH="$(printf %s "$LINE" | awk '{print $2}')"

  # skip obvious non-app routes
  case "$PATH" in
    /health|/healthz|/status|/docs*|/swagger*) continue ;;
  esac

  # choose method safely (override for known POST endpoints)
  USE_METHOD="GET"
  case "$PATH" in
    /api/auth/login|/api/auth/logout|/api/auth/refresh)
      USE_METHOD="POST"
      ;;
  esac

  # prepare curl args
  if [ "$USE_METHOD" = "GET" ]; then
    BODY_ARGS=""
    CT_HEADER=""
  else
    BODY_ARGS="-d {}"
    CT_HEADER="-H Content-Type: application/json"
  fi

  printf -- "-- %s %s\n" "$USE_METHOD" "$PATH"
  if [ -n "$AUTHZ_HEADER" ]; then
    # shellcheck disable=SC2086
    curl -sS -o /dev/null -w "HTTP %{http_code} %header{content-type}\n" \
      -H "$AUTHZ_HEADER" -X "$USE_METHOD" "$API_BASE$PATH" $CT_HEADER $BODY_ARGS || echo "ERR"
  else
    # shellcheck disable=SC2086
    curl -sS -o /dev/null -w "HTTP %{http_code} %header{content-type}\n" \
      -X "$USE_METHOD" "$API_BASE$PATH" $CT_HEADER $BODY_ARGS || echo "ERR"
  fi
done < "$ROUTES_FILE"

echo "== DONE =="
echo "401/403 на защищённых разделах без нужной роли — нормально."
echo "404 — путь не совпал; сверяй с 'Discovering routes'. 500 — смотри стек в логах сервера."

