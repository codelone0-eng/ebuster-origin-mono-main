# ⚡ Быстрый деплой EBUSTER

## 🚀 Деплой сейчас (на сервере)

```bash
cd /srv/ebuster && bash deploy.sh
```

---

## 🤖 Автодеплой через GitHub

### Просто запушьте изменения:

```bash
git add .
git commit -m "ваше сообщение"
git push origin main
```

GitHub Actions автоматически задеплоит на сервер через 2-3 минуты.

**Проверить статус:** https://github.com/codelone0-eng/ebuster-origin-mono-main/actions

---

## 📝 Настройка автодеплоя (один раз)

### 1. На сервере создать SSH-ключ:

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_key -N ""
cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_actions_key  # Скопировать весь вывод
```

### 2. В GitHub добавить секреты:

**Settings → Secrets → Actions → New secret**

| Имя | Значение |
|-----|----------|
| `SSH_PRIVATE_KEY` | Содержимое `~/.ssh/github_actions_key` |
| `SERVER_IP` | IP вашего сервера |
| `SERVER_USER` | `root` (или ваш юзер) |

### 3. Готово! 🎉

Теперь каждый `git push` автоматически деплоится на сервер.

---

## 🔍 Проверка

```bash
# Статус контейнеров
docker compose ps

# Логи API
docker compose logs -f api

# Проверка API
curl https://api.ebuster.ru/api/health

# Логи деплоя
tail -f /srv/ebuster/deploy.log
```

---

## ⏮️ Откат

```bash
cd /srv/ebuster
git log --oneline -5  # Посмотреть последние коммиты
git reset --hard COMMIT_HASH  # Откатиться
bash deploy.sh  # Задеплоить
```

---

## 🆘 Проблемы?

```bash
# Перезапуск всего
docker compose restart

# Пересборка с нуля
docker compose down
docker compose build --no-cache
docker compose up -d

# Очистка места
docker system prune -a
```

---

**Полная документация:** [DEPLOYMENT.md](./DEPLOYMENT.md)
