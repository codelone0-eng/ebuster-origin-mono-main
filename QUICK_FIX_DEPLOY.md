# Быстрое исправление тёмной темы и API

## Проблемы
1. ❌ Тёмная тема не работает - текст чёрный на чёрном фоне
2. ❌ API `/api/scripts/user/installed` возвращает 500
3. ❌ package-lock.json устарел

## Решение

### 1. На сервере выполнить:

```bash
cd /srv/ebuster

# Обновить код из Git
git pull origin main

# Обновить package-lock.json
rm -f package-lock.json
npm install --legacy-peer-deps

# Пересобрать фронтенд с исправленными CSS
npm run build

# Перезапустить Docker контейнеры
docker-compose down
docker-compose up -d --build

# Очистить кеш Cloudflare
# Зайти в панель Cloudflare -> Caching -> Purge Everything
```

### 2. Что было исправлено в коде:

**src/index.css** - Изменены селекторы для тёмной темы:
- Было: `.dark { ... }`
- Стало: `:root.dark { ... }`

Это повышает специфичность CSS и предотвращает сброс переменных при минификации Cloudflare.

### 3. После деплоя:

1. Очистить кеш браузера (Ctrl+Shift+Del)
2. Перезагрузить страницу с очисткой кеша (Ctrl+F5)
3. Проверить DevTools -> Console на наличие ошибок

### 4. Если проблема с API остаётся:

Проверить логи контейнера:
```bash
docker logs ebuster-api-1 --tail 100
```

Проблема может быть в том, что `script.rating` возвращается как `null/undefined` из базы данных.

## Альтернативный вариант (если не помогло)

Если после очистки кеша Cloudflare тема всё ещё не работает, добавить в `index.html` перед загрузкой CSS:

```html
<script>
  // Форсировать применение темы до загрузки CSS
  const theme = localStorage.getItem('theme') || 'dark';
  document.documentElement.classList.add(theme);
</script>
```
