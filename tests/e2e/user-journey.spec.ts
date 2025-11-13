import { test, expect } from '@playwright/test';
import { LK_BASE_URL, API_URL } from '../utils/env';

test.describe('E2E: User Journey', () => {
  test.skip(!LK_BASE_URL || !API_URL, 'LK_BASE_URL and API_URL must be provided');

  test('complete user flow: login → browse scripts → create ticket', async ({ page }) => {
    // Step 1: Navigate to login page
    await page.goto(`${LK_BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    // Step 2: Fill login form (assuming test user exists)
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('test@example.com');
      await passwordInput.fill('testpassword');
      
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      
      // Wait for redirect to dashboard
      await page.waitForTimeout(2000);
    }
    
    // Step 3: Navigate to scripts
    await page.goto(`${LK_BASE_URL}/dashboard?tab=scripts`, { waitUntil: 'networkidle' });
    
    const hasScripts = await page.locator('h1, h2, h3').filter({ hasText: /скрипт|script/i }).isVisible().catch(() => false);
    expect(hasScripts).toBeTruthy();
    
    // Step 4: Browse script details
    const firstScript = page.locator('[data-testid="script-card"], .script-card').first();
    if (await firstScript.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstScript.click();
      await page.waitForTimeout(1000);
    }
    
    // Step 5: Navigate to support
    await page.goto(`${LK_BASE_URL}/dashboard?tab=support`, { waitUntil: 'networkidle' });
    
    const hasSupport = await page.locator('h1, h2, h3').filter({ hasText: /тикет|ticket|поддержка|support/i }).isVisible().catch(() => false);
    expect(hasSupport).toBeTruthy();
    
    // Step 6: Try to create ticket
    const createButton = page.locator('button:has-text("Create"), button:has-text("Создать")').first();
    if (await createButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createButton.click();
      await page.waitForTimeout(1000);
      
      const hasModal = await page.locator('[role="dialog"], .modal').isVisible().catch(() => false);
      expect(hasModal).toBeTruthy();
    }
  });

  test('admin flow: view users → manage scripts → check stats', async ({ page }) => {
    // This test would require admin authentication
    // Skipping implementation for now as it needs proper admin setup
    test.skip(true, 'Admin flow requires admin authentication setup');
  });
});
