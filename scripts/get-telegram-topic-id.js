/**
 * Скрипт для получения ID темы в Telegram группе
 * 
 * Использование:
 * 1. Добавьте бота в группу и дайте ему права администратора
 * 2. Отправьте любое сообщение в нужную тему
 * 3. Запустите: node scripts/get-telegram-topic-id.js
 * 
 * Скрипт покажет все сообщения с их message_thread_id
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не задан в переменных окружения');
  process.exit(1);
}

async function getForumTopics() {
  if (!TELEGRAM_CHAT_ID) {
    console.log('⚠️  TELEGRAM_CHAT_ID не задан, пытаемся получить темы из обновлений...');
    return null;
  }

  try {
    // Пытаемся получить список тем форума через getForumTopics (если доступно)
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getForumTopics`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID
      })
    });

    const data = await response.json();

    if (data.ok && data.result && data.result.topics) {
      console.log('\n📋 Найденные темы форума:\n');
      console.log('═'.repeat(60));
      
      data.result.topics.forEach((topic) => {
        console.log(`\n📌 Тема ID: ${topic.message_thread_id}`);
        console.log(`   Название: ${topic.name || '(без названия)'}`);
        console.log(`   Иконка: ${topic.icon_color ? '🎨' : '⚪'}`);
        console.log(`   Сообщений: ${topic.message_count || 0}`);
        console.log('─'.repeat(60));
      });

      if (data.result.topics.length > 0) {
        console.log('\n✅ Используйте message_thread_id из вывода выше');
        console.log('\n📝 Пример использования в deploy.yml:');
        console.log(`   -d message_thread_id="${data.result.topics[0].message_thread_id}"`);
        return data.result.topics;
      }
    } else if (data.error_code === 400) {
      console.log('ℹ️  getForumTopics не доступен (возможно, группа не является форумом)');
    }
  } catch (error) {
    console.log('ℹ️  Не удалось получить темы через getForumTopics:', error.message);
  }
  
  return null;
}

async function getUpdates() {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;
  
  try {
    // Сначала получаем все обновления без offset, чтобы увидеть последние сообщения
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        allowed_updates: ['message'],
        timeout: 1 // Короткий таймаут для быстрого ответа
      })
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('❌ Ошибка API:', data.description);
      return;
    }

    console.log('\n📋 Найденные сообщения в темах:\n');
    console.log('═'.repeat(60));

    const topics = new Map();

    data.result.forEach((update) => {
      const message = update.message;
      if (!message) return;

      const chatId = message.chat.id;
      const threadId = message.message_thread_id;
      const messageId = message.message_id;
      const text = message.text || message.caption || '(без текста)';
      const date = new Date(message.date * 1000).toLocaleString('ru-RU');

      if (threadId) {
        const key = `${chatId}_${threadId}`;
        if (!topics.has(key)) {
          topics.set(key, {
            chatId,
            threadId,
            chatTitle: message.chat.title || `Chat ${chatId}`,
            messages: []
          });
        }
        topics.get(key).messages.push({
          messageId,
          text: text.substring(0, 50),
          date
        });
      }
    });

    if (topics.size === 0) {
      console.log('⚠️  Сообщений в темах не найдено в последних обновлениях.');
      console.log('\n💡 Как получить ID темы:');
      console.log('   Метод 1 (рекомендуется):');
      console.log('   1. Отправьте любое сообщение в нужную тему прямо сейчас');
      console.log('   2. Подождите 2-3 секунды');
      console.log('   3. Запустите скрипт снова: node scripts/get-telegram-topic-id.js');
      console.log('\n   Метод 2 (через веб-версию):');
      console.log('   1. Откройте группу в web.telegram.org');
      console.log('   2. Откройте нужную тему');
      console.log('   3. Посмотрите в консоли браузера (F12) Network запросы');
      console.log('   4. Найдите message_thread_id в запросах');
      console.log('\n   Метод 3 (через бота @userinfobot):');
      console.log('   1. Добавьте @userinfobot в группу');
      console.log('   2. Перешлите сообщение из темы боту');
      console.log('   3. Бот покажет message_thread_id');
      return;
    }

    topics.forEach((topic, key) => {
      console.log(`\n📌 Тема ID: ${topic.threadId}`);
      console.log(`   Группа: ${topic.chatTitle} (${topic.chatId})`);
      console.log(`   Сообщений в теме: ${topic.messages.length}`);
      console.log(`   Последние сообщения:`);
      topic.messages.slice(-3).forEach(msg => {
        console.log(`      • [${msg.date}] ${msg.text}...`);
      });
      console.log('─'.repeat(60));
    });

    console.log('\n✅ Используйте message_thread_id из вывода выше');
    console.log('\n📝 Пример использования в deploy.yml:');
    console.log(`   -d message_thread_id="${Array.from(topics.values())[0].threadId}"`);

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

// Очистка обновлений после получения (опционально)
async function clearUpdates() {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;
  
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offset: -1
      })
    });
  } catch (error) {
    // Игнорируем ошибки очистки
  }
}

// Запуск
async function main() {
  // Сначала пытаемся получить темы через getForumTopics
  const forumTopics = await getForumTopics();
  
  // Если не получилось, используем getUpdates
  if (!forumTopics || forumTopics.length === 0) {
    await getUpdates();
  }
  
  console.log('\n💡 Совет: После получения ID темы можно очистить обновления:');
  console.log('   node scripts/get-telegram-topic-id.js --clear');
  
  if (process.argv.includes('--clear')) {
    clearUpdates();
  }
}

main();

