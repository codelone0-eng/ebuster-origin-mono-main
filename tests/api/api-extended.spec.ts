import { test, expect } from '@playwright/test';
import { API_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/env';

let token: string;
let userId: string;

const requiresConfig = !API_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD;

test.describe('API: Extended Tests', () => {
  test.skip(requiresConfig, 'API_URL/ADMIN_EMAIL/ADMIN_PASSWORD must be provided');

  test.beforeAll(async ({ request }) => {
    const response = await request.post(`${API_URL}/api/auth/login`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    token = body.token;
    userId = body.user.id;
  });

  test.describe('Scripts API', () => {
    test('GET /api/scripts should return scripts list', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/scripts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.success).toBeTruthy();
      expect(Array.isArray(body.data)).toBeTruthy();
    });

    test('GET /api/scripts/:id should return script details', async ({ request }) => {
      // Сначала получаем список скриптов
      const listResponse = await request.get(`${API_URL}/api/scripts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const listBody = await listResponse.json();
      
      if (listBody.data && listBody.data.length > 0) {
        const scriptId = listBody.data[0].id;
        
        const response = await request.get(`${API_URL}/api/scripts/${scriptId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.success).toBeTruthy();
        expect(body.data.id).toBe(scriptId);
      }
    });
  });

  test.describe('Tickets API', () => {
    test('GET /api/tickets should return tickets list', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status()).toBe(200);
    });

    test('POST /api/tickets should create new ticket', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          subject: 'Test Ticket',
          message: 'This is a test ticket created by autotest',
          priority: 'medium'
        },
      });

      expect([200, 201]).toContain(response.status());
      const body = await response.json();
      expect(body.success).toBeTruthy();
    });
  });

  test.describe('Subscriptions API', () => {
    test('GET /api/subscriptions should return subscriptions', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/admin/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status()).toBe(200);
    });

    test('GET /api/subscriptions/stats should return stats', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/admin/subscriptions/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.success).toBeTruthy();
    });
  });

  test.describe('User API', () => {
    test('GET /api/user/profile should return user profile', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/user/profile?email=${ADMIN_EMAIL}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.success).toBeTruthy();
      expect(body.data.email).toBe(ADMIN_EMAIL);
    });
  });
});
