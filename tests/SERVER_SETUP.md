# 🖥️ Server Setup - Ebuster Testing

## Быстрая настройка на сервере

### 1. Подготовка окружения

```bash
# Перейти в директорию проекта
cd /srv/ebuster

# Установить зависимости (если ещё не установлены)
npm install

# Установить браузеры Playwright
npx playwright install --with-deps
```

### 2. Настройка переменных окружения

```bash
# Убедитесь, что .env.autotest существует и заполнен
cat .env.autotest

# Должны быть заполнены:
# BASE_URL=https://admin.ebuster.ru
# LK_BASE_URL=https://lk.ebuster.ru
# API_URL=https://api.ebuster.ru
# ADMIN_EMAIL=autotest_ebuster@ebuster.ru
# ADMIN_PASSWORD=Autotest!234
# TELEGRAM_BOT_TOKEN=your_token
# TELEGRAM_CHAT_ID=your_chat_id
```

### 3. Первый запуск

```bash
# Экспортировать переменные
export $(grep -v '^#' .env.autotest | xargs)

# Запустить все тесты
npm run test:all

# Сгенерировать дашборд
npm run test:dashboard

# Запустить веб-сервер (в фоне)
nohup npm run test:serve > /var/log/ebuster-tests.log 2>&1 &
```

### 4. Проверка

Откройте в браузере: **http://your-server-ip:8888**

---

## Автоматический запуск через Cron

### Вариант 1: Ежедневный запуск в 3:00

```bash
# Открыть crontab
crontab -e

# Добавить строку:
0 3 * * * cd /srv/ebuster && export $(grep -v '^#' .env.autotest | xargs) && npm run test:all && npm run test:dashboard && npm run autotest-send-report >> /var/log/ebuster-tests.log 2>&1
```

### Вариант 2: Каждые 6 часов

```bash
0 */6 * * * cd /srv/ebuster && export $(grep -v '^#' .env.autotest | xargs) && npm run test:all && npm run test:dashboard && npm run autotest-send-report >> /var/log/ebuster-tests.log 2>&1
```

### Вариант 3: Каждый понедельник в 9:00

```bash
0 9 * * 1 cd /srv/ebuster && export $(grep -v '^#' .env.autotest | xargs) && npm run test:all && npm run test:dashboard && npm run autotest-send-report >> /var/log/ebuster-tests.log 2>&1
```

---

## Настройка веб-сервера как сервис

### Создать systemd service

```bash
sudo nano /etc/systemd/system/ebuster-test-reports.service
```

Содержимое файла:

```ini
[Unit]
Description=Ebuster Test Reports Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/srv/ebuster
Environment="NODE_ENV=production"
Environment="REPORT_PORT=8888"
ExecStart=/usr/bin/npm run test:serve
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Запустить сервис

```bash
# Перезагрузить systemd
sudo systemctl daemon-reload

# Запустить сервис
sudo systemctl start ebuster-test-reports

# Включить автозапуск
sudo systemctl enable ebuster-test-reports

# Проверить статус
sudo systemctl status ebuster-test-reports

# Посмотреть логи
sudo journalctl -u ebuster-test-reports -f
```

---

## Настройка Nginx (опционально)

Если хотите открыть отчёты через домен (например, `tests.ebuster.ru`):

```bash
sudo nano /etc/nginx/sites-available/ebuster-tests
```

Содержимое:

```nginx
server {
    listen 80;
    server_name tests.ebuster.ru;

    location / {
        proxy_pass http://localhost:8888;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Активировать:

```bash
sudo ln -s /etc/nginx/sites-available/ebuster-tests /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Добавить SSL через Certbot:

```bash
sudo certbot --nginx -d tests.ebuster.ru
```

---

## Мониторинг и логи

### Просмотр логов тестов

```bash
# Последние 100 строк
tail -n 100 /var/log/ebuster-tests.log

# Следить за логами в реальном времени
tail -f /var/log/ebuster-tests.log
```

### Просмотр логов веб-сервера

```bash
# Если запущен через systemd
sudo journalctl -u ebuster-test-reports -f

# Если запущен через nohup
tail -f /var/log/ebuster-tests.log
```

### Очистка старых отчётов

```bash
# Создать скрипт очистки
sudo nano /usr/local/bin/cleanup-test-reports.sh
```

Содержимое:

```bash
#!/bin/bash
# Удалить отчёты старше 30 дней
find /srv/ebuster/tests/reports -type f -mtime +30 -delete
echo "$(date): Cleaned up old test reports" >> /var/log/ebuster-tests.log
```

Сделать исполняемым:

```bash
sudo chmod +x /usr/local/bin/cleanup-test-reports.sh
```

Добавить в cron (каждую неделю):

```bash
0 0 * * 0 /usr/local/bin/cleanup-test-reports.sh
```

---

## Безопасность

### Ограничить доступ к отчётам

Если используете Nginx, добавьте basic auth:

```bash
# Создать файл с паролями
sudo htpasswd -c /etc/nginx/.htpasswd admin

# Добавить в конфиг Nginx
sudo nano /etc/nginx/sites-available/ebuster-tests
```

Добавить в блок `location /`:

```nginx
auth_basic "Test Reports";
auth_basic_user_file /etc/nginx/.htpasswd;
```

Перезагрузить Nginx:

```bash
sudo systemctl reload nginx
```

---

## Troubleshooting

### Сервис не запускается

```bash
# Проверить логи
sudo journalctl -u ebuster-test-reports -n 50

# Проверить права доступа
ls -la /srv/ebuster/tests/

# Проверить, не занят ли порт
sudo lsof -i :8888
```

### Тесты падают

```bash
# Проверить переменные окружения
cat .env.autotest

# Проверить доступность сайтов
curl -I https://admin.ebuster.ru
curl -I https://lk.ebuster.ru
curl -I https://api.ebuster.ru

# Переустановить браузеры
npx playwright install --with-deps --force
```

### Отчёты не генерируются

```bash
# Проверить права доступа
sudo chown -R root:root /srv/ebuster/tests/reports/
sudo chmod -R 755 /srv/ebuster/tests/reports/

# Очистить старые отчёты
rm -rf /srv/ebuster/tests/reports/*
```

---

## Полезные команды

```bash
# Запустить тесты вручную
cd /srv/ebuster && export $(grep -v '^#' .env.autotest | xargs) && npm run test:all

# Посмотреть статус сервиса
sudo systemctl status ebuster-test-reports

# Перезапустить сервис
sudo systemctl restart ebuster-test-reports

# Остановить сервис
sudo systemctl stop ebuster-test-reports

# Посмотреть логи
tail -f /var/log/ebuster-tests.log

# Проверить cron задачи
crontab -l

# Посмотреть размер отчётов
du -sh /srv/ebuster/tests/reports/
```

---

## Контакты и поддержка

Если возникли проблемы, проверьте:
1. Логи: `/var/log/ebuster-tests.log`
2. Статус сервиса: `sudo systemctl status ebuster-test-reports`
3. Переменные окружения: `.env.autotest`
4. Доступность сайтов: `curl -I https://admin.ebuster.ru`
