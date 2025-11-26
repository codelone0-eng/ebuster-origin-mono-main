# Потоки данных EBUSTER

## Общая схема

```
Frontend (React)
    ↓
API Server (Express)
    ↓
Supabase (PostgreSQL)
    ↓
ClickHouse (Analytics)
```

---

## Аутентификация

### Регистрация

**Поток:**
```
1. LandingApp (/register)
   ↓
2. POST /api/auth/register
   Body: { email, password, full_name }
   ↓
3. Backend (auth.controller.ts)
   - Валидация данных
   - Проверка существования email
   - Хеширование пароля (bcrypt)
   - Создание пользователя в Supabase
   ↓
4. Supabase: INSERT INTO users
   - email
   - password_hash
   - full_name
   - referral_code (автогенерация)
   - created_at
   ↓
5. POST /api/user/upsert
   Body: { id, email, full_name }
   ↓
6. Supabase: INSERT/UPDATE users
   ↓
7. Генерация JWT токена
   ↓
8. Отправка email подтверждения
   POST /api/email/send-confirmation
   ↓
9. Response: { success: true, token, user }
   ↓
10. Frontend
    - Сохранение токена в localStorage ('ebuster_token')
    - Сохранение user в AuthContext
    - Редирект на /dashboard
```

**Данные:**
- Input: `{ email, password, full_name }`
- Output: `{ success: true, token: "jwt_token", user: { id, email, full_name } }`
- DB: `users` table

### Вход

**Поток:**
```
1. LandingApp (/login)
   ↓
2. POST /api/auth/login
   Body: { email, password }
   ↓
3. Backend (auth.controller.ts)
   - Поиск пользователя по email
   - Проверка пароля (bcrypt.compare)
   - Проверка бана (is_banned, ban_expires_at)
   - Проверка email_confirmed
   ↓
4. Supabase: SELECT FROM users WHERE email = ?
   ↓
5. Генерация JWT токена
   ↓
6. GET /api/user/profile?email={email}
   ↓
7. Supabase: SELECT FROM users WHERE email = ?
   ↓
8. Response: { success: true, token, user, profile }
   ↓
9. Frontend
    - Сохранение токена
    - Сохранение user в AuthContext
    - Редирект на /dashboard
```

**Данные:**
- Input: `{ email, password }`
- Output: `{ success: true, token: "jwt_token", user: {...}, profile: {...} }`
- DB: `users` table

### Проверка токена

**Поток:**
```
1. Frontend (любая страница)
   ↓
2. GET /api/auth/verify
   Headers: { Authorization: "Bearer {token}" }
   ↓
3. Backend (auth.middleware.ts)
   - Декодирование JWT
   - Проверка валидности
   - Проверка token_version в users
   ↓
4. Response: { success: true, user: {...} }
   или { success: false, error: "Invalid token" }
   ↓
5. Frontend
   - Обновление AuthContext
   - Редирект на /login если невалидный
```

---

## Профиль пользователя

### Загрузка профиля

**Поток:**
```
1. DashboardApp (Dashboard.tsx)
   useEffect(() => loadUserProfile())
   ↓
2. GET /api/user/profile?email={email}
   Headers: { Authorization: "Bearer {token}" }
   ↓
3. Backend (user.controller.ts)
   - Проверка токена
   - Поиск пользователя
   ↓
4. Supabase: SELECT FROM users WHERE email = ?
   ↓
5. Response: {
     success: true,
     data: {
       id, email, full_name, avatar_url,
       subscription_plan, two_factor_enabled,
       ...
     }
   }
   ↓
6. Frontend
   - Обновление state user
   - Отображение в UI
```

**Данные:**
- Input: `email` (query param)
- Output: `{ success: true, data: { id, email, full_name, avatar_url, ... } }`
- DB: `users` table

### Обновление профиля

**Поток:**
```
1. DashboardApp (handleSaveProfile)
   ↓
2. POST /api/user/upsert
   Headers: { Authorization: "Bearer {token}" }
   Body: { id, email, full_name, avatar_url }
   ↓
3. Backend (user.controller.ts)
   - Проверка токена
   - Валидация данных
   ↓
4. Supabase: INSERT INTO users ... ON CONFLICT (email) DO UPDATE ...
   ↓
5. Response: { success: true, data: {...} }
   ↓
6. Frontend
   - Обновление state
   - Toast уведомление
```

