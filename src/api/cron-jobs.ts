import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';

// Функция автоматической разблокировки (вызывается напрямую, без HTTP)
const autoUnbanUsers = async () => {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('❌ [CRON] Supabase credentials not configured');
      return { success: false, unbannedCount: 0 };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false }
    });

    // Получаем все активные баны с истекшим сроком
    const { data: expiredBans, error: fetchError } = await supabase
      .from('user_bans')
      .select('user_id, id')
      .eq('is_active', true)
      .not('expires_at', 'is', null)
      .lte('expires_at', new Date().toISOString());

    if (fetchError) {
      console.error('❌ [CRON] Ошибка получения банов:', fetchError);
      return { success: false, unbannedCount: 0 };
    }

    if (!expiredBans || expiredBans.length === 0) {
      return { success: true, unbannedCount: 0 };
    }

    // Деактивируем баны
    const { error: updateBansError } = await supabase
      .from('user_bans')
      .update({ is_active: false, unbanned_at: new Date().toISOString() })
      .in('id', expiredBans.map(b => b.id));

    if (updateBansError) {
      console.error('❌ [CRON] Ошибка деактивации банов:', updateBansError);
      return { success: false, unbannedCount: 0 };
    }

    // Обновляем статус пользователей
    const userIds = expiredBans.map(b => b.user_id);
    const { error: updateUsersError } = await supabase
      .from('users')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .in('id', userIds);

    if (updateUsersError) {
      console.error('❌ [CRON] Ошибка обновления пользователей:', updateUsersError);
      return { success: false, unbannedCount: 0 };
    }

    return { success: true, unbannedCount: expiredBans.length };
  } catch (error) {
    console.error('❌ [CRON] Критическая ошибка:', error);
    return { success: false, unbannedCount: 0 };
  }
};

// Запускаем автоматическую разблокировку каждые 5 минут
export const startAutoUnbanCron = () => {
  // Каждые 5 минут
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('🔄 [CRON] Запуск автоматической разблокировки пользователей...');
      
      const result = await autoUnbanUsers();
      
      if (result.success) {
        console.log(`✅ [CRON] Автоматическая разблокировка завершена. Разблокировано: ${result.unbannedCount}`);
      } else {
        console.error('❌ [CRON] Ошибка автоматической разблокировки');
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
      
      const result = await autoUnbanUsers();
      
      if (result.success) {
        console.log(`✅ [CRON] Очистка завершена. Обработано: ${result.unbannedCount}`);
      } else {
        console.error('❌ [CRON] Ошибка очистки');
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
