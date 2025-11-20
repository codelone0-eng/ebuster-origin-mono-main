# Исправление доступа к таблице user_scripts

## Проблема
Ошибка `permission denied for table user_scripts` возникает из-за того, что RLS политики блокируют доступ для `service_role`.

## Решение

### Вариант 1: Выполнить SQL миграцию (рекомендуется)

Выполните SQL скрипт `migrations/FIX_USER_SCRIPTS_RLS.sql` в Supabase:

1. Откройте Supabase Dashboard → SQL Editor
2. Скопируйте содержимое `migrations/FIX_USER_SCRIPTS_RLS.sql`
3. Выполните скрипт

### Вариант 2: Быстрое исправление через SQL

Выполните в Supabase SQL Editor:

```sql
-- Добавляем политику для service_role
CREATE POLICY "Service role can manage user_scripts" ON user_scripts
    FOR ALL USING (true)
    WITH CHECK (true);

-- Даем права
GRANT ALL ON user_scripts TO service_role;
```

### Вариант 3: Временное отключение RLS (не рекомендуется для продакшена)

```sql
ALTER TABLE user_scripts DISABLE ROW LEVEL SECURITY;
```

## Проверка

После выполнения миграции проверьте:

```sql
-- Проверка политик
SELECT * FROM pg_policies WHERE tablename = 'user_scripts';

-- Проверка прав
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'user_scripts' AND grantee = 'service_role';
```

## После исправления

Перезапустите API контейнер:
```bash
docker compose restart api
```

Проверьте логи:
```bash
docker compose logs -f api
```

