import { Header } from "@/components/Header";
import { FAQ } from "@/components/FAQ";
import { AuthStatusChecker } from "@/components/AuthStatusChecker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { useEffect, useRef, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { 
  Zap, Shield, Layers, ArrowRight, Code2, 
  Boxes, Puzzle, Orbit, Binary, Cpu, Cloud, User, RefreshCw,
  Sparkles, Terminal, Download, Globe, Send, Bell, Briefcase, 
  Database, Mail, Calendar, CheckCircle2, AlertCircle, Settings,
  Copy, Check, FileCode, Clock, Activity, TrendingUp, ChevronDown
} from "lucide-react";
import { SilkBackground } from "@/components/SilkBackground";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const featureBlocksRef = useRef<HTMLDivElement>(null);
  
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
      y: 50,
      duration: 1,
      stagger: 0.15,
      ease: "power3.out"
    });

    return () => {
      gsap.killTweensOf(elements);
    };
  }, []);

  useEffect(() => {
    if (!featureBlocksRef.current) return;

    const blocks = featureBlocksRef.current.querySelectorAll('[data-block]');
    
    blocks.forEach((block) => {
      gsap.fromTo(block,
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: block,
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

  // Events section features - 9 cards in 3x3 grid
  const eventFeatures = [
    { icon: Globe, title: t('index.featuresGrid.structuredLibrary.title'), desc: t('index.featuresGrid.structuredLibrary.description') },
    { icon: Send, title: t('index.featuresGrid.extensibility.title'), desc: t('index.featuresGrid.extensibility.description') },
    { icon: Bell, title: t('index.featuresGrid.smoothUpdates.title'), desc: t('index.featuresGrid.smoothUpdates.description') },
    { icon: Briefcase, title: t('index.featuresGrid.strongTyping.title'), desc: t('index.featuresGrid.strongTyping.description') },
    { icon: Database, title: t('index.featuresGrid.rationalEfficiency.title'), desc: t('index.featuresGrid.rationalEfficiency.description') },
    { icon: Mail, title: t('index.featuresGrid.proTools.title'), desc: t('index.featuresGrid.proTools.description') },
    { icon: Terminal, title: t('index.extensionFeatures.scriptManager.title'), desc: t('index.extensionFeatures.scriptManager.description') },
    { icon: Zap, title: t('index.extensionFeatures.cloudSync.title'), desc: t('index.extensionFeatures.cloudSync.description') },
    { icon: Calendar, title: t('index.extensionFeatures.autoUpdates.title'), desc: t('index.extensionFeatures.autoUpdates.description') },
  ];


  // Infrastructure features
  const infrastructureFeatures = useMemo(() => [
    { icon: Code2, title: t('index.infrastructure.performance'), desc: t('index.infrastructure.performanceDesc') },
    { icon: Cloud, title: t('index.infrastructure.storage'), desc: t('index.infrastructure.storageDesc') },
    { icon: Zap, title: t('index.infrastructure.api'), desc: t('index.infrastructure.apiDesc') },
  ], [t]);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden text-white">
      <SEO
        title="EBUSTER — расширение нового поколения для Chrome"
        description="EBUSTER — №1 userscript менеджер с автоматизацией браузера, библиотекой скриптов и API. Бесплатная альтернатива Tampermonkey."
        url="https://ebuster.ru/"
      />
      <div className="relative">
        <AuthStatusChecker />
        <Header />

        <SilkBackground />

        {/* Контейнер для всего контента */}
        <div className="relative z-10">

            {/* Hero Section - Minimalist Nightwatch style */}
          <section ref={heroRef} className="relative overflow-hidden border-b border-white/10" style={{ minHeight: '600px' }}>
            <div className="absolute inset-0 bg-black/80" />
            
            <div className="relative py-40 px-4 z-10">
              <div className="container mx-auto max-w-[1440px]">
                <div className="max-w-[672px] mx-auto text-center">
                  <h1 className="hero-element text-7xl md:text-9xl font-semibold tracking-tight leading-[0.95] text-white mb-6">
                    {t('index.hero.title')}
                  </h1>
                  <p className="hero-element text-xl md:text-2xl text-white/60 max-w-[613px] mx-auto leading-relaxed mb-10">
                    {t('index.hero.subtitle')}
                  </p>

                  <div className="hero-element flex flex-wrap items-center justify-center gap-4">
                    <Button 
                      size="lg" 
                      className="h-11 px-6 bg-white text-black hover:bg-white/90 text-base font-normal rounded-lg"
                      onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
                    >
                      {t('index.hero.getStarted')}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-11 px-6 bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/40 transition-colors text-base font-normal rounded-lg"
                      onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                    >
                      {t('index.hero.documentation')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Start monitoring section - Exact Nightwatch style from Figma */}
          <section ref={featureBlocksRef} className="relative bg-black/80 px-4 py-32 z-10" data-section>
          <div className="container mx-auto max-w-[1440px]">
            <div className="max-w-[1312px] mx-auto">
              <div className="grid lg:grid-cols-[1fr,1fr] gap-16 items-start mb-24" data-block>
                <div className="space-y-6">
                  <span className="inline-flex px-3 py-1.5 text-xs uppercase tracking-[0.4em] text-emerald-300/70 font-medium border border-emerald-300/20 rounded bg-emerald-300/5">
                    {t('index.scripts.badge')}
                  </span>
                  <h2 className="text-4xl md:text-6xl font-semibold leading-tight text-white">
                    {t('index.scripts.title')}
                  </h2>
                  <p className="text-white/60 text-lg max-w-xl leading-relaxed">
                    {t('index.scripts.description')}
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Installation steps cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                      <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Шаг 1</div>
                      <div className="text-white text-lg font-semibold mb-1">{t('index.scripts.step1')}</div>
                      <div className="text-white/40 text-xs">Установка расширения</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                      <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Шаг 2</div>
                      <div className="text-white text-lg font-semibold mb-1">{t('index.scripts.step2')}</div>
                      <div className="text-white/40 text-xs">Открытие интерфейса</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                      <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Шаг 3</div>
                      <div className="text-white text-lg font-semibold mb-1">{t('index.scripts.step3')}</div>
                      <div className="text-white/40 text-xs">Просмотр библиотеки</div>
                      </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                      <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Шаг 4</div>
                      <div className="text-white text-lg font-semibold mb-1">{t('index.scripts.step4')}</div>
                      <div className="text-white/40 text-xs">Установка скрипта</div>
                    </div>
                  </div>

                  {/* Metrics cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                      <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">{t('index.scripts.installedScripts')}</div>
                      <div className="text-white text-3xl font-semibold mb-1">{t('index.scripts.installedCount')}</div>
                      <div className="text-white/40 text-xs">{t('index.scripts.installedDesc')}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                      <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">{t('index.scripts.libraryScripts')}</div>
                      <div className="text-white text-3xl font-semibold mb-1">{t('index.scripts.libraryCount')}</div>
                      <div className="text-white/40 text-xs">{t('index.scripts.libraryDesc')}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Script metrics cards - unified style */}
              <div className="mt-16 grid md:grid-cols-3 gap-6" data-block>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Script Executions</div>
                  <div className="text-white text-2xl font-semibold mb-1">24.2k</div>
                  <div className="text-white/40 text-xs mb-4">executions today</div>
                  {/* TODO: Заменить на график выполнения скриптов (линейный график с временной шкалой) */}
                  <div className="h-[80px] bg-white/5 rounded border border-white/10 flex items-center justify-center mt-4">
                    <div className="text-white/30 text-xs">Chart</div>
                  </div>
                  <div className="mt-6">
                    <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Avg Execution</div>
                    <div className="text-white text-lg font-semibold">4.1ms — 2.1s</div>
                    {/* TODO: Заменить на график среднего времени выполнения (гистограмма) */}
                    <div className="h-[80px] bg-white/5 rounded border border-white/10 flex items-center justify-center mt-4">
                      <div className="text-white/30 text-xs">Chart</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Active Users</div>
                  <div className="text-white text-2xl font-semibold mb-1">8,234</div>
                  <div className="text-white/40 text-xs mb-4">users online</div>
                  {/* TODO: Заменить на график активных пользователей (area chart с линией тренда) */}
                  <div className="h-[150px] bg-white/5 rounded border border-white/10 flex items-center justify-center">
                    <div className="text-white/30 text-xs">Chart</div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs text-white/50">
                    <span>5,123 ACTIVE</span>
                    <span>3,111 IDLE</span>
                  </div>
                  <Button variant="outline" size="sm" className="mt-4 w-full border-white/10 text-white/70 hover:bg-white/5">
                    View
                  </Button>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Script Updates</div>
                  <div className="text-white text-2xl font-semibold mb-1">1,549</div>
                  <div className="text-white/40 text-xs mb-4">updates this week</div>
                  {/* TODO: Заменить на график обновлений скриптов (столбчатая диаграмма) */}
                  <div className="h-[80px] bg-white/5 rounded border border-white/10 flex items-center justify-center mt-4">
                    <div className="text-white/30 text-xs">Chart</div>
                  </div>
                  <div className="mt-6">
                    <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">New Scripts</div>
                    <div className="text-white text-lg font-semibold">+127 today</div>
                    {/* TODO: Заменить на график новых скриптов (линейный график роста) */}
                    <div className="h-[80px] bg-white/5 rounded border border-white/10 flex items-center justify-center mt-4">
                      <div className="text-white/30 text-xs">Chart</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 space-y-4" data-block>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Activity className="h-3 w-3 text-emerald-300" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">{t('index.scripts.scriptManager')}</h4>
                </div>
                <p className="text-white/60 text-sm leading-relaxed max-w-2xl">
                  {t('index.scripts.scriptManagerDesc')}
                </p>
              </div>
            </div>
          </div>
        </section>

          {/* Every event, connected together - Exact Nightwatch style from Figma */}
          <section className="relative bg-black/80 px-4 py-32 z-10" data-section>
          <div className="container mx-auto max-w-[1440px]">
            <div className="max-w-[1312px] mx-auto" data-block>
              <div className="text-center mb-16">
                <h2 className="text-5xl md:text-7xl font-semibold mb-6 text-white">
                  {t('index.ecosystem.title')}
                </h2>
                <p className="text-white/60 text-lg max-w-3xl mx-auto">
                  {t('index.ecosystem.description')}
                </p>
              </div>

              {/* 3x3 Grid - unified style */}
              <div className="grid md:grid-cols-3 gap-6 mb-16">
                {eventFeatures.map((feature, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-6 h-full hover:border-white/20 transition-colors">
                    <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">{feature.title}</div>
                    <div className="text-white text-2xl font-semibold mb-1">—</div>
                    <div className="text-white/40 text-xs mb-4">{feature.desc}</div>
                    {/* TODO: Заменить на иконку или мини-график для каждой функции (библиотека, расширяемость, обновления и т.д.) */}
                    <div className="h-[80px] bg-white/5 rounded border border-white/10 flex items-center justify-center">
                      <div className="text-white/30 text-xs">Chart</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

          {/* Issue tracking - Exact Nightwatch style from Figma */}
          <section className="relative px-4 py-32 bg-black/80 z-10" data-section>
          <div className="container mx-auto max-w-[1440px]">
            <div className="max-w-[1312px] mx-auto space-y-16">
              <div className="grid lg:grid-cols-[1fr,1fr] gap-16 items-start" data-block>
                <div className="space-y-5">
                  <span className="inline-flex px-3 py-1.5 text-xs uppercase tracking-[0.4em] text-emerald-300/70 font-medium border border-emerald-300/20 rounded bg-emerald-300/5">
                    {t('index.features.badge')}
                  </span>
                  <h3 className="text-4xl md:text-5xl font-semibold leading-tight text-white">
                    {t('index.features.title')}
                  </h3>
                  <p className="text-white/60 text-lg">
                    {t('index.features.description')}
                  </p>
                </div>

                {/* Features metrics cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                    <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Cloud Sync</div>
                    <div className="text-white text-2xl font-semibold mb-1">100%</div>
                    <div className="text-white/40 text-xs">automatic sync</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                    <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Auto Updates</div>
                    <div className="text-white text-2xl font-semibold mb-1">24/7</div>
                    <div className="text-white/40 text-xs">always up to date</div>
                  </div>
                </div>

              </div>

              {/* Features cards - unified style */}
              <div className="grid md:grid-cols-3 gap-6" data-block>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">{t('index.features.cloudSync')}</div>
                  <div className="text-white text-2xl font-semibold mb-1">—</div>
                  <div className="text-white/40 text-xs mb-4">{t('index.features.cloudSyncDesc')}</div>
                  {/* TODO: Заменить на график синхронизации (линия с точками синхронизации) */}
                  <div className="h-[80px] bg-white/5 rounded border border-white/10 flex items-center justify-center">
                    <div className="text-white/30 text-xs">Chart</div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">{t('index.features.autoUpdates')}</div>
                  <div className="text-white text-2xl font-semibold mb-1">—</div>
                  <div className="text-white/40 text-xs mb-4">{t('index.features.autoUpdatesDesc')}</div>
                  {/* TODO: Заменить на график обновлений (столбчатая диаграмма с количеством обновлений) */}
                  <div className="h-[80px] bg-white/5 rounded border border-white/10 flex items-center justify-center">
                    <div className="text-white/30 text-xs">Chart</div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">{t('index.features.security')}</div>
                  <div className="text-white text-2xl font-semibold mb-1">—</div>
                  <div className="text-white/40 text-xs mb-4">{t('index.features.securityDesc')}</div>
                  {/* TODO: Заменить на график безопасности (индикатор уровня безопасности или круговая диаграмма) */}
                  <div className="h-[80px] bg-white/5 rounded border border-white/10 flex items-center justify-center">
                    <div className="text-white/30 text-xs">Chart</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

          {/* Infrastructure - Exact Nightwatch style from Figma */}
          <section className="relative px-4 py-32 bg-black/80 z-10" data-section>
          <div className="container mx-auto max-w-[1440px]">
            <div className="max-w-[1312px] mx-auto space-y-12" data-block>
              <div className="space-y-4">
                <span className="inline-flex px-3 py-1.5 text-xs uppercase tracking-[0.4em] text-emerald-300/70 font-medium border border-emerald-300/20 rounded bg-emerald-300/5">
                  {t('index.infrastructure.badge')}
                </span>
                <h3 className="text-4xl md:text-5xl font-semibold text-white">{t('index.infrastructure.title')}</h3>
                <p className="text-white/60 text-lg max-w-3xl">
                  {t('index.infrastructure.description')}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {infrastructureFeatures.map((item) => (
                  <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                    <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">{item.title}</div>
                    <div className="text-white text-2xl font-semibold mb-1">—</div>
                    <div className="text-white/40 text-xs mb-4">{item.desc}</div>
                    {/* TODO: Заменить на график производительности/хранилища/API (соответствующие метрики для каждой функции инфраструктуры) */}
                    <div className="h-[80px] bg-white/5 rounded border border-white/10 flex items-center justify-center">
                      <div className="text-white/30 text-xs">Chart</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

          {/* FAQ - Exact Nightwatch style */}
          <section data-section className="relative px-4 py-32 bg-black/80 z-10">
          <div className="container mx-auto max-w-[1280px] space-y-10">
            <div className="text-center space-y-4">
              <h3 className="text-4xl font-semibold text-white">{t('index.faq.title')}</h3>
              <p className="text-white/60">
                {t('index.faq.subtitle')} <a href="/documentation" className="text-emerald-300 hover:text-emerald-200">{t('index.faq.docsLink')}</a>
              </p>
            </div>
            <FAQ />
          </div>
        </section>

          {/* Final CTA - unified style */}
          <section className="relative overflow-hidden border-y border-white/10 bg-black/80 z-10">
            <div className="relative px-4 py-28">
              <div className="container mx-auto max-w-[768px]">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-12 text-center space-y-6">
                  <h3 className="text-4xl md:text-5xl font-semibold text-white">{t('index.hero.title')}</h3>
                  <p className="text-white/60 text-lg">
                    {t('index.finalCta.subtitle')}
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button 
                      size="lg" 
                      className="h-11 px-6 bg-white text-black hover:bg-white/90 text-base font-normal rounded-lg"
                      onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
                    >
                      {t('index.hero.getStarted')}
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="h-11 px-6 bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/40 text-base font-normal rounded-lg"
                    >
                      {t('index.hero.documentation')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Index;
