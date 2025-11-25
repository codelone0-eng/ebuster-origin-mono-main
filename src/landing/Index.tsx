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
  Boxes, Puzzle, Orbit, Binary, Cpu, Cloud, User, RefreshCw,
  Sparkles
} from "lucide-react";
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

  const heroStats = [
    { label: t('index.hero.developerFirst'), value: "Zero noise UI" },
    { label: t('index.hero.performance'), value: "60 FPS UI" },
    { label: t('index.hero.security'), value: "Enterprise Ready" },
  ];

  const monitoringCards = [
    {
      title: t('index.features.modularArchitecture.title'),
      meta: t('index.features.modularArchitecture.description'),
      value: "12",
      suffix: t('index.features.modularArchitecture.components')
    },
    {
      title: t('index.features.blazingFast.title'),
      meta: t('index.features.blazingFast.description'),
      value: "128",
      suffix: "ms avg response"
    },
    {
      title: t('index.features.fortKnoxSecurity.title'),
      meta: t('index.features.fortKnoxSecurity.description'),
      value: "0",
      suffix: "critical issues"
    }
  ];

  const gridFeatures = [
    { icon: Boxes, title: t('index.featuresGrid.structuredLibrary.title'), desc: t('index.featuresGrid.structuredLibrary.description') },
    { icon: Puzzle, title: t('index.featuresGrid.extensibility.title'), desc: t('index.featuresGrid.extensibility.description') },
    { icon: Orbit, title: t('index.featuresGrid.smoothUpdates.title'), desc: t('index.featuresGrid.smoothUpdates.description') },
    { icon: Binary, title: t('index.featuresGrid.strongTyping.title'), desc: t('index.featuresGrid.strongTyping.description') },
    { icon: Cpu, title: t('index.featuresGrid.rationalEfficiency.title'), desc: t('index.featuresGrid.rationalEfficiency.description') },
    { icon: Terminal, title: t('index.featuresGrid.proTools.title'), desc: t('index.featuresGrid.proTools.description') },
    { icon: Zap, title: t('index.hero.performance'), desc: t('index.hero.subtitle') },
    { icon: Layers, title: t('index.hero.developerFirst'), desc: t('index.hero.description') },
    { icon: Shield, title: t('index.hero.security'), desc: t('index.features.description') },
  ];

  const issueHighlights = [
    {
      title: t('index.extensionFeatures.security.title'),
      description: t('index.extensionFeatures.security.description'),
      icon: Shield
    },
    {
      title: t('index.extensionFeatures.autoUpdates.title'),
      description: t('index.extensionFeatures.autoUpdates.description'),
      icon: RefreshCw
    },
    {
      title: t('index.extensionFeatures.cloudSync.title'),
      description: t('index.extensionFeatures.cloudSync.description'),
      icon: Cloud
    },
    {
      title: t('index.extensionFeatures.profile.title'),
      description: t('index.extensionFeatures.profile.description'),
      icon: Sparkles
    },
  ];

  const infrastructureHighlights = [
    {
      title: t('index.extensionFeatures.scriptManager.title'),
      description: t('index.extensionFeatures.scriptManager.description'),
      icon: Code2
    },
    {
      title: t('index.extensionFeatures.guestMode.title'),
      description: t('index.extensionFeatures.guestMode.description'),
      icon: User
    },
    {
      title: t('index.featuresGrid.proTools.title'),
      description: t('index.featuresGrid.proTools.description'),
      icon: Terminal
    },
  ];

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

        {/* Hero Section */}
        <section ref={heroRef} className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[#02080d]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(90,190,255,0.18),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(8,255,201,0.15),_transparent_45%)]" />
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(120deg, rgba(255,255,255,0.04) 0%, transparent 60%)" }} />

          <div className="relative pt-32 pb-36 px-4">
            <div className="container mx-auto max-w-[1200px] text-center">
              <h1 className="hero-element text-5xl sm:text-7xl lg:text-[110px] font-bold tracking-tight leading-[0.95] text-white mb-10">
                {t('index.hero.title')}
              </h1>
              <p className="hero-element text-xl md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed mb-12">
                {t('index.hero.subtitle')}
              </p>

              <div className="hero-element flex flex-wrap items-center justify-center gap-4 mb-16">
                <Button 
                  size="lg" 
                  className="h-14 px-10 bg-[#4287ff] hover:bg-[#2f6be0] text-white text-base font-medium shadow-[0_8px_30px_rgba(66,135,255,0.35)]"
                  onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
                >
                  {t('index.hero.getStarted')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-10 bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/40 transition-colors text-base font-medium"
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                >
                  {t('index.hero.documentation')}
                </Button>
              </div>

              <div className="hero-element grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-5 text-left">
                    <div className="text-white/40 text-xs uppercase tracking-[0.2em] mb-2">{stat.label}</div>
                    <div className="text-white text-lg font-semibold">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="hero-element">
                <div className="relative mx-auto max-w-[1000px] rounded-[32px] border border-white/10 bg-black/70 p-6 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
                  <div className="flex items-center justify-between mb-6 text-sm text-white/60">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      ebuster://production
                    </div>
                    <div className="flex gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
                      <span>{t('index.hero.performance')}</span>
                      <span>•</span>
                      <span>{t('index.hero.security')}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#05090f] p-6 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
                      {monitoringCards.map((card) => (
                        <div key={card.title}>
                          <div className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">{card.title}</div>
                          <div className="text-3xl font-semibold text-white">{card.value}</div>
                          <div className="text-white/50 text-sm mt-1">{card.suffix}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-left">
                      <div className="text-white/50 text-xs uppercase tracking-[0.3em] mb-3">timeline</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between text-white/60">
                            <span>bootstrap</span>
                            <span>120ms</span>
                          </div>
                          <div className="flex justify-between text-white/60">
                            <span>scripts</span>
                            <span>86ms</span>
                          </div>
                          <div className="flex justify-between text-white/60">
                            <span>cache hit</span>
                            <span>12ms</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-white/60">
                            <span>query</span>
                            <span>26ms</span>
                          </div>
                          <div className="flex justify-between text-white/60">
                            <span>queue</span>
                            <span>45ms</span>
                          </div>
                          <div className="flex justify-between text-white/60">
                            <span>notifications</span>
                            <span>18ms</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Blocks */}
        <section ref={featureBlocksRef} className="bg-gradient-to-b from-black via-[#021014] to-black px-4 py-32" data-section>
          <div className="container mx-auto max-w-6xl space-y-24">
            <div className="grid lg:grid-cols-[1fr,1.1fr] gap-16 items-start" data-block>
              <div className="space-y-6">
                <span className="inline-flex text-xs uppercase tracking-[0.4em] text-emerald-300/70">
                  {t('index.features.title')}
                </span>
                <h2 className="text-4xl md:text-6xl font-semibold leading-tight">
                  {t('index.features.description')}
                </h2>
                <p className="text-white/60 text-lg max-w-xl">
                  {t('index.extensionFeatures.description')}
                </p>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-black/30 backdrop-blur-xl p-8">
                <div className="grid gap-6">
                  {monitoringCards.map((card) => (
                    <div key={card.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                      <div className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4">{card.title}</div>
                      <div className="text-white text-lg font-medium">{card.meta}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div data-block>
              <h3 className="text-4xl font-semibold mb-10">{t('index.extensionFeatures.title')}</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {gridFeatures.map((feature, i) => (
                  <Card key={feature.title + i} className="bg-black border border-white/10 p-6 h-full">
                    <CardContent className="p-0 space-y-3">
                      <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold">{feature.title}</h4>
                      <p className="text-white/60 text-sm leading-relaxed">{feature.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Issue tracking */}
        <section className="px-4 py-32 bg-black" data-section>
          <div className="container mx-auto max-w-6xl space-y-16">
            <div className="grid lg:grid-cols-[1fr,1.2fr] gap-16 items-start" data-block>
              <div className="space-y-5">
                <span className="inline-flex text-xs uppercase tracking-[0.4em] text-emerald-300/70">
                  Issue tracking
                </span>
                <h3 className="text-4xl md:text-5xl font-semibold leading-tight">
                  {t('index.featuresGrid.proTools.description')}
                </h3>
                <p className="text-white/60 text-lg">
                  {t('index.extensionFeatures.scriptManager.description')}
                </p>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8">
                <div className="space-y-8">
                  <div className="rounded-2xl border border-white/10 bg-black/60 p-5">
                    <div className="flex items-center justify-between text-sm text-white/50">
                      <span>{t('index.hero.performance')}</span>
                      <span>6 issues • 24h</span>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-white/70">
                      <div className="flex justify-between">
                        <span>SKY-102</span>
                        <span className="text-red-400">Critical</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SKY-125</span>
                        <span className="text-amber-300">Warning</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SKY-170</span>
                        <span className="text-emerald-300">Resolved</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {issueHighlights.map((item) => (
                      <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                          <item.icon className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="font-semibold mb-2">{item.title}</h4>
                        <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Infrastructure */}
        <section className="px-4 py-32 bg-gradient-to-b from-black to-[#03140f]" data-section>
          <div className="container mx-auto max-w-5xl space-y-12" data-block>
            <div className="space-y-4 text-center">
              <span className="inline-flex text-xs uppercase tracking-[0.4em] text-emerald-300/70">
                Infrastructure
              </span>
              <h3 className="text-4xl md:text-5xl font-semibold">{t('index.extensionFeatures.title')}</h3>
              <p className="text-white/60 text-lg max-w-3xl mx-auto">
                {t('index.features.description')}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {infrastructureHighlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/60 p-6">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                  <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section data-section className="px-4 py-32 bg-black">
          <div className="container mx-auto max-w-4xl space-y-10">
            <div className="text-center space-y-4">
              <span className="inline-flex text-xs uppercase tracking-[0.4em] text-emerald-300/70">
                FAQ
              </span>
              <h3 className="text-4xl font-semibold">{t('index.featuresGrid.structuredLibrary.title')}</h3>
              <p className="text-white/60">
                {t('index.featuresGrid.structuredLibrary.description')}
              </p>
            </div>
            <FAQ />
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden border-y border-white/10 bg-[#041c17]">
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 70%)" }} />
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(0deg, transparent 97%, rgba(255,255,255,0.03) 100%), linear-gradient(90deg, transparent 97%, rgba(255,255,255,0.03) 100%)", backgroundSize: "100px 100px" }} />
          <div className="relative px-4 py-28">
            <div className="container mx-auto max-w-3xl text-center space-y-6">
              <h3 className="text-4xl md:text-5xl font-semibold">{t('index.hero.subtitle')}</h3>
              <p className="text-white/70 text-lg">
                {t('index.features.description')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  className="h-14 px-10 bg-[#4287ff] hover:bg-[#2f6be0] text-white text-base font-medium shadow-[0_12px_40px_rgba(66,135,255,0.4)]"
                  onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
                >
                  {t('index.hero.getStarted')}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-10 bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/40 text-base font-medium"
                >
                  {t('index.hero.documentation')}
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        <Footer />
      </div>
    </div>
  );
};

export default Index;
