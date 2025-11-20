-- =====================================================
-- ИСПРАВЛЕНИЕ RLS ДЛЯ USER_SCRIPTS
-- Разрешаем service_role доступ к таблице
-- =====================================================

-- Удаляем старые политики если есть
DROP POLICY IF EXISTS "Users can view own installed scripts" ON user_scripts;
DROP POLICY IF EXISTS "Users can install scripts" ON user_scripts;
DROP POLICY IF EXISTS "Users can uninstall own scripts" ON user_scripts;
DROP POLICY IF EXISTS "Admins can view all installed scripts" ON user_scripts;
DROP POLICY IF EXISTS "Service role can manage user_scripts" ON user_scripts;

-- Включаем RLS
ALTER TABLE user_scripts ENABLE ROW LEVEL SECURITY;

-- Политика для service_role (обход RLS)
CREATE POLICY "Service role can manage user_scripts" ON user_scripts
    FOR ALL USING (true)
    WITH CHECK (true);

-- Пользователи видят только свои установленные скрипты
CREATE POLICY "Users can view own installed scripts" ON user_scripts
    FOR SELECT USING (auth.uid() = user_id);

-- Пользователи могут устанавливать скрипты
CREATE POLICY "Users can install scripts" ON user_scripts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Пользователи могут удалять свои установленные скрипты
CREATE POLICY "Users can uninstall own scripts" ON user_scripts
    FOR DELETE USING (auth.uid() = user_id);

-- Админы видят все
CREATE POLICY "Admins can view all installed scripts" ON user_scripts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Даем права service_role
GRANT ALL ON user_scripts TO service_role;

