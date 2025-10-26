import { Router } from 'express';
import { extensionLoginPage, extensionLogin, saveAuthCode, exchangeCode } from './extension-auth.controller';

const router = Router();

// Страница авторизации для расширения
router.get('/auth/extension-login', extensionLoginPage);

// API endpoint для авторизации расширения (deprecated)
router.post('/auth/extension-login', extensionLogin);

// Новые endpoints для OAuth flow
router.post('/auth/extension/save-code', saveAuthCode);
router.post('/auth/extension/exchange-code', exchangeCode);

export default router;
