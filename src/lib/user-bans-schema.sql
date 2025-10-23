-- Таблица для хранения информации о банах пользователей
CREATE TABLE IF NOT EXISTS user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ban_id VARCHAR(50) UNIQUE NOT NULL,
  reason TEXT NOT NULL,
  ban_type VARCHAR(20) NOT NULL CHECK (ban_type IN ('temporary', 'permanent')),
  ban_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unban_date TIMESTAMPTZ,
  duration_hours INTEGER,
  contact_email VARCHAR(255) DEFAULT 'support@ebuster.ru',
  moderator_id UUID REFERENCES auth.users(id),
  moderator_email VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_ban_id ON user_bans(ban_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_unban_date ON user_bans(unban_date) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_bans_active ON user_bans(is_active);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_user_bans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления updated_at
DROP TRIGGER IF EXISTS trigger_update_user_bans_updated_at ON user_bans;
CREATE TRIGGER trigger_update_user_bans_updated_at
  BEFORE UPDATE ON user_bans
  FOR EACH ROW
  EXECUTE FUNCTION update_user_bans_updated_at();

-- Функция для генерации уникального ban_id
CREATE OR REPLACE FUNCTION generate_ban_id()
RETURNS TEXT AS $$
DECLARE
  new_ban_id TEXT;
  year_part TEXT;
  counter INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Получаем следующий номер для текущего года
  SELECT COALESCE(MAX(CAST(SUBSTRING(ban_id FROM 'BAN-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO counter
  FROM user_bans
  WHERE ban_id LIKE 'BAN-' || year_part || '-%';
  
  new_ban_id := 'BAN-' || year_part || '-' || LPAD(counter::TEXT, 4, '0');
  
  RETURN new_ban_id;
END;
$$ LANGUAGE plpgsql;

-- Функция для автоматической разблокировки пользователей
CREATE OR REPLACE FUNCTION auto_unban_users()
RETURNS INTEGER AS $$
DECLARE
  unbanned_count INTEGER;
BEGIN
  -- Деактивируем истекшие баны
  UPDATE user_bans
  SET is_active = FALSE,
      updated_at = NOW()
  WHERE is_active = TRUE
    AND ban_type = 'temporary'
    AND unban_date IS NOT NULL
    AND unban_date <= NOW();
  
  GET DIAGNOSTICS unbanned_count = ROW_COUNT;
  
  RETURN unbanned_count;
END;
$$ LANGUAGE plpgsql;

-- RLS политики для безопасности
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;

-- Политика: только администраторы могут просматривать баны
CREATE POLICY "Admins can view all bans"
  ON user_bans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Политика: только администраторы могут создавать баны
CREATE POLICY "Admins can create bans"
  ON user_bans
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Политика: только администраторы могут обновлять баны
CREATE POLICY "Admins can update bans"
  ON user_bans
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Политика: пользователи могут видеть только свои активные баны
CREATE POLICY "Users can view their own active bans"
  ON user_bans
  FOR SELECT
  USING (
    user_id = auth.uid()
    AND is_active = TRUE
  );

-- Комментарии к таблице и полям
COMMENT ON TABLE user_bans IS 'Таблица для хранения информации о блокировках пользователей';
COMMENT ON COLUMN user_bans.ban_id IS 'Уникальный идентификатор бана в формате BAN-YYYY-NNNN';
COMMENT ON COLUMN user_bans.ban_type IS 'Тип блокировки: temporary или permanent';
COMMENT ON COLUMN user_bans.duration_hours IS 'Длительность бана в часах (только для temporary)';
COMMENT ON COLUMN user_bans.is_active IS 'Флаг активности бана (FALSE после истечения срока)';
