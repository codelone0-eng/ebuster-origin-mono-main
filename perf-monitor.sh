#!/bin/bash

# Мониторинг производительности контейнеров

echo "📊 Статистика контейнеров:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

echo ""
echo "🔍 Размеры образов:"
docker images | grep ebuster | awk '{print $1 "\t" $7 " " $8}'

echo ""
echo "⚡ Время сборки (последний build.log):"
if [ -f build.log ]; then
  grep "DONE" build.log | tail -5
fi

echo ""
echo "🚀 Проверка nginx:"
docker exec ebuster-frontend nginx -t 2>&1 | grep -E "successful|test"

echo ""
echo "📈 Uptime контейнеров:"
docker ps --format "table {{.Names}}\t{{.Status}}"
