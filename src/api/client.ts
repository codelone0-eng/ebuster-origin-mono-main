// API конфигурация и утилиты
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.ebuster.ru' 
  : 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Аутентификация
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Пользователи
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    CHANGE_EMAIL: '/users/change-email',
    ENABLE_2FA: '/users/2fa/enable',
    DISABLE_2FA: '/users/2fa/disable',
  },
  
  // Скрипты
  SCRIPTS: {
    LIST: '/scripts',
    CREATE: '/scripts',
    UPDATE: '/scripts/:id',
    DELETE: '/scripts/:id',
    INSTALL: '/scripts/:id/install',
    UNINSTALL: '/scripts/:id/uninstall',
    UPDATE_SCRIPT: '/scripts/:id/update',
  },
  
  // Тикеты
  TICKETS: {
    LIST: '/tickets',
    CREATE: '/tickets',
    GET: '/tickets/:id',
    UPDATE: '/tickets/:id',
    REPLY: '/tickets/:id/reply',
    CLOSE: '/tickets/:id/close',
  },
  
  // Админка
  ADMIN: {
    USERS: '/admin/users',
    SCRIPTS: '/admin/scripts',
    TICKETS: '/admin/tickets',
    STATS: '/admin/stats',
    SETTINGS: '/admin/settings',
  }
};

// HTTP клиент
export class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('ebuster_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('ebuster_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('ebuster_token');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Экспорт экземпляра клиента
export const apiClient = new ApiClient();
