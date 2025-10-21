import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/config/api';
import {
  Users,
  DollarSign,
  TrendingUp,
  Search,
  Edit,
  CheckCircle,
  XCircle,
  Award,
  Link as LinkIcon
} from 'lucide-react';

interface ReferralCode {
  id: string;
  code: string;
  user: {
    email: string;
    full_name: string;
  };
  uses_count: number;
  max_uses: number | null;
  discount_type: string;
  discount_value: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  stats: {
    total_referrals: number;
    total_earnings: number;
  }[];
}

interface ReferralUse {
  id: string;
  referrer: {
    email: string;
    full_name: string;
  };
  referred: {
    email: string;
    full_name: string;
  };
  subscription: {
    plan: string;
    status: string;
  } | null;
  reward_value: number;
  reward_status: string;
  created_at: string;
}

interface SystemStats {
  totalCodes: number;
  activeCodes: number;
  totalUses: number;
  topReferrers: Array<{
    user: {
      email: string;
      full_name: string;
    };
    total_referrals: number;
    total_earnings: number;
  }>;
}

export const ReferralManagement: React.FC = () => {
  const { toast } = useToast();
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [uses, setUses] = useState<ReferralUse[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCode, setSelectedCode] = useState<ReferralCode | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'codes' | 'uses' | 'stats'>('codes');

  const [editForm, setEditForm] = useState({
    discount_value: 0,
    max_uses: null as number | null,
    is_active: true,
    expires_at: null as string | null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [codesRes, usesRes, statsRes] = await Promise.all([
        fetch(`${API_CONFIG.ADMIN_URL}/referral/admin/codes`),
        fetch(`${API_CONFIG.ADMIN_URL}/referral/admin/uses`),
        fetch(`${API_CONFIG.ADMIN_URL}/referral/admin/stats`)
      ]);

      const codesData = await codesRes.json();
      const usesData = await usesRes.json();
      const statsData = await statsRes.json();

      if (codesData.success) setCodes(codesData.data.codes);
      if (usesData.success) setUses(usesData.data.uses);
      if (statsData.success) setSystemStats(statsData.data);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCode = (code: ReferralCode) => {
    setSelectedCode(code);
    setEditForm({
      discount_value: code.discount_value,
      max_uses: code.max_uses,
      is_active: code.is_active,
      expires_at: code.expires_at
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCode = async () => {
    if (!selectedCode) return;

    try {
      const response = await fetch(`${API_CONFIG.ADMIN_URL}/referral/admin/codes/${selectedCode.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Реферальный код обновлен'
        });
        setIsEditDialogOpen(false);
        loadData();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить код',
        variant: 'destructive'
      });
    }
  };

  const filteredCodes = codes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h2 className="text-3xl font-bold">Управление реферальной системой</h2>
        <p className="text-muted-foreground mt-2">
          Мониторинг и управление реферальной программой
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего кодов</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalCodes || 0}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats?.activeCodes || 0} активных
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Использований</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalUses || 0}</div>
            <p className="text-xs text-muted-foreground">
              Всего регистраций
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Конверсия</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStats?.totalCodes && systemStats?.totalUses
                ? ((systemStats.totalUses / systemStats.totalCodes) * 100).toFixed(1)
                : '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Средняя по системе
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Топ реферер</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStats?.topReferrers?.[0]?.total_referrals || 0}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {systemStats?.topReferrers?.[0]?.user.email || 'Нет данных'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Табы */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'codes' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('codes')}
        >
          Реферальные коды
        </Button>
        <Button
          variant={activeTab === 'uses' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('uses')}
        >
          Использования
        </Button>
        <Button
          variant={activeTab === 'stats' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('stats')}
        >
          Топ рефереров
        </Button>
      </div>

      {/* Реферальные коды */}
      {activeTab === 'codes' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Реферальные коды</CardTitle>
                <CardDescription>Управление кодами пользователей</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCodes.map((code) => (
                <div
                  key={code.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-lg">{code.code}</span>
                      <Badge variant={code.is_active ? 'default' : 'secondary'}>
                        {code.is_active ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>{code.user.email} {code.user.full_name && `(${code.user.full_name})`}</p>
                      <div className="flex gap-4 mt-1">
                        <span>Использований: {code.uses_count}{code.max_uses ? `/${code.max_uses}` : ''}</span>
                        <span>Скидка: {code.discount_value}%</span>
                        <span>Рефералов: {code.stats?.[0]?.total_referrals || 0}</span>
                        <span>Заработано: ${code.stats?.[0]?.total_earnings?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCode(code)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Использования */}
      {activeTab === 'uses' && (
        <Card>
          <CardHeader>
            <CardTitle>История использований</CardTitle>
            <CardDescription>Все регистрации по реферальным ссылкам</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uses.map((use) => (
                <div
                  key={use.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{use.referred.email}</span>
                      <span className="text-muted-foreground">←</span>
                      <span className="text-sm text-muted-foreground">{use.referrer.email}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{new Date(use.created_at).toLocaleDateString('ru-RU')}</span>
                      {use.subscription && (
                        <Badge variant={use.subscription.status === 'active' ? 'default' : 'secondary'}>
                          {use.subscription.plan}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          use.reward_status === 'paid' ? 'default' :
                          use.reward_status === 'pending' ? 'secondary' :
                          'outline'
                        }
                      >
                        {use.reward_status === 'paid' ? 'Выплачено' :
                         use.reward_status === 'pending' ? 'Ожидает' :
                         'Отменено'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">
                      +${use.reward_value.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Топ рефереров */}
      {activeTab === 'stats' && (
        <Card>
          <CardHeader>
            <CardTitle>Топ-10 рефереров</CardTitle>
            <CardDescription>Самые активные участники программы</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemStats?.topReferrers?.map((referrer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{referrer.user.email}</p>
                      {referrer.user.full_name && (
                        <p className="text-sm text-muted-foreground">{referrer.user.full_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{referrer.total_referrals}</div>
                    <div className="text-sm text-muted-foreground">
                      ${referrer.total_earnings.toFixed(2)} заработано
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать реферальный код</DialogTitle>
            <DialogDescription>
              Изменение параметров кода {selectedCode?.code}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Скидка (%)</Label>
              <Input
                type="number"
                value={editForm.discount_value}
                onChange={(e) => setEditForm({ ...editForm, discount_value: Number(e.target.value) })}
                min="0"
                max="100"
              />
            </div>
            <div>
              <Label>Максимум использований</Label>
              <Input
                type="number"
                value={editForm.max_uses || ''}
                onChange={(e) => setEditForm({ ...editForm, max_uses: e.target.value ? Number(e.target.value) : null })}
                placeholder="Без ограничений"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editForm.is_active}
                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
              />
              <Label htmlFor="is_active">Активен</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleUpdateCode}>
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
