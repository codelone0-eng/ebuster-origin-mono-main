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
    // Используем системный chromium в Alpine Linux
    executablePath: process.env.CI ? '/usr/bin/chromium-browser' : undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: undefined, // Не запускаем локальный сервер, используем production
});

