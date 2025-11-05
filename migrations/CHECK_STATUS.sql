-- ============================================
-- ПРОВЕРКА ТЕКУЩЕГО СОСТОЯНИЯ БАЗЫ ДАННЫХ
-- Выполните этот запрос чтобы понять что уже создано
-- ============================================

-- 1. Проверка существования таблицы roles
SELECT 
  'Table roles exists' as status,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'roles'
  ) THEN 'YES ✅' ELSE 'NO ❌' END as result;

-- 2. Проверка количества ролей
SELECT 
  'Roles count' as status,
  COUNT(*)::text || ' roles' as result
FROM roles;

-- 3. Список ролей
SELECT 
  'Available roles:' as info,
  name,
  display_name,
  is_subscription
FROM roles
ORDER BY display_order;

-- 4. Проверка существования поля role_id в auth_users
SELECT 
  'Column role_id in auth_users' as status,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'auth_users' AND column_name = 'role_id'
  ) THEN 'YES ✅' ELSE 'NO ❌' END as result;

-- 5. Проверка пользователей с role_id
SELECT 
  'Users with role_id' as status,
  COUNT(*)::text || ' users' as result
FROM auth_users
WHERE role_id IS NOT NULL;

-- 6. Проверка пользователей БЕЗ role_id
SELECT 
  'Users WITHOUT role_id' as status,
  COUNT(*)::text || ' users' as result
FROM auth_users
WHERE role_id IS NULL;

-- 7. Детальная информация по пользователям
SELECT 
  email,
  role as old_text_role,
  role_id,
  CASE 
    WHEN role_id IS NOT NULL THEN '✅ Has role_id'
    ELSE '❌ Missing role_id'
  END as status
FROM auth_users
ORDER BY created_at;

-- 8. Проверка существования таблицы subscriptions
SELECT 
  'Table subscriptions exists' as status,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'subscriptions'
  ) THEN 'YES ✅' ELSE 'NO ❌' END as result;

-- 9. Проверка foreign keys
SELECT 
  'Foreign keys on auth_users' as info,
  constraint_name,
  table_name,
  column_name
FROM information_schema.key_column_usage
WHERE table_name = 'auth_users' AND constraint_name LIKE 'fk_%';

-- 10. Проверка foreign keys на subscriptions
SELECT 
  'Foreign keys on subscriptions' as info,
  constraint_name,
  table_name,
  column_name
FROM information_schema.key_column_usage
WHERE table_name = 'subscriptions' AND constraint_name LIKE 'fk_%';
