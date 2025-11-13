# Database Refactoring Summary

## Изменения в структуре БД

### Старая структура → Новая структура

1. **auth_users** → **users** (объединена с users)
   - Все поля из auth_users перенесены в users
   - Удалены дублирующие поля

2. **scripts, script_categories, script_downloads** → **scripts**
   - Все данные о скриптах в одной таблице
   - Категория теперь VARCHAR поле
   - Статистика (downloads, views) в той же таблице

3. **tickets + ticket_messages** → **tickets + ticket_messages**
   - Упрощена структура, убраны лишние поля
   - ticket_number теперь обязательное уникальное поле

4. **api_keys** → **api_keys**
   - Структура упрощена, убраны лишние поля

5. **subscriptions** → **subscriptions**
   - Структура сохранена, убраны лишние поля

6. **login_history** → **login_history**
   - Структура сохранена

7. **user_bans** → **user_bans**
   - Структура сохранена

## Изменения в коде

### Глобальные замены:

1. **auth_users** → **users** во всех файлах:
   - ✅ auth.controller.ts
   - ✅ auth.middleware.ts
   - ✅ user.controller.ts
   - ⏳ admin.controller.ts
   - ⏳ referral.controller.ts
   - ⏳ subscriptions.controller.ts
   - ⏳ apikeys.controller.ts
   - ⏳ roles.controller.ts
   - ⏳ extension-auth.controller.ts
   - ⏳ cron-jobs.ts

2. **scripts** таблица - убрать ссылки на:
   - script_categories (категория теперь VARCHAR)
   - script_downloads (downloads теперь INTEGER в scripts)

3. **tickets** - обновить все запросы

## Порядок применения миграции

1. **Создать бэкап БД**
   ```bash
   pg_dump -h <host> -U <user> -d <database> > backup_before_refactoring.sql
   ```

2. **Применить миграцию**
   ```bash
   psql -h <host> -U <user> -d <database> -f migrations/refactor_database.sql
   ```

3. **Обновить код** (git pull)

4. **Перезапустить сервисы**
   ```bash
   docker-compose restart ebuster-api
   ```

5. **Проверить работоспособность**
   - Авторизация
   - Регистрация
   - Скрипты
   - Тикеты
   - API ключи

## Критичные изменения

### ⚠️ ВАЖНО: Поля которые были удалены

Из **users** (бывшая auth_users):
- Удалены временные поля OTP (otp, otp_expiry) - теперь не нужны, используем confirmation_token

### ⚠️ ВАЖНО: Новые поля

В **users**:
- `token_version` - для инвалидации токенов
- `referral_code` - для реферальной системы
- `referred_by` - кто пригласил
- `referral_earnings` - заработок с рефералов

В **scripts**:
- `category` VARCHAR - вместо внешнего ключа
- `downloads` INTEGER - вместо отдельной таблицы
- `views` INTEGER - статистика просмотров
- `rating` DECIMAL - рейтинг скрипта
- `is_featured` BOOLEAN - избранный скрипт

## Rollback план

Если что-то пойдёт не так:

```bash
# Восстановить из бэкапа
psql -h <host> -U <user> -d <database> < backup_before_refactoring.sql

# Откатить код
git checkout <previous_commit>

# Перезапустить
docker-compose restart
```
