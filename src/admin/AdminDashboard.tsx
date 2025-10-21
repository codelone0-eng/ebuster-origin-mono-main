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
import SystemMonitorChart from './SystemMonitorChart';
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
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [selectedScriptDetails, setSelectedScriptDetails] = useState(null);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState(null);
  const [selectedLogDetails, setSelectedLogDetails] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  // Состояние для реальных данных
  const [systemStats, setSystemStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [browserStats, setBrowserStats] = useState([]);
  const [activityStats, setActivityStats] = useState([]);
  const [scriptStats, setScriptStats] = useState([]);
  const [ticketStats, setTicketStats] = useState([]);
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
      console.log('✅ Мониторинг обновлен:', monitorData);
    } catch (error) {
      console.error('❌ Ошибка обновления мониторинга:', error);
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

    // Автоматическое обновление данных мониторинга каждые 5 секунд
    console.log('🔄 Запуск автообновления мониторинга');
    const monitorInterval = setInterval(() => {
      updateMonitoring();
    }, 5000);

    return () => {
      console.log('🛑 Остановка автообновления мониторинга');
      clearInterval(monitorInterval);
    };
  }, [adminApi]);

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

  const handleBanUser = async (userId: string) => {
    try {
      await adminApi.updateUserStatus(userId, 'banned', 'Забанен администратором');
      
      // Обновляем локальное состояние
      setRecentUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: 'banned' } : user
      ));
      
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

  const handleDeleteUser = async (userId: string) => {
    try {
      // Пока нет API для удаления пользователей, просто обновляем локальное состояние
      setRecentUsers(prev => prev.filter(user => user.id !== userId));
      
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

  const handleViewTicket = (ticket: any) => {
    setSelectedTicketDetails(ticket);
    setShowTicketDetailsModal(true);
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

  const handleEditTicket = (ticket: any) => {
    setSelectedTicketDetails(ticket);
    setShowTicketDetailsModal(true);
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
      <div className="relative z-content">
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

          {/* Основные метрики */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card/50 backdrop-blur-sm border border-border/30 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Всего пользователей</p>
                    <p className="text-2xl font-bold text-foreground">{systemStats?.totalUsers?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-primary">+{systemStats?.newUsersToday || '0'} сегодня</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border border-border/30 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Активные скрипты</p>
                    <p className="text-2xl font-bold text-foreground">{systemStats?.activeScripts || '0'}</p>
                    <p className="text-xs text-primary">из {systemStats?.totalScripts || '0'}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border border-border/30 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Загрузки сегодня</p>
                    <p className="text-2xl font-bold text-foreground">{systemStats?.downloadsToday?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-primary">+12% к вчера</p>
                  </div>
                  <Download className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border border-border/30 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Система</p>
                    <p className="text-2xl font-bold text-foreground">{systemStats?.systemUptime || '0%'}</p>
                    <p className="text-xs text-primary">Uptime</p>
                  </div>
                  <Server className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Мониторинг системы */}
          <Card className="bg-card/50 backdrop-blur-sm border border-border/30 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Мониторинг системы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU</span>
                    <span className="text-sm text-muted-foreground">{systemStatus.cpu.usage}%</span>
                  </div>
                  <Progress value={systemStatus.cpu.usage} className="h-2" />
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">{systemStatus.cpu.model}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Память</span>
                    <span className="text-sm text-muted-foreground">{systemStatus.memory.usage}%</span>
                  </div>
                  <Progress value={systemStatus.memory.usage} className="h-2" />
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">{systemStatus.memory.total} ({systemStatus.memory.used} used)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Диск</span>
                    <span className="text-sm text-muted-foreground">{systemStatus.disk.usage}%</span>
                  </div>
                  <Progress value={systemStatus.disk.usage} className="h-2" />
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">{systemStatus.disk.total}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Сеть</span>
                    <span className="text-sm text-muted-foreground">{systemStatus.network.usage}%</span>
                  </div>
                  <Progress value={systemStatus.network.usage} className="h-2" />
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">{systemStatus.network.speed}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Графики мониторинга */}
          <SystemMonitorChart />

          {/* Табы */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="users">Пользователи</TabsTrigger>
              <TabsTrigger value="scripts">Скрипты</TabsTrigger>
              <TabsTrigger value="tickets">Тикеты</TabsTrigger>
              <TabsTrigger value="logs">Логи</TabsTrigger>
            </TabsList>

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
                              {(user.full_name || user.name || 'U').split(' ').map(n => n[0]).join('')}
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
                            <Button variant="outline" size="sm" onClick={() => handleBanUser(user.id)}>
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)}>
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

            {/* Тикеты */}
            <TabsContent value="tickets" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border border-border/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Система поддержки
                      </CardTitle>
                      <CardDescription>
                        Всего тикетов: {systemStats?.totalTickets || '0'} | Открытых: {systemStats?.openTickets || '0'} | Решенных: {systemStats?.resolvedTickets || '0'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Экспорт тикетов
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Обновить
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(ticketStats || []).map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{ticket.subject}</span>
                              <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority === 'high' ? 'Высокий' : 
                                 ticket.priority === 'medium' ? 'Средний' : 'Низкий'}
                              </Badge>
                              <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                                {ticket.status === 'open' ? 'Открыт' : 
                                 ticket.status === 'in_progress' ? 'В работе' : 'Решен'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Пользователь: {ticket.user}</span>
                              <span>•</span>
                              <span>Создан: {ticket.created}</span>
                              <span>•</span>
                              <span>Назначен: {ticket.assigned}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewTicket(ticket)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditTicket(ticket)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
          </Tabs>

          {/* Быстрые действия */}
          <Card className="bg-card/50 backdrop-blur-sm border border-border/30 mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Быстрые действия
              </CardTitle>
              <CardDescription>
                Часто используемые функции администрирования
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                      <Users className="h-6 w-6" />
                      <span className="text-sm">Пользователи</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Управление пользователями</DialogTitle>
                      <DialogDescription>
                        Просмотр и управление всеми пользователями системы
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Поиск пользователей..." className="pl-10" />
                        </div>
                        <Select>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Фильтр по статусу" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Все пользователи</SelectItem>
                            <SelectItem value="active">Активные</SelectItem>
                            <SelectItem value="banned">Забаненные</SelectItem>
                            <SelectItem value="inactive">Неактивные</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {recentUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">
                                  {(user.full_name || user.name || 'U').split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{user.full_name || user.name || 'Неизвестный пользователь'}</span>
                                  <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                                    {user.status === 'active' ? 'Активен' : 
                                     user.status === 'banned' ? 'Забанен' : 'Неактивен'}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{user.email || 'Не указан'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="outline" size="sm" onClick={() => handleViewUser(user)}>
                                <Eye className="h-3 w-3" />
                              </Button>
                              {user.status === 'banned' ? (
                                <Button variant="outline" size="sm" onClick={() => handleUnbanUser(user.id)}>
                                  <Unlock className="h-3 w-3" />
                                </Button>
                              ) : (
                                <Button variant="outline" size="sm" onClick={() => handleBanUser(user.id)}>
                                  <Ban className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={showScriptModal} onOpenChange={setShowScriptModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                      <FileText className="h-6 w-6" />
                      <span className="text-sm">Скрипты</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Управление скриптами</DialogTitle>
                      <DialogDescription>
                        Просмотр и управление всеми скриптами в системе
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Поиск скриптов..." className="pl-10" />
                        </div>
                        <Select>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Фильтр по статусу" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Все скрипты</SelectItem>
                            <SelectItem value="active">Активные</SelectItem>
                            <SelectItem value="pending">На модерации</SelectItem>
                            <SelectItem value="deprecated">Устаревшие</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {(scriptStats || []).map((script) => (
                          <div key={script.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <FileText className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{script.name}</span>
                                  <Badge className={`text-xs ${getStatusColor(script.status)}`}>
                                    {script.status === 'active' ? 'Активен' : 
                                     script.status === 'pending' ? 'На модерации' : 'Устарел'}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {script.category}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Загрузок: {(script.downloads || 0).toLocaleString()} • Пользователей: {script.users || '0'} • Размер: {script.size || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={showAnalyticsModal} onOpenChange={setShowAnalyticsModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                      <BarChart3 className="h-6 w-6" />
                      <span className="text-sm">Аналитика</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Аналитика системы</DialogTitle>
                      <DialogDescription>
                        Детальная статистика и аналитика работы системы
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Рост пользователей</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">+{systemStats?.newUsersToday || '0'}</div>
                            <p className="text-xs text-muted-foreground">+12% с прошлого месяца</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Популярные скрипты</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{scriptStats?.[0]?.downloads || '0'}</div>
                            <p className="text-xs text-muted-foreground">{scriptStats?.[0]?.name || 'Нет данных'}</p>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Статистика по браузерам</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Chrome</span>
                            <div className="flex items-center gap-2">
                              <Progress value={65} className="w-20 h-2" />
                              <span className="text-sm">65%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Firefox</span>
                            <div className="flex items-center gap-2">
                              <Progress value={20} className="w-20 h-2" />
                              <span className="text-sm">20%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Safari</span>
                            <div className="flex items-center gap-2">
                              <Progress value={10} className="w-20 h-2" />
                              <span className="text-sm">10%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Edge</span>
                            <div className="flex items-center gap-2">
                              <Progress value={5} className="w-20 h-2" />
                              <span className="text-sm">5%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={showDatabaseModal} onOpenChange={setShowDatabaseModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                      <Database className="h-6 w-6" />
                      <span className="text-sm">База данных</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Управление базой данных</DialogTitle>
                      <DialogDescription>
                        Мониторинг и управление базой данных системы
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Размер БД</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">2.4 GB</div>
                            <p className="text-xs text-muted-foreground">+0.1 GB за неделю</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Запросов в секунду</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">156</div>
                            <p className="text-xs text-muted-foreground">Средняя нагрузка</p>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Последние операции</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {systemLogs.slice(0, 10).map((log) => (
                            <div key={log.id} className="flex items-start gap-3 p-2 rounded bg-muted/30">
                              <Badge className={`text-xs ${getLogLevelColor(log.level)}`}>
                                {log.level}
                              </Badge>
                              <div className="flex-1">
                                <p className="text-sm">{log.message}</p>
                                <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Кнопка назад */}
          <div className="text-center mt-12">
            <Button asChild variant="outline">
              <Link to="/dashboard">
                Вернуться в личный кабинет
              </Link>
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
                    {selectedUserDetails.name.split(' ').map(n => n[0]).join('')}
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
                    <Button variant="outline" onClick={() => handleBanUser(selectedUserDetails.id)}>
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
                  <Button variant="destructive" onClick={() => handleDeleteUser(selectedUserDetails.id)}>
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
      
      {/* Toaster для уведомлений */}
      <Toaster />
      
      {/* Debug элемент для проверки z-index */}
      <div 
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 2147483647,
          background: 'red',
          color: 'white',
          padding: '10px',
          borderRadius: '5px'
        }}
      >
        Debug: Z-index MAX
      </div>
    </div>
  );
};

export default AdminDashboard;