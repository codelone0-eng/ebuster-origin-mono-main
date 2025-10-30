-- Настройка Supabase Storage для вложений тикетов

-- 1. Создаем bucket для вложений тикетов (если не существует)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ticket-attachments',
  'ticket-attachments',
  false, -- Приватный bucket
  10485760, -- 10MB максимум
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 2. Создаем политики для bucket

-- Политика на чтение: пользователи могут видеть файлы своих тикетов
CREATE POLICY "Users can view attachments on their tickets"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'ticket-attachments' AND
  (
    -- Проверяем, что тикет принадлежит пользователю
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id::text = (storage.foldername(name))[1]
      AND user_id = auth.uid()
    )
    OR
    -- Или пользователь админ
    EXISTS (
      SELECT 1 FROM public.auth_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- Политика на вставку: пользователи могут загружать файлы в свои тикеты
CREATE POLICY "Users can upload attachments to their tickets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'ticket-attachments' AND
  (
    -- Проверяем, что тикет принадлежит пользователю
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id::text = (storage.foldername(name))[1]
      AND user_id = auth.uid()
    )
    OR
    -- Или пользователь админ
    EXISTS (
      SELECT 1 FROM public.auth_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- Политика на удаление: только владелец тикета или админ могут удалять файлы
CREATE POLICY "Users can delete attachments from their tickets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'ticket-attachments' AND
  (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id::text = (storage.foldername(name))[1]
      AND user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.auth_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

COMMENT ON POLICY "Users can view attachments on their tickets" ON storage.objects IS 'Политика для просмотра вложений тикетов';
COMMENT ON POLICY "Users can upload attachments to their tickets" ON storage.objects IS 'Политика для загрузки вложений тикетов';
COMMENT ON POLICY "Users can delete attachments from their tickets" ON storage.objects IS 'Политика для удаления вложений тикетов';

