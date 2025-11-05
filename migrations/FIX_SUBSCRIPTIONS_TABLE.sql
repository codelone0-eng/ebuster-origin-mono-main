-- ============================================
-- ИСПРАВЛЕНИЕ ТАБЛИЦЫ SUBSCRIPTIONS
-- Добавляем недостающие поля которые использует API
-- ============================================

-- 1. Добавляем поле amount (сумма платежа)
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2) DEFAULT 0;

-- 2. Добавляем поле plan (название плана - для обратной совместимости)
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS plan VARCHAR(50);

-- 3. Добавляем поле features (возможности - для обратной совместимости)
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

-- 4. Обновляем существующие подписки - заполняем amount из роли
UPDATE subscriptions s
SET amount = r.price_monthly
FROM roles r
WHERE s.role_id = r.id AND s.amount = 0;

-- 5. Обновляем plan из роли
UPDATE subscriptions s
SET plan = r.name
FROM roles r
WHERE s.role_id = r.id AND s.plan IS NULL;

-- 6. Обновляем features из роли
UPDATE subscriptions s
SET features = r.features
FROM roles r
WHERE s.role_id = r.id AND s.features = '[]'::jsonb;

-- 7. Комментарии
COMMENT ON COLUMN subscriptions.amount IS 'Сумма платежа в рублях';
COMMENT ON COLUMN subscriptions.plan IS 'Название плана (дубликат role.name для обратной совместимости)';
COMMENT ON COLUMN subscriptions.features IS 'Возможности (дубликат role.features для обратной совместимости)';

-- 8. Проверка результата
SELECT 
  'subscriptions columns after fix:' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- 9. Проверка данных
SELECT 
  'subscriptions data:' as info,
  s.id,
  s.user_id,
  r.name as role_name,
  s.amount,
  s.plan,
  s.status
FROM subscriptions s
LEFT JOIN roles r ON r.id = s.role_id;
