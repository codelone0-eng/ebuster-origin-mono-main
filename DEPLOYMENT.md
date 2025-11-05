# 🚀 Инструкция по деплою EBUSTER

## 📋 Содержание
1. [Ручной деплой](#ручной-деплой)
2. [Автоматический деплой через GitHub Actions](#автоматический-деплой-через-github-actions)
3. [Настройка сервера](#настройка-сервера)
4. [Откат изменений](#откат-изменений)
5. [Мониторинг и логи](#мониторинг-и-логи)

---

## 🔧 Ручной деплой

### Быстрый деплой (на сервере)

```bash
cd /srv/ebuster
bash deploy.sh
```

Скрипт автоматически:
- ✅ Проверит наличие новых изменений
- ✅ Остановит контейнеры
- ✅ Обновит код из GitHub
- ✅ Пересоберёт Docker-образы
- ✅ Запустит контейнеры
- ✅ Проверит работоспособность API
- ✅ Откатится при ошибках

### Логи деплоя

Все действия логируются в `/srv/ebuster/deploy.log`:

```bash
# Просмотр последних 50 строк логов
tail -n 50 /srv/ebuster/deploy.log

# Просмотр логов в реальном времени
tail -f /srv/ebuster/deploy.log
```

---

## 🤖 Автоматический деплой через GitHub Actions

### 1️⃣ Настройка SSH-ключей

#### На сервере:

```bash
# 1. Создать SSH-ключ для GitHub Actions (если ещё нет)
ssh-keygen -t ed25519 -C "github-actions@ebuster.ru" -f ~/.ssh/github_actions_key -N ""

# 2. Добавить публичный ключ в authorized_keys
cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys

# 3. Показать приватный ключ (скопируйте его)
cat ~/.ssh/github_actions_key
```

**⚠️ ВАЖНО:** Скопируйте весь вывод приватного ключа, включая строки:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

#### На GitHub:

1. Перейдите в репозиторий: https://github.com/codelone0-eng/ebuster-origin-mono-main
2. Откройте **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret** и создайте три секрета:

| Имя секрета | Значение | Описание |
|-------------|----------|----------|
| `SSH_PRIVATE_KEY` | Содержимое `~/.ssh/github_actions_key` | Приватный SSH-ключ |
| `SERVER_IP` | IP-адрес вашего сервера | Например: `123.45.67.89` |
| `SERVER_USER` | Имя пользователя на сервере | Обычно `root` |

### 2️⃣ Проверка настройки

После добавления секретов:

1. Сделайте любое изменение в коде
2. Закоммитьте и запушьте в `main`:
   ```bash
   git add .
   git commit -m "test: проверка автодеплоя"
   git push origin main
   ```
3. Перейдите в **Actions** на GitHub
4. Вы увидите запущенный workflow "Deploy to Production"

### 3️⃣ Ручной запуск деплоя

Можно запустить деплой вручную без коммита:

1. Перейдите в **Actions** → **Deploy to Production**
2. Нажмите **Run workflow**
3. Выберите ветку `main`
4. Нажмите **Run workflow**

---

## 🖥️ Настройка сервера

### Первоначальная настройка (выполняется один раз)

```bash
# 1. Установка зависимостей
sudo apt-get update
sudo apt-get install -y git curl jq

# 2. Установка Docker (если ещё не установлен)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl enable --now docker

# 3. Клонирование репозитория
sudo mkdir -p /srv/ebuster
sudo chown $USER:$USER /srv/ebuster
cd /srv/ebuster
git clone https://github.com/codelone0-eng/ebuster-origin-mono-main.git .

# 4. Создание .env файла
cat > /srv/ebuster/.env << 'EOF'
NODE_ENV=production
PORT=3001

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# JWT
JWT_SECRET=your_jwt_secret

# SMTP
SMTP_HOST=smtp.timeweb.ru
SMTP_PORT=465
SMTP_USER=techsupport@ebuster.ru
SMTP_PASS=your_smtp_password

# URLs
CLIENT_URL=https://ebuster.ru
API_BASE_URL=https://api.ebuster.ru
EOF

# 5. Настройка SSL-сертификатов
mkdir -p /srv/ebuster/ssl
# Скопируйте сертификаты в /srv/ebuster/ssl/

# 6. Первый запуск
cd /srv/ebuster
docker compose build
docker compose up -d
```

### Настройка автоматического обновления сертификатов

```bash
# Создать хук для certbot
sudo tee /etc/letsencrypt/renewal-hooks/deploy/ebuster-restart.sh > /dev/null << 'EOF'
#!/bin/bash
cp /etc/letsencrypt/live/ebuster.ru/fullchain.pem /srv/ebuster/ssl/fullchain.pem
cp /etc/letsencrypt/live/ebuster.ru/privkey.pem /srv/ebuster/ssl/privkey.pem
chmod 600 /srv/ebuster/ssl/privkey.pem
cd /srv/ebuster && docker compose restart frontend
EOF

sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/ebuster-restart.sh
```

---

## ⏮️ Откат изменений

### Автоматический откат

Скрипт `deploy.sh` автоматически откатывается при ошибках сборки или запуска.

### Ручной откат к предыдущему коммиту

```bash
cd /srv/ebuster

# 1. Посмотреть историю коммитов
git log --oneline -10

# 2. Откатиться к нужному коммиту (замените COMMIT_HASH)
git reset --hard COMMIT_HASH

# 3. Пересобрать и запустить
docker compose down
docker compose build --no-cache
docker compose up -d

# 4. Проверить статус
docker compose ps
curl https://api.ebuster.ru/api/health
```

### Откат через GitHub Actions

1. Найдите успешный деплой в **Actions**
2. Нажмите **Re-run all jobs**
3. Или откатите коммит локально и запушьте:
   ```bash
   git revert HEAD
   git push origin main
   ```

---

## 📊 Мониторинг и логи

### Просмотр логов контейнеров

```bash
# Все контейнеры
docker compose logs -f

# Только API
docker compose logs -f api

# Только Frontend
docker compose logs -f frontend

# Последние 100 строк
docker compose logs --tail=100 api
```

### Проверка статуса

```bash
# Статус контейнеров
docker compose ps

# Использование ресурсов
docker stats

# Проверка API
curl https://api.ebuster.ru/api/health

# Проверка фронтенда
curl -I https://ebuster.ru
```

### Логи деплоя

```bash
# Просмотр логов деплоя
tail -f /srv/ebuster/deploy.log

# Поиск ошибок в логах
grep -i error /srv/ebuster/deploy.log

# Логи за сегодня
grep "$(date '+%Y-%m-%d')" /srv/ebuster/deploy.log
```

### Мониторинг дискового пространства

```bash
# Общее использование
df -h

# Использование Docker
docker system df

# Очистка неиспользуемых образов и контейнеров
docker system prune -a --volumes
```

---

## 🔥 Частые проблемы и решения

### Проблема: Контейнеры не запускаются

```bash
# Проверить логи
docker compose logs

# Проверить порты
sudo ss -tulpn | grep -E ':80|:443|:3001'

# Пересоздать контейнеры
docker compose down -v
docker compose up -d
```

### Проблема: API возвращает 502/504

```bash
# Проверить статус API-контейнера
docker compose ps api

# Посмотреть логи API
docker compose logs --tail=100 api

# Перезапустить API
docker compose restart api
```

### Проблема: SSL-сертификаты не работают

```bash
# Проверить наличие сертификатов
ls -la /srv/ebuster/ssl/

# Обновить сертификаты
sudo certbot renew
sudo cp /etc/letsencrypt/live/ebuster.ru/*.pem /srv/ebuster/ssl/

# Перезапустить frontend
docker compose restart frontend
```

### Проблема: Нет места на диске

```bash
# Очистить Docker
docker system prune -a --volumes

# Очистить логи
sudo journalctl --vacuum-time=7d

# Удалить старые образы
docker image prune -a
```

---

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `docker compose logs -f`
2. Проверьте статус: `docker compose ps`
3. Проверьте логи деплоя: `tail -f /srv/ebuster/deploy.log`
4. Проверьте GitHub Actions: https://github.com/codelone0-eng/ebuster-origin-mono-main/actions

---

## 🎯 Чеклист перед деплоем

- [ ] Код протестирован локально
- [ ] Все изменения закоммичены
- [ ] `.env` файл обновлён (если нужно)
- [ ] SSL-сертификаты актуальны
- [ ] Достаточно места на диске (минимум 5GB свободно)
- [ ] Резервная копия БД создана (если есть критичные изменения)

---

## 🚀 Быстрые команды

```bash
# Деплой
cd /srv/ebuster && bash deploy.sh

# Просмотр логов
docker compose logs -f api

# Перезапуск
docker compose restart

# Статус
docker compose ps

# Проверка API
curl https://api.ebuster.ru/api/health

# Очистка
docker system prune -a
```
