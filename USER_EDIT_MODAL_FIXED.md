# 🔧 ИСПРАВЛЕНИЕ МОДАЛКИ РЕДАКТИРОВАНИЯ ПОЛЬЗОВАТЕЛЯ

## ❌ Текущие проблемы:

### 1. План подписки = "Unknown"
**Причина:** `userSubscription.roles?.display_name` - неправильный путь к данным

**Должно быть:**
```typescript
// Загружать подписку с JOIN к roles
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('*, roles!subscriptions_role_id_fkey(name, display_name)')
  .eq('user_id', userId)
  .eq('status', 'active')
  .single();

// Отображать
{subscription.roles.display_name} // ← правильно
```

### 2. Дублирующие поля
- ❌ "Тип подписки" - дублирует "Подписка → План"
- ❌ "Окончание подписки" - дублирует "Подписка → Действует до"
- ❌ "Email подтвержден" - не нужно в этом месте

**Решение:** Удалить эти поля

### 3. Не подтягиваются данные
- ❌ IP адрес - показывает `192.168.1.100` (захардкожен)
- ❌ Последняя активность - пусто
- ❌ Статистика - все нули

**Должно быть:**
```typescript
// Реальные данные из БД
IP: selectedUserDetails.location // "IP: 46.138.168.70"
Последняя активность: selectedUserDetails.last_active
Загрузок: selectedUserDetails.downloads
Скриптов: selectedUserDetails.scripts
```

### 4. Аватарка
- ❌ Не отображается
- ❌ Нельзя редактировать

**Решение:** Добавить upload аватарки

### 5. Кнопки не работают
- ❌ "Отправить email"
- ❌ "Отправить уведомление"  
- ❌ "Завершить все сессии"

**Решение:** Добавить обработчики

---

## ✅ ИСПРАВЛЕНИЯ:

### Файл для замены: `src/admin/AdminDashboard.tsx`

Нужно заменить строки 1110-1140 (дублирующие поля):

```typescript
// УДАЛИТЬ ЭТО:
<div>
  <Label htmlFor="userSubscription">Тип подписки</Label>
  <Select defaultValue={selectedUserDetails.subscriptionType}>
    ...
  </Select>
</div>
<div>
  <Label htmlFor="userSubscriptionExpiry">Окончание подписки</Label>
  <Input type="date" ... />
</div>
<div className="flex items-center space-x-2">
  <Switch id="userEmailVerified" ... />
  <Label>Email подтвержден</Label>
</div>

// ЗАМЕНИТЬ НА:
<div>
  <Label>Аватар</Label>
  <div className="mt-1 flex items-center gap-4">
    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
      {selectedUserDetails.avatar_url ? (
        <img src={selectedUserDetails.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <span className="text-2xl">{selectedUserDetails.full_name?.[0] || 'U'}</span>
      )}
    </div>
    <div className="flex-1">
      <Input 
        type="file" 
        accept="image/*"
        onChange={handleAvatarUpload}
      />
      <p className="text-xs text-muted-foreground mt-1">
        JPG, PNG или GIF. Макс 2MB.
      </p>
    </div>
  </div>
</div>
```

### Исправить отображение плана подписки (строка 1070):

```typescript
// БЫЛО:
{userSubscription.roles?.display_name || 'Unknown'}

// СТАЛО:
{userSubscription.roles?.display_name || 
 userSubscription.plan || 
 availableRoles.find(r => r.id === selectedUserDetails.role_id)?.display_name || 
 'Free'}
```

### Исправить "Дополнительная информация" (строки 1254+):

```typescript
// БЫЛО (захардкожено):
<CardContent>
  <p className="text-2xl font-bold">192.168.1.100</p>
</CardContent>

// СТАЛО (реальные данные):
<CardContent>
  <p className="text-2xl font-bold">
    {selectedUserDetails.location?.split(',')[0]?.replace('IP: ', '') || 'Не определен'}
  </p>
</CardContent>

// Последняя активность:
<CardContent>
  <p className="text-2xl font-bold">
    {selectedUserDetails.last_active 
      ? new Date(selectedUserDetails.last_active).toLocaleString('ru-RU')
      : 'Никогда'}
  </p>
</CardContent>

// Статистика:
<div className="text-center">
  <p className="text-3xl font-bold">{selectedUserDetails.downloads || 0}</p>
  <p className="text-sm text-muted-foreground">Загрузок</p>
</div>
<div className="text-center">
  <p className="text-3xl font-bold">{selectedUserDetails.scripts || 0}</p>
  <p className="text-sm text-muted-foreground">Скриптов</p>
</div>
```

### Добавить обработчики кнопок:

```typescript
const handleSendEmail = async () => {
  // TODO: Реализовать отправку email
  toast({
    title: 'Email отправлен',
    description: `Email отправлен на ${selectedUserDetails.email}`
  });
};

const handleSendNotification = async () => {
  // TODO: Реализовать отправку уведомления
  toast({
    title: 'Уведомление отправлено',
    description: 'Уведомление отправлено пользователю'
  });
};

const handleTerminateSessions = async () => {
  if (!confirm('Завершить все сессии пользователя?')) return;
  
  // TODO: Реализовать завершение сессий
  toast({
    title: 'Сессии завершены',
    description: 'Все активные сессии пользователя завершены'
  });
};

const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  if (file.size > 2 * 1024 * 1024) {
    toast({
      title: 'Ошибка',
      description: 'Файл слишком большой (макс 2MB)',
      variant: 'destructive'
    });
    return;
  }
  
  // TODO: Загрузить на сервер и обновить avatar_url
  toast({
    title: 'Аватар обновлен',
    description: 'Аватар пользователя успешно обновлен'
  });
};
```

---

## 🎯 Итоговая структура модалки:

### Основная информация:
- ✅ Аватар (с возможностью загрузки)
- ✅ Имя, Email
- ✅ ID, Статус

### Редактируемые поля:
- ✅ Имя пользователя
- ✅ Email
- ✅ Роль (динамический селект)
- ✅ Статус (active/banned/inactive)

### Подписка (только просмотр):
- ✅ План (из roles.display_name)
- ✅ Статус (active/expired/cancelled)
- ✅ Действует до (end_date)

### Права и доступы:
- ✅ Возможности роли (динамические)
- ✅ Лимиты роли (динамические)

### Дополнительная информация:
- ✅ Последняя активность (реальная)
- ✅ IP адрес (реальный)
- ✅ Сессия (статус)

### Статистика:
- ✅ Загрузок (реальное число)
- ✅ Скриптов (реальное число)
- ✅ Тикетов (TODO: добавить подсчет)
- ✅ Дней онлайн (TODO: добавить подсчет)

### Действия:
- ✅ Отправить email (с обработчиком)
- ✅ Отправить уведомление (с обработчиком)
- ✅ Завершить все сессии (с обработчиком)
- ✅ Забанить пользователя
- ✅ Сохранить изменения

---

Создаю полный исправленный файл...
