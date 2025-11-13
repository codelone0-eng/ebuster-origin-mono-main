interface EmailTemplate {
  subject: string;
  html: string;
}

// Базовый шаблон (встроенный)
const getBaseTemplate = (): string => {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background-color: #0a0a0a; color: #e5e5e5; line-height: 1.6; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(to bottom, #111111, #0a0a0a); border: 1px solid #262626; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); padding: 40px 30px; text-align: center; border-bottom: 1px solid #262626; }
        .logo { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .logo-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #ffffff 0%, #a3a3a3 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; color: #0a0a0a; box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1); }
        .logo-text { font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
        .header-subtitle { color: #a3a3a3; font-size: 14px; margin-top: 8px; }
        .content { padding: 40px 30px; }
        .content h1 { font-size: 24px; font-weight: 700; color: #ffffff; margin-bottom: 20px; line-height: 1.3; }
        .content p { color: #d4d4d4; font-size: 15px; margin-bottom: 16px; }
        .code-box { background: #1a1a1a; border: 1px solid #262626; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center; }
        .code { font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace; }
        .info-box { background: #1a1a1a; border: 1px solid #262626; border-left: 3px solid #ffffff; border-radius: 6px; padding: 16px; margin: 20px 0; }
        .info-box p { margin: 0; font-size: 14px; color: #a3a3a3; }
        .footer { background: #0f0f0f; border-top: 1px solid #262626; padding: 30px; text-align: center; }
        .footer p { color: #737373; font-size: 13px; margin-bottom: 12px; }
        .footer a { color: #a3a3a3; text-decoration: none; margin: 0 8px; font-size: 13px; }
        .divider { height: 1px; background: #262626; margin: 24px 0; }
        @media only screen and (max-width: 600px) {
            body { padding: 10px; }
            .header, .content, .footer { padding: 24px 20px; }
            .logo-text { font-size: 24px; }
            .content h1 { font-size: 20px; }
            .code { font-size: 24px; letter-spacing: 4px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <div class="logo-icon">E</div>
                <div class="logo-text">EBUSTER</div>
            </div>
            <p class="header-subtitle">Автоматизация браузера</p>
        </div>
        <div class="content">
            {{CONTENT}}
        </div>
        <div class="footer">
            <p>© 2024 EBUSTER. Все права защищены.</p>
            <div>
                <a href="https://ebuster.ru">Главная</a>
                <a href="https://ebuster.ru/docs">Документация</a>
                <a href="https://ebuster.ru/support">Поддержка</a>
            </div>
            <div class="divider"></div>
            <p style="font-size: 12px;">Это автоматическое письмо. Пожалуйста, не отвечайте на него.</p>
        </div>
    </div>
</body>
</html>`;
};

// Заменяем переменные в шаблоне
const replaceVariables = (template: string, variables: Record<string, string>): string => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
};

// Генерируем email для подтверждения регистрации
export const generateEmailConfirmation = (otpCode: string): EmailTemplate => {
  const baseTemplate = getBaseTemplate();
  
  const content = `
    <h1>Подтвердите ваш email</h1>
    <p>Здравствуйте!</p>
    <p>Спасибо за регистрацию в EBUSTER. Для завершения регистрации, пожалуйста, подтвердите ваш email адрес, введя код ниже:</p>
    <div class="code-box">
        <div class="code">${otpCode}</div>
    </div>
    <div class="info-box">
        <p><strong>Важно:</strong> Код действителен в течение 10 минут. Если вы не регистрировались на EBUSTER, просто проигнорируйте это письмо.</p>
    </div>
    <p>После подтверждения email вы получите полный доступ ко всем функциям платформы.</p>
    <p>С уважением,<br>Команда EBUSTER</p>
  `;
  
  const html = replaceVariables(baseTemplate, {
    TITLE: 'Подтверждение email - EBUSTER',
    CONTENT: content
  });
  
  return {
    subject: 'Подтвердите ваш email - EBUSTER',
    html
  };
};

// Генерируем email для сброса пароля
export const generatePasswordReset = (otpCode: string): EmailTemplate => {
  const baseTemplate = getBaseTemplate();
  
  const content = `
    <h1>Сброс пароля</h1>
    <p>Здравствуйте!</p>
    <p>Мы получили запрос на сброс пароля для вашего аккаунта EBUSTER. Используйте код ниже для сброса пароля:</p>
    <div class="code-box">
        <div class="code">${otpCode}</div>
    </div>
    <div class="info-box">
        <p><strong>Важно:</strong> Код действителен в течение 10 минут. Если вы не запрашивали сброс пароля, немедленно свяжитесь с нашей службой поддержки.</p>
    </div>
    <p>После ввода кода вы сможете установить новый пароль для вашего аккаунта.</p>
    <p>С уважением,<br>Команда EBUSTER</p>
  `;
  
  const html = replaceVariables(baseTemplate, {
    TITLE: 'Сброс пароля - EBUSTER',
    CONTENT: content
  });
  
  return {
    subject: 'Сброс пароля - EBUSTER',
    html
  };
};

// Генерируем email для смены пароля
export const generatePasswordChange = (otpCode: string): EmailTemplate => {
  const baseTemplate = getBaseTemplate();
  
  const content = `
    <h1>Смена пароля</h1>
    <p>Здравствуйте!</p>
    <p>Мы получили запрос на смену пароля для вашего аккаунта EBUSTER. Используйте код ниже для подтверждения смены пароля:</p>
    <div class="code-box">
        <div class="code">${otpCode}</div>
    </div>
    <div class="info-box">
        <p><strong>Важно:</strong> Код действителен в течение 10 минут. Если вы не запрашивали смену пароля, немедленно свяжитесь с нашей службой поддержки.</p>
    </div>
    <p>После ввода кода вы сможете установить новый пароль для вашего аккаунта.</p>
    <p>С уважением,<br>Команда EBUSTER</p>
  `;
  
  const html = replaceVariables(baseTemplate, {
    TITLE: 'Смена пароля - EBUSTER',
    CONTENT: content
  });
  
  return {
    subject: 'Смена пароля - EBUSTER',
    html
  };
};

// Генерируем email для смены email
export const generateEmailChange = (otpCode: string, newEmail: string): EmailTemplate => {
  const baseTemplate = getBaseTemplate();
  
  const content = `
    <h1>Смена email адреса</h1>
    <p>Здравствуйте!</p>
    <p>Мы получили запрос на смену email адреса для вашего аккаунта EBUSTER на <strong>${newEmail}</strong>.</p>
    <p>Используйте код ниже для подтверждения смены email:</p>
    <div class="code-box">
        <div class="code">${otpCode}</div>
    </div>
    <div class="info-box">
        <p><strong>Важно:</strong> Код действителен в течение 10 минут. Если вы не запрашивали смену email, немедленно свяжитесь с нашей службой поддержки.</p>
    </div>
    <p>После ввода кода ваш email будет изменён на новый.</p>
    <p>С уважением,<br>Команда EBUSTER</p>
  `;
  
  const html = replaceVariables(baseTemplate, {
    TITLE: 'Смена email - EBUSTER',
    CONTENT: content
  });
  
  return {
    subject: 'Смена email адреса - EBUSTER',
    html
  };
};
