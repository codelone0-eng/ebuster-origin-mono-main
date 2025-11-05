# Быстрые исправления

## ✅ Выполнено:

### 1. Роли в админке
- ✅ Добавлен `RolesManagement` компонент в AdminDashboard
- ✅ Добавлена вкладка "Роли" в меню
- ✅ Импорты исправлены

### 2. Crown is not defined
- ✅ Добавлены все импорты в Pricing.tsx
- ✅ Ошибка исправлена

## ⚠️ Требует доработки:

### Редактирование пользователя - динамические роли

**Файл:** `src/admin/AdminDashboard.tsx` (строки 968-979)

**Проблема:** Роли захардкожены в селекте

**Текущий код:**
```tsx
<Select defaultValue={selectedUserDetails.role}>
  <SelectTrigger className="mt-1">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="user">Пользователь</SelectItem>
    <SelectItem value="moderator">Модератор</SelectItem>
    <SelectItem value="developer">Разработчик</SelectItem>
    <SelectItem value="admin">Администратор</SelectItem>
  </SelectContent>
</Select>
```

**Нужно изменить на:**

1. Добавить state для ролей:
```tsx
const [availableRoles, setAvailableRoles] = useState([]);
```

2. Загрузить роли при открытии модалки:
```tsx
useEffect(() => {
  if (showUserDetailsModal) {
    loadRoles();
  }
}, [showUserDetailsModal]);

const loadRoles = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/roles`);
    const data = await response.json();
    if (data.success) {
      setAvailableRoles(data.data);
    }
  } catch (error) {
    console.error('Error loading roles:', error);
  }
};
```

3. Отобразить роли динамически:
```tsx
<Select 
  defaultValue={selectedUserDetails.role_id}
  onValueChange={(value) => handleRoleChange(value)}
>
  <SelectTrigger className="mt-1">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {availableRoles.map((role) => (
      <SelectItem key={role.id} value={role.id}>
        {role.display_name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

4. Сохранить изменение роли:
```tsx
const handleRoleChange = async (roleId: string) => {
  try {
    const token = localStorage.getItem('ebuster_token');
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/roles/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: selectedUserDetails.id,
        roleId
      })
    });

    const data = await response.json();
    if (data.success) {
      toast({
        title: 'Успешно',
        description: 'Роль пользователя обновлена',
        variant: 'success'
      });
    }
  } catch (error) {
    console.error('Error assigning role:', error);
    toast({
      title: 'Ошибка',
      description: 'Не удалось обновить роль',
      variant: 'destructive'
    });
  }
};
```

## Дополнительные улучшения:

### Отображение информации о подписке
Добавить в модалку редактирования пользователя:
```tsx
<div>
  <Label>Подписка</Label>
  <div className="mt-1 p-3 bg-muted rounded-lg">
    <div className="flex justify-between text-sm">
      <span>План:</span>
      <Badge>{selectedUserDetails.subscription?.roles?.display_name || 'Free'}</Badge>
    </div>
    {selectedUserDetails.subscription?.end_date && (
      <div className="flex justify-between text-sm mt-2">
        <span>Действует до:</span>
        <span>{new Date(selectedUserDetails.subscription.end_date).toLocaleDateString()}</span>
      </div>
    )}
  </div>
</div>
```

### Права пользователя
Отображать реальные права из роли:
```tsx
{selectedUserDetails.role?.features && (
  <div className="space-y-2">
    <Label>Возможности</Label>
    <div className="grid grid-cols-2 gap-2">
      {selectedUserDetails.role.features.scripts?.can_create && (
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          Создание скриптов
        </div>
      )}
      {selectedUserDetails.role.features.scripts?.can_publish && (
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          Публикация скриптов
        </div>
      )}
      {selectedUserDetails.role.features.api?.enabled && (
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          API доступ
        </div>
      )}
    </div>
  </div>
)}
```

## Итого:

✅ **Исправлено:** 2 из 3
⚠️ **Требует доработки:** 1 (редактирование пользователя)

**Время на доработку:** ~30 минут
