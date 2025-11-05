-- ============================================
-- ПОЛНОЕ ИСПРАВЛЕНИЕ ВСЕХ ПРОБЛЕМ БД
-- Выполнять по частям!
-- ============================================

-- ========================================
-- ЧАСТЬ 0: Исправление CHECK constraint на role
-- ========================================

-- Удаляем старый constraint который блокирует новые роли
ALTER TABLE auth_users DROP CONSTRAINT IF EXISTS auth_users_role_check;

-- Создаем новый constraint с учетом всех ролей
ALTER TABLE auth_users 
ADD CONSTRAINT auth_users_role_check 
CHECK (role IN ('user', 'admin', 'moderator', 'developer', 'free', 'pro', 'premium'));

-- Проверка
SELECT 'Constraint fixed' as status;


-- ========================================
-- ЧАСТЬ 1: Исправление subscriptions
-- ========================================

-- Добавляем недостающие поля
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan VARCHAR(50);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

-- Комментарии
COMMENT ON COLUMN subscriptions.amount IS 'Сумма платежа в рублях';
COMMENT ON COLUMN subscriptions.plan IS 'Название плана (дубликат role.name)';
COMMENT ON COLUMN subscriptions.features IS 'Возможности (дубликат role.features)';

-- Проверка
SELECT 'subscriptions fixed:' as status, column_name 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
AND column_name IN ('amount', 'plan', 'features');


-- ========================================
-- ЧАСТЬ 2: Исправление scripts.category
-- ========================================

-- Добавляем новое поле category_id
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS category_id UUID;

-- Создаем индекс
CREATE INDEX IF NOT EXISTS idx_scripts_category_id ON scripts(category_id);

-- Мигрируем данные из category в category_id
-- Если category содержит UUID
UPDATE scripts 
SET category_id = (
  SELECT id FROM script_categories 
  WHERE script_categories.name = scripts.category 
  OR script_categories.slug = scripts.category
  LIMIT 1
)
WHERE category IS NOT NULL AND category_id IS NULL;

-- Добавляем FK
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_scripts_category_id'
  ) THEN
    ALTER TABLE scripts 
    ADD CONSTRAINT fk_scripts_category_id 
    FOREIGN KEY (category_id) REFERENCES script_categories(id);
  END IF;
END $$;

-- Проверка
SELECT 
  'scripts category migration:' as status,
  COUNT(*) FILTER (WHERE category_id IS NOT NULL) as migrated,
  COUNT(*) FILTER (WHERE category_id IS NULL) as not_migrated
FROM scripts;


-- ========================================
-- ЧАСТЬ 3: Исправление user_scripts FK
-- ========================================

-- Добавляем FK на user_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_user_scripts_user_id'
  ) THEN
    ALTER TABLE user_scripts 
    ADD CONSTRAINT fk_user_scripts_user_id 
    FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Проверка
SELECT 
  'user_scripts FK:' as status,
  constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'user_scripts' AND constraint_type = 'FOREIGN KEY';


-- ========================================
-- ЧАСТЬ 4: Очистка auth_users (опционально)
-- ========================================

-- Можно оставить поле role для обратной совместимости
-- Или синхронизировать его с role_id

-- Синхронизация role с role_id
UPDATE auth_users u
SET role = r.name
FROM roles r
WHERE r.id = u.role_id AND u.role != r.name;

-- Проверка
SELECT 
  'auth_users role sync:' as status,
  email,
  role as old_text_role,
  r.name as new_role_from_id
FROM auth_users u
LEFT JOIN roles r ON r.id = u.role_id;


-- ========================================
-- ЧАСТЬ 5: Включение RLS
-- ========================================

-- Включаем RLS на roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Политика: все могут читать активные роли
DROP POLICY IF EXISTS "Anyone can view active roles" ON roles;
CREATE POLICY "Anyone can view active roles" ON roles
  FOR SELECT USING (is_active = true);

-- Политика: админы могут все
DROP POLICY IF EXISTS "Admins can do everything on roles" ON roles;
CREATE POLICY "Admins can do everything on roles" ON roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth_users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Включаем RLS на subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи видят только свои подписки
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Политика: админы могут все
DROP POLICY IF EXISTS "Admins can do everything on subscriptions" ON subscriptions;
CREATE POLICY "Admins can do everything on subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth_users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Проверка RLS
SELECT 
  'RLS status:' as info,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('roles', 'subscriptions')
AND schemaname = 'public';


-- ========================================
-- ЧАСТЬ 6: Финальная проверка
-- ========================================

-- Проверка subscriptions
SELECT 
  '=== SUBSCRIPTIONS STRUCTURE ===' as section,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Проверка scripts
SELECT 
  '=== SCRIPTS CATEGORY ===' as section,
  id,
  title,
  category as old_category,
  category_id as new_category_id,
  (SELECT name FROM script_categories WHERE id = scripts.category_id) as category_name
FROM scripts;

-- Проверка всех FK
SELECT 
  '=== ALL FOREIGN KEYS ===' as section,
  table_name,
  constraint_name,
  column_name
FROM information_schema.key_column_usage
WHERE constraint_name LIKE 'fk_%'
AND table_schema = 'public'
ORDER BY table_name, column_name;

-- Проверка пользователей
SELECT 
  '=== USERS WITH ROLES ===' as section,
  u.email,
  u.role as text_role,
  r.name as role_from_id,
  r.display_name,
  CASE 
    WHEN u.role = r.name THEN '✅ Synced'
    ELSE '⚠️ Not synced'
  END as sync_status
FROM auth_users u
LEFT JOIN roles r ON r.id = u.role_id;
