#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [ ! -f ".env.dev" ]; then
  echo ".env.dev is missing" >&2
  exit 1
fi

PORT="$(grep '^APP_PORT=' .env.dev | cut -d '=' -f2)"

if ss -ltn | awk '{print $4}' | grep -q ":${PORT}$"; then
  if ! docker compose ps --format json | grep -q "\"PublishedPort\":${PORT}"; then
    echo "Port ${PORT} is already in use by another process." >&2
    exit 1
  fi
fi

docker compose --env-file .env.dev down --remove-orphans
docker compose --env-file .env.dev up -d --build web
docker compose --env-file .env.dev ps
