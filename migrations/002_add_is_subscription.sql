-- Добавляем поле is_subscription в таблицу roles
-- Это поле указывает, является ли роль платной подпиской или просто ролью доступа

ALTER TABLE roles 
ADD COLUMN IF NOT EXISTS is_subscription BOOLEAN DEFAULT false;

-- Обновляем существующие роли
-- Free - не подписка, базовая роль
UPDATE roles SET is_subscription = false WHERE name = 'free';

-- Pro, Premium - это подписки
UPDATE roles SET is_subscription = true WHERE name IN ('pro', 'premium');

-- Admin - не подписка, роль доступа
UPDATE roles SET is_subscription = false WHERE name = 'admin';

-- Комментарий к полю
COMMENT ON COLUMN roles.is_subscription IS 'Указывает, является ли роль платной подпиской (true) или просто ролью доступа (false)';
