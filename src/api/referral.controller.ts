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

type ReferralEntry = {
  id: string;
  entry_type: 'code' | 'use';
  parent_id: string | null;
  referrer_id: string;
  referred_id: string | null;
  code: string | null;
  discount_type: string | null;
  discount_value: number | null;
  is_active: boolean | null;
  max_uses: number | null;
  expires_at: string | null;
  reward_type: string | null;
  reward_value: number | null;
  reward_status: string | null;
  reward_paid: boolean | null;
  subscription_id: string | null;
  status: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string;
  used_at?: string | null;
  referrer?: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
  referred?: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
  subscription?: {
    id: string;
    plan: string;
    status: string;
    expires_at?: string | null;
  } | null;
  uses?: { id: string }[];
};

const normalizeCodeResponse = (row: ReferralEntry, usageCount: number) => ({
  id: row.id,
  code: row.code,
  uses_count: usageCount,
  max_uses: row.max_uses,
  discount_type: row.discount_type,
  discount_value: row.discount_value,
  is_active: row.is_active ?? true,
  expires_at: row.expires_at,
  created_at: row.created_at,
  updated_at: row.updated_at ?? row.created_at
});

const normalizeUseResponse = (row: ReferralEntry) => ({
  id: row.id,
  parent_id: row.parent_id,
  referrer_user_id: row.referrer_id,
  referred_user_id: row.referred_id,
  reward_type: row.reward_type,
  reward_value: row.reward_value,
  reward_status: row.reward_status,
  status: row.status,
  created_at: row.created_at,
  used_at: row.used_at ?? row.created_at,
  referrer: row.referrer
    ? {
        id: row.referrer.id,
        email: row.referrer.email,
        full_name: row.referrer.full_name
      }
    : null,
  referred: row.referred
    ? {
        id: row.referred.id,
        email: row.referred.email,
        full_name: row.referred.full_name
      }
    : null,
  subscription: row.subscription
    ? {
        id: row.subscription.id,
        plan: row.subscription.plan,
        status: row.subscription.status
      }
    : null
});

const buildReferralCodeObject = (row: ReferralEntry & { uses?: { id: string }[] }) =>
  normalizeCodeResponse(row, row.uses?.length ?? 0);

