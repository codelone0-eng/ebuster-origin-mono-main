import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/config/api';
import {
  Users,
  DollarSign,
  Copy,
  Check,
  TrendingUp,
  Calendar,
  Award,
  Share2
} from 'lucide-react';

interface ReferralCode {
  id: string;
  code: string;
  uses_count: number;
  max_uses: number | null;
  discount_type: string;
  discount_value: number;
  is_active: boolean;
  expires_at: string | null;
}

interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  total_earnings: number;
  pending_earnings: number;
  paid_earnings: number;
  conversion_rate: number;
}

interface Referral {
  id: string;
  created_at: string;
  referred_user: {
    email: string;
    full_name: string;
  };
  subscription: {
    plan: string;
    status: string;
  } | null;
  reward_value: number;
  reward_status: string;
}

interface ReferralPayout {
  id: string;
  created_at: string;
  status: string;
  purchase_amount: number | null;
  reward_amount: number | null;
  currency: string | null;
  referred_user: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
}

export const ReferralProgram: React.FC<{ userId: string }> = ({ userId }) => {
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [payouts, setPayouts] = useState<ReferralPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'referrals' | 'payouts'>('referrals');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${referralCode?.code ?? ''}`;

  const maskEmail = (email?: string | null) => {
    if (!email) return 'Неизвестно';
    const [userPart, domainPart] = email.split('@');
    if (!domainPart) return email;
    if (userPart.length <= 2) {
      return `${userPart.charAt(0)}***@${domainPart}`;
    }
    return `${userPart.charAt(0)}***${userPart.charAt(userPart.length - 1)}@${domainPart}`;
  };

  const getRewardAmountLabel = (value?: number | null) => {
    if (!value || value <= 0) return '—';
    return `+$${value.toFixed(2)}`;
  };

  const normalizeStatus = (status?: string | null) => (status || '').toLowerCase();

  const getRewardStatusLabel = (status?: string | null) => {
    switch (normalizeStatus(status)) {
      case 'paid':
        return 'Выплачено';
      case 'pending':
      case 'processing':
      case null:
      case undefined:
        return 'В обработке';
      case 'cancelled':
        return 'Отменено';
      default:
        return 'В обработке';
    }
  };

  const getRewardStatusVariant = (status?: string | null) => {
    switch (normalizeStatus(status)) {
      case 'paid':
        return 'default' as const;
      case 'pending':
      case 'processing':
      case null:
      case undefined:
        return 'secondary' as const;
      case 'cancelled':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  const formatAmount = (amount?: number | null, currency?: string | null) => {
    if (!amount || amount <= 0) return '—';
    const currencyCode = (currency || 'USD').toUpperCase();
    try {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2
      }).format(amount);
    } catch {
      return `${amount.toFixed(2)} ${currencyCode}`;
    }
  };

  useEffect(() => {
    loadReferralData();
  }, [userId]);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('ebuster_token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const [codeRes, statsRes, referralsRes, payoutsRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/api/referral/user/${userId}/code`, { headers }),
        fetch(`${API_CONFIG.BASE_URL}/api/referral/user/${userId}/stats`, { headers }),
        fetch(`${API_CONFIG.BASE_URL}/api/referral/user/${userId}/referrals`, { headers }),
        fetch(`${API_CONFIG.BASE_URL}/api/referral/user/${userId}/payouts`, { headers })
      ]);

      const codeData = await codeRes.json();
      const statsData = await statsRes.json();
      const referralsData = await referralsRes.json();
      const payoutsData = await payoutsRes.json();

      if (codeData.success) setReferralCode(codeData.data);
      if (statsData.success) setStats(statsData.data);
      if (referralsData.success) setReferrals(referralsData.data);
      if (payoutsData.success) setPayouts(payoutsData.data);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные реферальной программы',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Скопировано!',
        description: type === 'code' ? 'Реферальный код скопирован' : 'Реферальная ссылка скопирована'
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось скопировать',
        variant: 'destructive'
      });
    }
  };

  const shareLink = () => {
    setIsShareModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h2 className="text-3xl font-bold">Реферальная программа</h2>
        <p className="text-muted-foreground mt-2">
          Приглашайте друзей и зарабатывайте на каждой их подписке
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего рефералов</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_referrals || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.active_referrals || 0} активных
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заработано</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.total_earnings ?? 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ${(stats?.paid_earnings ?? 0).toFixed(2)} выплачено
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ожидает выплаты</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.pending_earnings ?? 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Будет выплачено в конце месяца
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Конверсия</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.conversion_rate ?? 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Процент оформивших подписку
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Реферальный код и ссылка */}
      <Card>
        <CardHeader>
          <CardTitle>Ваш реферальный код</CardTitle>
          <CardDescription>
            Поделитесь кодом или ссылкой с друзьями. Они получат скидку {referralCode?.discount_value}% на первую подписку
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={referralCode?.code ?? '—'}
              readOnly
            />
            <Button onClick={() => { void copyToClipboard(referralCode?.code ?? '', 'code'); }}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Ваша реферальная ссылка</p>
            <div className="flex gap-2 mt-2">
              <Input value={referralLink} readOnly />
              <Button onClick={() => { void copyToClipboard(referralLink, 'link'); }}>
                Скопировать ссылку
              </Button>
              <Button onClick={shareLink}>
                <Share2 className="h-4 w-4 mr-2" />
                Поделиться
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'referrals' | 'payouts')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="referrals">Рефералы</TabsTrigger>
          <TabsTrigger value="payouts">История выплат</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>Список рефералов</CardTitle>
              <CardDescription>
                Пользователи, зарегистрировавшиеся по вашей ссылке
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Пока нет рефералов</p>
                  <p className="text-sm mt-2">Поделитесь своей ссылкой, чтобы начать зарабатывать!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-start justify-between gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{maskEmail(referral.referred_user?.email)}</p>
                          {referral.referred_user?.full_name && (
                            <span className="text-sm text-muted-foreground">
                              ({referral.referred_user.full_name})
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {referral.created_at ? new Date(referral.created_at).toLocaleDateString('ru-RU') : '—'}
                          </span>
                          {referral.subscription && (
                            <Badge variant={referral.subscription.status === 'active' ? 'default' : 'secondary'}>
                              {referral.subscription.plan}
                            </Badge>
                          )}
                          <Badge variant={getRewardStatusVariant(referral.reward_status)}>
                            {getRewardStatusLabel(referral.reward_status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>История выплат</CardTitle>
              <CardDescription>
                Когда ваши рефералы оплачивают подписку, здесь появится начисление
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payouts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p>Пока нет начислений</p>
                  <p className="text-sm mt-2">Как только ваш реферал оплатит подписку, информация появится здесь.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payouts.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {item.referred_user?.full_name || maskEmail(item.referred_user?.email)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.created_at ? new Date(item.created_at).toLocaleString('ru-RU') : '—'}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground flex flex-col gap-1">
                        <span>
                          Оформил подписку на сумму <span className="text-foreground font-medium">{formatAmount(item.purchase_amount, item.currency)}</span>
                        </span>
                        <span>
                          Ваш процент: <span className="text-foreground font-medium">{formatAmount(item.reward_amount, item.currency)}</span>
                        </span>
                      </div>
                      <Badge variant={getRewardStatusVariant(item.status)}>
                        {getRewardStatusLabel(item.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Как это работает */}
      <Card>
        <CardHeader>
          <CardTitle>Как это работает?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium">Поделитесь ссылкой</h4>
                <p className="text-sm text-muted-foreground">
                  Отправьте свою реферальную ссылку друзьям или опубликуйте в соцсетях
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium">Друзья получают скидку</h4>
                <p className="text-sm text-muted-foreground">
                  Ваши друзья регистрируются по ссылке и получают скидку {referralCode?.discount_value}% на первую подписку
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium">Вы зарабатываете</h4>
                <p className="text-sm text-muted-foreground">
                  Получайте {referralCode?.discount_value}% от каждого платежа ваших рефералов. Выплаты в конце месяца
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Поделиться ссылкой</DialogTitle>
            <DialogDescription>
              Скопируйте код или отправьте ссылку друзьями — они получат скидку, а вы вознаграждение.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Реферальный код</p>
              <div className="flex gap-2">
                <Input value={referralCode?.code ?? '—'} readOnly />
                <Button
                  variant="secondary"
                  onClick={() => {
                    void copyToClipboard(referralCode?.code ?? '', 'code');
                  }}
                >
                  Скопировать
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Реферальная ссылка</p>
              <div className="flex gap-2">
                <Input value={referralLink} readOnly />
                <Button
                  variant="secondary"
                  onClick={() => {
                    void copyToClipboard(referralLink, 'link');
                  }}
                >
                  Скопировать
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Поделитесь ссылкой в соцсетях, мессенджерах или по email — каждое оформление подписки принесёт вам бонус.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsShareModalOpen(false)}>Готово</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
