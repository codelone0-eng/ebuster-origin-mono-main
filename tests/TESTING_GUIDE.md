# 🧪 Ebuster Testing Guide

## Структура тестов

Тесты разделены на **4 категории**:

### 1. 👨‍💼 UI Admin Panel
- **Файлы**: `tests/ui/admin-*.spec.ts`
- **Конфиг**: `tests/config/playwright.ui-admin.config.ts`
- **Описание**: UI-тесты для админ-панели (пользователи, скрипты, подписки, тикеты, рефералы)

### 2. 👤 UI User Dashboard
- **Файлы**: `tests/ui/lk-*.spec.ts`
- **Конфиг**: `tests/config/playwright.ui-lk.config.ts`
- **Описание**: UI-тесты для личного кабинета пользователя

### 3. 🔧 Backend Admin API
- **Файлы**: `tests/api/admin-*.spec.ts`
- **Конфиг**: `tests/config/playwright.api-admin.config.ts`
- **Описание**: API-тесты для админских эндпоинтов

### 4. 🔌 Backend User API
- **Файлы**: `tests/api/api-extended.spec.ts`
- **Конфиг**: `tests/config/playwright.api-lk.config.ts`
- **Описание**: API-тесты для пользовательских эндпоинтов

## Быстрый старт

### Запуск всех тестов сразу

```bash
# Экспортировать переменные окружения
export $(grep -v '^#' .env.autotest | xargs)

# Запустить все 4 категории последовательно
npm run test:all

# Сгенерировать HTML-дашборд
npm run test:dashboard

# Запустить веб-сервер для просмотра отчётов
npm run test:serve
```

После запуска откройте в браузере: **http://localhost:8888**

### Запуск отдельных категорий

```bash
# UI Admin Panel
npm run test:ui-admin

# UI User Dashboard
npm run test:ui-lk

# Backend Admin API
npm run test:api-admin

# Backend User API
npm run test:api-lk
```

## HTML Dashboard

### Возможности дашборда

- 📊 **Общая статистика** по всем тестам
- 🎯 **Карточки для каждой категории** с детальной информацией
- 🔗 **Прямые ссылки** на детальные отчёты Playwright
- 🔄 **Автообновление** каждые 30 секунд
- 📱 **Адаптивный дизайн** для мобильных устройств

### Структура отчётов

```
tests/reports/
├── index.html              # Главный дашборд
├── summary.json            # JSON с результатами всех тестов
├── ui-admin/
│   ├── html/              # Playwright HTML отчёт
│   └── results.json       # JSON результаты
├── ui-lk/
│   ├── html/
│   └── results.json
├── api-admin/
│   ├── html/
│   └── results.json
└── api-lk/
    ├── html/
    └── results.json
```

## Веб-сервер для отчётов

### Запуск сервера

```bash
npm run test:serve
```

Сервер запустится на порту **8888** (можно изменить через `REPORT_PORT`):

```bash
REPORT_PORT=9000 npm run test:serve
```

### Доступные URL

- **Главный дашборд**: http://localhost:8888
- **UI Admin отчёт**: http://localhost:8888/ui-admin/html/index.html
- **UI LK отчёт**: http://localhost:8888/ui-lk/html/index.html
- **API Admin отчёт**: http://localhost:8888/api-admin/html/index.html
- **API LK отчёт**: http://localhost:8888/api-lk/html/index.html

## Интеграция с Telegram

### Отправка отчёта после всех тестов

```bash
# Запустить все тесты и отправить отчёт
npm run test:all && npm run autotest-send-report
```

### Настройка переменных окружения

```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
PROJECT_NAME=Ebuster Autotests
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Run Tests

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 3 * * *'  # Каждый день в 3:00

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run all tests
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          LK_BASE_URL: ${{ secrets.LK_BASE_URL }}
          API_URL: ${{ secrets.API_URL }}
          ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
          ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
        run: npm run test:all
      
      - name: Generate dashboard
        if: always()
        run: npm run test:dashboard
      
      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: tests/reports/
      
      - name: Send Telegram notification
        if: always()
        run: npm run autotest-send-report
```

### Cron на сервере

```bash
# Добавить в crontab
crontab -e

# Запускать каждый день в 3:00
0 3 * * * cd /srv/ebuster && export $(grep -v '^#' .env.autotest | xargs) && npm run test:all && npm run autotest-send-report
```

## Расширенные возможности

### Запуск с трейсингом

```bash
npx playwright test --config tests/config/playwright.ui-admin.config.ts --trace on
```

### Запуск в headed mode

```bash
npx playwright test --config tests/config/playwright.ui-admin.config.ts --headed
```

### Запуск только упавших тестов

```bash
npx playwright test --config tests/config/playwright.ui-admin.config.ts --last-failed
```

### Debug mode

```bash
npx playwright test --config tests/config/playwright.ui-admin.config.ts --debug
```

## Troubleshooting

### Тесты не запускаются

```bash
# Переустановить браузеры
npx playwright install --with-deps --force

# Проверить версию Playwright
npx playwright --version
```

### Отчёты не генерируются

```bash
# Проверить права доступа
chmod -R 755 tests/reports/

# Очистить старые отчёты
rm -rf tests/reports/*
```

### Веб-сервер не запускается

```bash
# Проверить, не занят ли порт
lsof -i :8888

# Использовать другой порт
REPORT_PORT=9000 npm run test:serve
```

## Полезные команды

```bash
# Запустить все тесты и открыть дашборд
npm run test:all && npm run test:dashboard && npm run test:serve

# Запустить только UI тесты
npm run test:ui-admin && npm run test:ui-lk

# Запустить только API тесты
npm run test:api-admin && npm run test:api-lk

# Очистить все отчёты
rm -rf tests/reports/*

# Посмотреть последний отчёт
npx playwright show-report tests/reports/ui-admin/html
```

## Структура файлов

```
tests/
├── api/                    # API тесты
│   ├── admin-api.spec.ts
│   └── api-extended.spec.ts
├── ui/                     # UI тесты
│   ├── admin-*.spec.ts
│   └── lk-*.spec.ts
├── e2e/                    # E2E тесты
│   └── user-journey.spec.ts
├── config/                 # Конфигурации
│   ├── playwright.ui-admin.config.ts
│   ├── playwright.ui-lk.config.ts
│   ├── playwright.api-admin.config.ts
│   ├── playwright.api-lk.config.ts
│   ├── globalSetup.ts
│   └── telegramReporter.ts
├── scripts/                # Утилиты
│   ├── run-all-tests.ts
│   ├── generate-dashboard.ts
│   ├── serve-reports.ts
│   └── send-last-report.ts
├── storage/                # Состояние авторизации
│   └── admin-state.json
└── reports/                # Отчёты
    ├── index.html
    ├── summary.json
    ├── ui-admin/
    ├── ui-lk/
    ├── api-admin/
    └── api-lk/
```

## Поддержка

Если возникли проблемы:
1. Проверьте `.env.autotest`
2. Убедитесь, что все зависимости установлены: `npm install`
3. Переустановите браузеры: `npx playwright install --with-deps`
4. Проверьте логи в консоли
5. Откройте issue в репозитории
