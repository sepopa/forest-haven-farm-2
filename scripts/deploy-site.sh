#!/usr/bin/env bash
# Puts the website on the internet with InsForge Sites (hosted on Vercel).
# Run from the repo root, after setup-insforge.sh:   bash scripts/deploy-site.sh
set -euo pipefail

cd "$(dirname "$0")/.."
CLI="npx --yes @insforge/cli"
SLUG="${1:-foresthavenfarm}"
SITE="https://${SLUG}.insforge.site"

step() { printf '\n\033[1;33m==> %s\033[0m\n' "$1"; }

[ -f .insforge/project.json ] || { echo "Not linked to an InsForge project — run scripts/setup-insforge.sh first."; exit 1; }
[ -f frontend/.env ] || { echo "frontend/.env is missing — run scripts/setup-insforge.sh first."; exit 1; }

# shellcheck disable=SC1091
set -a; . frontend/.env; set +a
[ -n "${VITE_INSFORGE_BASE_URL:-}" ] && [ -n "${VITE_INSFORGE_ANON_KEY:-}" ] || { echo "frontend/.env needs VITE_INSFORGE_BASE_URL and VITE_INSFORGE_ANON_KEY."; exit 1; }

step "1/4  Give the live site its InsForge settings"
$CLI deployments env set VITE_INSFORGE_BASE_URL "$VITE_INSFORGE_BASE_URL"
$CLI deployments env set VITE_INSFORGE_ANON_KEY "$VITE_INSFORGE_ANON_KEY"

step "2/4  Build and deploy the frontend (takes a minute or two)"
$CLI deployments deploy ./frontend

step "3/4  Claim the address $SITE"
$CLI deployments slug "$SLUG" || echo "   (couldn't claim '$SLUG' — it may be taken; re-run with another name: bash scripts/deploy-site.sh my-name)"

step "4/4  Point login links and order emails at the live site"
# Login confirmation / password-reset links must be allowed to return here.
node -e '
  const fs = require("fs"); const site = process.argv[1];
  let t = fs.readFileSync("insforge.toml", "utf8");
  t = t.replace(/https:\/\/[a-z0-9-]+\.insforge\.site/g, site);
  t = t.replace(/subdomain = "[^"]*"/, `subdomain = "${site.split("//")[1].split(".")[0]}"`);
  fs.writeFileSync("insforge.toml", t);
' "$SITE"
$CLI config apply --auto-approve
$CLI secrets update SITE_URL --value "$SITE" 2>/dev/null || $CLI secrets add SITE_URL "$SITE"

echo
$CLI deployments metadata || true
printf '\n\033[1;32mDone — your site should be live at %s\033[0m\n' "$SITE"
echo "Admin panel: $SITE/admin/login"
