import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ParticleBackground } from '@/components/ParticleBackground';
import { PricingPlans } from '@/components/PricingPlans';
import { Crown } from 'lucide-react';

const PricingNew = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <div className="relative z-content">
        <Header />
        
        <div className="container mx-auto max-w-7xl px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card/50 backdrop-blur-sm border border-border mb-8">
              <Crown className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-muted-foreground">Гибкие планы подписок</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Выберите <span className="gradient-text">идеальный план</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              От бесплатного плана для начинающих до премиум возможностей для профессионалов
            </p>
          </div>

          {/* Pricing Plans Component */}
          <PricingPlans />

          {/* FAQ Section */}
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Часто задаваемые вопросы</h2>
            
            <div className="space-y-6">
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Можно ли отменить подписку в любое время?</h3>
                <p className="text-muted-foreground">Да, вы можете отменить подписку в любое время. Доступ к премиум функциям сохранится до конца оплаченного периода.</p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Что происходит после окончания подписки?</h3>
                <p className="text-muted-foreground">После окончания подписки ваш аккаунт автоматически переключится на бесплатный план. Все ваши данные сохранятся.</p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Можно ли перейти с одного плана на другой?</h3>
                <p className="text-muted-foreground">Да, вы можете в любое время обновить или понизить свой план. При обновлении разница будет пропорционально пересчитана.</p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Есть ли скидки для студентов или некоммерческих организаций?</h3>
                <p className="text-muted-foreground">Да, мы предоставляем специальные скидки. Свяжитесь с нами через форму поддержки для получения подробной информации.</p>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default PricingNew;
