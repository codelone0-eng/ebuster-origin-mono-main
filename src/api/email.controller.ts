import { Request, Response } from 'express';
import { emailService } from '../services/email.service';
import { EmailType } from '../config/smtp.config';

// Интерфейс для запроса отправки email
interface SendEmailRequest {
  to: string;
  type: EmailType;
  confirmationUrl?: string;
  email?: string;
  data?: {
    role?: string;
    invited_by?: string;
  };
}

// Middleware для проверки SMTP подключения
export const checkSMTPConnection = async (req: Request, res: Response, next: any) => {
  try {
    const isConnected = await emailService.verifyConnection();
    if (!isConnected) {
      return res.status(503).json({
        error: 'SMTP сервер недоступен',
        message: 'Не удается подключиться к серверу отправки email'
      });
    }
    next();
  } catch (error) {
    console.error('Ошибка проверки SMTP:', error);
    return res.status(503).json({
      error: 'Ошибка SMTP подключения',
      message: 'Сервер отправки email временно недоступен'
    });
  }
};

// Отправка email
export const sendEmail = async (req: Request, res: Response) => {
  try {
    const { to, type, confirmationUrl, email, data }: SendEmailRequest = req.body;

    // Валидация
    if (!to || !type) {
      return res.status(400).json({
        error: 'Неверные параметры',
        message: 'Требуются поля: to, type'
      });
    }

    // Проверка email адреса
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        error: 'Неверный email адрес',
        message: 'Укажите корректный email адрес'
      });
    }

    // Отправка email
    const success = await emailService.sendEmail({
      to,
      type,
      confirmationUrl,
      email,
      data
    });

    if (success) {
      res.json({
        success: true,
        message: 'Email успешно отправлен',
        to,
        type
      });
    } else {
      res.status(500).json({
        error: 'Ошибка отправки email',
        message: 'Не удалось отправить email'
      });
    }
  } catch (error) {
    console.error('Ошибка API отправки email:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера',
      message: 'Произошла ошибка при отправке email'
    });
  }
};

// Отправка подтверждения регистрации
export const sendConfirmationEmail = async (req: Request, res: Response) => {
  try {
    const { email, confirmationUrl } = req.body;

    if (!email || !confirmationUrl) {
      return res.status(400).json({
        error: 'Неверные параметры',
        message: 'Требуются поля: email, confirmationUrl'
      });
    }

    const success = await emailService.sendConfirmationEmail(email, confirmationUrl);

    if (success) {
      res.json({
        success: true,
        message: 'Письмо подтверждения отправлено',
        email
      });
    } else {
      res.status(500).json({
        error: 'Ошибка отправки',
        message: 'Не удалось отправить письмо подтверждения'
      });
    }
  } catch (error) {
    console.error('Ошибка отправки подтверждения:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера',
      message: 'Произошла ошибка при отправке письма подтверждения'
    });
  }
};

// Отправка восстановления пароля
export const sendPasswordResetEmail = async (req: Request, res: Response) => {
  try {
    const { email, resetUrl } = req.body;

    if (!email || !resetUrl) {
      return res.status(400).json({
        error: 'Неверные параметры',
        message: 'Требуются поля: email, resetUrl'
      });
    }

    const success = await emailService.sendPasswordResetEmail(email, resetUrl);

    if (success) {
      res.json({
        success: true,
        message: 'Письмо восстановления пароля отправлено',
        email
      });
    } else {
      res.status(500).json({
        error: 'Ошибка отправки',
        message: 'Не удалось отправить письмо восстановления пароля'
      });
    }
  } catch (error) {
    console.error('Ошибка отправки восстановления пароля:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера',
      message: 'Произошла ошибка при отправке письма восстановления пароля'
    });
  }
};

// Отправка подтверждения смены email
export const sendEmailChangeConfirmation = async (req: Request, res: Response) => {
  try {
    const { email, newEmail, confirmationUrl } = req.body;

    if (!email || !newEmail || !confirmationUrl) {
      return res.status(400).json({
        error: 'Неверные параметры',
        message: 'Требуются поля: email, newEmail, confirmationUrl'
      });
    }

    const success = await emailService.sendEmailChangeConfirmation(email, newEmail, confirmationUrl);

    if (success) {
      res.json({
        success: true,
        message: 'Письмо подтверждения смены email отправлено',
        email,
        newEmail
      });
    } else {
      res.status(500).json({
        error: 'Ошибка отправки',
        message: 'Не удалось отправить письмо подтверждения смены email'
      });
    }
  } catch (error) {
    console.error('Ошибка отправки подтверждения смены email:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера',
      message: 'Произошла ошибка при отправке письма подтверждения смены email'
    });
  }
};

// Проверка статуса SMTP
export const checkSMTPStatus = async (req: Request, res: Response) => {
  try {
    const isConnected = await emailService.verifyConnection();
    
    res.json({
      success: true,
      smtpConnected: isConnected,
      message: isConnected ? 'SMTP сервер доступен' : 'SMTP сервер недоступен'
    });
  } catch (error) {
    console.error('Ошибка проверки SMTP статуса:', error);
    res.status(500).json({
      error: 'Ошибка проверки SMTP',
      message: 'Не удалось проверить статус SMTP сервера'
    });
  }
};
