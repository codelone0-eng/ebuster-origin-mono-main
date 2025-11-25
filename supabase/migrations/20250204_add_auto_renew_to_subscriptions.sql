-- Добавление всех недостающих колонок в таблицу subscriptions
-- Миграция безопасна - проверяет наличие колонок перед добавлением

DO $$ 
BEGIN
    -- 1. Добавляем start_date, если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'start_date'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD COLUMN start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        -- Если есть started_at, копируем данные
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'started_at'
        ) THEN
            UPDATE public.subscriptions 
            SET start_date = started_at 
            WHERE start_date IS NULL;
        END IF;
    END IF;

    -- 2. Добавляем end_date, если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'end_date'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;
        
        -- Если есть expires_at, копируем данные
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'expires_at'
        ) THEN
            UPDATE public.subscriptions 
            SET end_date = expires_at 
            WHERE end_date IS NULL;
        END IF;
    END IF;

    -- 3. Добавляем auto_renew
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'auto_renew'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD COLUMN auto_renew BOOLEAN DEFAULT true;
        
        UPDATE public.subscriptions 
        SET auto_renew = true 
        WHERE auto_renew IS NULL;
    END IF;

    -- 4. Добавляем role_id, если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'role_id'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD COLUMN role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL;
        
        CREATE INDEX IF NOT EXISTS idx_subscriptions_role_id ON public.subscriptions(role_id);
    END IF;

    -- 5. Добавляем billing_period, если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'billing_period'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD COLUMN billing_period VARCHAR(20);
    END IF;

    -- 6. Добавляем amount, если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'amount'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD COLUMN amount NUMERIC(10, 2) DEFAULT 0;
    END IF;

    -- 7. Добавляем features, если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'features'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD COLUMN features JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- 8. Добавляем plan, если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'plan'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD COLUMN plan VARCHAR(50);
    END IF;

    -- 9. Добавляем payment_method, если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD COLUMN payment_method VARCHAR(100);
    END IF;

    -- Комментарии к колонкам
    COMMENT ON COLUMN public.subscriptions.start_date IS 'Дата начала подписки';
    COMMENT ON COLUMN public.subscriptions.end_date IS 'Дата окончания подписки';
    COMMENT ON COLUMN public.subscriptions.auto_renew IS 'Автоматическое продление подписки';
    COMMENT ON COLUMN public.subscriptions.role_id IS 'ID роли из таблицы roles';
    COMMENT ON COLUMN public.subscriptions.billing_period IS 'Период оплаты: monthly, yearly, lifetime';
    COMMENT ON COLUMN public.subscriptions.amount IS 'Сумма платежа';
    COMMENT ON COLUMN public.subscriptions.features IS 'Возможности подписки (JSON)';
    COMMENT ON COLUMN public.subscriptions.plan IS 'Название плана (для обратной совместимости)';
    COMMENT ON COLUMN public.subscriptions.payment_method IS 'Способ оплаты';

END $$;

