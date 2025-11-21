-- Создание дефолтных ролей: user и admin
-- Добавляем поле permissions если его нет

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roles' AND column_name = 'permissions'
  ) THEN
    ALTER TABLE roles ADD COLUMN permissions JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Роль: user (базовая роль по умолчанию)
INSERT INTO roles (
  name,
  display_name,
  description,
  permissions,
  limits,
  price_monthly,
  price_yearly,
  is_active,
  is_subscription,
  display_order
) VALUES (
  'user',
  'Пользователь',
  'Базовая роль для всех зарегистрированных пользователей',
  '["scripts.view", "scripts.download", "marketplace.view", "marketplace.rate", "marketplace.comment", "profile.edit", "support.create_ticket"]'::jsonb,
  '{"scripts": 5, "downloads_per_day": 10, "api_rate_limit": 100, "storage_mb": 100}'::jsonb,
  0,
  0,
  true,
  false,
  0
) ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions,
  limits = EXCLUDED.limits,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;

-- Роль: admin (администратор с полными правами)
INSERT INTO roles (
  name,
  display_name,
  description,
  permissions,
  limits,
  price_monthly,
  price_yearly,
  is_active,
  is_subscription,
  display_order
) VALUES (
  'admin',
  'Администратор',
  'Полный доступ ко всем функциям системы',
  '["scripts.view", "scripts.download", "scripts.download_premium", "scripts.create", "scripts.edit_own", "scripts.delete_own", "scripts.publish", "scripts.mark_premium", "scripts.moderate", "scripts.edit_any", "scripts.delete_any", "visual_builder.access", "visual_builder.save_to_extension", "visual_builder.export_code", "visual_builder.advanced_blocks", "marketplace.view", "marketplace.rate", "marketplace.comment", "marketplace.report", "profile.edit", "profile.avatar", "profile.custom_badge", "profile.referrals", "support.create_ticket", "support.priority", "support.chat", "support.attachments", "admin.access", "admin.users.view", "admin.users.edit", "admin.users.ban", "admin.users.delete", "admin.roles.manage", "admin.roles.assign", "admin.scripts.manage", "admin.tickets.view", "admin.tickets.manage", "admin.monitoring", "admin.settings", "api.access", "api.webhooks", "api.extended_limits", "analytics.view_own", "analytics.view_all", "analytics.export"]'::jsonb,
  '{"scripts": -1, "downloads_per_day": -1, "api_rate_limit": -1, "storage_mb": -1}'::jsonb,
  0,
  0,
  true,
  false,
  999
) ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions,
  limits = EXCLUDED.limits,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;

-- Установить роль 'user' по умолчанию для всех пользователей без роли
-- Проверяем какая таблица используется: users или auth_users
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    UPDATE users 
    SET role_id = (SELECT id FROM roles WHERE name = 'user' LIMIT 1)
    WHERE role_id IS NULL;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'auth_users') THEN
    UPDATE auth_users 
    SET role_id = (SELECT id FROM roles WHERE name = 'user' LIMIT 1)
    WHERE role_id IS NULL;
  END IF;
END $$;
