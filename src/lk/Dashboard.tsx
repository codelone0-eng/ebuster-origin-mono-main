import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ParticleBackground } from '@/components/ParticleBackground';
import { BanGuard } from '@/components/BanGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GradientButton } from '@/components/ui/gradient-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarUpload } from '@/components/AvatarUpload';
import { Switch } from '@/components/ui/switch';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { ChangeEmailModal } from '@/components/ChangeEmailModal';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import ScriptsList from '@/components/ScriptsList';
import { 
  Library, 
  Download, 
  Headphones, 
  Settings, 
  User,
  Shield,
  Bell,
  Key,
  Mail,
  Smartphone,
  QrCode,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
  Edit,
  Upload,
  Download as DownloadIcon,
  Star,
  Calendar,
  MessageSquare,
  Paperclip,
  Tag,
  UserCheck,
  Lock,
  Unlock,
  RefreshCw,
  LogOut,
  Crown
} from 'lucide-react';

// Имя/почта берутся из авторизации; мок оставлен как дефолт
const defaultUser = {
  id: 0,
  name: "Пользователь",
  email: "",
  avatar: "/api/placeholder/40/40",
  plan: "free",
  joinDate: "",
  lastLogin: "",
  twoFactorEnabled: false,
  twoFactorMethod: ""
};

const mockScripts = [
  {
    id: 1,
    name: "Auto Form Filler",
    description: "Автоматически заполняет формы на веб-сайтах",
    version: "1.2.3",
    author: "EBUSTER Team",
    downloads: 15420,
    rating: 4.8,
    category: "Productivity",
    tags: ["forms", "automation", "productivity"],
    size: "2.1 MB",
    lastUpdated: "2024-01-18",
    isInstalled: false,
    isFeatured: true
  },
  {
    id: 2,
    name: "Dark Mode Enforcer",
    description: "Принудительно включает темную тему на всех сайтах",
    version: "2.0.1",
    author: "DarkDev",
    downloads: 8930,
    rating: 4.6,
    category: "UI/UX",
    tags: ["dark-mode", "ui", "accessibility"],
    size: "1.8 MB",
    lastUpdated: "2024-01-19",
    isInstalled: true,
    isFeatured: false
  },
  {
    id: 3,
    name: "Password Generator Pro",
    description: "Генерирует безопасные пароли и сохраняет их",
    version: "1.5.0",
    author: "SecurityGuru",
    downloads: 22100,
    rating: 4.9,
    category: "Security",
    tags: ["password", "security", "generator"],
    size: "3.2 MB",
    lastUpdated: "2024-01-17",
    isInstalled: true,
    isFeatured: true
  }
];

const mockTickets = [
  {
    id: 1,
    subject: "Проблема с установкой скрипта",
    description: "Не могу установить скрипт Auto Form Filler, выдает ошибку при загрузке",
    status: "open",
    priority: "high",
    category: "technical",
    createdAt: "2024-01-20T09:15:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    attachments: ["error_log.txt", "screenshot.png"],
    messages: [
      {
        id: 1,
        author: "Александр Петров",
        message: "Не могу установить скрипт Auto Form Filler, выдает ошибку при загрузке",
        timestamp: "2024-01-20T09:15:00Z",
        isUser: true
      },
      {
        id: 2,
        author: "Support Team",
        message: "Здравствуйте! Мы получили ваш запрос. Пожалуйста, приложите скриншот ошибки и логи для более детального анализа.",
        timestamp: "2024-01-20T10:30:00Z",
        isUser: false
      }
    ]
  },
  {
    id: 2,
    subject: "Запрос на новую функцию",
    description: "Хотелось бы добавить возможность экспорта настроек скриптов",
    status: "in_progress",
    priority: "medium",
    category: "feature_request",
    createdAt: "2024-01-18T16:45:00Z",
    updatedAt: "2024-01-19T11:20:00Z",
    attachments: [],
    messages: [
      {
        id: 3,
        author: "Александр Петров",
        message: "Хотелось бы добавить возможность экспорта настроек скриптов",
        timestamp: "2024-01-18T16:45:00Z",
        isUser: true
      },
      {
        id: 4,
        author: "Product Team",
        message: "Спасибо за предложение! Мы добавили эту функцию в наш roadmap. Ожидайте обновления в следующем релизе.",
        timestamp: "2024-01-19T11:20:00Z",
        isUser: false
      }
    ]
  },
  {
    id: 3,
    subject: "Проблема с производительностью",
    description: "Скрипт Dark Mode Enforcer замедляет работу браузера",
    status: "resolved",
    priority: "high",
    category: "bug_report",
    createdAt: "2024-01-15T12:00:00Z",
    updatedAt: "2024-01-16T15:45:00Z",
    attachments: ["performance_report.pdf"],
    messages: [
      {
        id: 5,
        author: "Александр Петров",
        message: "Скрипт Dark Mode Enforcer замедляет работу браузера",
        timestamp: "2024-01-15T12:00:00Z",
        isUser: true
      },
      {
        id: 6,
        author: "Dev Team",
        message: "Проблема была исправлена в версии 2.0.1. Пожалуйста, обновите скрипт до последней версии.",
        timestamp: "2024-01-16T15:45:00Z",
        isUser: false
      }
    ]
  }
];

