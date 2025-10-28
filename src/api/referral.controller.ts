import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

let supabaseClient: any = null;

const getSupabaseClient = () => {
  if (supabaseClient) return supabaseClient;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn('⚠️ Supabase credentials not configured');
    return null;
  }

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  return supabaseClient;
};

// Генерация случайного реферального кода
const generateRandomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Создать реферальный код для пользователя
const createReferralCodeForUser = async (userId: string, supabase: any) => {
  const code = generateRandomCode();
  
  const { data, error } = await supabase
    .from('referral_codes')
    .insert({
      user_id: userId,
      code: code,
      discount_type: 'percentage',
      discount_value: 10,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    console.error('Ошибка создания реферального кода:', error);
    return null;
  }

  // Создаем статистику
  await supabase
    .from('referral_stats')
    .insert({ user_id: userId });

  return data;
};

// Получить реферальный код пользователя (с автогенерацией если нет)
export const getUserReferralCode = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    // Пытаемся получить существующий код
    let { data, error } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Если код не найден, создаем новый
    if (error && error.code === 'PGRST116') {
      console.log('Реферальный код не найден, создаем новый для пользователя:', userId);
      data = await createReferralCodeForUser(userId, supabase);
      
      if (!data) {
        return res.status(500).json({ success: false, error: 'Не удалось создать реферальный код' });
      }
    } else if (error) {
      console.error('Ошибка получения реферального кода:', error);
      return res.status(500).json({ success: false, error: 'Ошибка получения кода' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

// Получить статистику рефералов
export const getUserReferralStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('referral_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Ошибка получения статистики:', error);
      return res.status(500).json({ success: false, error: 'Ошибка получения статистики' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

// Получить список приглашенных
export const getUserReferrals = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('referral_uses')
      .select(`
        *,
        referred_user:auth_users!referred_user_id(id, email, full_name, created_at),
        subscription:subscriptions(id, plan, status, start_date, end_date)
      `)
      .eq('referrer_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Ошибка получения рефералов:', error);
      return res.status(500).json({ success: false, error: 'Ошибка получения рефералов' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

// Применить реферальный код
export const applyReferralCode = async (req: Request, res: Response) => {
  try {
    const { code, userId } = req.body;
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    const { data: referralCode, error: codeError } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (codeError || !referralCode) {
      return res.status(404).json({ success: false, error: 'Код не найден' });
    }

    if (referralCode.max_uses && referralCode.uses_count >= referralCode.max_uses) {
      return res.status(400).json({ success: false, error: 'Лимит использований исчерпан' });
    }

    if (referralCode.expires_at && new Date(referralCode.expires_at) < new Date()) {
      return res.status(400).json({ success: false, error: 'Срок действия истек' });
    }

    if (referralCode.user_id === userId) {
      return res.status(400).json({ success: false, error: 'Нельзя использовать свой код' });
    }

    const { data: referralUse, error: useError } = await supabase
      .from('referral_uses')
      .insert({
        referral_code_id: referralCode.id,
        referrer_user_id: referralCode.user_id,
        referred_user_id: userId,
        reward_type: 'commission',
        reward_value: referralCode.discount_value
      })
      .select()
      .single();

    if (useError) {
      console.error('Ошибка применения кода:', useError);
      return res.status(500).json({ success: false, error: 'Ошибка применения кода' });
    }

    res.json({
      success: true,
      data: {
        referralUse,
        discount: {
          type: referralCode.discount_type,
          value: referralCode.discount_value
        }
      }
    });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

// ADMIN: Получить все коды
export const getAllReferralCodes = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    let query = supabase
      .from('referral_codes')
      .select(`
        *,
        user:auth_users(id, email, full_name)
      `, { count: 'exact' });

    if (search) {
      query = query.ilike('code', `%${search}%`);
    }

    const offset = (Number(page) - 1) * Number(limit);
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      console.error('Ошибка получения кодов:', error);
      return res.status(500).json({ success: false, error: 'Ошибка получения кодов' });
    }

    res.json({
      success: true,
      data: {
        codes: data,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          totalPages: Math.ceil((count || 0) / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

// ADMIN: Обновить код
export const updateReferralCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('referral_codes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Ошибка обновления:', error);
      return res.status(500).json({ success: false, error: 'Ошибка обновления' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

// ADMIN: Получить все использования
export const getAllReferralUses = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    const offset = (Number(page) - 1) * Number(limit);
    const { data, error, count } = await supabase
      .from('referral_uses')
      .select(`
        *,
        referrer:auth_users!referrer_user_id(id, email, full_name),
        referred:auth_users!referred_user_id(id, email, full_name),
        subscription:subscriptions(id, plan, status)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      console.error('Ошибка получения использований:', error);
      return res.status(500).json({ success: false, error: 'Ошибка получения использований' });
    }

    res.json({
      success: true,
      data: {
        uses: data,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          totalPages: Math.ceil((count || 0) / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

// ADMIN: Получить статистику системы
export const getReferralSystemStats = async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    const { count: totalCodes } = await supabase
      .from('referral_codes')
      .select('*', { count: 'exact', head: true });

    const { count: activeCodes } = await supabase
      .from('referral_codes')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: totalUses } = await supabase
      .from('referral_uses')
      .select('*', { count: 'exact', head: true });

    const { data: topReferrers } = await supabase
      .from('referral_stats')
      .select(`
        *,
        user:auth_users(id, email, full_name)
      `)
      .order('total_referrals', { ascending: false })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalCodes,
        activeCodes,
        totalUses,
        topReferrers
      }
    });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

// ADMIN: Инициализация реферальных кодов для существующих пользователей
export const initializeReferralCodes = async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    // Получаем всех пользователей без реферальных кодов
    const { data: users } = await supabase
      .from('auth_users')
      .select('id, email')
      .not('id', 'in', `(SELECT user_id FROM referral_codes)`);

    if (!users || users.length === 0) {
      return res.json({
        success: true,
        message: 'Все пользователи уже имеют реферальные коды',
        created: 0
      });
    }

    // Функция генерации случайного кода
    const generateRandomCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    // Создаем коды для каждого пользователя
    const codes = users.map(user => ({
      user_id: user.id,
      code: generateRandomCode(),
      discount_type: 'percentage',
      discount_value: 10,
      is_active: true
    }));

    const { error: codesError } = await supabase
      .from('referral_codes')
      .insert(codes);

    if (codesError) {
      console.error('Ошибка создания кодов:', codesError);
      return res.status(500).json({ success: false, error: 'Ошибка создания кодов' });
    }

    // Создаем статистику
    const stats = users.map(user => ({ user_id: user.id }));
    const { error: statsError } = await supabase
      .from('referral_stats')
      .insert(stats);

    if (statsError) {
      console.error('Ошибка создания статистики:', statsError);
    }

    res.json({
      success: true,
      message: `Создано ${users.length} реферальных кодов`,
      created: users.length
    });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

// ADMIN: Перегенерация всех реферальных кодов
export const regenerateAllReferralCodes = async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    // Функция генерации случайного кода
    const generateRandomCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    // Получаем все существующие коды
    const { data: existingCodes, error: fetchError } = await supabase
      .from('referral_codes')
      .select('id, user_id');

    if (fetchError) {
      console.error('Ошибка получения кодов:', fetchError);
      return res.status(500).json({ success: false, error: 'Ошибка получения кодов' });
    }

    if (!existingCodes || existingCodes.length === 0) {
      return res.json({
        success: true,
        message: 'Нет кодов для перегенерации',
        regenerated: 0
      });
    }

    // Обновляем каждый код
    let regenerated = 0;
    for (const codeRecord of existingCodes) {
      const newCode = generateRandomCode();
      
      const { error: updateError } = await supabase
        .from('referral_codes')
        .update({ code: newCode })
        .eq('id', codeRecord.id);

      if (!updateError) {
        regenerated++;
      } else {
        console.error(`Ошибка обновления кода ${codeRecord.id}:`, updateError);
      }
    }

    res.json({
      success: true,
      message: `Перегенерировано ${regenerated} из ${existingCodes.length} кодов`,
      regenerated
    });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};
