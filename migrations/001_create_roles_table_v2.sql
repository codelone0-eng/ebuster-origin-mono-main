-- Создание таблицы roles с поддержкой новой системы разрешений
-- Эта миграция безопасна для повторного запуска

-- Создаём таблицу если её нет
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Добавляем базовые поля если их нет
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roles' AND column_name = 'price_monthly'
  ) THEN
    ALTER TABLE roles ADD COLUMN price_monthly DECIMAL(10, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roles' AND column_name = 'price_yearly'
  ) THEN
    ALTER TABLE roles ADD COLUMN price_yearly DECIMAL(10, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE roles ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roles' AND column_name = 'is_subscription'
  ) THEN
    ALTER TABLE roles ADD COLUMN is_subscription BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roles' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE roles ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- Добавляем поля features и limits если их нет (старая система)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roles' AND column_name = 'features'
  ) THEN
    ALTER TABLE roles ADD COLUMN features JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roles' AND column_name = 'limits'
  ) THEN
    ALTER TABLE roles ADD COLUMN limits JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Добавляем поле permissions (новая система)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roles' AND column_name = 'permissions'
  ) THEN
    ALTER TABLE roles ADD COLUMN permissions JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Создаём индексы если их нет
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON roles(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_is_subscription ON roles(is_subscription);
CREATE INDEX IF NOT EXISTS idx_roles_display_order ON roles(display_order);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Добавляем поле role_id в таблицу users если его нет
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE users ADD COLUMN role_id UUID REFERENCES roles(id);
    CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
  END IF;
END $$;

-- Добавляем поле permissions в таблицу users если его нет (для кастомных разрешений)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'permissions'
  ) THEN
    ALTER TABLE users ADD COLUMN permissions JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

COMMENT ON TABLE roles IS 'Таблица ролей и подписок пользователей';
COMMENT ON COLUMN roles.name IS 'Уникальное имя роли (например: user, pro, premium, admin)';
COMMENT ON COLUMN roles.display_name IS 'Отображаемое название роли';
COMMENT ON COLUMN roles.permissions IS 'Массив ID разрешений из системы RBAC';
COMMENT ON COLUMN roles.features IS 'JSON объект с возможностями роли (старая система)';
COMMENT ON COLUMN roles.limits IS 'JSON объект с лимитами роли';
