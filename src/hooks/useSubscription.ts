import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '@/config/api';

interface Role {
  id: string;
  name: string;
  display_name: string;
  features: any;
  limits: any;
}

interface Subscription {
  id: string;
  user_id: string;
  role_id: string;
  status: string;
  billing_period: string;
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
  roles?: Role;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  role: Role | null;
  loading: boolean;
  error: string | null;
  checkFeature: (featurePath: string) => boolean;
  checkLimit: (limitKey: string, currentValue: number) => { allowed: boolean; limit: number; remaining: number };
  hasRole: (roleName: string) => boolean;
  isAdmin: () => boolean;
  refresh: () => Promise<void>;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('ebuster_token');
      if (!token) {
        // Пользователь не авторизован - назначаем роль free по умолчанию
        setRole({
          id: 'free',
          name: 'free',
          display_name: 'Free',
          features: {
            scripts: { max_count: 5, can_create: true, can_publish: false },
            downloads: { max_per_day: 10 }
          },
          limits: {
            scripts: 5,
            downloads_per_day: 10
          }
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/subscriptions/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();

      if (data.success && data.data) {
        setSubscription(data.data);
        setRole(data.data.roles || null);
      } else {
        // Нет активной подписки - загружаем роль пользователя
        await loadUserRole(token);
      }
    } catch (err) {
      console.error('Error loading subscription:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback на роль free при ошибке
      setRole({
        id: 'free',
        name: 'free',
        display_name: 'Free',
        features: {
          scripts: { max_count: 5, can_create: true, can_publish: false },
          downloads: { max_per_day: 10 }
        },
        limits: {
          scripts: 5,
          downloads_per_day: 10
        }
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserRole = async (token: string) => {
    try {
      // Загружаем роль пользователя из профиля
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.role) {
          setRole(data.data.role);
        }
      }
    } catch (err) {
      console.error('Error loading user role:', err);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  /**
   * Проверить наличие возможности (feature)
   */
  const checkFeature = useCallback((featurePath: string): boolean => {
    if (!role || !role.features) return false;

    const keys = featurePath.split('.');
    let value: any = role.features;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return false;
      }
    }

    return value === true;
  }, [role]);

  /**
   * Проверить лимит
   */
  const checkLimit = useCallback((limitKey: string, currentValue: number): { allowed: boolean; limit: number; remaining: number } => {
    if (!role || !role.limits) {
      return { allowed: false, limit: 0, remaining: 0 };
    }

    const limit = role.limits[limitKey];

    // -1 означает unlimited
    if (limit === -1) {
      return { allowed: true, limit: -1, remaining: -1 };
    }

    const remaining = Math.max(0, limit - currentValue);
    const allowed = currentValue < limit;

    return { allowed, limit, remaining };
  }, [role]);

  /**
   * Проверить наличие роли
   */
  const hasRole = useCallback((roleName: string): boolean => {
    return role?.name === roleName;
  }, [role]);

  /**
   * Проверить является ли пользователь админом
   */
  const isAdmin = useCallback((): boolean => {
    return role?.name === 'admin';
  }, [role]);

  /**
   * Обновить данные подписки
   */
  const refresh = useCallback(async () => {
    await loadSubscription();
  }, [loadSubscription]);

  return {
    subscription,
    role,
    loading,
    error,
    checkFeature,
    checkLimit,
    hasRole,
    isAdmin,
    refresh
  };
};
