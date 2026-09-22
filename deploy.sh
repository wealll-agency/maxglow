#!/bin/bash
set -euo pipefail

echo "========================================="
echo "🚀 Starting MaxGlow Standard Deployment"
echo "========================================="

# Ensure we are in the project root
LIVE_DIR="$(pwd)"
echo "📂 Live Directory: $LIVE_DIR"

echo "🔄 Fetching latest code..."
git fetch --all
git reset --hard origin/main

echo "🔒 Validating environment variables..."
if [ ! -f "$LIVE_DIR/.env" ]; then
    echo "❌ FATAL: .env file missing from $LIVE_DIR. Aborting deployment."
    exit 1
fi
cp "$LIVE_DIR/.env" "$LIVE_DIR/frontend/.env.production"

echo "📦 Installing backend dependencies..."
npm install --no-save --omit=dev --prefix backend

echo "📦 Installing frontend dependencies..."
npm install --no-save --prefix frontend

echo "🔨 Building frontend..."
if ! npm run build --prefix frontend; then
    echo "❌ FATAL: Frontend build failed. Aborting deployment."
    exit 1
fi

echo "🔄 Reloading PM2 gracefully..."
pm2 reload maxglow-backend maxglow-frontend || pm2 restart maxglow-backend maxglow-frontend

echo "========================================="
echo "🎉 Deployment Completed Successfully!"
echo "========================================="
