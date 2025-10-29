-- Добавление поддержки вложений для тикетов

-- Создаем таблицу для вложений
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.ticket_messages(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES public.auth_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_attachments_ticket ON public.ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_attachments_message ON public.ticket_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploader ON public.ticket_attachments(uploaded_by);

-- RLS политики
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments on their tickets" ON public.ticket_attachments
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

CREATE POLICY "Users can upload attachments" ON public.ticket_attachments
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

COMMENT ON TABLE public.ticket_attachments IS 'Вложения к тикетам и сообщениям';

