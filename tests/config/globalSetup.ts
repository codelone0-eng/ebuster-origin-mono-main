import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageDir = path.resolve(__dirname, '../storage');
const STORAGE_FILE = path.resolve(storageDir, 'admin-state.json');

async function globalSetup() {
  const baseUrl = process.env.BASE_URL || 'https://admin.ebuster.ru';
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL и ADMIN_PASSWORD должны быть заданы в окружении для автотестов');
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log(`🔐 Attempting login at ${baseUrl}/login`);
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  
  // Используем более надёжные селекторы
  const emailInput = page.locator('input#email, input[name="email"]').first();
  const passwordInput = page.locator('input#password, input[name="password"]').first();
  
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(email);
  await passwordInput.fill(password);
  
  console.log(`✅ Filled credentials for ${email}`);
  
  // Кликаем на кнопку отправки формы
  await page.click('button[type="submit"]');
  
  // Ждём редиректа или изменения URL
  await page.waitForTimeout(3000);
  const currentUrl = page.url();
  console.log(`📍 Current URL after login: ${currentUrl}`);
  
  // Проверяем, что мы не на странице логина
  if (currentUrl.includes('/login')) {
    console.error('❌ Still on login page, authentication might have failed');
    const errorMessage = await page.locator('.error, [role="alert"], .text-destructive').textContent().catch(() => null);
    if (errorMessage) {
      console.error(`Error message: ${errorMessage}`);
    }
  }

  fs.mkdirSync(storageDir, { recursive: true });
  await page.context().storageState({ path: STORAGE_FILE });

  await browser.close();
}

export default globalSetup;
