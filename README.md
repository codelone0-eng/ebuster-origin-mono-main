# 🚀 EBUSTER - Полная Документация Проекта

> **Монорепозиторий расширения EBUSTER**  
> Production: https://ebuster.ru | API: https://api.ebuster.ru | Admin: https://admin.ebuster.ru | LK: https://lk.ebuster.ru

---

## 📋 Содержание

1. [Архитектура проекта](#архитектура-проекта)
2. [Технологический стек](#технологический-стек)
3. [Структура проекта](#структура-проекта)
4. [Деплой и инфраструктура](#деплой-и-инфраструктура)
5. [Система аутентификации](#система-аутентификации)
6. [API Endpoints](#api-endpoints)
7. [База данных](#база-данных)
8. [Frontend приложения](#frontend-приложения)
9. [Проблемы и решения](#проблемы-и-решения)
10. [Инструкции по развертыванию](#инструкции-по-развертыванию)

---

## 🏗️ Архитектура проекта

### Микросервисная архитектура на поддоменах:

```
ebuster.ru/
├── ebuster.ru          → Лендинг (React SPA)
├── lk.ebuster.ru       → Личный кабинет (React SPA)
├── admin.ebuster.ru    → Админ-панель (React SPA)
└── api.ebuster.ru      → Backend API (Express + TypeScript)
```

### Инфраструктура:

```
┌─────────────────────────────────────────────┐
│           Cloudflare (SSL/CDN)              │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         VPS Server (Docker)                 │
│  ┌──────────────────────────────────────┐  │
│  │  Nginx (Reverse Proxy)               │  │
│  │  ├─ ebuster.ru → Frontend Container  │  │
│  │  ├─ lk.ebuster.ru → Frontend         │  │
│  │  ├─ admin.ebuster.ru → Frontend      │  │
│  │  └─ api.ebuster.ru → API Container   │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │   Frontend   │  │   API        │        │
│  │   Container  │  │   Container  │        │
│  │   (Nginx)    │  │   (Node.js)  │        │
│  │   Port: 80   │  │   Port: 3001 │        │
│  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Supabase (PostgreSQL)               │
│         - auth_users                        │
│         - subscriptions                     │
│         - scripts                           │
└─────────────────────────────────────────────┘
```

---

## 💻 Технологический стек

### Frontend:
- **Framework:** React 18.3 + TypeScript
- **Build Tool:** Vite 5.4
- **Routing:** React Router DOM 6.30
- **UI Library:** shadcn/ui (Radix UI)
- **Styling:** TailwindCSS 3.4
- **Animations:** GSAP, Lenis
- **Forms:** React Hook Form + Zod
- **State:** React Query (TanStack)
- **Icons:** Lucide React

### Backend:
- **Runtime:** Node.js 20.19
- **Framework:** Express 5.1
- **Language:** TypeScript
- **Auth:** JWT (jsonwebtoken 9.0)
- **Password:** bcryptjs 2.4
- **Email:** Nodemailer 7.0
- **Database Client:** @supabase/supabase-js 2.74
- **CORS:** cors 2.8

### DevOps:
- **Containerization:** Docker + Docker Compose
- **Web Server:** Nginx
- **SSL:** Let's Encrypt (через Cloudflare)
- **CI/CD:** GitHub → VPS (manual deploy)
- **Process Manager:** Docker restart policies

### Database:
- **Provider:** Supabase (PostgreSQL)
- **Tables:** auth_users, subscriptions, scripts, tickets, etc.

---

## 📁 Структура проекта

```
ebuster-origin-mono-main/
├── src/
│   ├── landing/              # Лендинг страницы
│   │   ├── Index.tsx         # Главная страница
│   │   ├── ApiDocs.tsx       # API документация
│   │   ├── Error404.tsx      # Страница 404
│   │   └── ...
│   ├── lk/                   # Личный кабинет
│   │   ├── Dashboard.tsx     # Дашборд пользователя
│   │   ├── TicketPage.tsx    # Страница тикета
│   │   └── ...
│   ├── admin/                # Админ-панель
│   │   ├── AdminDashboard.tsx
│   │   └── ...
│   ├── pages/                # Страницы аутентификации
│   │   ├── Login.tsx         # Страница входа
│   │   ├── Register.tsx      # Страница регистрации
│   │   └── VerifyOtp.tsx     # Страница ввода OTP кода
│   ├── api/                  # Backend API
│   │   ├── auth.controller.ts    # Аутентификация
│   │   ├── auth.routes.ts        # Роуты аутентификации
│   │   ├── admin.controller.ts   # Админ функции
│   │   ├── subscription.controller.ts
│   │   └── ...
│   ├── components/           # React компоненты
│   │   ├── ui/              # shadcn/ui компоненты
│   │   ├── RegisterModal.tsx
│   │   ├── CustomCursor.tsx
│   │   └── ...
│   ├── contexts/            # React контексты
│   │   ├── CustomAuthContext.tsx
│   │   ├── LanguageContext.tsx
│   │   └── ...
│   ├── services/            # Сервисы
│   │   ├── email.service.ts # Email отправка
│   │   └── ...
│   ├── config/              # Конфигурация
│   │   └── smtp.config.ts   # SMTP настройки
│   └── lib/                 # Утилиты
│       └── utils.ts
├── public/                  # Статические файлы
├── dist/                    # Production build
├── docker-compose.yml       # Docker конфигурация
├── Dockerfile.api           # API Dockerfile
├── Dockerfile.frontend      # Frontend Dockerfile
├── nginx.conf               # Nginx конфигурация
├── server.ts                # Express сервер
├── package.json             # Зависимости
├── vite.config.ts           # Vite конфигурация
├── tailwind.config.ts       # Tailwind конфигурация
└── .env                     # Переменные окружения
```

---

## 🐳 Деплой и инфраструктура

### Docker Compose Setup:

**Файл:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  # API Backend
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: ebuster-api
    restart: unless-stopped
    ports:
      - "3001:3001"
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - PORT=3001
    networks:
      - ebuster-network

  # Frontend (Nginx + SPA)
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: ebuster-frontend
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - api
    networks:
      - ebuster-network
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro

networks:
  ebuster-network:
    driver: bridge
```

### Nginx Configuration:

**Файл:** `nginx.conf`

```nginx
# Лендинг - ebuster.ru (HTTPS)
server {
    listen 443 ssl http2;
    server_name ebuster.ru www.ebuster.ru;
    
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    root /usr/share/nginx/html/landing;
    index index.html;

    # SPA Fallback - ВСЕ роуты идут на index.html
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}

# API - api.ebuster.ru (HTTPS)
server {
    listen 443 ssl http2;
    server_name api.ebuster.ru;
    
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    location / {
        proxy_pass http://api:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Переменные окружения:

**Файл:** `.env`

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# JWT
JWT_SECRET=your-secret-key

# SMTP (для email)
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@ebuster.ru
SMTP_PASS=your-password

# Frontend URL
FRONTEND_URL=https://ebuster.ru
NODE_ENV=production
PORT=3001
```

---

## 🔐 Система аутентификации

### OTP (One-Time Password) Аутентификация:

#### Процесс регистрации:

```
1. Пользователь заполняет форму регистрации
   ↓
2. Backend генерирует 6-значный OTP код (123456)
   ↓
3. Код сохраняется в БД (auth_users.confirmation_token)
   + Время истечения (otp_expiry = now() + 10 минут)
   ↓
4. Email с OTP кодом отправляется пользователю
   ↓
5. Пользователь перенаправляется на /verify-otp?email=...
   ↓
6. Вводит 6-значный код
   ↓
7. Backend проверяет код и время истечения
   ↓
8. При успехе:
   - email_confirmed = true
   - status = 'active'
   - Генерируется JWT токен
   - Автоматический вход в систему
   ↓
9. Перенаправление в /dashboard
```

#### Backend Implementation:

**Файл:** `src/api/auth.controller.ts`

```typescript
// Генерация OTP кода
const generateOtpCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Регистрация с OTP
export const registerUser = async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;
  
  // Генерация OTP
  const otpCode = generateOtpCode();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 минут
  
  // Создание пользователя
  await supabase.from('auth_users').insert({
    email,
    password_hash: await bcrypt.hash(password, 12),
    full_name: fullName,
    email_confirmed: false,
    confirmation_token: otpCode,
    otp_expiry: otpExpiry.toISOString(),
    status: 'inactive'
  });
  
  // Отправка OTP на email
  await emailService.sendOtpEmail(email, otpCode, fullName);
  
  res.status(201).json({ success: true });
};

// Проверка OTP
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  
  // Поиск пользователя
  const { data: user } = await supabase
    .from('auth_users')
    .select('*')
    .eq('email', email)
    .eq('confirmation_token', otp)
    .single();
  
  if (!user) {
    return res.status(400).json({ error: 'Неверный OTP код' });
  }
  
  // Проверка истечения
  if (new Date(user.otp_expiry) < new Date()) {
    return res.status(400).json({ error: 'OTP код истек' });
  }
  
  // Активация пользователя
  await supabase.from('auth_users').update({
    email_confirmed: true,
    status: 'active',
    confirmation_token: null,
    otp_expiry: null
  }).eq('id', user.id);
  
  // Генерация JWT токена
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, full_name: user.full_name }
  });
};
```

#### Frontend Implementation:

**Файл:** `src/pages/VerifyOtp.tsx`

```typescript
export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  
  // Автоматическая проверка при вводе 6 цифр
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);
  
  const handleVerify = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'https://api.ebuster.ru';
    const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Сохранение токена
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Перенаправление на поддомен личного кабинета
      window.location.href = 'https://lk.ebuster.ru/dashboard';
    }
  };
  
  return (
    <OtpInput
      length={6}
      value={otp}
      onChange={(value) => setOtp(value)}
      disabled={loading}
      autoFocus
    />
  );
}
```

**Изменения:**
- Создан кастомный компонент `OtpInput` без внешних зависимостей
- Полный контроль над вводом - нет дублирования символов
- Поддержка вставки из буфера, навигация стрелками
- Перенаправление на `lk.ebuster.ru/dashboard` вместо локального `/dashboard`

---

## 📡 API Endpoints

### Authentication:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Регистрация пользователя |
| POST | `/api/auth/login` | Вход в систему |
| POST | `/api/auth/verify-otp` | Проверка OTP кода |
| GET | `/api/auth/verify` | Проверка JWT токена |
| POST | `/api/auth/logout` | Выход из системы |
| POST | `/api/auth/reset-password` | Сброс пароля |

### Admin:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Список пользователей |
| PATCH | `/api/admin/users/:id/status` | Изменить статус пользователя |
| DELETE | `/api/admin/users/:id` | Удалить пользователя |
| POST | `/api/admin/users/:id/ban` | Забанить пользователя |

### Subscriptions:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscriptions` | Список подписок |
| POST | `/api/subscriptions` | Создать подписку |
| GET | `/api/subscriptions/:id` | Получить подписку |

---

## 🗄️ База данных

### Таблица: `auth_users`

```sql
CREATE TABLE auth_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  email_confirmed BOOLEAN DEFAULT false,
  confirmation_token TEXT,
  otp_expiry TIMESTAMPTZ,
  status TEXT DEFAULT 'inactive',
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Важные поля:

- `confirmation_token` - Хранит 6-значный OTP код
- `otp_expiry` - Время истечения OTP (10 минут)
- `email_confirmed` - Подтвержден ли email
- `status` - Статус пользователя (inactive/active/banned)

---

## 🎨 Frontend приложения

### Роутинг:

**Файл:** `src/LandingApp.tsx` (для ebuster.ru)

```typescript
<Routes>
  {/* Главная */}
  <Route path="/" element={<Index />} />
  
  {/* Аутентификация */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/verify-otp" element={<VerifyOtp />} />
  <Route path="/signin" element={<Login />} />
  
  {/* Документация */}
  <Route path="/api-docs" element={<ApiDocs />} />
  <Route path="/documentation" element={<Documentation />} />
  <Route path="/contacts" element={<Contacts />} />
  
  {/* Перенаправления на поддомены */}
  <Route path="/dashboard/*" element={<RedirectTo url="https://lk.ebuster.ru/dashboard" />} />
  <Route path="/admin/*" element={<RedirectTo url="https://admin.ebuster.ru" />} />
</Routes>
```

**Важно:** Login и Register теперь отдельные страницы, а не модальные окна!

### Компоненты UI:

Используется **shadcn/ui** - коллекция компонентов на базе Radix UI:

- `Button`, `Input`, `Card`, `Dialog`
- `InputOTP` - для ввода OTP кода
- `Toast` - уведомления
- `Table`, `Tabs`, `Select`

---

## ⚠️ Проблемы и решения

### Проблема 1: 404 на `/verify-otp`

**Причина:** Роут добавлен в `App.tsx`, но на production используется `LandingApp.tsx`

**Решение:** Добавить роут в `LandingApp.tsx`:
```typescript
import VerifyOtp from "./pages/VerifyOtp";
<Route path="/verify-otp" element={<VerifyOtp />} />
```

Затем пересобрать:
```bash
cd /srv/ebuster
git pull origin main
docker-compose build --no-cache frontend
docker-compose up -d
```

### Проблема 2: InputOTP дублирует цифры в первую ячейку

**Причина:** Конфликт библиотеки `input-otp` с расширением браузера или двойной рендеринг

**Решение:** Создан кастомный компонент `OtpInput` без зависимостей:
```typescript
// src/components/OtpInput.tsx
<OtpInput
  length={6}
  value={otp}
  onChange={(value) => setOtp(value)}
  disabled={loading}
  autoFocus
/>
```

**Преимущества:**
- ✅ Нет дублирования символов
- ✅ Полный контроль над вводом
- ✅ Поддержка вставки из буфера обмена
- ✅ Навигация стрелками и Backspace
- ✅ Работает со всеми расширениями

### Проблема 3: "useAuth must be used within an AuthProvider"

**Причина:** Компонент использует `useAuth`, но не обернут в `AuthProvider`

**Решение:** Убрать `useAuth` из `VerifyOtp.tsx`, токен сохраняется напрямую в localStorage

### Проблема 4: CORS ошибки

**Причина:** API не возвращает CORS заголовки

**Решение:** В `server.ts` добавлен CORS middleware:
```typescript
app.use(cors({
  origin: ['https://ebuster.ru', 'https://lk.ebuster.ru', 'https://admin.ebuster.ru'],
  credentials: true
}));
```

### Проблема 5: "Cannot find package 'node-cron'"

**Причина:** Зависимости не установлены в Docker контейнере

**Решение:**
```bash
docker-compose exec api npm install node-cron nodemailer
docker-compose restart api
```

---

## 🆕 Последние изменения

### Login и Register - теперь отдельные страницы

**Изменено:** Login и Register больше не модальные окна, а полноценные страницы с полным функционалом

**Файлы:**
- `src/pages/Login.tsx` - Страница входа
- `src/pages/Register.tsx` - Страница регистрации
- `src/components/Header.tsx` - Обновлен для перенаправления на страницы

**Роуты:**
- `/login` - Страница входа
- `/register` - Страница регистрации
- `/signin` - Алиас для `/login`
- `/get-started` - Алиас для `/register`

**Функционал Login:**
- ✅ RecentUsers - быстрый выбор из недавних пользователей
- ✅ "Запомнить меня" - сохранение email
- ✅ Показать/скрыть пароль (Eye/EyeOff иконки)
- ✅ OAuth flow для расширения
- ✅ Автозаполнение последнего email

**Функционал Register:**
- ✅ Генерация безопасного пароля (кнопка "Генерировать")
- ✅ Валидация пароля в реальном времени
- ✅ Индикатор силы пароля
- ✅ Показать/скрыть пароль для обоих полей
- ✅ Индикатор совпадения паролей
- ✅ Поддержка реферальных кодов
- ✅ Автокопирование сгенерированного пароля

**Преимущества:**
- ✅ Лучше SEO (отдельные URL)
- ✅ Удобнее делиться ссылками
- ✅ Работает кнопка "Назад" в браузере
- ✅ Реферальные ссылки: `/register?ref=CODE`
- ✅ Весь функционал из модалок сохранен

---

## 🚀 Инструкции по развертыванию

### 1. Клонирование репозитория:

```bash
cd /srv
git clone https://github.com/your-repo/ebuster-origin-mono-main.git ebuster
cd ebuster
```

### 2. Настройка переменных окружения:

```bash
cp .env.example .env
nano .env
```

Заполните:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `JWT_SECRET`
- `SMTP_*` настройки

### 3. Сборка и запуск:

```bash
docker-compose build
docker-compose up -d
```

### 4. Проверка:

```bash
# Проверка API
curl https://api.ebuster.ru/api/health

# Проверка frontend
curl -I https://ebuster.ru

# Логи
docker-compose logs -f api
docker-compose logs -f frontend
```

### 5. Обновление кода:

```bash
cd /srv/ebuster
git pull origin main
docker-compose build --no-cache
docker-compose up -d
```

---

## 📝 Чеклист для деплоя:

- [ ] Клонирован репозиторий
- [ ] Настроен `.env` файл
- [ ] SSL сертификаты в `/srv/ebuster/ssl/`
- [ ] Docker контейнеры собраны
- [ ] Nginx конфигурация проверена
- [ ] База данных Supabase настроена
- [ ] SMTP настроен для email
- [ ] DNS записи указывают на VPS
- [ ] Cloudflare настроен
- [ ] Все домены работают (ebuster.ru, api.ebuster.ru, lk.ebuster.ru, admin.ebuster.ru)

---

## 🔧 Полезные команды:

```bash
# Перезапуск всех контейнеров
docker-compose restart

# Пересборка конкретного сервиса
docker-compose build --no-cache api
docker-compose up -d api

# Просмотр логов
docker-compose logs -f

# Вход в контейнер
docker-compose exec api sh

# Очистка
docker-compose down
docker system prune -a
```

---

**Проект готов к production использованию!** 🎉

Все компоненты интегрированы и работают на https://ebuster.ru
