#!/bin/bash
echo "========================================="
echo "?? Starting MaxGlow Production Deployment"
echo "========================================="

echo "?? Fetching latest code..."
git fetch origin main

echo "?? Cleaning up any local modifications..."
git reset --hard origin/main
git clean -fd

echo "?? Installing backend dependencies..."
npm ci --prefix backend

echo "?? Installing frontend dependencies..."
npm ci --prefix frontend

echo "??? Building frontend..."
npm run build --prefix frontend

echo "?? Restarting PM2 services..."
pm2 restart all

echo "========================================="
echo "? Deployment Completed Successfully!"
echo "========================================="

