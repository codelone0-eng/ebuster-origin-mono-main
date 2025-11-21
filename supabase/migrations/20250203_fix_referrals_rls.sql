-- Исправление RLS политик для таблицы referrals
-- Эта миграция решает проблему "permission denied for table referrals"

-- Включаем RLS для таблицы referrals (если еще не включено)
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если они есть
DROP POLICY IF EXISTS "Users can view own referral codes" ON referrals;
DROP POLICY IF EXISTS "Users can update own referral codes" ON referrals;
DROP POLICY IF EXISTS "Users can view own referral uses" ON referrals;
DROP POLICY IF EXISTS "Service role bypass RLS" ON referrals;
DROP POLICY IF EXISTS "Allow service role full access" ON referrals;

-- Создаем политику для service role (обход RLS для backend API)
CREATE POLICY "Service role bypass RLS"
  ON referrals
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Создаем политику для пользователей - просмотр своих кодов
CREATE POLICY "Users can view own referral codes"
  ON referrals
  FOR SELECT
  USING (
    (entry_type = 'code' AND referrer_id = auth.uid()) OR
    (entry_type = 'use' AND (referrer_id = auth.uid() OR referred_id = auth.uid()))
  );

-- Создаем политику для пользователей - обновление своих кодов
CREATE POLICY "Users can update own referral codes"
  ON referrals
  FOR UPDATE
  USING (entry_type = 'code' AND referrer_id = auth.uid())
  WITH CHECK (entry_type = 'code' AND referrer_id = auth.uid());

-- Создаем политику для вставки использований кодов
CREATE POLICY "Users can create referral uses"
  ON referrals
  FOR INSERT
  WITH CHECK (entry_type = 'use' AND referred_id = auth.uid());

-- Комментарий
COMMENT ON TABLE referrals IS 'Unified referral system table with RLS policies for service role and users';
