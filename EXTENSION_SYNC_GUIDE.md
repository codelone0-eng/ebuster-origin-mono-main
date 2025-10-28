# Руководство по синхронизации расширения с сайтом

## 1️⃣ Событие удаления скрипта

Когда пользователь удаляет скрипт в расширении, нужно отправить событие на сайт:

```javascript
// В расширении (content script или background script)
window.postMessage({
  type: 'EBUSTER_SCRIPT_UNINSTALLED',
  scriptId: 'uuid-скрипта'
}, '*');
```

## 2️⃣ Получение списка установленных скриптов

Сайт запрашивает список установленных скриптов через Bridge:

```javascript
// На сайте (в ScriptsList.tsx и Dashboard.tsx)
const extensionScripts = await new Promise((resolve) => {
  window.EbusterBridge.sendMessage(
    { action: 'GET_INSTALLED_SCRIPTS' },
    (response, error) => {
      if (error) {
        resolve([]);
      } else {
        resolve(Array.isArray(response) ? response : []);
      }
    }
  );
});
```

**В расширении нужно обработать это сообщение:**

```javascript
// В background script расширения
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_INSTALLED_SCRIPTS') {
    // Получаем все скрипты из chrome.storage.local
    chrome.storage.local.get(null, (data) => {
      const scripts = Object.entries(data)
        .filter(([key]) => key.startsWith('script_'))
        .map(([_, script]) => ({
          id: script.id,
          name: script.name,
          source: script.source || 'Установлено с сайта', // ВАЖНО!
          // ... другие поля
        }));
      
      sendResponse(scripts);
    });
    
    return true; // Асинхронный ответ
  }
});
```

## 3️⃣ Структура скрипта в расширении

Каждый скрипт должен иметь поле `source`:

```javascript
{
  id: 'uuid-скрипта',
  name: 'Название скрипта',
  code: 'код скрипта',
  source: 'Установлено с сайта', // ОБЯЗАТЕЛЬНО!
  // ... другие поля
}
```

## 4️⃣ Синхронизация при загрузке страницы

Когда пользователь открывает сайт:

1. **Сайт** загружает список установленных скриптов с сервера
2. **Сайт** запрашивает список скриптов из расширения через Bridge
3. **Сайт** сравнивает списки
4. Если расхождение:
   - **Сайт** отправляет на сервер список скриптов из расширения
   - **Сервер** обновляет таблицу `user_scripts`
   - **Сайт** обновляет UI

## 5️⃣ Логи для отладки:

На сайте в консоли браузера вы увидите:

```
📦 [loadInstalledScripts] Скрипты в расширении: [...]
⚠️ [loadInstalledScripts] Расхождение! На сервере: 5 В расширении: 3
🔄 [syncUserScripts] Синхронизация скриптов: { userId: '...', count: 3 }
✅ [syncUserScripts] Записи добавлены
```

На сервере в логах API:

```
🔄 [syncUserScripts] Синхронизация скриптов: { userId: '...', count: 3 }
🗑️ [syncUserScripts] Удаляем старые записи...
📝 [syncUserScripts] Добавляем новые записи: [...]
✅ [syncUserScripts] Записи добавлены
```

## 6️⃣ Пример полной реализации в расширении:

```javascript
// background.js

// Обработка сообщений от сайта
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_INSTALLED_SCRIPTS') {
    // Получаем все скрипты
    chrome.storage.local.get(null, (data) => {
      const scripts = Object.entries(data)
        .filter(([key]) => key.startsWith('script_'))
        .map(([_, script]) => ({
          id: script.id,
          name: script.name,
          source: script.source || 'Установлено с сайта'
        }));
      
      console.log('📦 [GET_INSTALLED_SCRIPTS] Отправляем скрипты:', scripts);
      sendResponse(scripts);
    });
    
    return true; // Асинхронный ответ
  }
});

// Функция удаления скрипта
async function uninstallScript(scriptId) {
  try {
    // 1. Удаляем скрипт локально из chrome.storage
    await chrome.storage.local.remove(`script_${scriptId}`);
    
    // 2. Уведомляем сайт
    window.postMessage({
      type: 'EBUSTER_SCRIPT_UNINSTALLED',
      scriptId: scriptId
    }, '*');
    
    console.log('✅ Скрипт удален и событие отправлено');
  } catch (error) {
    console.error('❌ Ошибка удаления скрипта:', error);
  }
}
```

## ✅ Проверка работы:

1. Откройте сайт lk.ebuster.ru
2. Откройте консоль браузера (F12)
3. Перейдите на вкладку "Установленные скрипты"
4. В консоли должны быть логи синхронизации
5. Если расхождение - должна произойти синхронизация
6. Список скриптов должен совпадать с расширением
