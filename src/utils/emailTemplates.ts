import fs from 'fs';
import path from 'path';

interface EmailTemplate {
  subject: string;
  html: string;
}

// Загружаем базовый шаблон
const loadBaseTemplate = (): string => {
  const templatePath = path.join(__dirname, '../email-templates/base-template.html');
  return fs.readFileSync(templatePath, 'utf-8');
};

// Загружаем контент шаблона
const loadContentTemplate = (templateName: string): string => {
  const templatePath = path.join(__dirname, `../email-templates/${templateName}.html`);
  return fs.readFileSync(templatePath, 'utf-8');
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
  const baseTemplate = loadBaseTemplate();
  const contentTemplate = loadContentTemplate('email-confirmation');
  
  const content = replaceVariables(contentTemplate, {
    OTP_CODE: otpCode
  });
  
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
  const baseTemplate = loadBaseTemplate();
  const contentTemplate = loadContentTemplate('password-reset');
  
  const content = replaceVariables(contentTemplate, {
    OTP_CODE: otpCode
  });
  
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
  const baseTemplate = loadBaseTemplate();
  
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
  const baseTemplate = loadBaseTemplate();
  
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
