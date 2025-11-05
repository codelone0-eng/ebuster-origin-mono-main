-- Миграция 002: Обновление существующих ролей
-- Поле is_subscription уже создано в миграции 001
-- Эта миграция нужна только если вы уже создали таблицу roles без поля is_subscription

-- Проверяем и добавляем поле is_subscription если его нет
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roles' AND column_name = 'is_subscription'
  ) THEN
    ALTER TABLE roles ADD COLUMN is_subscription BOOLEAN DEFAULT false;
    CREATE INDEX IF NOT EXISTS idx_roles_is_subscription ON roles(is_subscription);
    COMMENT ON COLUMN roles.is_subscription IS 'Указывает, является ли роль платной подпиской (true) или просто ролью доступа (false)';
    
    -- Обновляем существующие роли
    UPDATE roles SET is_subscription = false WHERE name = 'free';
    UPDATE roles SET is_subscription = true WHERE name IN ('pro', 'premium');
    UPDATE roles SET is_subscription = false WHERE name = 'admin';
  END IF;
END $$;
