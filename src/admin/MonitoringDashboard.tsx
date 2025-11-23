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
  return (
    <div className="space-y-6">
      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg hover:bg-[#1f1f1f] transition-colors duration-200">
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

        <Card className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg hover:bg-[#1f1f1f] transition-colors duration-200">
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

        <Card className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg hover:bg-[#1f1f1f] transition-colors duration-200">
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

        <Card className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg hover:bg-[#1f1f1f] transition-colors duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Система</p>
                <p className="text-2xl font-bold text-foreground">{systemStats?.systemUptime || '99.9%'}</p>
                <p className="text-xs text-primary">Uptime</p>
              </div>
              <Server className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Подвкладки мониторинга */}
      <Tabs defaultValue="system" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-[#111111] border border-[#2d2d2d] rounded-md">
          <TabsTrigger value="system" className="data-[state=active]:bg-[#1f1f1f] data-[state=active]:text-white">
            Система
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-[#1f1f1f] data-[state=active]:text-white">
            Пользователи
          </TabsTrigger>
          <TabsTrigger value="scripts" className="data-[state=active]:bg-[#1f1f1f] data-[state=active]:text-white">
            Скрипты
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-[#1f1f1f] data-[state=active]:text-white">
            Производительность
          </TabsTrigger>
        </TabsList>

        {/* Система */}
        <TabsContent value="system" className="space-y-6">
          <Card className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg">
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

          <Card className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg">
            <CardHeader>
              <CardTitle>Графики системы</CardTitle>
            </CardHeader>
            <CardContent>
              <SystemMonitorChart />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Пользователи */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Активность пользователей
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Онлайн сейчас</span>
                    <span className="text-lg font-bold">{systemStats?.onlineUsers || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Активных за 24ч</span>
                    <span className="text-lg font-bold">{systemStats?.activeUsers24h || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Новых за неделю</span>
                    <span className="text-lg font-bold">{systemStats?.newUsersWeek || '0'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Рост
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Сегодня</span>
                    <span className="text-lg font-bold text-green-600">+{systemStats?.newUsersToday || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Эта неделя</span>
                    <span className="text-lg font-bold text-green-600">+{systemStats?.newUsersWeek || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Этот месяц</span>
                    <span className="text-lg font-bold text-green-600">+{systemStats?.newUsersMonth || '0'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Вовлеченность
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">DAU</span>
                    <span className="text-lg font-bold">{systemStats?.dau || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">MAU</span>
                    <span className="text-lg font-bold">{systemStats?.mau || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Retention</span>
                    <span className="text-lg font-bold">{systemStats?.retention || '0'}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Скрипты */}
        <TabsContent value="scripts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Статистика скриптов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Всего скриптов</span>
                    <span className="text-lg font-bold">{systemStats?.totalScripts || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Активных</span>
                    <span className="text-lg font-bold text-green-600">{systemStats?.activeScripts || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">На модерации</span>
                    <span className="text-lg font-bold text-yellow-600">{systemStats?.pendingScripts || '0'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Загрузки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Сегодня</span>
                    <span className="text-lg font-bold">{systemStats?.downloadsToday || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Эта неделя</span>
                    <span className="text-lg font-bold">{systemStats?.downloadsWeek || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Всего</span>
                    <span className="text-lg font-bold">{systemStats?.totalDownloads || '0'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Популярные
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="font-medium">1. Dark Theme Pro</div>
                    <div className="text-muted-foreground">1,234 загрузок</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">2. Ad Blocker Plus</div>
                    <div className="text-muted-foreground">987 загрузок</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">3. Speed Booster</div>
                    <div className="text-muted-foreground">756 загрузок</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Производительность */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  API Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Среднее время ответа</span>
                    <span className="text-lg font-bold">45ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Успешных запросов</span>
                    <span className="text-lg font-bold text-green-600">99.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ошибок</span>
                    <span className="text-lg font-bold text-red-600">0.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Uptime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Сегодня</span>
                    <span className="text-lg font-bold text-green-600">100%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Эта неделя</span>
                    <span className="text-lg font-bold text-green-600">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Этот месяц</span>
                    <span className="text-lg font-bold text-green-600">99.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Нагрузка
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Запросов/мин</span>
                    <span className="text-lg font-bold">1,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Активных соединений</span>
                    <span className="text-lg font-bold">45</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Очередь задач</span>
                    <span className="text-lg font-bold">0</span>
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
