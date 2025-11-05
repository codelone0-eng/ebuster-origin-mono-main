import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { 
  Rocket, 
  Code2, 
  Zap, 
  Bell,
  ArrowRight,
  Sparkles,
  Terminal,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ComingSoon = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Ошибка',
        description: 'Введите email адрес',
        variant: 'destructive'
      });
      return;
    }

    // TODO: Отправка на бэкенд
    setIsSubscribed(true);
    toast({
      title: 'Успешно!',
      description: 'Мы уведомим вас о запуске',
    });
  };

  const features = [
    {
      icon: Code2,
      title: 'REST API',
      description: 'Полный доступ к функциям EBUSTER через REST API'
    },
    {
      icon: Terminal,
      title: 'WebSocket',
      description: 'Реалтайм взаимодействие со скриптами'
    },
    {
      icon: Zap,
      title: 'Webhooks',
      description: 'Автоматические уведомления о событиях'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <ParticleBackground />
      
      {/* Animated gradient orbs */}
      <div 
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(var(--primary-rgb, 0, 255, 163), 0.15), transparent 40%)`
        }}
      />

      <div className="relative z-10">
        <Header />
        
        <div className="container mx-auto px-4 py-20 md:py-32">
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-8">
            {/* Animated Rocket */}
            <div className="relative inline-block">
              <div className="absolute inset-0 blur-3xl bg-primary/30 animate-pulse" />
              <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 p-8 rounded-3xl border border-primary/30 backdrop-blur-sm">
                <Rocket className="h-20 w-20 text-primary animate-bounce" />
              </div>
            </div>

            {/* Title with gradient */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-semibold text-primary">Скоро запуск</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  API Документация
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Мы работаем над созданием мощного API для интеграции EBUSTER в ваши проекты
              </p>
            </div>

            {/* Countdown or Progress */}
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Готовности</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Endpoints</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">Q1</div>
                <div className="text-sm text-muted-foreground">2025</div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={cn(
                  "relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm p-6",
                  "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300",
                  "hover:-translate-y-1"
                )}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                
                <div className="relative space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Notify Form */}
          <Card className="max-w-2xl mx-auto p-8 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20">
                <Bell className="h-8 w-8 text-primary animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Узнайте первыми о запуске</h2>
                <p className="text-muted-foreground">
                  Оставьте email и мы пришлем уведомление, когда API будет доступен
                </p>
              </div>

              {!isSubscribed ? (
                <form onSubmit={handleSubscribe} className="flex gap-3">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 h-12 bg-background/50 border-border/50"
                  />
                  <Button 
                    type="submit"
                    size="lg"
                    className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Подписаться
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <span className="text-primary font-semibold">
                    Вы подписаны! Мы уведомим вас о запуске
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">
              Пока API в разработке, вы можете использовать расширение
            </p>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl', '_blank')}
            >
              Скачать расширение
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        <Footer />
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default ComingSoon;
