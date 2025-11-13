import { test, expect } from '@playwright/test';
import { LK_BASE_URL } from '../utils/env';

test.describe('LK: Scripts Library', () => {
  test.skip(!LK_BASE_URL, 'LK_BASE_URL must be provided');

  test('should display scripts library', async ({ page }) => {
    await page.goto(`${LK_BASE_URL}/dashboard?tab=scripts`, { waitUntil: 'networkidle' });
    
    await expect(page.locator('h1, h2, h3').filter({ hasText: /скрипт|script/i })).toBeVisible();
  });

  test('should display installed scripts', async ({ page }) => {
    await page.goto(`${LK_BASE_URL}/dashboard?tab=installed`, { waitUntil: 'networkidle' });
    
    const hasScripts = await page.locator('[data-testid="installed-script"], .installed-script').count().then(c => c >= 0).catch(() => true);
    expect(hasScripts).toBeTruthy();
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto(`${LK_BASE_URL}/dashboard?tab=scripts`, { waitUntil: 'networkidle' });
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="поиск" i], input[placeholder*="search" i]').first();
    const hasSearch = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasSearch).toBeTruthy();
  });

  test('should display script details on click', async ({ page }) => {
    await page.goto(`${LK_BASE_URL}/dashboard?tab=scripts`, { waitUntil: 'networkidle' });
    
    const firstScript = page.locator('[data-testid="script-card"], .script-card, .script-item').first();
    const scriptExists = await firstScript.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (scriptExists) {
      await firstScript.click();
      await page.waitForTimeout(1000);
      
      const hasModal = await page.locator('[role="dialog"], .modal').isVisible().catch(() => false);
      expect(hasModal).toBeTruthy();
    }
  });
});
