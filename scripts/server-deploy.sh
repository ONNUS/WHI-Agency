#!/bin/bash
# /home/ec2-user/deploy.sh — Run directly on the server
# Pulls latest code, rebuilds Docker image, preserves all JSON data.
# The whi_data named volume is NEVER removed by this script.

set -e

APP_DIR="$HOME/WHI-Agency"
BACKUP_DIR="$HOME/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=== WHI Deploy: $TIMESTAMP ==="

# --- Backup JSON data before deploy ---
echo "→ Backing up JSON data..."
mkdir -p "$BACKUP_DIR"
sudo docker run --rm \
  -v whi_agency_whi_data:/data \
  -v "$BACKUP_DIR":/backup \
  alpine tar czf "/backup/whi_data_$TIMESTAMP.tar.gz" -C /data . && \
  echo "  Backup saved: $BACKUP_DIR/whi_data_$TIMESTAMP.tar.gz"

# Keep only last 5 backups
ls -t "$BACKUP_DIR"/whi_data_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm --

# --- Pull latest code ---
echo "→ Pulling latest code from GitHub..."
cd "$APP_DIR"
git pull

# --- Rebuild and restart container (volume is preserved) ---
echo "→ Rebuilding container..."
sudo docker compose up -d --build

# --- Verify ---
echo "→ Verifying..."
sudo docker ps --filter name=whi-agency --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
sleep 2
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
echo "  App health check: HTTP $HTTP_STATUS"

if [[ "$HTTP_STATUS" == "200" ]]; then
  echo "✓ Deploy successful."
else
  echo "✗ App not responding correctly — check: sudo docker logs whi-agency"
  exit 1
fi
