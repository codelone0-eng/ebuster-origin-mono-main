-- Функция для автоматического создания записи пользователя при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at,
    last_sign_in,
    is_banned,
    subscription_type
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user',
    NOW(),
    NOW(),
    NOW(),
    false,
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания записи пользователя
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Функция для обновления last_sign_in при входе
CREATE OR REPLACE FUNCTION public.handle_user_signin()
RETURNS trigger AS $$
BEGIN
  UPDATE public.users
  SET 
    last_sign_in = NOW(),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для обновления времени последнего входа
DROP TRIGGER IF EXISTS on_auth_user_signin ON auth.users;
CREATE TRIGGER on_auth_user_signin
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_signin();

-- Функция для обновления профиля пользователя
CREATE OR REPLACE FUNCTION public.update_user_profile(
  user_id UUID,
  full_name TEXT DEFAULT NULL,
  avatar_url TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET 
    full_name = COALESCE(update_user_profile.full_name, users.full_name),
    avatar_url = COALESCE(update_user_profile.avatar_url, users.avatar_url),
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для удаления пользователя (каскадное удаление)
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для удаления записи пользователя при удалении из auth.users
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();
