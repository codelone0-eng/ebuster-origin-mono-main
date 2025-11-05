# 🔧 Исправление SMTP - Быстрая инструкция

## ⚡ Быстрое решение (на сервере)

```bash
cd /srv/ebuster
curl -O https://raw.githubusercontent.com/codelone0-eng/ebuster-origin-mono-main/main/fix-smtp.sh
bash fix-smtp.sh
```

---

## 📝 Ручное исправление (пошагово)

### 1️⃣ Решить git конфликт

```bash
cd /srv/ebuster

# Сохранить локальные изменения
git stash

# Обновить код
git pull origin main
```

### 2️⃣ Обновить .env файл

```bash
nano /srv/ebuster/.env
```

Заменить SMTP секцию на:

```env
# SMTP Configuration (Beget)
SMTP_HOST=smtp.beget.com
SMTP_PORT=465
SMTP_USER=register@ebuster.ru
SMTP_PASS=1XCq11l!lEEh

# Email Settings
EMAIL_FROM_NAME=EBUSTER
EMAIL_FROM_ADDRESS=register@ebuster.ru
EMAIL_REPLY_TO=register@ebuster.ru
```

Сохранить: `Ctrl+O`, `Enter`, `Ctrl+X`

### 3️⃣ Пересобрать и перезапустить

```bash
# Остановить контейнеры
docker compose down

# Пересобрать API (важно!)
docker compose build --no-cache api

# Запустить
docker compose up -d

# Подождать 10 секунд
sleep 10

# Проверить логи
docker compose logs --tail=30 api
```

### 4️⃣ Проверить работу

Попробуйте зарегистрировать нового пользователя на https://ebuster.ru

Если в логах больше нет ошибки `535 Incorrect authentication data` - всё работает! ✅

---

## 🔍 Проверка текущих настроек

```bash
# Посмотреть SMTP настройки в .env
cat /srv/ebuster/.env | grep SMTP

# Должно быть:
# SMTP_HOST=smtp.beget.com
# SMTP_PORT=465
# SMTP_USER=register@ebuster.ru
# SMTP_PASS=1XCq11l!lEEh
```

---

## ❌ Если ошибка всё ещё есть

### Проверка 1: Правильность данных

```bash
# Проверить, что контейнер видит правильные данные
docker compose exec api printenv | grep SMTP
```

Должно показать:
```
SMTP_HOST=smtp.beget.com
SMTP_PORT=465
SMTP_USER=register@ebuster.ru
SMTP_PASS=1XCq11l!lEEh
```

### Проверка 2: Тест SMTP вручную

```bash
# Войти в контейнер
docker compose exec api sh

# Проверить подключение к SMTP
nc -zv smtp.beget.com 465

# Выйти
exit
```

### Проверка 3: Проверить пароль в панели Beget

1. Зайти в панель управления Beget
2. Раздел "Почта"
3. Найти `register@ebuster.ru`
4. Убедиться, что пароль `1XCq11l!lEEh` правильный
5. Если нет - обновить пароль в `.env` и пересобрать

---

## 🆘 Альтернативное решение

Если Beget не работает, попробуйте порт 2525:

```bash
nano /srv/ebuster/.env
```

Изменить:
```env
SMTP_PORT=2525
```

Пересобрать:
```bash
docker compose down
docker compose build --no-cache api
docker compose up -d
```

---

## 📊 Мониторинг

```bash
# Следить за логами в реальном времени
docker compose logs -f api

# Искать ошибки SMTP
docker compose logs api | grep -i smtp
docker compose logs api | grep -i "535"
docker compose logs api | grep -i "authentication"
```

---

## ✅ Признаки успеха

В логах должно быть:
```
✅ Email отправлен: <message-id>
✅ OTP код отправлен: <message-id>
```

Вместо:
```
❌ Ошибка отправки OTP: Error: Invalid login: 535 Incorrect authentication data
```

---

## 💡 Почему это происходит?

Docker контейнер **кэширует** переменные окружения при сборке. Просто изменить `.env` недостаточно - нужно **пересобрать** контейнер с `--no-cache`.

Команда `docker compose restart` НЕ обновляет переменные окружения!

**Правильно:**
```bash
docker compose down
docker compose build --no-cache api
docker compose up -d
```

**Неправильно:**
```bash
docker compose restart api  # ❌ Не обновит переменные!
```
