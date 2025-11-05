-- ============================================
-- БЫСТРАЯ ПРОВЕРКА - Выполните и отправьте результат
-- ============================================

-- Проверка 1: Какие таблицы существуют
SELECT 'Tables:' as info, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Проверка 2: Колонки в subscriptions
SELECT 'subscriptions columns:' as info, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Проверка 3: Есть ли колонка amount в subscriptions?
SELECT 
  'Has amount column?' as question,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'amount'
  ) THEN 'YES ✅' ELSE 'NO ❌' END as answer;

-- Проверка 4: Данные из roles
SELECT 'Roles:' as info, name, display_name, is_subscription, is_active
FROM roles
ORDER BY display_order;

-- Проверка 5: Пользователи и их роли
SELECT 
  'Users:' as info,
  email,
  role as old_role,
  r.name as new_role
FROM auth_users u
LEFT JOIN roles r ON r.id = u.role_id
ORDER BY u.created_at;
