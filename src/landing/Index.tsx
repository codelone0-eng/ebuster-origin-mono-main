import { Header } from "@/components/Header";
import { FAQ } from "@/components/FAQ";
import { AuthStatusChecker } from "@/components/AuthStatusChecker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { useEffect, useRef } from "react";
import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { 
  Zap, Shield, Layers, ArrowRight, Code2, 
  Terminal, Boxes, Puzzle, Orbit, Binary, Cpu, Download, Cloud, User, RefreshCw,
  Sparkles
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;

    const elements = heroRef.current.querySelectorAll('.hero-element');
    
    gsap.from(elements, {
      opacity: 0,
      y: 40,
      duration: 1,
      stagger: 0.15,
      ease: "power2.out"
    });

    return () => {
      gsap.killTweensOf(elements);
    };
  }, []);

  useEffect(() => {
    if (!featuresRef.current) return;

    const cards = featuresRef.current.querySelectorAll('.feature-card');
    
    cards.forEach((card) => {
      gsap.fromTo(card,
        {
          opacity: 0,
          y: 60,
        },
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

  useEffect(() => {
    const sections = document.querySelectorAll('section[data-section]');
    
    sections.forEach((section) => {
      gsap.fromTo(section,
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none none",
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const features = [
    { icon: Layers, title: t('index.features.modularArchitecture.title'), desc: t('index.features.modularArchitecture.description') },
    { icon: Zap, title: t('index.features.blazingFast.title'), desc: t('index.features.blazingFast.description') },
    { icon: Shield, title: t('index.features.fortKnoxSecurity.title'), desc: t('index.features.fortKnoxSecurity.description') },
  ];

  const gridFeatures = [
    { icon: Boxes, title: t('index.featuresGrid.structuredLibrary.title'), desc: t('index.featuresGrid.structuredLibrary.description') },
    { icon: Puzzle, title: t('index.featuresGrid.extensibility.title'), desc: t('index.featuresGrid.extensibility.description') },
    { icon: Orbit, title: t('index.featuresGrid.smoothUpdates.title'), desc: t('index.featuresGrid.smoothUpdates.description') },
    { icon: Binary, title: t('index.featuresGrid.strongTyping.title'), desc: t('index.featuresGrid.strongTyping.description') },
    { icon: Cpu, title: t('index.featuresGrid.rationalEfficiency.title'), desc: t('index.featuresGrid.rationalEfficiency.description') },
    { icon: Terminal, title: t('index.featuresGrid.proTools.title'), desc: t('index.featuresGrid.proTools.description') },
  ];

  const extensionFeatures = [
    { icon: Code2, title: t('index.extensionFeatures.scriptManager.title'), desc: t('index.extensionFeatures.scriptManager.description') },
    { icon: Cloud, title: t('index.extensionFeatures.cloudSync.title'), desc: t('index.extensionFeatures.cloudSync.description') },
    { icon: User, title: t('index.extensionFeatures.guestMode.title'), desc: t('index.extensionFeatures.guestMode.description') },
    { icon: RefreshCw, title: t('index.extensionFeatures.autoUpdates.title'), desc: t('index.extensionFeatures.autoUpdates.description') },
    { icon: Shield, title: t('index.extensionFeatures.security.title'), desc: t('index.extensionFeatures.security.description') },
    { icon: Sparkles, title: t('index.extensionFeatures.profile.title'), desc: t('index.extensionFeatures.profile.description') },
  ];

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <SEO
        title="EBUSTER — расширение нового поколения для Chrome"
        description="EBUSTER — №1 userscript менеджер с автоматизацией браузера, библиотекой скриптов и API. Бесплатная альтернатива Tampermonkey."
        url="https://ebuster.ru/"
      />
      <div className="relative">
        <AuthStatusChecker />
        <Header />

        {/* Hero Section - Nightwatch style */}
        <section ref={heroRef} className="relative pt-32 pb-32 px-4 min-h-[95vh] flex items-center">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center max-w-6xl mx-auto">
              <h1 className="hero-element text-8xl md:text-[12rem] font-bold mb-8 tracking-tight text-white" style={{ 
                fontSize: 'clamp(5rem, 15vw, 12rem)',
                fontWeight: 700,
                lineHeight: '0.95',
                letterSpacing: '-0.04em'
              }}>
                {t('index.hero.title')}
              </h1>
              
              <p className="hero-element text-2xl md:text-4xl text-white/70 mb-12 max-w-5xl mx-auto leading-relaxed" style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
                lineHeight: '1.5',
                fontWeight: 400
              }}>
                {t('index.hero.subtitle')}
              </p>

              <div className="hero-element flex items-center justify-center gap-4 flex-wrap">
                <Button 
                  size="lg" 
                  className="h-14 px-10 bg-white text-black hover:bg-white/90 transition-colors duration-200 text-base font-medium"
                  onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
                >
                  {t('index.hero.getStarted')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-10 bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/30 transition-colors duration-200 text-base font-medium"
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                >
                  {t('index.hero.documentation')}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Nightwatch style */}
        <section ref={featuresRef} data-section className="py-40 px-4 bg-black relative">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-32">
              <h2 className="text-6xl md:text-8xl font-bold mb-8 text-white" style={{
                fontSize: 'clamp(3rem, 8vw, 6rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: '1'
              }}>
                {t('index.features.title')}
              </h2>
              <p className="text-xl text-white/60 max-w-3xl mx-auto" style={{ fontSize: '18px', lineHeight: '1.6' }}>
                {t('index.features.description')}
              </p>
            </div>

            {/* Main Feature Cards */}
            <div className="grid lg:grid-cols-3 gap-8 mb-24">
              {features.map((feature, i) => (
                <Card 
                  key={i}
                  className="feature-card bg-black border border-white/10 p-12"
                >
                  <CardContent className="p-0">
                    <div className="mb-8">
                      <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-semibold text-white mb-4">{feature.title}</h3>
                    </div>
                    <p className="text-white/60 leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.7' }}>
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {gridFeatures.map((feature, i) => (
                <Card 
                  key={i}
                  className="feature-card bg-black border border-white/10 p-10"
                >
                  <CardContent className="p-0">
                    <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                    <p className="text-white/60 leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Extension Features Section */}
        <section data-section className="py-40 px-4 bg-black relative">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-32">
              <h2 className="text-6xl md:text-8xl font-bold mb-8 text-white" style={{
                fontSize: 'clamp(3rem, 8vw, 6rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: '1'
              }}>
                {t('index.extensionFeatures.title')}
              </h2>
              <p className="text-xl text-white/60 max-w-3xl mx-auto" style={{ fontSize: '18px', lineHeight: '1.6' }}>
                {t('index.extensionFeatures.description')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
              {extensionFeatures.map((feature, i) => (
                <Card 
                  key={i}
                  className="feature-card bg-black border border-white/10 p-10"
                >
                  <CardContent className="p-0">
                    <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                    <p className="text-white/60 leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                className="h-16 px-12 bg-white text-black hover:bg-white/90 transition-colors duration-200 text-lg font-medium"
                onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
              >
                <Download className="mr-2 h-5 w-5" />
                {t('index.extensionFeatures.downloadExtension')}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-16 px-12 bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/30 transition-colors duration-200 text-lg font-medium"
              >
                <Code2 className="mr-2 h-5 w-5" />
                Документация
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section data-section className="py-40 px-4 bg-black">
          <div className="container mx-auto max-w-4xl">
            <FAQ />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default Index;
