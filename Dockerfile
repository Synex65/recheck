# Long-running Next.js + Playwright Chromium for Railway / Render.
# A second stage keeps apt/npm download layers out of the image you ship.
# Chromium's shared libraries still have to be installed in the final stage
# (they live in the rootfs, not under node_modules).

FROM node:20-bookworm AS build

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    DATABASE_URL="file:/data/recheck.db"

COPY package.json package-lock.json ./
COPY prisma ./prisma

# Install devDependencies too: `prisma` is one of them, and boot runs `db push`.
# NODE_ENV stays unset here so `npm ci` does not omit that CLI.
RUN npm ci

# Browser binary that matches the locked Playwright package. OS libraries are
# installed in the runtime stage (`install-deps`), not baked twice.
RUN ./node_modules/.bin/playwright install chromium

COPY . .

# Pages are force-dynamic; push anyway so a prerender that touches Prisma
# has a schema. The file under /data is not copied into the runtime stage.
RUN mkdir -p /data \
    && ./node_modules/.bin/prisma db push --skip-generate \
    && npm run build \
    && npm cache clean --force

FROM node:20-bookworm AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    DATABASE_URL="file:/data/recheck.db" \
    PORT=3000 \
    DEBIAN_FRONTEND=noninteractive

COPY --from=build /app /app
COPY --from=build /ms-playwright /ms-playwright

# NSS, fonts, GTK, and the rest of the Chromium runtime, plus tini so
# Chromium child processes are reaped (PID 1). Version comes from the
# Playwright package copied above (lockfile: 1.63.0).
RUN apt-get update \
    && apt-get install -y --no-install-recommends tini \
    && ./node_modules/.bin/playwright install-deps chromium \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /data

EXPOSE 3000

ENTRYPOINT ["tini", "--"]
CMD ["sh", "./scripts/docker-entrypoint.sh"]
