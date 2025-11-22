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

# Создать сеть если её нет
log "🌐 Проверяю сеть ebuster-network..."
if ! docker network ls | grep -q ebuster-network; then
  log "📡 Создаю сеть ebuster-network..."
  docker network create ebuster-network || true
fi

# Запустить / обновить ClickHouse (отдельный compose-файл)
log "🗄  Обновление ClickHouse..."
cd clickhouse
docker compose up -d
cd ..

# Ждем пока ClickHouse стартует и проверяем доступность
log "⏳ Ожидаю запуска ClickHouse..."
for i in {1..60}; do
  if docker compose -f clickhouse/docker-compose.yml exec -T ebuster-clickhouse clickhouse-client --query "SELECT 1" >/dev/null 2>&1; then
    log "✅ ClickHouse доступен!"
    break
  fi
  if [ $i -eq 60 ]; then
    log "⚠️  ClickHouse не отвечает после 60 попыток, продолжаю..."
  else
    log "   Попытка $i/60..."
    sleep 2
  fi
done

# ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ СХЕМЫ (так как ALTER не срабатывает)
# ВНИМАНИЕ: Это удалит старые логи, но гарантирует правильную структуру
log "🗑️ Сброс таблицы access_logs для обновления схемы..."
docker compose -f clickhouse/docker-compose.yml exec -T ebuster-clickhouse clickhouse-client --query "DROP TABLE IF EXISTS ebuster.access_logs" 2>/dev/null || true

# Применить схему ClickHouse
log "📋 Применяю схему ClickHouse..."
docker compose -f clickhouse/docker-compose.yml exec -T ebuster-clickhouse clickhouse-client --multiquery < clickhouse/schema.sql 2>/dev/null || log "⚠️  Ошибка применения схемы (возможно уже существует)"

# Проверяем, что контейнер в правильной сети
log "🌐 Проверяю сеть ClickHouse контейнера..."
if docker inspect ebuster-clickhouse | grep -q "ebuster-network"; then
  log "✅ ClickHouse контейнер в сети ebuster-network"
else
  log "⚠️  ClickHouse контейнер не в сети ebuster-network, перезапускаю..."
  docker compose -f clickhouse/docker-compose.yml down
  docker compose -f clickhouse/docker-compose.yml up -d
  sleep 5
fi

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

# Проверка сети (отладка)
log "🌐 Проверка подключенных контейнеров к сети ebuster-network..."
docker network inspect ebuster-network

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
