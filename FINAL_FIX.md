# 🎯 Финальное исправление всех проблем

## Текущие проблемы:

1. ❌ **Playwright v1.48.2** вместо v1.56.1 (образ не пересобран)
2. ❌ **Старый светлый дизайн** (плейсхолдер в контейнере не обновлён)
3. ❌ **Нет live-стрима** (тесты падают до запуска)

## Автоматическое решение:

```bash
cd /srv/ebuster
git pull
chmod +x FINAL_FIX.sh
./FINAL_FIX.sh
```

## Или вручную пошагово:

### Шаг 1: Пересоберите autotest-runner

```bash
cd /srv/ebuster
git pull

docker compose down

# Пересоберите с новым Playwright v1.56.1
docker compose build --no-cache autotest-runner
```

### Шаг 2: Обновите плейсхолдер в frontend

```bash
# Пересоберите frontend (долго) ИЛИ скопируйте файл напрямую (быстро)

# Вариант A: Пересборка (5-10 минут)
docker compose build --no-cache frontend

# Вариант B: Прямое копирование (5 секунд) - РЕКОМЕНДУЕТСЯ
docker compose up -d frontend
docker cp tests/public/autotest/index.html ebuster-frontend:/usr/share/nginx/html/autotest/index.html
docker exec ebuster-frontend nginx -s reload
```

### Шаг 3: Запустите всё

```bash
# Запустите сервисы
docker compose up -d

# Проверьте что всё работает
docker compose ps
curl http://localhost:3002/status

# Запустите тесты
docker compose run --rm autotest-runner npm run test:all
```

### Шаг 4: Проверьте результат

1. Откройте https://autotest.ebuster.ru
2. Нажмите **Ctrl+Shift+R** (очистка кэша)
3. Должен быть **тёмный дизайн**
4. Во время тестов должны появляться **live-обновления**

## Проверка каждой проблемы:

### ✅ Playwright версия

```bash
# Проверьте Dockerfile.autotest
grep "FROM mcr" Dockerfile.autotest

# Должно быть:
# FROM mcr.microsoft.com/playwright:v1.56.1-jammy
```

### ✅ Тёмный дизайн

```bash
# Проверьте плейсхолдер в контейнере
docker exec ebuster-frontend grep "background:" /usr/share/nginx/html/autotest/index.html | head -1

# Должно быть:
# --background: #1a1a1a;
```

### ✅ Live-стрим

```bash
# Проверьте stream-сервер
docker compose logs autotest-stream | tail -5

# Должно быть:
# 🔴 Live stream server running on port 3002
# WebSocket: ws://localhost:3002
# REST API: http://localhost:3002/status
```

## Если что-то не работает:

### Playwright всё ещё падает

```bash
# Убедитесь что образ пересобран
docker images | grep autotest-runner

# Удалите старый образ
docker rmi ebuster-autotest-runner -f

# Пересоберите
docker compose build --no-cache autotest-runner
```

### Дизайн всё ещё светлый

```bash
# Скопируйте файл напрямую
docker cp tests/public/autotest/index.html ebuster-frontend:/usr/share/nginx/html/autotest/index.html
docker exec ebuster-frontend nginx -s reload

# Очистите кэш браузера
# Ctrl+Shift+R или Cmd+Shift+R
```

### Live-стрим не работает

```bash
# Проверьте что stream-сервер запущен
docker compose ps autotest-stream

# Проверьте логи
docker compose logs autotest-stream

# Перезапустите
docker compose restart autotest-stream

# Проверьте WebSocket в браузере (F12 → Console)
# Должно быть: "Connected to live stream"
```

## Полная очистка и пересборка (если ничего не помогло):

```bash
cd /srv/ebuster

# Остановите всё
docker compose down -v

# Удалите все образы проекта
docker images | grep ebuster | awk '{print $3}' | xargs docker rmi -f

# Очистите Docker кэш
docker system prune -a -f

# Пересоберите всё с нуля
git pull
docker compose build --no-cache

# Запустите
docker compose up -d

# Скопируйте плейсхолдер
docker cp tests/public/autotest/index.html ebuster-frontend:/usr/share/nginx/html/autotest/index.html
docker exec ebuster-frontend nginx -s reload

# Запустите тесты
docker compose run --rm autotest-runner npm run test:all
```

---

## Итоговая проверка:

После всех исправлений:

```bash
# 1. Проверьте версию Playwright
docker compose run --rm autotest-runner npx playwright --version
# Должно быть: Version 1.56.1

# 2. Проверьте дизайн
curl -s https://autotest.ebuster.ru | grep -o "background: #[0-9a-f]*" | head -1
# Должно быть: background: #1a1a1a

# 3. Проверьте stream
curl -s http://localhost:3002/status | jq -r '.status'
# Должно быть: idle

# 4. Запустите тесты
docker compose run --rm autotest-runner npm run test:all
```

**Всё должно работать!** 🎉
