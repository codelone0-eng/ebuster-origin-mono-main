import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Server, Bug, Shield } from 'lucide-react';

const ErrorPagesDemo = () => {
  const errorPages = [
    {
      code: '404',
      title: 'Страница не найдена',
      description: 'Запрашиваемая страница не существует',
      icon: AlertTriangle,
      color: 'text-primary',
      path: '/404',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    },
    {
      code: '403',
      title: 'Доступ запрещен',
      description: 'Недостаточно прав для доступа',
      icon: Shield,
      color: 'text-primary',
      path: '/403',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    },
    {
      code: '500',
      title: 'Внутренняя ошибка сервера',
      description: 'Непредвиденная ошибка на сервере',
      icon: Bug,
      color: 'text-primary',
      path: '/500',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    },
    {
      code: '503',
      title: 'Сервис недоступен',
      description: 'Сервер временно перегружен',
      icon: Server,
      color: 'text-primary',
      path: '/503',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <div className="relative z-content">
        <Header />
        
        <div className="container mx-auto max-w-7xl px-4 py-16">
          {/* Заголовок */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Страницы ошибок
            </h1>
            <p className="text-xl text-muted-foreground">
              Красивые и функциональные страницы ошибок в стиле сайта
            </p>
          </div>

          {/* Сетка страниц ошибок */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {errorPages.map((page) => {
              const IconComponent = page.icon;
              return (
                <Card key={page.code} className={`${page.bgColor} ${page.borderColor} border-2 hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="text-6xl font-bold text-primary mb-2">
                        {page.code}
                      </div>
                    </div>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {page.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {page.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button asChild className="w-full">
                      <Link to={page.path}>
                        Посмотреть
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Дополнительная информация */}
          <Card className="bg-card/50 backdrop-blur-sm border content-border-30">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground text-center">
                Особенности страниц ошибок
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Красивый дизайн</h3>
                  <p className="text-sm text-muted-foreground">
                    Страницы выполнены в едином стиле с основным сайтом
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Анимации</h3>
                  <p className="text-sm text-muted-foreground">
                    Плавные анимации и интерактивные элементы
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔧</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Функциональность</h3>
                  <p className="text-sm text-muted-foreground">
                    Полезные кнопки и информация для пользователя
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Кнопка назад */}
          <div className="text-center mt-12">
            <Button asChild variant="outline">
              <Link to="/">
                Вернуться на главную
              </Link>
            </Button>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default ErrorPagesDemo;
