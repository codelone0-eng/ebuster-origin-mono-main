import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/config/api';
import { 
  Crown,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Shield,
  Gift
} from 'lucide-react';

interface Subscription {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  plan: 'free' | 'premium' | 'pro' | 'enterprise';
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  payment_method?: string;
  amount?: number;
  features: string[];
  created_at: string;
  updated_at: string;
}

interface SubscriptionStats {
  total: number;
  active: number;
  expired: number;
  trial: number;
  revenue: {
    monthly: number;
    total: number;
  };
  planDistribution: {
    free: number;
    premium: number;
    pro: number;
    enterprise: number;
  };
}

const PLAN_FEATURES = {
  free: ['Базовые скрипты', 'Ограниченная поддержка'],
  premium: ['Все бесплатные функции', 'Premium скрипты', 'Приоритетная поддержка', 'Без рекламы'],
  pro: ['Все Premium функции', 'Pro скрипты', 'API доступ', 'Расширенная аналитика', 'Кастомные скрипты'],
  enterprise: ['Все Pro функции', 'Неограниченные скрипты', 'Выделенная поддержка', 'SLA гарантии', 'Кастомная интеграция']
};

const PLAN_PRICES = {
  free: 0,
  premium: 9.99,
  pro: 29.99,
  enterprise: 99.99
};

