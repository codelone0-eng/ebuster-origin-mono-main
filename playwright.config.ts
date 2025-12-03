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
        // Отключаем использование headless shell, используем обычный chromium
        channel: undefined,
        // Используем системный chromium из Alpine
        executablePath: '/usr/bin/chromium',
        // Флаги для работы в Docker
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox', 
          '--disable-dev-shm-usage', 
          '--headless=new',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions'
        ],
        // Базовые настройки
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
      },
    },
  ],
  webServer: undefined, // Не запускаем локальный сервер, используем production
});

