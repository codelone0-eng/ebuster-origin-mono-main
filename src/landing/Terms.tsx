import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Условия <span className="gradient-text">использования</span>
          </h1>
          <p className="text-muted-foreground">Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</p>
        </div>

        <div className="space-y-8">
          <Card className="bg-card/30 backdrop-blur-sm border content-border-30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle>Общие положения</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Используя наш сервис, вы соглашаетесь с настоящими условиями использования. Пожалуйста, внимательно прочитайте их перед началом работы с платформой.
              </p>
              <p>
                Мы оставляем за собой право изменять эти условия в любое время. Продолжая использовать сервис после внесения изменений, вы соглашаетесь с новыми условиями.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border content-border-30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-primary" />
                <CardTitle>Права пользователя</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                При использовании нашего сервиса вы имеете право:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Получать доступ ко всем функциям в рамках вашего тарифного плана</li>
                <li>Получать техническую поддержку</li>
                <li>Экспортировать ваши данные</li>
                <li>Удалить ваш аккаунт в любое время</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border content-border-30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-primary" />
                <CardTitle>Обязанности пользователя</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
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
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border content-border-30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-primary" />
                <CardTitle>Ограничения</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
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
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border content-border-30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle>Ответственность</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Мы предоставляем сервис "как есть" и не несем ответственности за:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Прямые или косвенные убытки от использования сервиса</li>
                <li>Потерю данных в результате технических сбоев</li>
                <li>Действия третьих лиц</li>
              </ul>
              <p className="mt-4">
                Для получения дополнительной информации свяжитесь с нами: <a href="mailto:techsupport@ebuster.ru" className="text-primary hover:underline">techsupport@ebuster.ru</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Terms;