const SubscriptionsManagement: React.FC = () => {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Форма для создания/редактирования подписки
  const [formData, setFormData] = useState<{
    user_email: string;
    plan: 'free' | 'premium' | 'pro' | 'enterprise';
    duration_months: number;
    auto_renew: boolean;
    status: 'active' | 'expired' | 'cancelled' | 'trial';
  }>({
    user_email: '',
    plan: 'premium',
    duration_months: 1,
    auto_renew: true,
    status: 'active'
  });

  // Загрузка данных
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем подписки
      const subsResponse = await fetch(`${API_CONFIG.ADMIN_URL}/subscriptions`);
      const subsData = await subsResponse.json();
      
      if (subsData.success) {
        setSubscriptions(subsData.data.subscriptions || []);
      }

      // Загружаем статистику
      const statsResponse = await fetch(`${API_CONFIG.ADMIN_URL}/subscriptions/stats`);
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки подписок:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные подписок',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Создание новой подписки
  const handleCreateSubscription = async () => {
    try {
      const response = await fetch(`${API_CONFIG.ADMIN_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Подписка создана'
        });
        setIsCreateDialogOpen(false);
        resetForm();
        loadData();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать подписку',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Ошибка создания подписки:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать подписку',
        variant: 'destructive'
      });
    }
  };

  // Обновление подписки
  const handleUpdateSubscription = async () => {
    if (!selectedSubscription) return;

    try {
      const response = await fetch(`${API_CONFIG.ADMIN_URL}/subscriptions/${selectedSubscription.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Подписка обновлена'
        });
        setIsEditDialogOpen(false);
        setSelectedSubscription(null);
        resetForm();
        loadData();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось обновить подписку',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Ошибка обновления подписки:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить подписку',
        variant: 'destructive'
      });
    }
  };

  // Отмена подписки
  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Вы уверены, что хотите отменить эту подписку?')) return;

    try {
      const response = await fetch(`${API_CONFIG.ADMIN_URL}/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Подписка отменена'
        });
        loadData();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отменить подписку',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Ошибка отмены подписки:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отменить подписку',
        variant: 'destructive'
      });
    }
  };

  // Продление подписки
  const handleRenewSubscription = async (subscriptionId: string, months: number) => {
    try {
      const response = await fetch(`${API_CONFIG.ADMIN_URL}/subscriptions/${subscriptionId}/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ months }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно',
          description: `Подписка продлена на ${months} мес.`
        });
        loadData();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось продлить подписку',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Ошибка продления подписки:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось продлить подписку',
        variant: 'destructive'
      });
    }
  };

  // Удаление подписки
  const handleDeleteSubscription = async (subscriptionId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту подписку? Это действие необратимо.')) return;

    try {
      const response = await fetch(`${API_CONFIG.ADMIN_URL}/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Подписка удалена'
        });
        loadData();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось удалить подписку',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Ошибка удаления подписки:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить подписку',
        variant: 'destructive'
      });
    }
  };

  // Сброс формы
  const resetForm = () => {
    setFormData({
      user_email: '',
      plan: 'premium',
      duration_months: 1,
      auto_renew: true,
      status: 'active'
    });
  };

  // Открытие диалога редактирования
  const openEditDialog = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setFormData({
      user_email: subscription.user_email,
      plan: subscription.plan,
      duration_months: 1,
      auto_renew: subscription.auto_renew,
      status: subscription.status
    });
    setIsEditDialogOpen(true);
  };

  // Фильтрация подписок
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = !planFilter || planFilter === 'all' || sub.plan === planFilter;
    const matchesStatus = !statusFilter || statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Получение цвета бейджа для плана
  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-muted text-muted-foreground';
      case 'premium': return 'bg-primary/20 text-primary';
      case 'pro': return 'bg-blue-500/20 text-blue-500';
      case 'enterprise': return 'bg-purple-500/20 text-purple-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Получение цвета бейджа для статуса
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500';
      case 'trial': return 'bg-blue-500/20 text-blue-500';
      case 'expired': return 'bg-red-500/20 text-red-500';
      case 'cancelled': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Получение иконки для плана
  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'premium': return <Crown className="h-4 w-4" />;
      case 'pro': return <Zap className="h-4 w-4" />;
      case 'enterprise': return <Shield className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего подписок</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Активных: {stats.active}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Месячный доход</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.revenue.monthly.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Всего: ${stats.revenue.total.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium подписки</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.planDistribution.premium}</div>
              <p className="text-xs text-muted-foreground">
                Pro: {stats.planDistribution.pro} | Enterprise: {stats.planDistribution.enterprise}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Пробные периоды</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trial}</div>
              <p className="text-xs text-muted-foreground">
                Истекших: {stats.expired}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Фильтры и поиск */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Управление подписками</CardTitle>
              <CardDescription>
                Создавайте, редактируйте и управляйте подписками пользователей
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Создать подписку
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по email или имени..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Все планы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все планы</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="trial">Пробные</SelectItem>
                <SelectItem value="expired">Истекшие</SelectItem>
                <SelectItem value="cancelled">Отмененные</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Таблица подписок */}
          <div className="space-y-4">
            {filteredSubscriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Подписки не найдены
              </div>
            ) : (
              filteredSubscriptions.map((subscription) => (
                <Card key={subscription.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {getPlanIcon(subscription.plan)}
                            <h3 className="font-semibold">{subscription.user_name || subscription.user_email}</h3>
                          </div>
                          <Badge className={getPlanBadgeColor(subscription.plan)}>
                            {subscription.plan.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusBadgeColor(subscription.status)}>
                            {subscription.status === 'active' ? 'Активна' :
                             subscription.status === 'trial' ? 'Пробная' :
                             subscription.status === 'expired' ? 'Истекла' : 'Отменена'}
                          </Badge>
                          {subscription.auto_renew && (
                            <Badge variant="outline" className="text-xs">
                              Автопродление
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {subscription.user_email}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Начало:</span>
                            <p className="font-medium">{new Date(subscription.start_date).toLocaleDateString('ru-RU')}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Окончание:</span>
                            <p className="font-medium">{new Date(subscription.end_date).toLocaleDateString('ru-RU')}</p>
                          </div>
                          {subscription.amount && (
                            <div>
                              <span className="text-muted-foreground">Стоимость:</span>
                              <p className="font-medium">${subscription.amount}/мес</p>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Функции:</span>
                            <p className="font-medium">{subscription.features.length} шт.</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(subscription)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {subscription.status === 'active' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRenewSubscription(subscription.id, 1)}
                            >
                              <Calendar className="h-4 w-4 mr-1" />
                              +1 мес
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelSubscription(subscription.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSubscription(subscription.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Диалог создания подписки */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Создать подписку</DialogTitle>
            <DialogDescription>
              Выдайте новую подписку пользователю
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user_email">Email пользователя</Label>
              <Input
                id="user_email"
                value={formData.user_email}
                onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label htmlFor="plan">План подписки</Label>
              <Select
                value={formData.plan}
                onValueChange={(value: any) => setFormData({ ...formData, plan: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите план" />
                </SelectTrigger>
                <SelectContent className="z-[9999]" style={{ zIndex: 9999 }}>
                  <SelectItem value="premium">Premium - ${PLAN_PRICES.premium}/мес</SelectItem>
                  <SelectItem value="pro">Pro - ${PLAN_PRICES.pro}/мес</SelectItem>
                  <SelectItem value="enterprise">Enterprise - ${PLAN_PRICES.enterprise}/мес</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-2">Включенные функции:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {PLAN_FEATURES[formData.plan].map((feature, idx) => (
                    <li key={idx}>• {feature}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <Label htmlFor="duration">Длительность (месяцев)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="12"
                value={formData.duration_months}
                onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto_renew"
                checked={formData.auto_renew}
                onChange={(e) => setFormData({ ...formData, auto_renew: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="auto_renew">Автоматическое продление</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateSubscription}>
                Создать подписку
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования подписки */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать подписку</DialogTitle>
            <DialogDescription>
              Измените параметры подписки пользователя
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email пользователя</Label>
              <Input value={formData.user_email} disabled />
            </div>
            <div>
              <Label htmlFor="edit_plan">План подписки</Label>
              <Select
                value={formData.plan}
                onValueChange={(value: any) => setFormData({ ...formData, plan: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите план" />
                </SelectTrigger>
                <SelectContent className="z-[9999]" style={{ zIndex: 9999 }}>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium - ${PLAN_PRICES.premium}/мес</SelectItem>
                  <SelectItem value="pro">Pro - ${PLAN_PRICES.pro}/мес</SelectItem>
                  <SelectItem value="enterprise">Enterprise - ${PLAN_PRICES.enterprise}/мес</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent className="z-[9999]" style={{ zIndex: 9999 }}>
                  <SelectItem value="active">Активна</SelectItem>
                  <SelectItem value="trial">Пробная</SelectItem>
                  <SelectItem value="expired">Истекла</SelectItem>
                  <SelectItem value="cancelled">Отменена</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit_auto_renew"
                checked={formData.auto_renew}
                onChange={(e) => setFormData({ ...formData, auto_renew: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit_auto_renew">Автоматическое продление</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleUpdateSubscription}>
                Сохранить изменения
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionsManagement;
