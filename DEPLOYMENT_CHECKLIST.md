# Чеклист деплоя интеграции расширения

## 1. База данных (Supabase)

### Выполнить SQL миграцию:
```sql
-- Таблица для хранения установленных скриптов пользователей
CREATE TABLE IF NOT EXISTS user_scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, script_id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_user_scripts_user_id ON user_scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_scripts_script_id ON user_scripts(script_id);

-- RLS политики
ALTER TABLE user_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own installed scripts"
  ON user_scripts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can install scripts for themselves"
  ON user_scripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can uninstall their own scripts"
  ON user_scripts FOR DELETE
  USING (auth.uid() = user_id);

-- Функция для увеличения счетчика загрузок
CREATE OR REPLACE FUNCTION increment_downloads(script_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE scripts
  SET downloads_count = downloads_count + 1
  WHERE id = script_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Статус:** ⬜ Не выполнено

---

## 2. Backend (Node.js)

### Файлы изменены:
- ✅ `src/api/scripts.routes.ts` - добавлены routes для синхронизации
- ✅ `src/api/scripts.controller.ts` - добавлены 5 новых функций

### Новые endpoints:
- `GET /api/scripts/user/installed` - получить установленные скрипты
- `POST /api/scripts/user/install/:id` - установить скрипт
- `DELETE /api/scripts/user/uninstall/:id` - удалить скрипт
- `POST /api/scripts/user/sync` - синхронизировать скрипты
- `GET /api/scripts/user/check-updates` - проверить обновления

### Деплой:
```bash
cd c:\Users\Bespredel\Desktop\ebuster-origin-mono-main
npm run build
# Деплой через Docker или ваш CI/CD
```

**Статус:** ⬜ Не выполнено

---

## 3. Chrome Extension

### Файлы изменены:
- ✅ `api-client.js` - обновлен baseURL, добавлены методы синхронизации
- ✅ `background.js` - добавлена автосинхронизация, изменен API URL
- ✅ `styles.css` - исправлена темная тема
- ✅ `popup.html` - обновлен с data-text атрибутами

### Что нужно сделать:
1. Протестировать локально (см. TESTING_GUIDE.md)
2. Обновить версию в `manifest.json`
3. Собрать расширение для публикации
4. Опубликовать в Chrome Web Store

**Статус:** ⬜ Не выполнено

---

## 4. Тестирование

### Обязательные тесты:
- [ ] Авторизация через OAuth работает
- [ ] Установка скрипта через lk.ebuster.ru
- [ ] Автоматическая синхронизация (каждые 5 минут)
- [ ] Уведомления о новых скриптах
- [ ] Переключение темы работает
- [ ] Переключение языка работает
- [ ] Скрипты выполняются на страницах

### Подробное руководство:
См. файл `TESTING_GUIDE.md` в папке расширения

**Статус:** ⬜ Не выполнено

---

## 5. Документация

### Созданные файлы:
- ✅ `EXTENSION_SYNC_SETUP.md` - настройка синхронизации
- ✅ `TESTING_GUIDE.md` - руководство по тестированию
- ✅ `DEPLOYMENT_CHECKLIST.md` - этот файл

### Что обновить:
- [ ] README.md - добавить информацию об интеграции
- [ ] API документация - описать новые endpoints

**Статус:** ⬜ Не выполнено

---

## 6. Порядок деплоя

### Шаг 1: База данных
```bash
# Выполнить SQL миграцию в Supabase SQL Editor
# Проверить что таблица user_scripts создана
```

### Шаг 2: Backend
```bash
cd c:\Users\Bespredel\Desktop\ebuster-origin-mono-main
git add .
git commit -m "feat: add extension cloud sync integration"
git push
# Деплой на production
```

### Шаг 3: Тестирование на production
```bash
# Проверить что API endpoints доступны
curl https://ebuster.ru/api/scripts/user/installed
# Должен вернуть 401 (требуется авторизация)
```

### Шаг 4: Расширение
```bash
# Протестировать локально с production API
# Обновить версию в manifest.json
# Собрать и опубликовать
```

---

## 7. Rollback план

### Если что-то пошло не так:

#### Backend:
```bash
git revert HEAD
git push
# Откатить деплой
```

#### База данных:
```sql
-- Удалить таблицу (ОСТОРОЖНО!)
DROP TABLE IF EXISTS user_scripts CASCADE;
DROP FUNCTION IF EXISTS increment_downloads(UUID);
```

#### Расширение:
- Откатить версию в Chrome Web Store
- Или выпустить hotfix

---

## 8. Мониторинг после деплоя

### Что проверить:
- [ ] Логи сервера на ошибки
- [ ] Количество успешных синхронизаций
- [ ] Количество установок скриптов
- [ ] Ошибки авторизации
- [ ] Производительность API

### Метрики:
```sql
-- Количество установленных скриптов
SELECT COUNT(*) FROM user_scripts;

-- Топ скриптов
SELECT script_id, COUNT(*) as installs
FROM user_scripts
GROUP BY script_id
ORDER BY installs DESC
LIMIT 10;

-- Активность пользователей
SELECT DATE(installed_at), COUNT(DISTINCT user_id)
FROM user_scripts
GROUP BY DATE(installed_at)
ORDER BY DATE(installed_at) DESC;
```

---

## Контакты для поддержки

- Backend: проверить логи в Docker/PM2
- База данных: Supabase Dashboard
- Расширение: Chrome Web Store Developer Console

---

**Последнее обновление:** 22 октября 2025
