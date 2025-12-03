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
        // Используем системный chromium из Alpine Linux
        // В Alpine chromium обычно находится в /usr/bin/chromium
        channel: undefined, // Отключаем использование каналов Playwright
        executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium',
        // Флаги для работы в Docker
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox', 
          '--disable-dev-shm-usage', 
          '--headless=new',
          '--disable-gpu',
          '--disable-software-rasterizer'
        ],
        // Базовые настройки
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
      },
    },
  ],
  webServer: undefined, // Не запускаем локальный сервер, используем production
});

