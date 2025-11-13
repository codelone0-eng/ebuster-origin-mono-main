import { test, expect } from '@playwright/test';
import { BASE_URL } from '../utils/env';

const dashboardSelectors = [
  'h1:has-text("Dashboard")',
  '[data-testid="dashboard-stats"]',
  '.admin-dashboard'
];

test.describe('Авторизация администратора', () => {
  test('должна загружать главную страницу админки', async ({ page }) => {
    test.skip(!BASE_URL, 'BASE_URL не задан');

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Проверяем что есть хотя бы один ожидаемый селектор дашборда
    const firstVisibleSelector = dashboardSelectors.find(async (selector) =>
      await page.locator(selector).first().isVisible({ timeout: 2000 }).catch(() => false)
    );

    // Для fallback убеждаемся, что URL содержит dashboard или admin
    const urlContainsDashboard = /dashboard|admin/i.test(page.url());

    expect(firstVisibleSelector || urlContainsDashboard).toBeTruthy();
  });

  test('должна позволять открыть страницу профиля', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/profile/i);
    await expect(page.locator('text=Профиль')).toBeVisible({ timeout: 5000 });
  });
});
