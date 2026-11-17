#!/usr/bin/env bash
# One-shot InsForge setup for Forest Haven Farm.
# Run from the repo root:   bash scripts/setup-insforge.sh
#
# It logs you in, links/creates the InsForge project, builds the database,
# creates the media bucket, applies auth settings, deploys the order-email
# function + its 10-minute schedule, writes frontend/.env, and starts the site
# locally. Safe to re-run: steps that are already done are skipped or harmless.
set -euo pipefail

cd "$(dirname "$0")/.."
CLI="npx --yes @insforge/cli"

step() { printf '\n\033[1;33m==> %s\033[0m\n' "$1"; }

# Reads one secret's value, whatever JSON shape the CLI returns.
secret() {
  $CLI --json secrets get "$1" | node -e '
    let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
      let j; try { j = JSON.parse(s); } catch { console.log(s.trim()); return; }
      const v = typeof j === "string" ? j : (j.value ?? j.secret?.value ?? j.data?.value ?? j.data);
      console.log(typeof v === "string" ? v : "");
    });'
}

command -v node >/dev/null || { echo "Node.js 18+ is required: https://nodejs.org"; exit 1; }

step "1/8  Log in to InsForge (a browser window opens)"
$CLI whoami >/dev/null 2>&1 || $CLI login

step "2/8  Link this folder to an InsForge project (pick or create one)"
echo "   Script version: 3   Folder: $(pwd)"
if [ ! -f .insforge/project.json ]; then
  echo "   Your InsForge projects:"
  $CLI list || true
  echo
  read -r -p "   Paste a project ID to use, or press Enter to create a new 'forest-haven-farm' project: " PROJECT_ID
  if [ -n "$PROJECT_ID" ]; then
    $CLI link --project-id "$PROJECT_ID"
  else
    $CLI create --name forest-haven-farm --template empty --region us-east
  fi
  [ -f .insforge/project.json ] || { echo "Project still not linked (no .insforge/project.json in $(pwd)) — paste the output above to Claude."; exit 1; }
fi

step "3/8  Create tables, functions and default content"
$CLI db migrations up --all

step "4/8  Create the public 'media' bucket for admin uploads"
$CLI storage create-bucket media --public || echo "   (bucket probably exists already — continuing)"

step "5/8  Apply auth / storage settings from insforge.toml"
$CLI config apply

BASE_URL="$(secret INSFORGE_BASE_URL || true)"
if [ -z "$BASE_URL" ]; then
  # Fall back to the linked project's host
  HOST="$($CLI current | sed -n 's/^ *OSS Host: *//p' | head -1)"
  [ -n "$HOST" ] && BASE_URL="https://${HOST#https://}"
fi
ANON_KEY="$(secret ANON_KEY)"
if [ -z "$BASE_URL" ] || [ -z "$ANON_KEY" ]; then
  echo "Couldn't read INSFORGE_BASE_URL / ANON_KEY. Run: $CLI secrets get ANON_KEY and paste the output to Claude."
  exit 1
fi
echo "   Project API: $BASE_URL"

step "6/8  Deploy the order-emails function and its 10-minute safety-net schedule"
$CLI functions deploy order-emails --file functions/order-emails.ts --name "Order emails"
$CLI secrets add SITE_URL "http://localhost:5173" 2>/dev/null || $CLI secrets update SITE_URL --value "http://localhost:5173" || true
$CLI schedules create --name order-emails-sweep --cron "*/10 * * * *" \
  --method POST --url "$BASE_URL/functions/order-emails" \
  --headers '{"Content-Type":"application/json"}' --body '{}' \
  || echo "   (schedule probably exists already — continuing)"

step "7/8  Write frontend/.env and install packages"
cat > frontend/.env <<EOF
VITE_INSFORGE_BASE_URL=$BASE_URL
VITE_INSFORGE_ANON_KEY=$ANON_KEY
EOF
(cd frontend && npm install)

step "8/8  Starting the site — open http://localhost:5173  (Ctrl+C to stop)"
echo "   Then go to http://localhost:5173/admin/login to create the admin account."
cd frontend && npm run dev
