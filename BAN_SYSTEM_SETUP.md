# Установка и настройка системы банов

## ✅ Что реализовано:

### 1. База данных
- ✅ Таблица `user_bans` с полной структурой
- ✅ Индексы для оптимизации
- ✅ RLS политики для безопасности
- ✅ Функция генерации `ban_id`
- ✅ Функция автоматической разблокировки
- ✅ Триггеры для `updated_at`

### 2. Backend API
- ✅ Endpoint `POST /api/admin/users/:id/ban`
- ✅ Endpoint `POST /api/admin/auto-unban`
- ✅ Функция отправки email
- ✅ Расчет `unbanDate`
- ✅ Валидация данных

### 3. Cron Jobs
- ✅ Автоматическая разблокировка каждые 5 минут
- ✅ Очистка истекших банов каждый день в 00:00

### 4. Frontend
- ✅ Модальное окно бана в админке
- ✅ Форма с всеми параметрами
- ✅ Предпросмотр бана
- ✅ Интеграция с API

---

## 📦 Установка зависимостей

```bash
# В корне проекта
npm install nodemailer node-cron node-fetch
npm install --save-dev @types/nodemailer @types/node-cron @types/node-fetch
```

---

## 🗄️ Настройка базы данных

### 1. Выполните SQL миграцию

```bash
# Подключитесь к Supabase SQL Editor
# Скопируйте содержимое файла src/lib/user-bans-schema.sql
# Выполните SQL запрос
```

Или через CLI:

```bash
supabase db push --file src/lib/user-bans-schema.sql
```

### 2. Проверьте создание таблицы

```sql
SELECT * FROM user_bans LIMIT 1;
SELECT generate_ban_id();
SELECT auto_unban_users();
```

---

## 📧 Настройка SMTP для email

### 1. Добавьте переменные окружения в `.env`:

```env
# SMTP настройки для отправки email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Для Gmail нужно создать App Password:
# https://myaccount.google.com/apppasswords
```

### 2. Для других провайдеров:

**Yandex:**
```env
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
```

**Mail.ru:**
```env
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

---

## 🚀 Запуск

### 1. Установите зависимости

```bash
npm install
```

### 2. Запустите сервер

```bash
npm run dev
```

### 3. Проверьте логи

Вы должны увидеть:

```
✅ [CRON] Автоматическая разблокировка настроена (каждые 5 минут)
✅ [CRON] Очистка истекших банов настроена (каждый день в 00:00)
✅ [CRON] Все cron jobs запущены
```

---

## 🧪 Тестирование

### 1. Тест бана пользователя

```bash
curl -X POST http://localhost:3001/api/admin/users/USER_ID/ban \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Тестовая блокировка",
    "banType": "temporary",
    "duration": 1,
    "durationUnit": "hours",
    "contactEmail": "support@ebuster.ru"
  }'
```

**Ожидаемый ответ:**

```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "status": "banned",
    "banInfo": {
      "banId": "BAN-2024-0001",
      "banType": "temporary",
      "reason": "Тестовая блокировка",
      "banDate": "2024-01-15T14:30:00.000Z",
      "unbanDate": "2024-01-15T15:30:00.000Z",
      "durationHours": 1,
      "contactEmail": "support@ebuster.ru",
      "moderator": "admin@ebuster.ru"
    }
  },
  "message": "Пользователь успешно заблокирован"
}
```

### 2. Тест автоматической разблокировки

```bash
curl -X POST http://localhost:3001/api/admin/auto-unban
```

**Ожидаемый ответ:**

```json
{
  "success": true,
  "data": {
    "unbannedCount": 1
  },
  "message": "Разблокировано пользователей: 1"
}
```

### 3. Проверка email

Проверьте почту пользователя. Должно прийти письмо:

```
Тема: 🚫 Ваш аккаунт заблокирован - Ebuster

Содержимое:
- ID блокировки
- Тип блокировки
- Дата блокировки
- Дата разблокировки
- Причина
- Контакты поддержки
```

---

## 📊 Мониторинг

### 1. Проверка активных банов

```sql
SELECT 
  ub.ban_id,
  u.email,
  ub.reason,
  ub.ban_type,
  ub.ban_date,
  ub.unban_date,
  ub.is_active
FROM user_bans ub
JOIN users u ON u.id = ub.user_id
WHERE ub.is_active = TRUE
ORDER BY ub.ban_date DESC;
```

### 2. Статистика банов

```sql
SELECT 
  ban_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = TRUE) as active,
  COUNT(*) FILTER (WHERE is_active = FALSE) as expired
