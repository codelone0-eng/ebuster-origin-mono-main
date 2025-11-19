# 🔧 Исправления ошибок Supabase и Frontend

## 📋 Обзор проблем

### 1. **Permission denied для таблиц** (42501)
- `roles`
- `script_categories`
- `referrals`
- `user_scripts`

**Причина**: RLS policies блокируют доступ для service role API.

### 2. **Missing column `ban_date`** (PGRST204)
```
Could not find the 'ban_date' column of 'user_bans'
```

### 3. **Missing foreign key `users_role_id_fkey`** (PGRST200)
```
Could not find a relationship between 'users' and 'roles'
```

### 4. **Frontend error: `toFixed()` на undefined**
```javascript
TypeError: Cannot read properties of undefined (reading 'toFixed')
at ReferralProgram.tsx:180
```

---

## ✅ Решения

### Шаг 1: Выполнить SQL миграцию

Запустите в Supabase SQL Editor:

```bash
# Файл уже создан:
migrations/FIX_RLS_AND_SCHEMA.sql
```

**Что делает миграция:**

1. ✅ Добавляет `ban_date` в `user_bans`
2. ✅ Создаёт `role_id` в `users` с foreign key
3. ✅ Добавляет bypass политики для service role на:
   - `roles`
   - `script_categories`
   - `referrals`
   - `user_scripts`
4. ✅ Создаёт таблицу `user_scripts` если её нет
5. ✅ Добавляет публичный доступ к категориям и ролям

### Шаг 2: Frontend исправления

**Уже исправлено в коде:**

`src/lk/ReferralProgram.tsx` - добавлены optional chaining для всех `toFixed()`:

```typescript
// Было:
stats?.total_earnings.toFixed(2)

// Стало:
stats?.total_earnings?.toFixed(2) || '0.00'
```

---

## 🚀 Инструкция по применению

### 1. Применить SQL миграцию

```sql
-- В Supabase SQL Editor выполните:
-- Скопируйте содержимое migrations/FIX_RLS_AND_SCHEMA.sql
```

### 2. Пересобрать frontend

```bash
cd /srv/ebuster
docker compose down
docker compose build
docker compose up -d
```

### 3. Проверить логи

```bash
docker compose logs -f api
```

**Ожидаемый результат:**
- ✅ Нет ошибок `permission denied`
- ✅ Нет ошибок `Could not find column`
- ✅ Нет ошибок `toFixed()`

---

## 🔍 Проверка RLS политик

После миграции проверьте политики:

```sql
-- Проверка RLS статуса
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('roles', 'script_categories', 'referrals', 'user_scripts')
ORDER BY tablename;

-- Проверка политик
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('roles', 'script_categories', 'referrals', 'user_scripts')
ORDER BY tablename, policyname;
```

**Ожидаемые политики:**

| Таблица | Политика | Команда |
|---------|----------|---------|
| `roles` | Service role can manage roles | ALL |
| `roles` | Anyone can view roles | SELECT |
| `script_categories` | Service role can manage categories | ALL |
| `script_categories` | Anyone can view active categories | SELECT |
| `referrals` | Service role can manage referrals | ALL |
| `user_scripts` | Service role can manage user_scripts | ALL |

---

## 📊 Проверка схемы

```sql
-- Проверка foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'users'
AND kcu.column_name = 'role_id';
```

**Ожидаемый результат:**
```
table_name | column_name | foreign_table_name | constraint_name
-----------|-------------|--------------------|-----------------
users      | role_id     | roles              | users_role_id_fkey
```

---

## 🎯 Тестирование

### 1. Проверка API endpoints

```bash
# Roles
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.ebuster.ru/api/roles

# Categories
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.ebuster.ru/api/categories

# Referrals
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.ebuster.ru/api/referral/user/USER_ID/code

# User Scripts
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.ebuster.ru/api/scripts/user/installed
```

### 2. Проверка Frontend

1. Откройте https://ebuster.ru/lk/referrals
2. Проверьте что статистика отображается без ошибок
3. Откройте консоль браузера - не должно быть ошибок `toFixed()`

---

## 📝 Изменённые файлы

### Backend
- ✅ `migrations/FIX_RLS_AND_SCHEMA.sql` - новая миграция
- ✅ `src/api/referral.controller.ts` - рефакторинг под unified referrals
- ✅ `src/api/admin.controller.ts` - обновление tickets/users
- ✅ `src/api/auth.controller.ts` - обновление referrals
- ✅ `src/api/tickets-new.routes.ts` - удаление uploadAttachment

### Frontend
- ✅ `src/lk/ReferralProgram.tsx` - исправление toFixed() errors

---

## ⚠️ Важные замечания

1. **Service Role Access**: Политики теперь разрешают service role полный доступ к таблицам. Это безопасно, т.к. service key используется только на backend.

2. **Public Access**: Роли и категории доступны для чтения всем пользователям (это нормально для публичных данных).

3. **User Scripts**: Пользователи видят только свои установленные скрипты через RLS.

4. **Referrals**: Пользователи видят только свои рефералы (как реферер или приглашённый).

---

## 🔄 Откат изменений (если нужно)

Если что-то пойдёт не так:

```sql
-- Удалить новые политики
DROP POLICY IF EXISTS "Service role can manage roles" ON roles;
DROP POLICY IF EXISTS "Service role can manage categories" ON script_categories;
DROP POLICY IF EXISTS "Service role can manage referrals" ON referrals;
DROP POLICY IF EXISTS "Service role can manage user_scripts" ON user_scripts;

-- Удалить ban_date
ALTER TABLE user_bans DROP COLUMN IF EXISTS ban_date;

-- Удалить role_id
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_id_fkey;
ALTER TABLE users DROP COLUMN IF EXISTS role_id;
```

---

## ✨ Итог

После применения всех исправлений:

- ✅ Все API endpoints работают без permission denied
- ✅ Нет ошибок с missing columns
- ✅ Frontend отображает данные без crashes
- ✅ RLS политики настроены корректно
- ✅ Unified referrals table работает

**Готово к тестированию!** 🚀