**Данные:**
- Input: `{ id, email, full_name, avatar_url }`
- Output: `{ success: true, data: {...} }`
- DB: `users` table

---

## Скрипты

### Получение списка скриптов

**Поток:**
```
1. DashboardApp (ScriptsList.tsx)
   useEffect(() => fetchScripts())
   ↓
2. GET /api/scripts/public?page=1&limit=20&category=&search=
   Headers: { Authorization: "Bearer {token}" }
   ↓
3. Backend (scripts.controller.ts)
   - Проверка токена
   - Построение запроса
   ↓
4. Supabase: 
   SELECT * FROM scripts 
   WHERE is_public = true AND status = 'active'
   ORDER BY downloads DESC
   LIMIT 20 OFFSET 0
   ↓
5. Для каждого скрипта:
   - Проверка установки (user_scripts)
   - Получение рейтинга
   ↓
6. Response: {
     success: true,
     data: [
       {
         id, name, description, category,
         author_name, version, downloads,
         rating, is_installed, ...
       },
       ...
     ],
     pagination: { page, limit, total }
   }
   ↓
7. Frontend
   - Обновление state scripts
   - Отображение в UI
```

**Данные:**
- Input: `{ page, limit, category, search }` (query params)
- Output: `{ success: true, data: [...], pagination: {...} }`
- DB: `scripts`, `user_scripts` tables

### Установка скрипта

**Поток:**
```
1. ScriptsList (handleInstall)
   ↓
2. POST /api/scripts/user/install/{scriptId}
   Headers: { Authorization: "Bearer {token}" }
   ↓
3. Backend (scripts.controller.ts)
   - Проверка токена
   - Получение user_id из токена
   - Проверка существования скрипта
   - Проверка дубликата установки
   ↓
4. Supabase: 
   INSERT INTO user_scripts (user_id, script_id, is_active, installed_at)
   VALUES (?, ?, true, NOW())
   ON CONFLICT (user_id, script_id) DO NOTHING
   ↓
5. Supabase:
   UPDATE scripts 
   SET downloads = downloads + 1,
       last_downloaded_at = NOW()
   WHERE id = ?
   ↓
6. Response: { success: true, message: "Script installed" }
   ↓
7. Frontend
   - Обновление UI (is_installed = true)
   - Toast уведомление
```

**Данные:**
- Input: `scriptId` (URL param)
- Output: `{ success: true, message: "..." }`
- DB: `user_scripts`, `scripts` tables

### Удаление скрипта

**Поток:**
```
1. ScriptsList (handleUninstall)
   ↓
2. POST /api/scripts/user/uninstall/{scriptId}
   Headers: { Authorization: "Bearer {token}" }
   ↓
3. Backend (scripts.controller.ts)
   - Проверка токена
   - Получение user_id
   ↓
4. Supabase:
   DELETE FROM user_scripts
   WHERE user_id = ? AND script_id = ?
   ↓
5. Response: { success: true, message: "Script uninstalled" }
   ↓
6. Frontend
   - Обновление UI (is_installed = false)
   - Toast уведомление
```

**Данные:**
- Input: `scriptId` (URL param)
- Output: `{ success: true, message: "..." }`
- DB: `user_scripts` table

### Оценка скрипта

**Поток:**
```
1. ScriptsList (handleRate)
   ↓
2. POST /api/scripts/public/{scriptId}/rate
   Headers: { Authorization: "Bearer {token}" }
   Body: { rating: 5 }
   ↓
3. Backend (scripts.controller.ts)
   - Проверка токена
   - Валидация rating (1-5)
   ↓
4. Supabase:
   INSERT INTO script_ratings (user_id, script_id, rating)
   VALUES (?, ?, ?)
   ON CONFLICT (user_id, script_id) DO UPDATE
   SET rating = EXCLUDED.rating
   ↓
5. Supabase:
   UPDATE scripts
   SET rating = (
     SELECT AVG(rating) FROM script_ratings WHERE script_id = ?
   )
   WHERE id = ?
   ↓
6. Response: { success: true, new_rating: 4.5 }
   ↓
7. Frontend
   - Обновление UI (rating)
   - Toast уведомление
```

**Данные:**
- Input: `{ rating: 1-5 }`
- Output: `{ success: true, new_rating: number }`
- DB: `script_ratings`, `scripts` tables

---

## Тикеты поддержки

### Создание тикета

