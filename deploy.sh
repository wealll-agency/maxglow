#!/bin/bash
set -euo pipefail

echo "========================================="
echo "🚀 Starting MaxGlow Atomic Deployment"
echo "========================================="

# Configuration
BASE_DIR="${DEPLOY_BASE_DIR:-/var/www/maxglow}"
REPO_URL="origin" # Assuming 'origin' points to the Git repository, or define full SSH URL
BRANCH="${DEPLOY_BRANCH:-main}"

RELEASES_DIR="$BASE_DIR/releases"
SHARED_DIR="$BASE_DIR/shared"
CURRENT_DIR="$BASE_DIR/current"

TIMESTAMP=$(date +"%Y%md%H%M%S")
NEW_RELEASE_DIR="$RELEASES_DIR/$TIMESTAMP"

echo "📂 Base Directory: $BASE_DIR"

# 1. Validate prerequisites
if [ ! -d "$SHARED_DIR" ]; then
    echo "❌ FATAL: Shared directory $SHARED_DIR does not exist. Cannot proceed."
    exit 1
fi

if [ ! -f "$SHARED_DIR/.env" ]; then
    echo "❌ FATAL: .env file missing from $SHARED_DIR. Aborting deployment."
    exit 1
fi

# 2. Acquire deployment lock (simple directory-based lock)
LOCK_DIR="$BASE_DIR/deploy.lock"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    echo "❌ FATAL: Another deployment is in progress. Aborting."
    exit 1
fi
# Ensure lock is removed on exit
trap 'rm -rf "$LOCK_DIR"; if [ "$?" -ne 0 ] && [ -d "$NEW_RELEASE_DIR" ] && [ ! -L "$CURRENT_DIR" ] || [ "$(readlink -f "$CURRENT_DIR")" != "$NEW_RELEASE_DIR" ]; then echo "⚠️ Cleaning up failed release..."; rm -rf "$NEW_RELEASE_DIR"; fi' EXIT

# 3. Create isolated release directory
echo "📁 Creating release directory: $NEW_RELEASE_DIR"
mkdir -p "$NEW_RELEASE_DIR"
mkdir -p "$SHARED_DIR/uploads"

# 4. Clone / Checkout code
echo "🔄 Fetching code..."
# If deploying from a local bare repo or directly from GitHub:
# git clone -b "$BRANCH" --depth 1 "$REPO_URL" "$NEW_RELEASE_DIR"
# For local workspaces, we can copy the files excluding node_modules and releases
rsync -a --exclude 'node_modules' --exclude '.git' --exclude 'releases' --exclude 'shared' --exclude '.next' . "$NEW_RELEASE_DIR/"

# 5. Handle environment variables securely
echo "🔒 Setting up environment..."
ln -sfn "$SHARED_DIR/.env" "$NEW_RELEASE_DIR/.env"

# Extract ONLY NEXT_PUBLIC_ variables for the frontend build
echo "🛡️ Extracting NEXT_PUBLIC_ vars for frontend..."
grep "^NEXT_PUBLIC_" "$SHARED_DIR/.env" > "$NEW_RELEASE_DIR/frontend/.env.production" || true

# 6. Persistent data
echo "💾 Symlinking persistent uploads..."
mkdir -p "$NEW_RELEASE_DIR/backend/public"
ln -sfn "$SHARED_DIR/uploads" "$NEW_RELEASE_DIR/backend/public/uploads"

# 7. Install dependencies
echo "📦 Installing backend dependencies..."
npm ci --prefix "$NEW_RELEASE_DIR/backend" --omit=dev

echo "📦 Installing frontend dependencies..."
npm ci --prefix "$NEW_RELEASE_DIR/frontend"

# 8. Build frontend
echo "🔨 Building frontend..."
if ! npm run build --prefix "$NEW_RELEASE_DIR/frontend"; then
    echo "❌ FATAL: Frontend build failed. Aborting deployment."
    exit 1
fi

# 9. Switch release safely
echo "🔄 Switching active release..."
ln -sfn "$NEW_RELEASE_DIR" "$CURRENT_DIR"

# 10. Reload PM2
echo "🔄 Reloading PM2 gracefully..."
cd "$CURRENT_DIR"
pm2 reload maxglow-backend maxglow-frontend || pm2 restart maxglow-backend maxglow-frontend
pm2 save

# 11. Clean old releases
echo "🧹 Cleaning up old releases..."
cd "$RELEASES_DIR"
ls -1t | tail -n +6 | xargs -I {} rm -rf {}

echo "========================================="
echo "🎉 Deployment Completed Successfully!"
echo "========================================="
