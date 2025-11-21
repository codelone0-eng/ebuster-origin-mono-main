# Система разрешений (RBAC)

## Обзор

Полноценная система управления правами доступа (Role-Based Access Control) для платформы Ebuster. Позволяет детально настраивать доступ к каждому функционалу для разных ролей пользователей.

## Архитектура

### 1. Определение разрешений (`src/types/permissions.ts`)

Все разрешения определены в централизованном файле с детальным описанием:

```typescript
export const PERMISSIONS: Record<string, Permission> = {
  'scripts.view': {
    id: 'scripts.view',
    name: 'Просмотр скриптов',
    description: 'Просмотр списка скриптов в маркетплейсе',
    category: 'scripts'
  },
  // ... остальные разрешения
};
```

### 2. Категории разрешений

Разрешения сгруппированы по категориям для удобства управления:

- **scripts** - Управление скриптами
- **visual_builder** - Визуальный конструктор
- **marketplace** - Маркетплейс
- **profile** - Профиль пользователя
- **support** - Техническая поддержка
- **admin** - Администрирование
- **api** - Программный интерфейс
- **analytics** - Аналитика и отчёты

### 3. Предустановленные пресеты ролей

Готовые наборы разрешений для типовых ролей:

```typescript
export const ROLE_PRESETS = {
  user: [...],      // Базовые разрешения
  pro: [...],       // + создание скриптов
  premium: [...],   // + премиум функции
  moderator: [...], // + модерация
  admin: [...]      // Все разрешения
};
```

## Список всех разрешений

### Скрипты

| ID | Название | Описание |
|----|----------|----------|
| `scripts.view` | Просмотр скриптов | Просмотр списка скриптов в маркетплейсе |
| `scripts.download` | Скачивание скриптов | Скачивание бесплатных скриптов |
| `scripts.download_premium` | Скачивание Premium скриптов | Доступ к премиум скриптам |
| `scripts.create` | Создание скриптов | Создание собственных скриптов |
| `scripts.edit_own` | Редактирование своих скриптов | Редактирование собственных скриптов |
| `scripts.delete_own` | Удаление своих скриптов | Удаление собственных скриптов |
| `scripts.publish` | Публикация скриптов | Публикация скриптов в маркетплейс |
| `scripts.mark_premium` | Отметка Premium | Возможность помечать свои скрипты как Premium |
| `scripts.moderate` | Модерация скриптов | Модерация чужих скриптов |
| `scripts.edit_any` | Редактирование любых скриптов | Редактирование скриптов других пользователей |
| `scripts.delete_any` | Удаление любых скриптов | Удаление скриптов других пользователей |

### Визуальный конструктор

| ID | Название | Описание |
|----|----------|----------|
| `visual_builder.access` | Доступ к визуальному конструктору | Использование визуального конструктора скриптов |
| `visual_builder.save_to_extension` | Сохранение в расширение | Сохранение созданных скриптов напрямую в расширение |
| `visual_builder.export_code` | Экспорт кода | Экспорт сгенерированного кода |
| `visual_builder.advanced_blocks` | Продвинутые блоки | Доступ к продвинутым блокам (циклы, условия, API) |

### Маркетплейс

| ID | Название | Описание |
|----|----------|----------|
| `marketplace.view` | Просмотр маркетплейса | Доступ к маркетплейсу скриптов |
| `marketplace.rate` | Оценка скриптов | Возможность оценивать скрипты |
| `marketplace.comment` | Комментирование | Оставление комментариев к скриптам |
| `marketplace.report` | Жалобы | Отправка жалоб на скрипты |

### Профиль

| ID | Название | Описание |
|----|----------|----------|
| `profile.edit` | Редактирование профиля | Изменение данных профиля |
| `profile.avatar` | Загрузка аватара | Загрузка и изменение аватара |
| `profile.custom_badge` | Кастомный бейдж | Установка кастомного бейджа в профиле |
| `profile.referrals` | Реферальная программа | Доступ к реферальной программе |

### Поддержка

| ID | Название | Описание |
|----|----------|----------|
| `support.create_ticket` | Создание тикетов | Создание обращений в поддержку |
| `support.priority` | Приоритетная поддержка | Приоритетная обработка тикетов |
| `support.chat` | Чат поддержки | Доступ к онлайн-чату поддержки |
| `support.attachments` | Вложения в тикетах | Прикрепление файлов к тикетам |

### Администрирование

| ID | Название | Описание |
|----|----------|----------|
| `admin.access` | Доступ к админ-панели | Базовый доступ к админ-панели |
| `admin.users.view` | Просмотр пользователей | Просмотр списка пользователей |
| `admin.users.edit` | Редактирование пользователей | Изменение данных пользователей |
| `admin.users.ban` | Блокировка пользователей | Блокировка и разблокировка пользователей |
| `admin.users.delete` | Удаление пользователей | Удаление пользователей из системы |
| `admin.roles.manage` | Управление ролями | Создание и редактирование ролей |
| `admin.roles.assign` | Назначение ролей | Назначение ролей пользователям |
| `admin.scripts.manage` | Управление скриптами | Полное управление всеми скриптами |
| `admin.tickets.view` | Просмотр тикетов | Просмотр всех тикетов поддержки |
| `admin.tickets.manage` | Управление тикетами | Ответы и управление тикетами |
| `admin.monitoring` | Мониторинг системы | Доступ к мониторингу и логам |
| `admin.settings` | Настройки системы | Изменение глобальных настроек |

