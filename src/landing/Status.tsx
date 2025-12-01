import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SilkBackground } from '@/components/SilkBackground';
import { useLanguage } from '@/hooks/useLanguage';
import { API_CONFIG } from '@/config/api';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Clock, Server, Database, Mail, Globe, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'checking';
  responseTime?: number;
  lastChecked?: string;
  message?: string;
}

interface SystemStatus {
  api: ServiceStatus;
  database: ServiceStatus;
  email: ServiceStatus;
  frontend: ServiceStatus;
  uptime?: string;
  timestamp?: string;
}

const Status = () => {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<SystemStatus>({
    api: { name: 'API Backend', status: 'checking' },
    database: { name: 'Database', status: 'checking' },
    email: { name: 'Email Service', status: 'checking' },
    frontend: { name: 'Frontend', status: 'checking' }
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const checkServiceStatus = async () => {
    setIsRefreshing(true);
    const newStatus: SystemStatus = {
      api: { name: 'API Backend', status: 'checking' },
      database: { name: 'Database', status: 'checking' },
      email: { name: 'Email Service', status: 'checking' },
      frontend: { name: 'Frontend', status: 'checking' }
    };

    try {
      // Check API Health
      const startTime = performance.now();
      try {
        const healthResponse = await fetch(`${API_CONFIG.BASE_URL}/api/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });
        const responseTime = Math.round(performance.now() - startTime);
        
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          newStatus.api = {
            name: 'API Backend',
            status: 'operational',
            responseTime,
            lastChecked: new Date().toISOString(),
            message: `Uptime: ${Math.floor(healthData.uptime / 3600)}h`
          };
        } else {
          newStatus.api = {
            name: 'API Backend',
            status: 'down',
            responseTime,
            lastChecked: new Date().toISOString(),
            message: `HTTP ${healthResponse.status}`
          };
        }
      } catch (error) {
        newStatus.api = {
          name: 'API Backend',
          status: 'down',
          lastChecked: new Date().toISOString(),
          message: 'Connection timeout'
        };
      }

      // Check Database (real connection check)
      try {
        const dbStartTime = performance.now();
        const dbResponse = await fetch(`${API_CONFIG.BASE_URL}/api/health/database`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });
        const dbResponseTime = Math.round(performance.now() - dbStartTime);
        const dbData = await dbResponse.json();
        
        if (dbResponse.ok && dbData.status === 'operational') {
          newStatus.database = {
            name: 'Database',
            status: 'operational',
            responseTime: dbResponseTime,
            lastChecked: new Date().toISOString(),
            message: dbData.message || 'Connected'
          };
        } else if (dbData.status === 'degraded') {
          newStatus.database = {
            name: 'Database',
            status: 'degraded',
            responseTime: dbResponseTime,
            lastChecked: new Date().toISOString(),
            message: dbData.message || 'Limited connectivity'
          };
        } else {
          newStatus.database = {
            name: 'Database',
            status: 'down',
            responseTime: dbResponseTime,
            lastChecked: new Date().toISOString(),
            message: dbData.message || 'Connection failed'
          };
        }
      } catch (error) {
        newStatus.database = {
          name: 'Database',
          status: 'down',
          lastChecked: new Date().toISOString(),
          message: 'Connection failed'
        };
      }

      // Check Email Service
      try {
        const emailStartTime = performance.now();
        const emailResponse = await fetch(`${API_CONFIG.EMAIL_URL}/status`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });
        const emailResponseTime = Math.round(performance.now() - emailStartTime);
        
        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          newStatus.email = {
            name: 'Email Service',
            status: emailData.smtpConnected ? 'operational' : 'degraded',
            responseTime: emailResponseTime,
            lastChecked: new Date().toISOString(),
            message: emailData.smtpConnected ? 'SMTP connected' : 'SMTP disconnected'
          };
        } else {
          newStatus.email = {
            name: 'Email Service',
            status: 'degraded',
            responseTime: emailResponseTime,
            lastChecked: new Date().toISOString(),
            message: 'Service unavailable'
          };
        }
      } catch (error) {
        newStatus.email = {
          name: 'Email Service',
          status: 'down',
          lastChecked: new Date().toISOString(),
          message: 'Connection failed'
        };
      }

      // Check Frontend (self-check)
      newStatus.frontend = {
        name: 'Frontend',
        status: 'operational',
        responseTime: 0,
        lastChecked: new Date().toISOString(),
        message: 'Online'
      };

      // Get system uptime if available
      try {
        const monitorResponse = await fetch(`${API_CONFIG.BASE_URL}/api/system-monitor`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });
        if (monitorResponse.ok) {
          const monitorData = await monitorResponse.json();
          if (monitorData.data?.uptime) {
            newStatus.uptime = monitorData.data.uptime;
          }
        }
      } catch (error) {
        // Ignore
      }

      newStatus.timestamp = new Date().toISOString();
      setStatus(newStatus);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkServiceStatus();
    const interval = setInterval(checkServiceStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out'
        }
      );
    }
  }, []);

  useEffect(() => {
    if (cardsRef.current) {
      const cards = cardsRef.current.children;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
  }, [status]);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Activity className="h-5 w-5 text-white/40 animate-spin" />;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'border-emerald-400/20';
      case 'degraded':
        return 'border-yellow-400/20';
      case 'down':
        return 'border-red-400/20';
      default:
        return 'border-white/10';
    }
  };

  const getStatusText = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'Работает штатно';
      case 'degraded':
        return 'Работает с ограничениями';
      case 'down':
        return 'Недоступен';
      default:
        return 'Проверка...';
    }
  };

  const getServiceIcon = (name: string) => {
    if (name.includes('API')) return <Server className="h-5 w-5" />;
    if (name.includes('Database')) return <Database className="h-5 w-5" />;
    if (name.includes('Email')) return <Mail className="h-5 w-5" />;
    if (name.includes('Frontend')) return <Globe className="h-5 w-5" />;
    return <Activity className="h-5 w-5" />;
  };

  // Проверяем только сервисы (api, database, email, frontend), исключая uptime и timestamp
  const allOperational = [status.api, status.database, status.email, status.frontend].every(
    (service) => service.status === 'operational'
  );

  return (
    <div className="min-h-screen bg-black overflow-x-hidden text-white">
      <div className="relative">
        <Header />

        <SilkBackground />

        <div className="relative z-10">
          <main className="flex-1">
            <section className="relative px-4 py-32 z-10">
              <div className="container mx-auto max-w-7xl px-4 py-16">
                {/* Hero Section */}
                <div ref={heroRef} className="text-center mb-16">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                    <Activity className="h-4 w-4 text-white" />
                    <span className="text-xs text-white/60 uppercase tracking-wider" style={{ fontSize: '11px', letterSpacing: '0.08em' }}>
                      Доступность систем
                    </span>
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white" style={{
                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                    fontWeight: 700,
                    lineHeight: '1.1'
                  }}>
                    Статус сервисов EBUSTER
                  </h1>
                  
                  <p className="text-lg text-white/60 max-w-3xl mx-auto mb-8 leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    Мониторинг доступности всех систем и сервисов в реальном времени
                  </p>

                  <div className="flex items-center justify-center gap-4 mb-8">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                      allOperational 
                        ? 'bg-emerald-400/10 border border-emerald-400/20' 
                        : 'bg-yellow-400/10 border border-yellow-400/20'
                    }`}>
                      {allOperational ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                      )}
                      <span className="text-sm font-medium text-white">
                        {allOperational ? 'Все системы работают' : 'Обнаружены проблемы'}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={checkServiceStatus}
                      disabled={isRefreshing}
                      className="border-white/10 bg-white/5 hover:bg-white/10"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Обновить
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-white/40">
                    <Clock className="h-4 w-4" />
                    <span>Последнее обновление: {lastUpdate.toLocaleTimeString('ru-RU')}</span>
                  </div>
                </div>

                {/* Status Cards */}
                <div ref={cardsRef} className="grid md:grid-cols-2 gap-6 mb-16">
                  {Object.values(status).filter((service): service is ServiceStatus => 
                    typeof service === 'object' && 'name' in service
                  ).map((service, index) => (
                    <Card
                      key={index}
                      className={`rounded-xl border border-white/10 bg-white/[0.02] p-6 ${getStatusColor(service.status)}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                            {getServiceIcon(service.name)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">{service.name}</h3>
                            <p className="text-sm text-white/60">{getStatusText(service.status)}</p>
                          </div>
                        </div>
                        {getStatusIcon(service.status)}
                      </div>

                      <div className="space-y-2 pt-4 border-t border-white/10">
                        {service.responseTime !== undefined && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/60">Время отклика:</span>
                            <span className="text-white font-medium">{service.responseTime}ms</span>
                          </div>
                        )}
                        {service.message && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/60">Статус:</span>
                            <span className="text-white font-medium">{service.message}</span>
                          </div>
                        )}
                        {service.lastChecked && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/60">Проверено:</span>
                            <span className="text-white/40 text-xs">
                              {new Date(service.lastChecked).toLocaleTimeString('ru-RU')}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {/* System Info */}
                {status.uptime && (
                  <Card className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                        <Activity className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Системная информация</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-white/60">Время работы:</span>
                        <p className="text-white font-medium">{status.uptime}</p>
                      </div>
                      {status.timestamp && (
                        <div>
                          <span className="text-sm text-white/60">Последняя проверка:</span>
                          <p className="text-white font-medium">
                            {new Date(status.timestamp).toLocaleString('ru-RU')}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </section>
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Status;

