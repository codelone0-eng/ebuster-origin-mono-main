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
          sessionStorage.clear();
          // Перенаправляем на главный домен
          window.location.href = 'https://ebuster.ru/login';
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
    let browser = 'Unknown';
    let os = 'Unknown';
    let device = '';

    // Определяем браузер
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edge') || userAgent.includes('Edg/')) browser = 'Edge';
    else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera';

    // Определяем ОС и устройство
    if (userAgent.includes('Android')) {
      os = 'Android';
      // Пытаемся извлечь модель устройства
      const modelMatch = userAgent.match(/\(([^)]+)\)/);
      if (modelMatch) {
        const details = modelMatch[1];
        // Ищем модель телефона (обычно идёт после "Build/" или последнее слово перед "Build/")
        const buildMatch = details.match(/([^;]+)\s+Build\//);
        if (buildMatch) {
          device = buildMatch[1].trim();
        } else {
          // Берём последнюю часть до Build или весь текст
          const parts = details.split(';');
          device = parts[parts.length - 1].trim();
        }
      }
    } else if (userAgent.includes('iPhone')) {
      os = 'iOS';
      device = 'iPhone';
    } else if (userAgent.includes('iPad')) {
      os = 'iOS';
      device = 'iPad';
    } else if (userAgent.includes('Windows')) {
      os = 'Windows';
      if (userAgent.includes('Windows NT 10.0')) device = 'Windows 10/11';
      else if (userAgent.includes('Windows NT 6.3')) device = 'Windows 8.1';
      else if (userAgent.includes('Windows NT 6.2')) device = 'Windows 8';
      else if (userAgent.includes('Windows NT 6.1')) device = 'Windows 7';
    } else if (userAgent.includes('Mac OS X') || userAgent.includes('Macintosh')) {
      os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
    }

    return { browser, os, device };
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
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="text-lg font-semibold text-white mb-2">История входов</h3>
        <p className="text-sm text-white/60">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
      <div className=" p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">История входов</h3>
            <p className="text-sm text-white/60">
            Последние 50 входов в ваш аккаунт
          </p>
        </div>
        <Button 
            className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl"
          size="sm"
          onClick={handleLogoutAllDevices}
          disabled={loggingOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Выйти из всех устройств
        </Button>
      </div>
      <div>
        {loginHistory.length === 0 ? (
          <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-white/60 opacity-50" />
              <p className="text-white/60">История входов пуста</p>
          </div>
        ) : (
          <div className="space-y-3">
            {loginHistory.map((record) => {
              const { browser, os, device } = parseUserAgent(record.user_agent);
              
              return (
                <div
                  key={record.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                    <div className="flex items-start gap-4">
                      <div className="mt-1 text-white/60">
                    {getDeviceIcon(record.user_agent)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-white">
                        {browser} на {os}{device ? ` • ${device}` : ''}
                      </span>
                          <Badge className={cn("text-xs rounded-lg", record.success ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/30" : "bg-red-500/20 text-red-400 border-red-500/30")}>
                        {record.success ? 'Успешно' : 'Неудачно'}
                      </Badge>
                    </div>
                    
                        <div className="flex items-center gap-4 text-xs text-white/40">
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
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
