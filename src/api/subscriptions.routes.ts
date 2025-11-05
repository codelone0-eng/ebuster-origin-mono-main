import { Router } from 'express';
import {
  getSubscriptions,
  getSubscriptionStats,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  renewSubscription,
  deleteSubscription,
  checkPremiumAccess,
  getMySubscription,
  subscribe,
  cancelMySubscription,
  getMySubscriptionHistory
} from './subscriptions.controller';
import { authenticateUser } from './auth.middleware';

const router = Router();

// Пользовательские роуты (требуют авторизации)
router.get('/my', authenticateUser, getMySubscription); // Моя подписка
router.post('/subscribe', authenticateUser, subscribe); // Оформить подписку
router.post('/cancel', authenticateUser, cancelMySubscription); // Отменить подписку
router.get('/history', authenticateUser, getMySubscriptionHistory); // История подписок

// Проверка доступа
router.get('/check/:user_id', checkPremiumAccess); // Проверить premium доступ

// Админские роуты (требуют авторизации и прав админа)
router.get('/', authenticateUser, getSubscriptions); // Все подписки
router.get('/stats', authenticateUser, getSubscriptionStats); // Статистика
router.post('/', authenticateUser, createSubscription); // Создать подписку
router.put('/:id', authenticateUser, updateSubscription); // Обновить подписку
router.post('/:id/cancel', authenticateUser, cancelSubscription); // Отменить подписку (админ)
router.post('/:id/renew', authenticateUser, renewSubscription); // Продлить подписку
router.delete('/:id', authenticateUser, deleteSubscription); // Удалить подписку

export default router;
