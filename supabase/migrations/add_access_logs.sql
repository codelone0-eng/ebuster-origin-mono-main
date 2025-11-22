-- Таблица для логирования HTTP запросов (для дашборда Activity)
CREATE TABLE IF NOT EXISTS access_logs (
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
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON access_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_status ON access_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_access_logs_path ON access_logs(path);

-- RLS: только админы могут читать логи
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Политика: только сервис-роль может писать и читать
CREATE POLICY "Service role can manage access_logs" 
  ON access_logs 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Автоматическая очистка старых логов (старше 30 дней)
-- Можно настроить через pg_cron или вручную запускать
CREATE OR REPLACE FUNCTION cleanup_old_access_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM access_logs WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

