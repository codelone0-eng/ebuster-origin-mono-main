-- ============================================
-- ПОЛНАЯ ВЫГРУЗКА ВСЕЙ БАЗЫ ДАННЫХ
-- Скопируйте ВСЕ результаты и отправьте мне
-- ============================================

-- ========================================
-- ЧАСТЬ 1: СПИСОК ВСЕХ ТАБЛИЦ
-- ========================================
SELECT 
  '=== ALL TABLES ===' as section,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name) as column_count
FROM information_schema.tables tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;


-- ========================================
-- ЧАСТЬ 2: СТРУКТУРА КАЖДОЙ ТАБЛИЦЫ
-- ========================================





-- ========================================
-- ЧАСТЬ 3: ВСЕ FOREIGN KEYS
-- ========================================





-- ========================================
-- ЧАСТЬ 4: ВСЕ ИНДЕКСЫ
-- ========================================
SELECT 
  '=== ALL INDEXES ===' as section,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;


-- ========================================
-- ЧАСТЬ 5: ДАННЫЕ ИЗ КЛЮЧЕВЫХ ТАБЛИЦ
-- ========================================

-- Данные из roles
SELECT 
  '=== DATA: roles ===' as section,
  id, name, display_name, price_monthly, price_yearly, 
  is_subscription, is_active, display_order,
  features::text as features_json,
  limits::text as limits_json
FROM roles
ORDER BY display_order;

-- Данные из auth_users (первые 10, без паролей)
SELECT 
  '=== DATA: auth_users (sample) ===' as section,
  id, email, full_name, role, role_id, status, 
  email_confirmed, created_at
FROM auth_users
ORDER BY created_at
LIMIT 10;

-- Данные из subscriptions
SELECT 
  '=== DATA: subscriptions ===' as section,
  s.id,
  s.user_id,
  u.email as user_email,
  s.role_id,
  r.name as role_name,
  s.status,
  s.start_date,
  s.end_date,
  s.auto_renew
FROM subscriptions s
LEFT JOIN auth_users u ON u.id = s.user_id
LEFT JOIN roles r ON r.id = s.role_id
ORDER BY s.created_at;

-- Данные из scripts (первые 5)
SELECT 
  '=== DATA: scripts (sample) ===' as section,
  id, title, author_id, category_id, status, 
  downloads, rating, created_at
FROM scripts
ORDER BY created_at DESC
LIMIT 5;


-- ========================================
-- ЧАСТЬ 6: СТАТИСТИКА
-- ========================================

-- Количество записей в каждой таблице
SELECT '=== TABLE COUNTS ===' as section, 'auth_users' as table_name, COUNT(*) as count FROM auth_users
UNION ALL SELECT '=== TABLE COUNTS ===', 'roles', COUNT(*) FROM roles
UNION ALL SELECT '=== TABLE COUNTS ===', 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL SELECT '=== TABLE COUNTS ===', 'scripts', COUNT(*) FROM scripts
UNION ALL SELECT '=== TABLE COUNTS ===', 'script_categories', COUNT(*) FROM script_categories
UNION ALL SELECT '=== TABLE COUNTS ===', 'script_downloads', COUNT(*) FROM script_downloads
UNION ALL SELECT '=== TABLE COUNTS ===', 'script_ratings', COUNT(*) FROM script_ratings
UNION ALL SELECT '=== TABLE COUNTS ===', 'script_versions', COUNT(*) FROM script_versions
UNION ALL SELECT '=== TABLE COUNTS ===', 'support_tickets', COUNT(*) FROM support_tickets
UNION ALL SELECT '=== TABLE COUNTS ===', 'ticket_comments', COUNT(*) FROM ticket_comments
UNION ALL SELECT '=== TABLE COUNTS ===', 'ticket_messages', COUNT(*) FROM ticket_messages
UNION ALL SELECT '=== TABLE COUNTS ===', 'ticket_attachments', COUNT(*) FROM ticket_attachments
UNION ALL SELECT '=== TABLE COUNTS ===', 'user_bans', COUNT(*) FROM user_bans
UNION ALL SELECT '=== TABLE COUNTS ===', 'user_scripts', COUNT(*) FROM user_scripts
UNION ALL SELECT '=== TABLE COUNTS ===', 'user_script_updates', COUNT(*) FROM user_script_updates
UNION ALL SELECT '=== TABLE COUNTS ===', 'user_autoupdate_settings', COUNT(*) FROM user_autoupdate_settings
UNION ALL SELECT '=== TABLE COUNTS ===', 'referral_codes', COUNT(*) FROM referral_codes
UNION ALL SELECT '=== TABLE COUNTS ===', 'referral_history', COUNT(*) FROM referral_history
UNION ALL SELECT '=== TABLE COUNTS ===', 'referral_rewards', COUNT(*) FROM referral_rewards
UNION ALL SELECT '=== TABLE COUNTS ===', 'referral_stats', COUNT(*) FROM referral_stats
UNION ALL SELECT '=== TABLE COUNTS ===', 'referral_uses', COUNT(*) FROM referral_uses
ORDER BY table_name;


-- ========================================
-- ЧАСТЬ 7: ПРОБЛЕМНЫЕ МЕСТА
-- ========================================

-- Пользователи без role_id
SELECT 
  '=== USERS WITHOUT role_id ===' as section,
  id, email, role as old_role, role_id
FROM auth_users
WHERE role_id IS NULL;

-- Пользователи с битыми ссылками на роли
SELECT 
  '=== USERS WITH BROKEN role_id ===' as section,
  u.id, u.email, u.role_id
FROM auth_users u
WHERE u.role_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM roles r WHERE r.id = u.role_id);

-- Подписки с битыми ссылками
SELECT 
  '=== SUBSCRIPTIONS WITH BROKEN LINKS ===' as section,
  s.id, s.user_id, s.role_id,
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM auth_users WHERE id = s.user_id) THEN 'Broken user_id'
    WHEN NOT EXISTS (SELECT 1 FROM roles WHERE id = s.role_id) THEN 'Broken role_id'
    ELSE 'OK'
  END as issue
FROM subscriptions s
WHERE NOT EXISTS (SELECT 1 FROM auth_users WHERE id = s.user_id)
   OR NOT EXISTS (SELECT 1 FROM roles WHERE id = s.role_id);


-- ========================================
-- ЧАСТЬ 8: ПРОВЕРКА UNRESTRICTED ТАБЛИЦ
-- ========================================

-- Проверяем RLS на roles
SELECT 
  '=== RLS CHECK: roles ===' as section,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'roles' AND schemaname = 'public';

-- Проверяем RLS на subscriptions
SELECT 
  '=== RLS CHECK: subscriptions ===' as section,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'subscriptions' AND schemaname = 'public';

-- Проверяем RLS на script_versions
SELECT 
  '=== RLS CHECK: script_versions ===' as section,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'script_versions' AND schemaname = 'public';

-- Проверяем RLS на ticket_messages
SELECT 
  '=== RLS CHECK: ticket_messages ===' as section,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'ticket_messages' AND schemaname = 'public';

-- Проверяем RLS на user_autoupdate_settings
SELECT 
  '=== RLS CHECK: user_autoupdate_settings ===' as section,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'user_autoupdate_settings' AND schemaname = 'public';

-- Проверяем RLS на user_script_updates
SELECT 
  '=== RLS CHECK: user_script_updates ===' as section,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'user_script_updates' AND schemaname = 'public';
