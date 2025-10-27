import { Router } from 'express';
import { authenticateUser } from './auth.middleware';
import {
  createScriptVersion,
  getScriptVersions,
  rollbackToVersion,
  publishScriptUpdate,
  getUserScriptUpdates,
  getVersionChangelog
} from './script-versions.controller';

const router = Router();

// Версии скриптов (требуют аутентификацию)
router.post('/:scriptId/versions', authenticateUser, createScriptVersion);
router.get('/:scriptId/versions', getScriptVersions);
router.get('/:scriptId/versions/:version/changelog', getVersionChangelog);
router.post('/:scriptId/versions/:versionId/rollback', authenticateUser, rollbackToVersion);
router.post('/:scriptId/publish', authenticateUser, publishScriptUpdate);

// Обновления для пользователя
router.get('/user/updates', authenticateUser, getUserScriptUpdates);

export default router;
