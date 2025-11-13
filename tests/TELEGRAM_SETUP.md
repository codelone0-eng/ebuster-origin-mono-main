# Настройка Telegram-уведомлений

## Быстрая настройка

### 1. Создать бота
1. Открыть [@BotFather](https://t.me/BotFather) в Telegram
2. Отправить `/newbot`
3. Указать имя бота (например, `Ebuster Autotest Bot`)
4. Указать username (например, `ebuster_autotest_bot`)
5. Скопировать токен (формат: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Получить Chat ID

#### Вариант A: Личные сообщения
1. Открыть бота в Telegram
2. Отправить любое сообщение боту
3. Открыть в браузере: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Найти `"chat":{"id":123456789}` — это ваш Chat ID

#### Вариант B: Групповой чат
1. Создать группу в Telegram
2. Добавить бота в группу
3. Отправить любое сообщение в группу
4. Открыть в браузере: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
5. Найти `"chat":{"id":-1234567890}` — это Chat ID группы (отрицательное число)

### 3. Настроить .env.autotest

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
# или для группы:
TELEGRAM_CHAT_ID=-1234567890
```

## Формат уведомлений

После каждого прогона тестов бот отправит сообщение:

```
Ebuster Autotests

Статус: ✅ Успешно
Всего тестов: 42
Пройдено: 40
Упало: 2
Время: 4m 32s

Ошибки:
• Admin: Users Management should display users list
• LK: Dashboard should navigate to scripts section
```

## Troubleshooting

### Бот не отправляет сообщения
- Проверьте токен: `curl https://api.telegram.org/bot<TOKEN>/getMe`
- Убедитесь, что бот не заблокирован
- Для групп: убедитесь, что бот добавлен и имеет права на отправку сообщений

### Ошибка "Bad Request: chat not found"
- Отправьте боту хотя бы одно сообщение
- Для групп: убедитесь, что бот добавлен в группу

### Ошибка "Can't parse entities"
- Эта ошибка исправлена в последней версии репортёра
- Используется HTML-разметка вместо Markdown
- Все специальные символы экранируются

## Отключение уведомлений

Просто удалите или закомментируйте переменные в `.env.autotest`:

```env
# TELEGRAM_BOT_TOKEN=...
# TELEGRAM_CHAT_ID=...
```

Репортёр автоматически пропустит отправку, если токен или Chat ID не заданы.
