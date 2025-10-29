-- Миграция для полной системы: категории, тикеты, рефералы

-- 1. Таблица категорий скриптов
CREATE TABLE IF NOT EXISTS public.script_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для категорий
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.script_categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.script_categories(is_active);

-- Вставка дефолтных категорий
INSERT INTO public.script_categories (name, slug, description, icon, color, display_order) VALUES
('UI', 'ui', 'Улучшения пользовательского интерфейса', '🎨', '#3b82f6', 1),
('Privacy', 'privacy', 'Приватность и безопасность', '🔒', '#8b5cf6', 2),
('Productivity', 'productivity', 'Продуктивность и автоматизация', '⚡', '#10b981', 3),
('General', 'general', 'Общие скрипты', '📦', '#6b7280', 4)
ON CONFLICT (slug) DO NOTHING;

-- 2. Таблица тикетов поддержки
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.auth_users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'new',
    assigned_to UUID REFERENCES public.auth_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Индексы для тикетов
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON public.support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created ON public.support_tickets(created_at DESC);

-- 3. Таблица сообщений к тикетам
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.auth_users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для сообщений
CREATE INDEX IF NOT EXISTS idx_messages_ticket ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.ticket_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_author ON public.ticket_messages(author_id);

-- 4. Добавляем поля для реферальной системы в auth_users (если не существуют)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'auth_users' AND column_name = 'referral_code') THEN
        ALTER TABLE public.auth_users ADD COLUMN referral_code VARCHAR(20) UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'auth_users' AND column_name = 'referred_by') THEN
        ALTER TABLE public.auth_users ADD COLUMN referred_by UUID REFERENCES public.auth_users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'auth_users' AND column_name = 'referral_earnings') THEN
        ALTER TABLE public.auth_users ADD COLUMN referral_earnings INTEGER DEFAULT 0;
    END IF;
END $$;

-- Индексы для реферальной системы
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.auth_users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.auth_users(referred_by);

-- 5. Таблица истории рефералов
CREATE TABLE IF NOT EXISTS public.referral_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.auth_users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES public.auth_users(id) ON DELETE CASCADE,
    reward_amount INTEGER DEFAULT 0,
    reward_type VARCHAR(50) DEFAULT 'bonus',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Индексы для истории рефералов
CREATE INDEX IF NOT EXISTS idx_referral_history_referrer ON public.referral_history(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_history_referred ON public.referral_history(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_history_status ON public.referral_history(status);

-- 6. Функция для генерации уникального реферального кода
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        -- Генерируем 8-символьный код
        code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Проверяем уникальность
        SELECT EXISTS(SELECT 1 FROM public.auth_users WHERE referral_code = code) INTO exists;
        
        EXIT WHEN NOT exists;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- 7. Триггер для автоматической генерации реферального кода при создании пользователя
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_referral_code ON public.auth_users;
CREATE TRIGGER trigger_generate_referral_code
    BEFORE INSERT ON public.auth_users
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_referral_code();

-- 8. Функция для обработки реферала при регистрации
CREATE OR REPLACE FUNCTION process_referral(
    new_user_id UUID,
    referral_code_used TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    referrer_id UUID;
    reward_amount INTEGER := 100; -- Награда за реферала
BEGIN
    -- Находим реферера по коду
    SELECT id INTO referrer_id
    FROM public.auth_users
    WHERE referral_code = referral_code_used;
    
    IF referrer_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Обновляем referred_by у нового пользователя
    UPDATE public.auth_users
    SET referred_by = referrer_id
    WHERE id = new_user_id;
    
    -- Добавляем запись в историю
    INSERT INTO public.referral_history (referrer_id, referred_id, reward_amount, status)
    VALUES (referrer_id, new_user_id, reward_amount, 'completed');
    
    -- Начисляем награду рефереру
    UPDATE public.auth_users
    SET referral_earnings = COALESCE(referral_earnings, 0) + reward_amount
    WHERE id = referrer_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 9. Обновляем существующих пользователей без реферального кода
UPDATE public.auth_users
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- 10. Row Level Security (RLS) политики
ALTER TABLE public.script_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_history ENABLE ROW LEVEL SECURITY;

-- Политики для категорий (все могут читать, только админы могут изменять)
CREATE POLICY "Categories are viewable by everyone" ON public.script_categories
    FOR SELECT USING (true);

CREATE POLICY "Categories are editable by admins" ON public.script_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.auth_users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Политики для тикетов (пользователи видят только свои, админы видят все)
CREATE POLICY "Users can view own tickets" ON public.support_tickets
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.auth_users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can create tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update tickets" ON public.support_tickets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.auth_users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Политики для сообщений
CREATE POLICY "Users can view messages on their tickets" ON public.ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets
            WHERE id = ticket_id AND (
                user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.auth_users
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Users can create messages" ON public.ticket_messages
    FOR INSERT WITH CHECK (author_id = auth.uid());

-- Политики для истории рефералов
CREATE POLICY "Users can view own referral history" ON public.referral_history
    FOR SELECT USING (
        referrer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.auth_users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

COMMENT ON TABLE public.script_categories IS 'Категории скриптов для организации и фильтрации';
COMMENT ON TABLE public.support_tickets IS 'Тикеты технической поддержки';
COMMENT ON TABLE public.ticket_messages IS 'Сообщения к тикетам поддержки';
COMMENT ON TABLE public.referral_history IS 'История реферальных вознаграждений';
