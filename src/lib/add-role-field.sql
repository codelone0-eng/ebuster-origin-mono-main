-- Добавляем поле role в таблицу auth_users
ALTER TABLE public.auth_users
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

-- Устанавливаем роль admin для существующих админов
UPDATE public.auth_users
SET role = 'admin'
WHERE email IN ('admin@ebuster.ru', 'codelone0@gmail.com');

-- Создаем индекс для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_auth_users_role ON public.auth_users(role);

-- Комментарий
COMMENT ON COLUMN public.auth_users.role IS 'Роль пользователя: user, admin, moderator';

-- Функция для проверки, является ли пользователь админом
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_role TEXT;
BEGIN
    -- Если user_id не передан, используем текущего пользователя
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Получаем роль пользователя
    SELECT role INTO v_role
    FROM public.auth_users
    WHERE id = v_user_id;
    
    -- Возвращаем true если админ
    RETURN v_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_admin IS 'Проверяет, является ли пользователь администратором';
