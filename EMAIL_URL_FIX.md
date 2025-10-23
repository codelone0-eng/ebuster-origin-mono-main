# Исправление URL в письмах регистрации

## ❌ Проблема:

В письмах регистрации приходит неправильная ссылка:
```
http://localhost:8080/confirm-email?token=...
```

Вместо правильной:
```
https://ebuster.ru/confirm-email?token=...
```

---

## ✅ Исправления:

### 1. Обновлен `auth.controller.ts`

**Файл:** `src/api/auth.controller.ts`

**До:**
```typescript
const baseUrl = process.env.NODE_ENV === 'production' 
  ? 'https://ebuster.ru' 
  : 'http://localhost:8080';
```

**После:**
```typescript
const baseUrl = process.env.FRONTEND_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://ebuster.ru' 
    : 'http://localhost:5173');
```

**Изменения:**
- ✅ Добавлена переменная окружения `FRONTEND_URL`
- ✅ Исправлен порт для dev: `8080` → `5173`
- ✅ Приоритет: `FRONTEND_URL` > `NODE_ENV`

---

### 2. Обновлен `extension-auth.controller.ts`

**Файл:** `src/api/extension-auth.controller.ts`

**До:**
```javascript
const oauthUrl = `http://localhost:8080/login?...`;
```

**После:**
```javascript
const baseUrl = '${process.env.FRONTEND_URL || 'https://ebuster.ru'}';
const oauthUrl = \`\${baseUrl}/login?...\`;
```

---

## 🔧 Настройка переменных окружения:

### Добавьте в `.env`:

```env
# Frontend URL для ссылок в письмах
FRONTEND_URL=https://ebuster.ru

# Для локальной разработки:
# FRONTEND_URL=http://localhost:5173
```

### Для production (на сервере):

```bash
# В .env на сервере
FRONTEND_URL=https://ebuster.ru
NODE_ENV=production
```

### Для development (локально):

```bash
# В .env локально
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

---

## 📧 Примеры ссылок:

### Production:
```
https://ebuster.ru/confirm-email?token=6lv39fwyx9omh3pnbd4&email=user@mail.ru
```

### Development:
```
http://localhost:5173/confirm-email?token=6lv39fwyx9omh3pnbd4&email=user@mail.ru
```

---

## 🧪 Тестирование:

### 1. Проверьте переменные окружения:

```bash
# Убедитесь что FRONTEND_URL установлен
echo $FRONTEND_URL

# Или в Windows PowerShell
echo $env:FRONTEND_URL
```

### 2. Перезапустите сервер:

```bash
npm run dev
```

### 3. Зарегистрируйте нового пользователя:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "full_name": "Test User"
  }'
```

### 4. Проверьте письмо:

Откройте полученное письмо и проверьте ссылку:

**Должно быть:**
```
https://ebuster.ru/confirm-email?token=...
```

**НЕ должно быть:**
```
http://localhost:8080/confirm-email?token=...
```

---

## 🔍 Проверка логов:

### В консоли сервера должно быть:

```bash
# При старте
✅ FRONTEND_URL: https://ebuster.ru

# При отправке письма
📧 Sending confirmation email to: user@example.com
🔗 Confirmation URL: https://ebuster.ru/confirm-email?token=...
✅ Email sent successfully
```

---

## 📊 Приоритет URL:

1. **`FRONTEND_URL`** (из `.env`) - **ВЫСШИЙ ПРИОРИТЕТ**
2. `NODE_ENV === 'production'` → `https://ebuster.ru`
3. `NODE_ENV !== 'production'` → `http://localhost:5173`

### Примеры:

```typescript
// Если FRONTEND_URL установлен
FRONTEND_URL=https://ebuster.ru
→ Результат: https://ebuster.ru

// Если FRONTEND_URL не установлен, но NODE_ENV=production
NODE_ENV=production
→ Результат: https://ebuster.ru

// Если ничего не установлено
→ Результат: http://localhost:5173
```

---

## 🚀 Деплой на production:

### 1. Установите переменную окружения:

```bash
# На сервере
export FRONTEND_URL=https://ebuster.ru
export NODE_ENV=production
```

### 2. Или в `.env` файле:

```env
FRONTEND_URL=https://ebuster.ru
NODE_ENV=production
```

### 3. Перезапустите сервер:

```bash
pm2 restart ebuster-api
# или
npm run start
```

### 4. Проверьте:

```bash
# Зарегистрируйте тестового пользователя
# Проверьте письмо
# Ссылка должна быть: https://ebuster.ru/confirm-email?...
```

---

## 🔐 Безопасность:

### Разрешенные домены:

В production разрешены только:
- `https://ebuster.ru`
- `https://www.ebuster.ru`
- `https://lk.ebuster.ru`
- `https://admin.ebuster.ru`
- `https://api.ebuster.ru`

В development:
- `http://localhost:5173`
- `http://localhost:8080`
- `http://localhost:3000`

---

## ✅ Чеклист:

- [x] Обновлен `auth.controller.ts`
- [x] Обновлен `extension-auth.controller.ts`
- [x] Добавлена переменная `FRONTEND_URL`
- [x] Исправлен порт для dev (8080 → 5173)
- [x] Добавлен приоритет переменных
- [x] Создана документация

---

## 📝 Дополнительно:

### Если нужны разные URL для разных окружений:

**.env.development:**
```env
FRONTEND_URL=http://localhost:5173
```

**.env.production:**
```env
FRONTEND_URL=https://ebuster.ru
```

**.env.staging:**
```env
FRONTEND_URL=https://staging.ebuster.ru
```

---

**Проблема исправлена!** ✅

**Теперь в письмах будут правильные ссылки!** 📧✨
