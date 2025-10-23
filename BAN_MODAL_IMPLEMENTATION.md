# Реализация модального окна бана пользователя

## ✅ Что сделано:

### 1. Извлечены параметры бана из BanPage.tsx

Из `src/landing/BanPage.tsx` извлечены все параметры блокировки:

- **reason** - Причина блокировки
- **banDate** - Дата блокировки
- **unbanDate** - Дата разблокировки  
- **banType** - Тип: "Временная блокировка" или "Постоянная блокировка"
- **banDuration** - Длительность (например: "30 дней")
- **remainingDays** - Оставшиеся дни
- **contactEmail** - Email поддержки
- **banId** - ID блокировки
- **moderator** - Модератор

---

### 2. Добавлен новый API метод `banUser`

**Файл:** `src/hooks/useAdminApi.ts`

```typescript
const banUser = async (id: string, banData: {
  reason: string;
  banType: 'temporary' | 'permanent';
  duration?: number;
  durationUnit?: 'hours' | 'days' | 'months';
  contactEmail?: string;
}): Promise<User> => {
  const response = await fetchWithAuth(`/api/admin/users/${id}/ban`, {
    method: 'POST',
    body: JSON.stringify(banData)
  });
  return response.data;
};
```

---

### 3. Создано модальное окно бана

**Файл:** `src/admin/AdminDashboard.tsx`

#### Добавлены состояния:
```typescript
const [showBanModal, setShowBanModal] = useState(false);
const [userToBan, setUserToBan] = useState(null);
const [banReason, setBanReason] = useState('');
const [banType, setBanType] = useState<'temporary' | 'permanent'>('temporary');
const [banDuration, setBanDuration] = useState(30);
const [banDurationUnit, setBanDurationUnit] = useState<'hours' | 'days' | 'months'>('days');
const [banContactEmail, setBanContactEmail] = useState('support@ebuster.ru');
```

#### Обновлена функция `handleBanUser`:
```typescript
const handleBanUser = (user: any) => {
  setUserToBan(user);
  setShowBanModal(true);
  // Сбрасываем форму
  setBanReason('');
  setBanType('temporary');
  setBanDuration(30);
  setBanDurationUnit('days');
  setBanContactEmail('support@ebuster.ru');
};
```

#### Добавлена функция `submitBanUser`:
```typescript
const submitBanUser = async () => {
  if (!userToBan) return;
  
  if (!banReason.trim()) {
    toast({
      title: "Ошибка",
      description: "Укажите причину блокировки",
      variant: "destructive"
    });
    return;
  }

  try {
    await adminApi.banUser(userToBan.id, {
      reason: banReason,
      banType,
      duration: banType === 'temporary' ? banDuration : undefined,
      durationUnit: banType === 'temporary' ? banDurationUnit : undefined,
      contactEmail: banContactEmail
    });
    
    // Обновляем локальное состояние
    setRecentUsers(prev => prev.map(user => 
      user.id === userToBan.id ? { ...user, status: 'banned' } : user
    ));
    
    setShowBanModal(false);
    setUserToBan(null);
    
    toast({
      title: "Пользователь заблокирован",
      description: "Блокировка успешно применена",
      variant: "success"
    });
  } catch (error) {
    toast({
      title: "Ошибка",
      description: "Не удалось забанить пользователя",
      variant: "destructive"
    });
  }
};
```

---

## 🎨 Модальное окно содержит:

### 1. Тип блокировки (Select)
- Временная блокировка
- Постоянная блокировка

### 2. Длительность (только для временной)
- Input: число (например: 30)
- Select: единица времени
  - Часов
  - Дней
  - Месяцев

### 3. Причина блокировки (Textarea)
- Обязательное поле
- Placeholder: "Нарушение правил сообщества - спам и нежелательный контент"
- Пользователь увидит это сообщение

### 4. Email поддержки (Input)
- Default: support@ebuster.ru
- Для связи с поддержкой

