import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { 
  Zap, 
  Shield, 
  Layers, 
  Terminal,
  ArrowRight,
  CheckCircle,
  Rocket,
  Users,
  Award,
  Key
} from 'lucide-react';

const Advantages = () => {
  const { t } = useLanguage();

  // Упрощенные карточки без раскрытия внутренних метрик/тех. деталей
  const coreAdvantages = t('advantages.advantages');

  const technicalSpecs = [
    {
      category: "Производительность",
      specs: [
        { label: "Время отклика", value: "< 50ms" },
        { label: "Пропускная способность", value: "10,000+ RPS" },
        { label: "Доступность", value: "99.99%" },
        { label: "Масштабирование", value: "Горизонтальное" }
      ]
    },
    {
      category: "Безопасность",
      specs: [
        { label: "Шифрование", value: "AES-256" },
        { label: "Аутентификация", value: "OAuth 2.0" },
        { label: "Сертификация", value: "SOC 2 Type II" },
        { label: "Аудит", value: "Полное логирование" }
      ]
    },
    {
      category: "Интеграция",
      specs: [
        { label: "API форматы", value: "REST + GraphQL" },
        { label: "SDK языки", value: "8+ языков" },
        { label: "Документация", value: "Интерактивная" },
        { label: "Поддержка", value: "24/7" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#111111]">
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Hero Section */}
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-neutral-500" />
            <h1 className="text-lg font-semibold text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
              {t('advantages.hero.title')}
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mb-4" style={{ fontSize: '12px', lineHeight: '1.5' }}>
            {t('advantages.hero.description')}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="sm" className="h-9 px-6 bg-blue-600 text-white hover:bg-blue-700">
              <Rocket className="h-4 w-4 mr-2" />
              {t('advantages.cta.getStarted')}
            </Button>
            <Button size="sm" variant="outline" className="h-9 px-6 bg-[#1f1f1f] border-[#2d2d2d] text-white hover:bg-[#2d2d2d]">
              <Terminal className="h-4 w-4 mr-2" />
              {t('advantages.cta.viewApi')}
            </Button>
          </div>
        </div>

        {/* Core Advantages */}
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-5 w-5 text-neutral-500" />
            <h2 className="text-lg font-semibold text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
              {t('advantages.features.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {coreAdvantages.map((advantage, index) => (
              <div key={index} className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded bg-blue-600/10 flex items-center justify-center">
                    <advantage.icon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">{advantage.title}</h3>
                    <p className="text-xs text-neutral-500">
                      {advantage.description}
                    </p>
                  </div>
                </div>
                <ul className="space-y-1 mt-2">
                  {advantage.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" />
                      <span className="text-neutral-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-white">{t('advantages.cta.title')}</h3>
          <p className="text-xs text-neutral-500 mb-4">
            {t('advantages.cta.description')}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="sm" className="h-9 px-6 bg-blue-600 text-white hover:bg-blue-700">
              <Rocket className="h-4 w-4 mr-2" />
              {t('advantages.cta.getStarted')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button size="sm" variant="outline" className="h-9 px-6 bg-[#1f1f1f] border-[#2d2d2d] text-white hover:bg-[#2d2d2d]">
              <Users className="h-4 w-4 mr-2" />
              {t('advantages.cta.joinCommunity')}
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Advantages;
