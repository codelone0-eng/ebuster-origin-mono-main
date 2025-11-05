import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, Crown, Zap, TrendingUp, Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/config/api';
import { cn } from '@/lib/utils';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: any;
  limits: any;
  is_active: boolean;
  display_order: number;
}

interface PricingPlansProps {
  onSubscribe?: (roleId: string, billingPeriod: string) => void;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ onSubscribe }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const { role: currentRole, refresh } = useSubscription();
  const { toast } = useToast();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/roles`);
      const data = await response.json();

      if (data.success) {
        // Фильтруем и сортируем роли
        const filteredRoles = data.data
          .filter((r: Role) => r.is_active && r.name !== 'admin')
          .sort((a: Role, b: Role) => a.display_order - b.display_order);
        
        setRoles(filteredRoles);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить планы подписок',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (roleId: string) => {
    if (onSubscribe) {
      onSubscribe(roleId, billingPeriod);
      return;
    }

    try {
      setSubscribing(roleId);

      const token = localStorage.getItem('ebuster_token');
      if (!token) {
        toast({
          title: 'Требуется авторизация',
          description: 'Войдите в аккаунт для оформления подписки',
          variant: 'destructive'
        });
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/subscriptions/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roleId,
          billingPeriod,
          paymentMethod: 'card'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно!',
          description: 'Подписка оформлена',
          variant: 'success'
        });
        
        await refresh();
      } else {
        throw new Error(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось оформить подписку',
        variant: 'destructive'
      });
    } finally {
      setSubscribing(null);
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'premium':
        return <Crown className="h-6 w-6" />;
      case 'pro':
        return <Zap className="h-6 w-6" />;
      default:
        return <TrendingUp className="h-6 w-6" />;
    }
  };

  const getPrice = (role: Role) => {
    if (role.name === 'free') return 0;
    return billingPeriod === 'monthly' ? role.price_monthly : role.price_yearly;
  };

  const getFeaturesList = (features: any) => {
    const list: string[] = [];

    if (features.scripts) {
      const count = features.scripts.max_count;
      list.push(count === -1 ? 'Неограниченные скрипты' : `До ${count} скриптов`);
      
      if (features.scripts.can_publish) list.push('Публикация скриптов');
      if (features.scripts.can_feature) list.push('Featured размещение');
      if (features.scripts.can_premium) list.push('Premium скрипты');
    }

    if (features.downloads) {
      if (features.downloads.unlimited) {
        list.push('Неограниченные загрузки');
      } else {
        list.push(`До ${features.downloads.max_per_day} загрузок в день`);
      }
    }

    if (features.support) {
      if (features.support.priority) list.push('Приоритетная поддержка');
      if (features.support.chat) list.push('Чат поддержки');
    }

    if (features.api?.enabled) {
      list.push('API доступ');
    }

    if (features.storage) {
      const size = features.storage.max_size_mb;
      list.push(size === -1 ? 'Неограниченное хранилище' : `${size} МБ хранилища`);
    }

    return list;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Переключатель периода */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setBillingPeriod('monthly')}
          >
            Ежемесячно
          </Button>
          <Button
            variant={billingPeriod === 'yearly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setBillingPeriod('yearly')}
          >
            Ежегодно
            <Badge variant="secondary" className="ml-2">-17%</Badge>
          </Button>
        </div>
      </div>

      {/* Карточки планов */}
      <div className="grid md:grid-cols-3 gap-6">
        {roles.map((role) => {
          const isCurrentPlan = currentRole?.id === role.id;
          const isPremium = role.name === 'premium';
          const features = getFeaturesList(role.features);
          const price = getPrice(role);

          return (
            <Card
              key={role.id}
              className={cn(
                "relative",
                isPremium && "border-primary shadow-lg shadow-primary/20",
                isCurrentPlan && "ring-2 ring-primary"
              )}
            >
              {isPremium && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Популярный
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isPremium && "bg-primary/10 text-primary",
                    role.name === 'pro' && "bg-blue-500/10 text-blue-500",
                    role.name === 'free' && "bg-muted text-muted-foreground"
                  )}>
                    {getRoleIcon(role.name)}
                  </div>
                  <div>
                    <CardTitle>{role.display_name}</CardTitle>
                    {isCurrentPlan && (
                      <Badge variant="outline" className="mt-1">
                        Текущий план
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Цена */}
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{price}</span>
                  <span className="text-muted-foreground">₽</span>
                  {price > 0 && (
                    <span className="text-sm text-muted-foreground">
                      /{billingPeriod === 'monthly' ? 'мес' : 'год'}
                    </span>
                  )}
                </div>

                {/* Возможности */}
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={isPremium ? 'default' : 'outline'}
                  disabled={isCurrentPlan || subscribing === role.id}
                  onClick={() => handleSubscribe(role.id)}
                >
                  {subscribing === role.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Оформление...
                    </>
                  ) : isCurrentPlan ? (
                    'Текущий план'
                  ) : role.name === 'free' ? (
                    'Бесплатно'
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Выбрать план
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
