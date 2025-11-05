# План реализации системы ролей и подписок

## 🎯 Цель
Создать гибкую систему управления ролями, подписками и правами доступа с полной интеграцией во фронтенд и бэкенд.

---

## 📊 Архитектура

### 1. База данных (Supabase)

#### Таблица `roles` (роли)
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL, -- free, pro, premium, admin
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  features JSONB NOT NULL DEFAULT '{}', -- JSON с возможностями
  limits JSONB NOT NULL DEFAULT '{}', -- JSON с лимитами
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Пример features:**
```json
{
  "scripts": {
    "max_count": 10,
    "can_create": true,
    "can_publish": true,
    "can_feature": false,
    "can_premium": false
  },
  "downloads": {
    "max_per_day": 50,
    "unlimited": false
  },
  "support": {
    "priority": false,
    "chat": false
  },
  "api": {
    "enabled": false,
    "rate_limit": 100
  },
  "storage": {
    "max_size_mb": 100
  }
}
```

#### Таблица `subscriptions` (подписки)
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id),
  status VARCHAR(20) NOT NULL, -- active, cancelled, expired, trial
  billing_period VARCHAR(20), -- monthly, yearly, lifetime
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT true,
  payment_method VARCHAR(50),
  last_payment_date TIMESTAMP,
  next_payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Таблица `user_permissions` (кастомные права)
```sql
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  permission_key VARCHAR(100) NOT NULL,
  permission_value JSONB NOT NULL,
  granted_by UUID REFERENCES auth_users(id),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Обновление таблицы `auth_users`
```sql
ALTER TABLE auth_users ADD COLUMN role_id UUID REFERENCES roles(id);
ALTER TABLE auth_users ADD COLUMN subscription_id UUID REFERENCES subscriptions(id);
```

---

### 2. Backend API

#### Новые endpoints

**Роли:**
- `GET /api/roles` - список всех ролей (публичный)
- `GET /api/roles/:id` - детали роли
- `POST /api/roles` - создать роль (только админ)
- `PUT /api/roles/:id` - обновить роль (только админ)
- `DELETE /api/roles/:id` - удалить роль (только админ)

**Подписки:**
- `GET /api/subscriptions/my` - моя подписка
- `POST /api/subscriptions/subscribe` - оформить подписку
- `POST /api/subscriptions/cancel` - отменить подписку
- `POST /api/subscriptions/renew` - продлить подписку
- `GET /api/subscriptions/history` - история подписок

**Права:**
- `GET /api/permissions/my` - мои права
- `POST /api/permissions/check` - проверить право
- `POST /api/permissions/grant` - выдать право (только админ)
- `DELETE /api/permissions/revoke` - отозвать право (только админ)

#### Middleware для проверки прав

```typescript
// src/api/permissions.middleware.ts
export const checkPermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const hasPermission = await permissionsService.check(user.id, permission);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};
```

---

### 3. Frontend

#### Новые компоненты

**1. `src/components/SubscriptionBadge.tsx`**
- Отображает текущую роль пользователя
- Показывает срок действия подписки
- Кнопка "Upgrade" для бесплатных пользователей

**2. `src/components/PricingPlans.tsx`**
- Карточки с планами подписок
- Сравнение возможностей
- Кнопки оформления подписки

**3. `src/components/FeatureGate.tsx`**
- HOC для ограничения доступа к функциям
```tsx
<FeatureGate feature="scripts.can_create" fallback={<UpgradePrompt />}>
  <CreateScriptButton />
