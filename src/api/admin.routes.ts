import { Router } from 'express';
import {
  requireAdmin,
  getSystemStats,
  getUsers,
  getUserDetails,
  updateUserStatus,
  getSystemLogs,
  getBrowserStats,
  getActivityStats
} from './admin.controller';
import { getSystemMonitor } from './system-monitor.controller';

const router = Router();

// Все маршруты админки требуют права администратора
router.use(requireAdmin);

// Статистика системы
router.get('/stats', getSystemStats);

// Управление пользователями
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.patch('/users/:id/status', updateUserStatus);

// Логи системы
router.get('/logs', getSystemLogs);

// Статистика браузеров
router.get('/browser-stats', getBrowserStats);

// Статистика активности
router.get('/activity-stats', getActivityStats);

// Мониторинг системы
router.get('/system-monitor', getSystemMonitor);

export default router;
