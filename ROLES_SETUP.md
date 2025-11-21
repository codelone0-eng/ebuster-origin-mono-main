# Настройка ролей и разрешений

## Дефолтные роли

Система автоматически создаёт две базовые роли:

### 1. **user** (Пользователь)
- Назначается всем новым пользователям по умолчанию
- Базовые разрешения:
  - Просмотр скриптов
  - Скачивание бесплатных скриптов
  - Просмотр маркетплейса
  - Оценка и комментирование
  - Редактирование профиля
  - Создание тикетов поддержки

### 2. **admin** (Администратор)
- Полный доступ ко всем функциям
- Все 60+ разрешений
- Неограниченные лимиты

## Миграция базы данных

Запустите миграцию для создания дефолтных ролей:

```sql
-- Файл: migrations/002_default_roles.sql
psql -d your_database -f migrations/002_default_roles.sql
```

Миграция:
1. Создаст роли `user` и `admin`
2. Назначит роль `user` всем существующим пользователям без роли
3. Установит `user` как роль по умолчанию для новых пользователей

## Управление ролями через админ-панель

### Создание кастомной роли

1. Откройте админ-панель → **Роли**
2. Нажмите **"Создать роль"**
3. Заполните основные данные:
   - Системное имя (например: `pro`, `premium`)
   - Отображаемое имя (например: `Pro`, `Premium`)
   - Описание
   - Цены (месяц/год)

4. Выберите разрешения:
   - Используйте поиск для быстрого нахождения
   - Фильтруйте по категориям
   - Выбирайте/снимайте все в категории
   - Или примените готовый пресет

5. Настройте лимиты:
   - Максимум скриптов (-1 = неограниченно)
   - Загрузок в день
   - API запросов в час
   - Хранилище (МБ)

6. Сохраните роль

### Применение пресетов

Быстро создайте типовую роль:

- **user** - базовые разрешения (7)
- **pro** - + создание скриптов (17)
- **premium** - + премиум функции (27)
- **moderator** - + модерация (36)
- **admin** - все разрешения (60+)

## Управление доступом к скриптам

При создании/редактировании скрипта:

1. Откройте форму создания скрипта
2. Прокрутите до раздела **"Доступ для ролей"**
3. Выберите роли, которым доступен скрипт:
   - ✅ **user** - доступно всем пользователям
   - ✅ **pro** - только для Pro подписчиков
   - ✅ **premium** - только для Premium
   - ✅ **admin** - только для администраторов

4. Можно выбрать несколько ролей
5. Минимум одна роль должна быть выбрана

### Примеры использования

**Бесплатный скрипт для всех:**
```
Allowed roles: [user, pro, premium, admin]
```

**Premium скрипт:**
```
Allowed roles: [premium, admin]
```

**Только для Pro:**
```
Allowed roles: [pro, premium, admin]
```

**Внутренний инструмент:**
```
Allowed roles: [admin]
```

## Проверка разрешений в коде

### Frontend

```typescript
import { useDetailedPermissions } from '@/hooks/useDetailedPermissions';

function MyComponent() {
  const { canDownloadPremiumScripts, canAccessVisualBuilder } = useDetailedPermissions();

  if (!canAccessVisualBuilder()) {
    return <UpgradePrompt />;
  }

  return (
    <div>
      {canDownloadPremiumScripts() && (
        <Button>Скачать Premium скрипт</Button>
      )}
    </div>
  );
}
```

### Backend (Node.js/Express)

```javascript
// Middleware для проверки разрешений
function requirePermission(permissionId) {
  return async (req, res, next) => {
    const user = req.user;
    
    // Админы имеют все права
    if (user.role === 'admin') {
      return next();
    }
    
    // Проверяем разрешение
    const userPermissions = user.permissions || [];
    if (!userPermissions.includes(permissionId)) {
      return res.status(403).json({
        success: false,
        error: 'Недостаточно прав'
      });
    }
    
    next();
  };
}

// Использование
app.post('/api/scripts', 
  requirePermission('scripts.create'),
  createScript
);

app.get('/api/scripts/premium/:id/download',
  requirePermission('scripts.download_premium'),
  downloadPremiumScript
);
```

### Проверка доступа к скрипту

```javascript
// При скачивании скрипта
async function downloadScript(req, res) {
  const script = await getScript(req.params.id);
  const user = req.user;
  
  // Проверяем, есть ли роль пользователя в allowed_roles скрипта
  const userRole = user.role_name || user.role;
  const allowedRoles = script.allowed_roles || ['user'];
  
  if (!allowedRoles.includes(userRole) && userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Этот скрипт доступен только для подписчиков',
      required_roles: allowedRoles
    });
  }
  
  // Разрешаем скачивание
  res.download(script.file_path);
}
```

## Структура базы данных

### Таблица `roles`

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]',
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

### Таблица `scripts`

Добавьте поле `allowed_roles`:

```sql
ALTER TABLE scripts 
ADD COLUMN allowed_roles JSONB DEFAULT '["user"]';
```

### Таблица `users`

Убедитесь, что есть связь с ролями:

```sql
ALTER TABLE users 
ADD COLUMN role_id UUID REFERENCES roles(id),
ADD COLUMN permissions JSONB DEFAULT '[]';

-- Установить роль по умолчанию
ALTER TABLE users 
ALTER COLUMN role_id SET DEFAULT (
  SELECT id FROM roles WHERE name = 'user' LIMIT 1
);
```

## Рекомендации

1. **Не удаляйте роли `user` и `admin`** - они системные
2. **Всегда проверяйте разрешения на backend** - frontend проверки легко обойти
3. **Используйте пресеты** для создания новых ролей
4. **Логируйте попытки доступа** к защищённым функциям
5. **Кэшируйте разрешения** пользователя для производительности

## Troubleshooting

### Пользователь не может скачать скрипт

1. Проверьте роль пользователя: `SELECT role_name FROM users WHERE id = ?`
2. Проверьте `allowed_roles` скрипта: `SELECT allowed_roles FROM scripts WHERE id = ?`
3. Убедитесь, что роль пользователя есть в `allowed_roles`

### Разрешение не работает

1. Проверьте, что разрешение добавлено в роль
2. Проверьте, что роль активна (`is_active = true`)
3. Проверьте, что пользователь имеет эту роль
4. Очистите кэш разрешений (если используется)

### Миграция не применилась

```sql
-- Проверьте наличие ролей
SELECT * FROM roles WHERE name IN ('user', 'admin');

-- Если ролей нет, запустите миграцию вручную
-- Скопируйте содержимое migrations/002_default_roles.sql
```
