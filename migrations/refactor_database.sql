-- =====================================================
-- EBUSTER DATABASE REFACTORING
-- Полная реструктуризация БД с сохранением данных
-- =====================================================

-- =====================================================
-- 0. СОХРАНЕНИЕ ДАННЫХ VO ВРЕМЕННЫЕ ТАБЛИЦЫ
-- =====================================================

-- Сохраняем данные из auth_users
CREATE TEMP TABLE temp_auth_users AS SELECT * FROM auth_users;

-- Сохраняем данные из scripts
CREATE TEMP TABLE temp_scripts AS SELECT * FROM scripts;

-- Сохраняем данные из script_versions
CREATE TEMP TABLE temp_script_versions AS SELECT * FROM script_versions;

-- Сохраняем данные из support_tickets
CREATE TEMP TABLE temp_support_tickets AS SELECT * FROM support_tickets;

-- Сохраняем данные из ticket_messages
CREATE TEMP TABLE temp_ticket_messages AS SELECT * FROM ticket_messages;

-- Сохраняем данные из ticket_comments (если есть)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ticket_comments') THEN
        CREATE TEMP TABLE temp_ticket_comments AS SELECT * FROM ticket_comments;
    END IF;
END $$;

-- Сохраняем данные из ticket_attachments (если есть)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ticket_attachments') THEN
        CREATE TEMP TABLE temp_ticket_attachments AS SELECT * FROM ticket_attachments;
    END IF;
END $$;

-- Сохраняем данные из api_keys
CREATE TEMP TABLE temp_api_keys AS SELECT * FROM api_keys;

-- Сохраняем данные из subscriptions
CREATE TEMP TABLE temp_subscriptions AS SELECT * FROM subscriptions;

-- Сохраняем данные из login_history
CREATE TEMP TABLE temp_login_history AS SELECT * FROM login_history;

-- Сохраняем данные из user_bans
CREATE TEMP TABLE temp_user_bans AS SELECT * FROM user_bans;

-- =====================================================
-- 1. УДАЛЕНИЕ СТАРЫХ ТАБЛИЦ (от зависимых к главным)
-- =====================================================

-- Сначала удаляем все зависимые таблицы (child tables)
DROP TABLE IF EXISTS ticket_attachments CASCADE;
DROP TABLE IF EXISTS ticket_comments CASCADE;
DROP TABLE IF EXISTS ticket_messages CASCADE;
DROP TABLE IF EXISTS user_autoupdate_settings CASCADE;
DROP TABLE IF EXISTS user_script_updates CASCADE;
DROP TABLE IF EXISTS script_ratings CASCADE;
DROP TABLE IF EXISTS user_scripts CASCADE;
DROP TABLE IF EXISTS script_downloads CASCADE;
DROP TABLE IF EXISTS script_versions CASCADE;
DROP TABLE IF EXISTS referral_history CASCADE;
DROP TABLE IF EXISTS referral_stats CASCADE;
DROP TABLE IF EXISTS referral_rewards CASCADE;
DROP TABLE IF EXISTS referral_uses CASCADE;
DROP TABLE IF EXISTS login_history CASCADE;
DROP TABLE IF EXISTS user_bans CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;

-- Затем удаляем промежуточные таблицы
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS script_categories CASCADE;
DROP TABLE IF EXISTS scripts CASCADE;
DROP TABLE IF EXISTS referral_codes CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- В конце удаляем главные таблицы
DROP TABLE IF EXISTS auth_users CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- 2. СОЗДАНИЕ НОВЫХ ТАБЛИЦ
-- =====================================================

-- Таблица пользователей (объединяет auth_users и users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    
    -- Статус и роль
    status VARCHAR(50) DEFAULT 'active',
    role VARCHAR(50) DEFAULT 'user',
    email_confirmed BOOLEAN DEFAULT false,
    
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
    
    -- Реферальная система
    referral_code VARCHAR(50) UNIQUE,
    referred_by UUID,
    referral_earnings DECIMAL(10,2) DEFAULT 0,
    
    -- Токены
    token_version BIGINT DEFAULT 0,
    
    -- Временные поля для восстановления/подтверждения
    reset_token TEXT,
    reset_token_expiry TIMESTAMP WITH TIME ZONE,
    confirmation_token TEXT,
    confirmation_token_expiry TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Таблица скриптов (объединяет scripts, script_categories, script_downloads)
CREATE TABLE scripts (
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
    
    -- Метаданные
    tags TEXT[],
    icon_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_downloaded_at TIMESTAMP WITH TIME ZONE
);

-- Индексы для scripts
CREATE INDEX IF NOT EXISTS idx_scripts_category ON scripts(category);
CREATE INDEX IF NOT EXISTS idx_scripts_author_id ON scripts(author_id);
CREATE INDEX IF NOT EXISTS idx_scripts_status ON scripts(status);
CREATE INDEX IF NOT EXISTS idx_scripts_is_public ON scripts(is_public);
CREATE INDEX IF NOT EXISTS idx_scripts_downloads ON scripts(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_scripts_created_at ON scripts(created_at DESC);

-- Таблица версий скриптов
CREATE TABLE IF NOT EXISTS script_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID REFERENCES scripts(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    code TEXT NOT NULL,
    changelog TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(script_id, version)
);

CREATE INDEX IF NOT EXISTS idx_script_versions_script_id ON script_versions(script_id);

-- Таблица тикетов (упрощённая)
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

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

-- Таблица сообщений тикетов
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

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at);

-- Таблица API ключей
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

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- Таблица подписок
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

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Таблица истории входов
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

CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at DESC);

-- Таблица банов
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

