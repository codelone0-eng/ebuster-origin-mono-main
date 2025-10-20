import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, RefreshCw, Server } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const Error503 = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <div className="relative z-content">
        <Header />
        
        <div className="container mx-auto max-w-7xl px-4 py-16 flex items-center justify-center min-h-[calc(100vh-150px)]">
          <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-sm border content-border-30">
            <CardContent className="p-12 text-center">
              {/* Цифра 503 */}
              <div className="mb-8">
                <div className="text-8xl font-bold text-primary mb-4 animate-pulse">
                  503
                </div>
              </div>

              {/* Заголовок */}
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Сервис временно недоступен
              </h1>
              
              {/* Описание */}
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Сервер временно перегружен или находится на техническом обслуживании.
              </p>

              {/* Анимированный индикатор загрузки */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-primary/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link to="/" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    На главную
                  </Link>
                </Button>
                
                <Button variant="outline" onClick={() => window.location.reload()} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Обновить
                </Button>
                
                <Button variant="outline" onClick={() => window.history.back()} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Назад
                </Button>
              </div>

              {/* Дополнительная информация */}
              <div className="mt-12 p-6 bg-primary/10 rounded-xl border border-primary/20">
                <h3 className="text-lg font-semibold text-primary mb-3">
                  Что происходит?
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>• Сервер временно перегружен</li>
                  <li>• Выполняется техническое обслуживание</li>
                  <li>• Обновление системы</li>
                  <li>• Попробуйте обновить страницу через несколько минут</li>
                </ul>
              </div>

              {/* Таймер */}
              <div className="mt-8 text-sm text-muted-foreground">
                Автоматическое обновление через: <span className="font-mono text-primary">--:--</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default Error503;
