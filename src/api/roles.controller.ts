import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { permissionsService } from '../services/permissions.service';

const getSupabaseClient = () => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });
};

// Получить все роли
export const getRoles = async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient();

    const { data: roles, error } = await supabase
      .from('roles')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching roles:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch roles'
      });
    }

    res.json({
      success: true,
      data: roles || []
    });
  } catch (error) {
    console.error('Error in getRoles:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Получить роль по ID
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    const { data: role, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Error in getRoleById:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Создать роль (только админ)
export const createRole = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    // Проверяем права админа
    const isAdmin = await permissionsService.isAdmin(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const {
      name,
      display_name,
      description,
      price_monthly,
      price_yearly,
      features,
      limits,
      is_active,
      display_order
    } = req.body;

    // Валидация
    if (!name || !display_name || !features || !limits) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const supabase = getSupabaseClient();

    const { data: role, error } = await supabase
      .from('roles')
      .insert({
        name,
        display_name,
        description,
        price_monthly: price_monthly || 0,
        price_yearly: price_yearly || 0,
        features,
        limits,
        is_active: is_active !== undefined ? is_active : true,
        display_order: display_order || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating role:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create role'
      });
    }

    res.status(201).json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Error in createRole:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Обновить роль (только админ)
export const updateRole = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    
    // Проверяем права админа
    const isAdmin = await permissionsService.isAdmin(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const {
      name,
      display_name,
      description,
      price_monthly,
      price_yearly,
      features,
      limits,
      is_active,
      display_order
    } = req.body;

    const supabase = getSupabaseClient();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (display_name !== undefined) updateData.display_name = display_name;
    if (description !== undefined) updateData.description = description;
    if (price_monthly !== undefined) updateData.price_monthly = price_monthly;
    if (price_yearly !== undefined) updateData.price_yearly = price_yearly;
    if (features !== undefined) updateData.features = features;
    if (limits !== undefined) updateData.limits = limits;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (display_order !== undefined) updateData.display_order = display_order;

    const { data: role, error } = await supabase
      .from('roles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating role:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update role'
      });
    }

    // Очищаем кеш
    permissionsService.clearCache();

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Error in updateRole:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Удалить роль (только админ)
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    
    // Проверяем права админа
    const isAdmin = await permissionsService.isAdmin(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const supabase = getSupabaseClient();

    // Проверяем, что роль не используется
    const { count } = await supabase
      .from('auth_users')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', id);

    if (count && count > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete role that is assigned to users'
      });
    }

    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting role:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete role'
      });
    }

    // Очищаем кеш
    permissionsService.clearCache();

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteRole:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Назначить роль пользователю (только админ)
export const assignRoleToUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { userId: targetUserId, roleId } = req.body;
    
    // Проверяем права админа
    const isAdmin = await permissionsService.isAdmin(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    if (!targetUserId || !roleId) {
      return res.status(400).json({
        success: false,
        error: 'Missing userId or roleId'
      });
    }

    const supabase = getSupabaseClient();

    const { data: user, error } = await supabase
      .from('auth_users')
      .update({ role_id: roleId })
      .eq('id', targetUserId)
      .select()
      .single();

    if (error) {
      console.error('Error assigning role:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to assign role'
      });
    }

    // Очищаем кеш для этого пользователя
    permissionsService.clearCache(targetUserId);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in assignRoleToUser:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
