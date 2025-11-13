import { test, expect } from '@playwright/test';
import { BASE_URL } from '../utils/env';

test.describe('Admin: Subscriptions Management', () => {
  test.skip(!BASE_URL, 'BASE_URL must be provided');

  test('should display subscriptions list', async ({ page }) => {
    await page.goto(`${BASE_URL}/subscriptions`, { waitUntil: 'networkidle' });
    
    await expect(page.locator('h1, h2').filter({ hasText: /подписк/i })).toBeVisible();
    
    const hasList = await page.locator('table, [data-testid="subscription-card"]').isVisible().catch(() => false);
    expect(hasList).toBeTruthy();
  });

  test('should display subscription stats', async ({ page }) => {
    await page.goto(`${BASE_URL}/subscriptions`, { waitUntil: 'networkidle' });
    
    const hasStats = await page.locator('[data-testid="stats"], .stats, .metrics').count().then(c => c > 0).catch(() => false);
    expect(hasStats).toBeTruthy();
  });

  test('should filter subscriptions by status', async ({ page }) => {
    await page.goto(`${BASE_URL}/subscriptions`, { waitUntil: 'networkidle' });
    
    const hasFilter = await page.locator('select, [role="combobox"], button:has-text("Filter")').count().then(c => c > 0).catch(() => false);
    expect(hasFilter).toBeTruthy();
  });

  test('should have subscription actions', async ({ page }) => {
    await page.goto(`${BASE_URL}/subscriptions`, { waitUntil: 'networkidle' });
    
    const hasActions = await page.locator('button:has-text("Cancel"), button:has-text("Renew"), button:has-text("Edit")').count().then(c => c > 0).catch(() => false);
    expect(hasActions).toBeTruthy();
  });
});
