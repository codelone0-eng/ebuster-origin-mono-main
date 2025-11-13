# 🚀 Быстрый старт - Миграция БД

## ✅ Что изменилось

### Упрощённая структура!
Вместо 100 таблиц теперь только **13 таблиц + 4 VIEW**

### Реферальная система
**Было:** 3 таблицы (`referral_codes`, `referral_uses`, `referral_stats`)  
**Стало:** 1 таблица `referrals` + 3 VIEW для совместимости

Все данные в одном месте:
- Реферер и приглашённый
- Код реферера
- Награда и статус
- Дата создания

## 📋 Полный список таблиц (13 шт)

1. `users` - пользователи
2. `scripts` - скрипты
3. `script_versions` - версии скриптов
4. `tickets` - тикеты
5. `ticket_messages` - сообщения
6. `api_keys` - API ключи
7. `subscriptions` - подписки
8. `login_history` - история входов
9. `user_bans` - баны
10. `user_scripts` - установленные скрипты
11. `script_categories` - категории
12. `roles` - роли
13. `referrals` - реферальная система

## 📋 VIEW для совместимости (4 шт)

1. `support_tickets` → `tickets`
2. `referral_codes` → `referrals`
3. `referral_uses` → `referrals`
4. `referral_stats` → `referrals`

## 🚀 Применение миграции (3 шага)

### 1. Очисти БД
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### 2. Создай таблицы
```sql
\i CLEAN_DB_SETUP.sql
```

### 3. Настрой RLS
```sql
\i SETUP_RLS_POLICIES.sql
```

### 4. Перезапусти
```bash
docker-compose restart ebuster-api
```

## ✅ Готово!

Все ошибки должны исчезнуть:
- ✅ `user_scripts` найдена
- ✅ `referral_codes` найдена (VIEW)
- ✅ `referral_uses` найдена (VIEW)
- ✅ `referral_stats` найдена (VIEW)
- ✅ `support_tickets` найдена (VIEW)
- ✅ `script_categories` найдена
- ✅ `roles` найдена
- ✅ `changelog` поле добавлено
- ✅ `auth_users` заменён на `users`

## 📊 Структура таблицы `referrals`

```sql
CREATE TABLE referrals (
    id UUID PRIMARY KEY,
    
    -- Реферер
    referrer_id UUID → users(id),
    referrer_code VARCHAR(50),
    
    -- Приглашённый
    referred_id UUID → users(id),
    
    -- Награда
    reward_amount DECIMAL(10,2),
    reward_paid BOOLEAN,
    
    -- Статус
    status VARCHAR(50),
    
    created_at TIMESTAMP
);
```

Просто и понятно! 🎉
