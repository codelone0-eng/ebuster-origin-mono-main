import type { APIRequestContext } from '@playwright/test';
import { API_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from './env';

export const isAdminEnvConfigured = Boolean(API_URL && ADMIN_EMAIL && ADMIN_PASSWORD);

export interface AdminSession {
  token: string;
  userId: string;
}

export async function loginAsAdmin(request: APIRequestContext): Promise<AdminSession> {
  if (!isAdminEnvConfigured) {
    throw new Error('API_URL, ADMIN_EMAIL или ADMIN_PASSWORD не заданы');
  }

  const response = await request.post(`${API_URL}/api/auth/login`, {
    data: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    },
  });

  if (response.status() !== 200) {
    throw new Error(`Не удалось выполнить вход администратора. Статус: ${response.status()}`);
  }

  const body = await response.json();

  if (!body?.token || !body?.user?.id) {
    throw new Error('В ответе отсутствует токен или идентификатор пользователя');
  }

  return {
    token: body.token,
    userId: body.user.id,
  };
}
