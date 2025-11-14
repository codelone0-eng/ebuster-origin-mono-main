import { defineConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  testDir: path.resolve(__dirname, '../api'),
  testMatch: /api-extended\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [
    ['html', { outputFolder: path.resolve(__dirname, '../reports/api-lk/html'), open: 'never' }],
    ['json', { outputFile: path.resolve(__dirname, '../reports/api-lk/results.json') }],
    ['list']
  ],
  use: {
    baseURL: process.env.API_URL || 'https://api.ebuster.ru',
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
    storageState: path.resolve(__dirname, '../storage/admin-state.json'),
  },
  globalSetup: path.resolve(__dirname, './globalSetup.ts'),
});
