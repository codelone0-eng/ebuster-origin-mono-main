-- ============================================
-- СОЗДАНИЕ СИСТЕМЫ API КЛЮЧЕЙ
-- ============================================

-- Таблица API ключей
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  key_name VARCHAR(100) NOT NULL,
  api_key VARCHAR(64) NOT NULL UNIQUE,
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- Комментарии
COMMENT ON TABLE api_keys IS 'API ключи пользователей';
COMMENT ON COLUMN api_keys.key_name IS 'Название ключа (для идентификации)';
COMMENT ON COLUMN api_keys.api_key IS 'Сам API ключ (SHA256)';
COMMENT ON COLUMN api_keys.permissions IS 'Разрешения: ["scripts.read", "scripts.download", "user.profile"]';
COMMENT ON COLUMN api_keys.last_used_at IS 'Последнее использование';
COMMENT ON COLUMN api_keys.expires_at IS 'Дата истечения (NULL = бессрочный)';

-- Триггер обновления updated_at
CREATE OR REPLACE FUNCTION update_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_api_keys_updated_at();

-- RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи видят только свои ключи
CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

-- Политика: пользователи могут создавать свои ключи
CREATE POLICY "Users can create own API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политика: пользователи могут обновлять свои ключи
CREATE POLICY "Users can update own API keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

-- Политика: пользователи могут удалять свои ключи
CREATE POLICY "Users can delete own API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Политика: админы могут все
CREATE POLICY "Admins can do everything on API keys" ON api_keys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth_users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- ============================================
-- ДОБАВЛЕНИЕ ПОЛЯ required_role_id В SCRIPTS
-- ============================================

-- Добавляем поле для указания требуемой роли
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS required_role_id UUID REFERENCES roles(id);

-- Индекс
CREATE INDEX IF NOT EXISTS idx_scripts_required_role ON scripts(required_role_id);

-- Комментарий
COMMENT ON COLUMN scripts.required_role_id IS 'Минимальная роль для доступа к скрипту (NULL = доступен всем)';

-- Обновляем существующие скрипты
-- Premium скрипты требуют premium роль
UPDATE scripts 
SET required_role_id = (SELECT id FROM roles WHERE name = 'premium' LIMIT 1)
WHERE status = 'premium' OR title ILIKE '%premium%';

-- Pro скрипты требуют pro роль
UPDATE scripts 
SET required_role_id = (SELECT id FROM roles WHERE name = 'pro' LIMIT 1)
WHERE status = 'pro' OR title ILIKE '%pro%';

-- Проверка
SELECT 
  '=== SCRIPTS WITH ROLES ===' as section,
  s.id,
  s.title,
  s.status,
  r.name as required_role,
  r.display_name
FROM scripts s
LEFT JOIN roles r ON r.id = s.required_role_id
ORDER BY r.display_order NULLS FIRST;

-- Проверка API ключей
SELECT 
  '=== API KEYS TABLE ===' as section,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'api_keys'
ORDER BY ordinal_position;
