import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const PROJECT_NAME = process.env.PROJECT_NAME || 'Ebuster Admin Autotests';

const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

// Экранирование специальных символов для Telegram MarkdownV2
const escapeMarkdown = (text: string): string => {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
};

async function sendTelegramMessage(message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('[telegram-reporter] TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы, сообщение не отправлено');
    return;
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
      console.warn('[telegram-reporter] Failed to send message', response.status, body);
    } else {
      console.log('[telegram-reporter] ✅ Message sent successfully');
    }
  } catch (error) {
    console.error('[telegram-reporter] Error sending message', error);
  }
}

class TelegramReporter implements Reporter {
  private startTime = Date.now();
  private totalTests = 0;
  private failedTests: { test: TestCase; result: TestResult }[] = [];

  onBegin(_config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    this.totalTests = suite.allTests().length;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed') {
      this.failedTests.push({ test, result });
    }
  }

  async onEnd(result: FullResult) {
    const duration = Date.now() - this.startTime;
    const passed = this.totalTests - this.failedTests.length;
    const skipped = result.status === 'interrupted' ? 0 : 0;

    // Используем HTML-разметку вместо Markdown
    const statusEmoji = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
    const statusText = result.status === 'passed' ? 'Успешно' : result.status === 'failed' ? 'Ошибки' : 'Прервано';
    
    let message = `<b>${PROJECT_NAME}</b>\n\n`;
    message += `Статус: ${statusEmoji} ${statusText}\n`;
    message += `Всего тестов: ${this.totalTests}\n`;
    message += `Пройдено: ${passed}\n`;
    message += `Упало: ${this.failedTests.length}\n`;
    message += `Время: ${formatDuration(duration)}\n`;

    if (this.failedTests.length > 0) {
      message += `\n<b>Ошибки:</b>\n`;
      
      const failedDetails = this.failedTests
        .slice(0, 5)
        .map(({ test }) => {
          // Экранируем HTML-символы в названии теста
          const title = test.title
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          return `• ${title}`;
        });

      message += failedDetails.join('\n');

      if (this.failedTests.length > 5) {
        message += `\n…и ещё ${this.failedTests.length - 5}`;
      }
    }

    await sendTelegramMessage(message);
  }
}

export default TelegramReporter;
