import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageDir = path.resolve(__dirname, '../storage');
const STORAGE_FILE = path.resolve(storageDir, 'admin-state.json');

async function globalSetup() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL и ADMIN_PASSWORD должны быть заданы в окружении для автотестов');
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Логинимся через основной домен ebuster.ru, где есть страница /login
  const loginUrl = 'https://ebuster.ru/login';
  console.log(`🔐 Attempting login at ${loginUrl}`);
  await page.goto(loginUrl, { waitUntil: 'networkidle' });
  
  // Используем селекторы для полей ввода
  const emailInput = page.locator('input#email, input[name="email"]').first();
  const passwordInput = page.locator('input#password, input[name="password"]').first();
  
  console.log('⏳ Waiting for email input to be visible');
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  
  await emailInput.fill(email);
  await passwordInput.fill(password);
  
  console.log(`✅ Filled credentials for ${email}`);
  
  // Кликаем на кнопку отправки формы
  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.click();
  
  // Ждём редиректа после логина
  console.log('⏳ Waiting for navigation after login');
  await page.waitForTimeout(5000);
  const currentUrl = page.url();
  console.log(`📍 Current URL after login: ${currentUrl}`);
  
  // Проверяем, что логин прошёл успешно (должны быть на dashboard или admin)
  if (currentUrl.includes('/dashboard') || currentUrl.includes('/admin')) {
    console.log('✅ Login successful, user authenticated');
  } else {
    console.warn(`⚠️ Unexpected URL after login: ${currentUrl}`);
  }

  // Сохраняем состояние аутентификации
  fs.mkdirSync(storageDir, { recursive: true });
  await page.context().storageState({ path: STORAGE_FILE });
  console.log(`💾 Saved auth state to ${STORAGE_FILE}`);

  await browser.close();
}

export default globalSetup;
