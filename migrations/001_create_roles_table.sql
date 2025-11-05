-- Создание таблицы roles
-- Эта таблица хранит все роли и подписки в системе

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

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON roles(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_is_subscription ON roles(is_subscription);
CREATE INDEX IF NOT EXISTS idx_roles_display_order ON roles(display_order);

-- Комментарии к полям
COMMENT ON TABLE roles IS 'Таблица ролей и подписок пользователей';
COMMENT ON COLUMN roles.name IS 'Уникальное имя роли (например: free, pro, premium, admin)';
COMMENT ON COLUMN roles.display_name IS 'Отображаемое название роли';
COMMENT ON COLUMN roles.description IS 'Описание роли';
COMMENT ON COLUMN roles.price_monthly IS 'Цена за месяц в рублях';
COMMENT ON COLUMN roles.price_yearly IS 'Цена за год в рублях';
COMMENT ON COLUMN roles.features IS 'JSON объект с возможностями роли';
COMMENT ON COLUMN roles.limits IS 'JSON объект с лимитами роли';
COMMENT ON COLUMN roles.is_active IS 'Активна ли роль';
COMMENT ON COLUMN roles.is_subscription IS 'Является ли роль платной подпиской';
COMMENT ON COLUMN roles.display_order IS 'Порядок отображения';

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Проверяем существование таблицы auth_users
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'auth_users') THEN
    RAISE EXCEPTION 'Table auth_users does not exist. Please create it first.';
  END IF;
END $$;

-- Вставка базовых ролей
INSERT INTO roles (name, display_name, description, price_monthly, price_yearly, features, limits, is_active, is_subscription, display_order)
VALUES 
  -- Free роль (базовая бесплатная)
  (
    'free',
    'Free',
    'Бесплатный план с базовыми возможностями',
    0,
    0,
    '{
      "scripts": {
        "can_create": true,
        "can_publish": false,
        "can_feature": false,
        "can_moderate": false
      },
      "downloads": {
        "unlimited": false
      },
      "support": {
        "priority": false,
        "chat": false
      },
      "api": {
        "enabled": false
      }
    }'::jsonb,
    '{
      "scripts": 5,
      "downloads_per_day": 10,
      "api_rate_limit": 0,
      "storage_mb": 100
    }'::jsonb,
    true,
    false,
    0
  ),
  
  -- Pro роль (платная подписка)
  (
    'pro',
    'Pro',
    'Профессиональный план для активных пользователей',
    999,
    9990,
    '{
      "scripts": {
        "can_create": true,
        "can_publish": true,
        "can_feature": false,
        "can_moderate": false
      },
      "downloads": {
        "unlimited": false
      },
      "support": {
        "priority": true,
        "chat": false
      },
      "api": {
        "enabled": true
      }
    }'::jsonb,
    '{
      "scripts": 50,
      "downloads_per_day": 100,
      "api_rate_limit": 1000,
      "storage_mb": 1000
    }'::jsonb,
    true,
    true,
    1
  ),
  
  -- Premium роль (платная подписка)
  (
    'premium',
    'Premium',
    'Премиум план с неограниченными возможностями',
    2999,
    29990,
    '{
      "scripts": {
        "can_create": true,
        "can_publish": true,
        "can_feature": true,
        "can_moderate": false
      },
      "downloads": {
        "unlimited": true
      },
      "support": {
        "priority": true,
        "chat": true
      },
      "api": {
        "enabled": true
      }
    }'::jsonb,
    '{
      "scripts": -1,
      "downloads_per_day": -1,
      "api_rate_limit": 10000,
      "storage_mb": 10000
    }'::jsonb,
    true,
    true,
    2
  ),
  
  -- Admin роль (роль доступа)
  (
    'admin',
    'Администратор',
    'Полный доступ ко всем функциям системы',
    0,
    0,
    '{
      "scripts": {
        "can_create": true,
        "can_publish": true,
        "can_feature": true,
        "can_moderate": true
      },
      "downloads": {
        "unlimited": true
      },
      "support": {
        "priority": true,
        "chat": true
      },
      "api": {
        "enabled": true
      },
      "admin": {
        "full_access": true
      }
    }'::jsonb,
    '{
      "scripts": -1,
      "downloads_per_day": -1,
      "api_rate_limit": -1,
      "storage_mb": -1
    }'::jsonb,
    true,
    false,
    999
  )
ON CONFLICT (name) DO NOTHING;

-- Добавляем поле role_id в таблицу auth_users если его нет
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'auth_users' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE auth_users ADD COLUMN role_id UUID REFERENCES roles(id);
    CREATE INDEX IF NOT EXISTS idx_auth_users_role_id ON auth_users(role_id);
    
    -- Устанавливаем роль free для всех существующих пользователей без роли
    UPDATE auth_users 
    SET role_id = (SELECT id FROM roles WHERE name = 'free' LIMIT 1)
    WHERE role_id IS NULL;
  END IF;
END $$;

-- Создаем таблицу subscriptions если её нет
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
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

-- Комментарии для subscriptions
COMMENT ON TABLE subscriptions IS 'Таблица подписок пользователей';
COMMENT ON COLUMN subscriptions.status IS 'Статус подписки: active, cancelled, expired, pending';
COMMENT ON COLUMN subscriptions.auto_renew IS 'Автоматическое продление подписки';

-- Триггер для subscriptions
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Включаем Row Level Security
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Политики для roles (все могут читать активные роли)
CREATE POLICY "Anyone can view active roles" ON roles
  FOR SELECT USING (is_active = true);

-- Политики для subscriptions (пользователи видят только свои подписки)
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Админы могут все
CREATE POLICY "Admins can do everything on roles" ON roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth_users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Admins can do everything on subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth_users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );
