import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Clock } from 'lucide-react';

interface SystemMonitorChartProps {
  onRefresh?: () => void;
}

const SystemMonitorChart: React.FC<SystemMonitorChartProps> = ({ onRefresh }) => {
  const [timeRange, setTimeRange] = useState('1h');
  const [chartData, setChartData] = useState<any[]>([]);

  // Генерируем данные для графиков
  useEffect(() => {
    const generateData = () => {
      const now = Date.now();
      const points = timeRange === '1h' ? 12 : timeRange === '6h' ? 36 : timeRange === '24h' ? 48 : 168;
      const interval = timeRange === '1h' ? 5 * 60 * 1000 : timeRange === '6h' ? 10 * 60 * 1000 : timeRange === '24h' ? 30 * 60 * 1000 : 60 * 60 * 1000;
      
      const data = [];
      for (let i = points; i >= 0; i--) {
        const time = new Date(now - i * interval);
        const hours = time.getHours();
        const minutes = time.getMinutes();
        
        // Симулируем реалистичные данные с паттернами
        const baseLoad = 30 + Math.sin(hours / 24 * Math.PI * 2) * 20;
        const randomVariation = Math.random() * 10;
        
        data.push({
          time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
          cpu: Math.min(100, Math.max(0, baseLoad + randomVariation)),
          memory: Math.min(100, Math.max(0, 50 + Math.sin(hours / 12 * Math.PI) * 15 + Math.random() * 5)),
          disk: Math.min(100, Math.max(0, 23 + Math.random() * 2)),
          network: Math.min(100, Math.max(0, 15 + Math.sin(hours / 6 * Math.PI) * 10 + Math.random() * 5)),
        });
      }
      
      setChartData(data);
    };

    generateData();
    
    const interval = setInterval(generateData, 180000); // Обновляем каждые 3 минуты

    return () => clearInterval(interval);
  }, [timeRange]);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              История мониторинга
              <span className="text-xs text-muted-foreground ml-2">({chartData.length} точек)</span>
            </CardTitle>
            <CardDescription>
              Отслеживание производительности системы в реальном времени
            </CardDescription>
          </div>
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="1h">1ч</TabsTrigger>
              <TabsTrigger value="6h">6ч</TabsTrigger>
              <TabsTrigger value="24h">24ч</TabsTrigger>
              <TabsTrigger value="7d">7д</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* CPU График */}
          <div>
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Загрузка CPU
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="time" 
                  stroke="#888"
                  tick={{ fontSize: 12 }}
                  interval={Math.floor(chartData.length / 6)}
                />
                <YAxis 
                  stroke="#888"
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: '1px solid #333',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#colorCpu)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Memory График */}
          <div>
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Использование памяти
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="time" 
                  stroke="#888"
                  tick={{ fontSize: 12 }}
                  interval={Math.floor(chartData.length / 6)}
                />
                <YAxis 
                  stroke="#888"
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: '1px solid #333',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorMemory)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Network График */}
          <div>
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Сетевая активность
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="time" 
                  stroke="#888"
                  tick={{ fontSize: 12 }}
                  interval={Math.floor(chartData.length / 6)}
                />
                <YAxis 
                  stroke="#888"
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: '1px solid #333',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="network" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemMonitorChart;
