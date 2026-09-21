# Recheck

Continuous **EAA / BFSG accessibility re-check** and **honest accessibility statement drafts** for mid-size EU-facing ecommerce shops.

Recheck crawls money pages with a headless browser, runs axe-core on rendered HTML, ranks what it found, and drafts a statement from open gaps plus surfaces it did **not** check.

It is **not** a WCAG certification, legal sign-off, overlay, or “EAA-ready” badge. Silence is not a pass.

## Start (local demo)

Requires Node.js 20+.

```bash
npm install
npx playwright install chromium
cp .env.example .env   # already defaults to SQLite
npx prisma db push     # also runs automatically via npm run dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

1. Paste a storefront URL, or click **Fill local demo shop** (served at `/demo-shop`).
2. Optional: add home / PLP / PDP / cart / checkout URLs.
3. Start scan. Issues appear as each path finishes.
4. Read the ranked list, export CSV, or open the shareable issue list.
5. Copy the statement draft. Re-scan the same shop to see `N new, M cleared since last scan`.

If Playwright browsers are missing: `npx playwright install --with-deps chromium`.

### Env vars

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `file:./dev.db` | Prisma database. SQLite path is relative to `prisma/`. The Docker image defaults to `file:/data/recheck.db`. |
| `PORT` | `3000` | Port for `next start`. Railway and Render set this. `npm start` does not pin a port. |
| `PLAYWRIGHT_BROWSERS_PATH` | unset | Optional override for Chromium install location. The Docker image sets `/ms-playwright`. |
| `RECHECK_OPERATOR_NAME` | unset | Legal name on `/imprint`. If unset, the field stays a labeled TODO. |
| `RECHECK_OPERATOR_ADDRESS` | unset | Postal address on `/imprint`. Use `\n` for line breaks. If unset, TODO. |
| `RECHECK_CONTACT_EMAIL` | unset | Contact email on `/imprint`. If unset, TODO. |

No env vars are required for the UI, cookie notice, or legal pages. Leave the operator variables empty until the details are real. Do not invent a commercial register number or VAT ID — those rows stay “not provided” on purpose.

The imprint reads operator env vars on each request (`/imprint` is dynamic). Set them in the host (Railway) or in `.env` locally; a rebuild is not required for them to show up.

### Postgres instead of SQLite

SQLite is the local default. For Postgres:

1. `docker compose up -d`
2. In `prisma/schema.prisma`, set `provider = "postgresql"`
3. In `.env`: `DATABASE_URL="postgresql://recheck:recheck@localhost:5432/recheck"`
4. `npx prisma db push`

### Commands

```bash
npm run dev          # generate client, push schema, Next.js on :3000
npm run build        # production build
npm start            # next start --hostname 0.0.0.0 (PORT, default 3000)
npm test             # unit tests (statement template, ranking, diffs, IDs)
npm run verify:loop  # end-to-end against a running server (see below)
```

Core-loop check (server must already be running):

```bash
npm run dev          # in one terminal
npm run verify:loop  # in another
```

## What v1 does

1. Paste a storefront URL and optional money pages (home, PLP, PDP, cart, checkout).
2. Crawl those pages with Playwright. Run axe-core on the rendered DOM. Rank by severity and path criticality (checkout / cart / PDP higher than home).
3. Show a ranked issue list with **stable IDs**. Export CSV. Share `/s/{scanId}`. (In-app mark-fixed is out of scope.)
4. Generate a statement from open gaps, last scan date, and unchecked surfaces. It never claims conformity, compliance, EAA-ready, or WCAG-passed.
5. Re-scan diffs: `N new, M cleared since last scan`. If coverage shrinks, the statement includes: `this scan reached fewer pages than [prior date] — comparisons may understate issues`.

Jobs run **in-process** after the scan is created (Next.js `after()` + a process-local queue). That fits a local demo or a long-running container. A serverless host freezes the process and drops the queue. See [Staging on Railway / Render](#staging-on-railway--render) for the container, and [Staging on Vercel](#staging-on-vercel) for the UI-only limit.

## Statement rules (wired in code)

- Title: `Accessibility statement (working draft)`
- Last scan: date — URL(s) reached; notes if checkout was not rendered
- If last-scan lists a checkout URL and unchecked still includes payment iframes / Shop Pay / similar checkout widgets, add under last-scan: `Checkout URL reached — payment iframes / Shop Pay still unchecked.` (still listed under unchecked too)
- **What we didn’t check** (equal weight / above gaps): always PDFs/media, third-party widgets; checkout especially Shopify if not rendered
- Automated findings still open, labeled `Automated findings still open: critical: N / serious: N / …` (no doubled wrapper)
- Known gaps: issue titles with page/path and stable IDs
- Coverage note when the comparison base shrinks: `This scan reached fewer pages than … — comparisons may understate issues.`
- Closing line: `This is a working draft based on automated checks, not a legal assessment or certification.`

## Staging on Railway / Render

Playwright scans run in the Next.js server process. Ship the `Dockerfile` as a long-running container. The image uses Node 20 on Debian bookworm, installs Chromium, runs `npm run build`, and on boot applies the schema (`prisma db push`) then `npm start`.

`npm start` is `next start --hostname 0.0.0.0`. It listens on `$PORT` (default 3000) on all interfaces so a platform proxy can reach it. Railway and Render inject `PORT`. An empty volume works: boot creates `/data/recheck.db` from the SQLite schema. Local `npm run dev` still uses `file:./dev.db` from `.env`.

### Chromium dependencies

The image installs the Chromium build that matches the locked Playwright package (1.63.0) with `playwright install chromium`, then the Debian libraries that build needs (NSS, fonts, GTK, and related packages) with `playwright install-deps chromium`. That is the same pair as `npx playwright install --with-deps chromium`, split so the browser download and the apt packages each land in the right stage. Browsers are stored at `/ms-playwright` (`PLAYWRIGHT_BROWSERS_PATH`). `lib/browser.ts` already launches Chromium with `--no-sandbox` and `--disable-dev-shm-usage`, which is what a container needs when the sandbox and `/dev/shm` are limited. The process runs as root so a freshly mounted `/data` volume is writable. Give the service at least 1 GB of RAM; 2 GB is more comfortable for a multi-page crawl.

### Local container

```bash
docker build -t recheck .
docker run --rm -p 3000:3000 -v recheck-data:/data recheck
```

Open [http://localhost:3000](http://localhost:3000). The volume keeps SQLite across restarts. One container only — a SQLite file is not safe shared by multiple replicas.

### Railway

`railway.toml` selects the Dockerfile and a `/` healthcheck. Leave the dashboard start command empty so the image runs `scripts/docker-entrypoint.sh`.

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → `Synex65/recheck`.
2. Confirm the builder is the Dockerfile (Railway uses a Dockerfile when it finds one; `railway.toml` sets it explicitly).
3. Variables. No secret is required for the SQLite demo:
   - `DATABASE_URL` is optional. The image default is `file:/data/recheck.db`.
   - Do not set `PORT`. Railway sets it.
4. **Volumes** → mount path `/data` so the SQLite file survives redeploys. Keep a single replica.
5. **Networking** → Generate domain. Open it, paste a storefront URL, and start a scan.

Postgres: in `prisma/schema.prisma` set `provider = "postgresql"`, set `DATABASE_URL` to the hosted URL in the Railway dashboard, and rebuild. The Prisma client is generated when the image builds, so changing only the runtime URL does not switch providers. Boot still runs `prisma db push`. Do not commit the URL.

### Render

1. **New** → **Web Service** → connect `Synex65/recheck`.
2. Runtime **Docker**. Render builds the `Dockerfile`.
3. Pick an instance with at least 1 GB RAM (Chromium).
4. Environment variables:
   - `DATABASE_URL`=`file:/data/recheck.db`, or omit it and use the image default.
   - Do not set `PORT`. Render sets it.
5. Add a **disk** with mount path `/data` for SQLite. One instance. Render’s free instance has no durable disk; use a paid instance with a disk, or Postgres.
6. Health check path: `/`.

Postgres uses the same schema-provider change and rebuild as Railway. Put `DATABASE_URL` in the Render dashboard, not in git.

This container does not make serverless Playwright work. Vercel can still serve the UI. Scans belong here (or on any VM running the same image).

## Staging on Vercel

Do **not** commit secrets. `.env`, `.env.local`, and `.vercel/` are gitignored. Put `DATABASE_URL` (and any tokens) in the Vercel project env, never in the repo. `.env.example` is placeholders only.

SQLite `file:./dev.db` will not persist on serverless. For a hosted staging DB, set `DATABASE_URL` in Vercel (Preview / Production) to a hosted Postgres (or similar) and switch `prisma/schema.prisma` `provider` to `postgresql`.

### CLI preview

```bash
npm i -g vercel
vercel login
vercel link          # from the repo root
vercel               # preview deploy (staging URL)
# vercel --prod      # production — only when you mean it
```

Set env vars on the project (not in git):

```bash
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL production
```

### GitHub integration

1. Vercel dashboard → **Add New… → Project** → import `Synex65/recheck`.
2. Or, after `vercel link`, connect the GitHub repo in **Project Settings → Git**.
3. Pushes to non-production branches create Preview deployments. Merges to `main` create Production.

No GitHub Actions secrets are required in this repo. Vercel’s GitHub app builds from the connected repository.

### Playwright / in-process scans (honest limit)

The UI can deploy. **Scans are not a drop-in on serverless.**

- Chromium is launched in-process (`lib/scan-runner.ts` via Playwright) after `POST /api/scans` (`after()` + a process-local queue). That queue dies with the function instance.
- Playwright browsers are not part of the default Vercel build. Installing Chromium also blows past typical serverless bundle/size and read-only filesystem constraints.
- `app/api/scans/route.ts` already sets `maxDuration = 300` (5 minutes). A multi-page crawl can still time out; bumping duration is a patch, not a design.
- Hosted scans need a long-running container that keeps Chromium installed and the in-process queue alive. Use the Docker image in [Staging on Railway / Render](#staging-on-railway--render).

A green Vercel build means the UI deployed. Scans stay on that container (or on `npm run dev` locally).

## Legal pages

Staging includes a cookie notice plus `/privacy`, `/imprint`, and `/terms`. Footer links are on the marketing and scan pages. The demo shop fixture is unchanged so scans of `/demo-shop` do not pick up the product chrome.

Recheck does not set analytics or marketing cookies. The notice only records a necessary choice in `localStorage` (`recheck.consent.v1`) on that browser.

The privacy notice states what a scan stores (storefront URLs, page results, findings, statement drafts), that data is not sold, and that staging is hosted on Railway. The imprint uses placeholders for operator name, address, and email (Arda / Synex65) until `RECHECK_OPERATOR_NAME`, `RECHECK_OPERATOR_ADDRESS`, and `RECHECK_CONTACT_EMAIL` are set. Register court, registration number, and VAT ID are omitted until you have real ones.

## Non-goals

No WCAG certification, no legal sign-off, no overlay “fixes”, no fake green compliance, no auth, no billing.

## Stack

Next.js App Router, TypeScript, Prisma (SQLite default / Postgres documented), Playwright, axe-core.
