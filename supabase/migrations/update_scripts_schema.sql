-- Добавление поля icon для скриптов (текст/emoji или url)
ALTER TABLE public.scripts ADD COLUMN IF NOT EXISTS icon text DEFAULT '⚡';

-- Убедимся, что существуют другие необходимые поля (на случай если их нет)
ALTER TABLE public.scripts ADD COLUMN IF NOT EXISTS pricing_plan text DEFAULT 'free';
ALTER TABLE public.scripts ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public';
ALTER TABLE public.scripts ADD COLUMN IF NOT EXISTS allowed_roles text[] DEFAULT '{}';

