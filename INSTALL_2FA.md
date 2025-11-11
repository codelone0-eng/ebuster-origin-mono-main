# Установка библиотеки для 2FA

Для работы двухфакторной аутентификации необходимо установить библиотеку `otpauth`:

```bash
npm install otpauth
```

## Структура БД

Необходимо добавить следующие колонки в таблицу `auth_users`:

```sql
-- Временный секрет (пока пользователь не подтвердил код)
ALTER TABLE auth_users ADD COLUMN two_factor_secret_temp TEXT;

-- Постоянный секрет (после подтверждения)
ALTER TABLE auth_users ADD COLUMN two_factor_secret TEXT;

-- Резервные коды (хешированные)
ALTER TABLE auth_users ADD COLUMN two_factor_backup_codes TEXT[];

-- Статус 2FA
ALTER TABLE auth_users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
```

## Как это работает

1. **Генерация секрета** (`/api/user/2fa/generate-secret`):
   - Генерируется случайный секретный ключ
   - Сохраняется в `two_factor_secret_temp`
   - Возвращается QR-код и секрет пользователю

2. **Проверка кода** (`/api/user/2fa/verify-setup`):
   - Пользователь вводит 6-значный код из приложения
   - Код проверяется через библиотеку `otpauth` (TOTP)
   - Если код верный:
     - Генерируются 8 резервных кодов
     - Резервные коды хешируются (bcrypt)
     - Секрет переносится из `temp` в постоянный
     - Устанавливается `two_factor_enabled = true`
   - Резервные коды показываются пользователю ОДИН РАЗ

3. **Отключение 2FA** (`/api/user/2fa/disable`):
   - Удаляются все данные 2FA из БД
   - Устанавливается `two_factor_enabled = false`

## Безопасность

- Секретные ключи хранятся в БД в виде hex-строк
- Резервные коды хешируются перед сохранением (bcrypt)
- Коды генерируются криптографически стойким генератором (`crypto.randomBytes`)
- TOTP проверка с окном ±1 (допускает небольшое рассинхронизирование времени)
