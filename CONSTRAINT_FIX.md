# 🔧 ИСПРАВЛЕНИЕ CHECK CONSTRAINT

## ❌ Проблема:
```
ERROR: new row for relation "auth_users" violates check constraint "auth_users_role_check"
```

**Причина:** В таблице `auth_users` есть CHECK constraint на поле `role`, который разрешает только старые значения:
- `user`
- `admin`
- `moderator`
- `developer`

Но мы пытаемся установить новые значения из таблицы `roles`:
- `free` ❌ НЕ РАЗРЕШЕНО!
- `pro` ❌ НЕ РАЗРЕШЕНО!
- `premium` ❌ НЕ РАЗРЕШЕНО!

---

## ✅ Решение:

### Вариант 1: Быстрое исправление
**Выполните:** `migrations/FIX_ROLE_CONSTRAINT.sql`

Это:
1. Удалит старый constraint
2. Создаст новый с учетом всех ролей
3. Синхронизирует данные

### Вариант 2: Полная миграция (рекомендуется)
**Выполните:** `migrations/COMPLETE_FIX_ALL.sql`

Уже обновлен! Теперь включает:
- **ЧАСТЬ 0:** Исправление constraint ← НОВОЕ!
- ЧАСТЬ 1: Subscriptions
- ЧАСТЬ 2: Scripts category
- ЧАСТЬ 3: User_scripts FK
- ЧАСТЬ 4: Auth_users sync
- ЧАСТЬ 5: RLS
- ЧАСТЬ 6: Проверка

---

## 🎯 Что изменится:

### Было:
```sql
CHECK (role IN ('user', 'admin', 'moderator', 'developer'))
```

### Стало:
```sql
CHECK (role IN ('user', 'admin', 'moderator', 'developer', 'free', 'pro', 'premium'))
```

---

## 🚀 Выполнить сейчас:

```sql
-- Удалить старый constraint
ALTER TABLE auth_users DROP CONSTRAINT IF EXISTS auth_users_role_check;

-- Создать новый
ALTER TABLE auth_users 
ADD CONSTRAINT auth_users_role_check 
CHECK (role IN ('user', 'admin', 'moderator', 'developer', 'free', 'pro', 'premium'));
```

---

## ✅ После исправления:

Синхронизация `role` с `role_id` заработает:
```sql
UPDATE auth_users u
SET role = r.name
FROM roles r
WHERE r.id = u.role_id;
```

Результат:
```
email                    | role (old) | role (new)
-------------------------|------------|------------
stayalive019@gmail.com   | user       | free ✅
codelone0@gmail.com      | admin      | admin ✅
```

---

**Выполните FIX_ROLE_CONSTRAINT.sql или обновленный COMPLETE_FIX_ALL.sql!** 🎉
