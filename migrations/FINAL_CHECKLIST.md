# ✅ Финальный чеклист перед применением миграции

## 📋 Проверка полей таблицы `users`

### Основные поля
- ✅ `id` UUID PRIMARY KEY
- ✅ `email` VARCHAR(255) UNIQUE NOT NULL
- ✅ `password_hash` TEXT NOT NULL
- ✅ `full_name` VARCHAR(255)
- ✅ `avatar_url` TEXT

### Статус и роль
- ✅ `status` VARCHAR(50) DEFAULT 'active'
- ✅ `role` VARCHAR(50) DEFAULT 'user'
- ✅ `role_id` UUID
- ✅ `email_confirmed` BOOLEAN DEFAULT false

### Баны (для совместимости со старым кодом)
- ✅ `is_banned` BOOLEAN DEFAULT false
- ✅ `ban_reason` TEXT
- ✅ `ban_expires_at` TIMESTAMP WITH TIME ZONE

### Подписки (для совместимости)
- ✅ `subscription_type` VARCHAR(50) DEFAULT 'free'
- ✅ `subscription_expires_at` TIMESTAMP WITH TIME ZONE
- ✅ `subscription_id` UUID

### 2FA
- ✅ `two_factor_enabled` BOOLEAN DEFAULT false
- ✅ `two_factor_secret` TEXT
- ✅ `two_factor_secret_temp` TEXT
- ✅ `two_factor_backup_codes` TEXT[]

### Активность
- ✅ `last_active` TIMESTAMP WITH TIME ZONE
- ✅ `browser` VARCHAR(255)
- ✅ `location` VARCHAR(255)
- ✅ `downloads` INTEGER DEFAULT 0
- ✅ `scripts` INTEGER DEFAULT 0

### Реферальная система
- ✅ `referral_code` VARCHAR(50) UNIQUE
- ✅ `referred_by` UUID REFERENCES users(id)
- ✅ `referral_earnings` DECIMAL(10,2) DEFAULT 0

### Токены
- ✅ `token_version` BIGINT DEFAULT 0
- ✅ `reset_token` TEXT
- ✅ `reset_token_expiry` TIMESTAMP WITH TIME ZONE
- ✅ `confirmation_token` TEXT
- ✅ `confirmation_token_expiry` TIMESTAMP WITH TIME ZONE

### OTP (ВАЖНО!)
- ✅ `otp` TEXT
- ✅ `otp_expiry` TIMESTAMP WITH TIME ZONE

### Timestamps
- ✅ `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- ✅ `updated_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()

---

## 📋 Проверка других таблиц

### `scripts`
- ✅ `name` (не `title`)
- ✅ `downloads` (не `downloads_count`)
- ✅ `views`, `is_public`, `icon_url`

### `user_bans`
- ✅ `id` (не `ban_id`)
- ✅ `expires_at` (не `unban_date`)
- ✅ Нет поля `ban_type`

### `tickets`
- ✅ `ticket_number` VARCHAR(50) UNIQUE NOT NULL
- ✅ `user_email` VARCHAR(255)

---

## 🔍 Проверка кода

### Замены в коде
- ✅ `auth_users` → `users` везде
- ✅ `user_bans` поля исправлены
- ✅ `scripts` поля исправлены

### Файлы обновлены
- ✅ `src/api/cron-jobs.ts`
- ✅ `src/api/tickets-new.controller.ts`
- ✅ `src/api/subscriptions.controller.ts`
- ✅ `src/api/roles.controller.ts`
- ✅ `src/lib/supabase-api.ts`
- ✅ `src/api/referral.controller.ts`

---

## 🚀 Порядок применения

1. **Бэкап БД** (обязательно!)
   ```bash
   # Через Supabase Dashboard → Database → Backups
   ```

2. **Очистка БД**
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON SCHEMA public TO public;
   ```

3. **Создание таблиц**
   ```sql
   \i CLEAN_DB_SETUP.sql
   ```

4. **Настройка RLS**
   ```sql
   \i SETUP_RLS_POLICIES.sql
   ```

5. **Перезапуск приложения**
   ```bash
   docker-compose restart
   ```

6. **Проверка логов**
   ```bash
   docker-compose logs -f ebuster-api
   ```

---

## ⚠️ Что проверить после миграции

### Регистрация
- [ ] Регистрация нового пользователя работает
- [ ] OTP код отправляется
- [ ] Подтверждение email работает

### Авторизация
- [ ] Вход работает
- [ ] JWT токены генерируются
- [ ] Сессии сохраняются

### Профиль
- [ ] Просмотр профиля работает
- [ ] Редактирование профиля работает
- [ ] Смена пароля работает

### Скрипты
- [ ] Создание скрипта работает
- [ ] Просмотр скриптов работает
- [ ] Скачивание работает

### Тикеты
- [ ] Создание тикета работает
- [ ] Просмотр тикетов работает
- [ ] Ответы на тикеты работают

### Cron Jobs
- [ ] Автоматическая разблокировка работает
- [ ] Нет ошибок в логах

---

## 🐛 Известные проблемы

### TypeScript типы
После миграции нужно регенерировать типы:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

### node-cron типы
Установить:
```bash
npm install --save-dev @types/node-cron
```

---

## 📞 Если что-то пошло не так

1. **Откат из бэкапа**
   - Supabase Dashboard → Database → Backups → Restore

2. **Проверка логов**
   ```bash
   docker-compose logs -f ebuster-api
   ```

3. **Проверка таблиц**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

4. **Проверка полей**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'users' 
   ORDER BY ordinal_position;
   ```
