import React, { useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Award, Heart } from 'lucide-react';
import { SilkBackground } from '@/components/SilkBackground';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
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

    const cards = cardsRef.current.querySelectorAll('.about-card');
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

  return (
    <div className="min-h-screen bg-black overflow-x-hidden text-white flex flex-col">
      <div className="relative">
        <Header />

        <SilkBackground />

        <div className="relative z-10">
      <main className="flex-1">
        <section className="relative bg-black/80 px-4 py-32 z-10">
          <div className="container mx-auto max-w-7xl px-4 py-16">
          {/* Hero Section */}
          <div ref={heroRef} className="text-center mb-16">
            <h1 className="hero-element text-4xl md:text-6xl font-bold mb-6 text-white" style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              lineHeight: '1.1'
            }}>
              О нас
            </h1>
            
            <p className="hero-element text-lg text-white/60 max-w-3xl mx-auto mb-8 leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.6' }}>
              Мы создаем инновационные решения для разработчиков и бизнеса
            </p>
          </div>

          {/* Mission & Values */}
          <div ref={cardsRef} className="grid md:grid-cols-2 gap-6 mb-16">
            <Card className="about-card rounded-xl border border-white/10 bg-white/[0.02] p-8 transition-colors duration-200 hover:border-white/20">
              <CardHeader className="p-0 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white">Наша миссия</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-white/60 leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  Предоставлять высококачественные инструменты и сервисы, которые помогают разработчикам создавать лучшие продукты быстрее и эффективнее.
                </p>
              </CardContent>
            </Card>

            <Card className="about-card rounded-xl border border-white/10 bg-white/[0.02] p-8 transition-colors duration-200 hover:border-white/20">
              <CardHeader className="p-0 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white">Наши ценности</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-white/60 leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  Инновации, качество, прозрачность и забота о наших пользователях — это основа всего, что мы делаем.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Team & Community */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="about-card rounded-xl border border-white/10 bg-white/[0.02] p-8 transition-colors duration-200 hover:border-white/20">
              <CardHeader className="p-0 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white">Команда</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-white/60 leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  Наша команда состоит из опытных разработчиков, дизайнеров и специалистов по поддержке, которые работают над созданием лучших решений для вас.
                </p>
              </CardContent>
            </Card>

            <Card className="about-card rounded-xl border border-white/10 bg-white/[0.02] p-8 transition-colors duration-200 hover:border-white/20">
              <CardHeader className="p-0 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Award className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white">Достижения</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-white/60 leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  Мы гордимся доверием наших пользователей и постоянно работаем над улучшением наших продуктов и сервисов.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        </section>
      </main>
      </div>
      
      <Footer />
      </div>
    </div>
  );
};

export default About;
