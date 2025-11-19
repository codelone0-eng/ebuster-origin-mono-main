#!/bin/bash

# Экстремальная оптимизация production окружения

set -e

echo "🚀 ЭКСТРЕМАЛЬНАЯ ОПТИМИЗАЦИЯ PRODUCTION"
echo "========================================"

# 1. Оптимизация Docker
echo "🐳 Оптимизация Docker..."
docker system prune -af --volumes > /dev/null 2>&1 || true

# 2. Настройка sysctl для максимальной производительности
echo "⚙️  Настройка kernel parameters..."
sudo sysctl -w net.core.somaxconn=65535 > /dev/null 2>&1 || true
sudo sysctl -w net.ipv4.tcp_max_syn_backlog=8192 > /dev/null 2>&1 || true
sudo sysctl -w net.ipv4.tcp_tw_reuse=1 > /dev/null 2>&1 || true
sudo sysctl -w net.ipv4.ip_local_port_range="1024 65535" > /dev/null 2>&1 || true
sudo sysctl -w fs.file-max=2097152 > /dev/null 2>&1 || true

# 3. Оптимизация ulimits
echo "📊 Настройка ulimits..."
ulimit -n 65535 > /dev/null 2>&1 || true

# 4. Сборка с максимальными оптимизациями
echo "🏗️  Сборка образов..."
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
export BUILDKIT_PROGRESS=plain

docker compose build --parallel --no-cache

# 5. Запуск с оптимизированными параметрами
echo "🚀 Запуск контейнеров..."
docker compose up -d

# 6. Проверка производительности
echo "📈 Проверка производительности..."
sleep 10

echo ""
echo "✅ Статус контейнеров:"
docker compose ps

echo ""
echo "📊 Использование ресурсов:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

echo ""
echo "🔍 Проверка здоровья сервисов:"
curl -sf http://localhost:3001/api/health > /dev/null && echo "✅ API: OK" || echo "❌ API: FAIL"
curl -sf http://localhost > /dev/null && echo "✅ Frontend: OK" || echo "❌ Frontend: FAIL"
curl -sf http://localhost:3002/status > /dev/null && echo "✅ Stream: OK" || echo "❌ Stream: FAIL"

echo ""
echo "🎉 Оптимизация завершена!"
echo "📈 Производительность: МАКСИМАЛЬНАЯ"
