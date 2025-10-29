import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { notificationTranslations } from '@/lib/notification-translations';
import { useAdminApi } from '@/hooks/useAdminApi';
import ScriptsManagement from './ScriptsManagement';
import SubscriptionsManagement from './SubscriptionsManagement';
import SystemMonitorChart from './SystemMonitorChart';
import { ReferralManagement } from './ReferralManagement';
import { AdminSidebar } from './AdminSidebar';
import CategoriesManagement from './CategoriesManagement';
import MonitoringDashboard from './MonitoringDashboard';
import TicketsManagement from './TicketsManagement';
import { 
  Users, 
  Settings, 
  BarChart3, 
  FileText, 
  Shield, 
  Database,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
  Ban,
  Unlock,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  UserCheck,
  UserX,
  FileCheck,
  FileX,
  MessageSquare,
  Bell,
  LogOut,
  RefreshCw,
  Zap,
  Target,
  Globe,
  Lock,
  Key,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Star,
  ThumbsUp,
  ThumbsDown,
  Flag,
  AlertTriangle,
  Info,
  Plus,
  Minus,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  TrendingDown,
  Monitor,
  Smartphone,
  Tablet,
  Chrome,
  Save,
  Copy,
  Code
} from 'lucide-react';

const AdminDashboard = () => {
  const { toast } = useToast();
  const adminApi = useAdminApi();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showScriptDetailsModal, setShowScriptDetailsModal] = useState(false);
  const [showTicketDetailsModal, setShowTicketDetailsModal] = useState(false);
  const [showLogDetailsModal, setShowLogDetailsModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [userToBan, setUserToBan] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  
  // Custom confirm modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    confirmText: 'Подтвердить',
    cancelText: 'Отмена',
    onConfirm: null,
    onCancel: null
  });
  
  // Custom confirm function
  const customConfirm = (title, message, onConfirm, onCancel = null, confirmText = 'Подтвердить', cancelText = 'Отмена') => {
    setConfirmConfig({
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
      onCancel
    });
    setShowConfirmModal(true);
    
    return new Promise<boolean>((resolve) => {
      setConfirmConfig(prev => ({
        ...prev,
        onConfirm: () => {
          onConfirm?.();
          resolve(true);
        },
        onCancel: () => {
          onCancel?.();
          resolve(false);
        }
      }));
    });
  };
  
  const [selectedScriptDetails, setSelectedScriptDetails] = useState(null);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState(null);
  const [selectedLogDetails, setSelectedLogDetails] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  // Состояния для формы бана
  const [banReason, setBanReason] = useState('');
  const [banType, setBanType] = useState<'temporary' | 'permanent'>('temporary');
  const [banDuration, setBanDuration] = useState(30);
  const [banDurationUnit, setBanDurationUnit] = useState<'hours' | 'days' | 'months'>('days');
  const [banContactEmail, setBanContactEmail] = useState('support@ebuster.ru');
  
  // Состояние для реальных данных
  const [systemStats, setSystemStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [browserStats, setBrowserStats] = useState([]);
  const [activityStats, setActivityStats] = useState([]);
  const [scriptStats, setScriptStats] = useState([]);
    const [systemStatus, setSystemStatus] = useState({
    cpu: { usage: 0, model: 'Loading...' },
    memory: { usage: 0, total: '0GB', used: '0GB' },
    disk: { usage: 0, total: '0GB' },
    network: { usage: 0, speed: '0Gbps' },
    uptime: 'Loading...'
  });

  // Функция для обновления мониторинга
  const updateMonitoring = async () => {
    try {
      const monitorData = await adminApi.getSystemMonitor();
      setSystemStatus(monitorData);
    } catch (error) {
      console.error('Ошибка обновления мониторинга:', error);
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const loadData = async () => {
      try {
        // Загружаем статистику системы
        const stats = await adminApi.getSystemStats();
        setSystemStats(stats);

        // Загружаем последних пользователей
        const usersData = await adminApi.getUsers({ limit: 10 });
        setRecentUsers(usersData.users);

        // Загружаем логи системы
        const logsData = await adminApi.getSystemLogs({ limit: 10 });
        setSystemLogs(logsData.logs);

        // Загружаем статистику браузеров
        const browserData = await adminApi.getBrowserStats();
        setBrowserStats(browserData);

        // Загружаем статистику активности
        const activityData = await adminApi.getActivityStats();
        setActivityStats(activityData);

        // Загружаем мониторинг системы
        await updateMonitoring();

        // Пока используем заглушки для скриптов и тикетов
        setScriptStats([
          { name: 'Dark Mode Enforcer', downloads: 1247, rating: 4.8, users: 892, size: '1.2MB', category: 'UI/UX', status: 'active' },
          { name: 'Auto Form Filler', downloads: 934, rating: 4.6, users: 567, size: '2.1MB', category: 'Productivity', status: 'active' },
          { name: 'Password Generator', downloads: 756, rating: 4.9, users: 423, size: '0.8MB', category: 'Security', status: 'active' }
        ]);

        setTicketStats([
          { id: 1, user: 'Александр Петров', subject: 'Проблема с установкой скрипта', priority: 'high', status: 'open', created: '2024-01-25 14:30', assigned: 'Админ 1' },
          { id: 2, user: 'Мария Иванова', subject: 'Запрос на новую функцию', priority: 'medium', status: 'in_progress', created: '2024-01-25 13:45', assigned: 'Админ 2' },
          { id: 3, user: 'Дмитрий Сидоров', subject: 'Ошибка в работе скрипта', priority: 'low', status: 'resolved', created: '2024-01-25 12:20', assigned: 'Админ 1' }
        ]);
      } catch (error) {
        console.error('Ошибка загрузки данных админки:', error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить данные админки",
          variant: "destructive"
        });
      }
    };

    loadData();

    // Автоматическое обновление данных мониторинга каждые 3 минуты
    const monitorInterval = setInterval(() => {
      updateMonitoring();
    }, 180000); // 3 минуты = 180000 мс

    return () => {
      clearInterval(monitorInterval);
    };
  }, []);

  // Функции для работы с данными

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-primary bg-primary/10';
      case 'banned': return 'text-destructive bg-destructive/10';
      case 'inactive': return 'text-muted-foreground bg-muted/10';
      case 'open': return 'text-primary bg-primary/10';
      case 'in_progress': return 'text-primary bg-primary/10';
      case 'resolved': return 'text-primary bg-primary/10';
      case 'pending': return 'text-muted-foreground bg-muted/10';
      case 'deprecated': return 'text-muted-foreground bg-muted/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive bg-destructive/10';
      case 'medium': return 'text-primary bg-primary/10';
      case 'low': return 'text-primary bg-primary/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-destructive bg-destructive/10';
      case 'WARNING': return 'text-primary bg-primary/10';
      case 'INFO': return 'text-primary bg-primary/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const handleBanUser = (user: any) => {
    if (!user) {
      console.error('handleBanUser: user is undefined');
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные пользователя",
        variant: "destructive"
      });
      return;
    }
    
    setUserToBan(user);
    setShowBanModal(true);
    // Сбрасываем форму
    setBanReason('');
    setBanType('temporary');
    setBanDuration(30);
    setBanDurationUnit('days');
    setBanContactEmail('support@ebuster.ru');
  };

  const submitBanUser = async () => {
    if (!userToBan) return;
    
    if (!banReason.trim()) {
      toast({
        title: "Ошибка",
        description: "Укажите причину блокировки",
        variant: "destructive"
      });
      return;
    }

    try {
      await adminApi.banUser(userToBan.id, {
        reason: banReason,
        banType,
        duration: banType === 'temporary' ? banDuration : undefined,
        durationUnit: banType === 'temporary' ? banDurationUnit : undefined,
        contactEmail: banContactEmail
      });
      
      // Обновляем локальное состояние
      setRecentUsers(prev => prev.map(user => 
        user.id === userToBan.id ? { ...user, status: 'banned' } : user
      ));
      
      setShowBanModal(false);
      setUserToBan(null);
      
      const translation = notificationTranslations.admin.userBanned;
      toast({
        title: translation.title,
        description: translation.description,
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось забанить пользователя",
        variant: "destructive"
      });
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await adminApi.updateUserStatus(userId, 'active', 'Разбанен администратором');
      
      // Обновляем локальное состояние
      setRecentUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: 'active' } : user
      ));
      
      const translation = notificationTranslations.admin.userUnbanned;
      toast({
        title: translation.title,
        description: translation.description,
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось разбанить пользователя",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (!user) {
      console.error('handleDeleteUser: user is undefined');
      return;
    }
    
    // Используем customConfirm для подтверждения
    const userName = user?.full_name || user?.name || user?.email || 'этого пользователя';
    const confirmMessage = `Вы уверены, что хотите удалить пользователя «${userName}»? Это действие нельзя отменить.`;
    const confirmTitle = 'Удаление пользователя';
    
    const confirmed = await customConfirm(
      confirmTitle,
      confirmMessage,
      null, // onConfirm will be handled after
      null, // onCancel will be handled after  
      'Удалить',
      'Отмена'
    );
    
    if (!confirmed) return;
    
    try {
      const userId = typeof user === 'string' ? user : user.id;
      
      // Пока нет API для удаления пользователей, просто обновляем локальное состояние
      setRecentUsers(prev => prev.filter(u => u.id !== userId));
      
      const translation = notificationTranslations.admin.userDeleted;
      toast({
        title: translation.title,
        description: translation.description,
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пользователя",
        variant: "destructive"
      });
    }
  };

  const handleViewUser = (user: any) => {
    setSelectedUserDetails(user);
    setShowUserDetailsModal(true);
  };

  const handleViewScript = (script: any) => {
    setSelectedScriptDetails(script);
    setShowScriptDetailsModal(true);
  };

  
  const handleViewLog = (log: any) => {
    setSelectedLogDetails(log);
    setShowLogDetailsModal(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUserDetails(user);
    setShowUserDetailsModal(true);
  };

  const handleEditScript = (script: any) => {
    setSelectedScriptDetails(script);
    setShowScriptDetailsModal(true);
  };

  
  const testToast = () => {
    console.log('testToast called');
    toast({
      title: "Тест уведомления",
      description: "Это тестовое уведомление для проверки видимости",
      variant: "success"
    });
    console.log('toast called');
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Гарантируем наличие хотя бы одного символа каждого типа
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // строчная буква
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // заглавная буква
    password += "0123456789"[Math.floor(Math.random() * 10)]; // цифра
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // специальный символ
    
    // Заполняем остальные символы
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Перемешиваем символы
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setGeneratedPassword(password);
    const translation = notificationTranslations.admin.passwordGenerated;
    toast({
      title: translation.title,
      description: translation.description,
      variant: "success"
    });
    return password;
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="relative z-content ml-64">
        <Header />
        
        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Заголовок */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Админ панель
                </h1>
                <p className="text-xl text-muted-foreground">
                  Управление системой и мониторинг
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="px-4 py-2 text-sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Администратор
                </Badge>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Обновить
                </Button>
              </div>
            </div>
          </div>

          {/* Контент табов */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

            {/* Обзор */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Статистика по браузерам */}
                <Card className="bg-card/50 backdrop-blur-sm border border-border/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Браузеры пользователей
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Chrome className="h-4 w-4 text-primary" />
                          <span className="text-sm">Chrome</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={65} className="w-20 h-2" />
                          <span className="text-sm font-medium">65%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-primary" />
                          <span className="text-sm">Firefox</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={20} className="w-20 h-2" />
                          <span className="text-sm font-medium">20%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-primary" />
                          <span className="text-sm">Safari</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={10} className="w-20 h-2" />
                          <span className="text-sm font-medium">10%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-primary" />
                          <span className="text-sm">Edge</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={5} className="w-20 h-2" />
                          <span className="text-sm font-medium">5%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Активность по времени */}
                <Card className="bg-card/50 backdrop-blur-sm border border-border/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Активность по времени
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">00:00 - 06:00</span>
                        <div className="flex items-center gap-2">
                          <Progress value={15} className="w-20 h-2" />
                          <span className="text-sm font-medium">15%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">06:00 - 12:00</span>
                        <div className="flex items-center gap-2">
                          <Progress value={35} className="w-20 h-2" />
                          <span className="text-sm font-medium">35%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">12:00 - 18:00</span>
                        <div className="flex items-center gap-2">
                          <Progress value={45} className="w-20 h-2" />
                          <span className="text-sm font-medium">45%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">18:00 - 24:00</span>
                        <div className="flex items-center gap-2">
                          <Progress value={25} className="w-20 h-2" />
                          <span className="text-sm font-medium">25%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Последние активности */}
              <Card className="bg-card/50 backdrop-blur-sm border border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Последние активности
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <Badge className={`text-xs ${getLogLevelColor(log.level)}`}>
                          {log.level}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{log.message}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                            <span className="text-xs text-muted-foreground">IP: {log.ip}</span>
                            {log.user !== 'System' && (
                              <span className="text-xs text-muted-foreground">Пользователь: {log.user}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Пользователи */}
            <TabsContent value="users" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border border-border/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Управление пользователями
                      </CardTitle>
                      <CardDescription>
                        Всего пользователей: {systemStats?.totalUsers || '0'} | Активных: {systemStats?.activeUsers || '0'} | Забаненных: {systemStats?.bannedUsers || '0'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Поиск пользователей..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Фильтры
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {(user?.full_name || user?.name || 'U').split(' ').map((n: string) => n[0] || '').join('')}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{user.full_name || user.name || 'Неизвестный пользователь'}</span>
                              <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                                {user.status === 'active' ? 'Активен' : 
                                 user.status === 'banned' ? 'Забанен' : 'Неактивен'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{user.email || 'Не указан'}</span>
                              <span>•</span>
                              <span>{user.location || 'Местоположение не указано'}</span>
                              <span>•</span>
                              <span>{user.browser || 'Браузер не указан'}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span>Загрузок: {user.downloads || 0}</span>
                              <span>Скриптов: {user.scripts || 0}</span>
                              <span>Последняя активность: {user.last_active ? new Date(user.last_active).toLocaleString('ru-RU') : user.last_login_at ? new Date(user.last_login_at).toLocaleString('ru-RU') : 'Никогда'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.status === 'banned' ? (
                            <Button variant="outline" size="sm" onClick={() => handleUnbanUser(user.id)}>
                              <Unlock className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleBanUser(user)}>
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Скрипты */}
            <TabsContent value="scripts" className="space-y-6">
              <ScriptsManagement />
            </TabsContent>

            {/* Категории */}
            <TabsContent value="categories" className="space-y-6">
              <CategoriesManagement />
            </TabsContent>

            {/* Подписки */}
            <TabsContent value="subscriptions" className="space-y-6">
              <SubscriptionsManagement />
            </TabsContent>

            {/* Рефералы */}
            <TabsContent value="referrals" className="space-y-6">
              <ReferralManagement />
            </TabsContent>

            {/* Мониторинг */}
            <TabsContent value="monitoring" className="space-y-6">
              <MonitoringDashboard systemStats={systemStats} systemStatus={systemStatus} />
            </TabsContent>

            {/* Тикеты */}
            <TabsContent value="tickets" className="space-y-6">
              <TicketsManagement />
            </TabsContent>

            {/* Логи */}
            <TabsContent value="logs" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border border-border/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Системные логи
                      </CardTitle>
                      <CardDescription>
                        Мониторинг активности системы и пользователей
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Экспорт логов
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Обновить
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(systemLogs || []).map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <Badge className={`text-xs ${getLogLevelColor(log.level)}`}>
                          {log.level}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{log.message}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                            <span className="text-xs text-muted-foreground">IP: {log.ip}</span>
                            {log.user !== 'System' && (
                              <span className="text-xs text-muted-foreground">Пользователь: {log.user}</span>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewLog(log)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Графики */}
            <TabsContent value="charts" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Графики и история мониторинга
                  </CardTitle>
                  <CardDescription>
                    Детальная статистика и графики работы системы
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SystemMonitorChart />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Кнопка назад */}
          <div className="text-center mt-12">
            <Button asChild variant="outline">
              <a href="https://lk.ebuster.ru/dashboard">
                Вернуться в личный кабинет
              </a>
            </Button>
          </div>
        </div>
        
        <Footer />
      </div>

      {/* Модальное окно редактирования пользователя */}
      <Dialog open={showUserDetailsModal} onOpenChange={setShowUserDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактирование пользователя</DialogTitle>
            <DialogDescription>
              Полная информация и управление пользователем
            </DialogDescription>
          </DialogHeader>
          {selectedUserDetails && (
            <div className="space-y-6">
              {/* Основная информация */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xl font-medium text-primary">
                    {(selectedUserDetails?.full_name || selectedUserDetails?.name || 'U').split(' ').map((n: string) => n[0] || '').join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedUserDetails.name}</h3>
                  <p className="text-muted-foreground">{selectedUserDetails.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={`${getStatusColor(selectedUserDetails.status)}`}>
                      {selectedUserDetails.status === 'active' ? 'Активен' : 
                       selectedUserDetails.status === 'banned' ? 'Забанен' : 'Неактивен'}
                    </Badge>
                    <Badge variant="outline">ID: {selectedUserDetails.id}</Badge>
                  </div>
                </div>
              </div>

              {/* Редактируемые поля */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="userName">Имя пользователя</Label>
                    <Input 
                      id="userName" 
                      defaultValue={selectedUserDetails.name}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userEmail">Email</Label>
                    <Input 
                      id="userEmail" 
                      type="email"
                      defaultValue={selectedUserDetails.email}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userRole">Роль</Label>
                    <Select defaultValue={selectedUserDetails.role}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Пользователь</SelectItem>
                        <SelectItem value="moderator">Модератор</SelectItem>
                        <SelectItem value="developer">Разработчик</SelectItem>
                        <SelectItem value="admin">Администратор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="userAccessLevel">Уровень доступа</Label>
                    <Select defaultValue={selectedUserDetails.accessLevel}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Базовый</SelectItem>
                        <SelectItem value="standard">Стандартный</SelectItem>
                        <SelectItem value="premium">Премиум</SelectItem>
                        <SelectItem value="enterprise">Корпоративный</SelectItem>
                        <SelectItem value="developer">Разработчик</SelectItem>
                        <SelectItem value="moderator">Модератор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="userStatus">Статус</Label>
                    <Select defaultValue={selectedUserDetails.status}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Активен</SelectItem>
                        <SelectItem value="banned">Забанен</SelectItem>
                        <SelectItem value="inactive">Неактивен</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="userSubscription">Тип подписки</Label>
                    <Select defaultValue={selectedUserDetails.subscriptionType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Бесплатная</SelectItem>
                        <SelectItem value="premium">Премиум</SelectItem>
                        <SelectItem value="enterprise">Корпоративная</SelectItem>
                        <SelectItem value="developer">Разработчик</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="userSubscriptionExpiry">Окончание подписки</Label>
                    <Input 
                      id="userSubscriptionExpiry" 
                      type="date"
                      defaultValue={selectedUserDetails.subscriptionExpiry || ''}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="userEmailVerified" 
                      defaultChecked={selectedUserDetails.emailVerified}
                    />
                    <Label htmlFor="userEmailVerified">Email подтвержден</Label>
                  </div>
                </div>
              </div>

              {/* Права и доступы */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Права и доступы</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="font-medium">Права пользователя</h5>
                    <div className="space-y-2">
                      {['script_download', 'ticket_create', 'script_upload', 'script_moderate', 'user_view', 'api_access'].map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Switch 
                            id={permission}
                            defaultChecked={selectedUserDetails.permissions?.includes(permission)}
                          />
                          <Label htmlFor={permission} className="text-sm">
                            {permission === 'script_download' && 'Скачивание скриптов'}
                            {permission === 'ticket_create' && 'Создание тикетов'}
                            {permission === 'script_upload' && 'Загрузка скриптов'}
                            {permission === 'script_moderate' && 'Модерация скриптов'}
                            {permission === 'user_view' && 'Просмотр пользователей'}
                            {permission === 'api_access' && 'Доступ к API'}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h5 className="font-medium">Дополнительные возможности</h5>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="twoFactorEnabled"
                          defaultChecked={selectedUserDetails.twoFactorEnabled}
                        />
                        <Label htmlFor="twoFactorEnabled" className="text-sm">2FA включена</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="apiAccess"
                          defaultChecked={selectedUserDetails.apiAccess}
                        />
                        <Label htmlFor="apiAccess" className="text-sm">API доступ</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="customScripts"
                          defaultChecked={selectedUserDetails.customScripts}
                        />
                        <Label htmlFor="customScripts" className="text-sm">Кастомные скрипты</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="prioritySupport"
                          defaultChecked={selectedUserDetails.prioritySupport}
                        />
                        <Label htmlFor="prioritySupport" className="text-sm">Приоритетная поддержка</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Дополнительная информация */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Дополнительная информация</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Последняя активность</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{selectedUserDetails.lastActive}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">IP адрес</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">192.168.1.100</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Сессия</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Активна</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Статистика активности */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Статистика активности</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold text-primary">{selectedUserDetails?.downloads || '0'}</p>
                    <p className="text-sm text-muted-foreground">Загрузок</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold text-primary">{selectedUserDetails?.scripts || '0'}</p>
                    <p className="text-sm text-muted-foreground">Скриптов</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold text-primary">12</p>
                    <p className="text-sm text-muted-foreground">Тикетов</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold text-primary">5</p>
                    <p className="text-sm text-muted-foreground">Дней онлайн</p>
                  </div>
                </div>
              </div>

              {/* Управление паролем */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Управление паролем</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newPassword">Новый пароль</Label>
                    <Input 
                      id="newPassword" 
                      type="password"
                      placeholder="Введите новый пароль"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      placeholder="Подтвердите пароль"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Key className="h-4 w-4 mr-2" />
                    Сбросить пароль
                  </Button>
                  <Button variant="outline" onClick={generatePassword}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Сгенерировать пароль
                  </Button>
                </div>
                {generatedPassword && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/30">
                    <Label className="text-sm font-medium">Сгенерированный пароль:</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input 
                        value={generatedPassword} 
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedPassword).then(() => {
                            toast({
                              title: "Пароль скопирован",
                              description: "Пароль успешно скопирован в буфер обмена",
                              variant: "default",
                            });
                          }).catch(() => {
                            // Fallback для старых браузеров
                            const textArea = document.createElement('textarea');
                            textArea.value = generatedPassword;
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                            toast({
                              title: "Пароль скопирован",
                              description: "Пароль успешно скопирован в буфер обмена",
                              variant: "default",
                            });
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Скопируйте пароль и отправьте пользователю безопасным способом
                    </p>
                  </div>
                )}
              </div>

              {/* Действия */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Действия</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить изменения
                  </Button>
                  <Button variant="outline" onClick={testToast}>
                    <Bell className="h-4 w-4 mr-2" />
                    Тест уведомления
                  </Button>
                  {selectedUserDetails.status === 'banned' ? (
                    <Button variant="outline" onClick={() => handleUnbanUser(selectedUserDetails.id)}>
                      <Unlock className="h-4 w-4 mr-2" />
                      Разбанить пользователя
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => handleBanUser(selectedUserDetails)}>
                      <Ban className="h-4 w-4 mr-2" />
                      Забанить пользователя
                    </Button>
                  )}
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Отправить email
                  </Button>
                  <Button variant="outline">
                    <Bell className="h-4 w-4 mr-2" />
                    Отправить уведомление
                  </Button>
                  <Button variant="outline">
                    <LogOut className="h-4 w-4 mr-2" />
                    Завершить все сессии
                  </Button>
                  <Button variant="destructive" onClick={() => handleDeleteUser(selectedUserDetails)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Удалить пользователя
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Модальное окно детальной информации о скрипте */}
      <Dialog open={showScriptDetailsModal} onOpenChange={setShowScriptDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Информация о скрипте</DialogTitle>
            <DialogDescription>
              Детальная информация и управление скриптом
            </DialogDescription>
          </DialogHeader>
          {selectedScriptDetails && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedScriptDetails.name}</h3>
                  <p className="text-muted-foreground">{selectedScriptDetails.category}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge className={`${getStatusColor(selectedScriptDetails.status)}`}>
                      {selectedScriptDetails.status === 'active' ? 'Активен' : 
                       selectedScriptDetails.status === 'pending' ? 'На модерации' : 'Устарел'}
                    </Badge>
                    <Badge variant="outline">
                      {selectedScriptDetails.category}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Загрузок</Label>
                  <p className="text-sm text-muted-foreground">{selectedScriptDetails.downloads.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Пользователей</Label>
                  <p className="text-sm text-muted-foreground">{selectedScriptDetails.users}</p>
                </div>
                <div>
                  <Label>Размер</Label>
                  <p className="text-sm text-muted-foreground">{selectedScriptDetails.size}</p>
                </div>
                <div>
                  <Label>Рейтинг</Label>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm">{selectedScriptDetails.rating}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Действия</Label>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Скачать
                    </Button>
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Редактировать
                    </Button>
                    <Button variant="outline">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Модальное окно детальной информации о тикете */}
      <Dialog open={showTicketDetailsModal} onOpenChange={setShowTicketDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Информация о тикете</DialogTitle>
            <DialogDescription>
              Детальная информация и управление тикетом поддержки
            </DialogDescription>
          </DialogHeader>
          {selectedTicketDetails && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedTicketDetails.subject}</h3>
                  <p className="text-muted-foreground">Пользователь: {selectedTicketDetails.user}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge className={`${getPriorityColor(selectedTicketDetails.priority)}`}>
                      {selectedTicketDetails.priority === 'high' ? 'Высокий' : 
                       selectedTicketDetails.priority === 'medium' ? 'Средний' : 'Низкий'}
                    </Badge>
                    <Badge className={`${getStatusColor(selectedTicketDetails.status)}`}>
                      {selectedTicketDetails.status === 'open' ? 'Открыт' : 
                       selectedTicketDetails.status === 'in_progress' ? 'В работе' : 'Решен'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Создан</Label>
                  <p className="text-sm text-muted-foreground">{selectedTicketDetails.created}</p>
                </div>
                <div>
                  <Label>Назначен</Label>
                  <p className="text-sm text-muted-foreground">{selectedTicketDetails.assigned}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Описание проблемы</Label>
                  <div className="mt-2 p-3 rounded-lg bg-muted/30">
                    <p className="text-sm">Подробное описание проблемы пользователя...</p>
                  </div>
                </div>

                <div>
                  <Label>Ответы</Label>
                  <div className="mt-2 space-y-2">
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-sm">Ответ администратора...</p>
                      <p className="text-xs text-muted-foreground mt-1">2024-01-25 15:30</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Действия</Label>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ответить
                    </Button>
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Редактировать
                    </Button>
                    <Select>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Изменить статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Открыт</SelectItem>
                        <SelectItem value="in_progress">В работе</SelectItem>
                        <SelectItem value="resolved">Решен</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Модальное окно детальной информации о логе */}
      <Dialog open={showLogDetailsModal} onOpenChange={setShowLogDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Детали системного лога</DialogTitle>
            <DialogDescription>
              Подробная информация о системном событии
            </DialogDescription>
          </DialogHeader>
          {selectedLogDetails && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Badge className={`text-sm ${getLogLevelColor(selectedLogDetails.level)}`}>
                  {selectedLogDetails.level}
                </Badge>
                <div>
                  <h3 className="text-lg font-semibold">{selectedLogDetails.message}</h3>
                  <p className="text-muted-foreground">{selectedLogDetails.timestamp}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Время события</Label>
                  <p className="text-sm text-muted-foreground">{selectedLogDetails.timestamp}</p>
                </div>
                <div>
                  <Label>IP адрес</Label>
                  <p className="text-sm text-muted-foreground">{selectedLogDetails.ip}</p>
                </div>
                <div>
                  <Label>Пользователь</Label>
                  <p className="text-sm text-muted-foreground">{selectedLogDetails.user}</p>
                </div>
                <div>
                  <Label>Уровень</Label>
                  <Badge className={`${getLogLevelColor(selectedLogDetails.level)}`}>
                    {selectedLogDetails.level}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Сообщение</Label>
                  <div className="mt-2 p-3 rounded-lg bg-muted/30">
                    <p className="text-sm">{selectedLogDetails.message}</p>
                  </div>
                </div>

                <div>
                  <Label>Дополнительная информация</Label>
                  <div className="mt-2 p-3 rounded-lg bg-muted/30">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
{`{
  "timestamp": "${selectedLogDetails.timestamp}",
  "level": "${selectedLogDetails.level}",
  "message": "${selectedLogDetails.message}",
  "user": "${selectedLogDetails.user}",
  "ip": "${selectedLogDetails.ip}",
  "session_id": "abc123",
  "user_agent": "Mozilla/5.0...",
  "request_id": "req_456"
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <Label>Действия</Label>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Экспорт лога
                    </Button>
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Обновить
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Модальное окно бана пользователя */}
      <Dialog open={showBanModal} onOpenChange={setShowBanModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-destructive" />
              Блокировка пользователя
            </DialogTitle>
            <DialogDescription>
              Заблокировать пользователя {userToBan?.full_name || userToBan?.name || userToBan?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Тип блокировки */}
            <div className="space-y-2">
              <Label htmlFor="banType">Тип блокировки *</Label>
              <Select value={banType} onValueChange={(value: 'temporary' | 'permanent') => setBanType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип блокировки" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temporary">Временная блокировка</SelectItem>
                  <SelectItem value="permanent">Постоянная блокировка</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Длительность (только для временной) */}
            {banType === 'temporary' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="banDuration">Длительность *</Label>
                  <Input
                    id="banDuration"
                    type="number"
                    min="1"
                    value={banDuration}
                    onChange={(e) => setBanDuration(parseInt(e.target.value) || 1)}
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banDurationUnit">Единица времени *</Label>
                  <Select value={banDurationUnit} onValueChange={(value: 'hours' | 'days' | 'months') => setBanDurationUnit(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Часов</SelectItem>
                      <SelectItem value="days">Дней</SelectItem>
                      <SelectItem value="months">Месяцев</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Причина */}
            <div className="space-y-2">
              <Label htmlFor="banReason">Причина блокировки *</Label>
              <Textarea
                id="banReason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Нарушение правил сообщества - спам и нежелательный контент"
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Укажите подробную причину блокировки. Пользователь увидит это сообщение.
              </p>
            </div>

            {/* Email поддержки */}
            <div className="space-y-2">
              <Label htmlFor="banContactEmail">Email поддержки</Label>
              <Input
                id="banContactEmail"
                type="email"
                value={banContactEmail}
                onChange={(e) => setBanContactEmail(e.target.value)}
                placeholder="support@ebuster.ru"
              />
              <p className="text-xs text-muted-foreground">
                Email для связи с поддержкой, который увидит пользователь
              </p>
            </div>

            {/* Предпросмотр */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <h4 className="text-sm font-medium mb-2">Предпросмотр блокировки:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Тип:</span>
                  <span className="font-medium">
                    {banType === 'temporary' ? 'Временная блокировка' : 'Постоянная блокировка'}
                  </span>
                </div>
                {banType === 'temporary' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Длительность:</span>
                    <span className="font-medium">
                      {banDuration} {banDurationUnit === 'hours' ? 'часов' : banDurationUnit === 'days' ? 'дней' : 'месяцев'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Причина:</span>
                  <span className="font-medium text-right max-w-xs truncate">
                    {banReason || 'Не указана'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowBanModal(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={submitBanUser}>
              <Ban className="h-4 w-4 mr-2" />
              Заблокировать пользователя
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Кастомное модальное окно подтверждения */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="bg-card/95 backdrop-blur-sm border border-border/50 max-w-md">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <DialogTitle id="confirmTitle" className="text-xl font-semibold">
              {confirmConfig.title}
            </DialogTitle>
            <DialogDescription id="confirmMessage" className="text-base mt-2">
              {confirmConfig.message}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-3 mt-6">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => {
                setShowConfirmModal(false);
                confirmConfig.onCancel?.();
              }}
            >
              {confirmConfig.cancelText || 'Отмена'}
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1" 
              onClick={() => {
                setShowConfirmModal(false);
                confirmConfig.onConfirm?.();
              }}
            >
              {confirmConfig.confirmText || 'Подтвердить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Toaster для уведомлений */}
      <Toaster />
      
    </div>
  );
};

export default AdminDashboard;