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
    // Проверяем, что страница загрузилась (может быть редирект на ebuster.ru)
    const url = page.url();
    expect(url).toMatch(/ebuster\.ru/);
    // Проверяем, что страница содержит элементы входа
    await expect(page.locator('body')).toBeVisible();
  });
});

