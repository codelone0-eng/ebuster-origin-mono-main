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
        <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-neutral-500" />
            <h1 className="text-lg font-semibold text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
              Условия использования
            </h1>
          </div>
          <p className="text-xs text-neutral-500">Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-semibold text-white">Общие положения</h3>
            </div>
            <div className="space-y-2 text-xs text-neutral-500">
              <p>
                Используя наш сервис, вы соглашаетесь с настоящими условиями использования. Пожалуйста, внимательно прочитайте их перед началом работы с платформой.
              </p>
              <p>
                Мы оставляем за собой право изменять эти условия в любое время. Продолжая использовать сервис после внесения изменений, вы соглашаетесь с новыми условиями.
              </p>
            </div>
          </div>

          <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-semibold text-white">Права пользователя</h3>
            </div>
            <div className="space-y-2 text-xs text-neutral-500">
              <p>При использовании нашего сервиса вы имеете право:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Получать доступ ко всем функциям в рамках вашего тарифного плана</li>
                <li>Получать техническую поддержку</li>
                <li>Экспортировать ваши данные</li>
                <li>Удалить ваш аккаунт в любое время</li>
              </ul>
            </div>
          </div>

          <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-semibold text-white">Обязанности пользователя</h3>
            </div>
            <div className="space-y-2 text-xs text-neutral-500">
              <p>Используя наш сервис, вы обязуетесь:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Предоставлять точную и актуальную информацию</li>
                <li>Соблюдать законодательство РФ</li>
                <li>Не использовать сервис для незаконной деятельности</li>
                <li>Не нарушать права других пользователей</li>
                <li>Обеспечивать безопасность вашего аккаунта</li>
              </ul>
            </div>
          </div>

          <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <XCircle className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-semibold text-white">Ограничения</h3>
            </div>
            <div className="space-y-2 text-xs text-neutral-500">
              <p>Запрещается:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Попытки несанкционированного доступа к системе</li>
                <li>Распространение вредоносного ПО</li>
                <li>Перепродажа доступа к сервису без разрешения</li>
                <li>Использование автоматизированных средств для сбора данных</li>
                <li>Нарушение работы сервиса</li>
              </ul>
            </div>
          </div>

          <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-semibold text-white">Ответственность</h3>
            </div>
            <div className="space-y-2 text-xs text-neutral-500">
              <p>Мы предоставляем сервис "как есть" и не несем ответственности за:
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
