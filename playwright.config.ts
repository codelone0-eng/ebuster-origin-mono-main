import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/public/autotest/reports' }],
    ['json', { outputFile: 'tests/public/autotest/results.json' }]
  ],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'https://ebuster.ru',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        // Принудительно используем системный chromium, отключаем headless shell
        executablePath: '/usr/bin/chromium',
        // Отключаем использование headless shell
        channel: undefined,
        // Флаги для работы в Docker
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox', 
          '--disable-dev-shm-usage', 
          '--headless=new',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions',
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          '--disable-backgrounding-occluded-windows',
          '--disable-breakpad',
          '--disable-client-side-phishing-detection',
          '--disable-component-update',
          '--disable-default-apps',
          '--disable-domain-reliability',
          '--disable-features=AudioServiceOutOfProcess,TranslateUI',
          '--disable-hang-monitor',
          '--disable-ipc-flooding-protection',
          '--disable-notifications',
          '--disable-popup-blocking',
          '--disable-prompt-on-repost',
          '--disable-speech-api',
          '--disable-sync',
          '--hide-scrollbars',
          '--metrics-recording-only',
          '--mute-audio',
          '--no-first-run',
          '--no-pings',
          '--password-store=basic',
          '--use-mock-keychain'
        ],
        // Базовые настройки
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
      },
    },
  ],
  webServer: undefined, // Не запускаем локальный сервер, используем production
});

