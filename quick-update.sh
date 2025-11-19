#!/bin/bash
set -e

echo "🔄 Pulling latest changes..."
git pull origin main

echo "🛑 Stopping containers..."
docker compose down

echo "🏗️ Building images (cached)..."
docker compose build

echo "🚀 Starting containers..."
docker compose up -d

echo "⏳ Waiting for services..."
sleep 5

echo "📊 Service status:"
docker compose ps

echo "✅ Update complete!"
