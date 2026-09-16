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

echo "🔒 Validating environment variables..."
if [ -f "$LIVE_DIR/.env" ]; then
    cp "$LIVE_DIR/.env" "$RELEASE_DIR/.env"
    echo "✅ Environment file successfully loaded into isolated release."
else
    echo "❌ FATAL: .env file missing from $LIVE_DIR. Aborting deployment."
    exit 1
fi

echo "📦 Installing backend dependencies..."
npm install --omit=dev --prefix backend
echo "🔍 Validating backend dependencies..."
npm ls --depth=0 --prefix backend || echo "Warning: Dependency tree issues detected in backend"

echo "📦 Installing frontend dependencies..."
npm install --prefix frontend
echo "🔍 Validating frontend dependencies..."
npm ls --depth=0 --prefix frontend || echo "Warning: Dependency tree issues detected in frontend"

echo "🔨 Building frontend..."
if ! npm run build --prefix frontend; then
    echo "❌ FATAL: Frontend build failed. Aborting deployment to protect live state."
    exit 1
fi

echo "✅ Build successful! Switching live traffic to new release..."

# The atomic switch
cd "$LIVE_DIR"

BACKUP_DIR="${RELEASES_DIR}/rollback-backup"
echo "📦 Backing up current stable release..."
rsync -a --delete "$LIVE_DIR/" "$BACKUP_DIR/"

echo "🔄 Switching live traffic to new release..."
rsync -a --delete "$RELEASE_DIR/" "$LIVE_DIR/"

echo "🔄 Reloading PM2 gracefully..."
pm2 reload all || pm2 restart all

echo "⏳ Waiting for application readiness (Timeout: 60s)..."
MAX_RETRIES=12
WAIT_SECONDS=5
BACKEND_HEALTHY=0
FRONTEND_HEALTHY=0

for ((i=1; i<=MAX_RETRIES; i++)); do
    sleep $WAIT_SECONDS
    
    if [ $BACKEND_HEALTHY -eq 0 ]; then
        HTTP_BACKEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7052/api/health || echo "000")
        if [ "$HTTP_BACKEND" -eq 200 ]; then
            BACKEND_HEALTHY=1
        fi
    fi

    if [ $FRONTEND_HEALTHY -eq 0 ]; then
        HTTP_FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7053 || echo "000")
        if [ "$HTTP_FRONTEND" -eq 200 ] || [ "$HTTP_FRONTEND" -eq 308 ]; then
            FRONTEND_HEALTHY=1
        fi
    fi

    if [ $BACKEND_HEALTHY -eq 1 ] && [ $FRONTEND_HEALTHY -eq 1 ]; then
        break
    fi
done

if [ $BACKEND_HEALTHY -eq 0 ] || [ $FRONTEND_HEALTHY -eq 0 ]; then
    echo "❌ FATAL: Application failed health check (Backend: $HTTP_BACKEND, Frontend: $HTTP_FRONTEND)."
    echo "⏪ Executing emergency rollback to previous stable release..."
    rsync -a --delete "$BACKUP_DIR/" "$LIVE_DIR/"
    pm2 reload all || pm2 restart all
    exit 1
fi

echo "✅ Health check passed."
echo "🧹 Cleaning up old releases..."
ls -dt ${RELEASES_DIR}/release-* | tail -n +6 | xargs -d '\n' rm -rf -- || true
echo "========================================="
echo "🎉 Deployment Completed Successfully!"
echo "========================================="
