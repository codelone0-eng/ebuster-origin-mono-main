import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const STORAGE_FILE = path.resolve(__dirname, '../storage/admin-state.json');

async function globalSetup() {
  const baseUrl = process.env.BASE_URL || 'https://admin.ebuster.ru';
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL и ADMIN_PASSWORD должны быть заданы в окружении для автотестов');
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await Promise.all([
    page.waitForNavigation({ url: /dashboard|admin/i, waitUntil: 'networkidle', timeout: 20000 }),
    page.click('button[type="submit"]'),
  ]);

  fs.mkdirSync(path.dirname(STORAGE_FILE), { recursive: true });
  await page.context().storageState({ path: STORAGE_FILE });

  await browser.close();
}

export default globalSetup;
