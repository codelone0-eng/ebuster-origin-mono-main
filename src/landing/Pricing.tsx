import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Crown,
  ArrowRight,
  Download,
  Code2,
  Terminal,
  Headphones
} from 'lucide-react';

const Pricing = () => {
  const { t } = useLanguage();

  const plans = [
    {
      name: t('pricing.plans.0.name'),
      price: t('pricing.plans.0.price'),
      period: t('pricing.plans.0.period'),
      description: t('pricing.plans.0.description'),
      features: t('pricing.plans.0.features'),
      buttonText: t('pricing.plans.0.buttonText'),
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: t('pricing.plans.1.name'),
      price: t('pricing.plans.1.price'),
      period: t('pricing.plans.1.period'),
      description: t('pricing.plans.1.description'),
      features: t('pricing.plans.1.features'),
      buttonText: t('pricing.plans.1.buttonText'),
      buttonVariant: "default" as const,
      popular: true
    }
  ];

  const faqItems = t('pricing.faq.items');

  // Function to get appropriate icon for each feature
  const getFeatureIcon = (feature: string) => {
    if (feature.includes('скрипт')) return Code2;
    if (feature.includes('API')) return Terminal;
    if (feature.includes('поддержка')) return Headphones;
    if (feature.includes('управление')) return Shield;
    if (feature.includes('документация')) return Crown;
    if (feature.includes('безопасность')) return Shield;
    if (feature.includes('экспорт') || feature.includes('импорт')) return Download;
    if (feature.includes('аналитика')) return Zap;
    if (feature.includes('репозиторий')) return Code2;
    if (feature.includes('интеграция')) return Terminal;
    return Check;
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <div className="relative z-content">
        <Header />
        
        <div className="container mx-auto max-w-7xl px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card/50 backdrop-blur-sm border content-border-50 mb-8">
            <Crown className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-muted-foreground">{t('pricing.hero.badge')}</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            {t('pricing.hero.title')} <span className="gradient-text">{t('pricing.hero.subtitle')}</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            {t('pricing.hero.description')}
          </p>

          <div className="flex items-center justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('pricing.cta.downloadExtension')}
            </Button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {plans.map((plan, index) => {
            const CardComponent = plan.popular ? (
              <div className="relative group">
                <style>
                  {`
                    @keyframes premium-glow {
                      0% {
                        box-shadow: 0 0 0 0 hsl(var(--primary) / 0.3), 0 0 0 0 hsl(var(--primary) / 0.2);
                      }
                      50% {
                        box-shadow: 0 0 0 4px hsl(var(--primary) / 0.4), 0 0 0 8px hsl(var(--primary) / 0.2);
                      }
                      100% {
                        box-shadow: 0 0 0 0 hsl(var(--primary) / 0.3), 0 0 0 0 hsl(var(--primary) / 0.2);
                      }
                    }
                    .premium-card {
                      animation: premium-glow 2s ease-in-out infinite;
                    }
                  `}
                </style>
                {/* Premium Card with Modern Design */}
                <div className="premium-card relative bg-gradient-to-br from-card/95 via-card/80 to-card/60 backdrop-blur-xl border content-border-40 hover:content-border-70 transition-all duration-500 pt-20 overflow-hidden shadow-2xl rounded-3xl">
                  {/* Modern Background Pattern */}
                  <div className="absolute inset-0 opacity-8 group-hover:opacity-12 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(96,96,96,0.1),transparent_50%)]"></div>
                    <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(96,96,96,0.08),transparent_50%)]"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl"></div>
                  </div>
                  
                  {/* Premium Badge */}
                  {plan.popular && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-content">
                      <Badge className="bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground px-8 py-3 shadow-2xl border border-primary/30 backdrop-blur-sm text-sm font-bold rounded-full">
                        <Star className="h-4 w-4 mr-2" />
                        Популярный выбор
                      </Badge>
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="relative z-content p-8">
                    <div className="text-center pb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 mb-6">
                        <Crown className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-3xl mb-4 font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                        {plan.name}
                      </h3>
                      <div className="mb-6">
                        <span className="text-5xl font-bold gradient-text">{plan.price}</span>
                        {plan.period && (
                          <span className="text-muted-foreground ml-2 text-lg">/{plan.period}</span>
                        )}
                      </div>
                      <p className="text-base text-muted-foreground/90 font-medium">
                        {plan.description}
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      <ul className="space-y-4">
                        {plan.features.map((feature, featureIndex) => {
                          const IconComponent = getFeatureIcon(feature);
                          
                          return (
                            <li key={featureIndex} className="flex items-start gap-4 group/item">
                              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-r from-primary/15 to-accent/15 flex items-center justify-center mt-0.5 group-hover/item:scale-110 transition-all duration-200 border border-primary/20">
                                <IconComponent className="h-4 w-4 text-primary" />
                              </div>
                              <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors duration-200 font-medium leading-relaxed">
                                {feature}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      
                      <Button 
                        className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl"
                        variant="default"
                      >
                        {plan.buttonText}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative group">
                {/* Free Card with Modern Design */}
                <div className="relative bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl border content-border-20 hover:content-border-40 transition-all duration-500 overflow-hidden shadow-lg rounded-3xl">
                  {/* Modern Background Pattern */}
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-8 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-muted/10 via-transparent to-muted/10"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(192,192,192,0.08),transparent_50%)]"></div>
                    <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(192,192,192,0.06),transparent_50%)]"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-muted/5 to-muted/10 rounded-full blur-2xl"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-content p-8">
                    <div className="text-center pb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-muted/20 to-muted/30 border content-border-30 mb-6">
                        <Code2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-2xl mb-4 font-bold text-foreground">
                        {plan.name}
                      </h3>
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                        {plan.period && (
                          <span className="text-muted-foreground ml-2 text-base">/{plan.period}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground/80 font-medium">
                        {plan.description}
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => {
                          const IconComponent = getFeatureIcon(feature);
                          
                          return (
                            <li key={featureIndex} className="flex items-start gap-3 group/item">
                              <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-muted/20 flex items-center justify-center mt-0.5 group-hover/item:scale-110 transition-all duration-200 border content-border-20">
                                <IconComponent className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors duration-200 font-medium leading-relaxed">
                                {feature}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      
                      <Button 
                        className="w-full h-12 bg-muted text-muted-foreground hover:bg-muted/80 rounded-xl font-semibold text-base transition-all duration-200 shadow-md hover:shadow-lg border content-border-30"
                        variant="outline"
                      >
                        {plan.buttonText}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );

            return (
              <div key={index}>
                {CardComponent}
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            {t('pricing.faq.title')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {faqItems.map((item, index) => (
              <Card key={index} className="bg-card/30 backdrop-blur-sm border content-border-30">
                <CardHeader>
                  <CardTitle className="text-lg">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {item.answer}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary/5 via-transparent to-accent/5 border content-border-30 p-12">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">{t('pricing.cta.title')}</CardTitle>
              <CardDescription className="text-lg">
                {t('pricing.cta.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('pricing.cta.downloadExtension')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                  <a href="/contacts">
                    <Shield className="h-4 w-4 mr-2" />
                    {t('pricing.cta.contactUs')}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default Pricing;