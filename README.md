# Forest Haven Farm

Website + small CRM for Forest Haven Farm's sourdough bread: public site (menu, orders, contact, EN/ES) and an admin panel (orders, pickup dates and reports, messages, content editing, media, analytics).

**Stack:** React + Vite frontend, with [InsForge](https://insforge.dev) as the whole backend. There is no separate server anymore. The old FastAPI backend was replaced by:

| Was (FastAPI) | Now (InsForge) | Where |
|---|---|---|
| SQLAlchemy models on Neon/SQLite | InsForge Postgres + row-level security | `migrations/20261117000100_core-schema.sql` |
| API routes (orders, pickup dates, content, reports, analytics…) | Postgres functions called with `insforge.database.rpc()` | `migrations/20261117000200_api-functions.sql` |
| `seed_content.py` | Seed migration (only fills missing rows) | `migrations/20261117000300_seed-content.sql` |
| Username/password + JWT, reset emails via Brevo | InsForge Auth (email login, built-in reset emails) | `frontend/src/api.js`, `frontend/src/admin/` |
| Cloudinary / local disk uploads | InsForge Storage, public `media` bucket | `frontend/src/api.js` |
| Brevo order emails | Edge function using InsForge's email sender | `functions/order-emails.ts` |
| Render hosting | InsForge Sites (deployed on Vercel) | `frontend/vercel.json` |

`frontend/src/api.js` keeps every function name and response shape it had before, so the pages themselves are unchanged.

## How security works

InsForge gives the public (anon) key access to every table by default, so **every table has row-level security on**:

- Visitors can only read site content. Everything else (placing an order, sending a message, logging a page view) goes through validated functions that run on the server, and prices always come from the menu, never from the browser.
- Being signed in is **not** enough to be an admin. Admins are the accounts listed in the `admins` table. The first account that signs up at `/admin/login` claims that role, and nobody else can afterwards.
- `admin_*` functions refuse to run for anyone who isn't an admin.

## One-time setup

You need Node 18+ and an InsForge account. Run everything from the repo root.

```bash
# 1. Connect this folder to an InsForge project (create one when prompted)
npx @insforge/cli login
npx @insforge/cli link

# 2. Create the tables, functions and default content
npx @insforge/cli db migrations up --all

# 3. Storage bucket for admin photo/video uploads (public, so the site can show them)
npx @insforge/cli storage create-bucket media --public

# 4. Auth settings (redirect URLs, reset-by-link, 15 MB uploads, site subdomain).
#    Edit the domains in insforge.toml first if you're using your own.
npx @insforge/cli config apply

# 5. Order-email function, plus its settings
npx @insforge/cli functions deploy order-emails --file functions/order-emails.ts
npx @insforge/cli secrets add SITE_URL https://foresthavenfarm.insforge.site
npx @insforge/cli secrets add ORDER_NOTIFY_EMAIL epforest@yahoo.com   # fallback only

# 6. Safety net: re-send any order emails the browser didn't trigger, every 10 min
npx @insforge/cli secrets get INSFORGE_BASE_URL   # copy this value into the URL below
npx @insforge/cli schedules create --name order-emails-sweep --cron "*/10 * * * *" \
  --method POST --url "<INSFORGE_BASE_URL>/functions/order-emails" \
  --headers '{"Content-Type":"application/json"}' --body '{}'
```

### Frontend

```bash
cd frontend
cp .env.example .env    # fill in the two values:
npx @insforge/cli secrets get INSFORGE_BASE_URL   # -> VITE_INSFORGE_BASE_URL
npx @insforge/cli secrets get ANON_KEY            # -> VITE_INSFORGE_ANON_KEY
npm install
npm run dev             # http://localhost:5173
```

### Deploy the site

```bash
npx @insforge/cli deployments env set VITE_INSFORGE_BASE_URL <value>
npx @insforge/cli deployments env set VITE_INSFORGE_ANON_KEY <value>
npx @insforge/cli deployments deploy ./frontend
```

The site is served at `https://foresthavenfarm.insforge.site` (or whatever `[deployments] subdomain` says). To use your own domain, add it in the InsForge dashboard under Sites and create the DNS record it shows you. Then add the new `/admin/login` and `/admin/reset-password` URLs to `allowed_redirect_urls` and run `config apply` again.

### Create the admin account

1. Open `/admin/login` on the live site. It shows "Create the admin account" while no admin exists.
2. Sign up with the owner's email. InsForge emails a confirmation link. After confirming, sign in, and that first sign-in makes this account the admin.
3. **Close sign-ups:** set `disable_signup = true` in `insforge.toml` and run `npx @insforge/cli config apply`. Extra accounts can't reach any admin data anyway, but closing sign-ups also stops strangers from uploading files to the media bucket.

Passwords are changed and reset with emailed links: use **Admin → Account**, or "Forgot your password?" on the login page.

## Moving your existing data

Table and column names match the old database, so you can copy the old Postgres (Neon) data across directly. Do this **before** creating the admin account, then run the clean-up SQL.

```bash
# From the OLD database: data only, the tables the new schema knows about
pg_dump "$OLD_DATABASE_URL" --data-only --no-owner --no-privileges \
  -t orders -t order_items -t pickup_dates -t contact_messages -t content_blocks -t page_views \
  > old-data.sql
```

The seed migration already created default `content_blocks` rows, and the dump would collide with them. Clear those first, then load the dump with `psql` using the database connection string from the InsForge dashboard:

```sql
delete from content_blocks;
\i old-data.sql

-- Don't email old customers again: mark every imported order as already emailed
update orders set emails_sent_at = created_at where emails_sent_at is null;

-- Continue id numbering after the imported rows
select setval(pg_get_serial_sequence('orders','id'),           coalesce(max(id),1)) from orders;
select setval(pg_get_serial_sequence('order_items','id'),      coalesce(max(id),1)) from order_items;
select setval(pg_get_serial_sequence('pickup_dates','id'),     coalesce(max(id),1)) from pickup_dates;
select setval(pg_get_serial_sequence('contact_messages','id'), coalesce(max(id),1)) from contact_messages;
select setval(pg_get_serial_sequence('content_blocks','id'),   coalesce(max(id),1)) from content_blocks;
select setval(pg_get_serial_sequence('page_views','id'),       coalesce(max(id),1)) from page_views;
```

Photos already uploaded to Cloudinary keep working, because their URLs are stored in the content. New uploads go to InsForge Storage. The old admin login is not carried over (InsForge Auth has its own accounts), so create the admin account as described above.

## Day-to-day notes

- **Schema changes:** add a new file with `npx @insforge/cli db migrations new <name>`, then run `db migrations up --all`. Never edit a migration that has already been applied.
- **Time zone:** "today", order cutoffs and daily analytics use `America/New_York` (see `fhf_today()`).
- **Emails** come from `noreply@<project>.send.insforge.dev` with the display name "Forest Haven Farm". Replies go to the customer (owner email) or to the owner (customer email). To send from your own domain, set up `[auth.smtp]` in `insforge.toml`; Brevo's SMTP relay works fine there.
- **Free plan:** InsForge may pause free projects after a period of inactivity. Check the current pricing page before relying on it for live orders.
- `static-site/` is the original static HTML prototype and isn't used by the app.
