import { test, expect } from '@playwright/test';
import { LK_BASE_URL } from '../utils/env';

test.describe('LK: Dashboard', () => {
  test.skip(!LK_BASE_URL, 'LK_BASE_URL must be provided');

  test('should display dashboard page', async ({ page }) => {
    await page.goto(`${LK_BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    
    await expect(page.locator('h1, h2').filter({ hasText: /dashboard|дашборд|личный кабинет/i })).toBeVisible();
  });

  test('should display user profile info', async ({ page }) => {
    await page.goto(`${LK_BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    
    const hasProfile = await page.locator('[data-testid="user-profile"], .user-info, .profile').isVisible().catch(() => false);
    expect(hasProfile).toBeTruthy();
  });

  test('should display navigation menu', async ({ page }) => {
    await page.goto(`${LK_BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    
    const hasNav = await page.locator('nav, [role="navigation"], aside').isVisible().catch(() => false);
    expect(hasNav).toBeTruthy();
  });

  test('should navigate to scripts section', async ({ page }) => {
    await page.goto(`${LK_BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    
    const scriptsLink = page.locator('a:has-text("Scripts"), a:has-text("Скрипты"), button:has-text("Scripts"), button:has-text("Скрипты")').first();
    await scriptsLink.click();
    
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('script');
  });

  test('should navigate to profile settings', async ({ page }) => {
    await page.goto(`${LK_BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    
    const settingsLink = page.locator('a:has-text("Settings"), a:has-text("Настройки"), button:has-text("Settings"), button:has-text("Настройки")').first();
    await settingsLink.click();
    
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('setting');
  });
});
