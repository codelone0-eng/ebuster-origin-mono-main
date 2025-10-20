import nodemailer from 'nodemailer';
import { smtpConfig, emailSettings, EmailType, EmailData } from '../config/smtp.config';

// Создаем transporter для SMTP
const createTransporter = () => {
  try {
    return nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: smtpConfig.auth,
      // Дополнительные настройки для надежности
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 20000,
      rateLimit: 5
    });
  } catch (error) {
    console.error('Ошибка создания SMTP transporter:', error);
    throw error;
  }
};

// Шаблоны email
const emailTemplates = {
  [EmailType.CONFIRM_SIGNUP]: {
    subject: 'Добро пожаловать в EBUSTER!',
    template: (data: EmailData) => `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Подтверждение регистрации - EBUSTER</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #232323; color: #d9d9d9; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #232323; border: 1px solid #404040; border-radius: 8px; padding: 20px;">
        
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ffffff; margin-bottom: 8px;">EBUSTER</h1>
            <p style="color: #a0a0a0; margin: 0;">Расширение нового поколения</p>
        </div>
        
        <h2 style="color: #ffffff; text-align: center; margin-bottom: 20px;">Добро пожаловать!</h2>
        
        <p style="color: #d9d9d9; text-align: center; margin-bottom: 30px;">
            Подтвердите ваш email для активации аккаунта
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${data.confirmationUrl}" 
               style="display: inline-block; background-color: #606060; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">
                Подтвердить Email
            </a>
        </div>
        
        <div style="background-color: #2a2a2a; border: 1px solid #404040; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="color: #a0a0a0; margin: 0; font-size: 14px;">
                После подтверждения email вы получите полный доступ ко всем функциям EBUSTER.
            </p>
        </div>
        
        <div style="border-top: 1px solid #404040; margin: 20px 0; padding-top: 20px; text-align: center;">
            <p style="color: #808080; font-size: 12px; margin: 0;">
                Если кнопка не работает, обратитесь в поддержку
            </p>
        </div>
        
        <div style="background-color: #1a1a1a; border-top: 1px solid #404040; margin: 20px -20px -20px -20px; padding: 20px; text-align: center;">
            <p style="color: #808080; font-size: 12px; margin: 0;">
                Это письмо отправлено автоматически, не отвечайте на него
            </p>
            <a href="https://ebuster.ru" style="color: #a0a0a0; text-decoration: none; font-size: 12px;">ebuster.ru</a>
        </div>
        
    </div>
</body>
</html>`
  },

  [EmailType.RESET_PASSWORD]: {
    subject: 'Восстановление пароля - EBUSTER',
    template: (data: EmailData) => `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Восстановление пароля - EBUSTER</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #232323; color: #d9d9d9; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #232323; border: 1px solid #404040; border-radius: 8px; padding: 20px;">
        
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ffffff; margin-bottom: 8px;">EBUSTER</h1>
            <p style="color: #a0a0a0; margin: 0;">Расширение нового поколения</p>
        </div>
        
        <h2 style="color: #ffffff; text-align: center; margin-bottom: 20px;">Восстановление пароля</h2>
        
        <p style="color: #d9d9d9; text-align: center; margin-bottom: 30px;">
            Кто-то запросил сброс пароля для вашего аккаунта
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${data.confirmationUrl}" 
               style="display: inline-block; background-color: #606060; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">
                Сбросить пароль
            </a>
        </div>
        
        <div style="background-color: #2a2a2a; border: 1px solid #404040; border-radius: 8px; padding: 12px; margin: 20px 0; text-align: center;">
            <p style="color: #a0a0a0; margin: 0; font-size: 13px;">
                Ссылка действительна в течение 1 часа
            </p>
        </div>
        
        <div style="background-color: #2a2a2a; border: 1px solid #404040; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="color: #a0a0a0; margin: 0; font-size: 14px;">
                Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.
            </p>
        </div>
        
        <div style="border-top: 1px solid #404040; margin: 20px 0; padding-top: 20px; text-align: center;">
            <p style="color: #808080; font-size: 12px; margin: 0;">
                Если кнопка не работает, обратитесь в поддержку
            </p>
        </div>
        
        <div style="background-color: #1a1a1a; border-top: 1px solid #404040; margin: 20px -20px -20px -20px; padding: 20px; text-align: center;">
            <p style="color: #808080; font-size: 12px; margin: 0;">
                Это письмо отправлено автоматически, не отвечайте на него
            </p>
            <a href="https://ebuster.ru" style="color: #a0a0a0; text-decoration: none; font-size: 12px;">ebuster.ru</a>
        </div>
        
    </div>
</body>
</html>`
  },

  [EmailType.CHANGE_EMAIL]: {
    subject: 'Подтверждение смены email - EBUSTER',
    template: (data: EmailData) => `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Подтверждение смены email - EBUSTER</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #232323; color: #d9d9d9; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #232323; border: 1px solid #404040; border-radius: 8px; padding: 20px;">
        
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ffffff; margin-bottom: 8px;">EBUSTER</h1>
            <p style="color: #a0a0a0; margin: 0;">Расширение нового поколения</p>
        </div>
        
        <h2 style="color: #ffffff; text-align: center; margin-bottom: 20px;">Подтверждение смены email</h2>
        
        <p style="color: #d9d9d9; text-align: center; margin-bottom: 30px;">
            Подтвердите новый email адрес для вашего аккаунта
        </p>
        
        <div style="background-color: #2a2a2a; border: 1px solid #404040; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
            <p style="color: #a0a0a0; margin: 0 0 8px 0; font-size: 14px;">Новый email адрес:</p>
            <p style="color: #ffffff; margin: 0; font-weight: 500;">${data.email}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${data.confirmationUrl}" 
               style="display: inline-block; background-color: #606060; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">
                Подтвердить новый email
            </a>
        </div>
        
        <div style="background-color: #2a2a2a; border: 1px solid #404040; border-radius: 8px; padding: 12px; margin: 20px 0; text-align: center;">
            <p style="color: #a0a0a0; margin: 0; font-size: 13px;">
                Ссылка действительна в течение 1 часа
            </p>
        </div>
        
        <div style="background-color: #2a2a2a; border: 1px solid #404040; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="color: #a0a0a0; margin: 0; font-size: 14px;">
                После подтверждения нового email адреса, он станет основным для вашего аккаунта EBUSTER.
            </p>
        </div>
        
        <div style="border-top: 1px solid #404040; margin: 20px 0; padding-top: 20px; text-align: center;">
            <p style="color: #808080; font-size: 12px; margin: 0;">
                Если кнопка не работает, обратитесь в поддержку
            </p>
        </div>
        
        <div style="background-color: #1a1a1a; border-top: 1px solid #404040; margin: 20px -20px -20px -20px; padding: 20px; text-align: center;">
            <p style="color: #808080; font-size: 12px; margin: 0;">
                Это письмо отправлено автоматически, не отвечайте на него
            </p>
            <a href="https://ebuster.ru" style="color: #a0a0a0; text-decoration: none; font-size: 12px;">ebuster.ru</a>
        </div>
        
    </div>
</body>
</html>`
  }
};

