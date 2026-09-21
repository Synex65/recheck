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
| `DATABASE_URL` | `file:./dev.db` | Prisma database. SQLite path is relative to `prisma/`. |
| `PLAYWRIGHT_BROWSERS_PATH` | unset | Optional override for Chromium install location. |

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
npm start            # next start --port 3000
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

Jobs run **in-process** after the scan is created (Next.js `after()` + a process-local queue). Enough for a local/demo MVP; swap for a worker later if you deploy to serverless. See [Staging on Vercel](#staging-on-vercel).

## Statement rules (wired in code)

- Title: `Accessibility statement (working draft)`
- Last scan: date — URL(s) reached; notes if checkout was not rendered
- If last-scan lists a checkout URL and unchecked still includes payment iframes / Shop Pay / similar checkout widgets, add under last-scan: `Checkout URL reached — payment iframes / Shop Pay still unchecked.` (still listed under unchecked too)
- **What we didn’t check** (equal weight / above gaps): always PDFs/media, third-party widgets; checkout especially Shopify if not rendered
- Automated findings still open, labeled `Automated findings still open: critical: N / serious: N / …` (no doubled wrapper)
- Known gaps: issue titles with page/path and stable IDs
- Coverage note when the comparison base shrinks: `This scan reached fewer pages than … — comparisons may understate issues.`
- Closing line: `This is a working draft based on automated checks, not a legal assessment or certification.`

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
- For hosted scans you need a **worker** or other long-running process that can install Chromium, keep a browser, and write to a real database. This MVP does not provide that. Use `npm run dev` locally (or a persistent VM) until a worker exists.

Do not treat a green Vercel build as “scans work in staging.”

## Non-goals

No WCAG certification, no legal sign-off, no overlay “fixes”, no fake green compliance, no auth, no billing.

## Stack

Next.js App Router, TypeScript, Prisma (SQLite default / Postgres documented), Playwright, axe-core.
