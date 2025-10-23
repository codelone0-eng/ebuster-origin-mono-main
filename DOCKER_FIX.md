# 🐳 Исправление Docker контейнера

## ❌ Проблема:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'node-cron'
```

API контейнер падает, потому что не установлены зависимости:
- `node-cron`
- `nodemailer`
- `node-fetch`

---

## ✅ Решение:

### 1. Добавьте зависимости в package.json:

```bash
# На сервере
cd /srv/ebuster

# Откройте package.json
nano package.json
```

Добавьте в `dependencies`:
```json
{
  "dependencies": {
    "node-cron": "^3.0.3",
    "nodemailer": "^6.9.7",
    "node-fetch": "^3.3.2"
  },
  "devDependencies": {
    "@types/node-cron": "^3.0.11",
    "@types/nodemailer": "^6.4.14",
    "@types/node-fetch": "^2.6.9"
  }
}
```

### 2. Пересоберите Docker контейнер:

```bash
# Остановите контейнеры
docker-compose down

# Пересоберите с установкой зависимостей
docker-compose build --no-cache api

# Запустите
docker-compose up -d
```

### 3. Проверьте логи:

```bash
docker-compose logs -f api
```

**Должно быть:**
```
✅ Server running on port 3001
✅ SMTP подключение успешно
✅ [CRON] Все cron jobs запущены
```

---

## 🔧 Альтернатива: Установка внутри контейнера

Если не хотите пересобирать:

```bash
# Войдите в контейнер
docker-compose exec api sh

# Установите зависимости
npm install node-cron nodemailer node-fetch
npm install --save-dev @types/node-cron @types/nodemailer @types/node-fetch

# Выйдите
exit

# Перезапустите
docker-compose restart api
```

---

## 📝 Проверка package.json:

Убедитесь что в файле есть все зависимости:

```json
{
  "name": "ebuster-api",
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "node-cron": "^3.0.3",
    "nodemailer": "^6.9.7",
    "node-fetch": "^3.3.2"
  }
}
```

---

## 🚀 После исправления:

### Проверьте что API работает:

```bash
curl https://api.ebuster.ru/health
```

### Попробуйте зарегистрироваться:

```bash
curl -X POST https://api.ebuster.ru/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "fullName": "Test User"
  }'
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "emailSent": true,
  "message": "Пользователь создан. Письмо отправлено."
}
```

---

## ✅ Чеклист:

- [ ] Добавлены зависимости в package.json
- [ ] Пересобран Docker контейнер
- [ ] API запущен без ошибок
- [ ] CORS настроен правильно
- [ ] Регистрация работает

---

**Пересоберите Docker с зависимостями!** 🐳
