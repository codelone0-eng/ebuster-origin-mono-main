#!/bin/bash

# 🚀 Экстремально быстрая сборка с максимальными оптимизациями

set -e

START_TIME=$(date +%s)

echo "🔧 Включаем Docker BuildKit и оптимизации..."
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
export BUILDKIT_PROGRESS=plain

echo "🧹 Очистка dangling образов..."
docker image prune -f > /dev/null 2>&1

echo "🏗️  Параллельная сборка с кэшированием..."
docker compose build \
  --parallel \
  --progress=plain \
  2>&1 | tee build.log

BUILD_EXIT=$?
END_TIME=$(date +%s)
BUILD_TIME=$((END_TIME - START_TIME))

if [ $BUILD_EXIT -eq 0 ]; then
  echo "✅ Сборка завершена за ${BUILD_TIME}с!"
  
  echo "🚀 Запуск контейнеров..."
  docker compose up -d
  
  echo "⏳ Ожидание готовности сервисов..."
  sleep 5
  
  echo "📊 Статус контейнеров:"
  docker compose ps
  
  echo "🔍 Проверка здоровья API..."
  curl -sf http://localhost:3001/api/health > /dev/null && echo "✅ API работает" || echo "⚠️  API не отвечает"
  
  echo "📈 Использование ресурсов:"
  docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
  
  echo "📝 Последние логи API:"
  docker compose logs --tail=20 api
  
  echo ""
  echo "🎉 Деплой завершён за ${BUILD_TIME}с!"
else
  echo "❌ Ошибка сборки! Проверьте build.log"
  tail -50 build.log
  exit 1
fi
