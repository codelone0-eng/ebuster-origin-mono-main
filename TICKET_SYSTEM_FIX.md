# Исправление системы тикетов

## Резюме
Исправлена неработоспособность системы тикетов: ошибка 404 при отправке сообщений, проблемы с отображением в админке.

## Проблемы
1. **404 при отправке сообщений**: Клиент отправлял POST на `/api/tickets/:id/messages`, но таблица называлась `ticket_comments` вместо `ticket_messages`
2. **Несоответствие схемы БД**: Контроллер работал с таблицей `ticket_messages` и полем `author_id`, но в БД была `ticket_comments` с `user_id`
3. **Неправильные endpoints в админке**: Использовались старые роуты `/comments` вместо `/messages`

## Решения

### 1. Обновлена схема миграции
**Файл**: `supabase/migrations/20250129_complete_system.sql`
- Переименована таблица `ticket_comments` → `ticket_messages`
- Переименовано поле `user_id` → `author_id`
- Добавлено поле `is_system` для системных сообщений
- Обновлены индексы и RLS политики

### 2. Создана миграция для переименования
**Файл**: `supabase/migrations/20250201_rename_ticket_comments_to_messages.sql`
- Автоматически переименовывает существующую таблицу
- Обновляет структуру полей
- Пересоздаёт индексы и политики

### 3. Исправлен контроллер тикетов
**Файл**: `src/api/tickets-new.controller.ts`
- Исправлена функция `addMessage` для работы с `author_id`
- Исправлена функция `getTicketMessages` для фильтрации внутренних заметок
- Упрощена функция `updateTicket`, удалены неиспользуемые функции `logHistory` и `createSystemMessage`

### 4. Исправлена админка
**Файл**: `src/admin/TicketsManagement.tsx`
- Обновлены endpoints с `/comments` на `/messages`
- Изменена структура запросов для отправки сообщений

## Применение изменений

### Для продакшена (Supabase):
1. Примените миграцию `20250201_rename_ticket_comments_to_messages.sql` в Supabase Dashboard
2. Или выполните SQL напрямую в Supabase SQL Editor

### Для локальной разработки:
```bash
# Применить миграции
supabase db push

# Или вручную выполнить SQL из файлов миграций
```

## Тестирование

1. **Клиентская часть**:
   - Открыть тикет
   - Попытаться отправить сообщение
   - Проверить отображение истории сообщений

2. **Админка**:
   - Открыть управление тикетами
   - Открыть любой тикет
   - Отправить ответ
   - Проверить обновление статуса

3. **API**:
   ```bash
   # Проверить отправку сообщения
   curl -X POST https://api.ebuster.ru/api/tickets/{ticket_id}/messages \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{"message": "Тестовое сообщение", "is_internal": false}'
   ```

## Структура новой схемы

### Таблица: `ticket_messages`
```sql
- id (UUID) - первичный ключ
- ticket_id (UUID) - связь с тикетом
- author_id (UUID) - автор сообщения
- message (TEXT) - текст сообщения
- is_internal (BOOLEAN) - внутренняя заметка
- is_system (BOOLEAN) - системное сообщение
- created_at (TIMESTAMP) - дата создания
```

## Endpoints

- `POST /api/tickets/:id/messages` - Добавить сообщение
- `GET /api/tickets/:id/messages` - Получить сообщения
- `PATCH /api/tickets/:id` - Обновить тикет
- `GET /api/tickets/:id` - Получить тикет

## Примечания
- Все изменения обратно совместимы с существующими данными
- Миграция безопасно переименовывает таблицу без потери данных
- RLS политики обновлены для работы с новой структурой

