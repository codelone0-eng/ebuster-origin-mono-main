import { test, expect } from '@playwright/test';
import { BASE_URL } from '../utils/env';

const routes = [
  { path: '/dashboard', title: /dashboard|статистика/i },
  { path: '/users', title: /пользователи/i },
  { path: '/tickets', title: /тикеты|поддержка/i },
  { path: '/scripts', title: /скрипты/i },
  { path: '/subscriptions', title: /подписки/i },
  { path: '/referrals', title: /реферал/i },
  { path: '/settings', title: /настройки|settings/i }
];

test.describe('Admin navigation smoke', () => {
  test.skip(!BASE_URL, 'BASE_URL must be provided');

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  });

  for (const route of routes) {
    test(`route ${route.path} should be accessible`, async ({ page }) => {
      const response = await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      expect(response?.ok(), `GET ${route.path} should succeed`).toBeTruthy();

      const hasTitle = await page.locator(`text=${route.title.source.replace(/\\/g, '')}`).first().isVisible().catch(() => false);
      const urlMatches = page.url().includes(route.path.replace('/', ''));

      expect(hasTitle || urlMatches).toBeTruthy();
    });
  }
});