const Dashboard = () => {
  return (
    <BanGuard>
      <DashboardContent />
    </BanGuard>
  );
};

import { useAuth } from '@/contexts/CustomAuthContext';

const DashboardContent = () => {
  const { t, language } = useLanguage();
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  
  // Функция для загрузки профиля из public.users
  const loadUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token || !authUser?.email) {
        return;
      }

      const baseUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : 'https://ebuster.ru';
      
      const response = await fetch(`${baseUrl}/api/user/profile?email=${encodeURIComponent(authUser.email)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          setUser(prev => ({
            ...prev,
            name: data.data.full_name || prev.name,
            email: data.data.email || prev.email,
            avatar: data.data.avatar_url || prev.avatar
          }));
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }, [authUser?.email]);
  const [activeTab, setActiveTab] = useState(() => {
    // Получаем активную вкладку из URL параметров или localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    const savedTab = localStorage.getItem('dashboardActiveTab');
    return tabFromUrl || savedTab || "scripts";
  });
  const [user, setUser] = useState(() => ({
    ...defaultUser,
    name: authUser?.full_name || authUser?.email?.split('@')[0] || defaultUser.name,
    email: authUser?.email || defaultUser.email,
  }));

  useEffect(() => {
    setUser((prev) => ({
      ...prev,
      name: authUser?.full_name || authUser?.email?.split('@')[0] || prev.name,
      email: authUser?.email || prev.email,
      avatar: authUser?.avatar_url || prev.avatar,
    }));
    
    // Загружаем актуальный профиль из public.users
    if (authUser?.email) {
      loadUserProfile();
    }
  }, [authUser, loadUserProfile]);
  const [scripts, setScripts] = useState(mockScripts);
  const [tickets, setTickets] = useState(mockTickets);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [isAutoUpdateEnabled, setIsAutoUpdateEnabled] = useState(true);
  const [isNewScriptNotificationsEnabled, setIsNewScriptNotificationsEnabled] = useState(true);
  const [isUpdateNotificationsEnabled, setIsUpdateNotificationsEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Функция для изменения активной вкладки с сохранением в URL и localStorage
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem('dashboardActiveTab', tab);
    
    // Обновляем URL без перезагрузки страницы
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  };

  // Обработка URL параметров при загрузке страницы
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
      localStorage.setItem('dashboardActiveTab', tabFromUrl);
    }
  }, []);

  // Сохранение профиля через наш кастомный API
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      
      // Получаем токен из localStorage
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        toast({
          title: "Ошибка авторизации",
          description: "Токен не найден. Пожалуйста, войдите в систему заново.",
          variant: "destructive"
        });
        return;
      }

      // Вызываем наш кастомный API для обновления профиля
      const baseUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : 'https://ebuster.ru';
      const requestData = {
        id: authUser?.id || 'dummy-id', // ID не важен, генерируется UUID
        email: authUser?.email,
        full_name: user.name,
        avatar_url: user.avatar
      };
      
      const response = await fetch(`${baseUrl}/api/user/upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Обновляем локально
        setUser((prev) => ({ 
          ...prev, 
          name: data.data?.full_name || prev.name, 
          avatar: data.data?.avatar_url || prev.avatar 
        }));
        
        // Перезагружаем профиль чтобы получить актуальные данные
        setTimeout(() => {
          loadUserProfile();
        }, 100);
        
        // Показываем уведомление об успехе
        toast({
          title: "Профиль обновлен",
          description: "Изменения сохранены успешно",
          variant: "success"
        });
      } else {
        // Показываем уведомление об ошибке
        toast({
          title: "Ошибка сохранения",
          description: data.error || "Не удалось сохранить изменения",
          variant: "destructive"
        });
      }
    } catch (error) {
      // Показываем уведомление об ошибке
      toast({
        title: "Ошибка сохранения",
        description: "Произошла ошибка при сохранении профиля",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter scripts based on search query
  const filteredScripts = scripts.filter(script =>
    script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    script.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    script.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Функция для правильного склонения слова "загрузок"
  const getDownloadsText = (count: number) => {
    if (count === 1) {
      return t('header.dashboard.tickets.download');
    } else if (count >= 2 && count <= 4) {
      return t('header.dashboard.tickets.downloads2');
    } else {
      return t('header.dashboard.tickets.downloads');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'closed': return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-600 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    const locale = language === 'ru' ? 'ru-RU' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <div className="relative z-content">
      <Header />

        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {t('header.dashboard.title')}
                </h1>
                <p className="text-muted-foreground">{t('header.dashboard.welcome')} {user.name}!</p>
              </div>
              <div className="flex items-center gap-4">
                {user.plan === 'premium' ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-sm"></div>
                    <Badge className="relative bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 px-4 py-2 text-sm font-bold shadow-lg">
                      <Crown className="h-4 w-4 mr-2" />
                      PREMIUM
                    </Badge>
                  </div>
                ) : (
                  <Badge variant="secondary" className="px-3 py-1">
                    {t('header.dashboard.plan.free')}
                  </Badge>
                )}
                <Avatar className="h-12 w-12">
                  <AvatarImage src={authUser?.avatar_url || user.avatar} />
                  <AvatarFallback>
                    {user.name.includes(' ') 
                      ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
                      : user.name.substring(0, 2).toUpperCase()
                    }
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="scripts" className="flex items-center gap-2">
                <Library className="h-4 w-4" />
                {t('header.dashboard.tabs.scripts')}
              </TabsTrigger>
              <TabsTrigger value="installed" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                {t('header.dashboard.tabs.installed')}
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-2">
                <Headphones className="h-4 w-4" />
                {t('header.dashboard.tabs.support')}
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('header.dashboard.tabs.profile')}
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t('header.dashboard.tabs.settings')}
              </TabsTrigger>
            </TabsList>

            {/* Библиотека скриптов */}
            <TabsContent value="scripts" className="space-y-6">
              <ScriptsList />
            </TabsContent>

            {/* Установленные скрипты */}
            <TabsContent value="installed" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">{t('header.dashboard.tabs.installed')}</h2>
                <GradientButton className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t('header.dashboard.installed.addScript')}
                </GradientButton>
              </div>

              <div className="space-y-4">
                {scripts.filter(script => script.isInstalled).map((script) => (
                  <Card key={script.id} className="group hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Library className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{script.name}</h3>
                            <p className="text-sm text-muted-foreground">{script.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span>v{script.version}</span>
                              <span>•</span>
                              <span>{t('header.dashboard.scripts.updated')} {formatDate(script.lastUpdated)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                              <GradientButton 
                                variant="outline"
                                size="sm"
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                {t('header.dashboard.installed.configure')}
                              </GradientButton>
                          <GradientButton 
                            variant="outline"
                            size="sm"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            {t('header.dashboard.installed.update')}
                          </GradientButton>
                          <GradientButton 
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            {t('header.dashboard.installed.remove')}
                          </GradientButton>
                    </div>
                  </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Поддержка */}
            <TabsContent value="support" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">{t('header.dashboard.tabs.support')}</h2>
                <GradientButton className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t('header.dashboard.support.createTicket')}
                </GradientButton>
            </div>

              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <Card key={ticket.id} className="group hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status === 'open' ? t('header.dashboard.tickets.openStatus') : 
                               ticket.status === 'in_progress' ? t('header.dashboard.tickets.inProgress') :
                               ticket.status === 'resolved' ? t('header.dashboard.tickets.resolved') : t('header.dashboard.tickets.closed')}
                            </Badge>
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority === 'high' ? t('header.dashboard.tickets.high') : 
                               ticket.priority === 'medium' ? t('header.dashboard.tickets.medium') : t('header.dashboard.tickets.low')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{ticket.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{t('header.dashboard.tickets.created')} {formatDate(ticket.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{t('header.dashboard.tickets.updated')} {formatDate(ticket.updatedAt)}</span>
                            </div>
                            {ticket.attachments.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                <span>{ticket.attachments.length} {t('header.dashboard.tickets.attachments')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 text-primary hover:from-primary/20 hover:to-accent/20 hover:border-primary/50"
                            asChild
                          >
                            <Link to={`/ticket/${ticket.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('header.dashboard.tickets.open')}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                    </div>
            </TabsContent>

            {/* Профиль */}
            <TabsContent value="profile" className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">{t('header.dashboard.profile.personalInfo')}</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {t('header.dashboard.profile.personalInfo')}
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <AvatarUpload 
                      currentAvatar={authUser?.avatar_url || user.avatar}
                      onAvatarUpdate={(avatarUrl) => {
                        setUser(prev => ({ ...prev, avatar: avatarUrl }));
                      }}
                    />
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-foreground">{t('header.dashboard.profile.name')}</label>
                        <Input
                          type="text"
                          value={user.name}
                          onChange={(e) => setUser((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">{t('header.dashboard.profile.email')}</label>
                        <Input
                          type="email"
                          value={user.email}
                          onChange={(e) => setUser((prev) => ({ ...prev, email: e.target.value }))}
                          className="w-full mt-1"
                          disabled
                        />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleSaveProfile} disabled={isSaving}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      {isSaving ? t('header.dashboard.settings.saving') : t('header.dashboard.settings.saveChanges')}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {t('header.dashboard.settings.security')}
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                          <GradientButton 
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => setIsChangePasswordOpen(true)}
                          >
                            <Key className="h-4 w-4 mr-2" />
                            {t('header.dashboard.settings.changePassword')}
                          </GradientButton>
                      <GradientButton 
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setIsChangeEmailOpen(true)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {t('header.dashboard.settings.changeEmail')}
                      </GradientButton>
                      <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{t('header.dashboard.settings.twoFactorAuth')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={is2FAEnabled}
                            onCheckedChange={setIs2FAEnabled}
                          />
                          <span className="text-sm text-muted-foreground">
                            {is2FAEnabled ? t('header.dashboard.settings.enabled') : t('header.dashboard.settings.disabled')}
                          </span>
              </div>
            </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('header.dashboard.settings.logoutAll')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Настройки */}
            <TabsContent value="settings" className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">{t('header.dashboard.tabs.settings')}</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      {t('header.dashboard.settings.general')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{t('header.dashboard.settings.autoUpdate')}</h4>
                        <p className="text-sm text-muted-foreground">{t('header.dashboard.settings.autoUpdateDesc')}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{t('header.dashboard.settings.newScripts')}</h4>
                        <p className="text-sm text-muted-foreground">{t('header.dashboard.settings.newScriptsDesc')}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{t('header.dashboard.settings.updateNotifications')}</h4>
                        <p className="text-sm text-muted-foreground">{t('header.dashboard.settings.updateNotificationsDesc')}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {t('header.dashboard.settings.twoFactorAuth')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">{t('header.dashboard.settings.request2FA')}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{t('header.dashboard.settings.accountLogin')}</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{t('header.dashboard.settings.passwordChange')}</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{t('header.dashboard.settings.emailChange')}</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{t('header.dashboard.settings.accountDeletion')}</span>
                          <Switch defaultChecked />
          </div>
        </div>
      </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">{t('header.dashboard.settings.methods2FA')}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-primary" />
                            <span className="text-sm">{t('header.dashboard.settings.telegramBot')}</span>
                          </div>
                          <Badge variant="default">{t('header.dashboard.settings.active')}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                          <div className="flex items-center gap-2">
                            <QrCode className="h-4 w-4 text-primary" />
                            <span className="text-sm">{t('header.dashboard.settings.googleAuth')}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            {t('header.dashboard.settings.configure')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <Footer />
        
        {/* Modals */}
        <ChangePasswordModal 
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
        <ChangeEmailModal 
          isOpen={isChangeEmailOpen}
          onClose={() => setIsChangeEmailOpen(false)}
          currentEmail={user.email}
        />
      </div>
    </div>
  );
};

export default Dashboard;
