#!/bin/bash
# deploy.sh — Deploy latest code to EC2 without touching JSON data
# Usage: ./scripts/deploy.sh /path/to/key.pem
# The whi_data Docker volume (all JSON forms/prospects/briefings) is never removed.

set -e

PEM="${1:-}"
HOST="ec2-user@18.220.209.23"

if [[ -z "$PEM" ]]; then
  echo "Usage: $0 /path/to/key.pem"
  exit 1
fi

if [[ ! -f "$PEM" ]]; then
  echo "Error: PEM file not found: $PEM"
  exit 1
fi

chmod 600 "$PEM"

echo "→ Deploying to $HOST..."

ssh -i "$PEM" -o StrictHostKeyChecking=no "$HOST" '
  set -e
  cd ~/WHI-Agency

  echo "→ Pulling latest code..."
  git pull

  echo "→ Rebuilding container (data volume is preserved)..."
  sudo docker compose up -d --build

  echo "→ Verifying container is running..."
  sudo docker ps --filter name=whi-agency --format "table {{.Names}}\t{{.Status}}"

  echo "✓ Deploy complete. JSON data volume untouched."
'
