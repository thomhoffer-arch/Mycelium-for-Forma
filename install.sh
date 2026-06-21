#!/usr/bin/env bash
# One-click installer for mycelium-for-forma
# Usage: bash install.sh

set -euo pipefail

CONNECTOR_DIR="$(cd "$(dirname "$0")/mycelium-draft/connectors/forma" && pwd)"
ENV_FILE="$CONNECTOR_DIR/.env"
ENV_EXAMPLE="$CONNECTOR_DIR/.env.example"

# ── colours ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BOLD='\033[1m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $*"; }
warn() { echo -e "${YELLOW}!${NC} $*"; }
fail() { echo -e "${RED}✗ $*${NC}" >&2; exit 1; }
hdr()  { echo -e "\n${BOLD}$*${NC}"; }

# ── 1. Node.js check ───────────────────────────────────────────────────────────
hdr "1/4  Checking prerequisites"
if ! command -v node &>/dev/null; then
  fail "Node.js not found. Install Node 18+ from https://nodejs.org and re-run."
fi
NODE_MAJOR=$(node -e "process.stdout.write(String(process.versions.node.split('.')[0]))")
if [ "$NODE_MAJOR" -lt 18 ]; then
  fail "Node.js $NODE_MAJOR found — version 18 or higher required."
fi
ok "Node.js $(node --version)"

if ! command -v npm &>/dev/null; then
  fail "npm not found. It ships with Node.js — check your installation."
fi
ok "npm $(npm --version)"

# ── 2. Install dependencies ────────────────────────────────────────────────────
hdr "2/4  Installing dependencies"
cd "$CONNECTOR_DIR"
npm install --silent
ok "Dependencies installed (mycelium-sdk local stub)"

# ── 3. Environment setup ───────────────────────────────────────────────────────
hdr "3/4  Environment setup"
if [ -f "$ENV_FILE" ]; then
  ok ".env already exists — skipping creation"
else
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo ""
  echo "  The connector needs two values to talk to the Forma API."
  echo "  Press Enter to skip a field and fill it in later via .env"
  echo ""

  read -rp "  FORMA_TOKEN (APS OAuth Bearer): " input_token
  read -rp "  FORMA_PROJECT_ID:               " input_project

  if [ -n "$input_token" ]; then
    sed -i "s|^FORMA_TOKEN=.*|FORMA_TOKEN=$input_token|" "$ENV_FILE"
  fi
  if [ -n "$input_project" ]; then
    sed -i "s|^FORMA_PROJECT_ID=.*|FORMA_PROJECT_ID=$input_project|" "$ENV_FILE"
  fi
  ok ".env written to $ENV_FILE"
fi

# load .env into current shell
set -o allexport
# shellcheck source=/dev/null
source "$ENV_FILE"
set +o allexport

# ── 4. Smoke test ──────────────────────────────────────────────────────────────
hdr "4/4  Smoke test"
if [ -z "${FORMA_TOKEN:-}" ]; then
  warn "FORMA_TOKEN not set — running against stub data only."
fi

OUTPUT=$(node connector.mjs 2>&1) && STATUS=0 || STATUS=$?

echo "$OUTPUT" | head -40

if [ $STATUS -eq 0 ]; then
  ok "connector.mjs exited 0 — conformant: true"
else
  warn "connector.mjs exited $STATUS"
  if echo "$OUTPUT" | grep -q "conformant.*false"; then
    warn "Some records failed conformance — check output above."
  elif echo "$OUTPUT" | grep -q "FORMA_TOKEN required"; then
    warn "No token set — add FORMA_TOKEN to $ENV_FILE and re-run."
  else
    warn "Unexpected error — check output above."
  fi
fi

# ── Done ───────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Done.${NC}"
echo ""
echo "  To run again at any time:"
echo "    cd $CONNECTOR_DIR"
echo "    node connector.mjs"
echo ""
echo "  Edit credentials:  $ENV_FILE"
echo "  Wire to real Forma: replace fetchSource() in connector.mjs"
