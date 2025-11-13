import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDir = path.resolve(__dirname, '..');
const storageStatePath = path.resolve(__dirname, '../storage/admin-state.json');

export default defineConfig({
  testDir,
  timeout: 120000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: true,
  globalSetup: path.resolve(__dirname, './globalSetup.ts'),
  reporter: [
    ['list'],
    ['html', { outputFolder: path.resolve(__dirname, '../reports/html'), open: 'never' }],
    ['allure-playwright', {
      outputFolder: path.resolve(__dirname, '../reports/allure-results'),
      detail: true,
      suiteTitle: false,
    }],
    [path.resolve(__dirname, './telegramReporter.ts'), { projectName: process.env.PROJECT_NAME }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://admin.ebuster.ru',
    storageState: storageStatePath,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
    extraHTTPHeaders: {
      'Accept-Language': 'ru-RU',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    }
  ],
  workers: process.env.CI ? 4 : undefined,
});