### 5. Предпросмотр
- Показывает все параметры бана перед применением
- Тип, длительность, причина

---

## 🚀 Как использовать:

### 1. Открыть админку
```
http://localhost:5173/admin
```

### 2. Найти пользователя
- В разделе "Управление пользователями"
- Или в детальной информации о пользователе

### 3. Нажать кнопку "Забанить пользователя"
- Иконка: Ban
- Кнопка появляется только если пользователь не забанен

### 4. Заполнить форму
1. Выбрать тип блокировки
2. Если временная - указать длительность
3. Написать причину (обязательно!)
4. При необходимости изменить email поддержки
5. Проверить предпросмотр

### 5. Нажать "Заблокировать пользователя"
- Бан применяется мгновенно
- Пользователь видит страницу BanPage
- Показывается уведомление об успехе

---

## 📊 Пример использования:

### Временная блокировка на 7 дней:
```
Тип: Временная блокировка
Длительность: 7 дней
Причина: Нарушение правил - спам в комментариях
Email: support@ebuster.ru
```

### Постоянная блокировка:
```
Тип: Постоянная блокировка
Причина: Серьезное нарушение правил - мошенничество
Email: support@ebuster.ru
```

---

## 🔧 Что нужно добавить на бэкенде:

### Endpoint: `POST /api/admin/users/:id/ban`

**Request Body:**
```json
{
  "reason": "Нарушение правил сообщества",
  "banType": "temporary",
  "duration": 30,
  "durationUnit": "days",
  "contactEmail": "support@ebuster.ru"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "status": "banned",
    "banInfo": {
      "reason": "Нарушение правил сообщества",
      "banDate": "2024-01-15T14:30:00Z",
      "unbanDate": "2024-02-15T14:30:00Z",
      "banType": "temporary",
      "banDuration": "30 дней",
      "remainingDays": 30,
      "contactEmail": "support@ebuster.ru",
      "banId": "BAN-2024-001",
      "moderator": "admin@ebuster.ru"
    }
  }
}
```

**Логика:**
1. Проверить права администратора
2. Валидировать данные
3. Рассчитать `unbanDate` на основе `duration` и `durationUnit`
4. Сгенерировать `banId` (формат: BAN-YYYY-NNN)
5. Сохранить в таблицу `user_bans`
6. Обновить статус пользователя на `banned`
7. Отправить email пользователю о блокировке
8. Завершить все активные сессии пользователя

---

## 📝 Таблица БД `user_bans`:

```sql
CREATE TABLE user_bans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ban_id VARCHAR(50) UNIQUE NOT NULL,
  reason TEXT NOT NULL,
  ban_type VARCHAR(20) NOT NULL, -- 'temporary' or 'permanent'
  ban_date TIMESTAMP NOT NULL DEFAULT NOW(),
  unban_date TIMESTAMP, -- NULL для permanent
  duration INTEGER, -- в часах
  contact_email VARCHAR(255) DEFAULT 'support@ebuster.ru',
  moderator_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX idx_user_bans_ban_id ON user_bans(ban_id);
CREATE INDEX idx_user_bans_unban_date ON user_bans(unban_date);
```

---

## ✅ Итоговый чеклист:

- [x] Извлечены параметры из BanPage.tsx
- [x] Добавлен метод `banUser` в useAdminApi.ts
- [x] Созданы состояния для формы бана
- [x] Обновлена функция `handleBanUser`
- [x] Добавлена функция `submitBanUser`
- [x] Создано модальное окно с формой
- [x] Добавлена валидация (обязательная причина)
- [x] Добавлен предпросмотр параметров
- [x] Обновлены все вызовы `handleBanUser`
- [ ] Реализовать endpoint на бэкенде
- [ ] Создать таблицу `user_bans`
- [ ] Добавить автоматическую разблокировку (cron job)
- [ ] Добавить отправку email пользователю

---

**Готово к использованию!** 🎉
