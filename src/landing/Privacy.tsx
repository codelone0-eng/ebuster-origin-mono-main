import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const Privacy = () => {
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
    <div className="min-h-screen bg-[#111111]">
      <Header />
      
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="text-center mb-12 fade-in-on-scroll">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white" style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: '1.1'
          }}>
            Политика конфиденциальности
          </h1>
          <p className="text-[#808080]" style={{ fontSize: '14px' }}>
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6 fade-in-on-scroll transition-colors">
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

          <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6 fade-in-on-scroll transition-colors">
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

          <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6 fade-in-on-scroll transition-colors">
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

          <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6 fade-in-on-scroll transition-colors">
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

export default Privacy;
