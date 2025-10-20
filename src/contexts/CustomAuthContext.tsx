/**
 * Custom Auth Context
 * Context for managing authentication state with our own API
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/config/api';

// Интерфейсы
interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: 'user' | 'admin' | 'moderator';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: Error }>;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: Error }>;
  updatePassword: (password: string) => Promise<{ error?: Error }>;
  updatePasswordWithToken: (token: string, password: string) => Promise<{ error?: Error }>;
}

// API базовый URL
const API_BASE_URL = API_CONFIG.AUTH_URL;

// Утилиты для работы с токенами
const getToken = (): string | null => {
  return localStorage.getItem('jwt_token');
};

const setToken = (token: string): void => {
  localStorage.setItem('jwt_token', token);
};

const saveToken = (token: string): void => {
  localStorage.setItem('jwt_token', token);
};

const removeToken = (): void => {
  localStorage.removeItem('jwt_token');
};

// API функции
const authApi = {
  async register(email: string, password: string, fullName?: string) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, fullName }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка регистрации');
    }

    // После успешной регистрации создаем/обновляем профиль в public.users
    if (data.user) {
      try {
        const upsertData = {
          id: data.user.id,
          email: data.user.email,
          full_name: fullName || data.user.full_name,
        };
        
        console.log('🔍 [CustomAuthContext] Sending upsert data on register:', upsertData);
        console.log('🔍 [CustomAuthContext] Full data.user object:', JSON.stringify(data.user, null, 2));
        
        const upsertResponse = await fetch(`${API_BASE_URL.replace('/auth', '')}/user/upsert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(upsertData),
        });
        
        if (!upsertResponse.ok) {
          console.warn('Failed to upsert user profile:', await upsertResponse.json());
        }
      } catch (upsertError) {
        console.error('Error calling upsert for user profile:', upsertError);
      }
    }

    return data;
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка авторизации');
    }

    // После успешного логина загружаем полный профиль пользователя
    if (data.user) {
      try {
        // Сначала загружаем полный профиль пользователя с аватаром
        const profileResponse = await fetch(`${API_BASE_URL.replace('/auth', '')}/user/profile?email=${encodeURIComponent(data.user.email)}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success && profileData.data) {
            // Обновляем данные пользователя с полным профилем
            data.user = {
              ...data.user,
              full_name: profileData.data.full_name || data.user.full_name,
              avatar_url: profileData.data.avatar_url,
              role: profileData.data.role
            };
            console.log('✅ [CustomAuthContext] Profile loaded with avatar:', profileData.data.avatar_url);
          }
        }

        // Теперь делаем upsert только если нужно обновить данные
        const upsertData = {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.full_name,
          avatar_url: data.user.avatar_url, // Передаем avatar_url чтобы сохранить его
        };
        
        console.log('🔍 [CustomAuthContext] Sending upsert data on login:', upsertData);
        console.log('🔍 [CustomAuthContext] Avatar URL value:', data.user.avatar_url);
        console.log('🔍 [CustomAuthContext] Avatar URL type:', typeof data.user.avatar_url);
        
        const upsertResponse = await fetch(`${API_BASE_URL.replace('/auth', '')}/user/upsert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(upsertData),
        });
        
        if (!upsertResponse.ok) {
          console.warn('Failed to upsert user profile on login:', await upsertResponse.json());
        } else {
          console.log('✅ [CustomAuthContext] Upsert completed successfully');
        }
      } catch (upsertError) {
        console.error('Error calling upsert for user profile on login:', upsertError);
      }
    }

    return data;
  },

  async verifyToken() {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      removeToken();
      return null;
    }

    const data = await response.json();
    
    // Загружаем полный профиль пользователя с аватаром
    if (data.user && data.user.email) {
      try {
        const profileResponse = await fetch(`${API_BASE_URL.replace('/auth', '')}/user/profile?email=${encodeURIComponent(data.user.email)}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success && profileData.data) {
            // Обновляем данные пользователя с полным профилем
            data.user = {
              ...data.user,
              full_name: profileData.data.full_name || data.user.full_name,
              avatar_url: profileData.data.avatar_url,
              role: profileData.data.role
            };
          }
        }
      } catch (profileError) {
        console.error('Error loading user profile:', profileError);
      }
    }
    
    return data.user;
  },

  async logout() {
    const token = getToken();
    if (!token) return;

    await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    removeToken();
  },

  async resetPassword(email: string) {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка сброса пароля');
    }

    return data;
  },

  async updatePassword(password: string) {
    const token = getToken();
    if (!token) throw new Error('Не авторизован');

    const response = await fetch(`${API_BASE_URL}/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка обновления пароля');
    }

    return data;
  },

  async updatePasswordWithToken(token: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка обновления пароля');
    }

    return data;
  }
};

// Переводы уведомлений
const notificationTranslations = {
  auth: {
    registerSuccess: {
      title: 'Регистрация успешна',
      description: 'Проверьте email для подтверждения аккаунта'
    },
    loginSuccess: {
      title: 'Вход выполнен',
      description: 'Добро пожаловать!'
    },
    logoutSuccess: {
      title: 'Выход выполнен',
      description: 'До свидания!'
    },
    emailAlreadyExists: {
      title: 'Email уже существует',
      description: 'Пользователь с таким email уже зарегистрирован'
    },
    invalidCredentials: {
      title: 'Неверные данные',
      description: 'Проверьте email и пароль'
    },
    emailNotConfirmed: {
      title: 'Email не подтвержден',
      description: 'Проверьте почту и подтвердите email'
    },
    resetPasswordSuccess: {
      title: 'Письмо отправлено',
      description: 'Проверьте email для сброса пароля'
    },
    updatePasswordSuccess: {
      title: 'Пароль обновлен',
      description: 'Пароль успешно изменен'
    }
  }
};

// Создание контекста
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Проверка токена при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getToken();
        if (token) {
          setToken(token);
          const userData = await authApi.verifyToken();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      await authApi.register(email, password, fullName);
      
      const translation = notificationTranslations.auth.registerSuccess;
      toast({
        title: translation.title,
        description: translation.description,
        variant: "success"
      });

      return { error: undefined };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка регистрации';
      
      let translation = notificationTranslations.auth.emailAlreadyExists;
      if (errorMessage.includes('уже существует')) {
        translation = notificationTranslations.auth.emailAlreadyExists;
      }

      toast({
        title: translation.title,
        description: translation.description,
        variant: "destructive"
      });

      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      
      saveToken(data.token);
      
      // Дополнительно загружаем полный профиль для гарантии
      try {
        const profileResponse = await fetch(`${API_BASE_URL.replace('/auth', '')}/user/profile?email=${encodeURIComponent(email)}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success && profileData.data) {
            // Используем данные из профиля как приоритетные
            const fullUser = {
              ...data.user,
              full_name: profileData.data.full_name || data.user.full_name,
              avatar_url: profileData.data.avatar_url,
              role: profileData.data.role
            };
            setUser(fullUser);
          } else {
            setUser(data.user);
          }
        } else {
          setUser(data.user);
        }
      } catch (profileError) {
        console.error('Error loading profile in signIn:', profileError);
        setUser(data.user);
      }

      const translation = notificationTranslations.auth.loginSuccess;
      toast({
        title: translation.title,
        description: translation.description,
        variant: "success"
      });

      return { error: undefined };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка авторизации';
      
      let translation = notificationTranslations.auth.invalidCredentials;
      if (errorMessage.includes('не подтвержден')) {
        translation = notificationTranslations.auth.emailNotConfirmed;
      }

      toast({
        title: translation.title,
        description: translation.description,
        variant: "destructive"
      });

      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await authApi.logout();
      setUser(null);
      removeToken();

      const translation = notificationTranslations.auth.logoutSuccess;
      toast({
        title: translation.title,
        description: translation.description,
        variant: "success"
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Даже если ошибка, очищаем локальное состояние
      setUser(null);
      removeToken();
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authApi.resetPassword(email);
      
      const translation = notificationTranslations.auth.resetPasswordSuccess;
      toast({
        title: translation.title,
        description: translation.description,
        variant: "success"
      });

      return { error: undefined };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка сброса пароля';
      
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: "destructive"
      });

      return { error: error as Error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      await authApi.updatePassword(password);
      
      const translation = notificationTranslations.auth.updatePasswordSuccess;
      toast({
        title: translation.title,
        description: translation.description,
        variant: "success"
      });

      return { error: undefined };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка обновления пароля';
      
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: "destructive"
      });

      return { error: error as Error };
    }
  };

  const updatePasswordWithToken = async (token: string, password: string) => {
    try {
      await authApi.updatePasswordWithToken(token, password);
      
      const translation = notificationTranslations.auth.updatePasswordSuccess;
      toast({
        title: translation.title,
        description: translation.description,
        variant: "success"
      });

      return { error: undefined };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка обновления пароля';
      
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: "destructive"
      });

      return { error: error as Error };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updatePasswordWithToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
