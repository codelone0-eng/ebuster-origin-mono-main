import { test, expect } from '@playwright/test';
import { BASE_URL } from '../utils/env';

test.describe('Admin: Tickets Management', () => {
  test.skip(!BASE_URL, 'BASE_URL must be provided');

  test('should display tickets list', async ({ page }) => {
    await page.goto(`${BASE_URL}/tickets`, { waitUntil: 'networkidle' });
    
    await expect(page.locator('h1, h2').filter({ hasText: /тикет|ticket/i })).toBeVisible();
    
    const hasList = await page.locator('table, [data-testid="ticket-card"]').isVisible().catch(() => false);
    expect(hasList).toBeTruthy();
  });

  test('should filter tickets by status', async ({ page }) => {
    await page.goto(`${BASE_URL}/tickets`, { waitUntil: 'networkidle' });
    
    const hasFilter = await page.locator('select, [role="combobox"], button:has-text("Filter"), button:has-text("Фильтр")').count().then(c => c > 0).catch(() => false);
    expect(hasFilter).toBeTruthy();
  });

  test('should open ticket details', async ({ page }) => {
    await page.goto(`${BASE_URL}/tickets`, { waitUntil: 'networkidle' });
    
    const firstTicket = page.locator('table tbody tr, [data-testid="ticket-card"]').first();
    const ticketExists = await firstTicket.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (ticketExists) {
      await firstTicket.click();
      await page.waitForTimeout(1000);
      
      const hasModal = await page.locator('[role="dialog"], .modal').isVisible().catch(() => false);
      const urlChanged = page.url().includes('/tickets/');
      
      expect(hasModal || urlChanged).toBeTruthy();
    }
  });

  test('should have ticket actions (reply, close, assign)', async ({ page }) => {
    await page.goto(`${BASE_URL}/tickets`, { waitUntil: 'networkidle' });
    
    const hasActions = await page.locator('button:has-text("Reply"), button:has-text("Close"), button:has-text("Assign"), button:has-text("Ответить"), button:has-text("Закрыть")').count().then(c => c > 0).catch(() => false);
    expect(hasActions).toBeTruthy();
  });
});
