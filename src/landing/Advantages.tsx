import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { 
  Zap, 
  Shield, 
  Layers, 
  Terminal,
  ArrowRight,
  CheckCircle,
  Rocket,
  Users,
  Award,
  Key
} from 'lucide-react';

const Advantages = () => {
  const { t } = useLanguage();

  // Упрощенные карточки без раскрытия внутренних метрик/тех. деталей
  const coreAdvantages = t('advantages.advantages');

  const technicalSpecs = [
    {
      category: "Производительность",
      specs: [
        { label: "Время отклика", value: "< 50ms" },
        { label: "Пропускная способность", value: "10,000+ RPS" },
        { label: "Доступность", value: "99.99%" },
        { label: "Масштабирование", value: "Горизонтальное" }
      ]
    },
    {
      category: "Безопасность",
      specs: [
        { label: "Шифрование", value: "AES-256" },
        { label: "Аутентификация", value: "OAuth 2.0" },
        { label: "Сертификация", value: "SOC 2 Type II" },
        { label: "Аудит", value: "Полное логирование" }
      ]
    },
    {
      category: "Интеграция",
      specs: [
        { label: "API форматы", value: "REST + GraphQL" },
        { label: "SDK языки", value: "8+ языков" },
        { label: "Документация", value: "Интерактивная" },
        { label: "Поддержка", value: "24/7" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card/50 backdrop-blur-sm border content-border-50 mb-8">
            <Award className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-muted-foreground">{t('advantages.hero.badge')}</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            {t('advantages.hero.title')} <span className="gradient-text">{t('advantages.hero.subtitle')}</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            {t('advantages.hero.description')}
          </p>

          <div className="flex items-center justify-center gap-4 mb-12">
            <Button size="lg" className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
              <Rocket className="h-4 w-4 mr-2" />
              {t('advantages.cta.getStarted')}
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8">
              <Terminal className="h-4 w-4 mr-2" />
              {t('advantages.cta.viewApi')}
            </Button>
          </div>

        </div>

        {/* Core Advantages */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            {t('advantages.features.title')}
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {coreAdvantages.map((advantage, index) => (
              <Card key={index} className="bg-card/30 backdrop-blur-sm border content-border-30 hover:bg-card/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <advantage.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{advantage.title}</CardTitle>
                      <CardDescription className="text-base">
                        {advantage.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {advantage.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technical Specifications — скрыты по требованиям приватности */}

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary/5 via-transparent to-accent/5 border content-border-30 p-12">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">{t('advantages.cta.title')}</CardTitle>
              <CardDescription className="text-lg">
                {t('advantages.cta.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4">
                <Button size="lg" className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Rocket className="h-4 w-4 mr-2" />
                  {t('advantages.cta.getStarted')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8">
                  <Users className="h-4 w-4 mr-2" />
                  {t('advantages.cta.joinCommunity')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Advantages;
