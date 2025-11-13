import { test, expect } from '@playwright/test';
import { API_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/env';

let token: string;
let adminId: string;

const requiresConfig = !API_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD;

test.describe('Admin API smoke suite', () => {
  test.skip(requiresConfig, 'API_URL/ADMIN_EMAIL/ADMIN_PASSWORD must be provided for API tests');

  test.beforeAll(async ({ request }) => {
    const response = await request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
    });

    expect(response.status(), 'Login should return 200').toBe(200);
    const body = await response.json();

    expect(body.success, 'Login should be successful').toBeTruthy();
    expect(body.token, 'JWT token must be returned').toBeTruthy();
    expect(body.user?.id, 'User id must be provided').toBeTruthy();

    token = body.token;
    adminId = body.user.id;
  });

  test('GET /api/health', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/health`);
    expect(response.status(), 'Health endpoint must respond with 200').toBe(200);
  });

  test('GET /api/referral/user/:id/code', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/referral/user/${adminId}/code`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBeTruthy();
    expect(body.data?.code).toBeTruthy();
  });

  test('GET /api/referral/user/:id/stats', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/referral/user/${adminId}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBeTruthy();
    expect(body.data).toBeTruthy();
  });

  test('GET /api/referral/user/:id/referrals', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/referral/user/${adminId}/referrals`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBeTruthy();
    expect(body.data).toBeDefined();
  });

  test('GET /api/scripts/user/installed', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/scripts/user/installed`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBeTruthy();
  });

  test('GET /api/tickets', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/tickets`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
  });
});