**Поток:**
```
1. TicketsSystem (CreateTicketModal)
   ↓
2. POST /api/tickets
   Headers: { Authorization: "Bearer {token}" }
   Body: { subject, message, priority, category }
   ↓
3. Backend (tickets-new.controller.ts)
   - Проверка токена
   - Получение user_id
   - Генерация ticket_number
   ↓
4. Supabase:
   INSERT INTO tickets (
     ticket_number, user_id, user_email,
     subject, message, priority, status, category
   )
   VALUES (?, ?, ?, ?, ?, 'medium', 'open', ?)
   RETURNING *
   ↓
5. Supabase:
   INSERT INTO ticket_messages (
     ticket_id, user_id, is_admin, message
   )
   VALUES (?, ?, false, ?)
   ↓
6. Response: { success: true, data: { id, ticket_number, ... } }
   ↓
7. Frontend
   - Закрытие модалки
   - Редирект на /ticket/{id}
   - Toast уведомление
```

**Данные:**
- Input: `{ subject, message, priority, category }`
- Output: `{ success: true, data: { id, ticket_number, ... } }`
- DB: `tickets`, `ticket_messages` tables

### Получение списка тикетов

**Поток:**
```
1. TicketsSystem (useEffect)
   ↓
2. GET /api/tickets?status=&page=1&limit=20
   Headers: { Authorization: "Bearer {token}" }
   ↓
3. Backend (tickets-new.controller.ts)
   - Проверка токена
   - Получение user_id
   - Фильтрация по user_id
   ↓
4. Supabase:
   SELECT * FROM tickets
   WHERE user_id = ?
   AND (status = ? OR ? IS NULL)
   ORDER BY created_at DESC
   LIMIT 20 OFFSET 0
   ↓
5. Для каждого тикета:
   - Подсчет сообщений
   - Получение последнего сообщения
   ↓
6. Response: {
     success: true,
     data: [
       {
         id, ticket_number, subject, status,
         priority, created_at, message_count, ...
       },
       ...
     ],
     pagination: {...}
   }
   ↓
7. Frontend
   - Обновление state tickets
   - Отображение в UI
```

**Данные:**
- Input: `{ status, page, limit }` (query params)
- Output: `{ success: true, data: [...], pagination: {...} }`
- DB: `tickets`, `ticket_messages` tables

### Отправка сообщения в тикет

**Поток:**
```
1. TicketView (handleSendMessage)
   ↓
2. POST /api/tickets/{ticketId}/messages
   Headers: { Authorization: "Bearer {token}" }
   Body: { message, attachments: [] }
   ↓
3. Backend (tickets-new.controller.ts)
   - Проверка токена
   - Проверка прав доступа к тикету
   - Валидация данных
   ↓
4. Supabase:
   INSERT INTO ticket_messages (
     ticket_id, user_id, is_admin, message, attachments
   )
   VALUES (?, ?, false, ?, ?)
   ↓
5. Supabase:
   UPDATE tickets
   SET updated_at = NOW()
   WHERE id = ?
   ↓
6. Response: { success: true, data: { id, message, created_at, ... } }
   ↓
7. Frontend
   - Добавление сообщения в UI
   - Обновление updated_at тикета
```

**Данные:**
- Input: `{ message, attachments: [] }`
- Output: `{ success: true, data: {...} }`
- DB: `ticket_messages`, `tickets` tables

---

## Реферальная программа

### Получение реферального кода

**Поток:**
```
1. ReferralProgram (useEffect)
   ↓
2. GET /api/referral/user/{userId}/code
   Headers: { Authorization: "Bearer {token}" }
   ↓
3. Backend (referral.controller.ts)
   - Проверка токена
   - Получение user_id
   ↓
4. Supabase:
   SELECT referral_code FROM users WHERE id = ?
   ↓
5. Supabase:
   SELECT * FROM referrals
   WHERE referrer_id = ? AND entry_type = 'code'
   LIMIT 1
   ↓
6. Если нет кода:
   - Создание нового реферального кода
   ↓
7. Response: {
     success: true,
     data: {
       code: "ABC123",
       discount_type: "percentage",
       discount_value: 10,
       ...
     }
   }
   ↓
8. Frontend
   - Отображение кода
   - Кнопка копирования
```

**Данные:**
- Input: `userId` (URL param)
- Output: `{ success: true, data: { code, discount_type, discount_value, ... } }`
- DB: `users`, `referrals` tables

