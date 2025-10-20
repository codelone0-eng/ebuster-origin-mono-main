import { Router } from 'express';
import {
  sendEmail,
  sendConfirmationEmail,
  sendPasswordResetEmail,
  sendEmailChangeConfirmation,
  checkSMTPStatus,
  checkSMTPConnection
} from '../api/email.controller';

const router = Router();

// Проверка статуса SMTP (без middleware проверки)
router.get('/status', checkSMTPStatus);

// Все остальные роуты требуют проверки SMTP подключения
router.use(checkSMTPConnection);

// Отправка email (универсальный endpoint)
router.post('/send', sendEmail);

// Специализированные endpoints
router.post('/confirm-signup', sendConfirmationEmail);
router.post('/reset-password', sendPasswordResetEmail);
router.post('/change-email', sendEmailChangeConfirmation);

export default router;
