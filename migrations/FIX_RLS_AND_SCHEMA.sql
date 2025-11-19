-- =====================================================
-- ИСПРАВЛЕНИЕ RLS ПОЛИТИК И СХЕМЫ
-- Решает проблемы с permission denied и missing columns
-- =====================================================

-- =====================================================
-- 1. ИСПРАВЛЕНИЕ ТАБЛИЦЫ user_bans (missing ban_date)
-- =====================================================

-- Проверяем и добавляем ban_date если его нет
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_bans' AND column_name = 'ban_date'
  ) THEN
    ALTER TABLE user_bans ADD COLUMN ban_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    COMMENT ON COLUMN user_bans.ban_date IS 'Дата создания бана';
  END IF;
END $$;

-- =====================================================
-- 2. ИСПРАВЛЕНИЕ FOREIGN KEY users -> roles
-- =====================================================

-- Проверяем существование role_id в users
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role_id'
  ) THEN
    -- Добавляем role_id если его нет
    ALTER TABLE users ADD COLUMN role_id UUID REFERENCES roles(id);
    CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
    
    -- Устанавливаем роль free для всех существующих пользователей
    UPDATE users 
    SET role_id = (SELECT id FROM roles WHERE name = 'free' LIMIT 1)
    WHERE role_id IS NULL;
  END IF;
END $$;

-- Создаём foreign key constraint если его нет
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_role_id_fkey' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_role_id_fkey 
    FOREIGN KEY (role_id) REFERENCES roles(id);
  END IF;
END $$;

-- =====================================================
-- 3. ДОБАВЛЕНИЕ BYPASS ПОЛИТИК ДЛЯ SERVICE ROLE
-- =====================================================

-- Roles: разрешаем service role полный доступ
DROP POLICY IF EXISTS "Service role can manage roles" ON roles;
CREATE POLICY "Service role can manage roles" ON roles
    FOR ALL 
    USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
    WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Script Categories: разрешаем service role полный доступ
DROP POLICY IF EXISTS "Service role can manage categories" ON script_categories;
CREATE POLICY "Service role can manage categories" ON script_categories
    FOR ALL 
    USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
    WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Referrals: разрешаем service role полный доступ
DROP POLICY IF EXISTS "Service role can manage referrals" ON referrals;
CREATE POLICY "Service role can manage referrals" ON referrals
    FOR ALL 
    USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
    WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- =====================================================
-- 4. ДОБАВЛЕНИЕ ПУБЛИЧНОГО ДОСТУПА К КАТЕГОРИЯМ
-- =====================================================

-- Все могут видеть активные категории
DROP POLICY IF EXISTS "Anyone can view active categories" ON script_categories;
CREATE POLICY "Anyone can view active categories" ON script_categories
    FOR SELECT USING (is_active = true);

-- =====================================================
-- 5. ДОБАВЛЕНИЕ ПУБЛИЧНОГО ДОСТУПА К РОЛЯМ
-- =====================================================

-- Обновляем политику для просмотра ролей (уже есть в SETUP_RLS_POLICIES.sql)
-- Проверяем что она существует
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'roles' 
    AND policyname = 'Anyone can view roles'
  ) THEN
    CREATE POLICY "Anyone can view roles" ON roles
      FOR SELECT USING (true);
  END IF;
END $$;

-- =====================================================
-- 6. ПРОВЕРКА ТАБЛИЦЫ user_scripts
-- =====================================================

-- Создаём таблицу user_scripts если её нет
CREATE TABLE IF NOT EXISTS user_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb,
    UNIQUE(user_id, script_id)
);

CREATE INDEX IF NOT EXISTS idx_user_scripts_user_id ON user_scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_scripts_script_id ON user_scripts(script_id);
CREATE INDEX IF NOT EXISTS idx_user_scripts_active ON user_scripts(is_active);

-- Включаем RLS если не включен
ALTER TABLE user_scripts ENABLE ROW LEVEL SECURITY;

-- Политики для user_scripts
DROP POLICY IF EXISTS "Users can view own scripts" ON user_scripts;
CREATE POLICY "Users can view own scripts" ON user_scripts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own scripts" ON user_scripts;
CREATE POLICY "Users can manage own scripts" ON user_scripts
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all user scripts" ON user_scripts;
CREATE POLICY "Admins can view all user scripts" ON user_scripts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Service role: разрешаем полный доступ (ВАЖНО: должно быть последним!)
DROP POLICY IF EXISTS "Service role can manage user_scripts" ON user_scripts;
CREATE POLICY "Service role can manage user_scripts" ON user_scripts
    FOR ALL 
    USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
    WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- =====================================================
-- ПРОВЕРКА РЕЗУЛЬТАТОВ
-- =====================================================

-- Проверяем RLS статус всех таблиц
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('roles', 'script_categories', 'referrals', 'user_scripts', 'user_bans', 'users')
ORDER BY tablename;

-- Проверяем политики
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('roles', 'script_categories', 'referrals', 'user_scripts')
ORDER BY tablename, policyname;

-- Проверяем foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('users', 'user_bans')
ORDER BY tc.table_name;

-- Проверяем колонки user_bans
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_bans'
ORDER BY ordinal_position;

COMMENT ON TABLE user_scripts IS 'Установленные пользователями скрипты';
COMMENT ON COLUMN user_bans.ban_date IS 'Дата создания бана';
