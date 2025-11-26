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
      <div className="flex items-center justify-center h-64 rounded-[24px] border border-white/10 bg-black/30 backdrop-blur-xl p-1">
        <div className="rounded-[16px] border border-white/10 bg-black/70 w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="rounded-[24px] border border-white/10 bg-black/30 backdrop-blur-xl p-1">
        <div className="rounded-[16px] border border-white/10 bg-black/70 p-6">
          <h2 className="text-3xl font-bold text-white mb-2">Реферальная программа</h2>
          <p className="text-white/60">
            Приглашайте друзей и зарабатывайте на каждой их подписке
          </p>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-[24px] border border-white/10 bg-black/30 backdrop-blur-xl p-1">
          <div className="rounded-[16px] border border-white/10 bg-black/70 p-4">
            <div className="flex flex-row items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide">Всего рефералов</h3>
              <Users className="h-4 w-4 text-white/60" />
            </div>
            <div className="text-2xl font-bold text-white">{stats?.total_referrals || 0}</div>
            <p className="text-xs text-white/40 mt-1">
              {stats?.active_referrals || 0} активных
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/30 backdrop-blur-xl p-1">
          <div className="rounded-[16px] border border-white/10 bg-black/70 p-4">
            <div className="flex flex-row items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide">Заработано</h3>
              <DollarSign className="h-4 w-4 text-white/60" />
            </div>
            <div className="text-2xl font-bold text-white">${(stats?.total_earnings ?? 0).toFixed(2)}</div>
            <p className="text-xs text-white/40 mt-1">
              ${(stats?.paid_earnings ?? 0).toFixed(2)} выплачено
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/30 backdrop-blur-xl p-1">
          <div className="rounded-[16px] border border-white/10 bg-black/70 p-4">
            <div className="flex flex-row items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide">Ожидает выплаты</h3>
              <TrendingUp className="h-4 w-4 text-white/60" />
            </div>
            <div className="text-2xl font-bold text-white">${(stats?.pending_earnings ?? 0).toFixed(2)}</div>
            <p className="text-xs text-white/40 mt-1">
              Будет выплачено в конце месяца
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/30 backdrop-blur-xl p-1">
          <div className="rounded-[16px] border border-white/10 bg-black/70 p-4">
            <div className="flex flex-row items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide">Конверсия</h3>
              <Award className="h-4 w-4 text-white/60" />
            </div>
            <div className="text-2xl font-bold text-white">{(stats?.conversion_rate ?? 0).toFixed(1)}%</div>
            <p className="text-xs text-white/40 mt-1">
              Процент оформивших подписку
            </p>
          </div>
        </div>
      </div>

      {/* Реферальный код и ссылка */}
      <div className="rounded-[24px] border border-white/10 bg-black/30 backdrop-blur-xl p-1">
        <div className="rounded-[16px] border border-white/10 bg-black/70 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Ваш реферальный код</h3>
            <p className="text-sm text-white/60">
              Поделитесь кодом или ссылкой с друзьями. Они получат скидку {referralCode?.discount_value}% на первую подписку
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={referralCode?.code ?? '—'}
                readOnly
                className="bg-white/5 border-white/15 text-white rounded-xl"
              />
              <Button 
                onClick={() => { void copyToClipboard(referralCode?.code ?? '', 'code'); }}
                className="bg-white text-black hover:bg-white/90 rounded-xl"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div>
              <p className="text-sm text-white/60 mb-2">Ваша реферальная ссылка</p>
              <div className="flex gap-2">
                <Input value={referralLink} readOnly className="bg-white/5 border-white/15 text-white rounded-xl" />
                <Button 
                  onClick={() => { void copyToClipboard(referralLink, 'link'); }}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
                >
                  Скопировать
                </Button>
                <Button 
                  onClick={shareLink}
                  className="bg-white text-black hover:bg-white/90 rounded-xl"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Поделиться
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'referrals' | 'payouts')} className="rounded-[24px] border border-white/10 bg-black/30 backdrop-blur-xl p-1">
        <div className="rounded-[16px] border border-white/10 bg-black/70 p-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 rounded-xl">
            <TabsTrigger value="referrals" className="data-[state=active]:bg-white data-[state=active]:text-black text-white/60 rounded-xl">Рефералы</TabsTrigger>
            <TabsTrigger value="payouts" className="data-[state=active]:bg-white data-[state=active]:text-black text-white/60 rounded-xl">История выплат</TabsTrigger>
          </TabsList>

        <TabsContent value="referrals" className="mt-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Список рефералов</h3>
            <p className="text-sm text-[#808080] mb-4">
              Пользователи, зарегистрировавшиеся по вашей ссылке
            </p>
            {referrals.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-white/60 opacity-50" />
                <p className="text-white/60">Пока нет рефералов</p>
                <p className="text-sm text-white/60 mt-2">Поделитесь своей ссылкой, чтобы начать зарабатывать!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{maskEmail(referral.referred_user?.email)}</p>
                          {referral.referred_user?.full_name && (
                            <span className="text-sm text-white/60">
                              ({referral.referred_user.full_name})
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-white/40">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {referral.created_at ? new Date(referral.created_at).toLocaleDateString('ru-RU') : '—'}
                        </span>
                        {referral.subscription && (
                          <Badge className={referral.subscription.status === 'active' ? 'bg-blue-600 text-white' : 'bg-[#2d2d2d] text-[#a3a3a3]'}>
                            {referral.subscription.plan}
                          </Badge>
                        )}
                        <Badge className={getRewardStatusVariant(referral.reward_status) === 'default' ? 'bg-green-600 text-white' : 'bg-[#2d2d2d] text-[#a3a3a3]'}>
                          {getRewardStatusLabel(referral.reward_status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="payouts" className="mt-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">История выплат</h3>
            <p className="text-sm text-[#808080] mb-4">
              Когда ваши рефералы оплачивают подписку, здесь появится начисление
            </p>
            {payouts.length === 0 ? (
              <div className="text-center py-10">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-[#808080] opacity-40" />
                <p className="text-[#808080]">Пока нет начислений</p>
                <p className="text-sm text-[#808080] mt-2">Как только ваш реферал оплатит подписку, информация появится здесь.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payouts.map((item) => (
                  <div key={item.id} className="p-4 bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-white">
                        {item.referred_user?.full_name || maskEmail(item.referred_user?.email)}
                      </div>
                      <div className="text-sm text-[#808080]">
                        {item.created_at ? new Date(item.created_at).toLocaleString('ru-RU') : '—'}
                      </div>
                    </div>
                    <div className="text-sm text-[#808080] flex flex-col gap-1">
                      <span>
                        Оформил подписку на сумму <span className="text-white font-medium">{formatAmount(item.purchase_amount, item.currency)}</span>
                      </span>
                      <span>
                        Ваш процент: <span className="text-white font-medium">{formatAmount(item.reward_amount, item.currency)}</span>
                      </span>
                    </div>
                    <Badge className={getRewardStatusVariant(item.status) === 'default' ? 'bg-green-600 text-white' : 'bg-[#2d2d2d] text-[#a3a3a3]'}>
                      {getRewardStatusLabel(item.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Как это работает */}
      <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Как это работает?</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h4 className="font-medium text-white">Поделитесь ссылкой</h4>
              <p className="text-sm text-[#808080]">
                Отправьте свою реферальную ссылку друзьям или опубликуйте в соцсетях
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h4 className="font-medium text-white">Друзья получают скидку</h4>
              <p className="text-sm text-[#808080]">
                Ваши друзья регистрируются по ссылке и получают скидку {referralCode?.discount_value}% на первую подписку
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h4 className="font-medium text-white">Вы зарабатываете</h4>
              <p className="text-sm text-[#808080]">
                Получайте {referralCode?.discount_value}% от каждого платежа ваших рефералов. Выплаты в конце месяца
              </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Поделиться ссылкой</DialogTitle>
            <DialogDescription className="text-[#808080]">
              Скопируйте код или отправьте ссылку друзьями — они получат скидку, а вы вознаграждение.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#808080] mb-2">Реферальный код</p>
              <div className="flex gap-2">
                <Input value={referralCode?.code ?? '—'} readOnly className="bg-[#111111] border-[#2d2d2d] text-white" />
                <Button
                  className="bg-[#2d2d2d] border-[#404040] text-white hover:bg-[#3d3d3d]"
                  onClick={() => {
                    void copyToClipboard(referralCode?.code ?? '', 'code');
                  }}
                >
                  Скопировать
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-[#808080] mb-2">Реферальная ссылка</p>
              <div className="flex gap-2">
                <Input value={referralLink} readOnly className="bg-[#111111] border-[#2d2d2d] text-white" />
                <Button
                  className="bg-[#2d2d2d] border-[#404040] text-white hover:bg-[#3d3d3d]"
                  onClick={() => {
                    void copyToClipboard(referralLink, 'link');
                  }}
                >
                  Скопировать
                </Button>
              </div>
            </div>

            <p className="text-xs text-[#808080]">
              Поделитесь ссылкой в соцсетях, мессенджерах или по email — каждое оформление подписки принесёт вам бонус.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsShareModalOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white">Готово</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
