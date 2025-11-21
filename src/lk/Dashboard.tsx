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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { ChangePasswordWithOtpModal } from '@/components/ChangePasswordWithOtpModal';
import { ChangeEmailModal } from '@/components/ChangeEmailModal';
import { TwoFactorSetupModal } from '@/components/TwoFactorSetupModal';
import { AvatarUpload } from '@/components/AvatarUpload';
import { ReferralProgram } from './ReferralProgram';
import { useLanguage } from '@/hooks/useLanguage';
import { TicketsSystem } from './TicketsSystem';
import { ScriptChangelog } from './ScriptChangelog';
import { LoginHistory } from './LoginHistory';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/config/api';
import ScriptsList from '@/components/ScriptsList';
import { ApiKeysManagement } from '@/components/ApiKeysManagement';
import { cn } from '@/lib/utils';
import VisualScriptBuilder from './VisualScriptBuilder';
import { 
  Library, 
  Download, 
  Headphones, 
  Settings, 
  User,
  FileText,
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
  Crown,
  ChevronRight,
  ChevronDown,
  Blocks
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
      const token = localStorage.getItem('ebuster_token');
      if (!token || !authUser?.email) {
        return;
      }

      const response = await fetch(`${API_CONFIG.USER_URL}/profile?email=${encodeURIComponent(authUser.email)}`, {
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
            avatar: data.data.avatar_url || prev.avatar,
            plan: data.data.subscription_plan || prev.plan,
            twoFactorEnabled: data.data.two_factor_enabled || false
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
  
  // Синхронизируем is2FAEnabled с user.twoFactorEnabled
  useEffect(() => {
    setIs2FAEnabled(user.twoFactorEnabled);
  }, [user.twoFactorEnabled]);
  
  const [scripts, setScripts] = useState(mockScripts);
  const [installedScripts, setInstalledScripts] = useState([]);
    const [changelogScript, setChangelogScript] = useState<{ id: string; name: string } | null>(null);
  
  // Загрузка установленных скриптов
  useEffect(() => {
    const loadInstalledScripts = async () => {
      try {
        const token = localStorage.getItem('ebuster_token');
        if (!token || !authUser?.id) return;
        
        console.log('🔍 Загружаем установленные скрипты для пользователя:', authUser.id);
        
        const response = await fetch('https://api.ebuster.ru/api/scripts/user/installed', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('📦 Ответ от API:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Данные установленных скриптов:', data);
          if (data.success && data.data) {
            // Фильтруем null скрипты на клиенте тоже
            let installedScripts = data.data.filter((item: any) => item.script !== null && item.script !== undefined);
            
            // Проверяем наличие скриптов в расширении
            if ((window as any).EbusterBridge) {
              try {
                const extensionScripts = await new Promise<any[]>((resolve) => {
                  (window as any).EbusterBridge.sendMessage(
                    { action: 'GET_INSTALLED_SCRIPTS' },
                    (response: any, error: any) => {
                      if (error) {
                        console.error('❌ [Dashboard] Ошибка получения скриптов:', error);
                        resolve([]);
                      } else {
                        resolve(Array.isArray(response) ? response : []);
                      }
                    }
                  );
                });
                console.log('📦 [Dashboard] Скрипты в расширении:', extensionScripts);
                
                // Оставляем только те скрипты, которые есть в расширении с source="Установлено с сайта"
                const validScripts = installedScripts.filter((item: any) => 
                  extensionScripts.some((s: any) => 
                    s.id === item.script_id && s.source === 'Установлено с сайта'
                  )
                );
                
                if (validScripts.length !== installedScripts.length) {
                  console.log('⚠️ [Dashboard] Расхождение! На сервере:', installedScripts.length, 'В расширении:', validScripts.length);
                  
                  // Синхронизируем с сервером
                  await fetch('https://api.ebuster.ru/api/scripts/user/sync', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      scriptIds: extensionScripts
                        .filter((s: any) => s.source === 'Установлено с сайта')
                        .map((s: any) => s.id)
                    })
                  });
                  
                  installedScripts = validScripts;
                }
              } catch (error) {
                console.error('❌ [Dashboard] Ошибка проверки расширения:', error);
              }
            }
            
            setInstalledScripts(installedScripts);
          } else {
            console.warn('⚠️ [Dashboard] Некорректный ответ API:', data);
            setInstalledScripts([]);
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('❌ Ошибка загрузки скриптов:', response.status, errorData);
          setInstalledScripts([]); // Устанавливаем пустой массив вместо undefined
          
          toast({
            title: 'Ошибка загрузки скриптов',
            description: errorData.error || 'Не удалось загрузить установленные скрипты',
            variant: 'destructive'
          });
        }
      } catch (error: any) {
        console.error('❌ Failed to load installed scripts:', error);
        setInstalledScripts([]); // Устанавливаем пустой массив вместо undefined
        
        toast({
          title: 'Ошибка загрузки скриптов',
          description: error.message || 'Произошла ошибка при загрузке скриптов',
          variant: 'destructive'
        });
      }
    };
    
    if (authUser?.id) {
      loadInstalledScripts();
    }
  }, [authUser?.id]);
  
  // Слушатель событий от расширения для синхронизации удаления и установки
  useEffect(() => {
    const handleExtensionSync = async (event: MessageEvent) => {
      // Событие установки скрипта
      if (event.data?.type === 'EBUSTER_SCRIPT_INSTALLED') {
        console.log('✅ [Dashboard] Получено событие установки скрипта:', event.data.scriptId);
        // Перезагружаем список установленных скриптов
        setTimeout(() => {
          const token = localStorage.getItem('ebuster_token');
          if (token && authUser?.id) {
            fetch('https://api.ebuster.ru/api/scripts/user/installed', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
            .then(res => res.json())
            .then(data => {
              if (data.success && data.data) {
                const filtered = data.data.filter((item: any) => item.script !== null && item.script !== undefined);
                setInstalledScripts(filtered);
                console.log('✅ [Dashboard] Список установленных скриптов обновлен');
              } else {
                setInstalledScripts([]);
              }
            })
            .catch(err => {
              console.error('❌ [Dashboard] Ошибка обновления списка:', err);
              setInstalledScripts([]);
            });
          }
        }, 300);
      }
      
      // Событие удаления скрипта
      if (event.data?.type === 'EBUSTER_SCRIPT_UNINSTALLED') {
        const { scriptId } = event.data;
        console.log('🗑️ [Dashboard] Получено событие удаления скрипта:', scriptId);
        
        // Удаляем на сервере
        try {
          const token = localStorage.getItem('ebuster_token');
          if (token && authUser?.id) {
            await fetch(`https://api.ebuster.ru/api/scripts/user/uninstall/${scriptId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            console.log('✅ [Dashboard] Скрипт удален на сервере');
            
            // Перезагружаем список установленных скриптов
            const response = await fetch('https://api.ebuster.ru/api/scripts/user/installed', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                const filtered = data.data.filter((item: any) => item.script !== null && item.script !== undefined);
                setInstalledScripts(filtered);
              } else {
                setInstalledScripts([]);
              }
            } else {
              setInstalledScripts([]);
            }
          }
        } catch (error) {
          console.error('❌ [Dashboard] Ошибка удаления скрипта:', error);
          setInstalledScripts([]);
        }
      }
    };

    window.addEventListener('message', handleExtensionSync);
    return () => window.removeEventListener('message', handleExtensionSync);
  }, [authUser?.id]);
  
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(user.twoFactorEnabled);
  const [isAutoUpdateEnabled, setIsAutoUpdateEnabled] = useState(true);
  const [isNewScriptNotificationsEnabled, setIsNewScriptNotificationsEnabled] = useState(true);
  const [isUpdateNotificationsEnabled, setIsUpdateNotificationsEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const navigationItems = [
    {
      id: 'scripts',
      label: language === 'ru' ? 'Скрипты' : 'Scripts',
      icon: Library,
      children: [
        {
          value: 'scripts',
          label: language === 'ru' ? 'Библиотека скриптов' : 'Scripts Library',
          icon: Library
        },
        {
          value: 'installed',
          label: language === 'ru' ? 'Установленные скрипты' : 'Installed Scripts',
          icon: Download
        },
        {
          value: 'visual-builder',
          label: language === 'ru' ? 'Визуальный конструктор' : 'Visual Builder',
          icon: Blocks
        }
      ]
    },
    {
      id: 'referral',
      value: 'referral',
      label: language === 'ru' ? 'Рефералы' : 'Referrals',
      icon: Star
    },
    {
      id: 'support',
      label: language === 'ru' ? 'Поддержка' : 'Support',
      icon: Headphones,
      children: [
        {
          value: 'support',
          label: language === 'ru' ? 'Все тикеты' : 'All Tickets',
          icon: Headphones
        },
        {
          value: 'support-open',
          label: language === 'ru' ? 'Открытые тикеты' : 'Open Tickets',
          icon: Headphones
        },
        {
          value: 'support-resolved',
          label: language === 'ru' ? 'Решенные тикеты' : 'Resolved Tickets',
          icon: Headphones
        }
      ]
    },
    {
      id: 'settings',
      label: language === 'ru' ? 'Настройки' : 'Settings',
      icon: Settings,
      children: [
        {
          value: 'profile',
          label: language === 'ru' ? 'Настройки профиля' : 'Profile Settings',
          icon: User
        },
        {
          value: 'settings',
          label: language === 'ru' ? 'Настройки аккаунта' : 'Account Settings',
          icon: Settings
        }
      ]
    }
  ];

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
      const token = localStorage.getItem('ebuster_token');
      if (!token) {
        toast({
          title: "Ошибка авторизации",
          description: "Токен не найден. Пожалуйста, войдите в систему заново.",
          variant: "destructive"
        });
        return;
      }

      // Вызываем наш кастомный API для обновления профиля
      const requestData = {
        id: authUser?.id || 'dummy-id', // ID не важен, генерируется UUID
        email: authUser?.email,
        full_name: user.name,
        avatar_url: user.avatar
      };
      
      const response = await fetch(`${API_CONFIG.USER_URL}/upsert`, {
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
      <div className="relative z-content min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
          <div className="container mx-auto max-w-[1400px] px-6 lg:px-8 py-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {t('header.dashboard.title')}
                </h1>
                <p className="text-muted-foreground">{t('header.dashboard.welcome')} {user.name}!</p>
              </div>
              <div className="flex items-center gap-4">
                {(user.plan === 'premium' || user.plan === 'pro' || user.plan === 'enterprise') ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-sm"></div>
                    <Badge className="relative bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 px-4 py-2 text-sm font-bold shadow-lg">
                      <Crown className="h-4 w-4 mr-2" />
                      {user.plan.toUpperCase()}
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

          {/* Layout with sidebar navigation */}
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                <Card className="bg-card/80 backdrop-blur border border-border/60">
                  <CardHeader className="pb-2 px-4">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {language === 'ru' ? 'Навигация' : 'Navigation'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 pb-3">
                    <nav className="space-y-1">
                      {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = expandedSections.includes(item.id);
                        const itemValue = item.value || item.id;
                        const isActive = !hasChildren && activeTab === itemValue;

                        return (
                          <div key={item.id}>
                            <button
                              onClick={() => {
                                if (hasChildren) {
                                  toggleSection(item.id);
                                } else {
                                  handleTabChange(itemValue);
                                }
                              }}
                              className={cn(
                                'w-full flex items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-all',
                                isActive
                                  ? 'bg-primary text-primary-foreground shadow-sm'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                              )}
                            >
                              <span className="flex items-center gap-2.5 flex-1 min-w-0">
                                <Icon className={cn('h-4 w-4 transition-colors flex-shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                              </span>
                              {hasChildren ? (
                                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform flex-shrink-0', isExpanded ? 'rotate-180' : 'rotate-0')} />
                              ) : (
                                <ChevronRight className={cn('h-3.5 w-3.5 transition-transform flex-shrink-0', isActive ? 'opacity-100 translate-x-0' : 'opacity-40 -translate-x-1')} />
                              )}
                            </button>

                            {hasChildren && isExpanded && (
                              <div className="ml-3 mt-1 space-y-1 border-l-2 border-border/50 pl-2">
                                {item.children.map((child: any) => {
                                  const ChildIcon = child.icon;
                                  const isChildActive = activeTab === child.value;
                                  return (
                                    <button
                                      key={child.value}
                                      onClick={() => handleTabChange(child.value)}
                                      className={cn(
                                        'w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
                                        isChildActive
                                          ? 'bg-primary text-primary-foreground shadow-sm'
                                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                                      )}
                                    >
                                      <span className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">{child.label}</span>
                                      </span>
                                      <ChevronRight className={cn('h-3.5 w-3.5 transition-transform flex-shrink-0', isChildActive ? 'opacity-100 translate-x-0' : 'opacity-40 -translate-x-1')} />
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </nav>
                  </CardContent>
              </Card>
              </div>
            </aside>

          <div className="flex-1 space-y-8">
            {activeTab === 'scripts' && (
              <div className="space-y-6">
                <ScriptsList />
              </div>
            )}

            {activeTab === 'visual-builder' && (
              <div className="space-y-6">
                <VisualScriptBuilder />
              </div>
            )}

            {activeTab === 'installed' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">{t('header.dashboard.tabs.installed')}</h2>
                  <GradientButton className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {t('header.dashboard.installed.addScript')}
                  </GradientButton>
                </div>

                <div className="space-y-4">
                  {installedScripts.length === 0 ? (
                    <Card className="p-12 text-center border-primary/20">
                      <div className="flex flex-col items-center gap-4">
                        <Library className="h-12 w-12 text-primary/50" />
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {t('header.dashboard.installed.noScripts')}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t('header.dashboard.installed.noScriptsDescription')}
                          </p>
                        </div>
                        <GradientButton onClick={() => handleTabChange('scripts')}>
                          {t('header.dashboard.installed.browseScripts')}
                        </GradientButton>
                      </div>
                    </Card>
                  ) : installedScripts
                    .filter((item: any) => item.script !== null && item.script !== undefined) // Фильтруем null скрипты
                    .map((item: any) => {
                    const scriptTitle = item.script?.title || item.script?.name || 'Скрипт';
                    const scriptDescription = item.script?.short_description || item.script?.description || '';
                    const scriptVersion = item.script?.version || item.version || '1.0.0';

                    return (
                      <Card key={item.script_id} className="group hover:shadow-lg hover:border-primary/30 transition-all duration-200 border-border/50">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Library className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground">{scriptTitle}</h3>
                                {scriptDescription && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">{scriptDescription}</p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                  <span>v{scriptVersion}</span>
                                  <span>•</span>
                                  <span>{t('header.dashboard.scripts.installed')} {formatDate(item.installed_at)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <GradientButton 
                                variant="outline"
                                size="sm"
                                onClick={() => setChangelogScript({ id: item.script_id, name: scriptTitle })}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                История версий
                              </GradientButton>
                              <GradientButton 
                                variant="outline"
                                size="sm"
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                {t('header.dashboard.installed.configure')}
                              </GradientButton>
                              <GradientButton 
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                {t('header.dashboard.installed.uninstall')}
                              </GradientButton>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'referral' && (
              <div className="space-y-6">
                <ReferralProgram userId={String(authUser?.id || '')} />
              </div>
            )}

            {(activeTab === 'support' || activeTab === 'support-open' || activeTab === 'support-resolved') && (
              <div className="space-y-6">
                <TicketsSystem 
                  initialFilter={
                    activeTab === 'support-open' ? 'open' : 
                    activeTab === 'support-resolved' ? 'resolved' : 
                    'all'
                  } 
                />
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">{t('header.dashboard.profile.personalInfo')}</h2>
                <div className="max-w-2xl mx-auto">
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
                      <GradientButton className="w-full" onClick={handleSaveProfile} disabled={isSaving}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        {isSaving ? t('header.dashboard.settings.saving') : t('header.dashboard.settings.saveChanges')}
                      </GradientButton>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">{t('header.dashboard.tabs.settings')}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border border-border/40 bg-card/80">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Shield className="h-5 w-5 text-primary" />
                        {t('header.dashboard.settings.security')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setIsChangePasswordOpen(true)}
                        >
                          <Key className="h-4 w-4 mr-2 text-primary" />
                          {t('header.dashboard.settings.changePassword')}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setIsChangeEmailOpen(true)}
                        >
                          <Mail className="h-4 w-4 mr-2 text-primary" />
                          {t('header.dashboard.settings.changeEmail')}
                        </Button>
                        <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card/60 px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">{t('header.dashboard.settings.twoFactorAuth')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={is2FAEnabled}
                              onCheckedChange={async (checked) => {
                                if (checked) {
                                  setIs2FASetupOpen(true);
                                } else {
                                  try {
                                    const token = localStorage.getItem('ebuster_token');
                                    const response = await fetch(`${API_CONFIG.USER_URL}/2fa/disable`, {
                                      method: 'POST',
                                      headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                      }
                                    });

                                    if (response.ok) {
                                      setIs2FAEnabled(false);
                                      setUser(prev => ({ ...prev, twoFactorEnabled: false }));
                                      loadUserProfile();
                                      toast({
                                        title: 'Двухфакторная аутентификация отключена',
                                        description: 'Вы можете включить её снова в любое время',
                                        variant: 'success'
                                      });
                                    } else {
                                      toast({
                                        title: 'Ошибка',
                                        description: 'Не удалось отключить 2FA',
                                        variant: 'destructive'
                                      });
                                    }
                                  } catch (error) {
                                    toast({
                                      title: 'Ошибка',
                                      description: 'Не удалось отключить 2FA',
                                      variant: 'destructive'
                                    });
                                  }
                                }
                              }}
                              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
                            />
                            <span className="text-sm text-muted-foreground">
                              {is2FAEnabled ? t('header.dashboard.settings.enabled') : t('header.dashboard.settings.disabled')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* История входов */}
                <div className="mt-6">
                  <LoginHistory />
                </div>
                
                {/* API Keys Section */}
                <div className="mt-8">
                  <ApiKeysManagement />
                </div>
              </div>
            )}

            {activeTab === 'api-docs' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">API Документация</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Использование API</CardTitle>
                    <CardDescription>
                      Создайте API ключ в настройках и используйте его для доступа к нашему API
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Аутентификация</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Используйте API ключ в заголовке запроса:
                      </p>
                      <pre className="p-3 bg-muted rounded-lg text-sm">
                        <code>X-API-Key: ebk_your_api_key_here</code>
                      </pre>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Примеры</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-1">JavaScript/Node.js</p>
                          <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto">
{`const response = await fetch('https://api.ebuster.ru/api/v1/scripts', {
  headers: { 'X-API-Key': 'ebk_your_api_key_here' }
});
const data = await response.json();`}
                          </pre>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-1">Python</p>
                          <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto">
{`import requests
headers = {'X-API-Key': 'ebk_your_api_key_here'}
response = requests.get('https://api.ebuster.ru/api/v1/scripts', headers=headers)`}
                          </pre>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-1">cURL</p>
                          <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto">
{`curl -H "X-API-Key: ebk_your_api_key_here" https://api.ebuster.ru/api/v1/scripts`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'general-settings' && (
              <div className="space-y-6">
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
            )}
          </div>
        </div>
      </div>
    </main>

        <Footer />
      </div>
        
      {/* Modals */}
      <ChangePasswordWithOtpModal 
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
        <ChangeEmailModal 
          isOpen={isChangeEmailOpen}
          onClose={() => setIsChangeEmailOpen(false)}
          currentEmail={user.email}
        />
        <TwoFactorSetupModal 
          isOpen={is2FASetupOpen}
          onClose={() => setIs2FASetupOpen(false)}
          userEmail={user.email}
          onComplete={() => {
            setIs2FAEnabled(true);
            setUser(prev => ({ ...prev, twoFactorEnabled: true }));
            // Перезагружаем профиль с сервера для синхронизации
            loadUserProfile();
            toast({
              title: 'Двухфакторная аутентификация включена',
              description: 'Ваш аккаунт теперь защищён дополнительным уровнем безопасности',
              variant: 'success'
            });
          }}
        />
        
        {/* Changelog Modal */}
        {changelogScript && (
          <ScriptChangelog
            scriptId={changelogScript.id}
            scriptName={changelogScript.name}
            isOpen={!!changelogScript}
            onClose={() => setChangelogScript(null)}
          />
        )}
    </div>
  );
};

export default Dashboard;
