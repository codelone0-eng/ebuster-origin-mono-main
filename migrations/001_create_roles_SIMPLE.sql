-- УПРОЩЕННАЯ МИГРАЦИЯ - Создание таблицы roles
-- Выполнять по частям если возникают ошибки

-- ============================================
-- ЧАСТЬ 1: Создание таблицы roles
-- ============================================

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10, 2) DEFAULT 0,
  price_yearly DECIMAL(10, 2) DEFAULT 0,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_subscription BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ЧАСТЬ 2: Индексы
-- ============================================

CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON roles(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_is_subscription ON roles(is_subscription);
CREATE INDEX IF NOT EXISTS idx_roles_display_order ON roles(display_order);

-- ============================================
-- ЧАСТЬ 3: Базовые роли
-- ============================================

INSERT INTO roles (name, display_name, description, price_monthly, price_yearly, features, limits, is_active, is_subscription, display_order)
VALUES 
  (
    'free',
    'Free',
    'Бесплатный план с базовыми возможностями',
    0,
    0,
    '{"scripts": {"can_create": true, "can_publish": false}, "downloads": {"unlimited": false}, "support": {"priority": false}, "api": {"enabled": false}}'::jsonb,
    '{"scripts": 5, "downloads_per_day": 10, "api_rate_limit": 0, "storage_mb": 100}'::jsonb,
    true,
    false,
    0
  ),
  (
    'pro',
    'Pro',
    'Профессиональный план для активных пользователей',
    999,
    9990,
    '{"scripts": {"can_create": true, "can_publish": true}, "downloads": {"unlimited": false}, "support": {"priority": true}, "api": {"enabled": true}}'::jsonb,
    '{"scripts": 50, "downloads_per_day": 100, "api_rate_limit": 1000, "storage_mb": 1000}'::jsonb,
    true,
    true,
    1
  ),
  (
    'premium',
    'Premium',
    'Премиум план с неограниченными возможностями',
    2999,
    29990,
    '{"scripts": {"can_create": true, "can_publish": true, "can_feature": true}, "downloads": {"unlimited": true}, "support": {"priority": true, "chat": true}, "api": {"enabled": true}}'::jsonb,
    '{"scripts": -1, "downloads_per_day": -1, "api_rate_limit": 10000, "storage_mb": 10000}'::jsonb,
    true,
    true,
    2
  ),
  (
    'admin',
    'Администратор',
    'Полный доступ ко всем функциям системы',
    0,
    0,
    '{"scripts": {"can_create": true, "can_publish": true, "can_feature": true, "can_moderate": true}, "downloads": {"unlimited": true}, "support": {"priority": true, "chat": true}, "api": {"enabled": true}, "admin": {"full_access": true}}'::jsonb,
    '{"scripts": -1, "downloads_per_day": -1, "api_rate_limit": -1, "storage_mb": -1}'::jsonb,
    true,
    false,
    999
  )
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ЧАСТЬ 4: Добавление role_id в auth_users
-- ============================================

DO $$ 
BEGIN
  -- Проверяем существует ли таблица auth_users
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'auth_users') THEN
    -- Добавляем колонку role_id если её нет
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'auth_users' AND column_name = 'role_id'
    ) THEN
      ALTER TABLE auth_users ADD COLUMN role_id UUID;
      
      -- Добавляем foreign key
      ALTER TABLE auth_users 
      ADD CONSTRAINT fk_auth_users_role_id 
      FOREIGN KEY (role_id) REFERENCES roles(id);
      
      -- Создаем индекс
      CREATE INDEX idx_auth_users_role_id ON auth_users(role_id);
      
      -- Устанавливаем роль free для всех существующих пользователей
      UPDATE auth_users 
      SET role_id = (SELECT id FROM roles WHERE name = 'free' LIMIT 1)
      WHERE role_id IS NULL;
    END IF;
  END IF;
END $$;

-- ============================================
-- ЧАСТЬ 5: Создание таблицы subscriptions
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_role_id ON subscriptions(role_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);

-- ============================================
-- ЧАСТЬ 6: Проверка результата
-- ============================================

-- Проверяем что все создалось
SELECT 
  'Таблица roles создана' as status,
  COUNT(*) as roles_count
FROM roles;

SELECT 
  'Таблица subscriptions создана' as status,
  COUNT(*) as subscriptions_count
FROM subscriptions;
