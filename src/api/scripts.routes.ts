import express from 'express';
import {
  getScripts,
  getScriptById,
  createScript,
  updateScript,
  deleteScript,
  downloadScript,
  getScriptStats,
  rateScript,
  getScriptRatings,
  deleteScriptRating,
  getUserInstalledScripts,
  installScriptForUser,
  uninstallScriptForUser,
  syncUserScripts,
  checkScriptUpdates
} from './scripts.controller';
import { optionalAuthenticateUser, authenticateUser } from './auth.middleware';

const router = express.Router();

// Публичные маршруты (с опциональной авторизацией)
router.get('/public', optionalAuthenticateUser, getScripts); // Получение опубликованных скриптов
router.get('/public/:id', optionalAuthenticateUser, getScriptById); // Получение скрипта по ID
router.post('/public/:id/download', optionalAuthenticateUser, downloadScript); // Загрузка скрипта
router.post('/public/:id/rate', optionalAuthenticateUser, rateScript); // Оценка скрипта
router.get('/public/:id/ratings', optionalAuthenticateUser, getScriptRatings); // Получение оценок скрипта
router.delete('/public/:id/rating', optionalAuthenticateUser, deleteScriptRating); // Удаление оценки скрипта

// Extension Sync Routes (требуют авторизации)
router.get('/user/installed', authenticateUser, getUserInstalledScripts); // Получить установленные скрипты пользователя
router.post('/user/install/:id', authenticateUser, installScriptForUser); // Установить скрипт для пользователя
router.delete('/user/uninstall/:id', authenticateUser, uninstallScriptForUser); // Удалить скрипт у пользователя
router.post('/user/sync', authenticateUser, syncUserScripts); // Синхронизировать скрипты
router.get('/user/check-updates', authenticateUser, checkScriptUpdates); // Проверить обновления скриптов

// Админские маршруты (требуют авторизации)
router.get('/admin/stats', getScriptStats); // Статистика скриптов
router.get('/admin', getScripts); // Получение всех скриптов (включая черновики)
router.get('/admin/:id', getScriptById); // Получение скрипта по ID
router.post('/admin', createScript); // Создание нового скрипта
router.put('/admin/:id', updateScript); // Обновление скрипта
router.delete('/admin/:id', deleteScript); // Удаление скрипта

export default router;
