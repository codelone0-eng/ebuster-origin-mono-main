import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Smartphone, 
  Tablet,
  MapPin,
  Calendar,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { API_CONFIG } from '@/config/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface LoginRecord {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  location?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  success: boolean;
  created_at: string;
}

export const LoginHistory: React.FC = () => {
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLoginHistory();
  }, []);

  const loadLoginHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ebuster_token');
      
      const response = await fetch(`${API_CONFIG.USER_URL}/login-history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setLoginHistory(result.data || []);
      }
    } catch (error) {
      console.error('Error loading login history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      setLoggingOut(true);
      const token = localStorage.getItem('ebuster_token');
      
      const response = await fetch(`${API_CONFIG.USER_URL}/logout-all-devices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Успешно',
          description: 'Вы вышли из всех устройств. Сейчас вы будете перенаправлены на страницу входа.',
          variant: 'success'
        });
        
        // Очищаем токен и перенаправляем на страницу входа
        setTimeout(() => {
          localStorage.removeItem('ebuster_token');
          window.location.href = '/login';
        }, 2000);
      } else {
        toast({
          title: 'Ошибка',
          description: result.error || 'Не удалось выйти из всех устройств',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при выходе из всех устройств',
        variant: 'destructive'
      });
    } finally {
      setLoggingOut(false);
    }
  };

  const getDeviceIcon = (userAgent: string = '') => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="h-4 w-4" />;
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const parseUserAgent = (userAgent: string = '') => {
    // Простой парсинг user agent
    let browser = 'Unknown';
    let os = 'Unknown';

    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    return { browser, os };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>История входов</CardTitle>
          <CardDescription>Загрузка...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>История входов</CardTitle>
            <CardDescription>
              Последние 50 входов в ваш аккаунт
            </CardDescription>
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleLogoutAllDevices}
            disabled={loggingOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Выйти из всех устройств
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loginHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>История входов пуста</p>
          </div>
        ) : (
          <div className="space-y-3">
            {loginHistory.map((record) => {
              const { browser, os } = parseUserAgent(record.user_agent);
              
              return (
                <div
                  key={record.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border",
                    record.success 
                      ? "bg-card border-border/50" 
                      : "bg-destructive/5 border-destructive/20"
                  )}
                >
                  <div className="mt-1">
                    {getDeviceIcon(record.user_agent)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {browser} на {os}
                      </span>
                      {record.success ? (
                        <Badge variant="outline" className="text-xs">
                          Успешно
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Неудачно
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{record.location || record.ip_address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(record.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
