# 🚀 СРОЧНЫЙ ДЕПЛОЙ - Создание таблицы roles

## ❗ ПРОБЛЕМА
```
Error: Could not find the table 'public.roles' in the schema cache
ERROR: relation "roles" does not exist
```

Таблица `roles` не существует в базе данных!

---

## ✅ РЕШЕНИЕ - Выполнить миграцию 001

### Шаг 1: Открыть Supabase SQL Editor

1. Перейти на https://supabase.com/dashboard
2. Выбрать проект ebuster
3. Открыть **SQL Editor** в левом меню

### Шаг 2: Выполнить миграцию 001_create_roles_table.sql

**Скопировать и выполнить весь файл:**
`migrations/001_create_roles_table.sql`

Эта миграция создаст:
- ✅ Таблицу `roles` со всеми полями
- ✅ Таблицу `subscriptions`
- ✅ Базовые роли: free, pro, premium, admin
- ✅ Поле `role_id` в таблице `auth_users`
- ✅ Индексы и триггеры
- ✅ Row Level Security политики

### Шаг 3: Назначить себе роль admin

```sql
-- Найти свой user_id
SELECT id, email, role_id FROM auth_users WHERE email = 'ваш@email.com';

-- Назначить роль admin
UPDATE auth_users 
SET role_id = (SELECT id FROM roles WHERE name = 'admin')
WHERE email = 'ваш@email.com';

-- Проверить
SELECT 
  u.email, 
  r.name as role_name,
  r.display_name
FROM auth_users u
LEFT JOIN roles r ON r.id = u.role_id
WHERE u.email = 'ваш@email.com';
```

### Шаг 4: Проверить созданные роли

```sql
SELECT 
  name,
  display_name,
  price_monthly,
  price_yearly,
  is_subscription,
  is_active,
  display_order
FROM roles
ORDER BY display_order;
```

Должно вернуть:
```
name    | display_name  | price_monthly | price_yearly | is_subscription | is_active | display_order
--------|---------------|---------------|--------------|-----------------|-----------|---------------
free    | Free          | 0             | 0            | false           | true      | 0
pro     | Pro           | 999           | 9990         | true            | true      | 1
premium | Premium       | 2999          | 29990        | true            | true      | 2
admin   | Администратор | 0             | 0            | false           | true      | 999
```

### Шаг 5: Перезапустить API (НЕ НУЖНО пересобирать!)

```bash
# На сервере
docker compose restart api

# Проверить логи
docker compose logs api -f
```

### Шаг 6: Проверить работу

1. Открыть https://ebuster.ru/admin
2. Перейти на вкладку **"Роли"**
3. Должны отобразиться все 4 роли
4. Попробовать создать новую роль
5. Попробовать редактировать существующую

---

## 📊 Что создаст миграция:

### Таблица roles:
```sql
id              UUID PRIMARY KEY
name            VARCHAR(50) UNIQUE NOT NULL
display_name    VARCHAR(100) NOT NULL
description     TEXT
price_monthly   DECIMAL(10, 2)
price_yearly    DECIMAL(10, 2)
features        JSONB
limits          JSONB
is_active       BOOLEAN
is_subscription BOOLEAN  ← НОВОЕ ПОЛЕ!
display_order   INTEGER
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Таблица subscriptions:
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth_users(id)
role_id         UUID REFERENCES roles(id)
status          VARCHAR(20)
start_date      TIMESTAMP
end_date        TIMESTAMP
payment_method  VARCHAR(50)
transaction_id  VARCHAR(255)
auto_renew      BOOLEAN
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Базовые роли:

#### 1. Free (бесплатная)
- Скрипты: 5
- Загрузки в день: 10
- API: нет
- is_subscription: **false**

#### 2. Pro (подписка)
- Скрипты: 50
- Загрузки в день: 100
- API: да (1000 req)
- Цена: 999₽/мес, 9990₽/год
- is_subscription: **true**

#### 3. Premium (подписка)
- Скрипты: неограниченно
- Загрузки: неограниченно
- API: да (10000 req)
- Приоритетная поддержка
- Цена: 2999₽/мес, 29990₽/год
- is_subscription: **true**

#### 4. Admin (роль доступа)
- Полный доступ ко всему
- is_subscription: **false**

---

## 🔧 Troubleshooting:

### Ошибка: "permission denied for table roles"

**Решение:** Проверить RLS политики
```sql
-- Временно отключить RLS для теста
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- Проверить
SELECT * FROM roles;

-- Включить обратно
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
```

### Ошибка: "role_id does not exist in auth_users"

**Решение:** Выполнить часть миграции для auth_users
```sql
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);
CREATE INDEX IF NOT EXISTS idx_auth_users_role_id ON auth_users(role_id);

-- Установить free для всех
UPDATE auth_users 
SET role_id = (SELECT id FROM roles WHERE name = 'free' LIMIT 1)
WHERE role_id IS NULL;
```

### API все еще возвращает 500

**Решение:** Проверить что таблица создана
```sql
-- Проверить существование таблицы
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('roles', 'subscriptions');

-- Проверить данные
SELECT COUNT(*) FROM roles;
SELECT COUNT(*) FROM subscriptions;
```

---

## ✅ Чеклист выполнения:

- [ ] Открыт Supabase SQL Editor
- [ ] Выполнена миграция 001_create_roles_table.sql
- [ ] Проверено создание 4 ролей (free, pro, premium, admin)
- [ ] Назначена роль admin себе
- [ ] Перезапущен API (docker compose restart api)
- [ ] Открыта админка https://ebuster.ru/admin
- [ ] Вкладка "Роли" отображает все роли
- [ ] Можно создать новую роль
- [ ] Можно редактировать роль
- [ ] Отображается бейдж "Подписка" для pro и premium

---

## 🎉 После выполнения:

1. ✅ Таблица roles создана
2. ✅ Базовые роли добавлены
3. ✅ Поле is_subscription работает
4. ✅ API возвращает роли
5. ✅ Админка отображает роли
6. ✅ Можно создавать/редактировать роли
7. ✅ Система подписок полностью функциональна

---

## 📝 Примечания:

- Миграция **идемпотентная** - можно выполнять несколько раз
- Использует `IF NOT EXISTS` и `ON CONFLICT DO NOTHING`
- Безопасно для существующих данных
- Автоматически устанавливает free роль всем пользователям без роли

---

## 🚀 ВЫПОЛНИТЕ СЕЙЧАС!

1. Откройте Supabase SQL Editor
2. Скопируйте весь файл `migrations/001_create_roles_table.sql`
3. Нажмите **Run**
4. Назначьте себе роль admin
5. Перезапустите API
6. Готово! 🎉
