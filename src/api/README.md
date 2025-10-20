# API

Эта папка содержит клиент для работы с API и утилиты.

## Структура

- `client.ts` - HTTP клиент для API

## Функциональность

### ApiClient
- HTTP методы (GET, POST, PUT, DELETE)
- Автоматическая авторизация через Bearer токен
- Обработка ошибок
- Базовые эндпоинты для всех модулей

### Эндпоинты
- **Аутентификация** - login, register, logout, refresh
- **Пользователи** - профиль, настройки, 2FA
- **Скрипты** - CRUD операции, установка/удаление
- **Тикеты** - создание, просмотр, ответы
- **Админка** - управление системой

## Использование

```typescript
import { apiClient } from '@/api/client';

// Получить данные
const scripts = await apiClient.get('/scripts');

// Создать тикет
const ticket = await apiClient.post('/tickets', {
  subject: 'Проблема',
  description: 'Описание'
});
```

## Особенности

- Автоматическое сохранение токена в localStorage
- Обработка ошибок HTTP
- TypeScript типизация
- Поддержка разных окружений (dev/prod)
