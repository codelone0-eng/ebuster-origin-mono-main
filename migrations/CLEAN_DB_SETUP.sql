-- =====================================================
-- EBUSTER - ЧИСТАЯ УСТАНОВКА БД
-- Создание всех таблиц с нуля
-- =====================================================

-- =====================================================
-- 1. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Основная информация
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    
    -- Статус и роль
    status VARCHAR(50) DEFAULT 'active',
    role VARCHAR(50) DEFAULT 'user',
    role_id UUID,
    email_confirmed BOOLEAN DEFAULT false,
    
    -- Баны (дублирование для совместимости)
    is_banned BOOLEAN DEFAULT false,
    ban_reason TEXT,
    ban_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Подписка (дублирование для совместимости)
    subscription_type VARCHAR(50) DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    subscription_id UUID,
    
    -- 2FA
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret TEXT,
    two_factor_secret_temp TEXT,
    two_factor_backup_codes TEXT[],
    
    -- Активность
    last_active TIMESTAMP WITH TIME ZONE,
    browser VARCHAR(255),
    location VARCHAR(255),
    downloads INTEGER DEFAULT 0,
    scripts INTEGER DEFAULT 0,
    
    -- Реферальная система
    referral_code VARCHAR(50) UNIQUE,
    referred_by UUID REFERENCES users(id),
    referral_earnings DECIMAL(10,2) DEFAULT 0,
    
    -- Токены
    token_version BIGINT DEFAULT 0,
    
    -- Временные поля для восстановления/подтверждения
    reset_token TEXT,
    reset_token_expiry TIMESTAMP WITH TIME ZONE,
    confirmation_token TEXT,
    confirmation_token_expiry TIMESTAMP WITH TIME ZONE,
    
    -- OTP для различных операций
    otp TEXT,
    otp_expiry TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- 2. ТАБЛИЦА СКРИПТОВ
-- =====================================================

CREATE TABLE IF NOT EXISTS scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Основная информация
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    
    -- Автор и владелец
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(255),
    
    -- Контент
    code TEXT NOT NULL,
    version VARCHAR(50) DEFAULT '1.0.0',
    
    -- Статистика
    downloads INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    
    -- Статус
    status VARCHAR(50) DEFAULT 'active',
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- Дополнительно
    tags TEXT[],
    icon_url TEXT,
    changelog TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_downloaded_at TIMESTAMP WITH TIME ZONE
);

-- Индексы для scripts
CREATE INDEX idx_scripts_category ON scripts(category);
CREATE INDEX idx_scripts_author_id ON scripts(author_id);
CREATE INDEX idx_scripts_status ON scripts(status);
CREATE INDEX idx_scripts_is_public ON scripts(is_public);
CREATE INDEX idx_scripts_downloads ON scripts(downloads DESC);
CREATE INDEX idx_scripts_created_at ON scripts(created_at DESC);

-- =====================================================
-- 3. ТАБЛИЦА ВЕРСИЙ СКРИПТОВ
-- =====================================================

CREATE TABLE IF NOT EXISTS script_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID REFERENCES scripts(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    code TEXT NOT NULL,
    changelog TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(script_id, version)
);

CREATE INDEX idx_script_versions_script_id ON script_versions(script_id);

-- =====================================================
-- 4. ТАБЛИЦА ТИКЕТОВ ПОДДЕРЖКИ
-- =====================================================

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Пользователь
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR(255),
    
    -- Содержание
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'open',
    
    -- Категория
    category VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- =====================================================
-- 5. ТАБЛИЦА СООБЩЕНИЙ ТИКЕТОВ
-- =====================================================

CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    
    -- Автор
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_admin BOOLEAN DEFAULT false,
    
    -- Содержание
    message TEXT NOT NULL,
    
    -- Вложения
    attachments TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX idx_ticket_messages_created_at ON ticket_messages(created_at);

-- =====================================================
-- 6. ТАБЛИЦА API КЛЮЧЕЙ
-- =====================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Ключ
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix VARCHAR(20) NOT NULL,
    name VARCHAR(255),
    
    -- Права
    permissions TEXT[] DEFAULT ARRAY['read'],
    
    -- Статус
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

-- =====================================================
-- 7. ТАБЛИЦА ПОДПИСОК
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- План
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    
    -- Даты
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Платёж
    payment_method VARCHAR(100),
    amount DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'RUB',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- =====================================================
-- 8. ТАБЛИЦА ИСТОРИИ ВХОДОВ
-- =====================================================

CREATE TABLE IF NOT EXISTS login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Данные входа
    ip_address VARCHAR(45),
    user_agent TEXT,
    location VARCHAR(255),
    browser VARCHAR(100),
    
    -- Результат
    success BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_created_at ON login_history(created_at DESC);

-- =====================================================
-- 9. ТАБЛИЦА БАНОВ
-- =====================================================

CREATE TABLE IF NOT EXISTS user_bans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Причина
    reason TEXT NOT NULL,
    banned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Статус
    is_active BOOLEAN DEFAULT true,
    
    -- Даты
    banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    unbanned_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX idx_user_bans_is_active ON user_bans(is_active);