</FeatureGate>
```

**4. `src/admin/RolesManagement.tsx`**
- Управление ролями
- Редактирование features и limits
- Назначение ролей пользователям

**5. `src/admin/SubscriptionsManagement.tsx`**
- Просмотр всех подписок
- Ручное управление подписками
- Статистика по подпискам

#### Hooks

**1. `src/hooks/useSubscription.ts`**
```typescript
export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkFeature = (feature: string) => {
    // Проверка доступности функции
  };

  const hasLimit = (limit: string, value: number) => {
    // Проверка лимита
  };

  return { subscription, role, checkFeature, hasLimit, loading };
};
```

**2. `src/hooks/usePermissions.ts`**
```typescript
export const usePermissions = () => {
  const checkPermission = async (permission: string) => {
    // Проверка права
  };

  return { checkPermission };
};
```

---

### 4. Интеграция с существующим функционалом

#### Скрипты
- Проверка лимита на количество скриптов
- Ограничение на публикацию скриптов
- Доступ к premium скриптам только для premium пользователей

#### Загрузки
- Лимит на количество загрузок в день
- Unlimited для premium пользователей

#### API
- Rate limiting в зависимости от роли
- Доступ к API только для pro+ пользователей

#### Поддержка
- Приоритетная поддержка для premium
- Доступ к чату для pro+

---

### 5. Миграция данных

```sql
-- Создаем базовые роли
INSERT INTO roles (name, display_name, description, price_monthly, price_yearly, features, limits) VALUES
('free', 'Free', 'Бесплатный план', 0, 0, 
  '{"scripts": {"max_count": 5, "can_create": true, "can_publish": false}, "downloads": {"max_per_day": 10}}',
  '{"scripts": 5, "downloads_per_day": 10}'
),
('pro', 'Pro', 'Профессиональный план', 299, 2990,
  '{"scripts": {"max_count": 50, "can_create": true, "can_publish": true}, "downloads": {"max_per_day": 100}, "support": {"priority": true}}',
  '{"scripts": 50, "downloads_per_day": 100}'
),
('premium', 'Premium', 'Премиум план', 999, 9990,
  '{"scripts": {"max_count": -1, "can_create": true, "can_publish": true, "can_feature": true}, "downloads": {"unlimited": true}, "support": {"priority": true, "chat": true}, "api": {"enabled": true}}',
  '{"scripts": -1, "downloads_per_day": -1}'
);

-- Назначаем всем существующим пользователям роль free
UPDATE auth_users SET role_id = (SELECT id FROM roles WHERE name = 'free') WHERE role_id IS NULL;
```

---

### 6. UI/UX изменения

#### Dashboard
- Показывать текущую роль и подписку
- Прогресс-бар использования лимитов
- Кнопка "Upgrade" если достигнут лимит

#### Pricing Page
- Новая страница `/pricing` с планами
- Сравнительная таблица возможностей
- FAQ по подпискам

#### Admin Panel
- Новый раздел "Roles & Subscriptions"
- Управление ролями
- Просмотр и управление подписками пользователей

---

### 7. Тестирование

- [ ] Unit тесты для permissions service
- [ ] Integration тесты для subscription flow
- [ ] E2E тесты для upgrade/downgrade
- [ ] Тестирование лимитов
- [ ] Тестирование миграции данных

---

### 8. Документация

- [ ] API документация для новых endpoints
- [ ] Документация для администраторов
- [ ] Пользовательская документация по подпискам
- [ ] Changelog с описанием изменений

---

## 🚀 План внедрения (по этапам)

### Этап 1: База данных и Backend (2-3 дня)
1. Создать таблицы roles, subscriptions, user_permissions
2. Написать controllers и routes
3. Реализовать permissions middleware
4. Создать базовые роли

### Этап 2: Frontend Core (2-3 дня)
1. Создать hooks useSubscription и usePermissions
2. Реализовать FeatureGate компонент
3. Добавить SubscriptionBadge в Header
4. Интегрировать проверки прав в существующие компоненты

### Этап 3: Admin Panel (1-2 дня)
1. Создать RolesManagement
2. Создать SubscriptionsManagement
3. Добавить в админ меню

### Этап 4: Pricing & Subscription Flow (2-3 дня)
1. Создать страницу /pricing
2. Реализовать процесс оформления подписки
3. Интеграция с платежной системой (если нужно)

### Этап 5: Интеграция и тестирование (2-3 дня)
1. Интегрировать проверки во все функции
2. Тестирование всех сценариев
3. Исправление багов

### Этап 6: Документация и деплой (1 день)
1. Написать документацию
2. Создать миграцию для продакшена
3. Деплой

**Общее время: 10-15 дней**

---

## ⚠️ Важные моменты

1. **Обратная совместимость**: Все существующие пользователи получают роль "free"
2. **Graceful degradation**: Если проверка прав не работает, даем доступ (fail-open)
3. **Кеширование**: Кешировать роли и права пользователя
4. **Логирование**: Логировать все изменения ролей и подписок
5. **Безопасность**: Все проверки прав на бэкенде, фронтенд только для UX

---

## 📝 Следующие шаги

1. Согласовать архитектуру
2. Определить точные features и limits для каждой роли
3. Выбрать платежную систему (если нужна)
4. Начать разработку с Этапа 1
