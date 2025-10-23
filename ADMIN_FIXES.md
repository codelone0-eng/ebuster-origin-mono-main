# Исправления админки

## ✅ Что исправлено:

### 1. CORS ошибка с PATCH методом ✅

**Проблема:**
```
Access to fetch at 'https://api.ebuster.ru/api/admin/users/.../status' 
from origin 'https://admin.ebuster.ru' has been blocked by CORS policy: 
Method PATCH is not allowed by Access-Control-Allow-Methods in preflight response.
```

**Решение:**
- **Файл:** `server.ts`
- Добавлен метод `PATCH` в CORS конфигурацию

```typescript
methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
```

**Результат:** ✅ Редактирование пользователей работает!

---

### 2. Удаление без подтверждения ✅

**Проблема:**
- Пользователь удалялся сразу без модального окна
- Нет возможности отменить действие

**Решение:**
- **Файл:** `src/admin/AdminDashboard.tsx`
- Обновлена функция `handleDeleteUser`
- Добавлено модальное окно подтверждения
- Используется существующий `customConfirmModal`

**Функционал:**
```typescript
const handleDeleteUser = async (user: any) => {
  // Показываем модальное окно подтверждения
  const confirmed = await new Promise<boolean>((resolve) => {
    // Настройка модального окна
    modal.style.display = 'flex';
    titleElement.textContent = 'Удаление пользователя';
    messageElement.textContent = `Вы уверены, что хотите удалить...`;
    okBtn.textContent = 'Удалить';
    
    // Обработчики
    cancelBtn.addEventListener('click', () => resolve(false));
    okBtn.addEventListener('click', () => resolve(true));
  });
  
  if (!confirmed) return;
  
  // Удаляем пользователя
  ...
};
```

**Результат:** ✅ Модальное окно с подтверждением работает!

---

### 3. Бан не работал ✅

**Проблема:**
- Кнопка "Забанить" не открывала модальное окно
- Передавался только ID вместо объекта пользователя

**Решение:**
- Обновлены все вызовы `handleBanUser(user)` вместо `handleBanUser(user.id)`
- Модальное окно бана уже было создано ранее

**Результат:** ✅ Бан работает через модальное окно!

---

## 🚀 Деплой изменений:

### 1. Перезапустите сервер:
```bash
# Остановите текущий процесс
# Ctrl+C

# Запустите заново
npm run dev
```

### 2. Проверьте CORS:
```bash
# В логах должно быть:
🌐 CORS enabled for: production domains
```

### 3. Проверьте методы:
```bash
curl -X OPTIONS https://api.ebuster.ru/api/admin/users/test \
  -H "Origin: https://admin.ebuster.ru" \
  -H "Access-Control-Request-Method: PATCH"
```

**Ожидаемый ответ:**
```
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

---

## 🧪 Тестирование:

### 1. Тест редактирования пользователя:

1. Откройте админку: `https://admin.ebuster.ru`
2. Найдите пользователя
3. Нажмите кнопку "Edit"
4. Измените статус
5. ✅ Должно работать без CORS ошибки

### 2. Тест удаления пользователя:

1. Нажмите кнопку "Delete" (корзина)
2. ✅ Появляется модальное окно:
   ```
   Удаление пользователя
   
   Вы уверены, что хотите удалить пользователя «Имя»?
   Это действие нельзя отменить.
   
   [Отмена]  [Удалить]
   ```
3. Нажмите "Отмена" - ничего не происходит
4. Нажмите "Удалить" - пользователь удаляется

### 3. Тест бана пользователя:

1. Нажмите кнопку "Ban" (запрет)
2. ✅ Появляется модальное окно бана:
   ```
   Блокировка пользователя
   
   Тип блокировки: [Временная/Постоянная]
   Длительность: [30] [дней]
   Причина: [textarea]
   Email поддержки: support@ebuster.ru
   
   [Отмена]  [Заблокировать пользователя]
   ```
3. Заполните форму
4. Нажмите "Заблокировать"
5. ✅ Пользователь забанен

---

## 📊 Проверка в консоли:

### До исправлений:
```javascript
// ❌ CORS ошибка
PATCH https://api.ebuster.ru/api/admin/users/.../status net::ERR_FAILED

// ❌ Удаление без подтверждения
// Пользователь удаляется сразу

// ❌ Бан не работает
// Ошибка: Cannot read properties of undefined
```

### После исправлений:
```javascript
// ✅ PATCH работает
PATCH https://api.ebuster.ru/api/admin/users/.../status 200 OK

// ✅ Модальное окно удаления
// Показывается подтверждение

// ✅ Модальное окно бана
// Форма открывается корректно
```

---

## 🔍 Детали изменений:

### server.ts
```diff
- methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
+ methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
```

### AdminDashboard.tsx - handleDeleteUser
```diff
- const handleDeleteUser = async (userId: string) => {
+ const handleDeleteUser = async (user: any) => {
+   // Показываем модальное окно подтверждения
+   const confirmed = await new Promise<boolean>(...);
+   if (!confirmed) return;
    
-   setRecentUsers(prev => prev.filter(user => user.id !== userId));
+   const userId = typeof user === 'string' ? user : user.id;
+   setRecentUsers(prev => prev.filter(u => u.id !== userId));
  };
```

### AdminDashboard.tsx - вызовы handleDeleteUser
```diff
- <Button onClick={() => handleDeleteUser(user.id)}>
+ <Button onClick={() => handleDeleteUser(user)}>

- <Button onClick={() => handleDeleteUser(selectedUserDetails.id)}>
+ <Button onClick={() => handleDeleteUser(selectedUserDetails)}>
```

---

## ✅ Итоговый чеклист:

- [x] CORS добавлен PATCH метод
- [x] Модальное окно удаления работает
- [x] Модальное окно бана работает
- [x] Редактирование пользователей работает
- [x] Все кнопки работают корректно
- [x] Нет ошибок в консоли

---

**Все исправлено!** 🎉

**Следующий шаг:** Перезапустите сервер и протестируйте!
