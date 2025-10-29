#!/bin/bash

echo "🚀 Деплой с исправлением node-cron..."

cd /srv/ebuster

# Сброс локальных изменений
echo "🔄 Сброс локальных изменений..."
git reset --hard HEAD
git clean -fd

# Получение изменений
echo "📥 Получение изменений с GitHub..."
git pull origin main

# Пересборка с учетом новой зависимости
echo "🔨 Пересборка контейнеров..."
docker-compose down
docker-compose build --no-cache

# Запуск
echo "▶️  Запуск контейнеров..."
docker-compose up -d

# Ожидание запуска
echo "⏳ Ожидание запуска API..."
sleep 10

# Проверка статуса
echo "✅ Проверка статуса..."
docker-compose ps

# Проверка API
echo "🔍 Проверка API..."
curl -s https://api.ebuster.ru/api/health || echo "API еще не готов"

echo ""
echo "🎉 Деплой завершен!"
echo "📝 Логи API: docker-compose logs -f api"
