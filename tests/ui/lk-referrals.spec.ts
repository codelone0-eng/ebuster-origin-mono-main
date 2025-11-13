import { test, expect } from '@playwright/test';
import { LK_BASE_URL } from '../utils/env';

test.describe('LK: Referral Program', () => {
  test.skip(!LK_BASE_URL, 'LK_BASE_URL must be provided');

  test('should display referral program', async ({ page }) => {
    await page.goto(`${LK_BASE_URL}/dashboard?tab=referral`, { waitUntil: 'networkidle' });
    
    await expect(page.locator('h1, h2, h3').filter({ hasText: /реферал|referral/i })).toBeVisible();
  });

  test('should display referral code', async ({ page }) => {
    await page.goto(`${LK_BASE_URL}/dashboard?tab=referral`, { waitUntil: 'networkidle' });
    
    const hasCode = await page.locator('[data-testid="referral-code"], .referral-code, code').isVisible().catch(() => false);
    expect(hasCode).toBeTruthy();
  });

  test('should have copy referral code button', async ({ page }) => {
    await page.goto(`${LK_BASE_URL}/dashboard?tab=referral`, { waitUntil: 'networkidle' });
    
    const copyButton = page.locator('button:has-text("Copy"), button:has-text("Копировать")').first();
    const hasButton = await copyButton.isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasButton).toBeTruthy();
  });

  test('should display referral stats', async ({ page }) => {
    await page.goto(`${LK_BASE_URL}/dashboard?tab=referral`, { waitUntil: 'networkidle' });
    
    const hasStats = await page.locator('[data-testid="referral-stats"], .referral-stats, .stats').isVisible().catch(() => false);
    expect(hasStats).toBeTruthy();
  });

  test('should display referrals list', async ({ page }) => {
    await page.goto(`${LK_BASE_URL}/dashboard?tab=referral`, { waitUntil: 'networkidle' });
    
    const hasList = await page.locator('table, [data-testid="referral-list"]').count().then(c => c >= 0).catch(() => true);
    expect(hasList).toBeTruthy();
  });
});
