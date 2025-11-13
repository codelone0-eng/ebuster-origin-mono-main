# Быстрые команды для автотестов

## Подготовка (один раз)

```bash
# Установить зависимости
npm install

# Установить браузеры Playwright
npx playwright install --with-deps

# Настроить переменные окружения
cp .env.autotest.example .env.autotest
nano .env.autotest  # отредактировать с реальными значениями
```

## Запуск тестов

```bash
# Экспортировать переменные окружения
export $(grep -v '^#' .env.autotest | xargs)

# Запустить все тесты
npm run autotest-admin

# Запустить с UI (headed mode)
npm run autotest-admin:headed

# Запустить конкретный файл
npx playwright test tests/ui/admin-users.spec.ts

# Debug mode
npx playwright test --debug
```

## Отчёты

```bash
# Открыть HTML отчёт
npx playwright show-report tests/reports/html

# Отправить последний отчёт в Telegram
npm run autotest-send-report

# Allure отчёт
npm run autotest-report
```

## Одной командой (на сервере)

```bash
# Полный цикл: экспорт env → запуск тестов → отчёт в Telegram
export $(grep -v '^#' .env.autotest | xargs) && npm run autotest-admin && npm run autotest-send-report
```

## Troubleshooting

```bash
# Проверить установку Playwright
npx playwright --version

# Переустановить браузеры
npx playwright install --with-deps --force

# Проверить переменные окружения
echo $BASE_URL
echo $ADMIN_EMAIL
echo $TELEGRAM_BOT_TOKEN

# Очистить кэш
rm -rf tests/storage/
rm -rf tests/reports/
```

## Полезные флаги Playwright

```bash
# Запустить только упавшие тесты
npx playwright test --last-failed

# Запустить с максимальным количеством воркеров
npx playwright test --workers=4

# Запустить с трейсингом
npx playwright test --trace on

# Запустить с видео
npx playwright test --video on

# Запустить с замедлением (для отладки)
npx playwright test --headed --slow-mo=1000
```

## Cron для автоматического запуска

```bash
# Добавить в crontab
crontab -e

# Запускать каждый день в 3:00
0 3 * * * cd /srv/ebuster && export $(grep -v '^#' .env.autotest | xargs) && npm run autotest-admin
```
