# 🔧 Исправление 404 на роутах

## ❌ Проблемы:

1. **`/verify-otp`** показывает 404
2. **Реферальные ссылки** (`/?ref=...`) показывают 404
3. **Email шаблон** не в стиле Ebuster

---

## ✅ Решение 1: Nginx конфигурация для SPA

### Проблема:
Nginx не знает про React Router и возвращает 404 для всех роутов кроме `/`

### Исправление:

Откройте конфигурацию Nginx:
```bash
nano /etc/nginx/sites-available/ebuster.ru
```

Добавьте `try_files` для SPA:
```nginx
server {
    server_name ebuster.ru www.ebuster.ru;
    root /var/www/ebuster/dist;
    index index.html;

    # SPA fallback - ВСЕ роуты идут на index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API проксируется отдельно
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/ebuster.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ebuster.ru/privkey.pem;
}
```

### Перезапустите Nginx:
```bash
nginx -t
systemctl reload nginx
```

---

## ✅ Решение 2: Исправить API URL в VerifyOtp

### Проблема:
В коде используется `localhost:3001` вместо `api.ebuster.ru`

### Уже исправлено в файле:
`src/pages/VerifyOtp.tsx`

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'https://api.ebuster.ru';
const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, otp }),
});
```

---

## ✅ Решение 3: Пересобрать frontend

### После изменений пересоберите:

```bash
cd /srv/ebuster

# Пересоберите frontend
npm run build

# Или через Docker
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

---

## ✅ Решение 4: Исправить email шаблон

### Проблема:
Email не в стиле Ebuster

### Файл для редактирования:
`src/services/email.service.ts` - метод `sendOtpEmail()`

Шаблон уже создан с:
- ✅ Градиентной рамкой
- ✅ Крупным кодом (48px)
- ✅ Темной темой Ebuster
- ✅ Иконками и предупреждениями

### Проверьте что используется правильный метод:

В `auth.controller.ts` должно быть:
```typescript
const emailSent = await emailService.sendOtpEmail(email, otpCode, fullName || email);
```

**НЕ:**
```typescript
const emailSent = await emailService.sendConfirmationEmail(...);
```

---

## 🧪 Тестирование:

### 1. Проверьте роуты:

```bash
# Должны работать без 404:
curl -I https://ebuster.ru/
curl -I https://ebuster.ru/verify-otp
curl -I https://ebuster.ru/register
curl -I https://ebuster.ru/?ref=TEST123
```

**Все должны возвращать 200 OK**

### 2. Проверьте регистрацию:

1. Откройте https://ebuster.ru
2. Нажмите "Регистрация"
3. Заполните форму
4. После регистрации должно:
   - ✅ Показать уведомление
   - ✅ Перенаправить на `/verify-otp?email=...`
   - ✅ **НЕ показывать 404**
   - ✅ Показать форму ввода OTP

### 3. Проверьте email:

Должен прийти email с:
- ✅ Темным фоном (#232323)
- ✅ Градиентной рамкой вокруг кода
- ✅ Крупным кодом: `123456`
- ✅ Таймером: "Код действителен 10 минут"
- ✅ Предупреждением о безопасности

---

## 📋 Полный чеклист исправлений:

### На сервере:

```bash
# 1. Обновите Nginx конфигурацию
nano /etc/nginx/sites-available/ebuster.ru
# Добавьте: try_files $uri $uri/ /index.html;

# 2. Проверьте конфигурацию
nginx -t

# 3. Перезапустите Nginx
systemctl reload nginx

# 4. Пересоберите frontend
cd /srv/ebuster
docker-compose build --no-cache frontend
docker-compose up -d

# 5. Проверьте что API работает
docker-compose logs -f api

# 6. Проверьте логи Nginx
tail -f /var/log/nginx/error.log
```

---

## 🔍 Проверка Nginx конфигурации:

### Текущая конфигурация должна быть:

```nginx
server {
    server_name ebuster.ru www.ebuster.ru;
    root /var/www/ebuster/dist;
    index index.html;

    # ВАЖНО: Это должно быть ПЕРВЫМ
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Остальные location блоки...
}
```

### Проверьте:
```bash
nginx -T | grep -A 10 "server_name ebuster.ru"
```

---

## ✅ После всех исправлений:

### Должно работать:

1. ✅ `https://ebuster.ru/` - главная
2. ✅ `https://ebuster.ru/verify-otp?email=...` - форма OTP
3. ✅ `https://ebuster.ru/?ref=ABC123` - реферальная ссылка
4. ✅ `https://ebuster.ru/register` - регистрация
5. ✅ Email с красивым OTP кодом

### НЕ должно быть:

- ❌ 404 на любых роутах
- ❌ localhost в URL
- ❌ Некрасивых email шаблонов

---

**Исправьте Nginx конфигурацию и пересоберите frontend!** 🚀