-- =====================================================
-- 10. ФУНКЦИИ И ТРИГГЕРЫ
-- =====================================================

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scripts_updated_at BEFORE UPDATE ON scripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция генерации реферального кода
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        code := upper(substring(md5(random()::text) from 1 for 8));
        SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = code) INTO exists;
        EXIT WHEN NOT exists;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Триггер автогенерации реферального кода
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_referral_code ON users;
CREATE TRIGGER trigger_generate_referral_code
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_referral_code();

-- =====================================================
-- 11. ПРАВА ДОСТУПА
-- =====================================================

GRANT ALL ON users TO postgres, anon, authenticated, service_role;
GRANT ALL ON scripts TO postgres, anon, authenticated, service_role;
GRANT ALL ON script_versions TO postgres, anon, authenticated, service_role;
GRANT ALL ON tickets TO postgres, anon, authenticated, service_role;
GRANT ALL ON ticket_messages TO postgres, anon, authenticated, service_role;
GRANT ALL ON api_keys TO postgres, anon, authenticated, service_role;
GRANT ALL ON subscriptions TO postgres, anon, authenticated, service_role;
GRANT ALL ON login_history TO postgres, anon, authenticated, service_role;
GRANT ALL ON user_bans TO postgres, anon, authenticated, service_role;

-- =====================================================
-- 12. ДОПОЛНИТЕЛЬНЫЕ ТАБЛИЦЫ
-- =====================================================

-- Таблица связи пользователей и скриптов
CREATE TABLE IF NOT EXISTS user_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    script_id UUID REFERENCES scripts(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, script_id)
);

CREATE INDEX idx_user_scripts_user_id ON user_scripts(user_id);
CREATE INDEX idx_user_scripts_script_id ON user_scripts(script_id);

-- Таблица категорий скриптов
CREATE TABLE IF NOT EXISTS script_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_script_categories_slug ON script_categories(slug);
CREATE INDEX idx_script_categories_active ON script_categories(is_active);

-- Вставка дефолтных категорий
INSERT INTO script_categories (name, slug, description, icon, color, display_order) VALUES
('UI', 'ui', 'Улучшения пользовательского интерфейса', '🎨', '#3b82f6', 1),
('Privacy', 'privacy', 'Приватность и безопасность', '🔒', '#8b5cf6', 2),
('Productivity', 'productivity', 'Продуктивность и автоматизация', '⚡', '#10b981', 3),
('General', 'general', 'Общие скрипты', '📦', '#6b7280', 4)
ON CONFLICT (slug) DO NOTHING;

-- Таблица ролей
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_roles_name ON roles(name);

-- Вставка дефолтных ролей
INSERT INTO roles (name, display_name, description, display_order) VALUES
('user', 'Пользователь', 'Обычный пользователь', 1),
('premium', 'Premium', 'Premium подписка', 2),
('pro', 'Pro', 'Pro подписка', 3),
('admin', 'Администратор', 'Полный доступ', 4)
ON CONFLICT (name) DO NOTHING;

-- Реферальная система (всё в одной таблице)
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Реферер (кто пригласил)
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referrer_code VARCHAR(50),
    
    -- Приглашённый
    referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Награда
    reward_amount DECIMAL(10,2) DEFAULT 0,
    reward_paid BOOLEAN DEFAULT false,
    
    -- Статус
    status VARCHAR(50) DEFAULT 'pending',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);
CREATE INDEX idx_referrals_code ON referrals(referrer_code);

-- Алиасы для совместимости со старым кодом
CREATE VIEW support_tickets AS SELECT * FROM tickets;

-- VIEW для referral_codes (для совместимости)
CREATE VIEW referral_codes AS 
SELECT DISTINCT
    gen_random_uuid() as id,
    referrer_code as code,
    referrer_id as user_id,
    COUNT(*) OVER (PARTITION BY referrer_code) as uses_count,
    NULL::INTEGER as max_uses,
    true as is_active,
    NULL::TIMESTAMP WITH TIME ZONE as expires_at,
    MIN(created_at) OVER (PARTITION BY referrer_code) as created_at,
    NOW() as updated_at
FROM referrals
WHERE referrer_code IS NOT NULL;

-- VIEW для referral_uses (для совместимости)
CREATE VIEW referral_uses AS
SELECT 
    id,
    NULL::UUID as referral_code_id,
    referrer_id as referrer_user_id,
    referred_id as referred_user_id,
    reward_amount,
    created_at
FROM referrals;

-- VIEW для referral_stats (для совместимости)
CREATE VIEW referral_stats AS
SELECT 
    gen_random_uuid() as id,
    referrer_id as user_id,
    COUNT(*) as total_referrals,
    SUM(reward_amount) as total_earnings,
    COUNT(*) FILTER (WHERE status = 'active') as active_referrals,
    MAX(created_at) as updated_at
FROM referrals
GROUP BY referrer_id;

-- =====================================================
-- УСТАНОВКА ЗАВЕРШЕНА
-- =====================================================
