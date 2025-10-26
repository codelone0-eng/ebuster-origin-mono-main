#!/bin/bash

echo "🚀 Начинаем деплой EBUSTER..."

cd /srv/ebuster

# Остановить контейнеры
echo "⏸️  Остановка контейнеров..."
docker-compose down

# Получить последние изменения
echo "📥 Получение изменений с GitHub..."
git stash
git pull origin main

# Пересобрать контейнеры
echo "🔨 Пересборка контейнеров..."
docker-compose build --no-cache

# Запустить контейнеры
echo "▶️  Запуск контейнеров..."
docker-compose up -d

# Подождать 5 секунд
sleep 5

# Проверить статус
echo "✅ Проверка статуса..."
docker-compose ps

# Проверить API
echo "🔍 Проверка API..."
curl -s https://api.ebuster.ru/api/health | jq .

echo "🎉 Деплой завершен!"
echo "📝 Логи API: docker-compose logs -f api"
