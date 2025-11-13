# Автотесты Ebuster

Полный набор автоматизированных тестов для платформы Ebuster, включая UI, API и E2E тесты.

## Структура тестов

```
tests/
├── config/              # Конфигурация Playwright
│   ├── playwright.config.ts
│   ├── globalSetup.ts
│   └── telegramReporter.ts
├── ui/                  # UI-тесты
│   ├── admin-*.spec.ts  # Тесты админ-панели
│   └── lk-*.spec.ts     # Тесты личного кабинета
├── api/                 # API-тесты
│   ├── admin-api.spec.ts
│   └── api-extended.spec.ts
├── e2e/                 # E2E сценарии
│   └── user-journey.spec.ts
└── utils/               # Вспомогательные утилиты
    ├── env.ts
    └── auth.ts
```

## Покрытие тестов

### Admin Panel (admin.ebuster.ru)
- ✅ Управление пользователями (список, поиск, детали, действия)
- ✅ Управление скриптами (список, фильтры, CRUD)
- ✅ Подписки (список, статистика, фильтры)
- ✅ Тикеты (список, фильтры, ответы/закрытие)
- ✅ Рефералы (обзор, статистика, коды)
- ✅ Навигация по разделам

### User Panel (lk.ebuster.ru)
- ✅ Дашборд (профиль, навигация)
- ✅ Библиотека скриптов (поиск, установленные, детали)
- ✅ Поддержка (список, создание тикетов, фильтры)
- ✅ Реферальная программа (код, статистика, список)

### API Tests
- ✅ Базовые smoke-тесты (health, referrals, scripts, tickets)
- ✅ CRUD операции (скрипты, тикеты, подписки)
- ✅ Валидация и edge cases
- ✅ Профиль пользователя

### E2E Scenarios
- ✅ Логин → Скрипты → Тикет
- ✅ Полный пользовательский flow

## Установка

```bash
# 1. Установить зависимости
npm install

# 2. Установить браузеры Playwright
npx playwright install --with-deps

# 3. Настроить переменные окружения
cp .env.autotest.example .env.autotest
# Отредактировать .env.autotest с реальными значениями
```

## Конфигурация

Файл `.env.autotest` должен содержать:

```env
# URLs
BASE_URL=https://admin.ebuster.ru
LK_BASE_URL=https://lk.ebuster.ru
API_URL=https://api.ebuster.ru

# Test credentials
ADMIN_EMAIL=autotest_ebuster@ebuster.ru
ADMIN_PASSWORD=Autotest!234

# Telegram notifications
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Project name
PROJECT_NAME=Ebuster Autotests
```

## Запуск тестов

### Все тесты
```bash
npm run autotest
```

### Только админ-панель
```bash
npm run autotest-admin
```

### Только личный кабинет
```bash
npm run autotest-lk
```

### Только API-тесты
```bash
npm run autotest-api
```

### С UI (headed mode)
```bash
npx playwright test --headed
```

### Конкретный файл
```bash
npx playwright test tests/ui/admin-users.spec.ts
```

### Debug mode
```bash
npx playwright test --debug
```

## Отчёты

### HTML Report
```bash
npm run autotest-report
# или
npx playwright show-report tests/reports/html
```

### Allure Report
```bash
npm run autotest-allure
```

### Telegram
Автоматически отправляется после каждого прогона (если настроен `TELEGRAM_BOT_TOKEN`).

#### Отправить последний отчёт вручную
```bash
# Убедитесь, что переменные окружения заданы
export $(grep -v '^#' .env.autotest | xargs)

# Отправить последний отчёт в Telegram
npm run autotest-send-report
```

## CI/CD Integration

### GitHub Actions
```yaml
- name: Install dependencies
  run: npm install

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run tests
  run: npm run autotest
  env:
    BASE_URL: ${{ secrets.BASE_URL }}
    ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
    ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}

- name: Upload report
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: tests/reports/
```

## Troubleshooting

### Ошибка "Cannot find module '@playwright/test'"
```bash
npm install
```

### Ошибка "Executable doesn't exist"
```bash
npx playwright install --with-deps
```

### Тесты падают с timeout
- Проверьте доступность `BASE_URL` и `LK_BASE_URL`
- Убедитесь, что тестовый пользователь существует и активен
- Увеличьте timeout в `playwright.config.ts`

### Логин не проходит
- Проверьте `ADMIN_EMAIL` и `ADMIN_PASSWORD` в `.env.autotest`
- Убедитесь, что пользователь имеет права администратора
- Проверьте логи в консоли: `npx playwright test --debug`
- **Важно**: Логин происходит через `https://ebuster.ru/login`, а не через `admin.ebuster.ru`, т.к. AdminApp не имеет своей страницы логина

### Telegram уведомления не приходят
- Проверьте `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`
- Убедитесь, что бот добавлен в чат
- Проверьте логи репортёра в консоли

## Разработка новых тестов

### Пример UI-теста
```typescript
import { test, expect } from '@playwright/test';
import { BASE_URL } from '../utils/env';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto(`${BASE_URL}/my-page`);
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Пример API-теста
```typescript
import { test, expect } from '@playwright/test';
import { API_URL } from '../utils/env';

test('GET /api/endpoint', async ({ request }) => {
  const response = await request.get(`${API_URL}/api/endpoint`);
  expect(response.status()).toBe(200);
});
```

## Best Practices

1. **Используйте data-testid** для стабильных селекторов
2. **Избегайте хардкода** — используйте переменные окружения
3. **Добавляйте ожидания** — используйте `waitFor` вместо `waitForTimeout`
4. **Группируйте тесты** — используйте `test.describe`
5. **Изолируйте тесты** — каждый тест должен быть независимым
6. **Логируйте важные шаги** — используйте `console.log` для отладки

## Контакты

При возникновении проблем или вопросов обращайтесь к команде разработки.
