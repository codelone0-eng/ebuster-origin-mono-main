-- Таблица для логирования HTTP запросов (для дашборда Activity)
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  duration_ms NUMERIC NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip TEXT,
  user_agent TEXT,
  referer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы для быстрых запросов в дашборде
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON public.access_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_status ON public.access_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_access_logs_path ON public.access_logs(path);

-- Даём полные права service_role на таблицу
GRANT ALL ON public.access_logs TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Включаем RLS, но разрешаем service_role делать всё
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Политика: service_role может всё (INSERT, SELECT, UPDATE, DELETE)
CREATE POLICY "service_role_full_access" ON public.access_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Автоматическая очистка старых логов (старше 30 дней)
-- Можно настроить через pg_cron или вручную запускать
CREATE OR REPLACE FUNCTION cleanup_old_access_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM access_logs WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

