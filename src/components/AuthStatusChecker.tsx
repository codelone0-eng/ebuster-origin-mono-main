/**
 * Auth Status Checker
 * Component to check authentication status and redirect accordingly
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/CustomAuthContext';
import { Loader2 } from 'lucide-react';

export const AuthStatusChecker = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  // Убираем автоматический редирект - пользователь может остаться на главной странице
  // useEffect(() => {
  //   if (!loading && user && !hasRedirected.current) {
  //     // User is authenticated, redirect to dashboard
  //     hasRedirected.current = true;
  //     navigate('/dashboard', { replace: true });
  //   }
  // }, [user, loading, navigate]);

  // Reset redirect flag when user changes
  useEffect(() => {
    if (!user) {
      hasRedirected.current = false;
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  return null;
};
