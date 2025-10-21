-- Добавляем новые поля в таблицу auth_users
ALTER TABLE public.auth_users
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS browser VARCHAR(100),
ADD COLUMN IF NOT EXISTS downloads INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scripts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'inactive';

-- Обновляем существующих пользователей - ставим статус active если email подтвержден
UPDATE public.auth_users
SET status = 'active'
WHERE email_confirmed = true AND (status IS NULL OR status = 'inactive');

-- Обновляем существующих пользователей - ставим статус inactive если email не подтвержден
UPDATE public.auth_users
SET status = 'inactive'
WHERE email_confirmed = false AND (status IS NULL OR status = 'active');

-- Создаем триггер для автоматического обновления статуса при подтверждении email
CREATE OR REPLACE FUNCTION update_user_status_on_email_confirm()
RETURNS TRIGGER AS $$
BEGIN
  -- Если email был подтвержден, ставим статус active
  IF NEW.email_confirmed = true AND OLD.email_confirmed = false THEN
    NEW.status = 'active';
  END IF;
  
  -- Если email был отменен, ставим статус inactive
  IF NEW.email_confirmed = false AND OLD.email_confirmed = true THEN
    NEW.status = 'inactive';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер
DROP TRIGGER IF EXISTS trigger_update_status_on_email_confirm ON public.auth_users;
CREATE TRIGGER trigger_update_status_on_email_confirm
  BEFORE UPDATE ON public.auth_users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_status_on_email_confirm();

-- Создаем функцию для обновления last_active
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для обновления last_active при обновлении last_login_at
DROP TRIGGER IF EXISTS trigger_update_last_active ON public.auth_users;
CREATE TRIGGER trigger_update_last_active
  BEFORE UPDATE OF last_login_at ON public.auth_users
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active();

COMMENT ON COLUMN public.auth_users.location IS 'Местоположение пользователя (город, страна)';
COMMENT ON COLUMN public.auth_users.browser IS 'Браузер пользователя';
COMMENT ON COLUMN public.auth_users.downloads IS 'Количество загрузок скриптов';
COMMENT ON COLUMN public.auth_users.scripts IS 'Количество установленных скриптов';
COMMENT ON COLUMN public.auth_users.last_active IS 'Последняя активность пользователя';
COMMENT ON COLUMN public.auth_users.status IS 'Статус пользователя (active, inactive, banned)';