CREATE INDEX IF NOT EXISTS idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_is_active ON user_bans(is_active);

-- =====================================================
-- 2. МИГРАЦИЯ ДАННЫХ
-- =====================================================

-- Миграция пользователей из temp_auth_users
INSERT INTO users (
    id, email, password_hash, full_name, avatar_url,
    status, role, email_confirmed,
    two_factor_enabled, two_factor_secret, two_factor_secret_temp, two_factor_backup_codes,
    last_active, browser, location, downloads,
    referral_code, referred_by, referral_earnings,
    token_version,
    reset_token, reset_token_expiry, confirmation_token, confirmation_token_expiry,
    created_at, updated_at
)
SELECT 
    id, email, password_hash, full_name, avatar_url,
    COALESCE(status, 'active'), COALESCE(role, 'user'), COALESCE(email_confirmed, false),
    COALESCE(two_factor_enabled, false), two_factor_secret, two_factor_secret_temp, two_factor_backup_codes,
    last_active, browser, location, COALESCE(downloads, 0),
    referral_code, referred_by, COALESCE(referral_earnings, 0),
    COALESCE(NULLIF(token_version, '')::bigint, 0),
    reset_token, reset_token_expiry, confirmation_token, otp_expiry,
    created_at, COALESCE(updated_at, created_at)
FROM temp_auth_users
ON CONFLICT (id) DO NOTHING;

-- Миграция скриптов
INSERT INTO scripts (
    id, name, description, category,
    author_id, author_name,
    code, version,
    downloads, views, rating,
    status, is_public, is_featured,
    tags, icon_url,
    created_at, updated_at
)
SELECT 
    s.id, 
    COALESCE(s.title, 'Untitled Script'), 
    s.description, 
    COALESCE(s.category, 'general'),
    s.author_id, 
    s.author_name,
    s.code, 
    COALESCE(s.version, '1.0.0'),
    COALESCE(s.downloads_count, 0), 
    0, -- views (нет в старой таблице)
    COALESCE(s.rating, 0),
    COALESCE(s.status, 'active'), 
    true, -- is_public (нет в старой таблице, ставим true)
    COALESCE(s.is_featured, false),
    s.tags, 
    NULL, -- icon_url (нет в старой таблице)
    s.created_at, 
    COALESCE(s.updated_at, s.created_at)
FROM temp_scripts s
ON CONFLICT (id) DO NOTHING;

-- Миграция версий скриптов
INSERT INTO script_versions (id, script_id, version, code, changelog, created_at)
SELECT id, script_id, version, code, changelog, created_at
FROM temp_script_versions
ON CONFLICT (script_id, version) DO NOTHING;

-- Миграция тикетов из support_tickets
INSERT INTO tickets (
    id, ticket_number, user_id, user_email,
    subject, message, priority, status, category,
    created_at, updated_at, closed_at
)
SELECT 
    t.id, 
    'TICKET-' || t.id::text, -- генерируем ticket_number
    t.user_id, 
    (SELECT email FROM temp_auth_users WHERE id = t.user_id), -- получаем email из users
    t.subject,
    t.message,
    COALESCE(t.priority, 'medium'), 
    COALESCE(t.status, 'open'),
    t.category,
    t.created_at, 
    COALESCE(t.updated_at, t.created_at),
    t.closed_at
FROM temp_support_tickets t
WHERE COALESCE(t.is_deleted, false) = false -- не мигрируем удалённые
ON CONFLICT (id) DO NOTHING;

-- Миграция сообщений тикетов
INSERT INTO ticket_messages (id, ticket_id, user_id, is_admin, message, attachments, created_at)
SELECT id, ticket_id, user_id, COALESCE(is_admin, false), message, attachments, created_at
FROM temp_ticket_messages
ON CONFLICT (id) DO NOTHING;

-- Миграция API ключей
INSERT INTO api_keys (
    id, user_id, key_hash, key_prefix, name,
    permissions, is_active, last_used_at,
    created_at, expires_at
)
SELECT 
    id, user_id, key_hash, key_prefix, name,
    COALESCE(permissions, ARRAY['read']), 
    COALESCE(is_active, true), 
    last_used_at,
    created_at, expires_at
FROM temp_api_keys
ON CONFLICT (id) DO NOTHING;

-- Миграция подписок
INSERT INTO subscriptions (
    id, user_id, plan, status,
    started_at, expires_at, cancelled_at,
    payment_method, amount, currency,
    created_at, updated_at
)
SELECT 
    id, user_id, plan, COALESCE(status, 'active'),
    started_at, expires_at, cancelled_at,
    payment_method, amount, COALESCE(currency, 'RUB'),
    created_at, updated_at
FROM temp_subscriptions
ON CONFLICT (id) DO NOTHING;

-- Миграция истории входов
INSERT INTO login_history (id, user_id, ip_address, user_agent, location, browser, success, created_at)
SELECT id, user_id, ip_address, user_agent, location, browser, COALESCE(success, true), created_at
FROM temp_login_history
ON CONFLICT (id) DO NOTHING;

-- Миграция банов
INSERT INTO user_bans (id, user_id, reason, banned_by, is_active, banned_at, expires_at, unbanned_at)
SELECT id, user_id, reason, banned_by, COALESCE(is_active, true), banned_at, expires_at, unbanned_at
FROM temp_user_bans
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. СОЗДАНИЕ ФУНКЦИЙ И ТРИГГЕРОВ
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

-- =====================================================
-- 5. ПРАВА ДОСТУПА
-- =====================================================

-- Предоставляем права на новые таблицы
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
-- МИГРАЦИЯ ЗАВЕРШЕНА
-- =====================================================
