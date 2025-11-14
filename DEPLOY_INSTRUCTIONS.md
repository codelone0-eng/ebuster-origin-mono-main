# 🚀 Инструкция по деплою новой архитектуры автотестов

## Что изменилось

### Было:
- Тесты запускались внутри сборки фронтенда
- Отчёты копировались в образ
- Нет live-режима
- Всё смешано в одном контейнере

### Стало:
- **Отдельный контейнер** `autotest-runner` для тестов
- **Live-stream сервер** `autotest-stream` для real-time обновлений
- **Shared volumes** для отчётов
- **WebSocket** для live-дашборда
- **Изолированная архитектура**

## Шаги деплоя на сервере

### 1. Подготовка

```bash
# Подключитесь к серверу
ssh root@ypkabyarot

# Перейдите в директорию проекта
cd /srv/ebuster

# Сделайте backup текущей конфигурации
cp docker-compose.yml docker-compose.yml.backup
cp nginx.conf nginx.conf.backup

# Остановите текущие контейнеры
docker compose down
```

### 2. Обновление кода

```bash
# Получите последние изменения
git pull origin main

# Проверьте что все файлы на месте
ls -la Dockerfile.autotest
ls -la Dockerfile.autotest-stream
ls -la tests/stream-server/index.js
ls -la tests/reporters/live-reporter.ts
ls -la tests/scripts/generate-live-dashboard.ts
```

### 3. Проверка .env.autotest

```bash
# Убедитесь что файл существует
cat .env.autotest

# Должен содержать:
# BASE_URL=https://admin.ebuster.ru
# LK_BASE_URL=https://lk.ebuster.ru
# API_URL=https://api.ebuster.ru
# ADMIN_EMAIL=autotest_ebuster@ebuster.ru
# ADMIN_PASSWORD=Autotest!234
# TELEGRAM_BOT_TOKEN=...
# TELEGRAM_CHAT_ID=...
```

### 4. Сборка новых образов

```bash
# Соберите все образы заново
docker compose build --no-cache

# Это займёт несколько минут, будут собраны:
# - ebuster-api (без изменений)
# - ebuster-frontend (убраны тесты)
# - ebuster-autotest-stream (новый)
# - ebuster-autotest-runner (новый)
```

### 5. Запуск сервисов

```bash
# Запустите основные сервисы
docker compose up -d

# Проверьте что всё запустилось
docker compose ps

# Должны быть запущены:
# - ebuster-api (healthy)
# - ebuster-frontend (healthy)
# - ebuster-autotest-stream (healthy)
```

### 6. Первый запуск тестов

```bash
# Запустите тесты вручную
docker compose run --rm autotest-runner npm run test:all

# Это:
# 1. Запустит все 4 категории тестов
# 2. Отправит live-обновления в stream-сервер
# 3. Сгенерирует отчёты в volume autotest_reports
# 4. Создаст live-дашборд с WebSocket
# 5. Отправит уведомление в Telegram
```

### 7. Проверка результатов

```bash
# Проверьте что отчёты появились
docker exec ebuster-frontend ls -la /usr/share/nginx/html/autotest/

# Должны быть:
# - index.html (live-дашборд)
# - summary.json
# - ui-admin/html/
# - ui-lk/html/
# - api-admin/html/
# - api-lk/html/

# Проверьте stream-сервер
curl http://localhost:3002/status | jq

# Откройте в браузере
# https://autotest.ebuster.ru
```

### 8. Настройка автоматического запуска (опционально)

```bash
# Добавьте в crontab
crontab -e

# Запуск каждый день в 3:00
0 3 * * * cd /srv/ebuster && docker compose run --rm autotest-runner npm run test:all >> /var/log/autotest.log 2>&1
```

## Проверка работы live-режима

### 1. Откройте дашборд

```
https://autotest.ebuster.ru
```

### 2. В другом терминале запустите тесты

```bash
docker compose run --rm autotest-runner npm run test:ui-admin
```

### 3. Наблюдайте обновления

- Статус изменится на "Тесты выполняются..."
- Счётчики будут обновляться в реальном времени
- Логи будут появляться внизу
- После завершения страница автоматически перезагрузится

## Troubleshooting

### Проблема: WebSocket не подключается

```bash
# Проверьте что stream-сервер запущен
docker compose ps autotest-stream

# Проверьте логи
docker compose logs autotest-stream

# Проверьте Nginx конфиг
docker exec ebuster-frontend cat /etc/nginx/nginx.conf | grep -A 10 "location /ws"

# Перезапустите frontend
docker compose restart frontend
```

### Проблема: Отчёты не обновляются

```bash
# Проверьте volume
docker volume ls | grep autotest

# Проверьте содержимое
docker run --rm -v ebuster_autotest_reports:/data alpine ls -la /data

# Пересоздайте volume
docker compose down
docker volume rm ebuster_autotest_reports ebuster_autotest_storage
docker compose up -d
docker compose run --rm autotest-runner npm run test:all
```

### Проблема: Тесты падают с ошибкой

```bash
# Проверьте переменные окружения
docker compose run --rm autotest-runner env | grep -E '(BASE_URL|API_URL|ADMIN_EMAIL)'

# Проверьте что API доступен
docker compose run --rm autotest-runner curl -I https://api.ebuster.ru/api/health

# Запустите с дебагом
docker compose run --rm autotest-runner npm run test:ui-admin -- --debug
```

### Проблема: Cloudflare блокирует WebSocket

```bash
# В панели Cloudflare:
# 1. Перейдите в Network
# 2. Включите WebSockets
# 3. Или временно отключите проксирование для autotest.ebuster.ru
```

## Откат на старую версию

Если что-то пошло не так:

```bash
# Остановите новые контейнеры
docker compose down

# Восстановите старые конфиги
cp docker-compose.yml.backup docker-compose.yml
cp nginx.conf.backup nginx.conf

# Откатите git
git reset --hard HEAD~1

# Пересоберите и запустите
docker compose build --no-cache
docker compose up -d
```

## Полезные команды

```bash
# Посмотреть логи всех сервисов
docker compose logs -f

# Посмотреть логи только stream-сервера
docker compose logs -f autotest-stream

# Посмотреть логи тестов
docker compose logs autotest-runner

# Остановить всё
docker compose down

# Остановить и удалить volumes
docker compose down -v

# Пересобрать только один сервис
docker compose build autotest-runner

# Запустить тесты интерактивно
docker compose run --rm -it autotest-runner sh

# Очистить неиспользуемые образы
docker system prune -a

# Экспортировать отчёты
docker run --rm -v ebuster_autotest_reports:/data -v $(pwd):/backup alpine tar czf /backup/reports-$(date +%Y%m%d).tar.gz -C /data .
```

## Что дальше

После успешного деплоя:

1. ✅ Проверьте что дашборд доступен на https://autotest.ebuster.ru
2. ✅ Запустите тесты и убедитесь что live-режим работает
3. ✅ Настройте автоматический запуск через cron
4. ✅ Добавьте интеграцию в CI/CD pipeline
5. ✅ Настройте мониторинг и алерты

---

**Готово! Новая архитектура развёрнута.**

Теперь у вас:
- 🐳 Изолированные контейнеры
- 🔴 Live-обновления в реальном времени
- 📊 Красивый дашборд в фирменном стиле
- 🚀 Готовность к CI/CD
- 📦 Shared volumes для отчётов
