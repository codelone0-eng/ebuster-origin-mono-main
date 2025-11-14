# 🐳 Docker Setup для Автотестов

## Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Compose                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   API        │  │  Frontend    │  │ Autotest Stream │  │
│  │  (Express)   │  │   (Nginx)    │  │   (Node.js)     │  │
│  │  :3001       │  │  :80, :443   │  │    :3002        │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│                           │                    │            │
│                           │                    │            │
│                    ┌──────▼────────────────────▼─────┐     │
│                    │    Autotest Runner              │     │
│                    │    (Playwright + Node)          │     │
│                    │    Profile: testing             │     │
│                    └─────────────────────────────────┘     │
│                                                             │
│  Volumes:                                                   │
│  • autotest_reports  → /usr/share/nginx/html/autotest     │
│  • autotest_storage  → /app/tests/storage                 │
└─────────────────────────────────────────────────────────────┘
```

## Сервисы

### 1. **api** (Backend)
- Порт: `3001`
- Healthcheck: `/api/health`
- Зависимости: нет

### 2. **frontend** (Nginx + SPA)
- Порты: `80`, `443`
- Монтирует: `autotest_reports` (read-only)
- Зависимости: `api`, `autotest-stream`
- Отдаёт: landing, lk, admin, autotest

### 3. **autotest-stream** (Live Server)
- Порт: `3002`
- WebSocket + REST API
- Хранит состояние тестов в памяти
- Endpoints:
  - `ws://autotest-stream:3002` — WebSocket
  - `GET /status` — текущее состояние
  - `GET /logs` — логи
  - `POST /update` — webhook от Playwright reporter
  - `POST /reset` — сброс состояния

### 4. **autotest-runner** (Playwright)
- Profile: `testing` (не запускается автоматически)
- Монтирует: `autotest_reports`, `autotest_storage`
- Переменные: `.env.autotest`
- Зависимости: `api`, `autotest-stream`

## Запуск

### Первоначальная настройка

```bash
cd /srv/ebuster

# Убедитесь что .env.autotest существует
cat .env.autotest

# Пересоберите все сервисы
docker compose build --no-cache

# Запустите основные сервисы (api, frontend, autotest-stream)
docker compose up -d
```

### Запуск тестов

```bash
# Запуск всех тестов
docker compose run --rm autotest-runner npm run test:all

# Или через профиль
docker compose --profile testing up autotest-runner

# Запуск конкретной категории
docker compose run --rm autotest-runner npm run test:ui-admin
docker compose run --rm autotest-runner npm run test:ui-lk
docker compose run --rm autotest-runner npm run test:api-admin
docker compose run --rm autotest-runner npm run test:api-lk
```

### Проверка статуса

```bash
# Проверить все контейнеры
docker compose ps

# Логи stream-сервера
docker compose logs -f autotest-stream

# Логи тестов (если запущены)
docker compose logs -f autotest-runner

# Проверить volume с отчётами
docker exec ebuster-frontend ls -la /usr/share/nginx/html/autotest/

# Проверить live-статус
curl http://localhost:3002/status | jq
```

## Live-режим

### Как работает

1. **Playwright reporter** (`tests/reporters/live-reporter.ts`) отправляет события в `autotest-stream:3002/update`
2. **Stream server** хранит состояние и broadcast'ит через WebSocket всем подключенным клиентам
3. **Dashboard** (`tests/public/autotest/index.html`) подключается по WebSocket и обновляется в реальном времени

### События

- `begin` — начало прогона
- `testBegin` — начало теста
- `testEnd` — завершение теста (обновляет счётчики)
- `log` — произвольное сообщение
- `end` — завершение прогона

### Подключение к live-стриму

```javascript
const ws = new WebSocket('ws://autotest.ebuster.ru:3002');

ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  console.log(type, data);
};
```

## Nginx конфигурация

Добавьте в `nginx.conf` проксирование WebSocket:

```nginx
# Autotest Stream WebSocket
location /ws {
    proxy_pass http://autotest-stream:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}

# Autotest Stream REST API
location /stream/ {
    proxy_pass http://autotest-stream:3002/;
    proxy_set_header Host $host;
}
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Deploy and Test

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        run: |
          ssh user@server 'cd /srv/ebuster && git pull && docker compose up -d --build'
      
      - name: Run tests
        run: |
          ssh user@server 'cd /srv/ebuster && docker compose run --rm autotest-runner npm run test:all'
      
      - name: Check results
        run: |
          ssh user@server 'curl -s http://localhost:3002/status | jq ".summary"'
```

### Cron (автоматический запуск)

```bash
# Добавить в crontab
crontab -e

# Запуск каждый час
0 * * * * cd /srv/ebuster && docker compose run --rm autotest-runner npm run test:all >> /var/log/autotest.log 2>&1

# Запуск каждый день в 3:00
0 3 * * * cd /srv/ebuster && docker compose run --rm autotest-runner npm run test:all >> /var/log/autotest.log 2>&1
```

## Troubleshooting

### Тесты не запускаются

```bash
# Проверить .env.autotest
docker compose run --rm autotest-runner cat .env.autotest

# Проверить переменные окружения
docker compose run --rm autotest-runner env | grep -E '(BASE_URL|API_URL|ADMIN_EMAIL)'

# Запустить вручную с логами
docker compose run --rm autotest-runner sh -c "npm run test:ui-admin"
```

### Live-стрим не работает

```bash
# Проверить что stream-сервер запущен
docker compose ps autotest-stream

# Проверить логи
docker compose logs autotest-stream

# Проверить healthcheck
curl http://localhost:3002/status

# Перезапустить
docker compose restart autotest-stream
```

### Отчёты не обновляются

```bash
# Проверить volume
docker volume inspect ebuster_autotest_reports

# Проверить содержимое
docker run --rm -v ebuster_autotest_reports:/data alpine ls -la /data

# Пересоздать volume
docker compose down
docker volume rm ebuster_autotest_reports
docker compose up -d
```

### WebSocket не подключается

```bash
# Проверить порт 3002
netstat -tulpn | grep 3002

# Проверить firewall
sudo ufw status
sudo ufw allow 3002/tcp

# Проверить Cloudflare (если используется)
# WebSocket должен быть включен в настройках домена
```

## Полезные команды

```bash
# Остановить все
docker compose down

# Остановить и удалить volumes
docker compose down -v

# Пересобрать только autotest-runner
docker compose build autotest-runner

# Запустить тесты с интерактивным режимом
docker compose run --rm -it autotest-runner sh

# Очистить старые образы
docker system prune -a

# Посмотреть использование ресурсов
docker stats

# Экспортировать отчёты
docker run --rm -v ebuster_autotest_reports:/data -v $(pwd):/backup alpine tar czf /backup/reports.tar.gz -C /data .
```

## Безопасность

### Ограничение доступа к stream-серверу

Добавьте в `docker-compose.yml`:

```yaml
autotest-stream:
  # ...
  environment:
    - AUTH_TOKEN=your-secret-token
```

И проверяйте токен в `stream-server/index.js`:

```javascript
app.use((req, res, next) => {
  const token = req.headers['authorization'];
  if (token !== `Bearer ${process.env.AUTH_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

### Ограничение портов

Не открывайте порт 3002 наружу, используйте только внутри Docker network:

```yaml
autotest-stream:
  ports:
    - "127.0.0.1:3002:3002"  # Только localhost
```

---

**Готово! Теперь у вас:**
- ✅ Отдельный контейнер для тестов
- ✅ Live-обновления через WebSocket
- ✅ Shared volumes для отчётов
- ✅ Изолированная архитектура
- ✅ CI/CD ready
