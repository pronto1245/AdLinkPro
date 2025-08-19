#!/usr/bin/env bash
set -euo pipefail
API="${API:-https://central-matelda-pronto12-95b8129d.koyeb.app}"
LOGIN="${LOGIN:-/api/auth/login}"

need() { command -v "$1" >/dev/null || { echo "Install $1"; exit 1; }; }
need curl; need jq

norm(){
  r="$(echo -n "${1:-}" | tr '[:lower:]' '[:upper:]' | sed -E 's/[ -]+/_/g')"
  case "$r" in
    SUPERADMIN) echo SUPER_ADMIN ;;
    PUBLISHER)  echo PARTNER ;;
    *)          echo "$r" ;;
  esac
}

route(){
  case "$1" in
    OWNER)        echo /dashboard/owner ;;
    ADVERTISER)   echo /dashboard/advertiser ;;
    AFFILIATE)    echo /dashboard/affiliate ;;
    PARTNER)      echo /dashboard/partner ;;
    SUPER_ADMIN)  echo /dashboard/super-admin ;;
    STAFF)        echo /dashboard/staff ;;
    *)            echo /login ;;
  esac
}

t(){
  e="$1"; p="$2"; x="$3"
  j="$(curl -s -X POST "$API$LOGIN" -H 'Content-Type: application/json' -d "{\"email\":\"$e\",\"password\":\"$p\"}")"
  r="$(echo "$j" | jq -r '.user.role // .role // empty')"
  [ -z "$r" ] && { echo "X $e  resp=$j"; return 1; }
  R="$(norm "$r")"
  h="$(route "$R")"
  tok="$(echo "$j" | jq -r '.token // empty')"
  ok="OK"; [ "$R" != "$x" ] && ok="WRN"
  echo "$ok $e  role:$R  expect:$x  home:$h  token:$([ -n "$tok" ] && echo yes || echo no)"
}

echo "API $API$LOGIN"
t "9791207@gmail.com" "owner123" "OWNER"
t "12345@gmail.com" "adv123" "ADVERTISER"
t "4321@gmail.com" "partner123" "PARTNER"
t "superadmin@gmail.com" "77GeoDav=" "SUPER_ADMIN"
t "pablota096@gmail.com" "7787877As" "AFFILIATE"
