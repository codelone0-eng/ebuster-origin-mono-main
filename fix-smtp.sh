#!/bin/bash

# Скрипт для исправления SMTP на сервере
# Запуск: bash fix-smtp.sh

set -e

echo "🔧 Исправление SMTP конфигурации..."
echo ""

# 1. Решить git конфликт
echo "1️⃣ Решение git конфликта..."
git stash
echo "✅ Локальные изменения сохранены в stash"
echo ""

# 2. Обновить код
echo "2️⃣ Обновление кода из GitHub..."
git pull origin main
echo "✅ Код обновлён"
echo ""

# 3. Обновить .env с новыми SMTP данными
echo "3️⃣ Обновление .env файла..."
cat > /srv/ebuster/.env << 'EOF'
# Production Environment Variables
PORT=3001
NODE_ENV=production

# URLs
CLIENT_URL=https://ebuster.ru
BASE_URL=https://ebuster.ru
API_URL=https://api.ebuster.ru/api

# JWT Configuration
JWT_SECRET=ebuster_2024_super_secure_jwt_key_7f8a9b2c4d6e1f3a5b7c9d2e4f6a8b1c3d5e7f9a2b4c6d8e1f3a5b7c9d2e4f6a8b

# SMTP Configuration (Beget)
SMTP_HOST=smtp.beget.com
SMTP_PORT=465
SMTP_USER=register@ebuster.ru
SMTP_PASS=1XCq11l!lEEh

# Email Settings
EMAIL_FROM_NAME=EBUSTER
EMAIL_FROM_ADDRESS=register@ebuster.ru
EMAIL_REPLY_TO=register@ebuster.ru

# Supabase
SUPABASE_URL=https://dzvpnlersyitinfvthdf.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dnBubGVyc3lpdGluZnZ0aGRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkyNTYzMiwiZXhwIjoyMDc1NTAxNjMyfQ.MGe7hAX2HfTCv1WPw8x4uO1DjGIntS-Za3xXUVZ_Z8w
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dnBubGVyc3lpdGluZnZ0aGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MjU2MzIsImV4cCI6MjA3NTUwMTYzMn0.AHXDOWm5nqlZSKTHmWpYYQ3lGTziVL3WQLtb5Me4uaw

# Session/Cookie Settings
SESSION_COOKIE_DOMAIN=.ebuster.ru
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAMESITE=None
EOF

echo "✅ .env файл обновлён"
echo ""

# 4. Остановить контейнеры
echo "4️⃣ Остановка контейнеров..."
docker compose down
echo "✅ Контейнеры остановлены"
echo ""

# 5. Пересобрать API с новыми данными
echo "5️⃣ Пересборка API контейнера..."
docker compose build --no-cache api
echo "✅ API пересобран"
echo ""

# 6. Запустить контейнеры
echo "6️⃣ Запуск контейнеров..."
docker compose up -d
echo "✅ Контейнеры запущены"
echo ""

# 7. Подождать запуска
echo "7️⃣ Ожидание запуска сервисов..."
sleep 10
echo ""

# 8. Проверить логи
echo "8️⃣ Проверка логов API..."
docker compose logs --tail=20 api
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SMTP конфигурация обновлена!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Новые SMTP данные:"
echo "   Host: smtp.beget.com"
echo "   Port: 465"
echo "   User: register@ebuster.ru"
echo ""
echo "🧪 Для тестирования попробуйте зарегистрировать нового пользователя"
echo "🔍 Следить за логами: docker compose logs -f api"
echo ""