### Получение статистики

**Поток:**
```
1. ReferralProgram (useEffect)
   ↓
2. GET /api/referral/user/{userId}/stats
   Headers: { Authorization: "Bearer {token}" }
   ↓
3. Backend (referral.controller.ts)
   - Проверка токена
   ↓
4. Supabase:
   SELECT COUNT(*) as total_referrals,
          SUM(CASE WHEN reward_paid = true THEN reward_value ELSE 0 END) as total_earned,
          SUM(CASE WHEN reward_paid = false THEN reward_value ELSE 0 END) as pending_earnings
   FROM referrals
   WHERE referrer_id = ? AND entry_type = 'use'
   ↓
5. Response: {
     success: true,
     data: {
       total_referrals: 10,
       total_earned: 500.00,
       pending_earnings: 200.00
     }
   }
   ↓
6. Frontend
   - Отображение статистики
```

**Данные:**
- Input: `userId` (URL param)
- Output: `{ success: true, data: { total_referrals, total_earned, pending_earnings } }`
- DB: `referrals` table

---

## API ключи

### Создание API ключа

**Поток:**
```
1. ApiKeysManagement (handleCreate)
   ↓
2. POST /api/user/api-keys
   Headers: { Authorization: "Bearer {token}" }
   Body: { name, permissions: ['read', 'write'] }
   ↓
3. Backend (apikeys.controller.ts)
   - Проверка токена
   - Генерация ключа (crypto.randomBytes)
   - Хеширование ключа (bcrypt)
   - Сохранение префикса
   ↓
4. Supabase:
   INSERT INTO api_keys (
     user_id, key_hash, key_prefix, name, permissions
   )
   VALUES (?, ?, ?, ?, ?)
   RETURNING *
   ↓
5. Response: {
     success: true,
     data: {
       id, name, key_prefix,
       key: "eb_xxxxx...", // Только один раз!
       permissions, created_at
     }
   }
   ↓
6. Frontend
   - Отображение ключа (только один раз)
   - Сохранение в state
   - Кнопка копирования
```

**Данные:**
- Input: `{ name, permissions: [] }`
- Output: `{ success: true, data: { id, name, key, key_prefix, ... } }`
- DB: `api_keys` table

### Использование API ключа

**Поток:**
```
1. External Client
   ↓
2. GET /api/scripts/public
   Headers: { Authorization: "Bearer {api_key}" }
   ↓
3. Backend (auth.middleware.ts)
   - Проверка формата ключа
   - Поиск по key_prefix
   - Проверка key_hash (bcrypt.compare)
   - Проверка is_active
   - Проверка expires_at
   ↓
4. Supabase:
   SELECT * FROM api_keys
   WHERE key_prefix = ? AND is_active = true
   ↓
5. Проверка прав доступа (permissions)
   ↓
6. Обновление last_used_at
   ↓
7. Продолжение обработки запроса
```

**Данные:**
- Input: `api_key` (Header)
- Output: зависит от endpoint
- DB: `api_keys` table

---

## Подписки

### Получение текущей подписки

**Поток:**
```
1. DashboardApp (useSubscription hook)
   ↓
2. GET /api/subscriptions/my
   Headers: { Authorization: "Bearer {token}" }
   ↓
3. Backend (subscriptions.controller.ts)
   - Проверка токена
   - Получение user_id
   ↓
4. Supabase:
   SELECT s.*, r.name as role_name, r.display_name
   FROM subscriptions s
   LEFT JOIN roles r ON s.role_id = r.id
   WHERE s.user_id = ? AND s.status = 'active'
   ORDER BY s.created_at DESC
   LIMIT 1
   ↓
5. Response: {
     success: true,
     data: {
       id, plan, status, started_at, expires_at,
       role: { name, display_name, permissions, ... }
     }
   }
   ↓
6. Frontend
   - Обновление subscription state
   - Отображение в UI
```

**Данные:**
- Input: нет (user_id из токена)
- Output: `{ success: true, data: { id, plan, status, role, ... } }`
- DB: `subscriptions`, `roles` tables

---

## История входов

### Получение истории

