import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Политика <span className="gradient-text">конфиденциальности</span>
          </h1>
          <p className="text-muted-foreground">Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</p>
        </div>

        <div className="space-y-8">
          <Card className="bg-card/30 backdrop-blur-sm border border-dashed content-border-30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>Сбор информации</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Мы собираем информацию, которую вы предоставляете при регистрации, включая имя, email и другие данные профиля.
              </p>
              <p>
                Также мы автоматически собираем техническую информацию о вашем устройстве и использовании сервиса для улучшения качества предоставляемых услуг.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border border-dashed content-border-30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-primary" />
                <CardTitle>Использование данных</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Ваши данные используются для:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Предоставления и улучшения наших сервисов</li>
                <li>Связи с вами по вопросам поддержки</li>
                <li>Отправки важных уведомлений о сервисе</li>
                <li>Анализа использования платформы</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border border-dashed content-border-30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Eye className="h-6 w-6 text-primary" />
                <CardTitle>Защита данных</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Мы применяем современные методы шифрования и безопасности для защиты ваших данных.
              </p>
              <p>
                Доступ к персональным данным имеют только авторизованные сотрудники, которым это необходимо для выполнения их обязанностей.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border border-dashed content-border-30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle>Ваши права</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
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
                Для реализации этих прав свяжитесь с нами по адресу: <a href="mailto:techsupport@ebuster.ru" className="text-primary hover:underline">techsupport@ebuster.ru</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Privacy;
