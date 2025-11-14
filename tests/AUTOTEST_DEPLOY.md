# 🚀 Автоматический деплой тестов на autotest.ebuster.ru

## Как это работает

После каждого деплоя проекта автоматически:
1. ✅ Собирается фронтенд (landing, lk, admin)
2. 🧪 Запускаются все автотесты (4 категории)
3. 📊 Генерируется красивый HTML-дашборд
4. 📦 Отчёты копируются в `/usr/share/nginx/html/autotest`
5. 🌐 Nginx отдаёт их на **https://autotest.ebuster.ru**
6. 📱 Отправляется уведомление в Telegram

## Структура

```
ebuster/
├── Dockerfile.frontend          # Сборка фронта + запуск тестов
├── nginx.conf                   # Конфиг с autotest.ebuster.ru
├── run-tests-and-deploy.sh      # Скрипт запуска тестов
└── tests/
    ├── public/autotest/         # Публичная директория с отчётами
    │   ├── index.html           # Главный дашборд
    │   ├── summary.json         # JSON с результатами
    │   ├── ui-admin/html/       # Детальный отчёт UI Admin
    │   ├── ui-lk/html/          # Детальный отчёт UI LK
    │   ├── api-admin/html/      # Детальный отчёт API Admin
    │   └── api-lk/html/         # Детальный отчёт API LK
    └── scripts/
        └── run-all-tests.ts     # Основной скрипт тестирования
```

## Настройка

### 1. Добавить `.env.autotest` на сервер

```bash
# На сервере
cd /srv/ebuster
nano .env.autotest
```

Содержимое:
```env
BASE_URL=https://admin.ebuster.ru
LK_BASE_URL=https://lk.ebuster.ru
API_URL=https://api.ebuster.ru
ADMIN_EMAIL=autotest_ebuster@ebuster.ru
ADMIN_PASSWORD=Autotest!234
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
PROJECT_NAME=Ebuster Autotests
```

### 2. Пересобрать контейнеры

```bash
# Остановить текущие контейнеры
docker-compose down

# Пересобрать с тестами
docker-compose up -d --build
```

## Процесс деплоя

### Автоматический (через Docker)

1. `docker-compose up --build` запускает сборку
2. Dockerfile.frontend выполняет:
   ```bash
   npm run build                    # Сборка фронта
   ./run-tests-and-deploy.sh        # Запуск тестов
   ```
3. `run-tests-and-deploy.sh` выполняет:
   ```bash
   npm run test:all                 # Все 4 категории тестов
   npm run test:dashboard           # Генерация дашборда
   npm run autotest-send-report     # Отправка в Telegram
   ```
4. Отчёты копируются в `tests/public/autotest/`
5. Nginx отдаёт их на `https://autotest.ebuster.ru`

### Ручной запуск

```bash
# На сервере
cd /srv/ebuster
export $(grep -v '^#' .env.autotest | xargs)
./run-tests-and-deploy.sh
```

## Доступ к отчётам

### Главный дашборд
**https://autotest.ebuster.ru**

Показывает:
- Общую статистику по всем тестам
- 4 карточки категорий (UI Admin, UI LK, API Admin, API LK)
- Клик на карточку → детальный Playwright отчёт
- Автообновление каждые 30 секунд

### Детальные отчёты

- **UI Admin**: https://autotest.ebuster.ru/ui-admin/html/index.html
- **UI LK**: https://autotest.ebuster.ru/ui-lk/html/index.html
- **API Admin**: https://autotest.ebuster.ru/api-admin/html/index.html
- **API LK**: https://autotest.ebuster.ru/api-lk/html/index.html

## Особенности

### ✅ Только актуальный отчёт

- Старые отчёты удаляются перед каждым запуском
- Хранится только последний результат
- Экономия места на диске

### ✅ Не блокирует деплой

- Если тесты падают — деплой продолжается
- Если `.env.autotest` нет — тесты пропускаются
- Создаётся заглушка "Tests not configured"

### ✅ Красивый дизайн

- Фирменная тёмная палитра
- Адаптивный дизайн для всех устройств
- Современная анимация и эффекты
- Шрифт Inter для читаемости

## Troubleshooting

### Тесты не запускаются

```bash
# Проверить наличие .env.autotest
ls -la /srv/ebuster/.env.autotest

# Проверить переменные
cat /srv/ebuster/.env.autotest

# Запустить вручную
cd /srv/ebuster
export $(grep -v '^#' .env.autotest | xargs)
./run-tests-and-deploy.sh
```

### Отчёты не обновляются

```bash
# Проверить директорию
ls -la /srv/ebuster/tests/public/autotest/

# Пересобрать контейнер
docker-compose up -d --build frontend
```

### Nginx не отдаёт отчёты

```bash
# Проверить конфиг
docker exec ebuster-frontend cat /etc/nginx/nginx.conf | grep autotest

# Проверить файлы
docker exec ebuster-frontend ls -la /usr/share/nginx/html/autotest/

# Перезапустить Nginx
docker-compose restart frontend
```

## Мониторинг

### Логи сборки

```bash
# Смотреть логи сборки
docker-compose logs -f frontend

# Логи тестов
docker-compose logs frontend | grep "Running:"
```

### Статус тестов

```bash
# Посмотреть summary.json
curl https://autotest.ebuster.ru/summary.json | jq
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Deploy with Tests

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        run: |
          ssh user@server 'cd /srv/ebuster && git pull && docker-compose up -d --build'
      
      - name: Wait for tests
        run: sleep 300  # Ждём 5 минут
      
      - name: Check test results
        run: |
          curl https://autotest.ebuster.ru/summary.json
```

## Безопасность

### Ограничение доступа (опционально)

Если нужно закрыть отчёты паролем, добавьте в `nginx.conf`:

```nginx
location / {
    auth_basic "Test Reports";
    auth_basic_user_file /etc/nginx/.htpasswd;
    try_files $uri $uri/ /index.html;
}
```

Создайте пароль:
```bash
docker exec -it ebuster-frontend sh
apk add apache2-utils
htpasswd -c /etc/nginx/.htpasswd admin
```

## Полезные команды

```bash
# Запустить только тесты (без деплоя)
npm run test:all

# Сгенерировать дашборд
npm run test:dashboard

# Отправить отчёт в Telegram
npm run autotest-send-report

# Посмотреть отчёт локально
npm run test:serve
# Откройте http://localhost:8888
```

---

**Готово! Теперь после каждого деплоя автоматически:**
- ✅ Запускаются тесты
- ✅ Генерируется дашборд
- ✅ Отчёты доступны на https://autotest.ebuster.ru
- ✅ Уведомления приходят в Telegram
