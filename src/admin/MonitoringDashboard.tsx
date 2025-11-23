import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import SystemMonitorChart from './SystemMonitorChart';
import {
  Users,
  FileText,
  Download,
  Server,
  Monitor,
  Cpu,
  HardDrive,
  Database,
  Wifi,
  Activity,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';

interface MonitoringDashboardProps {
  systemStats: any;
  systemStatus: any;
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ systemStats, systemStatus }) => {
  const cardClass = "bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg hover:bg-[#1f1f1f] transition-colors duration-200";

  return (
    <div className="space-y-6">
      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Всего пользователей</p>
                <p className="text-2xl font-bold text-white">{systemStats?.totalUsers?.toLocaleString() || '0'}</p>
                <p className="text-xs text-green-500">+{systemStats?.newUsersToday || '0'} сегодня</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Активные скрипты</p>
                <p className="text-2xl font-bold text-white">{systemStats?.activeScripts || '0'}</p>
                <p className="text-xs text-blue-500">из {systemStats?.totalScripts || '0'}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Загрузки сегодня</p>
                <p className="text-2xl font-bold text-white">{systemStats?.downloadsToday?.toLocaleString() || '0'}</p>
                <p className="text-xs text-green-500">+12% к вчера</p>
              </div>
              <Download className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Система</p>
                <p className="text-2xl font-bold text-white">{systemStats?.systemUptime || '99.9%'}</p>
                <p className="text-xs text-green-500">Uptime</p>
              </div>
              <Server className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Подвкладки мониторинга */}
      <Tabs defaultValue="system" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-[#111111] border border-[#2d2d2d] rounded-md">
          <TabsTrigger value="system" className="data-[state=active]:bg-[#1f1f1f] data-[state=active]:text-white text-muted-foreground">
            Система
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-[#1f1f1f] data-[state=active]:text-white text-muted-foreground">
            Пользователи
          </TabsTrigger>
          <TabsTrigger value="scripts" className="data-[state=active]:bg-[#1f1f1f] data-[state=active]:text-white text-muted-foreground">
            Скрипты
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-[#1f1f1f] data-[state=active]:text-white text-muted-foreground">
            Производительность
          </TabsTrigger>
        </TabsList>

        {/* Система */}
        <TabsContent value="system" className="space-y-6">
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Monitor className="h-5 w-5 text-blue-500" />
                Мониторинг системы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">CPU</span>
                    <span className="text-sm text-muted-foreground">{systemStatus.cpu.usage}%</span>
                  </div>
                  <Progress value={systemStatus.cpu.usage} className="h-2 bg-[#2d2d2d]" />
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">{systemStatus.cpu.model}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Память</span>
                    <span className="text-sm text-muted-foreground">{systemStatus.memory.usage}%</span>
                  </div>
                  <Progress value={systemStatus.memory.usage} className="h-2 bg-[#2d2d2d]" />
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">{systemStatus.memory.total} ({systemStatus.memory.used} used)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Диск</span>
                    <span className="text-sm text-muted-foreground">{systemStatus.disk.usage}%</span>
                  </div>
                  <Progress value={systemStatus.disk.usage} className="h-2 bg-[#2d2d2d]" />
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">{systemStatus.disk.total}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Сеть</span>
                    <span className="text-sm text-muted-foreground">{systemStatus.network.usage}%</span>
                  </div>
                  <Progress value={systemStatus.network.usage} className="h-2 bg-[#2d2d2d]" />
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">{systemStatus.network.speed}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-white">Графики системы</CardTitle>
            </CardHeader>
            <CardContent>
              <SystemMonitorChart />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Пользователи */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-blue-500" />
                  Активность пользователей
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Онлайн сейчас</span>
                    <span className="text-lg font-bold text-white">{systemStats?.onlineUsers || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Активных за 24ч</span>
                    <span className="text-lg font-bold text-white">{systemStats?.activeUsers24h || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Новых за неделю</span>
                    <span className="text-lg font-bold text-white">{systemStats?.newUsersWeek || '0'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Рост
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Сегодня</span>
                    <span className="text-lg font-bold text-green-500">+{systemStats?.newUsersToday || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Эта неделя</span>
                    <span className="text-lg font-bold text-green-500">+{systemStats?.newUsersWeek || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Этот месяц</span>
                    <span className="text-lg font-bold text-green-500">+{systemStats?.newUsersMonth || '0'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Activity className="h-5 w-5 text-orange-500" />
                  Вовлеченность
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">DAU</span>
                    <span className="text-lg font-bold text-white">{systemStats?.dau || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">MAU</span>
                    <span className="text-lg font-bold text-white">{systemStats?.mau || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Retention</span>
                    <span className="text-lg font-bold text-white">{systemStats?.retention || '0'}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Скрипты */}
        <TabsContent value="scripts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Статистика скриптов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Всего скриптов</span>
                    <span className="text-lg font-bold text-white">{systemStats?.totalScripts || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Активных</span>
                    <span className="text-lg font-bold text-green-500">{systemStats?.activeScripts || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">На модерации</span>
                    <span className="text-lg font-bold text-yellow-500">{systemStats?.pendingScripts || '0'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Download className="h-5 w-5 text-blue-500" />
                  Загрузки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Сегодня</span>
                    <span className="text-lg font-bold text-white">{systemStats?.downloadsToday || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Эта неделя</span>
                    <span className="text-lg font-bold text-white">{systemStats?.downloadsWeek || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Всего</span>
                    <span className="text-lg font-bold text-white">{systemStats?.totalDownloads || '0'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Популярные
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="font-medium text-white">1. Dark Theme Pro</div>
                    <div className="text-muted-foreground text-xs">1,234 загрузок</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-white">2. Ad Blocker Plus</div>
                    <div className="text-muted-foreground text-xs">987 загрузок</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-white">3. Speed Booster</div>
                    <div className="text-muted-foreground text-xs">756 загрузок</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Производительность */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  API Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Среднее время ответа</span>
                    <span className="text-lg font-bold text-white">45ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Успешных запросов</span>
                    <span className="text-lg font-bold text-green-500">99.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ошибок</span>
                    <span className="text-lg font-bold text-red-500">0.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Uptime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Сегодня</span>
                    <span className="text-lg font-bold text-green-500">100%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Эта неделя</span>
                    <span className="text-lg font-bold text-green-500">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Этот месяц</span>
                    <span className="text-lg font-bold text-green-500">99.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Server className="h-5 w-5 text-purple-500" />
                  Нагрузка
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Запросов/мин</span>
                    <span className="text-lg font-bold text-white">1,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Активных соединений</span>
                    <span className="text-lg font-bold text-white">45</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Очередь задач</span>
                    <span className="text-lg font-bold text-white">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard;
