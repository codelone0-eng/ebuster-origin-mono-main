# 🔄 Database Refactoring Guide

## ✅ Что сделано

### 1. Создана миграция БД (`refactor_database.sql`)
- Объединены таблицы `auth_users` и `users` → `users`
- Объединены `scripts`, `script_categories`, `script_downloads` → `scripts`
- Упрощены `tickets`, `api_keys`, `subscriptions`
- Сохранены все данные

### 2. Обновлён код
- ✅ `auth.controller.ts` - все `auth_users` → `users`
- ✅ `auth.middleware.ts` - все `auth_users` → `users`
- ✅ `user.controller.ts` - все `auth_users` → `users`
- ✅ `admin.controller.ts` - все `auth_users` → `users`
- ✅ `referral.controller.ts` - все `auth_users` → `users`
- ✅ `apikeys.controller.ts` - все `auth_users` → `users`
- ✅ `extension-auth.controller.ts` - все `auth_users` → `users`
- ✅ `cron-jobs.ts` - все `auth_users` → `users`

## 🚀 Как применить

### Шаг 1: Бэкап БД (ОБЯЗАТЕЛЬНО!)

```bash
# На сервере
ssh root@ypkabyarot

# Создать бэкап
pg_dump -h localhost -U postgres -d ebuster > /root/backup_before_refactoring_$(date +%Y%m%d_%H%M%S).sql

# Проверить что бэкап создан
ls -lh /root/backup_before_refactoring_*
```

### Шаг 2: Применить миграцию

```bash
# Перейти в директорию проекта
cd /srv/ebuster

# Подтянуть изменения
git pull origin main

# Применить миграцию
docker exec -i ebuster-db psql -U postgres -d ebuster < migrations/refactor_database.sql

# Или если БД на хосте:
psql -h localhost -U postgres -d ebuster -f migrations/refactor_database.sql
```

### Шаг 3: Перезапустить сервисы

```bash
# Пересобрать и перезапустить API
docker-compose down
docker-compose build --no-cache ebuster-api
docker-compose up -d

# Проверить логи
docker-compose logs -f ebuster-api
```

### Шаг 4: Проверка

1. **Авторизация**: https://ebuster.ru/login
2. **Регистрация**: https://ebuster.ru/register
3. **Профиль**: https://lk.ebuster.ru
4. **Скрипты**: https://lk.ebuster.ru (вкладка Scripts)
5. **Тикеты**: https://lk.ebuster.ru (вкладка Tickets)

## ⚠️ Критичные изменения

### Удалены временные поля OTP
Из таблицы `users` удалены:
- `otp` - теперь не используется
- `otp_expiry` - теперь не используется

Вместо них используется `confirmation_token` и `confirmation_token_expiry`.

### Новая структура таблиц

**users** (объединённая):
```sql
- id UUID PRIMARY KEY
- email VARCHAR(255) UNIQUE NOT NULL
- password_hash TEXT NOT NULL
- full_name VARCHAR(255)
- avatar_url TEXT
- status VARCHAR(50) DEFAULT 'active'
- role VARCHAR(50) DEFAULT 'user'
- email_confirmed BOOLEAN DEFAULT false
- two_factor_enabled BOOLEAN DEFAULT false
- two_factor_secret TEXT
- two_factor_backup_codes TEXT[]
- last_active TIMESTAMP
- browser VARCHAR(255)
- location VARCHAR(255)
- downloads INTEGER DEFAULT 0
- referral_code VARCHAR(50) UNIQUE
- referred_by UUID
- referral_earnings DECIMAL(10,2) DEFAULT 0
- token_version INTEGER DEFAULT 0
- reset_token TEXT
- reset_token_expiry TIMESTAMP
- confirmation_token TEXT
- confirmation_token_expiry TIMESTAMP
- created_at TIMESTAMP DEFAULT NOW()
- updated_at TIMESTAMP DEFAULT NOW()
```

**scripts** (объединённая):
```sql
- id UUID PRIMARY KEY
- name VARCHAR(255) NOT NULL
- description TEXT
- category VARCHAR(100) NOT NULL  -- было FK, теперь VARCHAR
- author_id UUID REFERENCES users(id)
- author_name VARCHAR(255)
- code TEXT NOT NULL
- version VARCHAR(50) DEFAULT '1.0.0'
- downloads INTEGER DEFAULT 0  -- было в отдельной таблице
- views INTEGER DEFAULT 0
- rating DECIMAL(3,2) DEFAULT 0
- status VARCHAR(50) DEFAULT 'active'
- is_public BOOLEAN DEFAULT true
- is_featured BOOLEAN DEFAULT false
- tags TEXT[]
- icon_url TEXT
- created_at TIMESTAMP DEFAULT NOW()
- updated_at TIMESTAMP DEFAULT NOW()
```

## 🔙 Rollback (если что-то пошло не так)

```bash
# Остановить сервисы
docker-compose down

# Восстановить БД из бэкапа
psql -h localhost -U postgres -d ebuster < /root/backup_before_refactoring_YYYYMMDD_HHMMSS.sql

# Откатить код
git checkout <previous_commit_hash>

# Перезапустить
docker-compose up -d
```

## 📊 Проверка миграции

После применения миграции проверьте:

```sql
-- Проверить что таблица users существует
SELECT COUNT(*) FROM users;

-- Проверить что старая таблица auth_users удалена
SELECT COUNT(*) FROM auth_users;  -- должна быть ошибка

-- Проверить что данные сохранились
SELECT email, full_name, created_at FROM users LIMIT 10;

-- Проверить скрипты
SELECT name, category, downloads FROM scripts LIMIT 10;
```

## 🐛 Известные проблемы

### Lint ошибки (не критично):
- `Cannot find module 'otpauth'` - библиотека установлена, TypeScript не находит типы
- `Cannot find module 'node-cron'` - библиотека установлена, TypeScript не находит типы

Эти ошибки не влияют на работу приложения в runtime.

## 📝 Что дальше

После успешной миграции:
1. Мониторить логи первые 24 часа
2. Проверить все основные функции
3. Удалить старые бэкапы через неделю (если всё работает)

## 🆘 Поддержка

Если что-то пошло не так:
1. Сохраните логи: `docker-compose logs ebuster-api > error_logs.txt`
2. Сделайте rollback (см. выше)
3. Проверьте бэкап БД
