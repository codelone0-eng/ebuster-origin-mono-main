import { useState, useEffect } from 'react';
import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  newUsersToday: number;
  totalScripts: number;
  activeScripts: number;
  downloadsToday: number;
  downloadsThisWeek: number;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  systemUptime: string;
  avgResponseTime: string;
  errorRate: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  status: 'active' | 'banned' | 'suspended';
  role: string;
  created_at: string;
  last_login_at?: string;
  avatar_url?: string;
}

interface SystemLog {
  id: number;
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  timestamp: string;
  ip: string;
  user_id?: number;
  user_name?: string;
}

interface BrowserStat {
  name: string;
  percentage: number;
  count: number;
}

interface ActivityStat {
  timeRange: string;
  percentage: number;
  count: number;
}

export const useAdminApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Проверка на бан
        if (response.status === 403 && errorData.banned) {
          // Редирект на страницу бана
          window.location.href = '/ban';
          throw new Error('Ваш аккаунт заблокирован');
        }
        
        throw new Error(errorData.error || 'Ошибка запроса');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Получение статистики системы
  const getSystemStats = async (): Promise<SystemStats> => {
    const response = await fetchWithAuth('/api/admin/stats');
    return response.data;
  };

  // Получение списка пользователей
  const getUsers = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}): Promise<{ users: User[]; pagination: any }> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);

    const response = await fetchWithAuth(`/api/admin/users?${queryParams}`);
    return response.data;
  };

  // Получение деталей пользователя
  const getUserDetails = async (id: string): Promise<User> => {
    const response = await fetchWithAuth(`/api/admin/users/${id}`);
    return response.data;
  };

  // Обновление статуса пользователя
  const updateUserStatus = async (id: string, status: string, reason?: string): Promise<User> => {
    const response = await fetchWithAuth(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason })
    });
    return response.data;
  };

  // Бан пользователя с полными параметрами
  const banUser = async (id: string, banData: {
    reason: string;
    banType: 'temporary' | 'permanent';
    duration?: number;
    durationUnit?: 'hours' | 'days' | 'months';
    contactEmail?: string;
  }): Promise<User> => {
    const response = await fetchWithAuth(`/api/admin/users/${id}/ban`, {
      method: 'POST',
      body: JSON.stringify(banData)
    });
    return response.data;
  };

  // Получение логов системы
  const getSystemLogs = async (params: {
    page?: number;
    limit?: number;
    level?: string;
    search?: string;
  } = {}): Promise<{ logs: SystemLog[]; pagination: any }> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.level) queryParams.append('level', params.level);
    if (params.search) queryParams.append('search', params.search);

    const response = await fetchWithAuth(`/api/admin/logs?${queryParams}`);
    return response.data;
  };

  // Получение статистики браузеров
  const getBrowserStats = async (): Promise<BrowserStat[]> => {
    const response = await fetchWithAuth('/api/admin/browser-stats');
    return response.data;
  };

  // Получение статистики активности
  const getActivityStats = async (): Promise<ActivityStat[]> => {
    const response = await fetchWithAuth('/api/admin/activity-stats');
    return response.data;
  };

  // Получение мониторинга системы
  const getSystemMonitor = async () => {
    const response = await fetchWithAuth('/api/admin/system-monitor');
    return response.data;
  };

  return {
    loading,
    error,
    getSystemStats,
    getUsers,
    getUserDetails,
    updateUserStatus,
    banUser,
    getSystemLogs,
    getBrowserStats,
    getActivityStats,
    getSystemMonitor
  };
};
