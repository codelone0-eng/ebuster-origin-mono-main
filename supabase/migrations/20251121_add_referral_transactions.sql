-- Создание таблицы транзакций реферальных выплат
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS referral_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_use_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    purchase_amount DECIMAL(10,2) NOT NULL,
    reward_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending',
    reward_paid_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_transactions_referrer_id ON referral_transactions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_referred_id ON referral_transactions(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_status ON referral_transactions(status);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_created_at ON referral_transactions(created_at DESC);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION set_referral_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_referral_transactions_updated_at ON referral_transactions;
CREATE TRIGGER trg_referral_transactions_updated_at
BEFORE UPDATE ON referral_transactions
FOR EACH ROW
EXECUTE FUNCTION set_referral_transactions_updated_at();
