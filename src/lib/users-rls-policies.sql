-- Обновленные RLS политики для таблицы users

-- Удаляем старые политики
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Включаем RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Политика: Пользователи могут видеть только свой профиль
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Политика: Пользователи могут обновлять только свой профиль
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Политика: Админы могут видеть всех пользователей
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Политика: Админы могут обновлять всех пользователей
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Политика: Админы могут удалять пользователей
CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Политика: Система может создавать пользователей (через триггер)
CREATE POLICY "System can create users" ON users
  FOR INSERT WITH CHECK (true);

-- Политика: Пользователи могут создавать только свой профиль
CREATE POLICY "Users can create own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Дополнительные политики для безопасности

-- Политика: Пользователи не могут изменять системные поля
CREATE POLICY "Users cannot modify system fields" ON users
  FOR UPDATE USING (
    auth.uid() = id AND
    -- Запрещаем изменение системных полей
    NOT (OLD.role IS DISTINCT FROM NEW.role) AND
    NOT (OLD.is_banned IS DISTINCT FROM NEW.is_banned) AND
    NOT (OLD.subscription_type IS DISTINCT FROM NEW.subscription_type) AND
    NOT (OLD.created_at IS DISTINCT FROM NEW.created_at)
  );

-- Политика: Только админы могут изменять роли и баны
CREATE POLICY "Only admins can modify roles and bans" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
