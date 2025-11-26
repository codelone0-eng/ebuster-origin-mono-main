import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BeamsUpstream } from '@/components/ui/beams-upstream';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';
import Silk from '@/components/Silk';

const Error404 = () => {
  return (
    <div className="min-h-screen bg-black overflow-x-hidden text-white">
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
                <div className="text-center">
              {/* Цифра 404 */}
              <div className="mb-8">
                    <h1 className="text-9xl md:text-[12rem] font-bold text-white mb-4" style={{
                      fontSize: 'clamp(6rem, 15vw, 12rem)',
                      fontWeight: 700,
                      lineHeight: '1',
                      letterSpacing: '-0.02em'
                    }}>
                  404
                    </h1>
              </div>

              {/* Заголовок */}
                  <h2 className="text-4xl md:text-6xl font-semibold text-white mb-6" style={{
                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                    fontWeight: 600
                  }}>
                Страница не найдена
                  </h2>
              
              {/* Описание */}
                  <p className="text-xl text-white/60 mb-12 leading-relaxed max-w-2xl mx-auto">
                К сожалению, запрашиваемая страница не существует или была перемещена.
              </p>

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
                      onClick={() => window.history.back()} 
                      className="h-11 px-6 bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/40 rounded-lg"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Button>
              </div>

              {/* Дополнительная информация */}
                  <div className="mt-12 p-8 rounded-xl border border-white/10 bg-white/[0.02] max-w-2xl mx-auto text-left">
                    <h3 className="text-lg font-semibold text-white mb-4">
                  Возможные причины:
                </h3>
                    <ul className="text-sm text-white/60 space-y-2">
                  <li>• Неправильно введен URL</li>
                  <li>• Страница была перемещена или удалена</li>
                  <li>• Временные технические проблемы</li>
                  <li>• Устаревшая ссылка</li>
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

export default Error404;
