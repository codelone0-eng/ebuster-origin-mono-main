/**
 * Supabase Auth Context
 * Context for managing authentication state with Supabase
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { typedSupabase, typedSupabaseAdmin } from '@/lib/supabase';
import { usersApi } from '@/lib/supabase-api';
import { useToast } from '@/hooks/use-toast';
import { getSupabaseErrorTranslation, notificationTranslations } from '@/lib/notification-translations';
import { emailClient } from '@/lib/email-client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: any) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await typedSupabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user);
        }
      }
      setLoading(false);
      setIsInitialized(true);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = typedSupabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only process events after initialization
        if (!isInitialized) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Prevent multiple simultaneous state updates
        if (event === 'SIGNED_IN' && user?.id === session?.user?.id) {
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [isInitialized]);

  const loadUserProfile = async (user: User) => {
    if (profileLoading) return; // Prevent multiple simultaneous calls
    
    setProfileLoading(true);
    try {
      const { data, error } = await usersApi.getCurrentUserProfile();
      if (error) {
        console.error('Error loading user profile:', error);
        // Don't set profile to null on error, keep existing profile
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Don't set profile to null on error, keep existing profile
    } finally {
      setProfileLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      // Проверяем уникальность email через Supabase Auth API
      const { data: existingUsers } = await typedSupabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers.users.find(user => user.email === email);
      
      if (existingUser) {
        const translation = notificationTranslations.auth.emailAlreadyExists;
        toast({
          title: translation.title,
          description: translation.description,
          variant: "destructive"
        });
        return { error: new Error("Email already exists") };
      }

      // Создаем пользователя в Supabase БЕЗ отправки email
      const { data, error } = await typedSupabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          // Указываем правильный redirect URL для нашего сервиса
          emailRedirectTo: `${window.location.origin}/confirm-email`
        }
      });

      if (error) {
        const translation = getSupabaseErrorTranslation(error);
        toast({
          title: translation.title,
          description: translation.description,
          variant: "destructive"
        });
        return { error };
      } else if (data.user) {
        // Создаем профиль пользователя в public.users сразу после signUp (fallback к триггеру)
        try {
          // Пытаемся через REST (service) на нашем бэке — обходит RLS
          await fetch('/api/user/upsert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: data.user.id,
              email,
              full_name: fullName || null,
            })
          });
        } catch {}

        const translation = notificationTranslations.auth.registerSuccess;
        toast({
          title: translation.title,
          description: translation.description,
          variant: "success"
        });
      }

      return { error };
    } catch (error) {
      const authError = error as AuthError;
      const translation = getSupabaseErrorTranslation(authError);
      toast({
        title: translation.title,
        description: translation.description,
        variant: "destructive"
      });
      return { error: authError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await typedSupabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('SignIn result:', { error });

      if (error) {
        const translation = getSupabaseErrorTranslation(error);
        console.log('Showing error toast:', translation);
        toast({
          title: translation.title,
          description: translation.description,
          variant: "destructive"
        });
      } else {
        const translation = notificationTranslations.auth.loginSuccess;
        console.log('Showing success toast:', translation);
        toast({
          title: translation.title,
          description: translation.description,
          variant: "success"
        });

        // После входа: создаём профиль в public.users, если его нет
        try {
          const { data: { user } } = await typedSupabase.auth.getUser();
          if (user) {
            const { data: profile } = await typedSupabase
              .from('auth_users')
              .select('id')
              .eq('id', user.id)
              .single();
            if (!profile) {
              await typedSupabase
                .from('auth_users')
                .insert({
                  id: user.id,
                  email: user.email,
                  full_name: user.user_metadata?.full_name || null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
            }
          }
        } catch (e) {
          console.warn('Ensure profile on sign-in failed:', e);
        }
      }

      return { error };
    } catch (error) {
      const authError = error as AuthError;
      const translation = getSupabaseErrorTranslation(authError);
      toast({
        title: translation.title,
        description: translation.description,
        variant: "destructive"
      });
      return { error: authError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await typedSupabase.auth.signOut();
      if (error) {
        const translation = getSupabaseErrorTranslation(error);
        toast({
          title: translation.title,
          description: translation.description,
          variant: "destructive"
        });
      } else {
        // Clear localStorage on logout
        localStorage.removeItem('lastEmail');
        
        const translation = notificationTranslations.auth.logoutSuccess;
        toast({
          title: translation.title,
          description: translation.description,
          variant: "success"
        });
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await typedSupabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      console.log('ResetPassword result:', { error });

      if (error) {
        const translation = getSupabaseErrorTranslation(error);
        console.log('Showing error toast:', translation);
        toast({
          title: translation.title,
          description: translation.description,
          variant: "destructive"
        });
      } else {
        const translation = notificationTranslations.auth.passwordResetSent;
        console.log('Showing success toast:', translation);
        toast({
          title: translation.title,
          description: translation.description,
          variant: "success"
        });
      }

      return { error };
    } catch (error) {
      const authError = error as AuthError;
      const translation = getSupabaseErrorTranslation(authError);
      toast({
        title: translation.title,
        description: translation.description,
        variant: "destructive"
      });
      return { error: authError };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await typedSupabase.auth.updateUser({
        password
      });

      if (error) {
        toast({
          title: "Ошибка обновления пароля",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Пароль обновлен",
          description: "Пароль успешно изменен",
          variant: "success"
        });
      }

      return { error };
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "Ошибка обновления пароля",
        description: authError.message,
        variant: "destructive"
      });
      return { error: authError };
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      const { data, error } = await usersApi.updateUserProfile(updates);
      
      if (error) {
        toast({
          title: "Ошибка обновления профиля",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setProfile(data);
        toast({
          title: "Профиль обновлен",
          description: "Изменения сохранены",
          variant: "success"
        });
      }

      return { error };
    } catch (error) {
      toast({
        title: "Ошибка обновления профиля",
        description: "Произошла ошибка при обновлении профиля",
        variant: "destructive"
      });
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile
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
