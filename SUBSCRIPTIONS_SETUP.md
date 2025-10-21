# Настройка системы подписок

## 1. Создание таблицы в Supabase

### Вариант А: С добавлением поля role (рекомендуется)

1. Откройте https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Сначала выполните `src/lib/add-role-field.sql` - это добавит поле `role` в таблицу `auth_users`
3. Затем выполните `src/lib/subscriptions-schema-with-role.sql` - это создаст таблицу подписок с правильными RLS политиками

### Вариант Б: Без поля role (проверка по email)

1. Откройте https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Выполните `src/lib/subscriptions-schema.sql`
3. В этом варианте админы проверяются по email ('admin@ebuster.ru', 'codelone0@gmail.com')

**Что создается:**
- Таблица `subscriptions` с необходимыми полями
- Поле `role` в таблице `auth_users` (только вариант А)
- Индексы для оптимизации
- RLS политики для безопасности
- Триггеры для автообновления
- Функции для проверки доступа

## 2. Проверка доступа к Premium скриптам

### В ScriptsList.tsx

Добавьте проверку подписки перед скачиванием:

```typescript
const handleDownloadScript = async (scriptId: string) => {
  const script = scripts.find(s => s.id === scriptId);
  
  // Проверяем требуется ли premium доступ
  if (script?.is_premium) {
    const user = await getCurrentUser();
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в систему для скачивания premium скриптов',
        variant: 'destructive'
      });
      return;
    }

    // Проверяем подписку
    const response = await fetch(`${API_CONFIG.ADMIN_URL}/subscriptions/check/${user.id}?required_plan=premium`);
    const data = await response.json();
    
    if (!data.data.has_access) {
      toast({
        title: 'Требуется Premium подписка',
        description: `Этот скрипт доступен только для ${script.is_premium ? 'Premium' : 'Pro'} пользователей`,
        variant: 'destructive'
      });
      return;
    }
  }

  // Продолжаем скачивание...
};
```

## 3. Использование в админке

### Создание подписки

1. Перейдите в админку → вкладка "Подписки"
2. Нажмите "Создать подписку"
3. Введите email пользователя
4. Выберите план (Premium, Pro, Enterprise)
5. Укажите длительность в месяцах
6. Нажмите "Создать"

### Управление подписками

- **Продление**: Нажмите "+1 мес" для продления на месяц
- **Отмена**: Нажмите кнопку с крестиком для отмены подписки
- **Редактирование**: Нажмите кнопку редактирования для изменения плана/статуса
- **Удаление**: Нажмите кнопку удаления (необратимо)

### Фильтрация

- Поиск по email или имени
- Фильтр по плану (Free, Premium, Pro, Enterprise)
- Фильтр по статусу (Активные, Пробные, Истекшие, Отмененные)

## 4. Планы подписок

### Free (Бесплатный)
- Базовые скрипты
- Ограниченная поддержка
- **Цена**: $0/мес

### Premium
- Все бесплатные функции
- Premium скрипты
- Приоритетная поддержка
- Без рекламы
- **Цена**: $9.99/мес

### Pro
- Все Premium функции
- Pro скрипты
- API доступ
- Расширенная аналитика
- Кастомные скрипты
- **Цена**: $29.99/мес

### Enterprise
- Все Pro функции
- Неограниченные скрипты
- Выделенная поддержка
- SLA гарантии
- Кастомная интеграция
- **Цена**: $99.99/мес

## 5. API Endpoints

### Получить все подписки
```
GET /api/admin/subscriptions
```

### Получить статистику
```
GET /api/admin/subscriptions/stats
```

### Создать подписку
```
POST /api/admin/subscriptions
Body: {
  user_email: string,
  plan: 'premium' | 'pro' | 'enterprise',
  duration_months: number,
  auto_renew: boolean
}
```

### Обновить подписку
```
PUT /api/admin/subscriptions/:id
Body: {
  plan?: string,
  status?: string,
  auto_renew?: boolean
}
```

### Отменить подписку
```
POST /api/admin/subscriptions/:id/cancel
```

### Продлить подписку
```
POST /api/admin/subscriptions/:id/renew
Body: { months: number }
```

### Удалить подписку
```
DELETE /api/admin/subscriptions/:id
```

### Проверить доступ
```
GET /api/admin/subscriptions/check/:user_id?required_plan=premium
```

## 6. Автоматическое истечение подписок

Для автоматического истечения подписок можно настроить cron job:

### Вариант 1: pg_cron (в Supabase)
```sql
SELECT cron.schedule(
  'expire-subscriptions',
  '0 0 * * *',  -- Каждый день в полночь
  'SELECT expire_subscriptions()'
);
```

### Вариант 2: Node.js cron
```typescript
import cron from 'node-cron';

cron.schedule('0 0 * * *', async () => {
  await fetch(`${API_CONFIG.BASE_URL}/api/admin/subscriptions/expire`, {
    method: 'POST'
  });
});
```

## 7. Интеграция с платежными системами

Для интеграции с Stripe/PayPal добавьте webhook endpoints:

```typescript
// В server.ts
app.post('/api/webhooks/stripe', async (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'customer.subscription.created':
      // Создать подписку в БД
      break;
    case 'customer.subscription.updated':
      // Обновить подписку
      break;
    case 'customer.subscription.deleted':
      // Отменить подписку
      break;
  }
  
  res.json({ received: true });
});
```

## 8. Тестирование

1. Создайте тестовую подписку для своего пользователя
2. Попробуйте скачать premium скрипт
3. Измените план подписки
4. Проверьте истечение подписки (измените `end_date` в БД)

## 9. Деплой

```bash
# Закоммитить изменения
git add .
git commit -m "Add subscription management system"
git push

# На сервере
cd /srv/ebuster
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 10. Мониторинг

Следите за:
- Количеством активных подписок
- Месячным доходом
- Конверсией из trial в платные
- Процентом отмен (churn rate)

Все метрики доступны в админке на вкладке "Подписки".
