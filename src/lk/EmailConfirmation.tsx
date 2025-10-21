/**
 * Email Confirmation Page
 * Handles email confirmation and automatic login
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/CustomAuthContext';
import { API_CONFIG } from '@/config/api';
export default function EmailConfirmation() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Наш кастомный флоу: ожидаем token и email в URL
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
          setStatus('error');
          setMessage('Неверная ссылка подтверждения или ссылка уже использована.');
          return;
        }

        const res = await fetch(`${API_CONFIG.AUTH_URL}/confirm-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
        const data = await res.json();

        if (!res.ok || data?.success !== true) {
          setStatus('error');
          setMessage(data?.error || 'Неверная ссылка подтверждения или ссылка уже использована.');
          return;
        }

        setStatus('success');
        setMessage('Email успешно подтвержден! Теперь можно войти.');
      } catch (error) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage('Произошла ошибка при подтверждении email.');
      }
    };

    // Выполняем сразу, auth-загрузка не нужна для подтверждения
    handleEmailConfirmation();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate('/');
  };

  const handleGoToLogin = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Проверка подтверждения...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">
            Подтверждение Email
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Обрабатываем подтверждение...'}
            {status === 'success' && 'Email подтвержден'}
            {status === 'error' && 'Ошибка подтверждения'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center text-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <p className="text-muted-foreground">Проверяем подтверждение...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Успешно!
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {message}
                  </p>
                  <Button 
                    onClick={() => navigate('/signin', { replace: true })}
                    className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium"
                  >
                    Перейти в аккаунт
                  </Button>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Ошибка
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {message}
                  </p>
                  <div className="flex gap-3 w-full">
                    <Button 
                      variant="outline" 
                      onClick={handleRetry}
                      className="flex-1 h-11 bg-background border-border hover:bg-accent hover:text-accent-foreground rounded-lg font-medium"
                    >
                      Попробовать снова
                    </Button>
                    <Button 
                      onClick={handleGoToLogin}
                      className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium"
                    >
                      Перейти к входу
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