// Создать реферальный код для пользователя в unified referrals table
const createReferralCodeForUser = async (userId: string, supabase: any) => {
  const code = generateRandomCode();
  
  const { data, error } = await supabase
    .from('referrals')
    .insert({
      entry_type: 'code',
      referrer_id: userId,
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

    // Получаем код из unified referrals table
    let { data: codeEntry, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('entry_type', 'code')
      .eq('referrer_id', userId)
      .single();

    // Если код не найден, создаем новый
    if (error && error.code === 'PGRST116') {
      console.log('Реферальный код не найден, создаем новый для пользователя:', userId);
      codeEntry = await createReferralCodeForUser(userId, supabase);
      
      if (!codeEntry) {
        return res.status(500).json({ success: false, error: 'Не удалось создать реферальный код' });
      }
    } else if (error) {
      console.error('Ошибка получения реферального кода:', error);
      return res.status(500).json({ success: false, error: 'Ошибка получения кода' });
    }

    // Подсчитываем использования
    const { count: usesCount } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('entry_type', 'use')
      .eq('parent_id', codeEntry.id);

    const response = normalizeCodeResponse(codeEntry, usesCount || 0);
    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

// Получить статистику рефералов (вычисляется из unified referrals table)
export const getUserReferralStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    // Получаем код пользователя
    const { data: codeEntry } = await supabase
      .from('referrals')
      .select('id')
      .eq('entry_type', 'code')
      .eq('referrer_id', userId)
      .single();

    if (!codeEntry) {
      return res.json({ 
        success: true, 
        data: {
          total_referrals: 0,
          active_referrals: 0,
          total_earnings: 0,
          pending_earnings: 0,
          paid_earnings: 0,
          conversion_rate: 0
        }
      });
    }

    // Получаем все использования
    const { data: uses } = await supabase
      .from('referrals')
      .select('reward_value, reward_status, reward_paid, subscription_id')
      .eq('entry_type', 'use')
      .eq('parent_id', codeEntry.id);

    const totalReferrals = uses?.length || 0;
    const activeReferrals = uses?.filter(u => u.subscription_id).length || 0;
    const paidEarnings = uses?.filter(u => u.reward_paid).reduce((sum, u) => sum + (u.reward_value || 0), 0) || 0;
    const pendingEarnings = uses?.filter(u => !u.reward_paid && u.reward_status === 'pending').reduce((sum, u) => sum + (u.reward_value || 0), 0) || 0;
    const totalEarnings = paidEarnings + pendingEarnings;
    const conversionRate = totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0;

    res.json({ 
      success: true, 
      data: {
        total_referrals: totalReferrals,
        active_referrals: activeReferrals,
        total_earnings: totalEarnings,
        pending_earnings: pendingEarnings,
        paid_earnings: paidEarnings,
        conversion_rate: conversionRate
      }
    });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

// Получить список приглашенных из unified referrals table
export const getUserReferrals = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    // Получаем все использования кода пользователя
    const { data, error } = await supabase
      .from('referrals')
      .select(`
        *,
        referred:users!referrals_referred_id_fkey(id, email, full_name, created_at),
        subscription:subscriptions(id, plan, status, start_date, end_date)
      `)
      .eq('entry_type', 'use')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Ошибка получения рефералов:', error);
      return res.status(500).json({ success: false, error: 'Ошибка получения рефералов' });
    }

    // Нормализуем ответ для обратной совместимости
    const normalized = data?.map(use => ({
      id: use.id,
      created_at: use.created_at,
      referred_user: use.referred,
      subscription: use.subscription,
      reward_value: use.reward_value,
      reward_status: use.reward_status
    })) || [];

    res.json({ success: true, data: normalized });
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

    // Находим реферальный код в unified referrals table
    const { data: referralCode, error: codeError } = await supabase
      .from('referrals')
      .select('*')
      .eq('entry_type', 'code')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (codeError || !referralCode) {
      return res.status(404).json({ success: false, error: 'Код не найден' });
    }

    // Проверяем лимит использований
    if (referralCode.max_uses) {
      const { count: usesCount } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('entry_type', 'use')
        .eq('parent_id', referralCode.id);
      
      if (usesCount && usesCount >= referralCode.max_uses) {
        return res.status(400).json({ success: false, error: 'Лимит использований исчерпан' });
      }
    }

    if (referralCode.expires_at && new Date(referralCode.expires_at) < new Date()) {
      return res.status(400).json({ success: false, error: 'Срок действия истек' });
    }

    if (referralCode.referrer_id === userId) {
      return res.status(400).json({ success: false, error: 'Нельзя использовать свой код' });
    }

    // Создаем запись об использовании
    const { data: referralUse, error: useError } = await supabase
      .from('referrals')
      .insert({
        entry_type: 'use',
        parent_id: referralCode.id,
        referrer_id: referralCode.referrer_id,
        referred_id: userId,
        reward_type: 'commission',
        reward_value: referralCode.discount_value,
        used_at: new Date().toISOString()
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

    // Получаем все реферальные коды из unified referrals table
    let query = supabase
      .from('referrals')
      .select(`
        *,
        user:users!referrals_referrer_id_fkey(id, email, full_name)
      `, { count: 'exact' })
      .eq('entry_type', 'code');

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
      .from('referrals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('entry_type', 'code')
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
      .from('referrals')
      .select(`
        *,
        referrer:users!referrals_referrer_id_fkey(id, email, full_name),
        referred:users!referrals_referred_id_fkey(id, email, full_name),
        subscription:subscriptions(id, plan, status)
      `, { count: 'exact' })
      .eq('entry_type', 'use')
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
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('entry_type', 'code');

    const { count: activeCodes } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('entry_type', 'code')
      .eq('is_active', true);

    const { count: totalUses } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('entry_type', 'use');

    // Получаем топ рефереров (вычисляем из использований)
    const { data: allUses } = await supabase
      .from('referrals')
      .select('referrer_id, reward_value')
      .eq('entry_type', 'use');

    // Группируем по referrer_id
    const referrerStats = allUses?.reduce((acc: any, use: any) => {
      if (!acc[use.referrer_id]) {
        acc[use.referrer_id] = { total_referrals: 0, total_earnings: 0 };
      }
      acc[use.referrer_id].total_referrals++;
      acc[use.referrer_id].total_earnings += use.reward_value || 0;
      return acc;
    }, {}) || {};

    // Получаем информацию о пользователях
    const topReferrerIds = Object.keys(referrerStats)
      .sort((a, b) => referrerStats[b].total_referrals - referrerStats[a].total_referrals)
      .slice(0, 10);

    const { data: topReferrersData } = await supabase
      .from('users')
      .select('id, email, full_name')
      .in('id', topReferrerIds);

    const topReferrers = topReferrersData?.map(user => ({
      user_id: user.id,
      ...referrerStats[user.id],
      user
    })) || [];

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
    const { data: existingCodes } = await supabase
      .from('referrals')
      .select('referrer_id')
      .eq('entry_type', 'code');

    const existingReferrerIds = existingCodes?.map(c => c.referrer_id) || [];

    const { data: users } = await supabase
      .from('users')
      .select('id, email')
      .not('id', 'in', `(${existingReferrerIds.join(',')})`);

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
      entry_type: 'code',
      referrer_id: user.id,
      code: generateRandomCode(),
      discount_type: 'percentage',
      discount_value: 10,
      is_active: true
    }));

    const { error: codesError } = await supabase
      .from('referrals')
      .insert(codes);

    if (codesError) {
      console.error('Ошибка создания кодов:', codesError);
      return res.status(500).json({ success: false, error: 'Ошибка создания кодов' });
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
      .from('referrals')
      .select('id, referrer_id')
      .eq('entry_type', 'code');

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
        .from('referrals')
        .update({ code: newCode, updated_at: new Date().toISOString() })
        .eq('id', codeRecord.id)
        .eq('entry_type', 'code');

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
