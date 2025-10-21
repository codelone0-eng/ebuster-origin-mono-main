-- Реферальная система для Ebuster
-- Таблица реферальных кодов
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  code VARCHAR(50) UNIQUE NOT NULL,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT NULL, -- NULL = unlimited
  discount_type VARCHAR(20) DEFAULT 'percentage', -- 'percentage', 'fixed', 'free_days'
  discount_value DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица использований реферальных кодов
CREATE TABLE IF NOT EXISTS referral_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  referrer_user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE, -- кто пригласил
  referred_user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE, -- кого пригласили
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  reward_type VARCHAR(20) DEFAULT 'commission', -- 'commission', 'free_days', 'discount'
  reward_value DECIMAL(10,2) DEFAULT 0,
  reward_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Таблица наград реферера
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  referral_use_id UUID NOT NULL REFERENCES referral_uses(id) ON DELETE CASCADE,
  reward_type VARCHAR(20) NOT NULL, -- 'commission', 'free_days', 'bonus'
  amount DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'cancelled'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Таблица статистики рефералов
CREATE TABLE IF NOT EXISTS referral_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth_users(id) ON DELETE CASCADE,
  total_referrals INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  pending_earnings DECIMAL(10,2) DEFAULT 0,
  paid_earnings DECIMAL(10,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  last_referral_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON referral_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_referral_uses_referrer ON referral_uses(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_uses_referred ON referral_uses(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user_id ON referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON referral_rewards(status);
CREATE INDEX IF NOT EXISTS idx_referral_stats_user_id ON referral_stats(user_id);

-- Функция для генерации уникального реферального кода
CREATE OR REPLACE FUNCTION generate_referral_code(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 0;
BEGIN
  -- Берем первые 6 символов email (до @) и делаем uppercase
  base_code := UPPER(SUBSTRING(user_email FROM 1 FOR POSITION('@' IN user_email) - 1));
  base_code := SUBSTRING(base_code FROM 1 FOR 6);
  
  -- Добавляем случайные цифры
  final_code := base_code || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Проверяем уникальность
  WHILE EXISTS (SELECT 1 FROM referral_codes WHERE code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Защита от бесконечного цикла
    IF counter > 100 THEN
      final_code := 'REF' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического создания реферального кода при регистрации
CREATE OR REPLACE FUNCTION create_referral_code_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO referral_codes (user_id, code, discount_type, discount_value)
  VALUES (
    NEW.id,
    generate_referral_code(NEW.email),
    'percentage',
    10 -- 10% скидка по умолчанию
  );
  
  INSERT INTO referral_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_referral_code
AFTER INSERT ON auth_users
FOR EACH ROW
EXECUTE FUNCTION create_referral_code_for_new_user();

-- Функция для обновления статистики рефералов
CREATE OR REPLACE FUNCTION update_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Обновляем статистику реферера
    UPDATE referral_stats
    SET 
      total_referrals = total_referrals + 1,
      active_referrals = active_referrals + 1,
      last_referral_at = NOW(),
      updated_at = NOW()
    WHERE user_id = NEW.referrer_user_id;
    
    -- Обновляем счетчик использований кода
    UPDATE referral_codes
    SET uses_count = uses_count + 1
    WHERE id = NEW.referral_code_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_referral_stats
AFTER INSERT ON referral_uses
FOR EACH ROW
EXECUTE FUNCTION update_referral_stats();

-- Функция для обновления earnings при изменении статуса награды
CREATE OR REPLACE FUNCTION update_referral_earnings()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
    UPDATE referral_stats
    SET
      pending_earnings = (
        SELECT COALESCE(SUM(amount), 0)
        FROM referral_rewards
        WHERE user_id = NEW.user_id AND status = 'pending'
      ),
      paid_earnings = (
        SELECT COALESCE(SUM(amount), 0)
        FROM referral_rewards
        WHERE user_id = NEW.user_id AND status = 'paid'
      ),
      total_earnings = (
        SELECT COALESCE(SUM(amount), 0)
        FROM referral_rewards
        WHERE user_id = NEW.user_id AND status IN ('paid', 'approved')
      ),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_referral_earnings
AFTER INSERT OR UPDATE ON referral_rewards
FOR EACH ROW
EXECUTE FUNCTION update_referral_earnings();

-- RLS политики
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_stats ENABLE ROW LEVEL SECURITY;

-- Пользователи могут видеть только свои реферальные коды
CREATE POLICY "Users can view own referral codes"
  ON referral_codes FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователи могут обновлять свои реферальные коды
CREATE POLICY "Users can update own referral codes"
  ON referral_codes FOR UPDATE
  USING (auth.uid() = user_id);

-- Пользователи могут видеть свои использования
CREATE POLICY "Users can view own referral uses"
  ON referral_uses FOR SELECT
  USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

-- Пользователи могут видеть свои награды
CREATE POLICY "Users can view own rewards"
  ON referral_rewards FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователи могут видеть свою статистику
CREATE POLICY "Users can view own stats"
  ON referral_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Комментарии к таблицам
COMMENT ON TABLE referral_codes IS 'Реферальные коды пользователей';
COMMENT ON TABLE referral_uses IS 'История использования реферальных кодов';
COMMENT ON TABLE referral_rewards IS 'Награды за приглашенных пользователей';
COMMENT ON TABLE referral_stats IS 'Статистика реферальной программы';
