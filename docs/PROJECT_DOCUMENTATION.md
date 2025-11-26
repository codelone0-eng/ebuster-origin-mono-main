# EBUSTER - Полная Проектная Документация

## Оглавление

1. [Общая архитектура проекта](#общая-архитектура-проекта)
2. [Лендинг (ebuster.ru)](#лендинг-ebusterru)
3. [Личный кабинет (lk.ebuster.ru)](#личный-кабинет-lkebusterru)
4. [Админ-панель (admin.ebuster.ru)](#админ-панель-adminebusterru)
5. [База данных](#база-данных)
6. [API и потоки данных](#api-и-потоки-данных)
7. [Стили и дизайн-система](#стили-и-дизайн-система)
8. [Roadmap: Редизайн LK в стиль лендинга](#roadmap-редизайн-lk-в-стиль-лендинга)

---

## Общая архитектура проекта

### Технологический стек

**Frontend:**
- React 18.3.1
- TypeScript 5.8.3
- Vite 5.4.19
- React Router DOM 6.30.1
- Tailwind CSS 3.4.17
- shadcn/ui компоненты
- GSAP 3.13.0 (анимации)
- Lenis 1.3.11 (плавный скролл)
- Three.js 0.169.0 (@react-three/fiber, @react-three/drei)
- React Query (@tanstack/react-query) 5.83.0

**Backend:**
- Node.js + Express 5.1.0
- TypeScript
- Supabase (PostgreSQL)
- ClickHouse (аналитика)
- JWT аутентификация
- bcryptjs для хеширования паролей

**Инфраструктура:**
- Docker (Dockerfile.frontend, Dockerfile.api)
- Nginx (nginx.conf)
- Docker Compose

### Структура приложений

Проект использует **монорепозиторий** с разделением по поддоменам:

```
main.tsx
├── LandingApp (ebuster.ru, www.ebuster.ru)
├── DashboardApp (lk.ebuster.ru)
└── AdminApp (admin.ebuster.ru)
```

**Определение приложения:**
```typescript
// src/main.tsx
const hostname = window.location.hostname;
if (hostname === 'lk.ebuster.ru') {
  AppComponent = DashboardApp;
} else if (hostname === 'admin.ebuster.ru') {
  AppComponent = AdminApp;
} else {
  AppComponent = LandingApp; // ebuster.ru
}
```

### Общие провайдеры

Все приложения используют общие контексты:
- `LanguageProvider` - мультиязычность (ru/eng)
- `CursorProvider` - кастомный курсор
- `AuthProvider` - аутентификация
- `QueryClientProvider` - React Query
- `TooltipProvider` - shadcn/ui tooltips

---

## Лендинг (ebuster.ru)

### Структура

**Основной файл:** `src/LandingApp.tsx`

**Страницы:**
- `/` - `src/landing/Index.tsx` (главная)
- `/about` - `src/landing/About.tsx`
- `/price` - `src/landing/Pricing.tsx`
- `/contacts` - `src/landing/Contacts.tsx`
- `/roadmap` - `src/landing/Roadmap.tsx`
- `/privacy` - `src/landing/Privacy.tsx`
- `/terms` - `src/landing/Terms.tsx`
- `/login` - `src/pages/Login.tsx`
- `/register` - `src/pages/Register.tsx`
- `/forgot-password` - `src/lk/ForgotPassword.tsx`
- `/reset-password` - `src/lk/ResetPassword.tsx`
- `/confirm-email` - `src/lk/EmailConfirmation.tsx`
- `/verify-otp` - `src/pages/VerifyOtp.tsx`
- `/auth/extension` - `src/pages/ExtensionAuth.tsx`
- `/ban` - `src/landing/BanPage.tsx`
- `/404`, `/403`, `/500`, `/503` - страницы ошибок

### Стили лендинга

#### Цветовая схема

**Основной фон:**
- `bg-black` - черный фон (#000000)
- `bg-black/80` - полупрозрачный черный (80% opacity)
- `bg-black/50`, `bg-black/30`, `bg-black/60` - градиентные оверлеи

**Текст:**
- `text-white` - основной белый текст
- `text-white/60` - вторичный текст (60% opacity)
- `text-white/40` - третичный текст (40% opacity)

**Акценты:**
- Emerald: `text-emerald-300/70`, `border-emerald-300/20`, `bg-emerald-300/5`
- Белые границы: `border-white/10`, `border-white/20`

#### Компоненты фона

**1. Silk Background (`src/components/Silk.tsx`)**
- Three.js WebGL компонент
- Анимированный фоновый паттерн
- Параметры:
  - `speed={5}` - скорость анимации
  - `scale={1}` - масштаб
  - `color="#ffffff"` - цвет
  - `noiseIntensity={4.3}` - интенсивность шума
  - `rotation={0}` - вращение

**Использование:**
```tsx
<div className="fixed inset-0 z-0 pointer-events-none">
  <Silk speed={5} scale={1} color="#ffffff" noiseIntensity={4.3} rotation={0} />
</div>
```

**2. Gradient Overlay**
```tsx
<div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-[1] pointer-events-none" />
```

**3. BeamsUpstream (`src/components/ui/beams-upstream.tsx`)**
- Анимированные лучи вверх
- Используется глобально через провайдер

**4. CustomCursor (`src/components/CustomCursor.tsx`)**
- Кастомный курсор вместо системного
- z-index: 2147483651
- Отключен системный курсор через CSS: `cursor: none`

#### Структура страниц

**Типичная структура страницы лендинга:**

```tsx
<div className="min-h-screen bg-black overflow-x-hidden text-white">
  <SEO /> {/* Мета-теги */}
  <div className="relative">
    <Header /> {/* Навигация */}
    
    {/* Фоновые слои */}
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Silk ... />
    </div>
    <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-[1] pointer-events-none" />
    
    {/* Контент */}
    <div className="relative z-10">
      <main>
        {/* Секции контента */}
      </main>
      <Footer />
    </div>
  </div>
</div>
```

#### Анимации

**GSAP ScrollTrigger:**
- Появление элементов при скролле
- Параллакс эффекты
- Плавные переходы

**Lenis Smooth Scroll:**
- Плавная прокрутка страницы
- Интеграция с GSAP ScrollTrigger

**Пример анимации:**
```tsx
gsap.from(elements, {
  opacity: 0,
  y: 50,
  duration: 1,
  stagger: 0.15,
  ease: "power3.out"
});
```

#### Компоненты

**Header (`src/components/Header.tsx`):**
- Навигация
- Переключение языка
- Авторизация/регистрация
- Глобальный поиск (Ctrl+K)
- OAuth для расширения Chrome

**Footer (`src/components/Footer.tsx`):**
- Ссылки на страницы
- Социальные сети
- Копирайт

**FAQ (`src/components/FAQ.tsx`):**
- Аккордеон с вопросами
- Используется на главной странице

**SEO (`src/components/SEO.tsx`):**
- React Helmet Async
- Мета-теги для SEO
- Open Graph
- Twitter Cards

### Данные лендинга

**Источники данных:**

1. **Локализация:**
   - `src/lang/ru/` - русские переводы
   - `src/lang/eng/` - английские переводы
   - Хук `useLanguage()` для доступа

2. **API запросы:**
   - `/api/roles` - получение тарифов (Pricing страница)
   - `/api/auth/*` - аутентификация
   - `/api/user/*` - профиль пользователя

3. **Статические данные:**
   - Фичи, преимущества
   - FAQ
   - Контент страниц

---

## Личный кабинет (lk.ebuster.ru)

### Структура

**Основной файл:** `src/DashboardApp.tsx`

**Страницы:**
- `/dashboard` - `src/lk/Dashboard.tsx` (главная)
- `/ticket/:id` - `src/lk/TicketPage.tsx`
- `/verify-otp` - `src/pages/VerifyOtp.tsx`
- `/ban` - `src/landing/BanPage.tsx`

**Защита маршрутов:**
- `ProtectedRoute` компонент
- Проверка аутентификации
- Редирект на `/login` если не авторизован

### Стили LK (текущие)

#### Цветовая схема

**Тема: Graphite (темная)**
- Фон: `#1a1a1a` (dark --background)
- Карточки: `#202020` (dark --card)
- Текст: `#d9d9d9` (dark --foreground)
- Primary: `#a0a0a0` (dark --primary)
- Borders: `#606060` (dark --content-border)

**Компоненты:**
- `ParticleBackground` - частицы на фоне
- Стандартные shadcn/ui компоненты
- Градиентные кнопки (`GradientButton`)

#### Структура Dashboard

**Навигация:**
```typescript
navigationItems = [
  {
    id: 'scripts',
    children: ['scripts', 'installed', 'visual-builder']
  },
  { id: 'referral' },
  {
    id: 'support',
    children: ['support', 'support-open', 'support-resolved']
  },
  {
    id: 'settings',
    children: ['profile', 'settings']
  }
]
```

**Табы:**
- `scripts` - Библиотека скриптов
- `installed` - Установленные скрипты
- `visual-builder` - Визуальный конструктор
- `referral` - Реферальная программа
- `support` - Тикеты поддержки
- `profile` - Настройки профиля
- `settings` - Настройки аккаунта

#### Компоненты LK

**ScriptsList (`src/components/ScriptsList.tsx`):**
- Список скриптов
- Фильтрация и поиск
- Установка/удаление
- Рейтинги

**TicketsSystem (`src/lk/TicketsSystem.tsx`):**
- Список тикетов
- Создание нового тикета
- Фильтрация по статусу

**ReferralProgram (`src/lk/ReferralProgram.tsx`):**
- Реферальный код
- Статистика
- История рефералов
- Выплаты

**LoginHistory (`src/lk/LoginHistory.tsx`):**
- История входов
- IP адреса
- Браузеры
- Выход со всех устройств

**ApiKeysManagement (`src/components/ApiKeysManagement.tsx`):**
- Создание API ключей
- Управление ключами
- Права доступа

**VisualScriptBuilder (`src/lk/VisualScriptBuilder.tsx`):**
- Визуальный редактор скриптов
- Drag & drop интерфейс

### Данные LK

**API endpoints:**

1. **Профиль:**
   - `GET /api/user/profile?email={email}` - получение профиля
   - `POST /api/user/upsert` - обновление профиля
   - `GET /api/user/login-history` - история входов
   - `POST /api/user/logout-all-devices` - выход везде

2. **Скрипты:**
   - `GET /api/scripts/public` - публичные скрипты
   - `GET /api/scripts/user/installed` - установленные
   - `POST /api/scripts/user/install/{id}` - установка
   - `POST /api/scripts/user/uninstall/{id}` - удаление
   - `GET /api/scripts/public/{id}/ratings` - рейтинги
   - `POST /api/scripts/public/{id}/rate` - оценка
   - `POST /api/scripts/public/{id}/download` - скачивание

3. **Тикеты:**
   - `GET /api/tickets` - список тикетов
   - `GET /api/tickets/{id}` - детали тикета
   - `POST /api/tickets` - создание тикета
   - `POST /api/tickets/{id}/messages` - сообщение в тикет

4. **Рефералы:**
   - `GET /api/referral/user/{id}/code` - реферальный код
   - `GET /api/referral/user/{id}/stats` - статистика
   - `GET /api/referral/user/{id}/referrals` - список рефералов
   - `GET /api/referral/user/{id}/payouts` - выплаты

5. **API ключи:**
   - `GET /api/user/api-keys` - список ключей
   - `POST /api/user/api-keys` - создание
   - `PUT /api/user/api-keys/{id}` - обновление
   - `DELETE /api/user/api-keys/{id}` - удаление

6. **2FA:**
   - `POST /api/user/2fa/enable` - включение
   - `POST /api/user/2fa/disable` - отключение
   - `POST /api/user/2fa/verify` - проверка кода

7. **Подписки:**
   - `GET /api/subscriptions/my` - текущая подписка

**База данных (таблицы):**
- `users` - пользователи
- `scripts` - скрипты
- `user_scripts` - установленные скрипты
- `tickets` - тикеты
- `ticket_messages` - сообщения тикетов
- `api_keys` - API ключи
- `subscriptions` - подписки
- `login_history` - история входов
- `referrals` - рефералы

---

## Админ-панель (admin.ebuster.ru)

### Структура

**Основной файл:** `src/AdminApp.tsx`

**Страницы:**
- `/admin` - `src/admin/AdminDashboard.tsx`
- Управление пользователями, скриптами, ролями, подписками, тикетами, рефералами

### Стили админки

Использует ту же тему Graphite, что и LK.

---

## База данных

### Основные таблицы

#### 1. users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    role VARCHAR(50) DEFAULT 'user',
    role_id UUID,
    email_confirmed BOOLEAN DEFAULT false,
    is_banned BOOLEAN DEFAULT false,
    ban_reason TEXT,
    ban_expires_at TIMESTAMP,
    subscription_type VARCHAR(50) DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    subscription_id UUID,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret TEXT,
    two_factor_secret_temp TEXT,
    two_factor_backup_codes TEXT[],
    last_active TIMESTAMP,
    browser VARCHAR(255),
    location VARCHAR(255),
    downloads INTEGER DEFAULT 0,
    scripts INTEGER DEFAULT 0,
    referral_code VARCHAR(50) UNIQUE,
    referred_by UUID REFERENCES users(id),
    referral_earnings DECIMAL(10,2) DEFAULT 0,
    token_version BIGINT DEFAULT 0,
    reset_token TEXT,
    reset_token_expiry TIMESTAMP,
    confirmation_token TEXT,
    confirmation_token_expiry TIMESTAMP,
    otp TEXT,
    otp_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Индексы:**
- `idx_users_email` - поиск по email
- `idx_users_referral_code` - поиск по реферальному коду
- `idx_users_referred_by` - поиск рефералов
- `idx_users_status` - фильтрация по статусу
- `idx_users_role` - фильтрация по роли

#### 2. scripts

```sql
CREATE TABLE scripts (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    author_id UUID REFERENCES users(id),
    author_name VARCHAR(255),
    code TEXT NOT NULL,
    version VARCHAR(50) DEFAULT '1.0.0',
    downloads INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    tags TEXT[],
    icon_url TEXT,
    changelog TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_downloaded_at TIMESTAMP
);
```

**Индексы:**
- `idx_scripts_category` - фильтрация по категории
- `idx_scripts_author_id` - поиск по автору
- `idx_scripts_status` - фильтрация по статусу
- `idx_scripts_is_public` - публичные скрипты
- `idx_scripts_downloads` - сортировка по популярности
- `idx_scripts_created_at` - сортировка по дате

#### 3. script_versions

```sql
CREATE TABLE script_versions (
    id UUID PRIMARY KEY,
    script_id UUID REFERENCES scripts(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    code TEXT NOT NULL,
    changelog TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(script_id, version)
);
```

#### 4. user_scripts

```sql
CREATE TABLE user_scripts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    script_id UUID REFERENCES scripts(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    installed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, script_id)
);
```

#### 5. tickets

```sql
CREATE TABLE tickets (
    id UUID PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'open',
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    closed_at TIMESTAMP
);
```

#### 6. ticket_messages

```sql
CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_admin BOOLEAN DEFAULT false,
    message TEXT NOT NULL,
    attachments TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 7. api_keys

```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix VARCHAR(20) NOT NULL,
    name VARCHAR(255),
    permissions TEXT[] DEFAULT ARRAY['read'],
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);
```

#### 8. subscriptions

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    started_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    payment_method VARCHAR(100),
    amount DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'RUB',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 9. login_history

```sql
CREATE TABLE login_history (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    location VARCHAR(255),
    browser VARCHAR(100),
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 10. user_bans

```sql
CREATE TABLE user_bans (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    banned_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    banned_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    unbanned_at TIMESTAMP
);
```

#### 11. roles

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 12. script_categories

```sql
CREATE TABLE script_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 13. referrals

```sql
CREATE TABLE referrals (
    id UUID PRIMARY KEY,
    entry_type VARCHAR(10) DEFAULT 'code', -- code / use
    parent_id UUID REFERENCES referrals(id),
    referrer_id UUID NOT NULL REFERENCES users(id),
    referred_id UUID REFERENCES users(id),
    code VARCHAR(50),
    discount_type VARCHAR(20) DEFAULT 'percentage',
    discount_value DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    max_uses INTEGER,
    expires_at TIMESTAMP,
    reward_type VARCHAR(20) DEFAULT 'commission',
    reward_value DECIMAL(10,2) DEFAULT 0,
    reward_status VARCHAR(20) DEFAULT 'pending',
    reward_paid BOOLEAN DEFAULT false,
    subscription_id UUID REFERENCES subscriptions(id),
    status VARCHAR(50) DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    used_at TIMESTAMP
);
```

### ClickHouse (аналитика)

**Таблицы:**

1. **access_logs:**
   - HTTP логи запросов
   - Метрики для Activity & Users виджетов

2. **jobs:**
   - Фоновые задачи
   - Метрики для Application виджета

3. **system_logs:**
   - Системные логи (ошибки)
   - Метрики для Exceptions

---

## API и потоки данных

### Конфигурация API

**Файл:** `src/config/api.ts`

```typescript
API_CONFIG = {
  BASE_URL: 'https://api.ebuster.ru' (prod) / 'http://localhost:3001' (dev)
  AUTH_URL: '/api/auth'
  EMAIL_URL: '/api/email'
  USER_URL: '/api/user'
  ADMIN_URL: '/api/admin'
  SCRIPTS_URL: '/api/scripts'
}
```

### Основные endpoints

#### Auth (`/api/auth`)

- `POST /register` - регистрация
- `POST /login` - вход
- `POST /logout` - выход
- `GET /verify` - проверка токена
- `POST /confirm-email` - подтверждение email
- `POST /forgot-password` - запрос сброса пароля
- `POST /reset-password` - сброс пароля

#### User (`/api/user`)

- `GET /profile?email={email}` - профиль
- `POST /upsert` - создание/обновление профиля
- `GET /login-history` - история входов
- `POST /logout-all-devices` - выход везде
- `POST /2fa/enable` - включение 2FA
- `POST /2fa/disable` - отключение 2FA
- `POST /2fa/verify` - проверка 2FA кода
- `GET /api-keys` - список API ключей
- `POST /api-keys` - создание ключа
- `PUT /api-keys/:id` - обновление
- `DELETE /api-keys/:id` - удаление

#### Scripts (`/api/scripts`)

- `GET /public` - публичные скрипты
- `GET /public/:id` - детали скрипта
- `GET /public/:id/ratings` - рейтинги
- `POST /public/:id/rate` - оценка
- `POST /public/:id/download` - скачивание
- `GET /user/installed` - установленные
- `POST /user/install/:id` - установка
- `POST /user/uninstall/:id` - удаление
- `GET /admin` - админ: список
- `GET /admin/:id` - админ: детали
- `POST /admin` - админ: создание
- `PUT /admin/:id` - админ: обновление
- `DELETE /admin/:id` - админ: удаление

#### Tickets (`/api/tickets`)

- `GET /` - список тикетов
- `GET /:id` - детали тикета
- `POST /` - создание тикета
- `PUT /:id` - обновление
- `POST /:id/messages` - сообщение

#### Referral (`/api/referral`)

- `GET /user/:id/code` - реферальный код
- `GET /user/:id/stats` - статистика
- `GET /user/:id/referrals` - список рефералов
- `GET /user/:id/payouts` - выплаты

#### Roles (`/api/roles`)

- `GET /` - список ролей
- `GET /:id` - детали роли
- `POST /` - создание
- `PUT /:id` - обновление
- `DELETE /:id` - удаление

#### Subscriptions (`/api/subscriptions`)

- `GET /my` - текущая подписка
- `POST /` - создание
- `PUT /:id` - обновление
- `DELETE /:id` - отмена

### Потоки данных

#### Регистрация

```
LandingApp (/register)
  → POST /api/auth/register
    → Supabase: создание пользователя
    → POST /api/user/upsert (профиль)
    → Email: отправка подтверждения
  → Сохранение токена в localStorage
  → Редирект на /dashboard
```

#### Вход

```
LandingApp (/login)
  → POST /api/auth/login
    → Проверка пароля (bcrypt)
    → Генерация JWT токена
    → GET /api/user/profile (загрузка профиля)
  → Сохранение токена
  → Редирект на /dashboard
```

#### Установка скрипта

```
DashboardApp (ScriptsList)
  → POST /api/scripts/user/install/:id
    → Supabase: INSERT INTO user_scripts
    → Обновление счетчика downloads в scripts
  → Обновление UI
```

#### Создание тикета

```
DashboardApp (TicketsSystem)
  → POST /api/tickets
    → Supabase: INSERT INTO tickets
    → Генерация ticket_number
  → Редирект на /ticket/:id
```

---

## Стили и дизайн-система

### Tailwind Config

**Файл:** `tailwind.config.ts`

**Темы:**
- `:root` (light) - светлая тема
- `.dark` - темная тема (Graphite)
- `.green` - зеленая тема

**Цвета (CSS переменные):**

Light:
- `--background: #f0f0f0`
- `--foreground: #333333`
- `--primary: #606060`
- `--card: #f5f5f5`

Dark:
- `--background: #1a1a1a`
- `--foreground: #d9d9d9`
- `--primary: #a0a0a0`
- `--card: #202020`

Green:
- `--primary: #10b981`
- `--accent: #059669`

**Радиусы:**
- `--radius: 0.35rem`
- `lg: var(--radius)`
- `md: calc(var(--radius) - 2px)`
- `sm: calc(var(--radius) - 4px)`

**Тени:**
- `--shadow-2xs` до `--shadow-2xl`
- Градиентные тени с opacity

**Анимации:**
- `accordion-down/up` - аккордеон
- `fade-in` - появление
- `beam` - лучи
- `float` - плавание
- `glow` - свечение
- `gradient-shift` - градиент

### Глобальные стили

**Файл:** `src/index.css`

**Особенности:**
- Кастомный курсор отключен (`cursor: none`)
- Плавная прокрутка
- Кастомные скроллбары
- Glass эффекты
- Content borders (dashed)
- Градиентные кнопки

**Z-index система:**
- `src/styles/z-index.css`
- `src/config/z-index.config.ts`

### Компоненты shadcn/ui

Используются стандартные компоненты:
- Button, Card, Input, Select, Dialog, Toast, etc.
- Кастомизированы через CSS переменные

---

## Roadmap: Редизайн LK в стиль лендинга

### Цель

Привести интерфейс личного кабинета (lk.ebuster.ru) к единому стилю с лендингом (ebuster.ru), сохранив функциональность.

### Текущее состояние LK

**Стиль:**
- Темная тема Graphite (#1a1a1a)
- Стандартные shadcn/ui компоненты
- ParticleBackground
- Простые карточки без анимаций

**Проблемы:**
- Отсутствие визуальной связи с лендингом
- Нет анимаций и интерактивности
- Простой дизайн без "вау-эффекта"

### Целевой стиль (лендинг)

**Характеристики:**
- Черный фон (#000000)
- Silk background (Three.js)
- Gradient overlays
- GSAP анимации
- Плавный скролл (Lenis)
- Emerald акценты
- Glass эффекты
- Минималистичный дизайн

### Этапы редизайна

#### Этап 1: Фон и общая структура (1-2 дня)

**Задачи:**
1. ✅ Добавить Silk background в Dashboard
2. ✅ Добавить gradient overlays
3. ✅ Обновить цветовую схему на черный фон
4. ✅ Настроить z-index слои

**Файлы:**
- `src/lk/Dashboard.tsx`
- `src/DashboardApp.tsx`

**Изменения:**
```tsx
// Добавить в Dashboard.tsx
<div className="min-h-screen bg-black overflow-x-hidden text-white">
  {/* Silk background */}
  <div className="fixed inset-0 z-0 pointer-events-none">
    <Silk speed={5} scale={1} color="#ffffff" noiseIntensity={4.3} rotation={0} />
  </div>
  
  {/* Gradient overlay */}
  <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-[1] pointer-events-none" />
  
  {/* Content */}
  <div className="relative z-10">
    {/* Существующий контент */}
  </div>
</div>
```

#### Этап 2: Header и навигация (1 день)

**Задачи:**
1. ✅ Использовать тот же Header компонент что на лендинге
2. ✅ Добавить анимации появления
3. ✅ Обновить стили навигации

**Файлы:**
- `src/components/Header.tsx` (уже используется)
- `src/lk/Dashboard.tsx`

**Изменения:**
- Header уже общий, возможно нужны небольшие доработки для LK контекста

#### Этап 3: Карточки и компоненты (2-3 дня)

**Задачи:**
1. ✅ Обновить стили карточек (glass эффекты)
2. ✅ Добавить GSAP анимации появления
3. ✅ Обновить кнопки (градиентные)
4. ✅ Добавить hover эффекты

**Файлы:**
- `src/lk/Dashboard.tsx`
- `src/components/ScriptsList.tsx`
- `src/lk/TicketsSystem.tsx`
- `src/lk/ReferralProgram.tsx`
- Все компоненты LK

**Стили карточек:**
```tsx
<Card className="glass-effect glass-hover rounded-xl border border-white/10 bg-white/[0.02] p-8">
  {/* Контент */}
</Card>
```

**Анимации:**
```tsx
useEffect(() => {
  const cards = cardsRef.current.querySelectorAll('.dashboard-card');
  cards.forEach((card) => {
    gsap.fromTo(card,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          toggleActions: "play none none none",
        }
      }
    );
  });
}, []);
```

#### Этап 4: Табы и навигация внутри (1-2 дня)

**Задачи:**
1. ✅ Обновить стили табов
2. ✅ Добавить анимации переключения
3. ✅ Улучшить визуальную иерархию

**Файлы:**
- `src/lk/Dashboard.tsx` (навигация)

**Стили табов:**
- Emerald акценты
- Плавные переходы
- Активное состояние с подсветкой

#### Этап 5: Формы и инпуты (1 день)

**Задачи:**
1. ✅ Обновить стили форм
2. ✅ Добавить focus состояния
3. ✅ Улучшить валидацию визуально

**Файлы:**
- Все формы в LK
- `src/components/ui/input.tsx`
- `src/components/ui/textarea.tsx`

**Стили:**
- Темные границы
- Прозрачный фон
- Emerald focus

#### Этап 6: Модальные окна (1 день)

**Задачи:**
1. ✅ Обновить стили модалок
2. ✅ Добавить backdrop blur
3. ✅ Анимации открытия/закрытия

**Файлы:**
- Все модальные окна
- `src/components/ui/dialog.tsx`

#### Этап 7: Списки и таблицы (1-2 дня)

**Задачи:**
1. ✅ Обновить ScriptsList
2. ✅ Обновить TicketsSystem
3. ✅ Добавить hover эффекты
4. ✅ Улучшить визуализацию данных

**Файлы:**
- `src/components/ScriptsList.tsx`
- `src/lk/TicketsSystem.tsx`
- `src/lk/ReferralProgram.tsx`

#### Этап 8: Анимации и микроинтерактивность (2-3 дня)

**Задачи:**
1. ✅ Добавить Lenis smooth scroll
2. ✅ GSAP анимации для всех секций
3. ✅ Hover эффекты
4. ✅ Loading states
5. ✅ Transitions между табами

**Файлы:**
- `src/lk/Dashboard.tsx`
- Все компоненты LK

**Lenis:**
```tsx
useEffect(() => {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  
  const raf = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
  
  return () => lenis.destroy();
}, []);
```

#### Этап 9: Адаптивность (1-2 дня)

**Задачи:**
1. ✅ Проверить мобильную версию
2. ✅ Оптимизировать анимации для мобильных
3. ✅ Улучшить touch взаимодействия

#### Этап 10: Тестирование и полировка (2-3 дня)

**Задачи:**
1. ✅ Тестирование всех функций
2. ✅ Исправление багов
3. ✅ Оптимизация производительности
4. ✅ Финальная полировка

### Итоговый чеклист

- [ ] Silk background добавлен
- [ ] Gradient overlays настроены
- [ ] Цветовая схема обновлена
- [ ] Header обновлен
- [ ] Карточки с glass эффектами
- [ ] GSAP анимации добавлены
- [ ] Lenis smooth scroll
- [ ] Формы обновлены
- [ ] Модальные окна обновлены
- [ ] Списки и таблицы обновлены
- [ ] Микроинтерактивность
- [ ] Адаптивность проверена
- [ ] Тестирование пройдено

### Оценка времени

**Общее время:** 14-20 дней

**Разбивка:**
- Этап 1: 1-2 дня
- Этап 2: 1 день
- Этап 3: 2-3 дня
- Этап 4: 1-2 дня
- Этап 5: 1 день
- Этап 6: 1 день
- Этап 7: 1-2 дня
- Этап 8: 2-3 дня
- Этап 9: 1-2 дня
- Этап 10: 2-3 дня

### Приоритеты

**Высокий приоритет:**
- Этап 1 (фон)
- Этап 3 (карточки)
- Этап 8 (анимации)

**Средний приоритет:**
- Этап 2 (header)
- Этап 4 (табы)
- Этап 7 (списки)

**Низкий приоритет:**
- Этап 5 (формы)
- Этап 6 (модалки)
- Этап 9 (адаптив)
- Этап 10 (тестирование)

---

## Заключение

Документация описывает полную структуру проекта EBUSTER, включая:
- Архитектуру трех приложений (лендинг, LK, админка)
- Детальное описание стилей каждого поддомена
- Полную структуру базы данных
- API endpoints и потоки данных
- Подробный roadmap редизайна LK

Все изменения должны быть протестированы и не нарушать существующую функциональность.

