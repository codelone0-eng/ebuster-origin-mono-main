-- Таблица версий скриптов
CREATE TABLE IF NOT EXISTS script_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  changelog TEXT,
  file_size INTEGER,
  file_type VARCHAR(50) DEFAULT 'text/javascript',
  is_current BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(script_id, version)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_script_versions_script_id ON script_versions(script_id);
CREATE INDEX IF NOT EXISTS idx_script_versions_current ON script_versions(script_id, is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_script_versions_published ON script_versions(published_at) WHERE published_at IS NOT NULL;

-- Таблица для отслеживания обновлений скриптов у пользователей
CREATE TABLE IF NOT EXISTS user_script_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  old_version VARCHAR(50),
  new_version VARCHAR(50) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  auto_updated BOOLEAN DEFAULT false,
  
  UNIQUE(user_id, script_id, new_version)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_user_script_updates_user ON user_script_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_script_updates_script ON user_script_updates(script_id);
CREATE INDEX IF NOT EXISTS idx_user_script_updates_date ON user_script_updates(updated_at);

-- Настройки авто-обновления для пользователей
CREATE TABLE IF NOT EXISTS user_autoupdate_settings (
  user_id UUID PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  notify_on_update BOOLEAN DEFAULT true,
  auto_install_updates BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Комментарии
COMMENT ON TABLE script_versions IS 'История версий скриптов';
COMMENT ON TABLE user_script_updates IS 'История обновлений скриптов у пользователей';
COMMENT ON TABLE user_autoupdate_settings IS 'Настройки авто-обновления скриптов для пользователей';
