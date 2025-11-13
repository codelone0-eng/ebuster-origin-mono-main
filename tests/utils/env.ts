export const BASE_URL = process.env.BASE_URL || 'https://admin.ebuster.ru';
export const LK_BASE_URL = process.env.LK_BASE_URL || 'https://lk.ebuster.ru';
export const API_URL = process.env.API_URL || 'https://api.ebuster.ru';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.warn('[autotest] ADMIN_EMAIL или ADMIN_PASSWORD не заданы в окружении. Тесты, требующие авторизации, будут пропущены.');
}
