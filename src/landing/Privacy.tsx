import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#111111]">
      <Header />
      
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Политика <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">конфиденциальности</span>
          </h1>
          <p className="text-[#808080]">Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</p>
        </div>

        <div className="space-y-8">
          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-blue-500" />
              <h3 className="text-xl font-semibold text-white">Сбор информации</h3>
            </div>
            <div className="space-y-4 text-[#808080]">
              <p>
                Мы собираем информацию, которую вы предоставляете при регистрации, включая имя, email и другие данные профиля.
              </p>
              <p>
                Также мы автоматически собираем техническую информацию о вашем устройстве и использовании сервиса для улучшения качества предоставляемых услуг.
              </p>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-6 w-6 text-blue-500" />
              <h3 className="text-xl font-semibold text-white">Использование данных</h3>
            </div>
            <div className="space-y-4 text-[#808080]">
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
          </div>

          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-6 w-6 text-blue-500" />
              <h3 className="text-xl font-semibold text-white">Защита данных</h3>
            </div>
            <div className="space-y-4 text-[#808080]">
              <p>
                Мы применяем современные методы шифрования и безопасности для защиты ваших данных.
              </p>
              <p>
                Доступ к персональным данным имеют только авторизованные сотрудники, которым это необходимо для выполнения их обязанностей.
              </p>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-blue-500" />
              <h3 className="text-xl font-semibold text-white">Ваши права</h3>
            </div>
            <div className="space-y-4 text-[#808080]">
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
                Для реализации этих прав свяжитесь с нами по адресу: <a href="mailto:techsupport@ebuster.ru" className="text-blue-500 hover:underline">techsupport@ebuster.ru</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Privacy;
