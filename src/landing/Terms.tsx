import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Условия <span className="text-blue-500">использования</span>
          </h1>
          <p className="text-[#808080]">Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</p>
        </div>

        <div className="space-y-8">
          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-blue-500" />
              <h3 className="text-xl font-semibold text-white">Общие положения</h3>
            </div>
            <div className="space-y-4 text-[#808080]">
              <p>
                Используя наш сервис, вы соглашаетесь с настоящими условиями использования. Пожалуйста, внимательно прочитайте их перед началом работы с платформой.
              </p>
              <p>
                Мы оставляем за собой право изменять эти условия в любое время. Продолжая использовать сервис после внесения изменений, вы соглашаетесь с новыми условиями.
              </p>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-blue-500" />
              <h3 className="text-xl font-semibold text-white">Права пользователя</h3>
            </div>
            <div className="space-y-4 text-[#808080]">
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
          </div>

          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-blue-500" />
              <h3 className="text-xl font-semibold text-white">Обязанности пользователя</h3>
            </div>
            <div className="space-y-4 text-[#808080]">
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
          </div>

          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="h-6 w-6 text-blue-500" />
              <h3 className="text-xl font-semibold text-white">Ограничения</h3>
            </div>
            <div className="space-y-4 text-[#808080]">
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
          </div>

          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-blue-500" />
              <h3 className="text-xl font-semibold text-white">Ответственность</h3>
            </div>
            <div className="space-y-4 text-[#808080]">
              <p>
                Мы предоставляем сервис "как есть" и не несем ответственности за:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Прямые или косвенные убытки от использования сервиса</li>
                <li>Потерю данных в результате технических сбоев</li>
                <li>Действия третьих лиц</li>
              </ul>
              <p className="mt-4">
                Для получения дополнительной информации свяжитесь с нами: <a href="mailto:techsupport@ebuster.ru" className="text-blue-500 hover:underline">techsupport@ebuster.ru</a>
              </p>
            </div>
          </div>
        </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terms;
