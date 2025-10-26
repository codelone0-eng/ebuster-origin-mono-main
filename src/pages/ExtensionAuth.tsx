/**
 * Extension OAuth Authorization Page
 * Страница для авторизации расширения через OAuth
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/CustomAuthContext';
import { Loader2, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function ExtensionAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const [authorizing, setAuthorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получаем параметры OAuth
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const responseType = searchParams.get('response_type');

  useEffect(() => {
    // Проверяем обязательные параметры
    if (!clientId || !redirectUri || !responseType) {
      setError('Неверные параметры OAuth');
      return;
    }

    // Проверяем что client_id соответствует расширению
    if (clientId !== 'ebuster-extension') {
      setError('Неизвестное приложение');
      return;
    }

    // Если пользователь не авторизован, сохраняем параметры и редиректим на логин
    if (!loading && !user) {
      sessionStorage.setItem('oauth_params', JSON.stringify({
        client_id: clientId,
        redirect_uri: redirectUri,
        state: state || '',
        response_type: responseType
      }));
      navigate('/login');
      return;
    }

    // Если пользователь авторизован, автоматически авторизуем расширение
    if (user && !authorizing) {
      handleAuthorize();
    }
  }, [user, loading, clientId, redirectUri, state, responseType]);

  const handleAuthorize = async () => {
    setAuthorizing(true);
    
    try {
      // Генерируем authorization code
      const authCode = 'auth_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Сохраняем код на бэкенде для последующего обмена
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.ebuster.ru';
      const saveResponse = await fetch(`${API_URL}/api/auth/extension/save-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: authCode,
          userId: user!.id,
          email: user!.email
        })
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save authorization code');
      }

      console.log('🔐 [ExtensionAuth] Authorization code saved:', authCode);

      // Формируем URL для редиректа
      const redirectUrl = new URL(redirectUri!);
      redirectUrl.searchParams.set('code', authCode);
      // Возвращаем тот же state что пришел от расширения
      redirectUrl.searchParams.set('state', state || '');

      // Перенаправляем обратно в расширение
      setTimeout(() => {
        window.location.href = redirectUrl.toString();
      }, 1000);
    } catch (err) {
      console.error('Authorization error:', err);
      setError('Ошибка авторизации');
      setAuthorizing(false);
    }
  };

  const handleDeny = () => {
    if (redirectUri) {
      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.set('error', 'access_denied');
      if (state) {
        redirectUrl.searchParams.set('state', state);
      }
      window.location.href = redirectUrl.toString();
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-center">Ошибка авторизации</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authorizing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            <CardTitle className="text-center">Авторизация успешна!</CardTitle>
            <CardDescription className="text-center">
              Перенаправление в расширение...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center">Авторизация расширения</CardTitle>
          <CardDescription className="text-center">
            Расширение EBUSTER запрашивает доступ к вашему аккаунту
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Расширение получит доступ к:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Вашему email и имени</li>
              <li>• Списку ваших скриптов</li>
              <li>• Настройкам профиля</li>
            </ul>
          </div>

          {user && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Вы авторизованы как:</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.full_name && (
                <p className="text-sm text-muted-foreground">{user.full_name}</p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleDeny} variant="outline" className="flex-1">
              Отменить
            </Button>
            <Button onClick={handleAuthorize} className="flex-1">
              Разрешить доступ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
