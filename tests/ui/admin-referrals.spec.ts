import { test, expect } from '@playwright/test';
import { BASE_URL } from '../utils/env';

test.describe('Admin: Referrals Management', () => {
  test.skip(!BASE_URL, 'BASE_URL must be provided');

  test('should display referrals overview', async ({ page }) => {
    await page.goto(`${BASE_URL}/referrals`, { waitUntil: 'networkidle' });
    
    await expect(page.locator('h1, h2').filter({ hasText: /реферал|referral/i })).toBeVisible();
  });

  test('should display referral stats', async ({ page }) => {
    await page.goto(`${BASE_URL}/referrals`, { waitUntil: 'networkidle' });
    
    const hasStats = await page.locator('[data-testid="stats"], .stats, .metrics').count().then(c => c > 0).catch(() => false);
    expect(hasStats).toBeTruthy();
  });

  test('should display referral codes list', async ({ page }) => {
    await page.goto(`${BASE_URL}/referrals`, { waitUntil: 'networkidle' });
    
    const hasList = await page.locator('table, [data-testid="referral-code"]').isVisible().catch(() => false);
    expect(hasList).toBeTruthy();
  });

  test('should have referral management actions', async ({ page }) => {
    await page.goto(`${BASE_URL}/referrals`, { waitUntil: 'networkidle' });
    
    const hasActions = await page.locator('button:has-text("Create"), button:has-text("Edit"), button:has-text("Создать")').count().then(c => c > 0).catch(() => false);
    expect(hasActions).toBeTruthy();
  });
});
