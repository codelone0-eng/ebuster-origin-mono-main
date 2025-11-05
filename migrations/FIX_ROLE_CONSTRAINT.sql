-- ============================================
-- ИСПРАВЛЕНИЕ CHECK CONSTRAINT на auth_users.role
-- ============================================

-- Проверяем какой constraint существует
SELECT 
  'Current constraint:' as info,
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'auth_users'::regclass
AND conname LIKE '%role%';

-- Удаляем старый constraint
ALTER TABLE auth_users DROP CONSTRAINT IF EXISTS auth_users_role_check;

-- Создаем новый constraint с учетом новых ролей
ALTER TABLE auth_users 
ADD CONSTRAINT auth_users_role_check 
CHECK (role IN ('user', 'admin', 'moderator', 'developer', 'free', 'pro', 'premium'));

-- Проверка
SELECT 
  'New constraint:' as info,
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'auth_users'::regclass
AND conname = 'auth_users_role_check';

-- Теперь можно синхронизировать role с role_id
UPDATE auth_users u
SET role = r.name
FROM roles r
WHERE r.id = u.role_id;

-- Проверка результата
SELECT 
  'Users after sync:' as info,
  email,
  role,
  r.name as role_from_id
FROM auth_users u
LEFT JOIN roles r ON r.id = u.role_id;