**Поток:**
```
1. LoginHistory (useEffect)
   ↓
2. GET /api/user/login-history
   Headers: { Authorization: "Bearer {token}" }
   ↓
3. Backend (user.controller.ts)
   - Проверка токена
   - Получение user_id
   ↓
4. Supabase:
   SELECT * FROM login_history
   WHERE user_id = ?
   ORDER BY created_at DESC
   LIMIT 50
   ↓
5. Response: {
     success: true,
     data: [
       {
         id, ip_address, user_agent, location,
         browser, success, created_at
       },
       ...
     ]
   }
   ↓
6. Frontend
   - Отображение в таблице
```

**Данные:**
- Input: нет (user_id из токена)
- Output: `{ success: true, data: [...] }`
- DB: `login_history` table

### Выход со всех устройств

**Поток:**
```
1. LoginHistory (handleLogoutAll)
   ↓
2. POST /api/user/logout-all-devices
   Headers: { Authorization: "Bearer {token}" }
   ↓
3. Backend (user.controller.ts)
   - Проверка токена
   - Получение user_id
   ↓
4. Supabase:
   UPDATE users
   SET token_version = token_version + 1
   WHERE id = ?
   ↓
5. Response: { success: true, message: "Logged out from all devices" }
   ↓
6. Frontend
   - Удаление токена из localStorage
   - Редирект на /login
```

**Данные:**
- Input: нет
- Output: `{ success: true, message: "..." }`
- DB: `users` table

---

## ClickHouse (аналитика)

### Логирование запросов

**Поток:**
```
1. Любой API запрос
   ↓
2. clickhouse.middleware.ts
   - Извлечение данных запроса
   - user_id из токена (если есть)
   - IP адрес
   - User-Agent
   - Path, method, status_code
   - Duration
   ↓
3. ClickHouse:
   INSERT INTO access_logs (
     timestamp, method, path, status_code,
     duration_ms, user_id, ip, user_agent, referer
   )
   VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, ?)
   ↓
4. Продолжение обработки запроса
```

**Данные:**
- Input: данные из request/response
- Output: нет (асинхронная запись)
- DB: ClickHouse `access_logs` table

---

## Обработка ошибок

### Типичные ошибки

**401 Unauthorized:**
- Невалидный/отсутствующий токен
- Истекший токен
- Неверный token_version

**403 Forbidden:**
- Недостаточно прав
- Пользователь забанен

**404 Not Found:**
- Ресурс не найден
- Неверный ID

**422 Validation Error:**
- Невалидные данные
- Отсутствуют обязательные поля

**500 Internal Server Error:**
- Ошибка базы данных
- Неожиданная ошибка сервера

### Обработка на фронтенде

```typescript
try {
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 401) {
      // Редирект на /login
      signOut();
      navigate('/login');
    } else {
      toast({
        title: "Ошибка",
        description: data.error || "Произошла ошибка",
        variant: "destructive"
      });
    }
  }
  
  return data;
} catch (error) {
  toast({
    title: "Ошибка сети",
    description: "Не удалось выполнить запрос",
    variant: "destructive"
  });
}
```

---

## Кэширование

### React Query

**Использование:**
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['scripts', page, category],
  queryFn: () => fetchScripts(page, category),
  staleTime: 5 * 60 * 1000, // 5 минут
  cacheTime: 10 * 60 * 1000, // 10 минут
});
```

**Преимущества:**
- Автоматическое кэширование
- Фоновое обновление
- Оптимистичные обновления
- Retry при ошибках

---

## Безопасность

### JWT токены

**Структура:**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Проверка:**
- Валидация подписи
- Проверка exp
- Проверка token_version в БД

### Хеширование паролей

**Алгоритм:** bcrypt
**Rounds:** 10

```typescript
const hash = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hash);
```

### API ключи

**Генерация:**
```typescript
const key = 'eb_' + crypto.randomBytes(32).toString('hex');
const hash = await bcrypt.hash(key, 10);
const prefix = key.substring(0, 7);
```

**Хранение:**
- В БД: только hash и prefix
- Пользователю: полный ключ (только один раз)

---

## Производительность

### Оптимизации

1. **Индексы БД:**
   - Все внешние ключи
   - Часто используемые поля (email, status, etc.)

2. **Пагинация:**
   - Лимит записей (20-50)
   - OFFSET для страниц

3. **Ленивая загрузка:**
   - React.lazy для компонентов
   - Динамические импорты

4. **Мемоизация:**
   - useMemo для вычислений
   - useCallback для функций

5. **Debounce:**
   - Поиск (300ms)
   - Фильтры (500ms)

