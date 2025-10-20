import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Shield, Lock } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const Error403 = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <div className="relative z-content">
        <Header />
        
        <div className="container mx-auto max-w-7xl px-4 py-16 flex items-center justify-center min-h-[calc(100vh-150px)]">
          <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-sm border content-border-30">
            <CardContent className="p-12 text-center">
              {/* Цифра 403 */}
              <div className="mb-8">
                <div className="text-8xl font-bold text-primary mb-4 animate-pulse">
                  403
                </div>
              </div>

              {/* Заголовок */}
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Доступ запрещен
              </h1>
              
              {/* Описание */}
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                У вас нет прав для доступа к этому ресурсу. Возможно, требуется авторизация.
              </p>

              {/* Анимированные элементы блокировки */}
              <div className="flex justify-center gap-3 mb-8">
                <Lock className="h-6 w-6 text-primary animate-pulse" />
                <div className="w-1 h-8 bg-primary animate-pulse"></div>
                <Lock className="h-6 w-6 text-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="w-1 h-8 bg-primary animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <Lock className="h-6 w-6 text-primary animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              {/* Кнопки действий */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link to="/" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    На главную
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="flex items-center gap-2">
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Войти
                  </Link>
                </Button>
                
                <Button variant="outline" onClick={() => window.history.back()} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Назад
                </Button>
              </div>

              {/* Дополнительная информация */}
              <div className="mt-12 p-6 bg-primary/10 rounded-xl border border-primary/20">
                <h3 className="text-lg font-semibold text-primary mb-3">
                  Возможные причины:
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>• Необходима авторизация</li>
                  <li>• Недостаточно прав доступа</li>
                  <li>• Ресурс заблокирован администратором</li>
                  <li>• IP-адрес заблокирован</li>
                </ul>
              </div>

              {/* Информация о безопасности */}
              <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Защищено системой безопасности</span>
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

export default Error403;
