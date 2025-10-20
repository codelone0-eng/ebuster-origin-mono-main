import { createClient } from '@supabase/supabase-js';

// Инициализация Supabase клиента для админки
export const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Отсутствуют переменные окружения Supabase');
    console.error('SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.error('SUPABASE_SERVICE_KEY:', supabaseKey ? '✅' : '❌');
    throw new Error('Supabase configuration is missing');
  }

  return createClient(supabaseUrl, supabaseKey);
};

// Ленивая инициализация - клиент создается только при первом вызове
let adminClient: ReturnType<typeof createClient> | null = null;

export const admin = {
  get client() {
    if (!adminClient) {
      adminClient = getSupabaseAdmin();
    }
    return adminClient;
  }
};
