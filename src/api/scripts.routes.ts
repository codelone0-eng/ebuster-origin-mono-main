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
  deleteScriptRating
} from './scripts.controller';
import { optionalAuthenticateUser } from './auth.middleware';

const router = express.Router();

// Публичные маршруты (с опциональной авторизацией)
router.get('/public', optionalAuthenticateUser, getScripts); // Получение опубликованных скриптов
router.get('/public/:id', optionalAuthenticateUser, getScriptById); // Получение скрипта по ID
router.post('/public/:id/download', optionalAuthenticateUser, downloadScript); // Загрузка скрипта
router.post('/public/:id/rate', optionalAuthenticateUser, rateScript); // Оценка скрипта
router.get('/public/:id/ratings', optionalAuthenticateUser, getScriptRatings); // Получение оценок скрипта
router.delete('/public/:id/rating', optionalAuthenticateUser, deleteScriptRating); // Удаление оценки скрипта

// Админские маршруты (требуют авторизации)
router.get('/admin/stats', getScriptStats); // Статистика скриптов
router.get('/admin', getScripts); // Получение всех скриптов (включая черновики)
router.get('/admin/:id', getScriptById); // Получение скрипта по ID
router.post('/admin', createScript); // Создание нового скрипта
router.put('/admin/:id', updateScript); // Обновление скрипта
router.delete('/admin/:id', deleteScript); // Удаление скрипта

export default router;
