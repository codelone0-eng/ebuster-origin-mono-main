import React, { useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import Silk from '@/components/Silk';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Terms = () => {
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

    const cards = cardsRef.current.querySelectorAll('.terms-card');
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

        {/* Silk background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Silk speed={5} scale={1} color="#ffffff" noiseIntensity={4.3} rotation={0} />
        </div>
        <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-[1] pointer-events-none" />

        <div className="relative z-10">
      <main className="flex-1">
        <section className="relative bg-black/80 px-4 py-32 z-10">
          <div className="container mx-auto max-w-4xl px-4 py-16">
          <div ref={heroRef} className="text-center mb-12">
            <h1 className="hero-element text-4xl md:text-6xl font-bold mb-6 text-white" style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              lineHeight: '1.1'
            }}>
              Условия использования
            </h1>
            <p className="hero-element text-white/60" style={{ fontSize: '14px' }}>
              Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
            </p>
          </div>

          <div ref={cardsRef} className="space-y-6">
            <Card className="terms-card rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-colors duration-200">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-white" />
                  <h3 className="text-xl font-semibold text-white">Общие положения</h3>
                </div>
                <div className="space-y-4 text-white/60" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  <p>
                    Используя наш сервис, вы соглашаетесь с настоящими условиями использования. Пожалуйста, внимательно прочитайте их перед началом работы с платформой.
                  </p>
                  <p>
                    Мы оставляем за собой право изменять эти условия в любое время. Продолжая использовать сервис после внесения изменений, вы соглашаетесь с новыми условиями.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="terms-card rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-colors duration-200">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                  <h3 className="text-xl font-semibold text-white">Права пользователя</h3>
                </div>
                <div className="space-y-4 text-white/60" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  <p>
                    При использовании нашего сервиса вы имеете право:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Получать доступ ко всем функциям в рамках вашего тарифного плана</li>
                    <li>Получать техническую поддержку</li>
                    <li>Экспортировать ваши данные</li>
                    <li>Удалить ваш аккаунт в любое время</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="terms-card rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-colors duration-200">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-white" />
                  <h3 className="text-xl font-semibold text-white">Обязанности пользователя</h3>
                </div>
                <div className="space-y-4 text-white/60" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  <p>
                    Используя наш сервис, вы обязуетесь:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Предоставлять точную и актуальную информацию</li>
                    <li>Соблюдать законодательство РФ</li>
                    <li>Не использовать сервис для незаконной деятельности</li>
                    <li>Не нарушать права других пользователей</li>
                    <li>Обеспечивать безопасность вашего аккаунта</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="terms-card rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-colors duration-200">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="h-6 w-6 text-white" />
                  <h3 className="text-xl font-semibold text-white">Ограничения</h3>
                </div>
                <div className="space-y-4 text-white/60" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  <p>
                    Запрещается:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Попытки несанкционированного доступа к системе</li>
                    <li>Распространение вредоносного ПО</li>
                    <li>Перепродажа доступа к сервису без разрешения</li>
                    <li>Использование автоматизированных средств для сбора данных</li>
                    <li>Нарушение работы сервиса</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="terms-card rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-colors duration-200">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-white" />
                  <h3 className="text-xl font-semibold text-white">Ответственность</h3>
                </div>
                <div className="space-y-4 text-white/60" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  <p>
                    Мы предоставляем сервис "как есть" и не несем ответственности за:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Потерю данных в результате технических сбоев</li>
                    <li>Неправомерное использование сервиса третьими лицами</li>
                    <li>Ущерб, причиненный использованием или невозможностью использования сервиса</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
        </section>
        </div>
      </main>
      
      <Footer />
      </div>
    </div>
  );
};

export default Terms;
