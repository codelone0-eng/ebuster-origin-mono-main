import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Bug, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const Error500 = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <div className="relative z-content">
        <Header />
        
        <div className="container mx-auto max-w-7xl px-4 py-16 flex items-center justify-center min-h-[calc(100vh-150px)]">
          <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-sm border content-border-30">
            <CardContent className="p-12 text-center">
              {/* Цифра 500 */}
              <div className="mb-8">
                <div className="text-8xl font-bold text-primary mb-4 animate-pulse">
                  500
                </div>
              </div>

              {/* Заголовок */}
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Внутренняя ошибка сервера
              </h1>
              
              {/* Описание */}
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Произошла непредвиденная ошибка на сервере. Мы уже работаем над её устранением.
              </p>

              {/* Анимированные элементы ошибки */}
              <div className="flex justify-center gap-2 mb-8">
                <div className="w-3 h-3 bg-primary rounded-full animate-ping"></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
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
                  <ArrowLeft className="h-4 w-4" />
                  Попробовать снова
                </Button>
              </div>

              {/* Дополнительная информация */}
              <div className="mt-12 p-6 bg-primary/10 rounded-xl border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-primary">
                    Что делать?
                  </h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>• Попробуйте обновить страницу</li>
                  <li>• Проверьте подключение к интернету</li>
                  <li>• Очистите кэш браузера</li>
                  <li>• Если проблема повторяется, обратитесь в поддержку</li>
                </ul>
              </div>

              {/* Код ошибки */}
              <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground font-mono">
                  Error ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Время: {new Date().toLocaleString('ru-RU')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default Error500;
