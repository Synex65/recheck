#!/bin/sh
# Boot a staging container: ensure the SQLite (or Postgres) schema exists, then
# start Next.js. Railway and Render inject PORT; `npm start` honors it.
set -eu

cd /app

if [ -z "${DATABASE_URL:-}" ]; then
  export DATABASE_URL="file:/data/recheck.db"
fi

mkdir -p /data

if [ ! -d /ms-playwright ]; then
  echo "recheck: Playwright browsers missing at /ms-playwright" >&2
  exit 1
fi

echo "recheck: prisma db push"
./node_modules/.bin/prisma db push --skip-generate

echo "recheck: next start on port ${PORT:-3000}"
exec npm start
