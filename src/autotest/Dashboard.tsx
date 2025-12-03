import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Square, RefreshCw, Settings, 
  Activity, CheckCircle2, XCircle, Clock, AlertCircle,
  FileCode, Video, Download, Upload, Trash2, Edit,
  Plus, Search, Filter, Calendar, TrendingUp, TrendingDown,
  Zap, Database, Server, Globe, Code2, Terminal,
  BarChart3, PieChart, LineChart, History, Bell,
  Save, FolderOpen, Share2, Copy, Eye, EyeOff, Film
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SilkBackground } from '@/components/SilkBackground';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { useLanguage } from '@/hooks/useLanguage';

interface TestRun {
  id: string;
  status: 'running' | 'passed' | 'failed' | 'skipped' | 'idle';
  startTime: string;
  endTime?: string;
  duration?: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  logs: Array<{
    timestamp: string;
    level: 'info' | 'success' | 'error' | 'warning';
    message: string;
  }>;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  file: string;
  lastRun?: string;
  status?: 'passed' | 'failed' | 'not-run';
  duration?: number;
}

const Dashboard = () => {
  const { t } = useLanguage();
  const [testState, setTestState] = useState<TestRun>({
    id: '',
    status: 'idle',
    startTime: '',
    summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
    logs: []
  });
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [history, setHistory] = useState<TestRun[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // WebSocket через API сервер
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const apiHost = window.location.hostname === 'autotest.ebuster.ru' || window.location.hostname === 'localhost'
      ? 'api.ebuster.ru'
      : window.location.host.replace(':80', '').replace(':443', '');
    const wsUrl = `${protocol}//${apiHost}/ws`;
    console.log('🔌 Подключение к WebSocket:', wsUrl);
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('✅ WebSocket подключен');
    };

    websocket.onmessage = (e) => {
      try {
        const { type, data } = JSON.parse(e.data);
        if (type === 'state') {
          setTestState(data);
        } else if (type === 'log') {
          setTestState(prev => ({
            ...prev,
            logs: [...prev.logs, data]
          }));
        } else if (type === 'end') {
          setTestState(data);
          setHistory(prev => Array.isArray(prev) ? [data, ...prev].slice(0, 50) : [data]);
        }
      } catch (err) {
        console.error('Ошибка парсинга WebSocket:', err);
      }
    };

    websocket.onerror = () => console.error('WebSocket ошибка');
    websocket.onclose = () => console.log('WebSocket закрыт');

    setWs(websocket);
    loadStatus();
    loadHistory();
    loadTestSuites();

    return () => {
      websocket.close();
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [testState.logs]);

  const getApiUrl = (endpoint: string) => {
    // Всегда используем api.ebuster.ru для autotest API
    if (window.location.hostname === 'autotest.ebuster.ru' || window.location.hostname === 'localhost') {
      return `https://api.ebuster.ru/api/autotest${endpoint}`;
    }
    return `/api/autotest${endpoint}`;
  };

  const loadStatus = async () => {
    try {
      const res = await fetch(getApiUrl('/status'));
      if (!res.ok) {
        console.warn('⚠️ Не удалось загрузить статус:', res.status, res.statusText);
        return;
      }
      const data = await res.json();
      setTestState(data);
    } catch (err) {
      console.error('Ошибка загрузки статуса:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(getApiUrl('/history'));
      if (!res.ok) {
        console.warn('⚠️ Не удалось загрузить историю:', res.status, res.statusText);
        return;
      }
      const data = await res.json();
      // Убеждаемся, что data - это массив
      if (Array.isArray(data)) {
        setHistory(data);
      } else {
        console.warn('⚠️ API вернул не массив:', data);
        setHistory([]);
      }
    } catch (err) {
      console.error('Ошибка загрузки истории:', err);
      setHistory([]);
    }
  };

  const loadTestSuites = async () => {
    try {
      const res = await fetch(getApiUrl('/suites'));
      if (!res.ok) {
        console.warn('⚠️ Не удалось загрузить тест-сьюты:', res.status, res.statusText);
        return;
      }
      const data = await res.json();
      // Убеждаемся, что data - это массив
      if (Array.isArray(data)) {
        setTestSuites(data);
      } else {
        console.warn('⚠️ API вернул не массив:', data);
        setTestSuites([]);
      }
    } catch (err) {
      console.error('Ошибка загрузки тест-сьютов:', err);
      setTestSuites([]);
    }
  };

  const runTests = async () => {
    if (testState.status === 'running') return;
    
    try {
      const res = await fetch(getApiUrl('/run'), { method: 'POST' });
      if (!res.ok) throw new Error('Ошибка запуска');
    } catch (err) {
      console.error('Ошибка запуска тестов:', err);
      alert('Ошибка запуска тестов');
    }
  };

  const stopTests = async () => {
    try {
      await fetch(getApiUrl('/stop'), { method: 'POST' });
    } catch (err) {
      console.error('Ошибка остановки:', err);
    }
  };

  const resetState = async () => {
    try {
      await fetch(getApiUrl('/reset'), { method: 'POST' });
    } catch (err) {
      console.error('Ошибка сброса:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      case 'passed': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'failed': return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'skipped': return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
      default: return 'bg-white/5 text-white/60 border-white/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4 animate-pulse" />;
      case 'passed': return <CheckCircle2 className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'skipped': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '--';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const successRate = testState.summary.total > 0 
    ? ((testState.summary.passed / testState.summary.total) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-black overflow-x-hidden text-white">
      <SEO
        title="Автотестирование — Ebuster"
        description="Профессиональная система автотестирования для мониторинга качества UI и API"
        url="https://autotest.ebuster.ru"
      />
      <div className="relative">
        <SilkBackground />
        
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="relative px-4 py-20 border-b border-white/10">
            <div className="container mx-auto max-w-[1440px]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-white mb-4">
                    Автотестирование
                  </h1>
                  <p className="text-xl text-white/60 max-w-2xl">
                    Профессиональная система мониторинга качества UI и API в реальном времени
                  </p>
                </div>
                <div className="flex gap-3">
                  {testState.status === 'running' ? (
                    <Button
                      onClick={stopTests}
                      className="h-12 px-6 bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Остановить
                    </Button>
                  ) : (
                    <Button
                      onClick={runTests}
                      disabled={testState.status === 'running'}
                      className="h-12 px-6 bg-white text-black hover:bg-white/90"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Запустить тесты
                    </Button>
                  )}
                  <Button
                    onClick={resetState}
                    variant="outline"
                    className="h-12 px-6 bg-white/5 border-white/20 text-white hover:bg-white/10"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Сброс
                  </Button>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(testState.status)}`}>
                {getStatusIcon(testState.status)}
                <span className="text-sm font-medium capitalize">
                  {testState.status === 'idle' ? 'Ожидание' : 
                   testState.status === 'running' ? 'Выполняется...' :
                   testState.status === 'passed' ? 'Успешно' :
                   testState.status === 'failed' ? 'Провалено' : 'Пропущено'}
                </span>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="relative px-4 py-12">
            <div className="container mx-auto max-w-[1440px]">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-[#2a2a2a] border border-white/10 p-1.5 gap-1.5 rounded-lg">
                  <TabsTrigger 
                    value="dashboard" 
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 px-4 py-2.5 rounded-md transition-all hover:text-white hover:bg-white/5 font-medium"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Дашборд
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tests" 
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 px-4 py-2.5 rounded-md transition-all hover:text-white hover:bg-white/5 font-medium"
                  >
                    <FileCode className="h-4 w-4 mr-2" />
                    Тесты
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 px-4 py-2.5 rounded-md transition-all hover:text-white hover:bg-white/5 font-medium"
                  >
                    <History className="h-4 w-4 mr-2" />
                    История
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reports" 
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 px-4 py-2.5 rounded-md transition-all hover:text-white hover:bg-white/5 font-medium"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Отчеты
                  </TabsTrigger>
                  <TabsTrigger 
                    value="recorder" 
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 px-4 py-2.5 rounded-md transition-all hover:text-white hover:bg-white/5 font-medium"
                  >
                    <Film className="h-4 w-4 mr-2" />
                    Recorder
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 px-4 py-2.5 rounded-md transition-all hover:text-white hover:bg-white/5 font-medium"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Настройки
                  </TabsTrigger>
                </TabsList>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-white/[0.02] border-white/10 backdrop-blur-xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-white/60 uppercase tracking-wider">
                          Всего тестов
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold text-white mb-2">
                          {testState.summary.total || 0}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Database className="h-4 w-4" />
                          <span>Всего выполнено</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/[0.02] border-white/10 backdrop-blur-xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-white/60 uppercase tracking-wider">
                          Успешно
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold text-emerald-400 mb-2">
                          {testState.summary.passed || 0}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span>Пройдено</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/[0.02] border-white/10 backdrop-blur-xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-white/60 uppercase tracking-wider">
                          Провалено
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold text-red-400 mb-2">
                          {testState.summary.failed || 0}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <XCircle className="h-4 w-4 text-red-400" />
                          <span>Ошибок</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/[0.02] border-white/10 backdrop-blur-xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-white/60 uppercase tracking-wider">
                          Успешность
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold text-white mb-2">
                          {successRate}%
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          {parseFloat(successRate) >= 90 ? (
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-400" />
                          )}
                          <span>Процент успеха</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Logs */}
                  <Card className="bg-white/[0.02] border-white/10 backdrop-blur-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-white">
                          Логи выполнения
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTestState(prev => ({ ...prev, logs: [] }))}
                          className="text-white/60 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-[500px] overflow-y-auto space-y-2 font-mono text-sm">
                        {testState.logs.length === 0 ? (
                          <div className="text-center py-12 text-white/40">
                            Логи появятся здесь при запуске тестов
                          </div>
                        ) : (
                          testState.logs.map((log, idx) => (
                            <div
                              key={idx}
                              className="flex gap-4 py-2 border-b border-white/5 last:border-0"
                            >
                              <span className="text-white/40 min-w-[80px]">
                                {new Date(log.timestamp).toLocaleTimeString('ru-RU')}
                              </span>
                              <span
                                className={`flex-1 ${
                                  log.level === 'error' ? 'text-red-400' :
                                  log.level === 'success' ? 'text-emerald-400' :
                                  log.level === 'warning' ? 'text-yellow-400' :
                                  'text-white/80'
                                }`}
                              >
                                {log.message}
                              </span>
                            </div>
                          ))
                        )}
                        <div ref={logsEndRef} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tests Tab */}
                <TabsContent value="tests" className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                      <Input
                        placeholder="Поиск тестов..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <Button className="bg-white text-black hover:bg-white/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить тест
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.isArray(testSuites) && testSuites.length > 0 ? (
                      testSuites.map((suite) => (
                        <Card key={suite.id} className="bg-white/[0.02] border-white/10 backdrop-blur-xl hover:border-white/20 transition-colors">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg text-white mb-1">
                                  {suite.name}
                                </CardTitle>
                                <p className="text-sm text-white/60 line-clamp-2">
                                  {suite.description}
                                </p>
                              </div>
                              {suite.status && (
                                <Badge className={getStatusColor(suite.status)}>
                                  {suite.status === 'passed' ? '✓' : suite.status === 'failed' ? '✗' : '○'}
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                              <span className="flex items-center gap-2">
                                <FileCode className="h-4 w-4" />
                                {suite.file}
                              </span>
                              {suite.duration && (
                                <span className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {formatDuration(suite.duration)}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1 bg-white/5 border-white/10">
                                <Play className="h-3 w-3 mr-2" />
                                Запустить
                              </Button>
                              <Button variant="outline" size="sm" className="bg-white/5 border-white/10">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm" className="bg-white/5 border-white/10">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <p className="text-white/60">Тест-сьюты не найдены</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-4">
                  <div className="space-y-4">
                    {Array.isArray(history) && history.length > 0 ? (
                      history.map((run) => (
                        <Card key={run?.id || Math.random()} className="bg-white/[0.02] border-white/10 backdrop-blur-xl">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {getStatusIcon(run?.status || 'idle')}
                                <div>
                                  <CardTitle className="text-white">
                                    Запуск #{run?.id ? String(run.id).slice(-8) : 'N/A'}
                                  </CardTitle>
                                  <p className="text-sm text-white/60">
                                    {run?.startTime ? new Date(run.startTime).toLocaleString('ru-RU') : 'Неизвестно'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm text-white/60">Длительность</div>
                                  <div className="text-white font-medium">
                                    {formatDuration(run?.duration || 0)}
                                  </div>
                                </div>
                                <Badge className={getStatusColor(run?.status || 'idle')}>
                                  {run?.summary?.passed || 0}/{run?.summary?.total || 0}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 text-white/60">
                        История запусков пуста
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Reports Tab */}
                <TabsContent value="reports">
                  <Card className="bg-white/[0.02] border-white/10 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileCode className="h-5 w-5" />
                        Отчеты
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {testState.summary.total > 0 && (
                          <div className="flex gap-4">
                            <a 
                              href={`https://api.ebuster.ru/api/autotest/reports/view/index.html`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-emerald-400 flex items-center gap-2 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              Открыть HTML отчет
                            </a>
                          </div>
                        )}
                        <div className="text-white/60">
                          {testState.summary.total === 0 ? (
                            <p>Запустите тесты, чтобы увидеть отчеты</p>
                          ) : (
                            <div className="space-y-2">
                              <p>Всего тестов: {testState.summary.total}</p>
                              <p className="text-emerald-400">Пройдено: {testState.summary.passed}</p>
                              <p className="text-red-400">Провалено: {testState.summary.failed}</p>
                              {testState.summary.skipped > 0 && (
                                <p className="text-yellow-400">Пропущено: {testState.summary.skipped}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Recorder Tab */}
                <TabsContent value="recorder">
                  <Card className="bg-white/[0.02] border-white/10 backdrop-blur-xl">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Film className="h-5 w-5 text-white" />
                        <CardTitle className="text-white">Playwright Test Recorder</CardTitle>
                      </div>
                      <p className="text-white/60 mt-2">
                        Записывайте действия в браузере и генерируйте готовые тесты
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-white/60 mb-2 block">URL для тестирования</label>
                          <Input
                            id="recorder-url"
                            placeholder="https://lk.ebuster.ru"
                            className="bg-white/5 border-white/10 text-white"
                            defaultValue="https://lk.ebuster.ru"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-white/60 mb-2 block">Имя файла</label>
                          <Input
                            id="recorder-file"
                            placeholder="my-test.spec.ts"
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-white text-black hover:bg-white/90"
                        onClick={async () => {
                          const urlInput = document.getElementById('recorder-url') as HTMLInputElement;
                          const fileInput = document.getElementById('recorder-file') as HTMLInputElement;
                          
                          try {
                            const apiUrl = getApiUrl('/recorder/start');
                            const res = await fetch(apiUrl, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                url: urlInput?.value || 'https://lk.ebuster.ru',
                                outputFile: fileInput?.value || undefined
                              })
                            });
                            const data = await res.json();
                            if (res.ok) {
                              alert(data.message || 'Браузер открыт. Выполните действия и закройте браузер.');
                            } else {
                              alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
                            }
                          } catch (err: any) {
                            alert('Ошибка: ' + err.message);
                          }
                        }}
                      >
                        <Film className="h-4 w-4 mr-2" />
                        Начать запись
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings">
                  <Card className="bg-white/[0.02] border-white/10 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle>Настройки</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/60">Настройки в разработке</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

