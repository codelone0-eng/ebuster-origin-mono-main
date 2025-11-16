# 🔧 Исправление дашборда - логи и кнопка

## Что исправлено

### ✅ Invalid Date
- Добавлена безопасная обработка дат
- Если дата невалидна, используется текущая дата
- Форматирование через `toLocaleString('ru-RU')`

### ✅ Логи в консоли F12
Добавлено подробное логирование:
- `[Dashboard]` - инициализация и действия пользователя
- `[WebSocket]` - подключение, сообщения, ошибки
- Все события теперь видны в консоли браузера

### ✅ Кнопка запуска тестов
- Кнопка должна быть видна в header справа
- Если не видна - возможно старый дашборд не обновился

## На сервере после автодеплоя

```bash
cd /srv/ebuster

# 1. Остановите контейнеры
docker compose down

# 2. Удалите старый volume с дашбордом
docker volume rm ebuster_autotest_reports

# 3. Запустите
docker compose up -d

# 4. Сгенерируйте новый дашборд
docker compose run --rm autotest-runner npm run test:dashboard:live

# 5. Проверьте что файл создан
docker compose exec frontend ls -lh /usr/share/nginx/html/autotest/

# 6. Проверьте содержимое
docker compose exec frontend grep "Запустить тесты" /usr/share/nginx/html/autotest/index.html
```

## Проверка в браузере

### 1. Откройте https://autotest.ebuster.ru

### 2. Очистите кэш
- **Chrome/Edge**: `Ctrl+Shift+R` (Windows) или `Cmd+Shift+R` (Mac)
- **Firefox**: `Ctrl+F5` (Windows) или `Cmd+Shift+R` (Mac)

### 3. Откройте консоль F12
Вы должны увидеть:
```
[Dashboard] Initializing...
[Dashboard] Location: https://autotest.ebuster.ru/
[Dashboard] WebSocket URL: wss://autotest.ebuster.ru/ws
[WebSocket] Connected successfully
```

### 4. Проверьте кнопку
В правом верхнем углу должна быть кнопка **"Запустить тесты"**

### 5. Нажмите кнопку
В консоли должно появиться:
```
[Dashboard] Run tests button clicked
[Dashboard] Sending POST /stream/run
[Dashboard] Response status: 200
[Dashboard] Response data: {message: "Tests started", status: "running"}
```

## Если кнопки всё ещё нет

### Проверьте что новый дашборд сгенерирован

```bash
# Проверьте размер файла (должен быть ~20-25KB)
docker compose exec frontend ls -lh /usr/share/nginx/html/autotest/index.html

# Проверьте что есть кнопка
docker compose exec frontend grep -c "Запустить тесты" /usr/share/nginx/html/autotest/index.html
# Должно вернуть: 2

# Проверьте что есть логирование
docker compose exec frontend grep -c "console.log" /usr/share/nginx/html/autotest/index.html
# Должно вернуть: >10
```

### Если файл старый - пересоздайте вручную

```bash
# Войдите в контейнер autotest-runner
docker compose exec autotest-runner sh

# Запустите генерацию
npm run test:dashboard:live

# Проверьте что файл создан
ls -lh tests/public/autotest/index.html

# Выйдите
exit

# Файл должен автоматически появиться в volume
```

## Логи в консоли F12

### При загрузке страницы:
```
[Dashboard] Initializing...
[Dashboard] Location: https://autotest.ebuster.ru/
[Dashboard] WebSocket URL: wss://autotest.ebuster.ru/ws
[WebSocket] Connected successfully
```

### При нажатии кнопки:
```
[Dashboard] Run tests button clicked
[Dashboard] Sending POST /stream/run
[Dashboard] Response status: 200
[Dashboard] Response data: {message: "Tests started", status: "running"}
[WebSocket] Tests started
```

### При получении обновлений:
```
[WebSocket] Message received: {"type":"testEnd","data":{...}}
[WebSocket] Parsed message type: testEnd
[WebSocket] Test ended: {...}
```

### При ошибках:
```
[WebSocket] Error: ...
[Dashboard] Fetch error: ...
```

## Если WebSocket не подключается

```bash
# Проверьте stream-сервер
docker compose ps autotest-stream

# Должен быть: Up (healthy)

# Проверьте логи
docker compose logs autotest-stream

# Должно быть:
# 🔴 Live stream server running on port 3002
# WebSocket: ws://localhost:3002

# Проверьте healthcheck
curl http://localhost:3002/status

# Должно вернуть JSON
```

## Если кнопка не работает

```bash
# Проверьте что endpoint доступен
curl -X POST http://localhost:3002/run

# Должно вернуть:
# {"message":"Tests started","status":"running"}

# Проверьте через Nginx
curl -X POST https://autotest.ebuster.ru/stream/run

# Должно работать так же
```

---

**После этих действий:**
- ✅ Дата отображается корректно
- ✅ Кнопка "Запустить тесты" видна
- ✅ Все действия логируются в F12
- ✅ WebSocket подключается и работает
