# 🔍 Диагностика: 404 на /verify-otp - РЕШЕНО ✅

## ❌ Проблема была:

При переходе на `https://ebuster.ru/verify-otp?email=...` показывалась страница 404.

**Причина:** Роут `/verify-otp` был добавлен в `App.tsx`, но на production используется `LandingApp.tsx`!

---

**Роут был добавлен в `LandingApp.tsx`:**

```typescript
// src/LandingApp.tsx
import VerifyOtp from "./pages/VerifyOtp";

<Routes>
  <Route path="/verify-otp" element={<VerifyOtp />} />
  {/* ... остальные роуты */}
</Routes>
```

**Важно:** На production используется `LandingApp.tsx`, а не `App.tsx`!

### Архитектура приложения:

```typescript
// src/main.tsx
const hostname = window.location.hostname;

if (hostname === 'lk.ebuster.ru') {
  AppComponent = DashboardApp;  // Личный кабинет
} else if (hostname === 'admin.ebuster.ru') {
  AppComponent = AdminApp;      // Админка
} else {
  AppComponent = LandingApp;    // Лендинг (ebuster.ru) ← ЗДЕСЬ!
}
```

---

## ✅ Решение:

### На сервере выполните:

```bash
cd /srv/ebuster

# 1. Убедитесь что код обновлен
git pull origin main

# 2. Пересоберите frontend контейнер
docker-compose build --no-cache frontend

# 3. Перезапустите контейнер
docker-compose up -d frontend

# 4. Проверьте что контейнер запустился
docker-compose ps

# 5. Проверьте логи
docker-compose logs -f frontend
```

### Проверка после пересборки:

```bash
# 1. Проверьте что файлы обновились
docker-compose exec frontend ls -la /usr/share/nginx/html/landing/

# 2. Откройте в браузере
# https://ebuster.ru/verify-otp?email=test@example.com

# Должна открыться страница с формой ввода OTP кода
```

---

## 🎯 Ожидаемый результат:

После пересборки на `https://ebuster.ru/verify-otp` должна открыться страница:

```
┌─────────────────────────────────────┐
│         📧 Подтверждение Email      │
│                                     │
│  Мы отправили 6-значный код на     │
│  test@example.com                  │
│                                     │
│  ┌───┬───┬───┐ • ┌───┬───┬───┐    │
│  │   │   │   │   │   │   │   │    │
│  └───┴───┴───┘   └───┴───┴───┘    │
│                                     │
│  ✓ Код действителен 10 минут      │
│                                     │
│  [Отправить код повторно]          │
│  [Вернуться к регистрации]         │
└─────────────────────────────────────┘
```

---

## 🔧 Дополнительная диагностика:

### Если проблема осталась:

1. **Проверьте что код на сервере обновлен:**
   ```bash
   cd /srv/ebuster
   git log --oneline -5
   # Должен быть коммит с VerifyOtp.tsx
   ```

2. **Проверьте что файл существует:**
   ```bash
   ls -la src/pages/VerifyOtp.tsx
   # Должен существовать
   ```

3. **Проверьте build процесс:**
   ```bash
   docker-compose build frontend 2>&1 | tee build.log
   # Проверьте на ошибки
   ```

4. **Проверьте что Nginx отдает правильный index.html:**
   ```bash
   curl https://ebuster.ru/verify-otp | grep -o "verify-otp"
   # Если пусто - frontend не пересобран
   ```

---

## 📋 Чеклист исправления:

- [ ] Код обновлен через `git pull`
- [ ] Frontend пересобран: `docker-compose build --no-cache frontend`
- [ ] Контейнер перезапущен: `docker-compose up -d frontend`
- [ ] Логи проверены: `docker-compose logs frontend`
- [ ] Страница `/verify-otp` открывается без 404
- [ ] Форма ввода OTP отображается
- [ ] API endpoint `/api/auth/verify-otp` работает

---

## 🚨 Важно:

**После КАЖДОГО изменения кода нужно:**

1. Закоммитить и запушить в GitHub
2. На сервере сделать `git pull`
3. Пересобрать контейнер: `docker-compose build --no-cache`
4. Перезапустить: `docker-compose up -d`

**Иначе изменения не попадут в production!**

---

## 📝 Итог:

**Проблема:** Frontend не пересобран  
**Решение:** Пересобрать Docker контейнер  
**Команда:** `docker-compose build --no-cache frontend && docker-compose up -d`

После этого страница `/verify-otp` должна работать! ✅
