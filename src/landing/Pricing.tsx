import React, { useEffect, useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/config/api';
import { 
  Check, 
  Shield, 
  Crown,
  ArrowRight,
  Download,
  Code2,
  Loader2,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FAQ } from '@/components/FAQ';
import { SilkBackground } from '@/components/SilkBackground';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadRoles();
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;

    const elements = heroRef.current.querySelectorAll('.hero-element');
    gsap.from(elements, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out"
    });

    return () => {
      gsap.killTweensOf(elements);
    };
  }, []);

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll('.pricing-card');
    cards.forEach((card) => {
      gsap.fromTo(card,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none none",
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [roles]);

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

  const getPrice = (role: Role) => {
    if (role.name === 'free') return 0;
    return billingPeriod === 'monthly' ? role.price_monthly : role.price_yearly;
  };

  const getFeaturesList = (features: any) => {
    const list: string[] = [];

    if (!features) return ['Базовые возможности'];

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
      } else if (features.downloads.max_per_day) {
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

    return list.length > 0 ? list : ['Базовые возможности'];
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden text-white">
      <div className="relative">
        <Header />

        <SilkBackground />

        {/* Content container */}
        <div className="relative z-10">
        
        <section className="relative px-4 py-32 z-10">
          <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <div ref={heroRef} className="text-center mb-16">
            <div className="hero-element inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <Crown className="h-4 w-4 text-white/70" />
              <span className="text-xs text-white/60 uppercase tracking-wider">
                {t('pricing.hero.badge')}
              </span>
            </div>
            
            <h1 className="hero-element text-4xl md:text-6xl font-semibold mb-6 text-white">
              {t('pricing.hero.title')}
            </h1>
            
            <p className="hero-element text-lg text-white/60 max-w-3xl mx-auto mb-8 leading-relaxed">
              {t('pricing.hero.description')}
            </p>

            <div className="hero-element flex items-center justify-center gap-4 mb-12">
              <Button 
                size="lg" 
                className="h-12 px-8 bg-white text-black hover:bg-white/90 transition-colors"
                onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                {t('pricing.cta.downloadExtension')}
              </Button>
            </div>
          </div>

          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-0 p-1 bg-white/5 border border-white/10 rounded-lg">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors rounded",
                  billingPeriod === 'monthly'
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                Ежемесячно
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors rounded",
                  billingPeriod === 'yearly'
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                Ежегодно
                <Badge className="ml-2 bg-white/10 text-white text-[10px] px-1.5 py-0">-17%</Badge>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-white/60" />
            </div>
          ) : (
            <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {roles.map((role, index) => {
                const isPremium = role.name === 'premium' || role.name === 'pro';
                const features = getFeaturesList(role.features);
                const price = getPrice(role);

                return (
                  <Card
                    key={role.id}
                    className={cn(
                      "pricing-card rounded-xl border border-white/10 bg-white/[0.02] p-8 transition-colors duration-200",
                      !isPremium && "hover:border-white/20"
                    )}
                  >
                    {isPremium && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <Badge className="bg-white text-black px-3 py-1 text-xs font-semibold">
                          <Star className="h-3 w-3 mr-1" />
                          Популярный
                        </Badge>
                      </div>
                    )}

                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="text-center mb-6">
                        <div className={cn(
                          "inline-flex items-center justify-center w-14 h-14 rounded-lg mb-4 border",
                          "bg-white/5 border-white/10"
                        )}>
                          {isPremium ? (
                            <Crown className="h-6 w-6 text-white" />
                          ) : (
                            <Code2 className="h-5 w-5 text-white/60" />
                          )}
                        </div>
                        <h3 className="text-2xl font-semibold mb-2 text-white">
                          {role.display_name}
                        </h3>
                        <div className="mb-3">
                          <span className="text-4xl font-semibold text-white">
                            {price}₽
                          </span>
                          {price > 0 && (
                            <span className="text-white/60 ml-1 text-sm">
                              /{billingPeriod === 'monthly' ? 'мес' : 'год'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/60">
                          {role.description}
                        </p>
                      </div>

                      <div className="flex-1 flex flex-col space-y-4">
                        <ul className="space-y-3">
                          {features.slice(0, 8).map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start gap-2">
                              <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-white/60" />
                              <span className="text-sm text-white/60">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <Button 
                          className="w-full h-10 rounded-lg font-semibold text-sm mt-auto transition-colors bg-white text-black hover:bg-white/90"
                        >
                          {role.name === 'free' ? 'Начать бесплатно' : 'Выбрать план'}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* FAQ Section */}
          <div className="mb-16">
            <div className="max-w-4xl mx-auto">
              <FAQ />
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="rounded-xl border border-white/10 bg-white/[0.02] p-12">
              <CardContent className="p-0">
                <h3 className="text-3xl font-semibold mb-4 text-white">{t('pricing.cta.title')}</h3>
                <p className="text-white/60 text-lg mb-6">
                  {t('pricing.cta.description')}
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Button 
                    size="lg" 
                    className="h-12 px-8 bg-white text-black hover:bg-white/90 transition-colors"
                    onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t('pricing.cta.downloadExtension')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-12 px-8 bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/40 transition-colors"
                    asChild
                  >
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
        </section>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default Pricing;
