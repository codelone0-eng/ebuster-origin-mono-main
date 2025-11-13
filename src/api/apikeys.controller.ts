import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

let supabaseClient: any = null;

const getSupabaseClient = () => {
  if (supabaseClient) return supabaseClient;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('⚠️ Supabase credentials not configured');
    return null;
  }

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return supabaseClient;
};

/**
 * Генерация API ключа
 */
function generateApiKey(): string {
  // 24 bytes -> 48 hex chars + prefix keeps key length < 64 characters
  return 'ebk_' + crypto.randomBytes(24).toString('hex');
}

/**
 * Получить все API ключи пользователя
 */
export const getUserApiKeys = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const supabase = getSupabaseClient();
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API keys:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch API keys'
      });
    }

    // Скрываем полный ключ, показываем только последние 8 символов
    const maskedKeys = keys.map(key => ({
      ...key,
      api_key: '***' + key.api_key.slice(-8)
    }));

    res.json({
      success: true,
      data: maskedKeys
    });
  } catch (error) {
    console.error('Error in getUserApiKeys:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Создать новый API ключ
 */
export const createApiKey = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { key_name, permissions, expires_in_days } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    if (!key_name) {
      return res.status(400).json({
        success: false,
        error: 'Key name is required'
      });
    }

    // Проверяем лимит ключей
    const supabase = getSupabaseClient();
    const { count } = await supabase
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (count && count >= 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 active API keys allowed'
      });
    }

    // Генерируем ключ
    const apiKey = generateApiKey();

    // Вычисляем дату истечения
    let expiresAt = null;
    if (expires_in_days && expires_in_days > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expires_in_days);
    }

    // Создаем ключ
    const { data: newKey, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        key_name,
        api_key: apiKey,
        permissions: permissions || ['scripts.read', 'scripts.download'],
        expires_at: expiresAt
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating API key:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create API key'
      });
    }

    res.json({
      success: true,
      data: {
        ...newKey,
        api_key: apiKey // Показываем полный ключ только при создании
      },
      message: 'API key created successfully. Save it now, you won\'t see it again!'
    });
  } catch (error) {
    console.error('Error in createApiKey:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Обновить API ключ
 */
export const updateApiKey = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { key_name, permissions, is_active } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const supabase = getSupabaseClient();
    const updateData: any = {};
    
    if (key_name !== undefined) updateData.key_name = key_name;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: updatedKey, error } = await supabase
      .from('api_keys')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating API key:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update API key'
      });
    }

    res.json({
      success: true,
      data: {
        ...updatedKey,
        api_key: '***' + updatedKey.api_key.slice(-8)
      }
    });
  } catch (error) {
    console.error('Error in updateApiKey:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Удалить API ключ
 */
export const deleteApiKey = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting API key:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete API key'
      });
    }

    res.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteApiKey:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Проверить API ключ (middleware)
 */
export const verifyApiKey = async (req: Request, res: Response, next: any) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key required'
      });
    }

    const supabase = getSupabaseClient();
    const { data: key, error } = await supabase
      .from('api_keys')
      .select('*, users!inner(id, email, role_id, roles!inner(name, features, limits))')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single();

    if (error || !key) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key'
      });
    }

    // Проверяем истечение
    if (key.expires_at && new Date(key.expires_at) < new Date()) {
      return res.status(401).json({
        success: false,
        error: 'API key expired'
      });
    }

    // Обновляем last_used_at
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', key.id);

    // Добавляем пользователя в request
    (req as any).user = key.users;
    (req as any).apiKey = key;

    next();
  } catch (error) {
    console.error('Error in verifyApiKey:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
