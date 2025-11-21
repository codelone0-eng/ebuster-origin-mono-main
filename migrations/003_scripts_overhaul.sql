-- Полное обновление структуры управления скриптами
-- Скрипт безопасно повторяемый: проверяет наличие столбцов/индексов перед созданием

BEGIN;

-- =============================================
-- 1. Базовые поля таблицы scripts
-- =============================================

-- Убедимся, что таблица существует
CREATE TABLE IF NOT EXISTS scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL DEFAULT 'general',
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Добавляем недостающие столбцы по одному, чтобы не ломать существующие данные
DO $$
BEGIN
  -- ЧП: слагаем slug, уникальный идентификатор
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'slug'
  ) THEN
    ALTER TABLE scripts ADD COLUMN slug VARCHAR(255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'short_description'
  ) THEN
    ALTER TABLE scripts ADD COLUMN short_description TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'full_description'
  ) THEN
    ALTER TABLE scripts ADD COLUMN full_description TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'readme_markdown'
  ) THEN
    ALTER TABLE scripts ADD COLUMN readme_markdown TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'ai_summary'
  ) THEN
    ALTER TABLE scripts ADD COLUMN ai_summary TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'seo_keywords'
  ) THEN
    ALTER TABLE scripts ADD COLUMN seo_keywords TEXT[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'tech_stack'
  ) THEN
    ALTER TABLE scripts ADD COLUMN tech_stack TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'pricing_plan'
  ) THEN
    ALTER TABLE scripts ADD COLUMN pricing_plan VARCHAR(50) DEFAULT 'free';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'visibility'
  ) THEN
    ALTER TABLE scripts ADD COLUMN visibility VARCHAR(50) DEFAULT 'public';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'allowed_roles'
  ) THEN
    ALTER TABLE scripts ADD COLUMN allowed_roles JSONB DEFAULT '["user"]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'allowed_users'
  ) THEN
    ALTER TABLE scripts ADD COLUMN allowed_users JSONB DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'extension_payload'
  ) THEN
    ALTER TABLE scripts ADD COLUMN extension_payload JSONB;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE scripts ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'execution_options'
  ) THEN
    ALTER TABLE scripts ADD COLUMN execution_options JSONB DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'status'
  ) THEN
    ALTER TABLE scripts ADD COLUMN status VARCHAR(50) DEFAULT 'draft';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'visibility_status'
  ) THEN
    ALTER TABLE scripts ADD COLUMN visibility_status VARCHAR(50);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE scripts ADD COLUMN is_verified BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'requires_moderation'
  ) THEN
    ALTER TABLE scripts ADD COLUMN requires_moderation BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE scripts ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'owner_email'
  ) THEN
    ALTER TABLE scripts ADD COLUMN owner_email VARCHAR(255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'owner_name'
  ) THEN
    ALTER TABLE scripts ADD COLUMN owner_name VARCHAR(255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'download_limit_per_day'
  ) THEN
    ALTER TABLE scripts ADD COLUMN download_limit_per_day INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'last_reviewed_at'
  ) THEN
    ALTER TABLE scripts ADD COLUMN last_reviewed_at TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'last_reviewed_by'
  ) THEN
    ALTER TABLE scripts ADD COLUMN last_reviewed_by UUID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'last_review_comment'
  ) THEN
    ALTER TABLE scripts ADD COLUMN last_review_comment TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'changelog_summary'
  ) THEN
    ALTER TABLE scripts ADD COLUMN changelog_summary TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'rating_count'
  ) THEN
    ALTER TABLE scripts ADD COLUMN rating_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'conversion_rate'
  ) THEN
    ALTER TABLE scripts ADD COLUMN conversion_rate NUMERIC(6,4) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'install_count'
  ) THEN
    ALTER TABLE scripts ADD COLUMN install_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Обновление slug для существующих записей
