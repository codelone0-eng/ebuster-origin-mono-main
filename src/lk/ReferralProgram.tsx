import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/config/api';
import {
  Users,
  DollarSign,
  Copy,
  Check,
  Gift,
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

export const ReferralProgram: React.FC<{ userId: string }> = ({ userId }) => {
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralLink = referralCode 
    ? `https://ebuster.ru/register?ref=${referralCode.code}`
    : '';

  useEffect(() => {
    loadReferralData();
  }, [userId]);

  const loadReferralData = async () => {
    try {
      setLoading(true);

      const [codeRes, statsRes, referralsRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/api/referral/user/${userId}/code`),
        fetch(`${API_CONFIG.BASE_URL}/api/referral/user/${userId}/stats`),
        fetch(`${API_CONFIG.BASE_URL}/api/referral/user/${userId}/referrals`)
      ]);

      const codeData = await codeRes.json();
      const statsData = await statsRes.json();
      const referralsData = await referralsRes.json();

      if (codeData.success) setReferralCode(codeData.data);
      if (statsData.success) setStats(statsData.data);
      if (referralsData.success) setReferrals(referralsData.data);
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

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Присоединяйся к Ebuster!',
          text: `Используй мой реферальный код ${referralCode?.code} и получи скидку ${referralCode?.discount_value}%!`,
          url: referralLink
        });
      } catch (error) {
        console.error('Ошибка при шаринге:', error);
      }
    } else {
      copyToClipboard(referralLink, 'link');
    }
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
            <div className="text-2xl font-bold">${stats?.total_earnings.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              ${stats?.paid_earnings.toFixed(2) || '0.00'} выплачено
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ожидает выплаты</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.pending_earnings.toFixed(2) || '0.00'}</div>
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
            <div className="text-2xl font-bold">{stats?.conversion_rate.toFixed(1) || '0.0'}%</div>
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
            Поделитесь кодом или ссылкой с друзьями. Они получат скидку {referralCode?.discount_value}%, 
            а вы — {referralCode?.discount_value}% от их платежей
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={referralCode?.code || ''}
              readOnly
              className="font-mono text-lg"
            />
            <Button
              onClick={() => copyToClipboard(referralCode?.code || '', 'code')}
              variant="outline"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="text-sm"
            />
            <Button
              onClick={() => copyToClipboard(referralLink, 'link')}
              variant="outline"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button onClick={shareLink} variant="default">
              <Share2 className="h-4 w-4 mr-2" />
              Поделиться
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gift className="h-4 w-4" />
            <span>Использований: {referralCode?.uses_count || 0}</span>
            {referralCode?.max_uses && (
              <span>/ {referralCode.max_uses}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Список рефералов */}
      <Card>
        <CardHeader>
          <CardTitle>Ваши рефералы</CardTitle>
          <CardDescription>
            Список пользователей, зарегистрировавшихся по вашей ссылке
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
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{referral.referred_user.email}</p>
                      {referral.referred_user.full_name && (
                        <span className="text-sm text-muted-foreground">
                          ({referral.referred_user.full_name})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(referral.created_at).toLocaleDateString('ru-RU')}
                      </span>
                      {referral.subscription && (
                        <Badge variant={referral.subscription.status === 'active' ? 'default' : 'secondary'}>
                          {referral.subscription.plan}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">
                      +${referral.reward_value.toFixed(2)}
                    </div>
                    <Badge
                      variant={
                        referral.reward_status === 'paid' ? 'default' :
                        referral.reward_status === 'pending' ? 'secondary' :
                        'outline'
                      }
                      className="mt-1"
                    >
                      {referral.reward_status === 'paid' ? 'Выплачено' :
                       referral.reward_status === 'pending' ? 'Ожидает' :
                       'Отменено'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
};
