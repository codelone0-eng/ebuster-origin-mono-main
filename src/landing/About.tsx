import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Award, Heart } from 'lucide-react';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    
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
    <div className="min-h-screen bg-[#111111] flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16 fade-in-on-scroll">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white" style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              lineHeight: '1.1'
            }}>
              О нас
            </h1>
            
            <p className="text-lg text-[#808080] max-w-3xl mx-auto mb-8 leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.6' }}>
              Мы создаем инновационные решения для разработчиков и бизнеса
            </p>
          </div>

          {/* Mission & Values */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-8 fade-in-on-scroll transition-colors">
              <CardHeader className="p-0 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                      <Target className="h-6 w-6 text-[#d9d9d9]" />
                  </div>
                  <CardTitle className="text-2xl text-white">Наша миссия</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-[#808080] leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  Предоставлять высококачественные инструменты и сервисы, которые помогают разработчикам создавать лучшие продукты быстрее и эффективнее.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-8 fade-in-on-scroll transition-colors">
              <CardHeader className="p-0 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                      <Heart className="h-6 w-6 text-[#d9d9d9]" />
                  </div>
                  <CardTitle className="text-2xl text-white">Наши ценности</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-[#808080] leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  Инновации, качество, прозрачность и забота о наших пользователях — это основа всего, что мы делаем.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Team & Community */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-8 fade-in-on-scroll transition-colors">
              <CardHeader className="p-0 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                      <Users className="h-6 w-6 text-[#d9d9d9]" />
                  </div>
                  <CardTitle className="text-2xl text-white">Команда</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-[#808080] leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  Наша команда состоит из опытных разработчиков, дизайнеров и специалистов по поддержке, которые работают над созданием лучших решений для вас.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-8 fade-in-on-scroll transition-colors">
              <CardHeader className="p-0 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                      <Award className="h-6 w-6 text-[#d9d9d9]" />
                  </div>
                  <CardTitle className="text-2xl text-white">Достижения</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-[#808080] leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  Мы гордимся доверием наших пользователей и постоянно работаем над улучшением наших продуктов и сервисов.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />

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

export default About;
