import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';
import { SilkBackground } from '@/components/SilkBackground';

const Error500 = () => {
  return (
    <div className="min-h-screen bg-black overflow-x-hidden text-white">
      <div className="relative">
        <Header />
        
        <SilkBackground />

        <div className="relative z-10">
          <main className="flex-1">
            <section className="relative bg-black/80 px-4 py-32 z-10">
              <div className="container mx-auto max-w-4xl px-4 py-16">
                <div className="text-center">
              {/* Цифра 500 */}
              <div className="mb-8">
                    <h1 className="text-9xl md:text-[12rem] font-bold text-white mb-4" style={{
                      fontSize: 'clamp(6rem, 15vw, 12rem)',
                      fontWeight: 700,
                      lineHeight: '1',
                      letterSpacing: '-0.02em'
                    }}>
                  500
                    </h1>
              </div>

              {/* Заголовок */}
                  <h2 className="text-4xl md:text-6xl font-semibold text-white mb-6" style={{
                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                    fontWeight: 600
                  }}>
                Внутренняя ошибка сервера
                  </h2>
              
              {/* Описание */}
                  <p className="text-xl text-white/60 mb-12 leading-relaxed max-w-2xl mx-auto">
                Произошла непредвиденная ошибка на сервере. Мы уже работаем над её устранением.
              </p>

              {/* Анимированные элементы ошибки */}
                  <div className="flex justify-center gap-2 mb-12">
                    <div className="w-3 h-3 bg-emerald-300/70 rounded-full animate-ping"></div>
                    <div className="w-3 h-3 bg-emerald-300/70 rounded-full animate-ping" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-emerald-300/70 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-emerald-300/70 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                    <div className="w-3 h-3 bg-emerald-300/70 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
              </div>

              {/* Кнопки действий */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <Button asChild className="h-11 px-6 bg-white text-black hover:bg-white/90 text-base font-normal rounded-lg">
                  <Link to="/" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    На главную
                  </Link>
                </Button>
                
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.reload()} 
                      className="h-11 px-6 bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/40 rounded-lg"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                  Попробовать снова
                </Button>
              </div>

              {/* Дополнительная информация */}
                  <div className="mt-12 p-8 rounded-xl border border-white/10 bg-white/[0.02] max-w-2xl mx-auto text-left">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="h-5 w-5 text-emerald-300/70" />
                      <h3 className="text-lg font-semibold text-white">
                    Что делать?
                  </h3>
                </div>
                    <ul className="text-sm text-white/60 space-y-2">
                  <li>• Попробуйте обновить страницу</li>
                  <li>• Проверьте подключение к интернету</li>
                  <li>• Очистите кэш браузера</li>
                  <li>• Если проблема повторяется, обратитесь в поддержку</li>
                </ul>
              </div>
                </div>
              </div>
            </section>
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Error500;
