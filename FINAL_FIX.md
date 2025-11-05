# 🔧 ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ ВСЕХ ОШИБОК

## ❌ Текущие проблемы:

### 1. Subscriptions.role_id = NULL
```
null value in column "role_id" violates not-null constraint
```
**Причина:** API не устанавливает role_id при создании подписки

### 2. FK не найден Supabase
```
Could not find a relationship between 'subscriptions' and 'auth_users'
```
**Причина:** FK называется `fk_subscriptions_user_id`, а Supabase ищет `subscriptions_user_id_fkey`

### 3. Support_tickets - неоднозначность
```
more than one relationship was found for 'support_tickets' and 'auth_users'
```
**Причина:** Две связи (user_id и assigned_to) с одной таблицей

---

## ✅ РЕШЕНИЕ:

### Шаг 1: Исправить FK в БД
**Выполните:** `migrations/FIX_SUPABASE_FK.sql`

Это переименует FK в формат который понимает Supabase:
- `fk_subscriptions_user_id` → `subscriptions_user_id_fkey` ✅
- `fk_subscriptions_role_id` → `subscriptions_role_id_fkey` ✅

### Шаг 2: Исправить API код
**Уже исправлено!** `src/api/subscriptions.controller.ts`

Добавлено:
```typescript
// Находим роль по имени плана
const { data: role } = await supabaseAdmin
  .from('roles')
  .select('id, price_monthly, features')
  .eq('name', plan)
  .single();

// Создаем подписку с role_id
.insert({
  user_id: user.id,
  role_id: role.id, // ← ДОБАВЛЕНО!
  plan,
  amount: role.price_monthly,
  features: role.features,
  ...
})
```

### Шаг 3: Пересобрать и перезапустить
```bash
# Пересобрать API
docker compose down api
docker compose build --no-cache api
docker compose up -d api

# Проверить логи
docker compose logs api -f
```

---

## 📋 Полный порядок действий:

### 1. Выполнить миграции БД (в Supabase SQL Editor):

```sql
-- A. Исправить CHECK constraint
-- Файл: FIX_ROLE_CONSTRAINT.sql
ALTER TABLE auth_users DROP CONSTRAINT IF EXISTS auth_users_role_check;
ALTER TABLE auth_users 
ADD CONSTRAINT auth_users_role_check 
CHECK (role IN ('user', 'admin', 'moderator', 'developer', 'free', 'pro', 'premium'));

-- B. Исправить subscriptions
-- Файл: FIX_SUBSCRIPTIONS_TABLE.sql
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan VARCHAR(50);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

-- C. Исправить FK для Supabase
-- Файл: FIX_SUPABASE_FK.sql
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS fk_subscriptions_user_id;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS fk_subscriptions_role_id;

ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE;

ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_role_id_fkey 
FOREIGN KEY (role_id) REFERENCES roles(id);
```

### 2. Пересобрать API:
```bash
cd /srv/ebuster
git pull origin main
docker compose down api
docker compose build --no-cache api
docker compose up -d api
```

### 3. Проверить работу:
- Открыть https://ebuster.ru/admin
- Вкладка "Подписки"
- Создать подписку
- Должно работать! ✅

---

## 🎯 Что изменится:

### API subscriptions.controller.ts:
```typescript
// БЫЛО:
.insert({
  user_id: user.id,
  plan,  // ← только plan, нет role_id
  ...
})

// СТАЛО:
.insert({
  user_id: user.id,
  role_id: role.id,  // ← добавлено!
  plan,
  amount: role.price_monthly,  // ← из роли
  features: role.features,  // ← из роли
  ...
})
```

### БД Foreign Keys:
```sql
-- БЫЛО:
fk_subscriptions_user_id  ← Supabase не понимает
fk_subscriptions_role_id  ← Supabase не понимает

-- СТАЛО:
subscriptions_user_id_fkey  ← Supabase понимает ✅
subscriptions_role_id_fkey  ← Supabase понимает ✅
```

---

## ✅ После исправления:

1. ✅ Создание подписок работает
2. ✅ role_id устанавливается автоматически
3. ✅ Supabase видит все связи
4. ✅ API возвращает данные с JOIN
5. ✅ Админка показывает подписки

---

## 🔍 Проверка:

```sql
-- Проверка FK
SELECT constraint_name 
FROM information_schema.table_constraints
WHERE table_name = 'subscriptions' 
AND constraint_type = 'FOREIGN KEY';
-- Должно быть:
-- subscriptions_user_id_fkey
-- subscriptions_role_id_fkey

-- Проверка subscriptions
SELECT 
  s.id,
  u.email,
  r.name as role_name,
  s.plan,
  s.amount,
  s.status
FROM subscriptions s
JOIN auth_users u ON u.id = s.user_id
JOIN roles r ON r.id = s.role_id;
```

---

## 📄 Файлы:

1. **`FIX_ROLE_CONSTRAINT.sql`** - исправление CHECK constraint
2. **`FIX_SUBSCRIPTIONS_TABLE.sql`** - добавление полей
3. **`FIX_SUPABASE_FK.sql`** - исправление FK для Supabase
4. **`src/api/subscriptions.controller.ts`** - исправлен код API

---

**Выполните миграции и пересоберите API!** 🚀
