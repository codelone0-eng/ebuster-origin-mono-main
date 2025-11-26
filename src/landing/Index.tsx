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
import Silk from "@/components/Silk";
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

        {/* Silk background - fixed для покрытия всего экрана */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Silk
            speed={5}
            scale={1}
            color="#ffffff"
            noiseIntensity={4.3}
            rotation={0}
          />
        </div>
        
        {/* Gradient overlay - более прозрачный, чтобы Silk был виден */}
        <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-[1] pointer-events-none" />

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
                  {/* Code block */}
                  <div className="rounded-[32px] border border-white/10 bg-black/30 backdrop-blur-xl p-8">
                    <div className="rounded-2xl border border-white/10 bg-[#05090f] p-6">
                      <div className="text-white/50 text-xs uppercase tracking-[0.3em] mb-4">{t('index.scripts.codeExample')}</div>
                      <div className="font-mono text-sm text-white/80 space-y-2">
                        <div className="text-emerald-300">1. Install EBUSTER extension</div>
                        <div className="text-white/40">2. Open extension popup</div>
                        <div className="text-white/40">3. Browse script library</div>
                        <div className="text-white/40">4. Click "Install" on any script</div>
                      </div>
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
                  <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">{t('index.scripts.installedScripts')}</div>
                  <div className="text-white text-2xl font-semibold mb-1">{t('index.scripts.installedCount')}</div>
                  <div className="text-white/40 text-xs mb-4">{t('index.scripts.installedDesc')}</div>
                  <div className="space-y-2">
                    {['Auto-fill forms', 'Page enhancer', 'API integration'].map((script, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-white/70">{script}</span>
                        <span className="text-white/50">{['Active', 'Active', 'Active'][i]}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-4 w-full border-white/10 text-white/70 hover:bg-white/5">
                    View
                  </Button>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">{t('index.scripts.libraryScripts')}</div>
                  <div className="text-white text-2xl font-semibold mb-1">{t('index.scripts.libraryCount')}</div>
                  <div className="text-white/40 text-xs mb-4">{t('index.scripts.libraryDesc')}</div>
                  <div className="text-white/40 text-xs mb-4">New scripts added daily.</div>
                  <div className="h-[150px] bg-white/5 rounded border border-white/10 flex items-center justify-center">
                    <div className="text-white/30 text-xs">Chart</div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs text-white/50">
                    <span>8,234 PUBLISHED</span>
                    <span>4,315 BETA</span>
                  </div>
                  <Button variant="outline" size="sm" className="mt-4 w-full border-white/10 text-white/70 hover:bg-white/5">
                    View
                  </Button>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Script Executions</div>
                  <div className="text-white text-2xl font-semibold mb-1">24.2k</div>
                  <div className="h-[80px] bg-white/5 rounded border border-white/10 flex items-center justify-center mt-4">
                    <div className="text-white/30 text-xs">Chart</div>
                  </div>
                  <div className="mt-6">
                    <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Avg Execution</div>
                    <div className="text-white text-lg font-semibold">4.1ms — 2.1s</div>
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

              {/* 3x3 Grid - Exact Nightwatch structure */}
              <div className="grid md:grid-cols-3 gap-6 mb-16">
                {eventFeatures.map((feature, i) => (
                  <Card key={i} className="bg-black border border-white/10 p-6 h-full hover:border-white/20 transition-colors">
                    <CardContent className="p-0 space-y-3">
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <feature.icon className="h-6 w-6 text-emerald-300" />
                      </div>
                      <h4 className="text-lg font-semibold text-white">{feature.title}</h4>
                      <p className="text-white/60 text-sm leading-relaxed">{feature.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Testimonial - Exact Nightwatch style */}
              <div className="text-center max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="text-4xl text-emerald-300/30 leading-none">"</div>
                  <div className="text-4xl text-emerald-300/30 leading-none">"</div>
                </div>
                <p className="text-xl text-white/80 mb-6 leading-relaxed">
                  {t('index.ecosystem.testimonial1')}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
                    {t('index.ecosystem.testimonial1Author').charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium">{t('index.ecosystem.testimonial1Author')}</div>
                    <div className="text-white/50 text-sm">{t('index.ecosystem.testimonial1Role')}</div>
                  </div>
                </div>
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
                    <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">{t('index.scripts.installedScripts')}</div>
                    <div className="text-white text-2xl font-semibold mb-1">{t('index.scripts.installedCount')}</div>
                    <div className="text-white/40 text-xs">{t('index.scripts.installedDesc')}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                    <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">{t('index.scripts.libraryScripts')}</div>
                    <div className="text-white text-2xl font-semibold mb-1">{t('index.scripts.libraryCount')}</div>
                    <div className="text-white/40 text-xs">{t('index.scripts.libraryDesc')}</div>
                  </div>
                </div>

              </div>

              {/* Collaborate section - Exact Nightwatch style */}
              <div className="grid md:grid-cols-3 gap-8" data-block>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">{t('index.features.cloudSync')}</h4>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {t('index.features.cloudSyncDesc')}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">{t('index.features.autoUpdates')}</h4>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {t('index.features.autoUpdatesDesc')}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">{t('index.features.security')}</h4>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {t('index.features.securityDesc')}
                  </p>
                </div>
              </div>

              {/* Testimonial */}
              <div className="text-center max-w-2xl mx-auto pt-8" data-block>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="text-4xl text-emerald-300/30 leading-none">"</div>
                  <div className="text-4xl text-emerald-300/30 leading-none">"</div>
                </div>
                <p className="text-xl text-white/80 mb-6 leading-relaxed">
                  {t('index.features.testimonial2')}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
                    {t('index.features.testimonial2Author').charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium">{t('index.features.testimonial2Author')}</div>
                    <div className="text-white/50 text-sm">{t('index.features.testimonial2Role')}</div>
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
            
            {/* Testimonial */}
            <div className="text-center max-w-2xl mx-auto pt-16" data-block>
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="text-4xl text-emerald-300/30 leading-none">"</div>
                <div className="text-4xl text-emerald-300/30 leading-none">"</div>
              </div>
              <p className="text-xl text-white/80 mb-6 leading-relaxed">
                {t('index.infrastructure.testimonial3')}
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
                  {t('index.infrastructure.testimonial3Author').charAt(0)}
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">{t('index.infrastructure.testimonial3Author')}</div>
                  <div className="text-white/50 text-sm">{t('index.infrastructure.testimonial3Role')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

          {/* Final CTA - Minimalist style */}
          <section className="relative overflow-hidden border-y border-white/10 bg-black/80 z-10">
            <div className="relative px-4 py-28">
              <div className="container mx-auto max-w-[768px]">
                <div className="rounded-[32px] border border-white/10 bg-black/70 p-12 backdrop-blur-xl text-center space-y-6">
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
