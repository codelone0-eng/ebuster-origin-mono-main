import { Header } from "@/components/Header";
import { FAQ } from "@/components/FAQ";
import { AuthStatusChecker } from "@/components/AuthStatusChecker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { useEffect, useRef, useState } from "react";
import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { 
  Zap, Shield, Layers, ArrowRight, Code2, 
  Terminal, Boxes, Puzzle, Orbit, Binary, Cpu, Download, Cloud, User, RefreshCw,
  CheckCircle2, Sparkles, FileCode, Lock, Rocket, Settings, Globe, Play, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    // Connect Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Hero animations
  useEffect(() => {
    if (!heroRef.current) return;

    const tl = gsap.timeline();
    const elements = heroRef.current.querySelectorAll('.hero-element');
    
    tl.from(elements, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out"
    });

    // Floating animation for badge
    gsap.to('.hero-badge', {
      y: -10,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });

    return () => {
      tl.kill();
    };
  }, []);

  // Features stagger animation with advanced effects
  useEffect(() => {
    if (!featuresRef.current) return;

    const cards = featuresRef.current.querySelectorAll('.feature-card');
    
    cards.forEach((card, index) => {
      // Initial state
      gsap.set(card, {
        opacity: 0,
        y: 80,
        scale: 0.85,
        rotationX: 15,
      });

      // Animation timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none none",
        }
      });

      tl.to(card, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        duration: 1,
        delay: index * 0.15,
        ease: "power3.out",
      });

      // Hover animation enhancement
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.03,
          duration: 0.3,
          ease: "power2.out"
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Advanced text reveal animation with split text
  useEffect(() => {
    const headings = document.querySelectorAll('.reveal-text');
    headings.forEach(heading => {
      const text = heading.textContent || '';
      heading.innerHTML = '';
      const words = text.split(' ');
      
      words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';
        wordSpan.style.marginRight = '0.25em';
        wordSpan.style.overflow = 'hidden';
        
        word.split('').forEach((char, charIndex) => {
          const charSpan = document.createElement('span');
          charSpan.textContent = char;
          charSpan.style.display = 'inline-block';
          charSpan.style.opacity = '0';
          charSpan.style.transform = 'translateY(100%)';
          wordSpan.appendChild(charSpan);
          
          gsap.to(charSpan, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: (wordIndex * 0.1) + (charIndex * 0.03),
            ease: "power3.out",
            scrollTrigger: {
              trigger: heading,
              start: "top 85%",
              toggleActions: "play none none none",
            }
          });
        });
        
        heading.appendChild(wordSpan);
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Advanced parallax and scroll effects with smooth transitions
  useEffect(() => {
    const heroElements = heroRef.current?.querySelectorAll('.parallax-element');
    if (!heroElements) return;

    heroElements.forEach((el, index) => {
      const speed = 0.3 + (index * 0.2);
      gsap.to(el, {
        y: () => window.scrollY * speed,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        }
      });
    });

    // Section reveal with fade and scale
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
      if (index === 0) return; // Skip hero
      
      gsap.fromTo(section,
        { 
          opacity: 0, 
          y: 120,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none reverse",
          }
        }
      );
    });

    // Animated stat counters with smooth counting
    const counters = document.querySelectorAll('.stat-counter');
    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target') || '0');
      
      ScrollTrigger.create({
        trigger: counter.closest('.stat-item'),
        start: "top 80%",
        onEnter: () => {
          const obj = { value: 0 };
          gsap.to(obj, {
            value: target,
            duration: 2.5,
            ease: "power2.out",
            onUpdate: () => {
              counter.textContent = Math.floor(obj.value).toString();
            }
          });
        },
        once: true
      });
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
    <div className="min-h-screen bg-[#111111] overflow-x-hidden">
      <SEO
        title="EBUSTER — расширение нового поколения для Chrome"
        description="EBUSTER — №1 userscript менеджер с автоматизацией браузера, библиотекой скриптов и API. Бесплатная альтернатива Tampermonkey."
        url="https://ebuster.ru/"
      />
      <div className="relative">
        <AuthStatusChecker />
        <Header />

        {/* Hero Section with advanced animations */}
        <section ref={heroRef} className="relative pt-32 pb-40 px-4 min-h-[90vh] flex items-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div 
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1a1a1a] rounded-full blur-3xl opacity-20 parallax-element"
              style={{
                transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
              }}
            />
            <div 
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#1a1a1a] rounded-full blur-3xl opacity-20 parallax-element"
              style={{
                transform: `translate(${-mousePosition.x * 0.5}px, ${-mousePosition.y * 0.5}px)`
              }}
            />
          </div>

          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              <div className="hero-badge hero-element inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#2d2d2d] mb-8">
                <Code2 className="h-4 w-4 text-[#d9d9d9]" />
                <span className="text-xs text-[#808080] uppercase tracking-wider" style={{ fontSize: '11px', letterSpacing: '0.08em' }}>
                  {t('index.hero.badge')}
                </span>
              </div>

              <h1 className="hero-element text-6xl md:text-8xl font-bold mb-8 tracking-tight text-white" style={{ 
                fontSize: 'clamp(3rem, 10vw, 5.5rem)',
                fontWeight: 700,
                lineHeight: '1.1',
                letterSpacing: '-0.02em'
              }}>
                {t('index.hero.title')}
              </h1>
              
              <p className="hero-element text-xl md:text-2xl text-[#808080] mb-12 max-w-3xl mx-auto leading-relaxed" style={{
                fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
                lineHeight: '1.7'
              }}>
                {t('index.hero.subtitle')}
              </p>

              <div className="hero-element flex items-center justify-center gap-4 flex-wrap mb-20">
                <Button 
                  size="lg" 
                  className="group h-14 px-10 bg-[#404040] text-white hover:bg-[#4d4d4d] transition-all duration-300 relative overflow-hidden"
                  onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
                >
                  <span className="relative z-10 flex items-center">
                    <Download className="mr-2 h-5 w-5 group-hover:translate-y-[-2px] transition-transform" />
                    {t('index.hero.getStarted')}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-10 bg-[#1a1a1a] border-[#2d2d2d] text-white hover:bg-[#2d2d2d] transition-all duration-300"
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                >
                  <Terminal className="mr-2 h-5 w-5" />
                  {t('index.hero.documentation')}
                </Button>
              </div>

              {/* Stats Bar with animated counters and hover effects */}
              <div className="hero-element grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-20">
                {[
                  { label: 'Пользователей', value: 10, icon: User, suffix: 'K' },
                  { label: 'Скриптов', value: 500, icon: Code2, suffix: '+' },
                  { label: 'Загрузок', value: 50, icon: Download, suffix: 'K' },
                ].map((stat, i) => (
                  <div 
                    key={i} 
                    className="text-center stat-item group cursor-pointer"
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      gsap.to(el, {
                        scale: 1.15,
                        y: -10,
                        duration: 0.4,
                        ease: "back.out(1.5)"
                      });
                      
                      const icon = el.querySelector('.stat-icon');
                      if (icon) {
                        gsap.to(icon, {
                          rotate: 360,
                          scale: 1.2,
                          duration: 0.6,
                          ease: "back.out(2)"
                        });
                      }
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      gsap.to(el, {
                        scale: 1,
                        y: 0,
                        duration: 0.4,
                        ease: "power2.out"
                      });
                      
                      const icon = el.querySelector('.stat-icon');
                      if (icon) {
                        gsap.to(icon, {
                          rotate: 0,
                          scale: 1,
                          duration: 0.4,
                          ease: "power2.out"
                        });
                      }
                    }}
                  >
                    <div className="stat-icon inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#1a1a1a] border border-[#2d2d2d] mb-3 group-hover:border-[#404040] transition-colors duration-300">
                      <stat.icon className="h-5 w-5 text-[#d9d9d9]" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      <span className="stat-counter" data-target={stat.value}>0</span>
                      {stat.suffix}
                    </div>
                    <div className="text-sm text-[#808080]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with stagger animations */}
        <section ref={featuresRef} className="py-32 px-4 bg-[#1a1a1a] relative">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-20">
              <h2 className="reveal-text text-5xl md:text-6xl font-bold mb-6 text-white" style={{
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                fontWeight: 700,
                letterSpacing: '-0.02em'
              }}>
                {t('index.features.title')}
              </h2>
              <p className="text-lg text-[#808080] max-w-2xl mx-auto" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                {t('index.features.description')}
              </p>
            </div>

            {/* Main Feature Cards with advanced 3D tilt and magnetic effect */}
            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {features.map((feature, i) => (
                <Card 
                  key={i}
                  className="feature-card group bg-[#1a1a1a] border-[#2d2d2d] p-10 relative overflow-hidden cursor-pointer"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = (y - centerY) / 12;
                    const rotateY = (centerX - x) / 12;
                    
                    // Magnetic effect
                    const moveX = (x - centerX) * 0.1;
                    const moveY = (y - centerY) * 0.1;
                    
                    gsap.to(card, {
                      duration: 0.3,
                      rotateX: rotateX,
                      rotateY: rotateY,
                      x: moveX,
                      y: moveY,
                      scale: 1.03,
                      ease: "power2.out"
                    });

                    // Icon animation
                    const icon = card.querySelector('.feature-icon');
                    if (icon) {
                      gsap.to(icon, {
                        duration: 0.3,
                        rotate: 5,
                        scale: 1.1,
                        ease: "power2.out"
                      });
                    }
                  }}
                  onMouseLeave={(e) => {
                    const card = e.currentTarget;
                    gsap.to(card, {
                      duration: 0.5,
                      rotateX: 0,
                      rotateY: 0,
                      x: 0,
                      y: 0,
                      scale: 1,
                      ease: "elastic.out(1, 0.5)"
                    });

                    const icon = card.querySelector('.feature-icon');
                    if (icon) {
                      gsap.to(icon, {
                        duration: 0.3,
                        rotate: 0,
                        scale: 1,
                        ease: "power2.out"
                      });
                    }
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2d2d2d]/0 via-[#2d2d2d]/0 to-[#2d2d2d]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-0 relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="feature-icon w-14 h-14 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                        <feature.icon className="h-7 w-7 text-[#d9d9d9]" />
                      </div>
                      <h3 className="text-2xl font-semibold text-white">{feature.title}</h3>
                    </div>
                    <p className="text-[#808080] leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.7' }}>
                      {feature.desc}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2d2d2d] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features Grid with morphing reveal animation */}
            <div className="grid md:grid-cols-3 gap-6">
              {gridFeatures.map((feature, i) => (
                <Card 
                  key={i}
                  className="feature-card bg-[#1a1a1a] border-[#2d2d2d] p-8 group relative overflow-hidden"
                  onMouseEnter={(e) => {
                    const card = e.currentTarget;
                    gsap.to(card, {
                      duration: 0.4,
                      scale: 1.02,
                      y: -5,
                      ease: "power2.out"
                    });
                    
                    const icon = card.querySelector('.grid-icon');
                    if (icon) {
                      gsap.to(icon, {
                        duration: 0.4,
                        rotate: 360,
                        scale: 1.15,
                        ease: "back.out(2)"
                      });
                    }
                  }}
                  onMouseLeave={(e) => {
                    const card = e.currentTarget;
                    gsap.to(card, {
                      duration: 0.4,
                      scale: 1,
                      y: 0,
                      ease: "power2.out"
                    });
                    
                    const icon = card.querySelector('.grid-icon');
                    if (icon) {
                      gsap.to(icon, {
                        duration: 0.4,
                        rotate: 0,
                        scale: 1,
                        ease: "power2.out"
                      });
                    }
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2d2d2d]/0 to-[#2d2d2d]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-0 relative z-10">
                    <div className="grid-icon w-12 h-12 rounded-lg bg-[#2d2d2d] flex items-center justify-center mb-5">
                      <feature.icon className="h-6 w-6 text-[#d9d9d9]" />
                    </div>
                    <h3 className="text-lg font-semibold mb-3 text-white">{feature.title}</h3>
                    <p className="text-sm text-[#808080] leading-relaxed" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Extension Features with morphing cards */}
        <section className="py-32 px-4 bg-[#111111] relative">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-20">
              <h2 className="reveal-text text-5xl md:text-6xl font-bold mb-6 text-white" style={{
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                fontWeight: 700,
                letterSpacing: '-0.02em'
              }}>
                {t('index.extensionFeatures.title')}
              </h2>
              <p className="text-lg text-[#808080] max-w-2xl mx-auto" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                {t('index.extensionFeatures.description')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {extensionFeatures.map((feature, i) => (
                <Card 
                  key={i}
                  className="feature-card bg-[#1a1a1a] border-[#2d2d2d] p-8 group relative overflow-hidden"
                  onMouseEnter={(e) => {
                    const card = e.currentTarget;
                    gsap.to(card, {
                      duration: 0.5,
                      clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)',
                      ease: "power2.out"
                    });
                    
                    const icon = card.querySelector('.ext-icon');
                    if (icon) {
                      gsap.to(icon, {
                        duration: 0.5,
                        rotate: 180,
                        scale: 1.2,
                        ease: "back.out(2)"
                      });
                    }
                  }}
                  onMouseLeave={(e) => {
                    const card = e.currentTarget;
                    gsap.to(card, {
                      duration: 0.5,
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                      ease: "power2.out"
                    });
                    
                    const icon = card.querySelector('.ext-icon');
                    if (icon) {
                      gsap.to(icon, {
                        duration: 0.5,
                        rotate: 0,
                        scale: 1,
                        ease: "power2.out"
                      });
                    }
                  }}
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                  }}
                >
                  <div className="absolute inset-0 bg-[#2d2d2d]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-0 relative z-10">
                    <div className="ext-icon w-12 h-12 rounded-lg bg-[#2d2d2d] flex items-center justify-center mb-5">
                      <feature.icon className="h-6 w-6 text-[#d9d9d9]" />
                    </div>
                    <h3 className="text-lg font-semibold mb-3 text-white">{feature.title}</h3>
                    <p className="text-sm text-[#808080] leading-relaxed" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="group h-14 px-10 bg-[#404040] text-white hover:bg-[#4d4d4d] transition-all duration-300 relative overflow-hidden"
                onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
              >
                <span className="relative z-10 flex items-center">
                  <Download className="mr-2 h-5 w-5" />
                  {t('index.extensionFeatures.downloadExtension')}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-10 bg-[#1a1a1a] border-[#2d2d2d] text-white hover:bg-[#2d2d2d] transition-all duration-300"
              >
                <Code2 className="mr-2 h-5 w-5" />
                Документация
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-32 px-4 bg-[#1a1a1a]">
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
