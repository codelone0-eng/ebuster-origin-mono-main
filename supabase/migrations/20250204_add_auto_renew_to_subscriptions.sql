-- Добавление колонки auto_renew в таблицу subscriptions
-- Если колонка уже существует, миграция не вызовет ошибку

DO $$ 
BEGIN
    -- Проверяем, существует ли колонка auto_renew
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'auto_renew'
    ) THEN
        -- Добавляем колонку auto_renew
        ALTER TABLE public.subscriptions 
        ADD COLUMN auto_renew BOOLEAN DEFAULT true;
        
        -- Обновляем существующие записи
        UPDATE public.subscriptions 
        SET auto_renew = true 
        WHERE auto_renew IS NULL;
        
        -- Комментарий к колонке
        COMMENT ON COLUMN public.subscriptions.auto_renew IS 'Автоматическое продление подписки';
    END IF;
END $$;