UPDATE scripts
SET slug = COALESCE(slug, lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')))
WHERE slug IS NULL;

-- Уникальный индекс на slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_scripts_slug ON scripts(slug);

-- Индексы для быстрых фильтров
CREATE INDEX IF NOT EXISTS idx_scripts_pricing_plan ON scripts(pricing_plan);
CREATE INDEX IF NOT EXISTS idx_scripts_visibility ON scripts(visibility);
CREATE INDEX IF NOT EXISTS idx_scripts_status ON scripts(status);
CREATE INDEX IF NOT EXISTS idx_scripts_owner_id ON scripts(owner_id);
CREATE INDEX IF NOT EXISTS idx_scripts_allowed_roles ON scripts USING GIN(allowed_roles);
CREATE INDEX IF NOT EXISTS idx_scripts_allowed_users ON scripts USING GIN(allowed_users);
CREATE INDEX IF NOT EXISTS idx_scripts_tags ON scripts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_scripts_tech_stack ON scripts USING GIN(tech_stack);

-- =============================================
-- 2. Таблица версий
-- =============================================

CREATE TABLE IF NOT EXISTS script_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  changelog TEXT,
  code TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  file_size INTEGER,
  file_type VARCHAR(50) DEFAULT 'text/javascript',
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  published_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(script_id, version)
);

CREATE INDEX IF NOT EXISTS idx_script_versions_script_id ON script_versions(script_id);
CREATE INDEX IF NOT EXISTS idx_script_versions_is_current ON script_versions(script_id, is_current DESC);

-- =============================================
-- 3. Таблица аудита изменений
-- =============================================

CREATE TABLE IF NOT EXISTS script_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  actor_id UUID,
  actor_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  changes JSONB DEFAULT '{}'::jsonb,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_script_audit_script_id ON script_audit_logs(script_id);
CREATE INDEX IF NOT EXISTS idx_script_audit_actor_id ON script_audit_logs(actor_id);

-- =============================================
-- 4. Таблица результатов автоматических проверок
-- =============================================

CREATE TABLE IF NOT EXISTS script_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  version_id UUID REFERENCES script_versions(id) ON DELETE CASCADE,
  check_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_script_checks_script_id ON script_checks(script_id);
CREATE INDEX IF NOT EXISTS idx_script_checks_type ON script_checks(check_type);

-- =============================================
-- 5. Таблица точечного доступа для пользователей
-- =============================================

CREATE TABLE IF NOT EXISTS script_access_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_level VARCHAR(50) NOT NULL DEFAULT 'viewer', -- viewer | tester | editor
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_script_access_unique ON script_access_overrides(script_id, user_id);

-- =============================================
-- 6. Триггеры и служебные функции
-- =============================================

CREATE OR REPLACE FUNCTION update_scripts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_scripts_updated_at ON scripts;
CREATE TRIGGER trg_scripts_updated_at
BEFORE UPDATE ON scripts
FOR EACH ROW EXECUTE FUNCTION update_scripts_updated_at();

-- При создании/обновлении версии корректируем основной скрипт
CREATE OR REPLACE FUNCTION mark_current_script_version()
RETURNS TRIGGER AS $$
DECLARE
  fileSize INTEGER;
BEGIN
  -- Сбрасываем текущую версию
  UPDATE script_versions
  SET is_current = FALSE
  WHERE script_id = NEW.script_id;

  NEW.is_current := TRUE;

  -- Обновляем основную запись скрипта
  fileSize := COALESCE(NEW.file_size, COALESCE(length(NEW.code), 0));

  UPDATE scripts
  SET 
    version = NEW.version,
    code = COALESCE(NEW.code, code),
    changelog_summary = COALESCE(NEW.changelog, changelog_summary),
    metadata = COALESCE(NEW.metadata, metadata),
    updated_at = NOW()
  WHERE id = NEW.script_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_script_versions_mark_current ON script_versions;
CREATE TRIGGER trg_script_versions_mark_current
AFTER INSERT ON script_versions
FOR EACH ROW EXECUTE FUNCTION mark_current_script_version();

COMMIT;
