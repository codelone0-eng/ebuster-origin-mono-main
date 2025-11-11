import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Award, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            О <span className="gradient-text">нас</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Мы создаем инновационные решения для разработчиков и бизнеса
          </p>
        </div>

        {/* Mission & Values */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-card/30 backdrop-blur-sm border content-border-30">
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Наша миссия</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Предоставлять высококачественные инструменты и сервисы, которые помогают разработчикам создавать лучшие продукты быстрее и эффективнее.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border content-border-30">
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Наши ценности</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Инновации, качество, прозрачность и забота о наших пользователях — это основа всего, что мы делаем.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Team & Community */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-card/30 backdrop-blur-sm border content-border-30">
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Команда</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Наша команда состоит из опытных разработчиков, дизайнеров и специалистов по поддержке, которые работают над созданием лучших решений для вас.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border content-border-30">
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Достижения</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Мы гордимся доверием наших пользователей и постоянно работаем над улучшением наших продуктов и сервисов.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;
