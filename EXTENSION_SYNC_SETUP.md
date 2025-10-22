# Настройка синхронизации расширения с сайтом

## 1. Создать таблицу в Supabase

Выполните этот SQL в Supabase SQL Editor:

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

-- Пользователи могут видеть только свои установленные скрипты
CREATE POLICY "Users can view their own installed scripts"
  ON user_scripts FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователи могут добавлять скрипты себе
CREATE POLICY "Users can install scripts for themselves"
  ON user_scripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Пользователи могут удалять свои скрипты
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

## 2. API Endpoints

### Для расширения:

- `GET /api/scripts/user/installed` - Получить установленные скрипты
- `POST /api/scripts/user/install/:id` - Установить скрипт
- `DELETE /api/scripts/user/uninstall/:id` - Удалить скрипт
- `POST /api/scripts/user/sync` - Синхронизировать все скрипты
- `GET /api/scripts/user/check-updates` - Проверить обновления

### Для lk.ebuster.ru:

- `POST /api/scripts/user/install/:id` - Установить скрипт (автоматически загрузится в расширение)

## 3. Логика работы

### Установка скрипта из lk.ebuster.ru:

1. Пользователь нажимает "Установить" на lk.ebuster.ru
2. Сайт вызывает `POST /api/scripts/user/install/:id`
3. Скрипт добавляется в таблицу `user_scripts`
4. Расширение периодически проверяет `GET /api/scripts/user/installed`
5. Расширение загружает новые скрипты автоматически

### Проверка обновлений:

1. Расширение отправляет список установленных скриптов с версиями
2. API проверяет есть ли новые версии
3. Расширение загружает обновленные скрипты
4. Показывает уведомление пользователю

### Синхронизация:

1. При авторизации расширение загружает все скрипты пользователя
2. При установке/удалении скрипта в расширении - синхронизирует с сервером
3. При установке скрипта на сайте - расширение автоматически подхватывает

## 4. Обновление расширения

Добавьте в `api-client.js` расширения:

```javascript
// Получить установленные скрипты
async getInstalledScripts() {
  return this.request('/scripts/user/installed');
}

// Установить скрипт
async installScript(scriptId) {
  return this.request(`/scripts/user/install/${scriptId}`, {
    method: 'POST'
  });
}

// Удалить скрипт
async uninstallScript(scriptId) {
  return this.request(`/scripts/user/uninstall/${scriptId}`, {
    method: 'DELETE'
  });
}

// Синхронизировать скрипты
async syncScripts(scriptIds) {
  return this.request('/scripts/user/sync', {
    method: 'POST',
    body: JSON.stringify({ scriptIds })
  });
}

// Проверить обновления
async checkUpdates(scripts) {
  const params = new URLSearchParams({
    scripts: JSON.stringify(scripts)
  });
  return this.request(`/scripts/user/check-updates?${params}`);
}
```

## 5. Background Script для автосинхронизации

Добавьте в `background.js`:

```javascript
// Проверка обновлений каждые 30 минут
chrome.alarms.create('checkScriptUpdates', { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'checkScriptUpdates') {
    const api = new EbusterAPI();
    const isAuth = await api.verifyAuth();
    
    if (isAuth) {
      // Получаем локальные скрипты
      const { scripts } = await chrome.storage.local.get('scripts');
      
      if (scripts && scripts.length > 0) {
        const installedScripts = scripts.map(s => ({
          id: s.id,
          version: s.version
        }));
        
        // Проверяем обновления
        const { updates } = await api.checkUpdates(installedScripts);
        
        if (updates && updates.length > 0) {
          // Показываем уведомление
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Ebuster - Доступны обновления',
            message: `Доступно обновлений: ${updates.length}`
          });
        }
      }
    }
  }
});
```

## 6. Тестирование

1. Авторизуйтесь в расширении
2. Установите скрипт через lk.ebuster.ru
3. Откройте расширение - скрипт должен появиться автоматически
4. Обновите версию скрипта на сайте
5. Расширение должно показать уведомление об обновлении

---

**Важно:** Все API endpoints требуют авторизации через JWT токен!
