import React, { useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Privacy = () => {
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

    const cards = cardsRef.current.querySelectorAll('.privacy-card');
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
    <div className="min-h-screen bg-[#111111]">
      <Header />
      
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div ref={heroRef} className="text-center mb-12">
          <h1 className="hero-element text-4xl md:text-6xl font-bold mb-6 text-white" style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: '1.1'
          }}>
            Политика конфиденциальности
          </h1>
          <p className="hero-element text-[#808080]" style={{ fontSize: '14px' }}>
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>

        <div ref={cardsRef} className="space-y-6">
          <Card className="privacy-card bg-[#1a1a1a] border-[#2d2d2d] p-6 transition-colors duration-200">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-[#d9d9d9]" />
                <h3 className="text-xl font-semibold text-white">Сбор информации</h3>
              </div>
              <div className="space-y-4 text-[#808080]" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                <p>
                  Мы собираем информацию, которую вы предоставляете при регистрации, включая имя, email и другие данные профиля.
                </p>
                <p>
                  Также мы автоматически собираем техническую информацию о вашем устройстве и использовании сервиса для улучшения качества предоставляемых услуг.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="privacy-card bg-[#1a1a1a] border-[#2d2d2d] p-6 transition-colors duration-200">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-6 w-6 text-[#d9d9d9]" />
                <h3 className="text-xl font-semibold text-white">Использование данных</h3>
              </div>
              <div className="space-y-4 text-[#808080]" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                <p>
                  Ваши данные используются для:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Предоставления и улучшения наших сервисов</li>
                  <li>Связи с вами по вопросам поддержки</li>
                  <li>Отправки важных уведомлений о сервисе</li>
                  <li>Анализа использования платформы</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="privacy-card bg-[#1a1a1a] border-[#2d2d2d] p-6 transition-colors duration-200">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-6 w-6 text-[#d9d9d9]" />
                <h3 className="text-xl font-semibold text-white">Защита данных</h3>
              </div>
              <div className="space-y-4 text-[#808080]" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                <p>
                  Мы применяем современные методы шифрования и безопасности для защиты ваших данных.
                </p>
                <p>
                  Доступ к персональным данным имеют только авторизованные сотрудники, которым это необходимо для выполнения их обязанностей.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="privacy-card bg-[#1a1a1a] border-[#2d2d2d] p-6 transition-colors duration-200">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-[#d9d9d9]" />
                <h3 className="text-xl font-semibold text-white">Ваши права</h3>
              </div>
              <div className="space-y-4 text-[#808080]" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                <p>
                  Вы имеете право:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Запросить доступ к вашим персональным данным</li>
                  <li>Исправить неточные данные</li>
                  <li>Удалить ваши данные</li>
                  <li>Ограничить обработку данных</li>
                  <li>Возразить против обработки данных</li>
                </ul>
                <p className="mt-4">
                  Для реализации этих прав свяжитесь с нами по адресу: <a href="mailto:techsupport@ebuster.ru" className="text-[#d9d9d9] hover:underline">techsupport@ebuster.ru</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Privacy;
