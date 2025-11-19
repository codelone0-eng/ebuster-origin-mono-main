import { createClient } from '@supabase/supabase-js';

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

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  permissions: Record<string, unknown> | null;
  display_order: number | null;
}

interface UserWithRole {
  id: string;
  role_id: string | null;
  status: string | null;
  role?: Role | null;
}

export class PermissionsService {
  private roleCache: Map<string, Role> = new Map();
  private userRoleCache: Map<string, { role: Role | null; timestamp: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 минут

  /**
   * Получить роль пользователя
   */
  async getUserRole(userId: string): Promise<Role | null> {
    try {
      // Проверяем кеш
      const cached = this.userRoleCache.get(userId);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.role;
      }

      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          role_id,
          status,
          role:roles!users_role_id_fkey (
            id,
            name,
            display_name,
            description,
            permissions,
            display_order
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[PermissionsService] Error fetching user role', error);
        return null;
      }

      const user = data as unknown as UserWithRole | null;
      const role = user?.role ?? null;

      this.userRoleCache.set(userId, { role, timestamp: Date.now() });

      return role;
    } catch (error) {
      console.error('Error in getUserRole:', error);
      return null;
    }
  }

  /**
   * Проверить наличие возможности (feature)
   */
  async checkFeature(userId: string, featurePath: string): Promise<boolean> {
    try {
      const role = await this.getUserRole(userId);
      if (!role) return false;

      if (!role.permissions) {
        return false;
      }

      const keys = featurePath.split('.');
      let value: unknown = role.permissions;

      for (const key of keys) {
        if (value && typeof value === 'object' && key in (value as Record<string, unknown>)) {
          value = (value as Record<string, unknown>)[key];
        } else {
          return false;
        }
      }

      return value === true;
    } catch (error) {
      console.error('Error checking feature:', error);
      return false;
    }
  }

  /**
   * Проверить лимит
   */
  async checkLimit(userId: string, limitKey: string, currentValue: number): Promise<{ allowed: boolean; limit: number; remaining: number }> {
    try {
      const role = await this.getUserRole(userId);
      if (!role || !role.permissions) {
        return { allowed: false, limit: 0, remaining: 0 };
      }

      const limits = (role.permissions as Record<string, unknown>)?.limits;
      if (!limits || typeof limits !== 'object') {
        return { allowed: false, limit: 0, remaining: 0 };
      }

      const limitValue = (limits as Record<string, unknown>)[limitKey];
      if (limitValue === undefined || limitValue === null) {
        return { allowed: false, limit: 0, remaining: 0 };
      }

      if (limitValue === -1) {
        return { allowed: true, limit: -1, remaining: -1 };
      }

      const limit = Number(limitValue) || 0;
      const remaining = Math.max(0, limit - currentValue);
      const allowed = currentValue < limit;

      return { allowed, limit, remaining };
    } catch (error) {
      console.error('Error checking limit:', error);
      return { allowed: false, limit: 0, remaining: 0 };
    }
  }

  /**
   * Получить все возможности пользователя
   */
  async getUserFeatures(userId: string): Promise<any> {
    try {
      const role = await this.getUserRole(userId);
      return (role?.permissions as Record<string, unknown>)?.features || {};
    } catch (error) {
      console.error('Error getting user features:', error);
      return {};
    }
  }

  /**
   * Получить все лимиты пользователя
   */
  async getUserLimits(userId: string): Promise<any> {
    try {
      const role = await this.getUserRole(userId);
      const permissions = role?.permissions as Record<string, unknown> | undefined;
      return permissions?.limits || {};
    } catch (error) {
      console.error('Error getting user limits:', error);
      return {};
    }
  }

  /**
   * Проверить активность подписки
   */
  async checkSubscriptionActive(userId: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('end_date')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (error || !subscription) {
        return false;
      }

      if (subscription.end_date) {
        const endDate = new Date(subscription.end_date);
        if (Number.isNaN(endDate.getTime()) || endDate < new Date()) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  /**
   * Выдать кастомное право пользователю
   */
  async grantPermission(
    userId: string,
    permissionKey: string,
    permissionValue: any,
    grantedBy: string,
    expiresAt?: Date
  ): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('user_permissions')
        .insert({
          user_id: userId,
          permission_key: permissionKey,
          permission_value: permissionValue,
          granted_by: grantedBy,
          expires_at: expiresAt?.toISOString()
        });

      if (error) {
        console.error('Error granting permission:', error);
        return false;
      }

      // Сбрасываем кеш для этого пользователя
      this.userRoleCache.delete(userId);

      return true;
    } catch (error) {
      console.error('Error in grantPermission:', error);
      return false;
    }
  }

  /**
   * Отозвать кастомное право
   */
  async revokePermission(userId: string, permissionKey: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('permission_key', permissionKey);

      if (error) {
        console.error('Error revoking permission:', error);
        return false;
      }

      // Сбрасываем кеш
      this.userRoleCache.delete(userId);

      return true;
    } catch (error) {
      console.error('Error in revokePermission:', error);
      return false;
    }
  }

  /**
   * Получить кастомные права пользователя
   */
  async getUserCustomPermissions(userId: string): Promise<any[]> {
    try {
      const supabase = getSupabaseClient();

      const { data: permissions, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

      if (error) {
        console.error('Error fetching custom permissions:', error);
        return [];
      }

      return permissions || [];
    } catch (error) {
      console.error('Error in getUserCustomPermissions:', error);
      return [];
    }
  }

  /**
   * Проверить является ли пользователь админом
   */
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const role = await this.getUserRole(userId);
      return role?.name === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Очистить кеш
   */
  clearCache(userId?: string) {
    if (userId) {
      this.userRoleCache.delete(userId);
    } else {
      this.userRoleCache.clear();
      this.roleCache.clear();
    }
  }
}

export const permissionsService = new PermissionsService();
