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
  CheckCircle2, Sparkles, FileCode, Lock, Rocket, Settings, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Smooth scroll animation
  useEffect(() => {
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
  
  return (
    <div className="min-h-screen bg-[#111111] overflow-x-hidden">
      <SEO
        title="EBUSTER — расширение нового поколения для Chrome"
        description="EBUSTER — №1 userscript менеджер с автоматизацией браузера, библиотекой скриптов и API. Бесплатная альтернатива Tampermonkey."
        url="https://ebuster.ru/"
      />
      <div className="relative">
        <AuthStatusChecker />
        <Header />

        {/* Hero Section */}
        <section className="relative pt-32 pb-24 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center max-w-4xl mx-auto fade-in-on-scroll">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#2d2d2d] mb-8">
                <Code2 className="h-4 w-4 text-[#d9d9d9]" />
                <span className="text-xs text-[#808080] uppercase tracking-wider" style={{ fontSize: '11px', letterSpacing: '0.08em' }}>
                  {t('index.hero.badge')}
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white" style={{ 
                fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
                fontWeight: 700,
                lineHeight: '1.1'
              }}>
                {t('index.hero.title')}
              </h1>
              
              <p className="text-xl md:text-2xl text-[#808080] mb-12 max-w-2xl mx-auto leading-relaxed" style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                lineHeight: '1.6'
              }}>
                {t('index.hero.subtitle')}
              </p>

              <div className="flex items-center justify-center gap-4 flex-wrap mb-16">
                <Button 
                  size="lg" 
                  className="h-12 px-8 bg-[#404040] text-white hover:bg-[#4d4d4d] transition-colors"
                  onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
                >
                  <Download className="mr-2 h-5 w-5" />
                  {t('index.hero.getStarted')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 bg-[#1a1a1a] border-[#2d2d2d] text-white hover:bg-[#2d2d2d] transition-colors"
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                >
                  <Terminal className="mr-2 h-5 w-5" />
                  {t('index.hero.documentation')}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 bg-[#1a1a1a]">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16 fade-in-on-scroll">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white" style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 700
              }}>
                {t('index.features.title')}
              </h2>
              <p className="text-lg text-[#808080] max-w-2xl mx-auto" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                {t('index.features.description')}
              </p>
            </div>

            {/* Main Feature Cards */}
            <div className="grid lg:grid-cols-2 gap-6 mb-12">
              <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-8 fade-in-on-scroll transition-colors">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                      <Layers className="h-6 w-6 text-[#d9d9d9]" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white">{t('index.features.modularArchitecture.title')}</h3>
                  </div>
                  <p className="text-[#808080] leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                    {t('index.features.modularArchitecture.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-8 fade-in-on-scroll transition-colors">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                      <Zap className="h-6 w-6 text-[#d9d9d9]" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white">{t('index.features.blazingFast.title')}</h3>
                  </div>
                  <p className="text-[#808080] leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                    {t('index.features.blazingFast.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-8 fade-in-on-scroll transition-colors">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                      <Shield className="h-6 w-6 text-[#d9d9d9]" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white">{t('index.features.fortKnoxSecurity.title')}</h3>
                  </div>
                  <p className="text-[#808080] leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                    {t('index.features.fortKnoxSecurity.description')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Boxes, title: t('index.featuresGrid.structuredLibrary.title'), desc: t('index.featuresGrid.structuredLibrary.description') },
                { icon: Puzzle, title: t('index.featuresGrid.extensibility.title'), desc: t('index.featuresGrid.extensibility.description') },
                { icon: Orbit, title: t('index.featuresGrid.smoothUpdates.title'), desc: t('index.featuresGrid.smoothUpdates.description') },
                { icon: Binary, title: t('index.featuresGrid.strongTyping.title'), desc: t('index.featuresGrid.strongTyping.description') },
                { icon: Cpu, title: t('index.featuresGrid.rationalEfficiency.title'), desc: t('index.featuresGrid.rationalEfficiency.description') },
                { icon: Terminal, title: t('index.featuresGrid.proTools.title'), desc: t('index.featuresGrid.proTools.description') },
              ].map((feature, i) => (
                <Card 
                  key={i}
                  className="bg-[#1a1a1a] border-[#2d2d2d] p-6 fade-in-on-scroll transition-colors"
                >
                  <CardContent className="p-0">
                    <div className="w-10 h-10 rounded-lg bg-[#2d2d2d] flex items-center justify-center mb-4">
                      <feature.icon className="h-5 w-5 text-[#d9d9d9]" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-sm text-[#808080] leading-relaxed" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Extension Features Section */}
        <section className="py-24 px-4 bg-[#111111]">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16 fade-in-on-scroll">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white" style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 700
              }}>
                {t('index.extensionFeatures.title')}
              </h2>
              <p className="text-lg text-[#808080] max-w-2xl mx-auto" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                {t('index.extensionFeatures.description')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                { icon: Code2, title: t('index.extensionFeatures.scriptManager.title'), desc: t('index.extensionFeatures.scriptManager.description') },
                { icon: Cloud, title: t('index.extensionFeatures.cloudSync.title'), desc: t('index.extensionFeatures.cloudSync.description') },
                { icon: User, title: t('index.extensionFeatures.guestMode.title'), desc: t('index.extensionFeatures.guestMode.description') },
                { icon: RefreshCw, title: t('index.extensionFeatures.autoUpdates.title'), desc: t('index.extensionFeatures.autoUpdates.description') },
                { icon: Shield, title: t('index.extensionFeatures.security.title'), desc: t('index.extensionFeatures.security.description') },
                { icon: Sparkles, title: t('index.extensionFeatures.profile.title'), desc: t('index.extensionFeatures.profile.description') },
              ].map((feature, i) => (
                <Card 
                  key={i}
                  className="bg-[#1a1a1a] border-[#2d2d2d] p-6 fade-in-on-scroll transition-colors"
                >
                  <CardContent className="p-0">
                    <div className="w-10 h-10 rounded-lg bg-[#2d2d2d] flex items-center justify-center mb-4">
                      <feature.icon className="h-5 w-5 text-[#d9d9d9]" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-sm text-[#808080] leading-relaxed" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-on-scroll">
              <Button 
                size="lg" 
                className="h-12 px-8 bg-[#404040] text-white hover:bg-[#4d4d4d] transition-colors"
                onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
              >
                <Download className="mr-2 h-5 w-5" />
                {t('index.extensionFeatures.downloadExtension')}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-12 px-8 bg-[#1a1a1a] border-[#2d2d2d] text-white hover:bg-[#2d2d2d] transition-colors"
              >
                <Code2 className="mr-2 h-5 w-5" />
                Документация
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-4 bg-[#1a1a1a]">
          <div className="container mx-auto max-w-4xl">
            <FAQ />
          </div>
        </section>

        <Footer />
      </div>

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

export default Index;
