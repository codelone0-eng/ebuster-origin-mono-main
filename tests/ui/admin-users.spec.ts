import { test, expect } from '@playwright/test';
import { BASE_URL } from '../utils/env';

test.describe('Admin: Users Management', () => {
  test.skip(!BASE_URL, 'BASE_URL must be provided');

  test('should display users list', async ({ page }) => {
    await page.goto(`${BASE_URL}/users`, { waitUntil: 'networkidle' });
    
    // Проверяем наличие заголовка страницы
    await expect(page.locator('h1, h2').filter({ hasText: /пользовател/i })).toBeVisible();
    
    // Проверяем наличие таблицы или списка пользователей
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasCards = await page.locator('[data-testid="user-card"], .user-item').count().then(c => c > 0).catch(() => false);
    
    expect(hasTable || hasCards).toBeTruthy();
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto(`${BASE_URL}/users`, { waitUntil: 'networkidle' });
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="поиск" i], input[placeholder*="search" i]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  test('should open user details', async ({ page }) => {
    await page.goto(`${BASE_URL}/users`, { waitUntil: 'networkidle' });
    
    // Ищем первую строку/карточку пользователя
    const firstUser = page.locator('table tbody tr, [data-testid="user-card"]').first();
    await expect(firstUser).toBeVisible({ timeout: 10000 });
    
    await firstUser.click();
    
    // Проверяем что открылась детальная страница или модалка
    await page.waitForTimeout(1000);
    const hasModal = await page.locator('[role="dialog"], .modal').isVisible().catch(() => false);
    const urlChanged = page.url().includes('/users/');
    
    expect(hasModal || urlChanged).toBeTruthy();
  });

  test('should have user actions (ban, edit, etc)', async ({ page }) => {
    await page.goto(`${BASE_URL}/users`, { waitUntil: 'networkidle' });
    
    // Проверяем наличие кнопок действий
    const hasActions = await page.locator('button:has-text("Ban"), button:has-text("Edit"), button:has-text("Delete"), [data-testid*="action"]').count().then(c => c > 0).catch(() => false);
    
    expect(hasActions).toBeTruthy();
  });
});
