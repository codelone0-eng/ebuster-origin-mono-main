-- Миграция для системы ролей и подписок
-- Дата: 2025-11-05

-- 1. Создаем таблицу ролей
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  features JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Создаем таблицу подписок
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  billing_period VARCHAR(20),
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT true,
  payment_method VARCHAR(50),
  last_payment_date TIMESTAMP,
  next_payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Создаем таблицу кастомных прав
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  permission_key VARCHAR(100) NOT NULL,
  permission_value JSONB NOT NULL,
  granted_by UUID REFERENCES auth_users(id),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Добавляем колонки в auth_users (если их нет)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='auth_users' AND column_name='role_id') THEN
    ALTER TABLE auth_users ADD COLUMN role_id UUID REFERENCES roles(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='auth_users' AND column_name='subscription_id') THEN
    ALTER TABLE auth_users ADD COLUMN subscription_id UUID REFERENCES subscriptions(id);
  END IF;
END $$;

-- 5. Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_users_role_id ON auth_users(role_id);

-- 6. Создаем базовые роли
INSERT INTO roles (name, display_name, description, price_monthly, price_yearly, features, limits, display_order) VALUES
('free', 'Free', 'Бесплатный план для начинающих', 0, 0, 
  '{
    "scripts": {
      "max_count": 5,
      "can_create": true,
      "can_publish": false,
      "can_feature": false,
      "can_premium": false
    },
    "downloads": {
      "max_per_day": 10,
      "unlimited": false
    },
    "support": {
      "priority": false,
      "chat": false
    },
    "api": {
      "enabled": false,
      "rate_limit": 0
    },
    "storage": {
      "max_size_mb": 50
    }
  }',
  '{
    "scripts": 5,
    "downloads_per_day": 10,
    "storage_mb": 50
  }',
  1
),
('pro', 'Pro', 'Профессиональный план для активных пользователей', 299, 2990,
  '{
    "scripts": {
      "max_count": 50,
      "can_create": true,
      "can_publish": true,
      "can_feature": false,
      "can_premium": false
    },
    "downloads": {
      "max_per_day": 100,
      "unlimited": false
    },
    "support": {
      "priority": true,
      "chat": false
    },
    "api": {
      "enabled": true,
      "rate_limit": 1000
    },
    "storage": {
      "max_size_mb": 500
    }
  }',
  '{
    "scripts": 50,
    "downloads_per_day": 100,
    "storage_mb": 500,
    "api_requests_per_hour": 1000
  }',
  2
),
('premium', 'Premium', 'Премиум план с неограниченными возможностями', 999, 9990,
  '{
    "scripts": {
      "max_count": -1,
      "can_create": true,
      "can_publish": true,
      "can_feature": true,
      "can_premium": true
    },
    "downloads": {
      "max_per_day": -1,
      "unlimited": true
    },
    "support": {
      "priority": true,
      "chat": true
    },
    "api": {
      "enabled": true,
      "rate_limit": 10000
    },
    "storage": {
      "max_size_mb": -1
    }
  }',
  '{
    "scripts": -1,
    "downloads_per_day": -1,
    "storage_mb": -1,
    "api_requests_per_hour": 10000
  }',
  3
),
('admin', 'Admin', 'Административный доступ', 0, 0,
  '{
    "scripts": {
      "max_count": -1,
      "can_create": true,
      "can_publish": true,
      "can_feature": true,
      "can_premium": true,
      "can_moderate": true
    },
    "downloads": {
      "max_per_day": -1,
      "unlimited": true
    },
    "support": {
      "priority": true,
      "chat": true
    },
    "api": {
      "enabled": true,
      "rate_limit": -1
    },
    "storage": {
      "max_size_mb": -1
    },
    "admin": {
      "full_access": true
    }
  }',
  '{
    "scripts": -1,
    "downloads_per_day": -1,
    "storage_mb": -1,
    "api_requests_per_hour": -1
  }',
  4
)
ON CONFLICT (name) DO NOTHING;

-- 7. Назначаем всем существующим пользователям роль free
UPDATE auth_users 
SET role_id = (SELECT id FROM roles WHERE name = 'free') 
WHERE role_id IS NULL;

-- 8. Создаем триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Создаем функцию для проверки истечения подписки
CREATE OR REPLACE FUNCTION check_subscription_expiry()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND end_date IS NOT NULL
    AND end_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Комментарии к таблицам
COMMENT ON TABLE roles IS 'Роли пользователей с настройками доступа';
COMMENT ON TABLE subscriptions IS 'Подписки пользователей';
COMMENT ON TABLE user_permissions IS 'Кастомные права пользователей';

COMMENT ON COLUMN roles.features IS 'JSON с возможностями роли';
COMMENT ON COLUMN roles.limits IS 'JSON с лимитами роли';
COMMENT ON COLUMN subscriptions.status IS 'Статус: active, cancelled, expired, trial';
COMMENT ON COLUMN subscriptions.billing_period IS 'Период: monthly, yearly, lifetime';
