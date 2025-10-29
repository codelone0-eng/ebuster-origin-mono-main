-- Переименование таблицы ticket_comments в ticket_messages
-- и изменение структуры для совместимости с новой системой

DO $$
BEGIN
    -- Проверяем существует ли таблица ticket_messages
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ticket_messages'
    ) THEN
        -- Таблица уже существует, обновляем её структуру
        RAISE NOTICE 'Table ticket_messages already exists, updating structure...';
        
        -- Переименовываем столбец user_id в author_id если нужно
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'ticket_messages' 
            AND column_name = 'user_id'
        ) THEN
            ALTER TABLE public.ticket_messages RENAME COLUMN user_id TO author_id;
            RAISE NOTICE 'Renamed column user_id to author_id';
        END IF;
        
        -- Добавляем столбец is_system если его нет
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'ticket_messages' 
            AND column_name = 'is_system'
        ) THEN
            ALTER TABLE public.ticket_messages ADD COLUMN is_system BOOLEAN DEFAULT false;
            RAISE NOTICE 'Added column is_system';
        END IF;
        
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ticket_comments'
    ) THEN
        -- Старая таблица существует, переименовываем
        RAISE NOTICE 'Renaming ticket_comments to ticket_messages...';
        
        -- Переименовываем столбец user_id в author_id если нужно
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'ticket_comments' 
            AND column_name = 'user_id'
        ) THEN
            ALTER TABLE public.ticket_comments RENAME COLUMN user_id TO author_id;
        END IF;
        
        -- Добавляем столбец is_system если его нет
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'ticket_comments' 
            AND column_name = 'is_system'
        ) THEN
            ALTER TABLE public.ticket_comments ADD COLUMN is_system BOOLEAN DEFAULT false;
        END IF;
        
        -- Переименовываем таблицу
        ALTER TABLE public.ticket_comments RENAME TO ticket_messages;
        
        -- Пересоздаем индексы
        DROP INDEX IF EXISTS public.idx_comments_ticket;
        DROP INDEX IF EXISTS public.idx_comments_created;
        
    ELSE
        -- Ни одна таблица не существует, создаём новую
        RAISE NOTICE 'Creating new ticket_messages table...';
    END IF;
    
    -- Создаём индексы (если их ещё нет)
    CREATE INDEX IF NOT EXISTS idx_messages_ticket ON public.ticket_messages(ticket_id);
    CREATE INDEX IF NOT EXISTS idx_messages_created ON public.ticket_messages(created_at);
    CREATE INDEX IF NOT EXISTS idx_messages_author ON public.ticket_messages(author_id);
    
END $$;

-- Обновляем RLS политики
DROP POLICY IF EXISTS "Users can view comments on their tickets" ON public.ticket_messages;
DROP POLICY IF EXISTS "Users can create comments" ON public.ticket_messages;

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

-- Обновляем комментарии
COMMENT ON TABLE public.ticket_messages IS 'Сообщения к тикетам поддержки';

