import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#111111]">
      <Header />
      
      <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-neutral-500" />
            <h1 className="text-lg font-semibold text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
              Политика конфиденциальности
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mb-4">Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-semibold text-white">Сбор информации</h3>
            </div>
            <div className="space-y-2 text-xs text-neutral-500">
              <p>
                Мы собираем информацию, которую вы предоставляете при регистрации, включая имя, email и другие данные профиля.
              </p>
              <p>
                Также мы автоматически собираем техническую информацию о вашем устройстве и использовании сервиса для улучшения качества предоставляемых услуг.
              </p>
            </div>
          </div>

          <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-semibold text-white">Использование данных</h3>
            </div>
            <div className="space-y-2 text-xs text-neutral-500">
              <p>Ваши данные используются для:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Предоставления и улучшения наших сервисов</li>
                <li>Связи с вами по вопросам поддержки</li>
                <li>Отправки важных уведомлений о сервисе</li>
                <li>Анализа использования платформы</li>
              </ul>
            </div>
          </div>

          <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Eye className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-semibold text-white">Защита данных</h3>
            </div>
            <div className="space-y-2 text-xs text-neutral-500">
              <p>
                Мы применяем современные методы шифрования и безопасности для защиты ваших данных.
              </p>
              <p>
                Доступ к персональным данным имеют только авторизованные сотрудники, которым это необходимо для выполнения их обязанностей.
              </p>
            </div>
          </div>

          <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-semibold text-white">Ваши права</h3>
            </div>
            <div className="space-y-2 text-xs text-neutral-500">
              <p>Вы имеете право:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Запросить доступ к вашим персональным данным</li>
                <li>Исправить неточные данные</li>
                <li>Удалить ваши данные</li>
                <li>Ограничить обработку данных</li>
                <li>Возразить против обработки данных</li>
              </ul>
              <p className="mt-2">
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
