-- ============================================
-- ИСПРАВЛЕНИЕ FOREIGN KEYS для Supabase
-- Supabase требует специфичные имена FK для работы с embed
-- ============================================

-- ========================================
-- 1. Исправление subscriptions FK
-- ========================================

-- Удаляем старые FK если есть
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS fk_subscriptions_user_id;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS fk_subscriptions_role_id;

-- Создаем FK с правильными именами для Supabase
ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE;

ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_role_id_fkey 
FOREIGN KEY (role_id) REFERENCES roles(id);

-- Проверка
SELECT 
  'subscriptions FK:' as info,
  constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'subscriptions' AND constraint_type = 'FOREIGN KEY';


-- ========================================
-- 2. Исправление support_tickets FK (неоднозначность)
-- ========================================

-- Проблема: две связи с auth_users (user_id и assigned_to)
-- Решение: использовать алиасы в запросах

-- FK уже правильные, проверяем:
SELECT 
  'support_tickets FK:' as info,
  constraint_name,
  column_name
FROM information_schema.key_column_usage
WHERE table_name = 'support_tickets' 
AND constraint_name LIKE '%fkey';


-- ========================================
-- 3. Проверка всех FK
-- ========================================

SELECT 
  '=== ALL FK STATUS ===' as section,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  tc.constraint_name,
  CASE 
    WHEN tc.constraint_name LIKE '%_fkey' THEN '✅ Supabase compatible'
    ELSE '⚠️ May cause issues'
  END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
