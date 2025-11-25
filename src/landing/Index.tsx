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
  Sparkles, Terminal, Download, Globe, Send, Bell, Briefcase, 
  Database, Mail, Calendar, CheckCircle2, AlertCircle, Settings,
  Play, Copy, Check, FileCode, Clock, Activity, TrendingUp
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

  // Events section features - 9 cards in 3x3 grid (using our translations)
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

  // Issue tracking - sample issues
  const sampleIssues = [
    { id: "SKY-171", type: "EXCEPTION", message: "SQL Integrity Constraint Violation: Duplicate Entry Error on Flight Data Insert", date: "Feb 26, 2025", time: "2 min ago", user: "Jackie Haley" },
    { id: "SKY-132", type: "EXCEPTION", message: "Rate Limit Exceeded: API Key Request Limit Reached", date: "Feb 26, 2025", time: "2 min ago", user: "Mary Freund" },
    { id: "SKY-182", type: "EXCEPTION", message: "Rate Limit Exceeded: Excessive Requests from IP Address", date: "Feb 26, 2025", time: "2 min ago", user: "Laura Mennell" },
    { id: "SKY-1", type: "EXCEPTION", message: "Rate Limit Exceeded: Too Many Concurrent Connections", date: "Feb 26, 2025", time: "2 min ago", user: "Patrick Wilson" },
    { id: "SKY-170", type: "EXCEPTION", message: "API Rate Limit Exceeded: You have made too many requests to the API within a short...", date: "Feb 26, 2025", time: "2 min ago", user: "Glenn Ennis" },
    { id: "SKY-127", type: "EXCEPTION", message: "Rate Limit Exceeded: Throttling in Effect for User Account", date: "Feb 26, 2025", time: "2 min ago", user: "Gerald Butler" },
  ];

  // Infrastructure features (using our translations)
  const infrastructureFeatures = [
    { icon: Code2, title: t('index.extensionFeatures.scriptManager.title'), desc: t('index.extensionFeatures.scriptManager.description') },
    { icon: Cloud, title: t('index.extensionFeatures.cloudSync.title'), desc: t('index.extensionFeatures.cloudSync.description') },
    { icon: Zap, title: t('index.features.blazingFast.title'), desc: t('index.features.blazingFast.description') },
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

        {/* Hero Section - Exact Nightwatch style */}
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

              {/* Dashboard Screenshot Mockup */}
              <div className="hero-element relative mx-auto max-w-[1000px] rounded-[32px] border border-white/10 bg-black/70 p-6 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
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
                  {/* Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">REQUESTS</div>
                      <div className="text-3xl font-semibold text-white">326</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">EXCEPTIONS</div>
                      <div className="text-3xl font-semibold text-white">108</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">JOB ATTEMPTS</div>
                      <div className="text-3xl font-semibold text-white">24.2k</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">JOB DURATION</div>
                      <div className="text-3xl font-semibold text-white">4.1ms</div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-left">
                    <div className="text-white/50 text-xs uppercase tracking-[0.3em] mb-3">Timeline</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between text-white/60">
                          <span>REQUEST /users/1232</span>
                          <span>113ms</span>
                        </div>
                        <div className="flex justify-between text-white/60 ml-4">
                          <span>BOOTSTRAP</span>
                          <span>124ms</span>
                        </div>
                        <div className="flex justify-between text-white/60 ml-4">
                          <span>QUERY select * from users</span>
                          <span>253ms</span>
                        </div>
                        <div className="flex justify-between text-white/60 ml-4">
                          <span>MIDDLEWARE</span>
                          <span>394ms</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-white/60">
                          <span>CACHE HIT user.role</span>
                          <span>1.25ms</span>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>QUERY</span>
                          <span>186ms</span>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>QUERY</span>
                          <span>131ms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Start monitoring section - Exact Nightwatch style */}
        <section ref={featureBlocksRef} className="bg-black px-4 py-32" data-section>
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-[1fr,1.1fr] gap-16 items-center" data-block>
              <div className="space-y-6">
                <span className="inline-flex text-xs uppercase tracking-[0.4em] text-emerald-300/70 font-medium">
                  Events
                </span>
                <h2 className="text-4xl md:text-6xl font-semibold leading-tight text-white">
                  Start monitoring in under a minute
                </h2>
                <p className="text-white/60 text-lg max-w-xl leading-relaxed">
                  Purpose built for Laravel applications on any deployment platform, Laravel Nightwatch delivers instant monitoring with a single command. It's the monitoring experience developers love.
                </p>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-black/30 backdrop-blur-xl p-8">
                <div className="rounded-2xl border border-white/10 bg-[#05090f] p-6 mb-6">
                  <div className="text-white/50 text-xs uppercase tracking-[0.3em] mb-4">Code Example</div>
                  <div className="font-mono text-sm text-white/80 space-y-2">
                    <div className="text-emerald-300">npm install @ebuster/sdk</div>
                    <div className="text-white/40">import {'{'} init {'}'} from '@ebuster/sdk';</div>
                    <div className="text-white/40">init({'{'} dsn: 'YOUR_DSN' {'}'});</div>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Performance Events</div>
                  <div className="text-white text-3xl font-semibold mb-1">50 billion</div>
                  <div className="text-white/40 text-xs mb-4">received performance events</div>
                  <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Reported Errors</div>
                  <div className="text-white text-3xl font-semibold">120 million</div>
                  <div className="text-white/40 text-xs">reported errors</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Every event, connected together - Exact Nightwatch style */}
        <section className="bg-black px-4 py-32" data-section>
          <div className="container mx-auto max-w-6xl" data-block>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-semibold mb-6">
                {t('index.extensionFeatures.title')}
              </h2>
              <p className="text-white/60 text-lg max-w-3xl mx-auto">
                {t('index.features.description')}
              </p>
            </div>

            {/* 3x3 Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {eventFeatures.map((feature, i) => (
                <Card key={i} className="bg-black border border-white/10 p-6 h-full">
                  <CardContent className="p-0 space-y-3">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-emerald-300" />
                    </div>
                    <h4 className="text-lg font-semibold">{feature.title}</h4>
                    <p className="text-white/60 text-sm leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Testimonial */}
            <div className="text-center max-w-2xl mx-auto">
              <div className="text-6xl text-emerald-300/30 mb-4 leading-none">"</div>
              <p className="text-xl text-white/80 mb-6 leading-relaxed">
                {t('index.features.description')}
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
                  E
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">EBUSTER Team</div>
                  <div className="text-white/50 text-sm">Professional Chrome Extension</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Issue tracking - Exact Nightwatch style */}
        <section className="px-4 py-32 bg-black" data-section>
          <div className="container mx-auto max-w-6xl space-y-16">
            <div className="grid lg:grid-cols-[1fr,1.2fr] gap-16 items-start" data-block>
              <div className="space-y-5">
                <span className="inline-flex text-xs uppercase tracking-[0.4em] text-emerald-300/70">
                  Issue tracking
                </span>
                <h3 className="text-4xl md:text-5xl font-semibold leading-tight">
                  {t('index.featuresGrid.proTools.title')}
                </h3>
                <p className="text-white/60 text-lg">
                  {t('index.featuresGrid.proTools.description')}
                </p>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8">
                <div className="space-y-4">
                  {sampleIssues.map((issue, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-black/60 p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {issue.user.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-semibold">{issue.id}</span>
                            <span className="text-white/60 text-sm">{issue.type}</span>
                          </div>
                          <p className="text-white/70 text-sm mb-2">{issue.message}</p>
                          <div className="flex items-center gap-3 text-xs text-white/50">
                            <span>{issue.date}</span>
                            <span>{issue.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Collaborate section */}
            <div className="grid md:grid-cols-3 gap-8" data-block>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold">Collaborate with yourself or your team</h4>
                <p className="text-white/60 text-sm">
                  Bring your team together with intuitive collaboration tools. Easily assign tasks, comment, set priorities, and define responsibilities to ensure perfect alignment for yourself, or your team.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold">Configurable thresholds and rules</h4>
                <p className="text-white/60 text-sm">
                  Define custom performance thresholds to automatically monitor and detect when your application's metrics exceed acceptable limits.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold">Instant alerts</h4>
                <p className="text-white/60 text-sm">
                  Receive alerts as soon as problems occur, enabling quick responses to maintain peak performance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Infrastructure - Exact Nightwatch style */}
        <section className="px-4 py-32 bg-gradient-to-b from-black to-[#03140f]" data-section>
          <div className="container mx-auto max-w-5xl space-y-12" data-block>
            <div className="space-y-4 text-center">
              <span className="inline-flex text-xs uppercase tracking-[0.4em] text-emerald-300/70">
                Infrastructure
              </span>
              <h3 className="text-4xl md:text-5xl font-semibold">{t('index.features.modularArchitecture.title')}</h3>
              <p className="text-white/60 text-lg max-w-3xl mx-auto">
                {t('index.features.modularArchitecture.description')}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {infrastructureFeatures.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/60 p-6">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                  <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="text-center max-w-2xl mx-auto pt-8">
              <div className="text-6xl text-emerald-300/30 mb-4 leading-none">"</div>
              <p className="text-xl text-white/80 mb-6 leading-relaxed">
                {t('index.features.modularArchitecture.description')}
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
                  E
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">EBUSTER User</div>
                  <div className="text-white/50 text-sm">Chrome Extension Developer</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section data-section className="px-4 py-32 bg-black">
          <div className="container mx-auto max-w-4xl space-y-10">
            <div className="text-center space-y-4">
              <h3 className="text-4xl font-semibold">FAQs</h3>
              <p className="text-white/60">
                Can't find your answer? <a href="/documentation" className="text-emerald-300 hover:text-emerald-200">Read our docs →</a>
              </p>
            </div>
            <FAQ />
          </div>
        </section>

        {/* Final CTA - Exact Nightwatch style */}
        <section className="relative overflow-hidden border-y border-white/10 bg-[#041c17]">
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 70%)" }} />
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(0deg, transparent 97%, rgba(255,255,255,0.03) 100%), linear-gradient(90deg, transparent 97%, rgba(255,255,255,0.03) 100%)", backgroundSize: "100px 100px" }} />
          <div className="relative px-4 py-28">
            <div className="container mx-auto max-w-3xl">
              <div className="rounded-[32px] border border-white/10 bg-black/70 p-12 backdrop-blur-xl text-center space-y-6">
                <h3 className="text-4xl md:text-5xl font-semibold">{t('index.hero.title')}</h3>
                <p className="text-white/70 text-lg">
                  {t('index.hero.subtitle')}
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
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default Index;
