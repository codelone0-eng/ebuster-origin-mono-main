-- ============================================
-- ПОЛНАЯ ВЫГРУЗКА СТРУКТУРЫ БАЗЫ ДАННЫХ
-- Скопируйте результаты и отправьте мне
-- ============================================

-- 1. Список всех таблиц
SELECT 
  '=== TABLES ===' as section,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Структура таблицы auth_users
SELECT 
  '=== auth_users STRUCTURE ===' as section,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'auth_users'
ORDER BY ordinal_position;

-- 3. Структура таблицы roles
SELECT 
  '=== roles STRUCTURE ===' as section,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'roles'
ORDER BY ordinal_position;

-- 4. Структура таблицы subscriptions
SELECT 
  '=== subscriptions STRUCTURE ===' as section,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- 5. Данные из roles
SELECT 
  '=== roles DATA ===' as section,
  id,
  name,
  display_name,
  price_monthly,
  price_yearly,
  is_subscription,
  is_active,
  display_order,
  features,
  limits
FROM roles
ORDER BY display_order;

-- 6. Данные из auth_users (без паролей)
SELECT 
  '=== auth_users DATA ===' as section,
  id,
  email,
  full_name,
  role,
  role_id,
  status,
  created_at
FROM auth_users
ORDER BY created_at;

-- 7. Данные из subscriptions
SELECT 
  '=== subscriptions DATA ===' as section,
  id,
  user_id,
  role_id,
  status,
  start_date,
  end_date,
  auto_renew
FROM subscriptions
ORDER BY created_at;

-- 8. Foreign keys на auth_users
SELECT 
  '=== auth_users FOREIGN KEYS ===' as section,
  constraint_name,
  column_name,
  foreign_table_name,
  foreign_column_name
FROM information_schema.key_column_usage kcu
JOIN information_schema.table_constraints tc 
  ON kcu.constraint_name = tc.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE kcu.table_name = 'auth_users' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- 9. Foreign keys на subscriptions
SELECT 
  '=== subscriptions FOREIGN KEYS ===' as section,
  constraint_name,
  column_name,
  foreign_table_name,
  foreign_column_name
FROM information_schema.key_column_usage kcu
JOIN information_schema.table_constraints tc 
  ON kcu.constraint_name = tc.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE kcu.table_name = 'subscriptions' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- 10. Индексы на roles
SELECT 
  '=== roles INDEXES ===' as section,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'roles';

-- 11. Индексы на auth_users
SELECT 
  '=== auth_users INDEXES ===' as section,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'auth_users';

-- 12. Индексы на subscriptions
SELECT 
  '=== subscriptions INDEXES ===' as section,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'subscriptions';

-- 13. Проверка связей пользователей с ролями
SELECT 
  '=== USER-ROLE LINKS ===' as section,
  u.email,
  u.role as old_text_role,
  u.role_id,
  r.name as role_name,
  r.display_name,
  CASE 
    WHEN u.role_id IS NULL THEN '❌ NO role_id'
    WHEN r.id IS NULL THEN '❌ BROKEN link'
    ELSE '✅ OK'
  END as status
FROM auth_users u
LEFT JOIN roles r ON r.id = u.role_id
ORDER BY u.created_at;
