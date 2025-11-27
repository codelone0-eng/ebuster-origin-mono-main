import React, { useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Download,
  Terminal,
  ArrowRight,
  Puzzle,
  Key,
  CheckCircle2,
  Code2
} from 'lucide-react';
import { SilkBackground } from '@/components/SilkBackground';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Documentation = () => {
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

    const cards = cardsRef.current.querySelectorAll('.doc-card');
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

  const quickStartSteps = t('documentation.quickStart.steps');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Download': return Download;
      case 'Puzzle': return Puzzle;
      case 'Key': return Key;
      case 'CheckCircle': return CheckCircle2;
      default: return Code2;
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden text-white">
      <div className="relative">
        <Header />

        <SilkBackground />

        <div className="relative z-10">
        <section className="relative bg-black/80 px-4 py-32 z-10">
          <div className="container mx-auto max-w-7xl px-4 py-16">
        {/* Hero Section */}
        <div ref={heroRef} className="text-center mb-16">
          <div className="hero-element inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#2d2d2d] mb-8">
            <BookOpen className="h-4 w-4 text-white" />
            <span className="text-xs text-white/60 uppercase tracking-wider" style={{ fontSize: '11px', letterSpacing: '0.08em' }}>
              {t('documentation.hero.badge')}
            </span>
          </div>
          
          <h1 className="hero-element text-4xl md:text-6xl font-bold mb-6 text-white" style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: '1.1'
          }}>
            {t('documentation.hero.title')}
          </h1>
          
          <p className="hero-element text-lg text-white/60 max-w-3xl mx-auto mb-8 leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.6' }}>
            {t('documentation.hero.description')}
          </p>

          <div className="hero-element flex items-center justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              className="h-12 px-8 bg-white text-white hover:bg-[#4d4d4d] transition-colors"
              onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('documentation.cta.downloadExtension')}
            </Button>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            {t('documentation.quickStart.title')}
          </h2>

          <div ref={cardsRef} className="grid md:grid-cols-2 gap-6">
            {Array.isArray(quickStartSteps) && quickStartSteps.map((step: any, index: number) => {
              const IconComponent = getIcon(step.icon);
              
              return (
                <Card 
                  key={index} 
                  className="doc-card bg-[#1a1a1a] border-[#2d2d2d] p-6 transition-colors duration-200"
                >
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="text-xs bg-white/5 border border-white/10 text-white/60 border-[#404040]">
                            {t('documentation.quickStart.stepLabel')} {step.step}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {step.title}
                        </h3>
                        <p className="text-white/60 text-sm mb-4" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {step.instructions && Array.isArray(step.instructions) && (
                      <div className="space-y-3">
                        {step.instructions.map((instruction: string, instructionIndex: number) => (
                          <div key={instructionIndex} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-0.5">
                              <span className="text-xs font-semibold text-white">
                                {instructionIndex + 1}
                              </span>
                            </div>
                            <p className="text-sm text-white/60 leading-relaxed" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                              {instruction}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Download CTA Section */}
        <div className="text-center">
          <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-12">
            <CardContent className="p-0">
              <h3 className="text-3xl font-bold mb-4 text-white">{t('documentation.cta.title')}</h3>
              <p className="text-white/60 text-lg mb-6" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                {t('documentation.cta.description')}
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button 
                  size="lg" 
                  className="h-12 px-8 bg-white text-white hover:bg-[#4d4d4d] transition-colors"
                  onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('documentation.cta.downloadExtension')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-12 px-8 bg-[#1a1a1a] border-[#2d2d2d] text-white hover:bg-white/5 border border-white/10 transition-colors"
                  asChild
                >
                  <Link to="/api-docs">
                    <Terminal className="h-4 w-4 mr-2" />
                    API Docs
                  </Link>
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

export default Documentation;
