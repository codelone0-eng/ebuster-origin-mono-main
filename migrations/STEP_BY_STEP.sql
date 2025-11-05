-- ============================================
-- ШАГ 1: Создание таблицы roles
-- Скопируйте и выполните ТОЛЬКО этот блок
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

CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON roles(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_is_subscription ON roles(is_subscription);
CREATE INDEX IF NOT EXISTS idx_roles_display_order ON roles(display_order);


-- ============================================
-- ШАГ 2: Вставка базовых ролей
-- После успешного выполнения Шага 1, выполните этот блок
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
-- ШАГ 3: Проверка созданных ролей
-- Выполните для проверки
-- ============================================

SELECT 
  name,
  display_name,
  price_monthly,
  price_yearly,
  is_subscription,
  is_active
FROM roles
ORDER BY display_order;


-- ============================================
-- ШАГ 4: Добавление поля role_id в auth_users
-- После успешного выполнения Шагов 1-3, выполните этот блок
-- ============================================

ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS role_id UUID;


-- ============================================
-- ШАГ 5: Добавление foreign key и индекса
-- После успешного выполнения Шага 4
-- ============================================

ALTER TABLE auth_users 
ADD CONSTRAINT fk_auth_users_role_id 
FOREIGN KEY (role_id) REFERENCES roles(id);

CREATE INDEX IF NOT EXISTS idx_auth_users_role_id ON auth_users(role_id);


-- ============================================
-- ШАГ 6: Миграция данных из role в role_id
-- Переносим существующие роли из текстового поля в UUID
-- ============================================

-- Для пользователей с role='admin'
UPDATE auth_users 
SET role_id = (SELECT id FROM roles WHERE name = 'admin' LIMIT 1)
WHERE role = 'admin' AND role_id IS NULL;

-- Для пользователей с role='user' или другими значениями
UPDATE auth_users 
SET role_id = (SELECT id FROM roles WHERE name = 'free' LIMIT 1)
WHERE role != 'admin' AND role_id IS NULL;

-- Для всех остальных (на всякий случай)
UPDATE auth_users 
SET role_id = (SELECT id FROM roles WHERE name = 'free' LIMIT 1)
WHERE role_id IS NULL;


-- ============================================
-- ШАГ 7: Проверка миграции
-- Проверяем что все пользователи получили role_id
-- ============================================

SELECT 
  email,
  role as old_role,
  r.name as new_role_name,
  r.display_name
FROM auth_users u
LEFT JOIN roles r ON r.id = u.role_id
ORDER BY u.created_at;


-- ============================================
-- ШАГ 8: Создание таблицы subscriptions
-- После успешного выполнения всех предыдущих шагов
-- ============================================

-- Сначала создаем таблицу без foreign keys
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_role_id ON subscriptions(role_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);

-- Добавляем foreign keys отдельно
ALTER TABLE subscriptions 
ADD CONSTRAINT fk_subscriptions_user_id 
FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE;

ALTER TABLE subscriptions 
ADD CONSTRAINT fk_subscriptions_role_id 
FOREIGN KEY (role_id) REFERENCES roles(id);


-- ============================================
-- ШАГ 9: Финальная проверка
-- Проверяем что все создалось
-- ============================================

-- Проверка ролей
SELECT 'Roles count:' as info, COUNT(*) as count FROM roles;

-- Проверка пользователей с ролями
SELECT 'Users with roles:' as info, COUNT(*) as count FROM auth_users WHERE role_id IS NOT NULL;

-- Проверка подписок
SELECT 'Subscriptions count:' as info, COUNT(*) as count FROM subscriptions;

-- Детальная информация по пользователям
SELECT 
  u.email,
  u.role as old_text_role,
  r.name as role_name,
  r.display_name,
  r.is_subscription
FROM auth_users u
LEFT JOIN roles r ON r.id = u.role_id
ORDER BY u.created_at;
