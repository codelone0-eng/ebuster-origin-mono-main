#!/bin/bash
set -e

echo "🔧 Финальное исправление всех проблем"
echo "======================================"

cd /srv/ebuster

echo ""
echo "1️⃣ Получаем последние изменения..."
git pull

echo ""
echo "2️⃣ Останавливаем контейнеры..."
docker compose down

echo ""
echo "3️⃣ Пересобираем autotest-runner (новый Playwright v1.56.1)..."
docker compose build --no-cache autotest-runner

echo ""
echo "4️⃣ Пересобираем frontend (для обновления плейсхолдера)..."
docker compose build --no-cache frontend

echo ""
echo "5️⃣ Запускаем все сервисы..."
docker compose up -d

echo ""
echo "6️⃣ Ждём 5 секунд для инициализации..."
sleep 5

echo ""
echo "7️⃣ Проверяем статус сервисов..."
docker compose ps

echo ""
echo "8️⃣ Проверяем stream-сервер..."
curl -s http://localhost:3002/status | jq -r '.status'

echo ""
echo "9️⃣ Копируем тёмный плейсхолдер напрямую в контейнер..."
docker cp tests/public/autotest/index.html ebuster-frontend:/usr/share/nginx/html/autotest/index.html

echo ""
echo "🔟 Перезагружаем Nginx..."
docker exec ebuster-frontend nginx -s reload

echo ""
echo "✅ Всё готово! Теперь запускаем тесты..."
echo ""
docker compose run --rm autotest-runner npm run test:all

echo ""
echo "🎉 Готово! Откройте https://autotest.ebuster.ru и обновите с Ctrl+Shift+R"
