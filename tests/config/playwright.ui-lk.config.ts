import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  testDir: path.resolve(__dirname, '../ui'),
  testMatch: /lk-.*\.spec\.ts$/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['html', { outputFolder: path.resolve(__dirname, '../reports/ui-lk/html'), open: 'never' }],
    ['json', { outputFile: path.resolve(__dirname, '../reports/ui-lk/results.json') }],
    ['list'],
    [path.resolve(__dirname, '../reporters/live-reporter.ts')]
  ],
  use: {
    baseURL: process.env.LK_BASE_URL || 'https://lk.ebuster.ru',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    storageState: path.resolve(__dirname, '../storage/admin-state.json'),
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  globalSetup: path.resolve(__dirname, './globalSetup.ts'),
});
