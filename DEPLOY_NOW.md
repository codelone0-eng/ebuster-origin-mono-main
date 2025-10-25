# 🚀 СРОЧНЫЙ ДЕПЛОЙ: Исправление /verify-otp

## ✅ Что исправлено:

Роут `/verify-otp` добавлен в **`LandingApp.tsx`** (правильный файл для ebuster.ru)

---

## 📋 Команды для деплоя:

### На сервере выполните:

```bash
# 1. Перейдите в директорию проекта
cd /srv/ebuster

# 2. Обновите код из GitHub
git pull origin main

# 3. Пересоберите frontend контейнер
docker-compose build --no-cache frontend

# 4. Перезапустите контейнер
docker-compose up -d frontend

# 5. Проверьте логи
docker-compose logs -f frontend
```

---

## ✅ После деплоя проверьте:

1. **Откройте:** https://ebuster.ru/verify-otp?email=test@example.com

2. **Должна открыться страница с формой ввода OTP:**
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
   └─────────────────────────────────────┘
   ```

3. **НЕ должно быть:**
   - ❌ Страницы 404
   - ❌ Пустой страницы
   - ❌ Ошибок в консоли

---

## 🎯 Полный процесс регистрации:

1. Пользователь регистрируется на https://ebuster.ru
2. Получает email с 6-значным кодом
3. Автоматически перенаправляется на `/verify-otp?email=...`
4. Вводит код (автоматическая проверка при вводе 6 цифр)
5. Автоматический вход в систему
6. Перенаправление в `/dashboard` (→ https://lk.ebuster.ru/dashboard)

---

## 📝 Изменения в коде:

### 1. Файл: `src/LandingApp.tsx`

```typescript
// Добавлен импорт
import VerifyOtp from "./pages/VerifyOtp";

// Добавлен роут
<Route path="/verify-otp" element={<VerifyOtp />} />
```

### 2. Файл: `src/pages/VerifyOtp.tsx`

```typescript
// Убран useAuth (не нужен, так как токен сохраняется напрямую)
// Перенаправление на правильный поддомен
window.location.href = 'https://lk.ebuster.ru/dashboard';
```

---

## ⚠️ Важно понимать:

### Структура приложения:

```
src/
├── main.tsx           → Entry point (выбирает App по домену)
├── LandingApp.tsx     → ebuster.ru (ИСПОЛЬЗУЕТСЯ)
├── DashboardApp.tsx   → lk.ebuster.ru
├── AdminApp.tsx       → admin.ebuster.ru
└── App.tsx            → НЕ ИСПОЛЬЗУЕТСЯ на production!
```

### Логика выбора App:

```typescript
// src/main.tsx
if (hostname === 'lk.ebuster.ru') {
  AppComponent = DashboardApp;
} else if (hostname === 'admin.ebuster.ru') {
  AppComponent = AdminApp;
} else {
  AppComponent = LandingApp;  // ← ebuster.ru использует ЭТО
}
```

**Поэтому все роуты для ebuster.ru нужно добавлять в `LandingApp.tsx`!**

---

## 🔧 Если что-то пошло не так:

### Проверьте логи:

```bash
# Логи frontend
docker-compose logs -f frontend

# Логи API
docker-compose logs -f api

# Проверьте что контейнеры запущены
docker-compose ps
```

### Проверьте что код обновился:

```bash
cd /srv/ebuster
git log --oneline -3

# Должен быть коммит с LandingApp.tsx
```

### Проверьте файлы в контейнере:

```bash
# Войдите в контейнер
docker-compose exec frontend sh

# Проверьте что файлы обновились
ls -la /usr/share/nginx/html/landing/

# Выйдите
exit
```

---

## ✅ Чеклист:

- [ ] Код закоммичен и запушен в GitHub
- [ ] На сервере выполнен `git pull`
- [ ] Frontend пересобран: `docker-compose build --no-cache frontend`
- [ ] Контейнер перезапущен: `docker-compose up -d frontend`
- [ ] Страница `/verify-otp` открывается
- [ ] Форма ввода OTP отображается
- [ ] Регистрация → OTP → Автовход работает

---

**ДЕПЛОЙТЕ СЕЙЧАС!** 🚀
