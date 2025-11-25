import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { 
  Zap, 
  Shield, 
  Layers, 
  Terminal,
  ArrowRight,
  CheckCircle2,
  Rocket,
  Users,
  Award,
  Key,
  Code2,
  Download
} from 'lucide-react';

const Advantages = () => {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-in-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const coreAdvantages = t('advantages.advantages');

  return (
    <div className="min-h-screen bg-[#111111]">
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 fade-in-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#2d2d2d] mb-8">
            <Award className="h-4 w-4 text-[#d9d9d9]" />
            <span className="text-xs text-[#808080] uppercase tracking-wider" style={{ fontSize: '11px', letterSpacing: '0.08em' }}>
              {t('advantages.hero.badge')}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white" style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: '1.1'
          }}>
            {t('advantages.hero.title')}
          </h1>
          
          <p className="text-lg text-[#808080] max-w-3xl mx-auto mb-8 leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.6' }}>
            {t('advantages.hero.description')}
          </p>

          <div className="flex items-center justify-center gap-4 mb-12 flex-wrap">
            <Button 
              size="lg" 
              className="h-12 px-8 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Rocket className="h-4 w-4 mr-2" />
              {t('advantages.cta.getStarted')}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-12 px-8 bg-[#1a1a1a] border-[#2d2d2d] text-white hover:bg-[#2d2d2d] transition-colors"
            >
              <Terminal className="h-4 w-4 mr-2" />
              {t('advantages.cta.viewApi')}
            </Button>
          </div>
        </div>

        {/* Core Advantages */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-white fade-in-on-scroll">
            {t('advantages.features.title')}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {Array.isArray(coreAdvantages) && coreAdvantages.map((advantage: any, index: number) => {
              const IconComponent = advantage.icon || Code2;
              return (
                <Card 
                  key={index} 
                  className="bg-[#1f1f1f] border-[#2d2d2d] p-6 fade-in-on-scroll hover:border-blue-500/30 transition-colors"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-600/10 flex items-center justify-center">
                        {typeof IconComponent === 'string' ? (
                          <Code2 className="h-6 w-6 text-blue-500" />
                        ) : (
                          <IconComponent className="h-6 w-6 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{advantage.title}</h3>
                        <p className="text-[#808080] text-sm leading-relaxed" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                          {advantage.description}
                        </p>
                      </div>
                    </div>
                    {advantage.features && Array.isArray(advantage.features) && (
                      <ul className="space-y-2 mt-4">
                        {advantage.features.map((feature: string, featureIndex: number) => (
                          <li key={featureIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span className="text-[#808080]" style={{ fontSize: '14px' }}>{feature}</span>
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
        <div className="text-center fade-in-on-scroll">
          <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-12">
            <CardContent className="p-0">
              <h3 className="text-3xl font-bold mb-4 text-white">{t('advantages.cta.title')}</h3>
              <p className="text-[#808080] text-lg mb-6" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                {t('advantages.cta.description')}
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button 
                  size="lg" 
                  className="h-12 px-8 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  {t('advantages.cta.getStarted')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-12 px-8 bg-[#1a1a1a] border-[#2d2d2d] text-white hover:bg-[#2d2d2d] transition-colors"
                >
                  <Users className="h-4 w-4 mr-2" />
                  {t('advantages.cta.joinCommunity')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-in-on-scroll {
          opacity: 0;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Advantages;
