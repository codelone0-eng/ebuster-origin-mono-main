import React, { useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { 
  Terminal,
  ArrowRight,
  CheckCircle2,
  Rocket,
  Users,
  Award,
  Code2
} from 'lucide-react';
import { SilkBackground } from '@/components/SilkBackground';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Advantages = () => {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
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

    const cards = cardsRef.current.querySelectorAll('.advantage-card');
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
  }, []);

  const coreAdvantages = t('advantages.advantages');

  return (
    <div className="min-h-screen bg-black overflow-x-hidden text-white">
      <div className="relative">
      <Header />
      
        <SilkBackground />

        <div className="relative z-10">
        <section className="relative px-4 py-32 z-10">
      <div className="container mx-auto max-w-7xl px-4 py-16">
        {/* Hero Section */}
        <div ref={heroRef} className="text-center mb-16">
          <div className="hero-element inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <Award className="h-4 w-4 text-white" />
            <span className="text-xs text-white/60 uppercase tracking-wider" style={{ fontSize: '11px', letterSpacing: '0.08em' }}>
              {t('advantages.hero.badge')}
            </span>
          </div>
          
          <h1 className="hero-element text-4xl md:text-6xl font-bold mb-6 text-white" style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: '1.1'
          }}>
            {t('advantages.hero.title')}
          </h1>
          
          <p className="hero-element text-lg text-white/60 max-w-3xl mx-auto mb-8 leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.6' }}>
            {t('advantages.hero.description')}
          </p>

          <div className="hero-element flex items-center justify-center gap-4 mb-12 flex-wrap">
            <Button 
              size="lg" 
              className="h-12 px-8 bg-white text-white hover:bg-white/90 transition-colors"
            >
              <Rocket className="h-4 w-4 mr-2" />
              {t('advantages.cta.getStarted')}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-12 px-8 bg-[#1a1a1a] border-[#2d2d2d] text-white hover:bg-white/5 border border-white/10 transition-colors"
            >
              <Terminal className="h-4 w-4 mr-2" />
              {t('advantages.cta.viewApi')}
            </Button>
          </div>
        </div>

        {/* Core Advantages */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            {t('advantages.features.title')}
          </h2>

          <div ref={cardsRef} className="grid md:grid-cols-2 gap-6">
            {Array.isArray(coreAdvantages) && coreAdvantages.map((advantage: any, index: number) => {
              const IconComponent = advantage.icon || Code2;
              return (
                <Card 
                  key={index} 
                  className="advantage-card bg-[#1a1a1a] border-[#2d2d2d] p-6 transition-colors duration-200"
                >
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        {typeof IconComponent === 'string' ? (
                          <Code2 className="h-6 w-6 text-white" />
                        ) : (
                          <IconComponent className="h-6 w-6 text-white" />
                        )}
                    </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{advantage.title}</h3>
                        <p className="text-white/60 text-sm leading-relaxed" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                        {advantage.description}
                        </p>
                      </div>
                    </div>
                    {advantage.features && Array.isArray(advantage.features) && (
                      <ul className="space-y-2 mt-4">
                        {advantage.features.map((feature: string, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-white flex-shrink-0" />
                            <span className="text-white/60" style={{ fontSize: '14px' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                    )}
                </CardContent>
              </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-12">
            <CardContent className="p-0">
              <h3 className="text-3xl font-bold mb-4 text-white">{t('advantages.cta.title')}</h3>
              <p className="text-white/60 text-lg mb-6" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                {t('advantages.cta.description')}
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button 
                  size="lg" 
                  className="h-12 px-8 bg-white text-white hover:bg-white/90 transition-colors"
                  onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  {t('advantages.cta.getStarted')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-12 px-8 bg-[#1a1a1a] border-[#2d2d2d] text-white hover:bg-white/5 border border-white/10 transition-colors"
                >
                  <Users className="h-4 w-4 mr-2" />
                  {t('advantages.cta.joinCommunity')}
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

export default Advantages;
