// SMTP конфигурация для Timeweb
export const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.timeweb.ru',
  port: parseInt(process.env.SMTP_PORT || '465'), // SSL порт
  secure: true, // Используем SSL
  auth: {
    user: process.env.SMTP_USER || 'techsupport@ebuster.ru',
    pass: process.env.SMTP_PASS || 'c184pr0pr2'
  },
  // Альтернативные настройки для STARTTLS
  alternative: {
    host: process.env.SMTP_HOST || 'smtp.timeweb.ru',
    port: parseInt(process.env.SMTP_PORT_ALT || '2525'),
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER || 'techsupport@ebuster.ru',
      pass: process.env.SMTP_PASS || 'c184pr0pr2'
    }
  }
};

// Настройки отправителя
export const emailSettings = {
  from: {
    name: process.env.EMAIL_FROM_NAME || 'EBUSTER',
    address: process.env.EMAIL_FROM_ADDRESS || 'techsupport@ebuster.ru'
  },
  replyTo: process.env.EMAIL_REPLY_TO || 'techsupport@ebuster.ru',
  // Базовый URL для ссылок
  baseUrl: process.env.BASE_URL || (process.env.NODE_ENV === 'production' 
    ? 'https://ebuster.ru' 
    : 'http://localhost:8081')
};

// Типы email
export enum EmailType {
  CONFIRM_SIGNUP = 'confirm_signup',
  RESET_PASSWORD = 'reset_password',
  CHANGE_EMAIL = 'change_email',
  INVITE_USER = 'invite_user',
  MAGIC_LINK = 'magic_link'
}

// Интерфейс для данных email
export interface EmailData {
  to: string;
  type: EmailType;
  confirmationUrl?: string;
  email?: string;
  data?: {
    role?: string;
    invited_by?: string;
  };
}
