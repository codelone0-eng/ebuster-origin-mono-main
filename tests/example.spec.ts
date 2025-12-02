import { test, expect } from '@playwright/test';

test.describe('Ebuster Landing Page', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('https://ebuster.ru');
    await expect(page).toHaveTitle(/Ebuster/i);
  });

  test('should have navigation', async ({ page }) => {
    await page.goto('https://ebuster.ru');
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });
});

test.describe('Ebuster Login Page', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('https://lk.ebuster.ru');
    // Проверяем, что страница загрузилась
    await expect(page).toHaveURL(/lk\.ebuster\.ru/);
  });
});

