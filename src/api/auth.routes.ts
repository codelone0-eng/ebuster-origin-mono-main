import { Router } from 'express';
import {
  registerUser,
  loginUser,
  confirmEmail,
  verifyToken,
  logoutUser,
  resetPassword,
  updatePasswordWithToken,
  listUsersDebug,
  clearUsersDebug,
} from './auth.controller';

const router = Router();

// Регистрация
router.post('/register', registerUser);

// Авторизация
router.post('/login', loginUser);

// Подтверждение email
router.get('/confirm-email', confirmEmail);

// Проверка токена
router.get('/verify', verifyToken);

// Выход
router.post('/logout', logoutUser);

// Восстановление пароля
router.post('/reset-password', resetPassword);

// Обновление пароля по токену
router.post('/update-password', updatePasswordWithToken);

export default router;

// DEBUG endpoints (available only in non-production)
if (process.env.NODE_ENV !== 'production') {
  router.get('/__debug/users', listUsersDebug);
  router.post('/__debug/users/clear', clearUsersDebug);
}
