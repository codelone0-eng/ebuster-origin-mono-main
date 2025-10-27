import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { API_CONFIG } from '@/config/api';
import { 
  Shield, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  Mail,
  ArrowLeft,
  FileText
} from 'lucide-react';

interface BanInfo {
  ban_id: string;
  reason: string;
  ban_type: 'temporary' | 'permanent';
  created_at: string;
  unban_date: string | null;
  duration_hour: number | null;
  contact_email: string;
}

const BanPage = () => {
  const [banInfo, setBanInfo] = useState<BanInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanInfo = async () => {
      try {
        const token = localStorage.getItem('ebuster_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/user/ban-info`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setBanInfo(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching ban info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanInfo();
  }, []);

  // Mock данные как fallback
  const defaultBanInfo = {
    reason: "Нарушение правил сообщества",
    banDate: new Date().toISOString(),
    unbanDate: null,
    banType: "Постоянная блокировка",
    banDuration: "Бессрочно",
    remainingDays: 0,
    contactEmail: "support@ebuster.ru",
    banId: "N/A",
    moderator: "Администратор системы",
    totalDays: 0
  };

  const calculateRemainingDays = (unbanDate: string | null) => {
    if (!unbanDate) return 0;
    const now = new Date();
    const unban = new Date(unbanDate);
    const diff = unban.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const calculateDuration = (hours: number | null) => {
    if (!hours) return 'Бессрочно';
    if (hours < 24) return `${hours} часов`;
    const days = Math.floor(hours / 24);
    return `${days} дней`;
  };

  const displayBanInfo = banInfo ? {
    reason: banInfo.reason,
    banDate: banInfo.created_at,
    unbanDate: banInfo.unban_date,
    banType: banInfo.ban_type === 'temporary' ? 'Временная блокировка' : 'Постоянная блокировка',
    banDuration: calculateDuration(banInfo.duration_hour),
    remainingDays: calculateRemainingDays(banInfo.unban_date),
    contactEmail: banInfo.contact_email || 'support@ebuster.ru',
    banId: banInfo.ban_id,
    moderator: 'Администратор системы',
    totalDays: banInfo.duration_hour ? Math.floor(banInfo.duration_hour / 24) : 0
  } : defaultBanInfo;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBanTypeColor = (type: string) => {
    switch (type) {
      case 'Временная блокировка':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'Постоянная блокировка':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-muted text-muted-foreground content-border';
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <div className="relative z-content">
        <Header />
        
        <div className="container mx-auto max-w-4xl px-4 py-16">
          {/* Заголовок */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Аккаунт заблокирован
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ваш аккаунт был временно заблокирован за нарушение правил сообщества
            </p>
          </div>

          {/* Основная информация о бане */}
          <Card className="mb-8 bg-card/50 backdrop-blur-sm border content-border-30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Информация о блокировке
              </CardTitle>
              <CardDescription>
                Детали блокировки вашего аккаунта
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Тип блокировки */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Тип блокировки</p>
                    <p className="text-lg font-semibold text-primary">{displayBanInfo.banType}</p>
                  </div>
                </div>
                
                {/* Дополнительная информация */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t content-border-30">
                  <div>
                    <p className="text-xs text-muted-foreground">ID блокировки</p>
                    <p className="text-sm font-medium text-foreground">{displayBanInfo.banId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Длительность</p>
                    <p className="text-sm font-medium text-foreground">{displayBanInfo.banDuration}</p>
                  </div>
                </div>
              </div>

              {/* Причина */}
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-2">Причина блокировки:</span>
                <div className="p-4 bg-muted/30 rounded-lg border content-border-50">
                  <p className="text-foreground">{displayBanInfo.reason}</p>
                </div>
              </div>

              {/* Даты */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Дата блокировки</p>
                    <p className="text-foreground font-medium">{displayBanInfo.banDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Дата разблокировки</p>
                    <p className="text-foreground font-medium">{displayBanInfo.unbanDate}</p>
                  </div>
                </div>
              </div>

              {/* Оставшиеся дни */}
              <div className="p-6 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Осталось дней до разблокировки:</p>
                  <p className="text-3xl font-bold text-primary">{displayBanInfo.remainingDays}</p>
                </div>
                
                {/* Прогресс-бар */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0 дней</span>
                    <span>{displayBanInfo.totalDays || 30} дней</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${displayBanInfo.totalDays > 0 ? (((displayBanInfo.totalDays - displayBanInfo.remainingDays) / displayBanInfo.totalDays) * 100) : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-xs text-muted-foreground">
                    Прогресс блокировки: {displayBanInfo.totalDays > 0 ? Math.round(((displayBanInfo.totalDays - displayBanInfo.remainingDays) / displayBanInfo.totalDays) * 100) : 0}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Что делать дальше */}
          <Card className="mb-8 bg-card/50 backdrop-blur-sm border content-border-30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Что делать дальше?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Ожидайте окончания срока блокировки</p>
                    <p className="text-sm text-muted-foreground">Ваш аккаунт будет автоматически разблокирован {displayBanInfo.unbanDate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Обратитесь в поддержку</p>
                    <p className="text-sm text-muted-foreground">Если считаете блокировку несправедливой, напишите в поддержку</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Изучите правила сообщества</p>
                    <p className="text-sm text-muted-foreground">Ознакомьтесь с правилами, чтобы избежать повторных нарушений</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Контакты поддержки */}
          <Card className="mb-8 bg-card/50 backdrop-blur-sm border content-border-30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Контакты поддержки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Если у вас есть вопросы по поводу блокировки или вы хотите обжаловать решение, 
                  обратитесь в службу поддержки:
                </p>
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email поддержки</p>
                    <a 
                      href={`mailto:${displayBanInfo.contactEmail}`}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      {displayBanInfo.contactEmail}
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" className="flex items-center gap-2">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Вернуться на главную
              </Link>
            </Button>
            
            <Button asChild variant="default" className="flex items-center gap-2">
              <a href={`mailto:${displayBanInfo.contactEmail}?subject=Обжалование блокировки аккаунта`}>
                <Mail className="h-4 w-4" />
                Написать в поддержку
              </a>
            </Button>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default BanPage;