// Основной класс для отправки email
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = createTransporter();
  }

  // Проверка подключения к SMTP
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP подключение успешно');
      return true;
    } catch (error) {
      console.error('❌ Ошибка SMTP подключения:', error);
      return false;
    }
  }

  // Отправка email
  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      const template = emailTemplates[data.type];
      if (!template) {
        throw new Error(`Шаблон для типа ${data.type} не найден`);
      }

      const mailOptions = {
        from: `${emailSettings.from.name} <${emailSettings.from.address}>`,
        to: data.to,
        replyTo: emailSettings.replyTo,
        subject: template.subject,
        html: template.template(data),
        // Дополнительные заголовки для лучшей доставляемости
        headers: {
          'X-Mailer': 'EBUSTER Email Service',
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal'
        }
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email отправлен:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Ошибка отправки email:', error);
      return false;
    }
  }

  // Отправка подтверждения регистрации
  async sendConfirmationEmail(email: string, confirmationUrl: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      type: EmailType.CONFIRM_SIGNUP,
      confirmationUrl
    });
  }

  // Отправка восстановления пароля
  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      type: EmailType.RESET_PASSWORD,
      confirmationUrl: resetUrl
    });
  }

  // Отправка подтверждения смены email
  async sendEmailChangeConfirmation(email: string, newEmail: string, confirmationUrl: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      type: EmailType.CHANGE_EMAIL,
      confirmationUrl,
      email: newEmail
    });
  }
}

// Экспортируем singleton instance
export const emailService = new EmailService();
