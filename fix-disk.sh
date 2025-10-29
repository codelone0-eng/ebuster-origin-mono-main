#!/bin/bash

echo "=== Очистка диска VPS ==="

# Проверка использования диска
echo "Текущее использование диска:"
df -h

echo ""
echo "=== Очистка Docker ==="
# Удаляем все образы, контейнеры, volumes
docker system prune -af --volumes

# Удаляем build cache
docker builder prune -af

echo ""
echo "=== Очистка npm cache ==="
npm cache clean --force

echo ""
echo "=== Очистка логов ==="
# Очищаем systemd логи (оставляем последние 7 дней)
journalctl --vacuum-time=7d

echo ""
echo "=== Очистка apt cache ==="
apt clean

echo ""
echo "=== Удаление старых логов ==="
# Удаляем старые логи если есть
find /var/log -name "*.log" -mtime +7 -delete 2>/dev/null
find /var/log -name "*.gz" -delete 2>/dev/null

echo ""
echo "=== Поиск больших файлов ==="
echo "Топ-10 больших файлов в /var:"
du -ah /var 2>/dev/null | sort -hr | head -10

echo ""
echo "=== Проверка свободного места после очистки ==="
df -h

echo ""
echo "=== Пересборка проекта ==="
cd /srv/ebuster

# Удаляем старые контейнеры
docker-compose down

# Пересобираем с учетом ограниченного места
echo "Билдим Docker образы..."
docker-compose build --no-cache

# Запускаем
echo "Запускаем контейнеры..."
docker-compose up -d

echo ""
echo "=== Статус контейнеров ==="
docker-compose ps

echo ""
echo "=== Проверка API ==="
curl -s https://api.ebuster.ru/api/user/profile || echo "API еще не готов"

echo ""
echo "Готово!"
