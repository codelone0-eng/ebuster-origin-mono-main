-- =====================================================
-- EBUSTER - НАСТРОЙКА RLS ПОЛИТИК
-- Row Level Security для всех таблиц
-- =====================================================

-- =====================================================
-- 1. ВКЛЮЧЕНИЕ RLS
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE script_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. ПОЛИТИКИ ДЛЯ USERS
-- =====================================================

-- Пользователи могут видеть свой профиль
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Пользователи могут обновлять свой профиль
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Админы могут видеть всех пользователей
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Админы могут обновлять любых пользователей
CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Публичная регистрация (INSERT без авторизации)
CREATE POLICY "Anyone can register" ON users
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 3. ПОЛИТИКИ ДЛЯ SCRIPTS
-- =====================================================

-- Все могут видеть публичные скрипты
CREATE POLICY "Anyone can view public scripts" ON scripts
    FOR SELECT USING (is_public = true AND status = 'active');

-- Авторы могут видеть свои скрипты (даже приватные)
CREATE POLICY "Authors can view own scripts" ON scripts
    FOR SELECT USING (auth.uid() = author_id);

-- Авторизованные пользователи могут создавать скрипты
CREATE POLICY "Authenticated users can create scripts" ON scripts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Авторы могут обновлять свои скрипты
CREATE POLICY "Authors can update own scripts" ON scripts
    FOR UPDATE USING (auth.uid() = author_id);

-- Авторы могут удалять свои скрипты
CREATE POLICY "Authors can delete own scripts" ON scripts
    FOR DELETE USING (auth.uid() = author_id);

-- Админы могут делать всё со скриптами
CREATE POLICY "Admins can manage all scripts" ON scripts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- 4. ПОЛИТИКИ ДЛЯ SCRIPT_VERSIONS
-- =====================================================

-- Все могут видеть версии публичных скриптов
CREATE POLICY "Anyone can view public script versions" ON script_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM scripts
            WHERE id = script_id AND is_public = true
        )
    );

-- Авторы могут видеть версии своих скриптов
CREATE POLICY "Authors can view own script versions" ON script_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM scripts
            WHERE id = script_id AND author_id = auth.uid()
        )
    );

-- Авторы могут создавать версии своих скриптов
CREATE POLICY "Authors can create own script versions" ON script_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM scripts
            WHERE id = script_id AND author_id = auth.uid()
        )
    );

-- =====================================================
-- 5. ПОЛИТИКИ ДЛЯ TICKETS
-- =====================================================

-- Пользователи видят только свои тикеты
CREATE POLICY "Users can view own tickets" ON tickets
    FOR SELECT USING (auth.uid() = user_id);

-- Админы видят все тикеты
CREATE POLICY "Admins can view all tickets" ON tickets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Авторизованные пользователи могут создавать тикеты
CREATE POLICY "Authenticated users can create tickets" ON tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свои тикеты
CREATE POLICY "Users can update own tickets" ON tickets
    FOR UPDATE USING (auth.uid() = user_id);

-- Админы могут обновлять любые тикеты
CREATE POLICY "Admins can update all tickets" ON tickets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- 6. ПОЛИТИКИ ДЛЯ TICKET_MESSAGES
-- =====================================================

-- Пользователи видят сообщения своих тикетов
CREATE POLICY "Users can view messages on own tickets" ON ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tickets
            WHERE id = ticket_id AND user_id = auth.uid()
        )
    );

-- Админы видят все сообщения
CREATE POLICY "Admins can view all messages" ON ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Пользователи могут создавать сообщения в своих тикетах
CREATE POLICY "Users can create messages on own tickets" ON ticket_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tickets
            WHERE id = ticket_id AND user_id = auth.uid()
        )
    );

-- Админы могут создавать сообщения в любых тикетах
CREATE POLICY "Admins can create messages in all tickets" ON ticket_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- 7. ПОЛИТИКИ ДЛЯ API_KEYS
-- =====================================================

-- Пользователи видят только свои API ключи
CREATE POLICY "Users can view own API keys" ON api_keys
    FOR SELECT USING (auth.uid() = user_id);

-- Пользователи могут создавать свои API ключи
CREATE POLICY "Users can create own API keys" ON api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свои API ключи
CREATE POLICY "Users can update own API keys" ON api_keys
    FOR UPDATE USING (auth.uid() = user_id);

-- Пользователи могут удалять свои API ключи
CREATE POLICY "Users can delete own API keys" ON api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- Админы могут управлять всеми API ключами
CREATE POLICY "Admins can manage all API keys" ON api_keys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- 8. ПОЛИТИКИ ДЛЯ SUBSCRIPTIONS
-- =====================================================

-- Пользователи видят только свои подписки
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Пользователи могут создавать свои подписки
CREATE POLICY "Users can create own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свои подписки
CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Админы могут управлять всеми подписками
CREATE POLICY "Admins can manage all subscriptions" ON subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- 9. ПОЛИТИКИ ДЛЯ LOGIN_HISTORY
-- =====================================================

-- Пользователи видят только свою историю входов
CREATE POLICY "Users can view own login history" ON login_history
    FOR SELECT USING (auth.uid() = user_id);

-- Система может создавать записи истории входов
CREATE POLICY "System can create login history" ON login_history
    FOR INSERT WITH CHECK (true);

-- Админы видят всю историю входов
CREATE POLICY "Admins can view all login history" ON login_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- 10. ПОЛИТИКИ ДЛЯ USER_BANS
-- =====================================================

-- Пользователи видят свои баны
CREATE POLICY "Users can view own bans" ON user_bans
    FOR SELECT USING (auth.uid() = user_id);

-- Только админы могут создавать баны
CREATE POLICY "Admins can create bans" ON user_bans
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Только админы могут обновлять баны
CREATE POLICY "Admins can update bans" ON user_bans
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Админы видят все баны
CREATE POLICY "Admins can view all bans" ON user_bans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- ПОЛИТИКИ НАСТРОЕНЫ
-- =====================================================

-- Проверка включения RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'scripts', 'script_versions', 'tickets', 'ticket_messages', 'api_keys', 'subscriptions', 'login_history', 'user_bans')
ORDER BY tablename;
