# 🗑️ Очистка пользователей из БД

## Проблема:

Регистрация говорит "Пользователь уже существует", хотя вы очистили БД.

**Причина:** У вас 2 таблицы с пользователями:
- `users` - старая таблица
- `auth_users` - новая таблица (используется сейчас)

---

## ✅ Решение:

### Проверка используется `auth_users`:

**Файл:** `src/api/auth.controller.ts` (строка 80-84)

```typescript
const { data: existingUser } = await supabase
  .from('auth_users')  // ← ПРОВЕРКА ЗДЕСЬ
  .select('id')
  .eq('email', email)
  .single();
```

---

## 🔧 Как очистить правильную таблицу:

### Вариант 1: Через Supabase Dashboard

1. Откройте Supabase Dashboard
2. Перейдите в **Table Editor**
3. Выберите таблицу **`auth_users`** (НЕ `users`!)
4. Удалите все записи

### Вариант 2: Через SQL Editor

```sql
-- Очистить таблицу auth_users
DELETE FROM auth_users;

-- Проверить что таблица пустая
SELECT COUNT(*) FROM auth_users;
-- Должно вернуть: 0
```

### Вариант 3: Очистить обе таблицы (на всякий случай)

```sql
-- Очистить обе таблицы
DELETE FROM auth_users;
DELETE FROM users;

-- Проверить
SELECT COUNT(*) FROM auth_users;
SELECT COUNT(*) FROM users;
```

---

## 🔍 Проверка какая таблица используется:

### Регистрация использует:
```typescript
// auth.controller.ts - строка 111
const { data, error: insertError } = await supabase
  .from('auth_users')  // ← ВСТАВКА В auth_users
  .insert({...})
```

### Логин использует:
```typescript
// auth.controller.ts - строка 191
const { data, error: userError } = await supabase
  .from('auth_users')  // ← ПОИСК В auth_users
  .select('*')
  .eq('email', email)
```

### Проверка OTP использует:
```typescript
// auth.controller.ts - строка 189
const { data, error: userError } = await supabase
  .from('auth_users')  // ← ПОИСК В auth_users
  .select('*')
  .eq('email', email)
  .eq('confirmation_token', otp)
```

---

## 📊 Структура таблиц:

### `auth_users` (ИСПОЛЬЗУЕТСЯ):
```sql
CREATE TABLE auth_users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  full_name TEXT,
  email_confirmed BOOLEAN,
  confirmation_token TEXT,
  otp_expiry TIMESTAMPTZ,  -- ← Новое поле для OTP
  status TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### `users` (НЕ ИСПОЛЬЗУЕТСЯ):
```sql
-- Старая таблица, можно удалить
DROP TABLE IF EXISTS users;
```

---

## 🧪 Тест после очистки:

### 1. Очистите таблицу:
```sql
DELETE FROM auth_users;
```

### 2. Проверьте:
```sql
SELECT * FROM auth_users;
-- Должно вернуть: 0 rows
```

### 3. Попробуйте зарегистрироваться:
```bash
# Откройте http://localhost:5173
# Нажмите "Регистрация"
# Введите email: test@example.com
# Введите пароль: Test123!@#
```

**Ожидаемый результат:**
- ✅ Регистрация успешна
- ✅ Email отправлен с OTP кодом
- ✅ Перенаправление на `/verify-otp`

---

## 🔧 Если проблема осталась:

### Проверьте кеш Supabase:

```typescript
// В auth.controller.ts добавьте логирование
console.log('🔍 Проверка email:', email);

const { data: existingUser } = await supabase
  .from('auth_users')
  .select('id')
  .eq('email', email)
  .single();

console.log('📊 Найден пользователь:', existingUser);
```

### Перезапустите сервер:

```bash
# Остановите сервер (Ctrl+C)
# Запустите заново
npm run dev
```

---

## 🗑️ Полная очистка (если нужно):

```sql
-- 1. Удалить все данные
DELETE FROM auth_users;
DELETE FROM users;

-- 2. Сбросить sequences (если есть)
ALTER SEQUENCE IF EXISTS auth_users_id_seq RESTART WITH 1;

-- 3. Проверить
SELECT COUNT(*) FROM auth_users;
SELECT COUNT(*) FROM users;

-- 4. Проверить структуру
\d auth_users
```

---

## ✅ Чеклист:

- [ ] Очистил таблицу `auth_users`
- [ ] Проверил что таблица пустая
- [ ] Перезапустил сервер
- [ ] Попробовал зарегистрироваться
- [ ] Регистрация работает

---

## 📝 Рекомендация:

### Удалите старую таблицу `users`:

```sql
-- Если она не используется
DROP TABLE IF EXISTS users CASCADE;
```

### Используйте только `auth_users`:

Это избавит от путаницы и упростит код.

---

**Очистите `auth_users` и всё заработает!** 🚀
