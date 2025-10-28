# Руководство по синхронизации расширения с сайтом

## Событие удаления скрипта

Когда пользователь удаляет скрипт в расширении, нужно отправить событие на сайт:

```javascript
// В расширении (content script или background script)
window.postMessage({
  type: 'EBUSTER_SCRIPT_UNINSTALLED',
  scriptId: 'uuid-скрипта'
}, '*');
```

## Событие установки скрипта

Уже реализовано через Bridge:

```javascript
window.EbusterBridge.installScript(scriptData)
```

## Как это работает:

1. **Расширение** удаляет скрипт локально
2. **Расширение** отправляет `postMessage` с типом `EBUSTER_SCRIPT_UNINSTALLED`
3. **Сайт** (ScriptsList.tsx и Dashboard.tsx) слушает это событие
4. **Сайт** вызывает API `DELETE /api/scripts/user/uninstall/:id`
5. **Сервер** удаляет запись из таблицы `user_scripts`
6. **Сайт** обновляет UI

## Пример полной реализации в расширении:

```javascript
// Функция удаления скрипта в расширении
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

## Логи для отладки:

На сайте в консоли браузера вы увидите:
```
🗑️ Получено событие удаления скрипта: uuid-скрипта
✅ Скрипт удален на сервере
```

На сервере в логах API:
```
🗑️ [uninstallScriptForUser] Удаление скрипта: { userId: '...', scriptId: '...' }
✅ [uninstallScriptForUser] Скрипт удален из БД
```
