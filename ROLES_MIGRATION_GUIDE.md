# Руководство по миграции системы ролей

## ✅ Что было сделано (Этап 1 - Backend)

### 1. База данных
- ✅ Создана миграция `migrations/001_roles_system.sql`
- ✅ Таблицы: `roles`, `subscriptions`, `user_permissions`
- ✅ Базовые роли: free, pro, premium, admin
- ✅ Индексы для производительности
- ✅ Триггеры для auto-update

### 2. Backend Services
- ✅ `src/services/permissions.service.ts` - сервис для работы с правами
- ✅ `src/api/roles.controller.ts` - контроллер ролей
- ✅ `src/api/roles.routes.ts` - роуты ролей
- ✅ `src/api/subscriptions.controller.ts` - контроллер подписок (обновлен)
- ✅ `src/api/subscriptions.routes.ts` - роуты подписок
- ✅ `src/api/permissions.middleware.ts` - middleware для проверки прав
- ✅ `server.ts` - интеграция новых роутов

### 3. API Endpoints

**Роли:**
- `GET /api/roles` - список всех ролей
- `GET /api/roles/:id` - детали роли
- `POST /api/roles` - создать роль (админ)
- `PUT /api/roles/:id` - обновить роль (админ)
- `DELETE /api/roles/:id` - удалить роль (админ)
- `POST /api/roles/assign` - назначить роль пользователю (админ)

**Подписки:**
- `GET /api/subscriptions/my` - моя подписка
- `POST /api/subscriptions/subscribe` - оформить подписку
- `POST /api/subscriptions/cancel` - отменить подписку
- `GET /api/subscriptions/history` - история подписок
- `GET /api/subscriptions` - все подписки (админ)
- `GET /api/subscriptions/stats` - статистика (админ)

---

## 🚀 Инструкция по деплою

### Шаг 1: Подготовка

```bash
# 1. Закоммитить изменения
git add .
git commit -m "feat: roles and subscriptions system (backend)"
git push origin main
```

### Шаг 2: Миграция базы данных

**На сервере (через SSH):**

```bash
# 1. Подключиться к серверу
ssh root@your-server

# 2. Перейти в директорию проекта
cd /srv/ebuster

# 3. Обновить код
git pull origin main

# 4. Выполнить миграцию в Supabase
```

**В Supabase Dashboard:**

1. Перейти в https://supabase.com/dashboard
2. Выбрать проект EBUSTER
3. Перейти в SQL Editor
4. Скопировать содержимое `migrations/001_roles_system.sql`
5. Вставить и выполнить (Run)
6. Проверить, что таблицы созданы:
   ```sql
   SELECT * FROM roles;
   SELECT * FROM subscriptions;
   SELECT * FROM user_permissions;
   ```

### Шаг 3: Перезапуск API

```bash
# На сервере
cd /srv/ebuster

# Пересобрать и перезапустить API контейнер
docker compose down api
docker compose build --no-cache api
docker compose up -d api

# Проверить логи
docker compose logs -f api
```

### Шаг 4: Проверка работы

**Тест API endpoints:**

```bash
# 1. Получить список ролей
curl https://api.ebuster.ru/api/roles

# Ожидаемый ответ:
# {
#   "success": true,
#   "data": [
#     { "name": "free", "display_name": "Free", ... },
#     { "name": "pro", "display_name": "Pro", ... },
#     { "name": "premium", "display_name": "Premium", ... },
#     { "name": "admin", "display_name": "Admin", ... }
#   ]
# }

# 2. Получить мою подписку (требует токен)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.ebuster.ru/api/subscriptions/my

# 3. Health check
curl https://api.ebuster.ru/api/health
```

---

## 📋 Проверочный чеклист

### База данных
- [ ] Таблица `roles` создана и содержит 4 роли
- [ ] Таблица `subscriptions` создана
- [ ] Таблица `user_permissions` создана
- [ ] Колонки `role_id` и `subscription_id` добавлены в `auth_users`
- [ ] Всем существующим пользователям назначена роль `free`
- [ ] Индексы созданы

