import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const PROJECT_NAME = process.env.PROJECT_NAME || 'Ebuster Autotests';

async function sendTelegramMessage(message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('❌ TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы');
    console.log('Установите переменные окружения:');
    console.log('export TELEGRAM_BOT_TOKEN="your_token"');
    console.log('export TELEGRAM_CHAT_ID="your_chat_id"');
    process.exit(1);
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('❌ Failed to send message:', response.status, body);
      process.exit(1);
    } else {
      console.log('✅ Message sent successfully to Telegram!');
    }
  } catch (error) {
    console.error('❌ Error sending message:', error);
    process.exit(1);
  }
}

function parsePlaywrightReport(): string {
  const reportDir = path.resolve(__dirname, '../../reports/html');
  const indexPath = path.join(reportDir, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.error('❌ HTML report not found at:', indexPath);
    console.log('Run tests first: npm run autotest-admin');
    process.exit(1);
  }

  // Читаем HTML отчёт
  const htmlContent = fs.readFileSync(indexPath, 'utf-8');

  // Парсим результаты из HTML (простой regex-парсинг)
  const passedMatch = htmlContent.match(/(\d+)\s+passed/i);
  const failedMatch = htmlContent.match(/(\d+)\s+failed/i);
  const skippedMatch = htmlContent.match(/(\d+)\s+skipped/i);
  const durationMatch = htmlContent.match(/(\d+m\s+\d+s|\d+s)/i);

  const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
  const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
  const skipped = skippedMatch ? parseInt(skippedMatch[1]) : 0;
  const duration = durationMatch ? durationMatch[1] : 'N/A';
  const total = passed + failed + skipped;

  const statusEmoji = failed === 0 ? '✅' : '❌';
  const statusText = failed === 0 ? 'Успешно' : 'Ошибки';

  let message = `<b>${PROJECT_NAME}</b>\n\n`;
  message += `Статус: ${statusEmoji} ${statusText}\n`;
  message += `Всего тестов: ${total}\n`;
  message += `Пройдено: ${passed}\n`;
  
  if (failed > 0) {
    message += `Упало: ${failed}\n`;
  }
  
  if (skipped > 0) {
    message += `Пропущено: ${skipped}\n`;
  }
  
  message += `Время: ${duration}\n`;

  // Пытаемся найти упавшие тесты
  if (failed > 0) {
    const failedTestsMatch = htmlContent.match(/<div[^>]*class="[^"]*test[^"]*failed[^"]*"[^>]*>([^<]+)<\/div>/gi);
    if (failedTestsMatch && failedTestsMatch.length > 0) {
      message += `\n<b>Ошибки:</b>\n`;
      const failedTests = failedTestsMatch
        .slice(0, 5)
        .map(match => {
          const textMatch = match.match(/>([^<]+)</);
          if (textMatch) {
            const title = textMatch[1]
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .trim();
            return `• ${title}`;
          }
          return null;
        })
        .filter(Boolean);
      
      message += failedTests.join('\n');
      
      if (failedTestsMatch.length > 5) {
        message += `\n…и ещё ${failedTestsMatch.length - 5}`;
      }
    }
  }

  message += `\n\n<i>📊 Последний отчёт</i>`;

  return message;
}

async function main() {
  console.log('📤 Sending last test report to Telegram...\n');
  
  const message = parsePlaywrightReport();
  console.log('Message preview:');
  console.log('─'.repeat(50));
  console.log(message.replace(/<[^>]+>/g, '')); // Remove HTML tags for console
  console.log('─'.repeat(50));
  console.log();
  
  await sendTelegramMessage(message);
}

main();