FROM user_bans
GROUP BY ban_type;
```

### 3. Скоро истекающие баны

```sql
SELECT 
  ub.ban_id,
  u.email,
  ub.unban_date,
  EXTRACT(EPOCH FROM (ub.unban_date - NOW())) / 3600 as hours_remaining
FROM user_bans ub
JOIN users u ON u.id = ub.user_id
WHERE ub.is_active = TRUE
  AND ub.ban_type = 'temporary'
  AND ub.unban_date <= NOW() + INTERVAL '24 hours'
ORDER BY ub.unban_date ASC;
```

---

## 🔧 Настройка Cron Jobs

### Изменение частоты разблокировки

В файле `src/api/cron-jobs.ts`:

```typescript
// Каждые 5 минут (по умолчанию)
cron.schedule('*/5 * * * *', ...)

// Каждую минуту
cron.schedule('* * * * *', ...)

// Каждые 10 минут
cron.schedule('*/10 * * * *', ...)

// Каждый час
cron.schedule('0 * * * *', ...)
```

### Формат cron:

```
┌────────────── секунда (опционально)
│ ┌──────────── минута (0 - 59)
│ │ ┌────────── час (0 - 23)
│ │ │ ┌──────── день месяца (1 - 31)
│ │ │ │ ┌────── месяц (1 - 12)
│ │ │ │ │ ┌──── день недели (0 - 7)
│ │ │ │ │ │
* * * * * *
```

---

## 🐛 Troubleshooting

### Проблема: Email не отправляются

**Решение:**

1. Проверьте SMTP настройки в `.env`
2. Для Gmail создайте App Password
3. Проверьте логи: `console.log` в `sendBanEmail`
4. Проверьте firewall/антивирус

### Проблема: Cron jobs не запускаются

**Решение:**

1. Проверьте что сервер запущен
2. Проверьте логи при старте сервера
3. Проверьте что `startAllCronJobs()` вызывается
4. Проверьте формат cron выражения

### Проблема: Функция generate_ban_id не найдена

**Решение:**

1. Выполните SQL миграцию заново
2. Проверьте что функция создана:
```sql
SELECT proname FROM pg_proc WHERE proname = 'generate_ban_id';
```
3. Если нет - создайте вручную из `user-bans-schema.sql`

### Проблема: RLS блокирует запросы

**Решение:**

1. Проверьте что используется `SUPABASE_SERVICE_KEY`
2. Проверьте роль пользователя в таблице `users`
3. Временно отключите RLS для теста:
```sql
ALTER TABLE user_bans DISABLE ROW LEVEL SECURITY;
```

---

## 📝 Примеры использования

### Временный бан на 7 дней

```javascript
await adminApi.banUser(userId, {
  reason: 'Нарушение правил - спам в комментариях',
  banType: 'temporary',
  duration: 7,
  durationUnit: 'days',
  contactEmail: 'support@ebuster.ru'
});
```

### Постоянный бан

```javascript
await adminApi.banUser(userId, {
  reason: 'Серьезное нарушение - мошенничество',
  banType: 'permanent',
  contactEmail: 'support@ebuster.ru'
});
```

### Бан на несколько часов

```javascript
await adminApi.banUser(userId, {
  reason: 'Временная блокировка за флуд',
  banType: 'temporary',
  duration: 12,
  durationUnit: 'hours',
  contactEmail: 'support@ebuster.ru'
});
```

---

## 🔐 Безопасность

### 1. RLS Политики

Таблица `user_bans` защищена RLS:

- ✅ Только админы могут создавать/просматривать все баны
- ✅ Пользователи видят только свои активные баны
- ✅ Обновление только через API

### 2. Валидация

- ✅ Проверка обязательных полей
- ✅ Проверка типа бана
- ✅ Проверка длительности
- ✅ Санитизация причины

### 3. Логирование

- ✅ Все баны логируются в консоль
- ✅ Сохраняется email модератора
- ✅ Сохраняется timestamp

---

## 📈 Production Checklist

- [ ] Выполнена SQL миграция
- [ ] Настроены SMTP переменные
- [ ] Установлены зависимости
- [ ] Протестирован бан пользователя
- [ ] Протестирована отправка email
- [ ] Протестирована автоматическая разблокировка
- [ ] Настроены cron jobs
- [ ] Проверены RLS политики
- [ ] Настроен мониторинг
- [ ] Созданы индексы БД
- [ ] Проверена производительность

---

**Готово к продакшену!** 🚀🎉
