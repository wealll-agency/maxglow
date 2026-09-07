#!/bin/bash
set -euo pipefail

echo "========================================="
echo "🚀 Starting MaxGlow Atomic Deployment"
echo "========================================="

TIMESTAMP=$(date +"%Y%m%d%H%M%S")
RELEASES_DIR="/tmp/maxglow-releases"
RELEASE_DIR="${RELEASES_DIR}/release-${TIMESTAMP}"
LIVE_DIR="$(pwd)"

mkdir -p "$RELEASES_DIR"

echo "📂 Creating new release directory: $RELEASE_DIR"
git clone . "$RELEASE_DIR"
cd "$RELEASE_DIR"

echo "🔄 Fetching latest code..."
git fetch origin main
git checkout main
git pull origin main

echo "📦 Installing backend dependencies..."
npm ci --prefix backend

echo "📦 Installing frontend dependencies..."
npm ci --prefix frontend

echo "🔨 Building frontend..."
npm run build --prefix frontend

echo "✅ Build successful! Switching live traffic to new release..."

# The atomic switch
cd "$LIVE_DIR"

# Rsync the built release to the live directory safely
rsync -a --delete "$RELEASE_DIR/" "$LIVE_DIR/"

echo "🔄 Reloading PM2 gracefully..."
pm2 reload all || pm2 restart all

echo "⏳ Running Health Check..."
sleep 5
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7053 || echo "000")

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 308 ]; then
    echo "✅ Health check passed (HTTP $HTTP_CODE)."
    echo "🧹 Cleaning up old releases..."
    ls -dt ${RELEASES_DIR}/release-* | tail -n +6 | xargs -d '\n' rm -rf -- || true
    echo "========================================="
    echo "🎉 Deployment Completed Successfully!"
    echo "========================================="
else
    echo "❌ Health check failed (HTTP $HTTP_CODE). Aborting deployment!"
    exit 1
fi
