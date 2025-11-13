import { test, expect } from '@playwright/test';
import { LK_BASE_URL } from '../utils/env';

test.describe('LK: Support Tickets', () => {
  test.skip(!LK_BASE_URL, 'LK_BASE_URL must be provided');

  test('should display tickets section', async ({ page }) => {
    await page.goto(`${LK_BASE_URL}/dashboard?tab=support`, { waitUntil: 'networkidle' });
    
    await expect(page.locator('h1, h2, h3').filter({ hasText: /тикет|ticket|поддержка|support/i })).toBeVisible();
  });

  test('should have create ticket button', async ({ page }) => {
    await page.goto(`${LK_BASE_URL}/dashboard?tab=support`, { waitUntil: 'networkidle' });
    
    const createButton = page.locator('button:has-text("Create"), button:has-text("Создать"), button:has-text("New")').first();
    await expect(createButton).toBeVisible({ timeout: 10000 });
  });

  test('should display tickets list', async ({ page }) => {
    await page.goto(`${LK_BASE_URL}/dashboard?tab=support`, { waitUntil: 'networkidle' });
    
    const hasList = await page.locator('[data-testid="ticket-list"], .ticket-list, table').isVisible().catch(() => false);
    expect(hasList).toBeTruthy();
  });

  test('should filter tickets by status', async ({ page }) => {
    await page.goto(`${LK_BASE_URL}/dashboard?tab=support`, { waitUntil: 'networkidle' });
    
    const hasFilter = await page.locator('button:has-text("All"), button:has-text("Open"), button:has-text("Closed"), button:has-text("Все"), button:has-text("Открытые")').count().then(c => c > 0).catch(() => false);
    expect(hasFilter).toBeTruthy();
  });
});
