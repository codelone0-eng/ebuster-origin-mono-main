// Клиент для работы с собственным email API
class EmailClient {
  private baseUrl: string;

  constructor() {
    // Проверяем, что мы в браузере
    if (typeof window !== 'undefined') {
      // В браузере используем фиксированные URL
      this.baseUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001/api/email'
        : 'https://ebuster.ru/api/email';
    } else {
      // В Node.js используем переменные окружения
      this.baseUrl = process.env.API_URL || (process.env.NODE_ENV === 'production' 
        ? 'https://ebuster.ru/api/email'
        : 'http://localhost:3001/api/email');
    }
  }

  // Проверка статуса SMTP
  async checkStatus(): Promise<{ success: boolean; smtpConnected: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка проверки SMTP статуса:', error);
      return {
        success: false,
        smtpConnected: false,
        message: 'Ошибка подключения к серверу'
      };
    }
  }

  // Отправка подтверждения регистрации
  async sendConfirmationEmail(email: string, confirmationUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/confirm-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          confirmationUrl
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Письмо подтверждения отправлено:', email);
        return true;
      } else {
        console.error('❌ Ошибка отправки подтверждения:', data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка API отправки подтверждения:', error);
      return false;
    }
  }

  // Отправка восстановления пароля
  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          resetUrl
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Письмо восстановления пароля отправлено:', email);
        return true;
      } else {
        console.error('❌ Ошибка отправки восстановления пароля:', data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка API отправки восстановления пароля:', error);
      return false;
    }
  }

  // Отправка подтверждения смены email
  async sendEmailChangeConfirmation(email: string, newEmail: string, confirmationUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/change-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          newEmail,
          confirmationUrl
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Письмо подтверждения смены email отправлено:', email);
        return true;
      } else {
        console.error('❌ Ошибка отправки подтверждения смены email:', data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка API отправки подтверждения смены email:', error);
      return false;
    }
  }

  // Универсальная отправка email
  async sendEmail(emailData: {
    to: string;
    type: 'confirm_signup' | 'reset_password' | 'change_email' | 'invite_user' | 'magic_link';
    confirmationUrl?: string;
    email?: string;
    data?: {
      role?: string;
      invited_by?: string;
    };
  }): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Email отправлен:', emailData.to);
        return true;
      } else {
        console.error('❌ Ошибка отправки email:', data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка API отправки email:', error);
      return false;
    }
  }
}

// Экспортируем singleton instance
export const emailClient = new EmailClient();
