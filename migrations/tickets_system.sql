-- Полноценная система тикетов для EBUSTER
-- Создано: 2025-10-29

-- 1. Таблица статусов тикетов
CREATE TABLE IF NOT EXISTS ticket_statuses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  color VARCHAR(20) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем стандартные статусы
INSERT INTO ticket_statuses (name, display_name, color, order_index) VALUES
  ('new', 'Новый', 'yellow', 1),
  ('open', 'Открыт', 'blue', 2),
  ('pending_customer', 'Ожидание ответа клиента', 'orange', 3),
  ('pending_internal', 'Ожидание внутреннее', 'purple', 4),
  ('resolved', 'Решен', 'green', 5),
  ('closed', 'Закрыт', 'gray', 6),
  ('cancelled', 'Отменен', 'red', 7)
ON CONFLICT (name) DO NOTHING;

-- 2. Таблица приоритетов
CREATE TABLE IF NOT EXISTS ticket_priorities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  color VARCHAR(20) NOT NULL,
  level INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO ticket_priorities (name, display_name, color, level) VALUES
  ('low', 'Низкий', 'gray', 1),
  ('medium', 'Средний', 'blue', 2),
  ('high', 'Высокий', 'orange', 3),
  ('critical', 'Критический', 'red', 4)
ON CONFLICT (name) DO NOTHING;

-- 3. Таблица групп поддержки
CREATE TABLE IF NOT EXISTS support_teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO support_teams (name, description, email) VALUES
  ('Техподдержка 1-я линия', 'Первичная обработка запросов', 'support@ebuster.ru'),
  ('Техподдержка 2-я линия', 'Сложные технические проблемы', 'tech@ebuster.ru'),
  ('Бухгалтерия', 'Вопросы по оплате и счетам', 'billing@ebuster.ru')
ON CONFLICT (name) DO NOTHING;

-- 4. Таблица членов команд
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES support_teams(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES auth_users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'agent', -- agent, lead, admin
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, user_id)
);

-- 5. Обновленная таблица тикетов
DROP TABLE IF EXISTS tickets CASCADE;
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(20) UNIQUE NOT NULL, -- Например: TKT-2025-00001
  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  
  -- Связи
  customer_id INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
  team_id INTEGER REFERENCES support_teams(id) ON DELETE SET NULL,
  assigned_agent_id INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
  
  -- Статус и приоритет
  status VARCHAR(50) DEFAULT 'new' REFERENCES ticket_statuses(name),
  priority VARCHAR(50) DEFAULT 'medium' REFERENCES ticket_priorities(name),
  
  -- Метаданные
  tags TEXT[], -- Массив тегов
  category VARCHAR(100),
  
  -- Временные метрики
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  first_response_at TIMESTAMP,
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP,
  
  -- SLA
  sla_due_at TIMESTAMP,
  sla_breached BOOLEAN DEFAULT false,
  
  -- Дополнительно
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  
  -- Индексы для быстрого поиска
  CONSTRAINT valid_status CHECK (status IN ('new', 'open', 'pending_customer', 'pending_internal', 'resolved', 'closed', 'cancelled'))
);

CREATE INDEX idx_tickets_customer ON tickets(customer_id);
CREATE INDEX idx_tickets_agent ON tickets(assigned_agent_id);
CREATE INDEX idx_tickets_team ON tickets(team_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created ON tickets(created_at DESC);
CREATE INDEX idx_tickets_number ON tickets(ticket_number);

-- 6. Таблица сообщений/комментариев
CREATE TABLE IF NOT EXISTS ticket_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  author_id INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
  
  -- Контент
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Внутренняя заметка (видна только агентам)
  is_system BOOLEAN DEFAULT false, -- Системное сообщение (смена статуса и т.д.)
  
  -- Метаданные
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  edited BOOLEAN DEFAULT false,
  
  -- Связи
  reply_to_id INTEGER REFERENCES ticket_messages(id) ON DELETE SET NULL
);

CREATE INDEX idx_messages_ticket ON ticket_messages(ticket_id, created_at);
CREATE INDEX idx_messages_author ON ticket_messages(author_id);

-- 7. Таблица вложений
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  message_id INTEGER REFERENCES ticket_messages(id) ON DELETE CASCADE,
  
  -- Файл
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  
  -- Метаданные
  uploaded_by INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_ticket ON ticket_attachments(ticket_id);
CREATE INDEX idx_attachments_message ON ticket_attachments(message_id);

-- 8. Таблица истории изменений
CREATE TABLE IF NOT EXISTS ticket_history (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
  
  -- Изменение
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  
  -- Метаданные
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_history_ticket ON ticket_history(ticket_id, created_at DESC);

-- 9. Таблица связанных тикетов
CREATE TABLE IF NOT EXISTS ticket_relations (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  related_ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  relation_type VARCHAR(50) NOT NULL, -- duplicate, depends_on, related, blocks
  created_by INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ticket_id, related_ticket_id, relation_type)
);

-- 10. Таблица шаблонов ответов
CREATE TABLE IF NOT EXISTS ticket_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  subject VARCHAR(500),
  content TEXT NOT NULL,
  team_id INTEGER REFERENCES support_teams(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Функция для генерации номера тикета
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part VARCHAR(4);
  sequence_part VARCHAR(5);
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT LPAD((COUNT(*) + 1)::TEXT, 5, '0')
  INTO sequence_part
  FROM tickets
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  NEW.ticket_number := 'TKT-' || year_part || '-' || sequence_part;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматической генерации номера
CREATE TRIGGER set_ticket_number
BEFORE INSERT ON tickets
FOR EACH ROW
WHEN (NEW.ticket_number IS NULL)
EXECUTE FUNCTION generate_ticket_number();

-- 12. Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON ticket_messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 13. RLS (Row Level Security) политики
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Клиенты видят только свои тикеты
CREATE POLICY customer_view_own_tickets ON tickets
  FOR SELECT
  USING (customer_id = current_setting('app.current_user_id')::INTEGER);

-- Агенты видят тикеты своих команд
CREATE POLICY agent_view_team_tickets ON tickets
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = current_setting('app.current_user_id')::INTEGER
    )
  );

-- Админы видят все
CREATE POLICY admin_view_all_tickets ON tickets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth_users 
      WHERE id = current_setting('app.current_user_id')::INTEGER 
      AND role = 'admin'
    )
  );
