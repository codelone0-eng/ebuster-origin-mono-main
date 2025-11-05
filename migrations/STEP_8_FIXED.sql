-- ============================================
-- ШАГ 8 (ИСПРАВЛЕННЫЙ): Создание таблицы subscriptions
-- ============================================

-- Удаляем таблицу если она уже существует (на всякий случай)
DROP TABLE IF EXISTS subscriptions CASCADE;

-- Создаем таблицу subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Добавляем CHECK constraint отдельно
ALTER TABLE subscriptions 
ADD CONSTRAINT check_subscriptions_status 
CHECK (status IN ('active', 'cancelled', 'expired', 'pending'));

-- Создаем индексы
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_role_id ON subscriptions(role_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- Добавляем foreign keys
ALTER TABLE subscriptions 
ADD CONSTRAINT fk_subscriptions_user_id 
FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE;

ALTER TABLE subscriptions 
ADD CONSTRAINT fk_subscriptions_role_id 
FOREIGN KEY (role_id) REFERENCES roles(id);

-- Проверка
SELECT 
  'Subscriptions table created' as status,
  COUNT(*) as count 
FROM subscriptions;

SELECT 
  'Foreign keys on subscriptions' as info,
  constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'subscriptions' 
AND constraint_type = 'FOREIGN KEY';
