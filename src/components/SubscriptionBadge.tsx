import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Crown, Zap, Shield, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SubscriptionBadgeProps {
  showDetails?: boolean;
  className?: string;
}

/**
 * Компонент для отображения текущей подписки пользователя
 */
export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  showDetails = true,
  className
}) => {
  const { role, subscription, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading || !role) {
    return null;
  }

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'premium':
        return <Crown className="h-3 w-3" />;
      case 'pro':
        return <Zap className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/30';
      case 'premium':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/30';
      case 'pro':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/30';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/80';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (!showDetails) {
    return (
      <Badge
        variant="outline"
        className={cn(getRoleColor(role.name), className)}
      >
        {getRoleIcon(role.name)}
        <span className="ml-1">{role.display_name}</span>
      </Badge>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-2 h-8",
            getRoleColor(role.name),
            className
          )}
        >
          {getRoleIcon(role.name)}
          <span>{role.display_name}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Заголовок */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              role.name === 'premium' && "bg-yellow-500/10",
              role.name === 'pro' && "bg-blue-500/10",
              role.name === 'admin' && "bg-red-500/10",
              role.name === 'free' && "bg-muted"
            )}>
              {getRoleIcon(role.name) || <TrendingUp className="h-5 w-5" />}
            </div>
            <div>
              <h4 className="font-semibold">{role.display_name}</h4>
              <p className="text-sm text-muted-foreground">
                {role.name === 'free' ? 'Бесплатный план' : 'Активная подписка'}
              </p>
            </div>
          </div>

          {/* Информация о подписке */}
          {subscription && subscription.end_date && (
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Действует до:
                </span>
                <span className="font-medium">
                  {formatDate(subscription.end_date)}
                </span>
              </div>
              {getDaysRemaining(subscription.end_date) <= 30 && (
                <div className="text-xs text-orange-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Осталось {getDaysRemaining(subscription.end_date)} дней
                </div>
              )}
            </div>
          )}

          {/* Возможности */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Ваши возможности:</p>
            <div className="space-y-1">
              {role.features?.scripts?.max_count !== undefined && (
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Скрипты:</span>
                  <span className="font-medium">
                    {role.features.scripts.max_count === -1
                      ? 'Неограниченно'
                      : `До ${role.features.scripts.max_count}`}
                  </span>
                </div>
              )}
              {role.features?.downloads?.max_per_day !== undefined && (
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Загрузки в день:</span>
                  <span className="font-medium">
                    {role.features.downloads.unlimited
                      ? 'Неограниченно'
                      : `До ${role.features.downloads.max_per_day}`}
                  </span>
                </div>
              )}
              {role.features?.support?.priority && (
                <div className="text-xs text-green-500 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Приоритетная поддержка
                </div>
              )}
              {role.features?.api?.enabled && (
                <div className="text-xs text-blue-500 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  API доступ
                </div>
              )}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-2 pt-2 border-t">
            {role.name === 'free' ? (
              <Button
                className="w-full"
                onClick={() => navigate('/pricing')}
              >
                <Crown className="h-4 w-4 mr-2" />
                Обновить план
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/dashboard?tab=subscription')}
                >
                  Управление
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => navigate('/pricing')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upgrade
                </Button>
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
