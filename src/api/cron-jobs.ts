import cron from 'node-cron';
import fetch from 'node-fetch';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Запускаем автоматическую разблокировку каждые 5 минут
export const startAutoUnbanCron = () => {
  // Каждые 5 минут
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('🔄 [CRON] Запуск автоматической разблокировки пользователей...');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/auto-unban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ [CRON] Автоматическая разблокировка завершена. Разблокировано: ${data.data.unbannedCount}`);
      } else {
        console.error('❌ [CRON] Ошибка автоматической разблокировки:', data.error);
      }
    } catch (error) {
      console.error('❌ [CRON] Ошибка выполнения cron job:', error);
    }
  });

  console.log('✅ [CRON] Автоматическая разблокировка настроена (каждые 5 минут)');
};

// Запускаем очистку истекших банов каждый день в 00:00
export const startBanCleanupCron = () => {
  // Каждый день в 00:00
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('🧹 [CRON] Запуск очистки истекших банов...');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/auto-unban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ [CRON] Очистка завершена. Обработано: ${data.data.unbannedCount}`);
      } else {
        console.error('❌ [CRON] Ошибка очистки:', data.error);
      }
    } catch (error) {
      console.error('❌ [CRON] Ошибка выполнения cron job:', error);
    }
  });

  console.log('✅ [CRON] Очистка истекших банов настроена (каждый день в 00:00)');
};

// Запускаем все cron jobs
export const startAllCronJobs = () => {
  startAutoUnbanCron();
  startBanCleanupCron();
  console.log('✅ [CRON] Все cron jobs запущены');
};
