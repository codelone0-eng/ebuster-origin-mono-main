import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Award, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Hero Section */}
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-neutral-500" />
            <h1 className="text-lg font-semibold text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
              О нас
            </h1>
          </div>
          <p className="text-xs text-neutral-500" style={{ fontSize: '12px', lineHeight: '1.5' }}>
            Мы создаем инновационные решения для разработчиков и бизнеса
          </p>
        </div>

        {/* Mission & Values */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Target className="h-5 w-5 text-blue-500" />
              <h3 className="text-base font-semibold text-white">Наша миссия</h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Предоставлять высококачественные инструменты и сервисы, которые помогают разработчикам создавать лучшие продукты быстрее и эффективнее.
            </p>
          </div>

          <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="h-5 w-5 text-blue-500" />
              <h3 className="text-base font-semibold text-white">Наши ценности</h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Инновации, качество, прозрачность и забота о наших пользователях — это основа всего, что мы делаем.
            </p>
          </div>
        </div>

        {/* Team & Community */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Users className="h-5 w-5 text-blue-500" />
              <h3 className="text-base font-semibold text-white">Команда</h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Наша команда состоит из опытных разработчиков, дизайнеров и специалистов по поддержке, которые работают над созданием лучших решений для вас.
            </p>
          </div>

          <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Award className="h-5 w-5 text-blue-500" />
              <h3 className="text-base font-semibold text-white">Достижения</h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Мы гордимся доверием наших пользователей и постоянно работаем над улучшением наших продуктов и сервисов.
            </p>
          </div>
        </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
