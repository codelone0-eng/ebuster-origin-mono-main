import { Header } from "@/components/Header";
import { FAQ } from "@/components/FAQ";
import { AuthStatusChecker } from "@/components/AuthStatusChecker";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { ExtensionWorkflow } from "@/components/ExtensionWorkflow";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { 
  Zap, Shield, Layers, ArrowRight, Code2, Sparkles, 
  Terminal, Boxes, Puzzle, Orbit, Binary, Cpu, Download, Cloud, User, RefreshCw
} from "lucide-react";

const Index = () => {
  const { t } = useLanguage();
  
  // Телепорт в верх страницы при загрузке/рефреше лендинга
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen bg-[#111111] overflow-x-hidden">
      <SEO
        title="EBUSTER — расширение нового поколения для Chrome"
        description="EBUSTER — №1 userscript менеджер с автоматизацией браузера, библиотекой скриптов и API. Бесплатная альтернатива Tampermonkey."
        url="https://ebuster.ru/"
      />
      <AuthStatusChecker />
      <Header />

      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#111111] border border-[#2d2d2d] mb-6">
              <Code2 className="h-4 w-4 text-neutral-500" />
              <span className="text-xs text-neutral-500 uppercase" style={{ fontSize: '11px', letterSpacing: '0.08em' }}>
                {t('index.hero.badge')}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-semibold mb-6 text-white" style={{ fontSize: '48px', fontWeight: 600, lineHeight: '1.2' }}>
              {t('index.hero.title')}
            </h1>
            <p className="text-xl text-neutral-500 mb-12" style={{ fontSize: '18px', lineHeight: '1.6' }}>
              {t('index.hero.subtitle')}
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button 
                size="lg" 
                className="h-11 px-6 bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                {t('index.hero.getStarted')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-6 bg-[#1f1f1f] border-[#2d2d2d] text-white hover:bg-[#2d2d2d]"
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              >
                <Terminal className="mr-2 h-4 w-4" />
                {t('index.hero.documentation')}
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-6">
          <div>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-5 w-5 text-neutral-500" />
                <h2 className="text-lg font-semibold text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
                  {t('index.features.title')}
                </h2>
              </div>
              <p className="text-xs text-neutral-500" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                {t('index.features.description')}
              </p>
            </div>

            {/* Main Feature Showcase */}
            <div className="grid lg:grid-cols-2 gap-4 mb-6">
              {/* Large Feature Card */}
              <div className="lg:row-span-2 bg-[#1f1f1f] border border-[#2d2d2d] rounded p-6">
                <Layers className="h-8 w-8 mb-4 text-blue-500" />
                <h3 className="text-xl font-semibold mb-3 text-white">{t('index.features.modularArchitecture.title')}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {t('index.features.modularArchitecture.description')}
                </p>
              </div>

              {/* Smaller Feature Cards */}
              <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded p-6">
                <Zap className="h-6 w-6 mb-3 text-blue-500" />
                <h3 className="text-base font-semibold mb-2 text-white">{t('index.features.blazingFast.title')}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {t('index.features.blazingFast.description')}
                </p>
              </div>

              <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded p-6">
                <Shield className="h-6 w-6 mb-3 text-blue-500" />
                <h3 className="text-base font-semibold mb-2 text-white">{t('index.features.fortKnoxSecurity.title')}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {t('index.features.fortKnoxSecurity.description')}
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Boxes, title: t('index.featuresGrid.structuredLibrary.title'), desc: t('index.featuresGrid.structuredLibrary.description') },
                { icon: Puzzle, title: t('index.featuresGrid.extensibility.title'), desc: t('index.featuresGrid.extensibility.description') },
                { icon: Orbit, title: t('index.featuresGrid.smoothUpdates.title'), desc: t('index.featuresGrid.smoothUpdates.description') },
                { icon: Binary, title: t('index.featuresGrid.strongTyping.title'), desc: t('index.featuresGrid.strongTyping.description') },
                { icon: Cpu, title: t('index.featuresGrid.rationalEfficiency.title'), desc: t('index.featuresGrid.rationalEfficiency.description') },
                { icon: Terminal, title: t('index.featuresGrid.proTools.title'), desc: t('index.featuresGrid.proTools.description') },
              ].map((feature, i) => (
                <div 
                  key={i}
                  className="bg-[#1f1f1f] border border-[#2d2d2d] rounded p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <feature.icon className="h-5 w-5 text-blue-500" />
                    <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Extension Features Section */}
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-6">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="h-5 w-5 text-neutral-500" />
              <h2 className="text-lg font-semibold text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
                {t('index.extensionFeatures.title')}
              </h2>
            </div>
            <p className="text-xs text-neutral-500" style={{ fontSize: '12px', lineHeight: '1.5' }}>
              {t('index.extensionFeatures.description')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded p-4">
              <div className="flex items-center gap-3 mb-2">
                <Code2 className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-semibold text-white">{t('index.extensionFeatures.scriptManager.title')}</h3>
              </div>
              <p className="text-xs text-neutral-500">{t('index.extensionFeatures.scriptManager.description')}</p>
            </div>

            <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded p-4">
              <div className="flex items-center gap-3 mb-2">
                <Cloud className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-semibold text-white">{t('index.extensionFeatures.cloudSync.title')}</h3>
              </div>
              <p className="text-xs text-neutral-500">{t('index.extensionFeatures.cloudSync.description')}</p>
            </div>

            <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded p-4">
              <div className="flex items-center gap-3 mb-2">
                <User className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-semibold text-white">{t('index.extensionFeatures.guestMode.title')}</h3>
              </div>
              <p className="text-xs text-neutral-500">{t('index.extensionFeatures.guestMode.description')}</p>
            </div>

            <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded p-4">
              <div className="flex items-center gap-3 mb-2">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-semibold text-white">{t('index.extensionFeatures.autoUpdates.title')}</h3>
              </div>
              <p className="text-xs text-neutral-500">{t('index.extensionFeatures.autoUpdates.description')}</p>
            </div>

            <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded p-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-semibold text-white">{t('index.extensionFeatures.security.title')}</h3>
              </div>
              <p className="text-xs text-neutral-500">{t('index.extensionFeatures.security.description')}</p>
            </div>

            <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded p-4">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-semibold text-white">{t('index.extensionFeatures.profile.title')}</h3>
              </div>
              <p className="text-xs text-neutral-500">{t('index.extensionFeatures.profile.description')}</p>
            </div>
          </div>

          {/* Workflow */}
          <div className="mb-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-1 text-white">Как начать работу</h3>
              <p className="text-xs text-neutral-500">Простой путь от установки до автоматизации</p>
            </div>
            <ExtensionWorkflow />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="sm" className="gap-2 px-6 bg-blue-600 text-white hover:bg-blue-700">
              <Download className="h-4 w-4" />
              {t('index.extensionFeatures.downloadExtension')}
            </Button>
            <Button size="sm" variant="outline" className="gap-2 px-6 bg-[#1f1f1f] border-[#2d2d2d] text-white hover:bg-[#2d2d2d]">
              <Code2 className="h-4 w-4" />
              Документация
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-6">
          <FAQ />
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[#2d2d2d] bg-[#111111]">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-5 gap-6 mb-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-3 text-white">{t('index.hero.title')}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {t('index.footer.description')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm text-white">{t('index.footer.product')}</h4>
              <ul className="space-y-2">
                <li><a href="https://ebuster.ru/advantages" className="text-xs text-neutral-500 hover:text-white transition-colors">{t('index.footer.features')}</a></li>
                <li><a href="https://ebuster.ru/price" className="text-xs text-neutral-500 hover:text-white transition-colors">{t('index.footer.pricing')}</a></li>
                <li><a href="https://ebuster.ru/contacts" className="text-xs text-neutral-500 hover:text-white transition-colors">{t('index.footer.components')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm text-white">{t('index.footer.resources')}</h4>
              <ul className="space-y-2">
                <li><a href="https://ebuster.ru/price" className="text-xs text-neutral-500 hover:text-white transition-colors">{t('index.footer.documentation')}</a></li>
                <li><a href="https://ebuster.ru/contacts" className="text-xs text-neutral-500 hover:text-white transition-colors">{t('index.footer.support')}</a></li>
                <li><a href="#faq" className="text-xs text-neutral-500 hover:text-white transition-colors">{t('index.footer.faq')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm text-white">{t('index.footer.company')}</h4>
              <ul className="space-y-2">
                <li><a href="https://ebuster.ru/contacts" className="text-xs text-neutral-500 hover:text-white transition-colors">{t('index.footer.about')}</a></li>
                <li><a href="https://ebuster.ru/contacts" className="text-xs text-neutral-500 hover:text-white transition-colors">{t('index.footer.privacy')}</a></li>
                <li><a href="https://ebuster.ru/contacts" className="text-xs text-neutral-500 hover:text-white transition-colors">{t('index.footer.terms')}</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-[#2d2d2d] text-center">
            <div className="text-xs text-neutral-500">
              {t('index.footer.copyright')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;