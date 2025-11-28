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
import {
  adminListScripts,
  adminGetScriptById,
  adminCreateScript,
  adminUpdateScript,
  adminDeleteScript,
  adminPublishScript,
  adminSetScriptStatus,
  adminDuplicateScript,
  adminCreateVersion,
  adminListVersions,
  adminRollbackVersion,
  adminListAuditLogs,
  adminListChecks,
  adminCreateCheck,
  adminUpdateCheck,
  adminListAccessOverrides,
  adminGrantAccess,
  adminRevokeAccess,
  adminUploadScriptIcon,
  adminRemoveScriptIcon
} from './scripts-admin.controller';
import { optionalAuthenticateUser, authenticateUser, requireAdmin } from './auth.middleware';
import multer from 'multer';

const router = express.Router();

// Настройка multer для загрузки файлов иконок скриптов
const uploadIcon = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Проверяем тип файла
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Middleware для обработки ошибок multer
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

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

// Админские маршруты (требуют авторизации и прав администратора)
router.get('/admin/stats', requireAdmin, getScriptStats); // Статистика скриптов
router.get('/admin', requireAdmin, adminListScripts); // Получение всех скриптов (включая черновики)
router.get('/admin/:id', requireAdmin, adminGetScriptById); // Получение скрипта по ID
router.post('/admin', requireAdmin, adminCreateScript); // Создание нового скрипта
router.put('/admin/:id', requireAdmin, adminUpdateScript); // Обновление скрипта
router.delete('/admin/:id', requireAdmin, adminDeleteScript); // Удаление скрипта
router.post('/admin/:id/publish', requireAdmin, adminPublishScript); // Публикация скрипта
router.post('/admin/:id/status', requireAdmin, adminSetScriptStatus); // Изменение статуса
router.post('/admin/:id/duplicate', requireAdmin, adminDuplicateScript); // Дублирование скрипта
router.post('/admin/:id/versions', requireAdmin, adminCreateVersion); // Создание версии
router.get('/admin/:id/versions', requireAdmin, adminListVersions); // Список версий
router.post('/admin/:id/versions/:versionId/rollback', requireAdmin, adminRollbackVersion); // Откат версии
router.get('/admin/:id/audit', requireAdmin, adminListAuditLogs); // Аудит логи
router.get('/admin/:id/checks', requireAdmin, adminListChecks); // Список проверок
router.post('/admin/:id/checks', requireAdmin, adminCreateCheck); // Создание проверки
router.put('/admin/checks/:checkId', requireAdmin, adminUpdateCheck); // Обновление проверки
router.get('/admin/:id/access', requireAdmin, adminListAccessOverrides); // Список доступов
router.post('/admin/:id/access', requireAdmin, adminGrantAccess); // Предоставление доступа
router.delete('/admin/:id/access/:userId', requireAdmin, adminRevokeAccess); // Отзыв доступа
router.post('/admin/upload-icon', requireAdmin, uploadIcon.single('icon'), handleMulterError, adminUploadScriptIcon); // Загрузка иконки скрипта
router.post('/admin/remove-icon', requireAdmin, adminRemoveScriptIcon); // Удаление иконки скрипта

export default router;
