import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Search, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const Error404 = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <div className="relative z-content">
        <Header />
        
        <div className="container mx-auto max-w-7xl px-4 py-16 flex items-center justify-center min-h-[calc(100vh-150px)]">
          <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-sm border content-border-30">
            <CardContent className="p-12 text-center">
              {/* Цифра 404 */}
              <div className="mb-8">
                <div className="text-8xl font-bold text-primary mb-4 animate-pulse">
                  404
                </div>
              </div>

              {/* Заголовок */}
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Страница не найдена
              </h1>
              
              {/* Описание */}
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                К сожалению, запрашиваемая страница не существует или была перемещена.
              </p>

              {/* Анимированные элементы */}
              <div className="flex justify-center gap-4 mb-8">
                <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
              </div>

              {/* Кнопки действий */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link to="/" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    На главную
                  </Link>
                </Button>
                
                <Button variant="outline" onClick={() => window.history.back()} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Назад
                </Button>
                
                <Button variant="outline" asChild className="flex items-center gap-2">
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Поиск
                  </Link>
                </Button>
              </div>

              {/* Дополнительная информация */}
              <div className="mt-12 p-6 bg-muted/30 rounded-xl">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Возможные причины:
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>• Неправильно введен URL</li>
                  <li>• Страница была перемещена или удалена</li>
                  <li>• Временные технические проблемы</li>
                  <li>• Устаревшая ссылка</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default Error404;
