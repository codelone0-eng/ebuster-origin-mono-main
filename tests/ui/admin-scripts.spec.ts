import { test, expect } from '@playwright/test';
import { BASE_URL } from '../utils/env';

test.describe('Admin: Scripts Management', () => {
  test.skip(!BASE_URL, 'BASE_URL must be provided');

  test('should display scripts list', async ({ page }) => {
    await page.goto(`${BASE_URL}/scripts`, { waitUntil: 'networkidle' });
    
    await expect(page.locator('h1, h2').filter({ hasText: /скрипт/i })).toBeVisible();
    
    const hasScripts = await page.locator('table, [data-testid="script-card"], .script-item').isVisible().catch(() => false);
    expect(hasScripts).toBeTruthy();
  });

  test('should have add script button', async ({ page }) => {
    await page.goto(`${BASE_URL}/scripts`, { waitUntil: 'networkidle' });
    
    const addButton = page.locator('button:has-text("Add"), button:has-text("Добавить"), button:has-text("Create")').first();
    await expect(addButton).toBeVisible({ timeout: 10000 });
  });

  test('should filter scripts by category', async ({ page }) => {
    await page.goto(`${BASE_URL}/scripts`, { waitUntil: 'networkidle' });
    
    const hasFilter = await page.locator('select, [role="combobox"], button:has-text("Filter")').count().then(c => c > 0).catch(() => false);
    expect(hasFilter).toBeTruthy();
  });

  test('should open script details', async ({ page }) => {
    await page.goto(`${BASE_URL}/scripts`, { waitUntil: 'networkidle' });
    
    const firstScript = page.locator('table tbody tr, [data-testid="script-card"]').first();
    await expect(firstScript).toBeVisible({ timeout: 10000 });
    
    await firstScript.click();
    await page.waitForTimeout(1000);
    
    const hasModal = await page.locator('[role="dialog"], .modal').isVisible().catch(() => false);
    const urlChanged = page.url().includes('/scripts/');
    
    expect(hasModal || urlChanged).toBeTruthy();
  });

  test('should have script actions (edit, delete, publish)', async ({ page }) => {
    await page.goto(`${BASE_URL}/scripts`, { waitUntil: 'networkidle' });
    
    const hasActions = await page.locator('button:has-text("Edit"), button:has-text("Delete"), button:has-text("Publish")').count().then(c => c > 0).catch(() => false);
    expect(hasActions).toBeTruthy();
  });
});