### API
- [ ] GET /api/roles возвращает список ролей
- [ ] GET /api/subscriptions/my работает с токеном
- [ ] API логи не показывают ошибок
- [ ] Health check возвращает status: ok

### Безопасность
- [ ] Админские endpoints требуют авторизацию
- [ ] Middleware проверки прав работает
- [ ] Fail-open логика работает (при ошибке даем доступ)

---

## 🔧 Troubleshooting

### Проблема: Миграция не выполняется

**Решение:**
```sql
-- Проверить, что расширение uuid-ossp включено
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Проверить, что таблица auth_users существует
SELECT * FROM auth_users LIMIT 1;
```

### Проблема: API возвращает 500 ошибку

**Решение:**
```bash
# Проверить логи
docker compose logs api | tail -100

# Проверить переменные окружения
docker compose exec api printenv | grep SUPABASE

# Перезапустить контейнер
docker compose restart api
```

### Проблема: Роли не назначаются пользователям

**Решение:**
```sql
-- Вручную назначить роль free всем пользователям
UPDATE auth_users 
SET role_id = (SELECT id FROM roles WHERE name = 'free') 
WHERE role_id IS NULL;
```

---

## 📝 Следующие шаги (Этап 2 - Frontend)

После успешного деплоя backend, нужно:

1. Создать hooks:
   - `src/hooks/useSubscription.ts`
   - `src/hooks/usePermissions.ts`

2. Создать компоненты:
   - `src/components/SubscriptionBadge.tsx`
   - `src/components/FeatureGate.tsx`
   - `src/components/PricingPlans.tsx`

3. Создать админ панель:
   - `src/admin/RolesManagement.tsx`
   - `src/admin/SubscriptionsManagement.tsx`

4. Интегрировать проверки прав в существующие компоненты

---

## 🎯 Тестовые сценарии

### Сценарий 1: Создание подписки

```bash
# 1. Зарегистрировать нового пользователя
# 2. Получить токен
# 3. Оформить подписку
curl -X POST https://api.ebuster.ru/api/subscriptions/subscribe \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "UUID_PRO_ROLE",
    "billingPeriod": "monthly",
    "paymentMethod": "card"
  }'

# 4. Проверить подписку
curl -H "Authorization: Bearer TOKEN" \
  https://api.ebuster.ru/api/subscriptions/my
```

### Сценарий 2: Проверка прав

```bash
# 1. Получить роль пользователя
curl -H "Authorization: Bearer TOKEN" \
  https://api.ebuster.ru/api/roles

# 2. Попробовать создать скрипт (если есть право)
# 3. Попробовать создать featured скрипт (если нет права - должна быть ошибка 403)
```

---

## 📊 Мониторинг

### Метрики для отслеживания

1. **Подписки:**
   - Количество активных подписок
   - Количество отмененных подписок
   - Конверсия free → pro → premium

2. **API:**
   - Количество запросов к /api/roles
   - Количество запросов к /api/subscriptions
   - Количество ошибок 403 (недостаточно прав)

3. **База данных:**
   - Размер таблиц roles, subscriptions, user_permissions
   - Количество пользователей по ролям

### SQL запросы для мониторинга

```sql
-- Статистика по ролям
SELECT 
  r.name,
  r.display_name,
  COUNT(u.id) as users_count
FROM roles r
LEFT JOIN auth_users u ON u.role_id = r.id
GROUP BY r.id, r.name, r.display_name
ORDER BY users_count DESC;

-- Активные подписки
SELECT 
  status,
  COUNT(*) as count
FROM subscriptions
GROUP BY status;

-- Подписки по ролям
SELECT 
  r.name as role,
  COUNT(s.id) as subscriptions_count
FROM subscriptions s
JOIN roles r ON r.id = s.role_id
WHERE s.status = 'active'
GROUP BY r.name;
```

---

## ✅ Готово!

Backend система ролей и подписок полностью реализована и готова к деплою.

**Время выполнения:** ~2-3 часа  
**Следующий этап:** Frontend (hooks, components, admin panel)  
**Общий прогресс:** 40% (Этап 1 из 6 завершен)
