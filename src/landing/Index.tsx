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
  Copy, Check, FileCode, Clock, Activity, TrendingUp, ChevronDown
} from "lucide-react";
import Beams from "@/components/Beams";
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

  // Events section features - 9 cards in 3x3 grid (exact Nightwatch structure)
  const eventFeatures = [
    { icon: Globe, title: "Requests", desc: "Trace requests with detailed interaction and performance metrics." },
    { icon: Send, title: "Outgoing Requests", desc: "Trace external requests, API calls, and third-party service integrations." },
    { icon: Bell, title: "Notifications", desc: "Monitors all available channels to ensure proper notification delivery." },
    { icon: Briefcase, title: "Jobs", desc: "Monitor queues, executions, and job performance across your app." },
    { icon: Database, title: "Queries", desc: "Measure query performance and identify problematic SQL." },
    { icon: Mail, title: "Mail", desc: "Track email sending, recipients, sources, and rendering performance." },
    { icon: Terminal, title: "Commands", desc: "Record Artisan command executions and their impact on system resources." },
    { icon: Zap, title: "Cache", desc: "Monitor cache key hit rates, storage patterns, and invalidation events." },
    { icon: Calendar, title: "Scheduled Tasks", desc: "Ensure your scheduler is running on time and tasks complete successfully." },
  ];

  // Issue tracking - sample issues (exact Nightwatch structure)
  const sampleIssues = [
    { id: "SKY-171", type: "EXCEPTION", message: "SQL Integrity Constraint Violation: Duplicate Entry Error on Flight Data Insert", date: "Feb 26, 2025", time: "2 min ago", user: "Jackie Haley" },
    { id: "SKY-102", type: "EXCEPTION", message: "SQL Integrity Constraint Violation: Duplicate Entry Error on Flight Data Insert", date: "Feb 28, 2025", time: "4 days ago", user: "Mary Freund" },
    { id: "SKY-76", type: "EXCEPTION", message: "Method Not Allowed: Unsupported HTTP Verb for This Route", date: "Feb 28, 2025", time: "1 hr ago", user: "Laura Mennell" },
    { id: "SKY-113", type: "EXCEPTION", message: "Method Not Allowed: Invalid HTTP Method Used for Endpoint", date: "Feb 28, 2025", time: "2 min ago", user: "Patrick Wilson" },
    { id: "SKY-182", type: "EXCEPTION", message: "Rate Limit Exceeded: Excessive Requests from IP Address", date: "Mar 2, 2025", time: "2 min ago", user: "Glenn Ennis" },
    { id: "SKY-125", type: "EXCEPTION", message: "Method Not Allowed: Endpoint Does Not Support This Method", date: "Mar 3, 2025", time: "2 min ago", user: "Gerald Butler" },
    { id: "SKY-1", type: "EXCEPTION", message: "Rate Limit Exceeded: Too Many Concurrent Connections", date: "Mar 3, 2025", time: "2 min ago", user: "Jean Smart" },
    { id: "SKY-132", type: "EXCEPTION", message: "Rate Limit Exceeded: API Key Request Limit Reached", date: "Mar 7, 2025", time: "2 min ago", user: "Jackie Haley" },
  ];

  // Infrastructure features (exact Nightwatch structure)
  const infrastructureFeatures = [
    { icon: Code2, title: "The Nightwatch Agent", desc: "Our agent efficiently buffers and batches data, working invisibly in your application." },
    { icon: Cloud, title: "Hosted Data Pipelines", desc: "Nightwatch processes, validates, and stores billions of events in near real-time." },
    { icon: Zap, title: "Light speed performance", desc: "Our column-oriented architecture effortlessly queries billions of your events in less than 1s." },
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

        {/* Контейнер для всего контента с Beams фоном */}
        <div className="relative min-h-screen">
          {/* Beams background - покрывает весь контент между Header и Footer */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Beams
              beamWidth={0.3}
              beamHeight={4}
              beamNumber={30}
              lightColor="#ffffff"
              speed={0.8}
              noiseIntensity={1.2}
              scale={0.05}
              rotation={0}
            />
          </div>
          
          {/* Gradient overlay - более прозрачный, чтобы Beams был виден */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-[1] pointer-events-none" />

            {/* Hero Section - Exact Nightwatch style from Figma */}
          <section ref={heroRef} className="relative overflow-hidden border-b border-white/10" style={{ minHeight: '600px' }}>
            <div className="absolute inset-0 bg-black/80" />
            
            <div className="relative py-40 px-4 z-10">
            <div className="container mx-auto max-w-[1440px]">
              <div className="max-w-[672px] mx-auto text-center">
                {/* Split heading like Nightwatch */}
                <h1 className="hero-element text-7xl md:text-9xl font-bold tracking-tight leading-[0.95] text-white mb-10">
                  <span className="block">{t('index.hero.title')}</span>
                </h1>
                <p className="hero-element text-xl md:text-2xl text-white/60 max-w-[613px] mx-auto leading-relaxed mb-12">
                  {t('index.hero.subtitle')}
                </p>

                <div className="hero-element flex flex-wrap items-center justify-center gap-4">
                  <Button 
                    size="lg" 
                    className="h-11 px-6 bg-[#4287ff] hover:bg-[#2f6be0] text-white text-base font-medium rounded-lg"
                    onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
                  >
                    {t('index.hero.getStarted')}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-11 px-6 bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/40 transition-colors text-base font-medium rounded-lg"
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
                    Events
                  </span>
                  <h2 className="text-4xl md:text-6xl font-semibold leading-tight text-white">
                    Start monitoring in under a minute
                  </h2>
                  <p className="text-white/60 text-lg max-w-xl leading-relaxed">
                    Purpose built for Laravel applications on any deployment platform, Laravel Nightwatch delivers instant monitoring with a single command. It's the monitoring experience developers love.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Code block */}
                  <div className="rounded-[32px] border border-white/10 bg-black/30 backdrop-blur-xl p-8">
                    <div className="rounded-2xl border border-white/10 bg-[#05090f] p-6">
                      <div className="text-white/50 text-xs uppercase tracking-[0.3em] mb-4">Code Example</div>
                      <div className="font-mono text-sm text-white/80 space-y-2">
                        <div className="text-emerald-300">npm install @ebuster/sdk</div>
                        <div className="text-white/40">import {'{'} init {'}'} from '@ebuster/sdk';</div>
                        <div className="text-white/40">init({'{'} dsn: 'YOUR_DSN' {'}'});</div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics cards - Exact Nightwatch style */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                      <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Routes</div>
                      <div className="text-white text-3xl font-semibold mb-1">13 routes</div>
                      <div className="text-white/40 text-xs">exceeded performance thresholds</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                      <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Exceptions</div>
                      <div className="text-white text-3xl font-semibold mb-1">149</div>
                      <div className="text-white/40 text-xs">exceptions reported in 24 hours</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard mockup - Exact Nightwatch style */}
              <div className="grid lg:grid-cols-[1fr,1.1fr] gap-8" data-block>
                {/* Left: Issues list */}
                <div className="rounded-[32px] border border-white/10 bg-black/30 backdrop-blur-xl p-8">
                  <div className="space-y-2">
                    {sampleIssues.slice(0, 6).map((issue, i) => (
                      <div key={i} className="rounded-lg border border-white/10 bg-black/60 p-4 hover:border-white/20 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <span className="text-white font-semibold text-sm">{issue.id}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 text-xs uppercase tracking-wide border border-white/20 rounded text-white/70 bg-white/5">
                                {issue.type}
                              </span>
                            </div>
                            <p className="text-white/70 text-sm mb-2 line-clamp-1">{issue.message}</p>
                            <div className="flex items-center gap-3 text-xs text-white/50">
                              <span>{issue.date}</span>
                              <span>{issue.time}</span>
                              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold ml-auto">
                                {issue.user.charAt(0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                      </div>
                      <h4 className="text-lg font-semibold text-white">Smart alerts made simple</h4>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Nightwatch intelligently groups related exceptions and issues, delivering only the notifications you need.
                    </p>
                  </div>
                </div>

                {/* Right: Logs */}
                <div className="rounded-[32px] border border-white/10 bg-black/30 backdrop-blur-xl p-8">
                  <div className="space-y-2 font-mono text-sm">
                    {[
                      { time: "2025-11-22 02:05:53 UTC", type: "COMMAND", level: "[ALERT]", msg: "Query executed: SELECT * FROM flights WHERE id = 24421 returned 0 results." },
                      { time: "2025-11-22 02:05:53 UTC", type: "COMMAND", level: "[INFO]", msg: "Invalid login attempt detected for user ID 12345, incorrect password entered." },
                      { time: "2025-11-22 02:05:53 UTC", type: "COMMAND", level: "[ALERT]", msg: "Query executed: SELECT * FROM flights WHERE id = 24421 returned 0 results." },
                      { time: "2025-11-22 02:05:53 UTC", type: "COMMAND", level: "[INFO]", msg: "User logged in successfully. User ID: 45" },
                      { time: "2025-11-22 02:05:53 UTC", type: "COMMAND", level: "[WARN]", msg: "Query executed: SELECT * FROM flights WHERE id = 24421 returned 0 results.", expanded: true },
                    ].map((log, i) => (
                      <div key={i} className={`rounded-lg border border-white/10 bg-black/60 p-4 ${log.expanded ? 'bg-white/[0.02]' : ''}`}>
                        <div className="flex items-start gap-3">
                          <span className="text-white/40 text-xs flex-shrink-0">{log.time}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 text-xs uppercase tracking-wide border border-white/20 rounded text-white/70 bg-white/5">
                                {log.type}
                              </span>
                              <span className="text-white/60 text-xs">{log.level}</span>
                            </div>
                            <p className="text-white/70 text-sm">{log.msg}</p>
                            {log.expanded && (
                              <div className="mt-3 pl-4 border-l border-white/10 space-y-1 text-xs text-white/60">
                                <div>"flight_id": "98765",</div>
                                <div>"user_id": {'{'}</div>
                                <div className="pl-4">"id": "9d6f9c72-2894-454e-b15f-a097a1832574",</div>
                                <div className="pl-4">"name": "Jeremy Butler",</div>
                                <div className="pl-4">"username": "jeremy.butler@laravel.com"</div>
                                <div>{'}'}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <FileCode className="h-3 w-3 text-emerald-300" />
                      </div>
                      <h4 className="text-lg font-semibold text-white">Detailed logs at your fingertips</h4>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Instantly search and filter through logs to find exactly what you need, when you need it.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dashboard metrics - Exact Nightwatch style */}
              <div className="mt-16 grid md:grid-cols-3 gap-6" data-block>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Routes</div>
                  <div className="text-white text-2xl font-semibold mb-1">13 routes</div>
                  <div className="text-white/40 text-xs mb-4">exceeded performance thresholds</div>
                  <div className="space-y-2">
                    {['PATCH /tasks/{task}', 'GET|HEAD /dashboard', 'DELETE /tasks/{task}'].map((route, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-white/70">{route}</span>
                        <span className="text-white/50">MAX {['3.74s', '4.25s', '5.94s'][i]}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-4 w-full border-white/10 text-white/70 hover:bg-white/5">
                    View
                  </Button>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Exceptions</div>
                  <div className="text-white text-2xl font-semibold mb-1">149</div>
                  <div className="text-white/40 text-xs mb-4">exceptions reported in 24 hours</div>
                  <div className="text-white/40 text-xs mb-4">Errors have impacted 1398 users.</div>
                  <div className="h-[150px] bg-white/5 rounded border border-white/10 flex items-center justify-center">
                    <div className="text-white/30 text-xs">Chart</div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs text-white/50">
                    <span>128 HANDLED</span>
                    <span>88 UNHANDLED</span>
                  </div>
                  <Button variant="outline" size="sm" className="mt-4 w-full border-white/10 text-white/70 hover:bg-white/5">
                    View
                  </Button>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Job Attempts</div>
                  <div className="text-white text-2xl font-semibold mb-1">24.2k</div>
                  <div className="h-[80px] bg-white/5 rounded border border-white/10 flex items-center justify-center mt-4">
                    <div className="text-white/30 text-xs">Chart</div>
                  </div>
                  <div className="mt-6">
                    <div className="text-white/40 text-xs mb-2 uppercase tracking-[0.2em]">Job Duration</div>
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
                  <h4 className="text-lg font-semibold text-white">Your system health at a glance</h4>
                </div>
                <p className="text-white/60 text-sm leading-relaxed max-w-2xl">
                  Simplicity meets powerful insights. Nightwatch's dashboard provides a single, crystal-clear snapshot of your Laravel application's health.
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
                  Every event, connected together
                </h2>
                <p className="text-white/60 text-lg max-w-3xl mx-auto">
                  Connect every Laravel event in your application from requests and queries to jobs and cache operations, giving you a complete picture of your application health.
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
                  Nightwatch has already caught a couple of things that we need to look further into. So already getting value out of it, within an hour of the first deployment!
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
                    M
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium">Mathias Hansen</div>
                    <div className="text-white/50 text-sm">CTO & Co-Founder at Geocodio</div>
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
              <div className="grid lg:grid-cols-[1fr,1.2fr] gap-16 items-start" data-block>
                <div className="space-y-5">
                  <span className="inline-flex px-3 py-1.5 text-xs uppercase tracking-[0.4em] text-emerald-300/70 font-medium border border-emerald-300/20 rounded bg-emerald-300/5">
                    Issue tracking
                  </span>
                  <h3 className="text-4xl md:text-5xl font-semibold leading-tight text-white">
                    Track exceptions and performance issues
                  </h3>
                  <p className="text-white/60 text-lg">
                    Detect exceptions and performance issues automatically in realtime. With powerful collaboration tools and smart insights, your team can resolve problems quickly and confidently.
                  </p>
                </div>

                {/* Issues list - Exact Nightwatch style */}
                <div className="rounded-[32px] border border-white/10 bg-black/30 backdrop-blur-xl p-8">
                  <div className="space-y-2">
                    {sampleIssues.map((issue, i) => (
                      <div key={i} className="rounded-lg border border-white/10 bg-black/60 p-4 hover:border-white/20 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <span className="text-white font-semibold text-sm">{issue.id}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 text-xs uppercase tracking-wide border border-white/20 rounded text-white/70 bg-white/5">
                                {issue.type}
                              </span>
                            </div>
                            <p className="text-white/70 text-sm mb-2 line-clamp-1">{issue.message}</p>
                            <div className="flex items-center gap-3 text-xs text-white/50">
                              <span>{issue.date}</span>
                              <span>{issue.time}</span>
                              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold ml-auto">
                                {issue.user.charAt(0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Team members sidebar */}
                  <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.02] p-4">
                    <div className="space-y-2">
                      {['Jackie Haley', 'Mary Freund', 'Laura Mennell', 'Patrick Wilson', 'Glenn Ennis', 'Gerald Butler', 'Jean Smart'].map((name, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold">
                            {name.charAt(0)}
                          </div>
                          <span className="text-white/70 text-sm">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Collaborate section - Exact Nightwatch style */}
              <div className="grid md:grid-cols-3 gap-8" data-block>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">Collaborate with yourself or your team</h4>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Bring your team together with intuitive collaboration tools. Easily assign tasks, comment, set priorities, and define responsibilities to ensure perfect alignment for yourself, or your team.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">Configurable thresholds and rules</h4>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Define custom performance thresholds to automatically monitor and detect when your application's metrics exceed acceptable limits.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">Instant alerts</h4>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Receive alerts as soon as problems occur, enabling quick responses to maintain peak performance.
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
                  We installed it on our production system and instantly loved using it. We were troubleshooting some database query latency issues and were able to make improvements to troublesome queries right away!
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
                    R
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium">Ravi Peiris</div>
                    <div className="text-white/50 text-sm">Principal Software Engineer at BisectHosting</div>
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
                  Infrastructure
                </span>
                <h3 className="text-4xl md:text-5xl font-semibold text-white">Built to scale for trillions of events</h3>
                <p className="text-white/60 text-lg max-w-3xl">
                  Engineered with an astonishingly powerful column-oriented architecture, Nightwatch processes data with remarkable efficiency. Analyze billions of events in near real-time, while maintaining peak Laravel performance.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {infrastructureFeatures.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-black/60 p-6">
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2 text-white">{item.title}</h4>
                    <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
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
              <h3 className="text-4xl font-semibold text-white">FAQs</h3>
              <p className="text-white/60">
                Can't find your answer? <a href="/documentation" className="text-emerald-300 hover:text-emerald-200">Read our docs →</a>
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
                After we first installed Nightwatch we found an issue in our application we've likely had for years.
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
                  S
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">Sebastian Schlein</div>
                  <div className="text-white/50 text-sm">CEO BeyondCode</div>
                </div>
              </div>
            </div>
          </div>
        </section>

          {/* Final CTA - Exact Nightwatch style from Figma */}
          <section className="relative overflow-hidden border-y border-white/10 bg-black/80 z-10">
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 70%)" }} />
          <div className="relative px-4 py-28">
            <div className="container mx-auto max-w-[768px]">
              <div className="rounded-[32px] border border-white/10 bg-black/70 p-12 backdrop-blur-xl text-center space-y-6">
                <h3 className="text-4xl md:text-5xl font-semibold text-white">{t('index.hero.title')}</h3>
                <p className="text-white/70 text-lg">
                  Get started for free
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    size="lg" 
                    className="h-11 px-6 bg-[#4287ff] hover:bg-[#2f6be0] text-white text-base font-medium rounded-lg"
                    onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
                  >
                    {t('index.hero.getStarted')}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-11 px-6 bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/40 text-base font-medium rounded-lg"
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
