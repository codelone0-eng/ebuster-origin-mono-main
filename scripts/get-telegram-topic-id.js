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

async function getUpdates() {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        allowed_updates: ['message']
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
      console.log('⚠️  Сообщений в темах не найдено.');
      console.log('\n💡 Как получить ID темы:');
      console.log('   1. Отправьте любое сообщение в нужную тему');
      console.log('   2. Запустите скрипт снова');
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
getUpdates().then(() => {
  console.log('\n💡 Совет: После получения ID темы можно очистить обновления:');
  console.log('   node scripts/get-telegram-topic-id.js --clear');
  
  if (process.argv.includes('--clear')) {
    clearUpdates();
  }
});

