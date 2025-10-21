-- Создание таблицы подписок
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.auth_users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'premium', 'pro', 'enterprise')),
    status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'trial')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_renew BOOLEAN DEFAULT true,
    payment_method TEXT,
    amount NUMERIC(10, 2),
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON public.subscriptions(end_date);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- Функция для автоматического истечения подписок
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void AS $$
BEGIN
    UPDATE public.subscriptions
    SET status = 'expired'
    WHERE status = 'active'
    AND end_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Комментарии к таблице и столбцам
COMMENT ON TABLE public.subscriptions IS 'Таблица подписок пользователей';
COMMENT ON COLUMN public.subscriptions.id IS 'Уникальный идентификатор подписки';
COMMENT ON COLUMN public.subscriptions.user_id IS 'ID пользователя';
COMMENT ON COLUMN public.subscriptions.plan IS 'Тип подписки: free, premium, pro, enterprise';
COMMENT ON COLUMN public.subscriptions.status IS 'Статус подписки: active, expired, cancelled, trial';
COMMENT ON COLUMN public.subscriptions.start_date IS 'Дата начала подписки';
COMMENT ON COLUMN public.subscriptions.end_date IS 'Дата окончания подписки';
COMMENT ON COLUMN public.subscriptions.auto_renew IS 'Автоматическое продление';
COMMENT ON COLUMN public.subscriptions.payment_method IS 'Способ оплаты';
COMMENT ON COLUMN public.subscriptions.amount IS 'Стоимость подписки в месяц';
COMMENT ON COLUMN public.subscriptions.features IS 'Список функций подписки (JSON)';

-- RLS (Row Level Security) политики
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Политика: Пользователи могут видеть только свои подписки
CREATE POLICY "Users can view own subscriptions"
    ON public.subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Политика: Админы могут видеть все подписки
-- Примечание: Замените условие проверки админа на ваше (например, проверка email или отдельная таблица admins)
CREATE POLICY "Admins can view all subscriptions"
    ON public.subscriptions
    FOR SELECT
    USING (
        -- Вариант 1: Проверка по email админа
        auth.email() IN (
            SELECT email FROM public.auth_users 
            WHERE email IN ('admin@ebuster.ru', 'codelone0@gmail.com')
        )
        -- Вариант 2: Если у вас есть таблица admins
        -- OR EXISTS (
        --     SELECT 1 FROM public.admins
        --     WHERE user_id = auth.uid()
        -- )
    );

-- Политика: Только админы могут создавать подписки
CREATE POLICY "Only admins can create subscriptions"
    ON public.subscriptions
    FOR INSERT
    WITH CHECK (
        auth.email() IN (
            SELECT email FROM public.auth_users 
            WHERE email IN ('admin@ebuster.ru', 'codelone0@gmail.com')
        )
    );

-- Политика: Только админы могут обновлять подписки
CREATE POLICY "Only admins can update subscriptions"
    ON public.subscriptions
    FOR UPDATE
    USING (
        auth.email() IN (
            SELECT email FROM public.auth_users 
            WHERE email IN ('admin@ebuster.ru', 'codelone0@gmail.com')
        )
    );

-- Политика: Только админы могут удалять подписки
CREATE POLICY "Only admins can delete subscriptions"
    ON public.subscriptions
    FOR DELETE
    USING (
        auth.email() IN (
            SELECT email FROM public.auth_users 
            WHERE email IN ('admin@ebuster.ru', 'codelone0@gmail.com')
        )
    );

-- Функция для проверки доступа к premium контенту
CREATE OR REPLACE FUNCTION check_premium_access(
    p_user_id UUID,
    p_required_plan TEXT DEFAULT 'premium'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_plan TEXT;
    v_plan_levels JSONB := '{"free": 0, "premium": 1, "pro": 2, "enterprise": 3}'::jsonb;
    v_current_level INTEGER;
    v_required_level INTEGER;
BEGIN
    -- Получаем активную подписку пользователя
    SELECT plan INTO v_user_plan
    FROM public.subscriptions
    WHERE user_id = p_user_id
    AND status = 'active'
    AND end_date >= NOW()
    ORDER BY end_date DESC
    LIMIT 1;

    -- Если подписки нет, считаем что у пользователя free план
    IF v_user_plan IS NULL THEN
        v_user_plan := 'free';
    END IF;

    -- Получаем уровни планов
    v_current_level := (v_plan_levels->>v_user_plan)::INTEGER;
    v_required_level := (v_plan_levels->>p_required_plan)::INTEGER;

    -- Проверяем доступ
    RETURN v_current_level >= v_required_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Комментарий к функции
COMMENT ON FUNCTION check_premium_access IS 'Проверяет, имеет ли пользователь доступ к premium контенту';

-- Создаем задание для автоматического истечения подписок (pg_cron)
-- Примечание: требуется расширение pg_cron
-- SELECT cron.schedule('expire-subscriptions', '0 0 * * *', 'SELECT expire_subscriptions()');
