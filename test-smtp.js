#!/usr/bin/env node

/**
 * Скрипт для тестирования SMTP подключения
 * Запуск: node test-smtp.js
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// Конфигурация SMTP из .env
const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.timeweb.ru',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER || 'techsupport@ebuster.ru',
    pass: process.env.SMTP_PASS
  }
};

console.log('🔍 Проверка SMTP конфигурации...\n');
console.log('📧 SMTP Host:', smtpConfig.host);
console.log('🔌 SMTP Port:', smtpConfig.port);
console.log('🔐 SMTP User:', smtpConfig.auth.user);
console.log('🔒 SMTP Secure:', smtpConfig.secure);
console.log('');

// Создаем transporter
const transporter = nodemailer.createTransport({
  host: smtpConfig.host,
  port: smtpConfig.port,
  secure: smtpConfig.secure,
  auth: smtpConfig.auth,
  debug: true, // Включаем отладку
  logger: true // Включаем логирование
});

async function testSMTP() {
  try {
    console.log('🔄 Проверка подключения к SMTP серверу...\n');
    
    // Проверяем подключение
    await transporter.verify();
    console.log('\n✅ SMTP подключение успешно!\n');
    
    // Отправляем тестовое письмо
    const testEmail = process.argv[2] || smtpConfig.auth.user;
    console.log(`📨 Отправка тестового письма на: ${testEmail}\n`);
    
    const info = await transporter.sendMail({
      from: `"EBUSTER Test" <${smtpConfig.auth.user}>`,
      to: testEmail,
      subject: 'Тест SMTP - EBUSTER',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333;">✅ SMTP работает корректно!</h2>
            <p>Это тестовое письмо от EBUSTER.</p>
            <p><strong>Время отправки:</strong> ${new Date().toLocaleString('ru-RU')}</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              Если вы получили это письмо, значит SMTP настроен правильно.
            </p>
          </div>
        </div>
      `
    });
    
    console.log('\n✅ Тестовое письмо отправлено успешно!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📊 Response:', info.response);
    console.log('\n🎉 Все проверки пройдены успешно!\n');
    
  } catch (error) {
    console.error('\n❌ ОШИБКА SMTP:\n');
    console.error('Тип ошибки:', error.name);
    console.error('Сообщение:', error.message);
    
    if (error.code) {
      console.error('Код ошибки:', error.code);
    }
    
    if (error.command) {
      console.error('Команда:', error.command);
    }
    
    console.error('\n📋 Полная информация об ошибке:');
    console.error(error);
    
    console.error('\n💡 Возможные решения:');
    console.error('1. Проверьте правильность SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS в .env');
    console.error('2. Убедитесь, что порт 465 (SSL) или 2525 (STARTTLS) открыт');
    console.error('3. Проверьте, что пароль SMTP актуален');
    console.error('4. Попробуйте альтернативный порт (2525 вместо 465)');
    console.error('5. Проверьте логи на сервере: docker compose logs api\n');
    
    process.exit(1);
  }
}

// Запускаем тест
testSMTP();
