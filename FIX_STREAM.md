# 🔧 Исправление stream-сервера

## Проблема
```
ReferenceError: require is not defined in ES module scope
```

Stream-сервер использовал CommonJS (`require`), но `package.json` содержит `"type": "module"`.

## Исправлено
- ✅ Переписан `tests/stream-server/index.js` на ES modules (`import`)
- ✅ Убран устаревший `version: '3.8'` из `docker-compose.yml`

## На сервере выполните:

```bash
cd /srv/ebuster

# 1. Получите изменения
git pull

# 2. Остановите контейнеры
docker compose down

# 3. Пересоберите только stream-сервер
docker compose build autotest-stream

# 4. Запустите
docker compose up -d

# 5. Проверьте что stream работает
docker compose ps autotest-stream
docker compose logs autotest-stream

# Должно быть:
# 🔴 Live stream server running on port 3002
# WebSocket: ws://localhost:3002
# REST API: http://localhost:3002/status

# 6. Проверьте healthcheck
curl http://localhost:3002/status
```

## Если тесты всё ещё запущены

Дождитесь их завершения, затем запустите заново:

```bash
docker compose run --rm autotest-runner npm run test:all
```

Теперь live-обновления будут работать!

## Проверка WebSocket

```bash
# Проверьте что порт 3002 слушается
netstat -tulpn | grep 3002

# Проверьте логи stream-сервера
docker compose logs -f autotest-stream

# Откройте дашборд
# https://autotest.ebuster.ru

# В консоли браузера должно быть:
# Connected to live stream
```

---

**После этого:**
1. ✅ Stream-сервер запустится без ошибок
2. ✅ WebSocket подключение заработает
3. ✅ Live-обновления будут отображаться на дашборде
4. ✅ Тёмный стиль уже применён
