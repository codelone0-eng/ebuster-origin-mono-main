import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

const Terms = () => {
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
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <div className="text-center mb-12 fade-in-on-scroll">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white" style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              lineHeight: '1.1'
            }}>
              Условия <span className="text-blue-500">использования</span>
            </h1>
            <p className="text-[#808080]" style={{ fontSize: '14px' }}>
              Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
            </p>
          </div>

          <div className="space-y-6">
            <Card className="bg-[#1f1f1f] border-[#2d2d2d] p-6 fade-in-on-scroll hover:border-blue-500/30 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-blue-500" />
                  <h3 className="text-xl font-semibold text-white">Общие положения</h3>
                </div>
                <div className="space-y-4 text-[#808080]" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  <p>
                    Используя наш сервис, вы соглашаетесь с настоящими условиями использования. Пожалуйста, внимательно прочитайте их перед началом работы с платформой.
                  </p>
                  <p>
                    Мы оставляем за собой право изменять эти условия в любое время. Продолжая использовать сервис после внесения изменений, вы соглашаетесь с новыми условиями.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1f1f1f] border-[#2d2d2d] p-6 fade-in-on-scroll hover:border-blue-500/30 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-blue-500" />
                  <h3 className="text-xl font-semibold text-white">Права пользователя</h3>
                </div>
                <div className="space-y-4 text-[#808080]" style={{ fontSize: '14px', lineHeight: '1.5' }}>
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

            <Card className="bg-[#1f1f1f] border-[#2d2d2d] p-6 fade-in-on-scroll hover:border-blue-500/30 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-blue-500" />
                  <h3 className="text-xl font-semibold text-white">Обязанности пользователя</h3>
                </div>
                <div className="space-y-4 text-[#808080]" style={{ fontSize: '14px', lineHeight: '1.5' }}>
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

            <Card className="bg-[#1f1f1f] border-[#2d2d2d] p-6 fade-in-on-scroll hover:border-blue-500/30 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="h-6 w-6 text-blue-500" />
                  <h3 className="text-xl font-semibold text-white">Ограничения</h3>
                </div>
                <div className="space-y-4 text-[#808080]" style={{ fontSize: '14px', lineHeight: '1.5' }}>
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

            <Card className="bg-[#1f1f1f] border-[#2d2d2d] p-6 fade-in-on-scroll hover:border-blue-500/30 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-blue-500" />
                  <h3 className="text-xl font-semibold text-white">Ответственность</h3>
                </div>
                <div className="space-y-4 text-[#808080]" style={{ fontSize: '14px', lineHeight: '1.5' }}>
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

export default Terms;
