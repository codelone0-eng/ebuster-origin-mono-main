#!/bin/bash

# Скрипт для запуска тестов и деплоя отчётов после сборки
# Используется в CI/CD пайплайне

set -e

echo "════════════════════════════════════════════════════════════════════════════════"
echo "🧪 Running tests and deploying reports to autotest.ebuster.ru"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

# Проверка наличия .env.autotest
if [ ! -f ".env.autotest" ]; then
    echo "⚠️  Warning: .env.autotest not found, skipping tests"
    echo "Creating placeholder autotest directory..."
    mkdir -p tests/public/autotest
    echo "<html><body><h1>No tests run yet</h1><p>Configure .env.autotest to enable automated testing</p></body></html>" > tests/public/autotest/index.html
    exit 0
fi

# Экспорт переменных окружения
echo "📋 Loading environment variables..."
export $(grep -v '^#' .env.autotest | xargs)

# Проверка обязательных переменных
if [ -z "$ADMIN_EMAIL" ] || [ -z "$ADMIN_PASSWORD" ]; then
    echo "⚠️  Warning: ADMIN_EMAIL or ADMIN_PASSWORD not set, skipping tests"
    mkdir -p tests/public/autotest
    echo "<html><body><h1>Tests not configured</h1></body></html>" > tests/public/autotest/index.html
    exit 0
fi

echo "✅ Environment variables loaded"
echo ""

# Установка зависимостей для тестов (если ещё не установлены)
if [ ! -d "node_modules/@playwright" ]; then
    echo "📦 Installing Playwright..."
    npx playwright install --with-deps
fi

# Запуск всех тестов
echo "🚀 Running all tests..."
echo "────────────────────────────────────────────────────────────────────────────────"
npm run test:all || true  # Не прерываем деплой, если тесты упали

# Генерация дашборда
echo ""
echo "📊 Generating dashboard..."
echo "────────────────────────────────────────────────────────────────────────────────"
npm run test:dashboard

# Отправка в Telegram (если настроено)
if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
    echo ""
    echo "📱 Sending report to Telegram..."
    echo "────────────────────────────────────────────────────────────────────────────────"
    npm run autotest-send-report || true
fi

echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "✅ Tests completed and reports deployed!"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📊 Dashboard will be available at: https://autotest.ebuster.ru"
echo "📁 Reports location: tests/public/autotest/"
echo ""
