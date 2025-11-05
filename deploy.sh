#!/bin/bash

set -e  # Остановить выполнение при ошибке

LOG_FILE="/srv/ebuster/deploy.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

log() {
    echo "[$DATE] $1" | tee -a "$LOG_FILE"
}

log "🚀 Начинаем деплой EBUSTER..."

# Проверка директории
if [ ! -d "/srv/ebuster" ]; then
    log "❌ Директория /srv/ebuster не найдена!"
    exit 1
fi

cd /srv/ebuster

# Сохранить текущий коммит для отката
CURRENT_COMMIT=$(git rev-parse HEAD)
log "📌 Текущий коммит: $CURRENT_COMMIT"

# Остановить контейнеры
log "⏸️  Остановка контейнеров..."
docker compose down || docker-compose down

# Получить последние изменения
log "📥 Получение изменений с GitHub..."
git fetch origin main
NEW_COMMIT=$(git rev-parse origin/main)

if [ "$CURRENT_COMMIT" = "$NEW_COMMIT" ]; then
    log "ℹ️  Нет новых изменений. Запускаем контейнеры..."
    docker compose up -d || docker-compose up -d
    exit 0
fi

log "🔄 Обновление кода..."
git stash
git pull origin main

# Пересобрать контейнеры
log "🔨 Пересборка контейнеров..."
docker compose build --no-cache || docker-compose build --no-cache

if [ $? -ne 0 ]; then
    log "❌ Ошибка сборки! Откатываемся..."
    git reset --hard "$CURRENT_COMMIT"
    docker compose up -d || docker-compose up -d
    exit 1
fi

# Запустить контейнеры
log "▶️  Запуск контейнеров..."
docker compose up -d || docker-compose up -d

if [ $? -ne 0 ]; then
    log "❌ Ошибка запуска контейнеров! Откатываемся..."
    git reset --hard "$CURRENT_COMMIT"
    docker compose build --no-cache || docker-compose build --no-cache
    docker compose up -d || docker-compose up -d
    exit 1
fi

# Подождать запуска
log "⏳ Ожидание запуска сервисов..."
sleep 10

# Проверить статус
log "✅ Проверка статуса контейнеров..."
docker compose ps || docker-compose ps

# Проверить API
log "🔍 Проверка API health..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://api.ebuster.ru/api/health)

if [ "$API_RESPONSE" = "200" ]; then
    log "✅ API работает корректно (HTTP $API_RESPONSE)"
    curl -s https://api.ebuster.ru/api/health | jq . || true
else
    log "⚠️  API вернул код $API_RESPONSE. Проверьте логи."
    log "📝 Последние логи API:"
    docker compose logs --tail=50 api || docker-compose logs --tail=50 api
fi

log "🎉 Деплой завершен!"
log "📝 Логи API: docker compose logs -f api"
log "📊 Новый коммит: $NEW_COMMIT"
