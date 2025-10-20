import { Router } from 'express';
import { extensionLoginPage, extensionLogin } from './extension-auth.controller';

const router = Router();

// Страница авторизации для расширения
router.get('/auth/extension-login', extensionLoginPage);

// API endpoint для авторизации расширения
router.post('/auth/extension-login', extensionLogin);

export default router;
