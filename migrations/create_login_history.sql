-- Создание таблицы для истории входов
CREATE TABLE IF NOT EXISTS public.login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.auth_users(id) ON DELETE CASCADE,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    location TEXT,
    browser TEXT,
    device_type TEXT,
    os TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON public.login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON public.login_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_success ON public.login_history(success);

-- Добавляем поле token_version в auth_users для инвалидации токенов
ALTER TABLE public.auth_users 
ADD COLUMN IF NOT EXISTS token_version TEXT DEFAULT NULL;

-- Комментарии
COMMENT ON TABLE public.login_history IS 'История входов пользователей в систему';
COMMENT ON COLUMN public.login_history.user_id IS 'ID пользователя';
COMMENT ON COLUMN public.login_history.ip_address IS 'IP адрес входа';
COMMENT ON COLUMN public.login_history.user_agent IS 'User-Agent браузера';
COMMENT ON COLUMN public.login_history.location IS 'Местоположение (город, страна)';
COMMENT ON COLUMN public.login_history.browser IS 'Название браузера';
COMMENT ON COLUMN public.login_history.device_type IS 'Тип устройства (desktop, mobile, tablet)';
COMMENT ON COLUMN public.login_history.os IS 'Операционная система';
COMMENT ON COLUMN public.login_history.success IS 'Успешность попытки входа';
COMMENT ON COLUMN public.login_history.created_at IS 'Дата и время входа';
COMMENT ON COLUMN public.auth_users.token_version IS 'Версия токена для инвалидации всех сессий';
