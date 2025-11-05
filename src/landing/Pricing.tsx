import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/config/api';
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
  Headphones,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: any;
  limits: any;
  is_active: boolean;
  display_order: number;
}

const Pricing = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    window.scrollTo(0, 0);
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/roles`);
      const data = await response.json();

      if (data.success) {
        const filteredRoles = data.data
          .filter((r: Role) => r.is_active && r.name !== 'admin')
          .sort((a: Role, b: Role) => a.display_order - b.display_order);
        
        setRoles(filteredRoles);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить планы подписок',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const faqItems = t('pricing.faq.items');

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % roles.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + roles.length) % roles.length);
  };

  const getPrice = (role: Role) => {
    if (role.name === 'free') return 0;
    return billingPeriod === 'monthly' ? role.price_monthly : role.price_yearly;
  };

  const getFeaturesList = (features: any) => {
    const list: string[] = [];

    if (features.scripts) {
      const count = features.scripts.max_count;
      list.push(count === -1 ? 'Неограниченные скрипты' : `До ${count} скриптов`);
      
      if (features.scripts.can_publish) list.push('Публикация скриптов');
      if (features.scripts.can_feature) list.push('Featured размещение');
      if (features.scripts.can_premium) list.push('Premium скрипты');
    }

    if (features.downloads) {
      if (features.downloads.unlimited) {
        list.push('Неограниченные загрузки');
      } else {
        list.push(`До ${features.downloads.max_per_day} загрузок в день`);
      }
    }

    if (features.support) {
      if (features.support.priority) list.push('Приоритетная поддержка');
      if (features.support.chat) list.push('Чат поддержки');
    }

    if (features.api?.enabled) {
      list.push('API доступ');
    }

    if (features.storage) {
      const size = features.storage.max_size_mb;
      list.push(size === -1 ? 'Неограниченное хранилище' : `${size} МБ хранилища`);
    }

    return list;
  };

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

        {/* Переключатель периода */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 p-1 bg-card/50 backdrop-blur-sm border border-border/30 rounded-lg">
            <Button
              variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingPeriod('monthly')}
            >
              Ежемесячно
            </Button>
            <Button
              variant={billingPeriod === 'yearly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingPeriod('yearly')}
            >
              Ежегодно
              <Badge variant="secondary" className="ml-2">-17%</Badge>
            </Button>
          </div>
        </div>

        {/* Pricing Slider */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="relative mb-16">
            {/* Slider Navigation */}
            {roles.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card/80 backdrop-blur-sm border-border/40"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card/80 backdrop-blur-sm border-border/40"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Slider Container */}
            <div className="overflow-hidden px-12">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {roles.map((role) => {
                  const isPremium = role.name === 'premium';
                  const features = getFeaturesList(role.features);
                  const price = getPrice(role);

                  return (
                    <div key={role.id} className="w-full flex-shrink-0 px-4">
                      <div className={cn(
                        "relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-500",
                        isPremium ? "bg-gradient-to-br from-card/95 via-card/80 to-card/60 border border-border/40" : "bg-gradient-to-br from-card/80 via-card/60 to-card/40 border border-border/20"
                      )}>
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-8">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20"></div>
                          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(96,96,96,0.1),transparent_50%)]"></div>
                          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(96,96,96,0.08),transparent_50%)]"></div>
                        </div>

                        {/* Premium Badge */}
                        {isPremium && (
                          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
                            <Badge className="bg-primary text-primary-foreground px-8 py-3 shadow-2xl border border-primary/30 backdrop-blur-sm text-sm font-bold rounded-full">
                              <Star className="h-4 w-4 mr-2" />
                              Популярный выбор
                            </Badge>
                          </div>
                        )}

                        {/* Content */}
                        <div className="relative z-10 p-8 pt-20">
                          <div className="text-center pb-8">
                            <div className={cn(
                              "inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 border",
                              isPremium ? "bg-primary/20 border-primary/30" : "bg-muted/20 border-border/30"
                            )}>
                              {isPremium ? (
                                <Crown className="h-8 w-8 text-primary" />
                              ) : (
                                <Code2 className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <h3 className={cn(
                              "text-3xl mb-4 font-bold",
                              isPremium && "gradient-text"
                            )}>
                              {role.display_name}
                            </h3>
                            <div className="mb-6">
                              <span className={cn(
                                "text-5xl font-bold",
                                isPremium && "gradient-text"
                              )}>
                                {price}₽
                              </span>
                              {price > 0 && (
                                <span className="text-muted-foreground ml-2 text-lg">
                                  /{billingPeriod === 'monthly' ? 'мес' : 'год'}
                                </span>
                              )}
                            </div>
                            <p className="text-base text-muted-foreground/90 font-medium">
                              {role.description}
                            </p>
                          </div>

                          <div className="space-y-6">
                            <ul className="space-y-4">
                              {features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-4">
                                  <div className={cn(
                                    "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 border",
                                    isPremium ? "bg-primary/15 border-primary/20" : "bg-muted/20 border-border/20"
                                  )}>
                                    <Check className={cn(
                                      "h-4 w-4",
                                      isPremium ? "text-primary" : "text-muted-foreground"
                                    )} />
                                  </div>
                                  <span className="text-sm text-muted-foreground font-medium leading-relaxed">
                                    {feature}
                                  </span>
                                </li>
                              ))}
                            </ul>

                            <Button 
                              className={cn(
                                "w-full h-12 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl",
                                isPremium ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border/30"
                              )}
                              variant={isPremium ? "default" : "outline"}
                            >
                              {role.name === 'free' ? 'Начать бесплатно' : 'Выбрать план'}
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Slider Dots */}
            {roles.length > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {roles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      currentSlide === index ? "bg-primary w-8" : "bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Old static grid - removed */}
        <div className="hidden md:grid-cols-2 gap-8 mb-16">
          {[].map((plan: any, index: number) => {
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