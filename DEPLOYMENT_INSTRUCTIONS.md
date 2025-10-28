# Инструкции по деплою обновлений

## 1. Применить миграцию БД

Выполните SQL миграцию на Supabase:

```bash
# Подключитесь к Supabase Dashboard
# SQL Editor -> New Query
# Скопируйте содержимое файла:
supabase/migrations/20250129_complete_system.sql
```

Или через CLI:
```bash
supabase db push
```

## 2. Проверить созданные таблицы

После миграции должны быть созданы:
- `script_categories` - категории скриптов
- `support_tickets` - тикеты поддержки
- `ticket_comments` - комментарии к тикетам
- `referral_history` - история рефералов

И добавлены поля в `auth_users`:
- `referral_code` - уникальный код реферала
- `referred_by` - кто пригласил
- `referral_earnings` - заработок с рефералов

## 3. Тестирование реферальной системы

### Регистрация с реферальным кодом:

```bash
POST https://api.ebuster.ru/api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "New User",
  "referralCode": "ABC12345"
}
```

### Проверка реферального кода пользователя:

```sql
SELECT referral_code, referred_by, referral_earnings 
FROM auth_users 
WHERE email = 'your@email.com';
```

### Проверка истории рефералов:

```sql
SELECT * FROM referral_history 
WHERE referrer_id = 'user-uuid';
```

## 4. Тестирование категорий

### Получить все категории:
```bash
GET https://api.ebuster.ru/api/categories
```

### Создать категорию (требуется админ):
```bash
POST https://api.ebuster.ru/api/categories
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "New Category",
  "slug": "new-category",
  "description": "Description",
  "icon": "🎯",
  "color": "#ff6b6b",
  "display_order": 5
}
```

## 5. Тестирование тикетов

### Создать тикет:
```bash
POST https://api.ebuster.ru/api/tickets
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "subject": "Проблема с расширением",
  "message": "Описание проблемы...",
  "category": "technical",
  "priority": "high"
}
```

### Получить свои тикеты:
```bash
GET https://api.ebuster.ru/api/tickets/user
Authorization: Bearer YOUR_JWT_TOKEN
```

### Получить все тикеты (админ):
```bash
GET https://api.ebuster.ru/api/tickets/all?status=new
Authorization: Bearer YOUR_JWT_TOKEN
```

## 6. Исправленные баги

✅ **Реферальная система**
- Добавлена обработка `referralCode` при регистрации
- Автоматическая генерация уникального кода для каждого пользователя
- Начисление вознаграждений рефереру
- История рефералов в БД

✅ **Прыжок UI при открытии фильтров**
- Добавлен `overflow-y: scroll` в html для постоянного scrollbar
- Предотвращает сдвиг контента при появлении dropdown

✅ **API endpoint профиля**
- Добавлена загрузка `subscription_plan` из таблицы subscriptions
- Поддержка планов 'free', 'pro', 'premium'

✅ **Badge подписки**
- Исправлена проверка плана (добавлен 'pro')
- Динамическое отображение названия плана

✅ **Фильтр "Все категории"**
- Исправлена логика фильтрации
- Теперь показывает все скрипты

✅ **Блокировка UI при поиске**
- Убрана перезагрузка при изменении searchTerm
- Локальная фильтрация без блокировки

✅ **Расширение**
- Удалена вкладка "Магазин"
- Убраны кнопки из Settings
- Синхронизирован дизайн badge

✅ **Редирект в админке**
- Исправлен на lk.ebuster.ru/dashboard

✅ **Иконка "Установленные скрипты"**
- Увеличена до h-5 w-5

## 7. Следующие шаги

Необходимо создать фронтенд компоненты:

1. **Админка с sidebar** - новая навигация
2. **Управление категориями** - CRUD интерфейс
3. **Система тикетов** - интерфейс для ЛК и админки
4. **Вкладка Мониторинг** - детальная статистика

## 8. Проверка работы

После деплоя проверьте:

1. Регистрация с реферальным кодом
2. Отображение badge подписки
3. Фильтр "Все категории" в библиотеке
4. Отсутствие прыжков UI при открытии фильтров
5. API endpoints для категорий и тикетов

## 9. Rollback (если что-то пошло не так)

Для отката миграции:

```sql
-- Удалить созданные таблицы
DROP TABLE IF EXISTS public.referral_history CASCADE;
DROP TABLE IF EXISTS public.ticket_comments CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.script_categories CASCADE;

-- Удалить добавленные поля
ALTER TABLE public.auth_users 
  DROP COLUMN IF EXISTS referral_code,
  DROP COLUMN IF EXISTS referred_by,
  DROP COLUMN IF EXISTS referral_earnings;
```