### API

| ID | Название | Описание |
|----|----------|----------|
| `api.access` | Доступ к API | Использование REST API |
| `api.webhooks` | Вебхуки | Настройка вебхуков |
| `api.extended_limits` | Расширенные лимиты API | Увеличенные лимиты запросов к API |

### Аналитика

| ID | Название | Описание |
|----|----------|----------|
| `analytics.view_own` | Своя аналитика | Просмотр статистики своих скриптов |
| `analytics.view_all` | Вся аналитика | Просмотр полной аналитики системы |
| `analytics.export` | Экспорт аналитики | Экспорт данных аналитики |

## Использование

### В компонентах

```typescript
import { useDetailedPermissions } from '@/hooks/useDetailedPermissions';

function MyComponent() {
  const { canAccessVisualBuilder, canMarkScriptPremium } = useDetailedPermissions();

  if (!canAccessVisualBuilder()) {
    return <UpgradePrompt feature="visual_builder" />;
  }

  return (
    <div>
      {canMarkScriptPremium() && (
        <Checkbox label="Отметить как Premium" />
      )}
    </div>
  );
}
```

### Проверка нескольких разрешений

```typescript
const { hasAllPermissions, hasAnyPermission } = useDetailedPermissions();

// Требуются ВСЕ разрешения
if (hasAllPermissions(['admin.users.view', 'admin.users.edit'])) {
  // Показать панель управления пользователями
}

// Требуется ХОТЯ БЫ ОДНО разрешение
if (hasAnyPermission(['scripts.moderate', 'admin.scripts.manage'])) {
  // Показать кнопку модерации
}
```

### В админ-панели

Компонент `RolesManagementV2` предоставляет полный UI для управления ролями:

- Создание/редактирование ролей
- Выбор разрешений по категориям
- Поиск и фильтрация разрешений
- Применение готовых пресетов
- Настройка лимитов

## Backend интеграция

### Структура таблицы roles

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]', -- Массив ID разрешений
  limits JSONB DEFAULT '{}',
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_subscription BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API endpoints

```
POST   /api/roles              - Создать роль
GET    /api/roles              - Получить список ролей
GET    /api/roles/:id          - Получить роль
PUT    /api/roles/:id          - Обновить роль
DELETE /api/roles/:id          - Удалить роль
POST   /api/roles/assign       - Назначить роль пользователю
```

### Пример ответа API

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "premium",
    "display_name": "Premium",
    "description": "Премиум подписка",
    "permissions": [
      "scripts.view",
      "scripts.download",
      "scripts.download_premium",
      "visual_builder.access",
      "visual_builder.save_to_extension"
    ],
    "limits": {
      "scripts": -1,
      "downloads_per_day": -1,
      "api_rate_limit": 10000,
      "storage_mb": 5000
    },
    "price_monthly": 990,
    "price_yearly": 9900,
    "is_active": true,
    "is_subscription": true
  }
}
```

## Миграция существующих ролей

Для миграции старой системы features/limits на новую систему разрешений:

```typescript
// Старая система
const oldRole = {
  features: {
    scripts: { can_create: true, can_publish: true },
    visual_builder: { enabled: true }
  }
};

// Новая система
const newRole = {
  permissions: [
    'scripts.create',
    'scripts.publish',
    'visual_builder.access'
  ]
};
```

## Рекомендации

1. **Всегда проверяйте разрешения на frontend И backend**
2. **Используйте готовые пресеты** для создания новых ролей
3. **Группируйте связанные разрешения** при проверке
4. **Логируйте попытки доступа** к защищённым функциям
5. **Кэшируйте разрешения пользователя** для производительности

## Примеры использования

### Ограничение доступа к визуальному конструктору

```typescript
// В Dashboard.tsx
const { canAccessVisualBuilder } = useDetailedPermissions();

<TabsTrigger value="visual-builder" disabled={!canAccessVisualBuilder()}>
  Визуальный конструктор
  {!canAccessVisualBuilder() && <Lock className="ml-2 h-4 w-4" />}
</TabsTrigger>
```

### Ограничение Premium функций

```typescript
// В ScriptEditor.tsx
const { canMarkScriptPremium } = useDetailedPermissions();

<Checkbox
  checked={isPremium}
  onCheckedChange={setIsPremium}
  disabled={!canMarkScriptPremium()}
  label="Отметить как Premium"
/>
```

### Условный рендеринг админ-функций

```typescript
// В AdminPanel.tsx
const { canManageRoles, canViewUsers } = useDetailedPermissions();

{canViewUsers() && <UsersTab />}
{canManageRoles() && <RolesTab />}
```

## Поддержка

При возникновении вопросов обращайтесь к документации или создавайте issue в репозитории.
