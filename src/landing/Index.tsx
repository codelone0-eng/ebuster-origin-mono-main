import { Header } from "@/components/Header";
import { FAQ } from "@/components/FAQ";
import { ParticleBackground } from "@/components/ParticleBackground";
import { AuthStatusChecker } from "@/components/AuthStatusChecker";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import Section from "@/components/Section";
import { useLanguage } from "@/hooks/useLanguage";
import { CodeTypewriter } from "@/components/CodeTypewriter";
import ShimmerTitle from "@/components/ShimmerTitle";
import { ExtensionWorkflow } from "@/components/ExtensionWorkflow";
// import SpotlightCard from "@/components/SpotlightCard";
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
    <div className="min-h-screen bg-[#111111] overflow-x-hidden relative">
      <SEO
        title="EBUSTER — расширение нового поколения для Chrome"
        description="EBUSTER — №1 userscript менеджер с автоматизацией браузера, библиотекой скриптов и API. Бесплатная альтернатива Tampermonkey."
        url="https://ebuster.ru/"
      />
      <ParticleBackground />
      <div className="relative z-content">
        <AuthStatusChecker />
        <Header />

      <ScrollReveal snapStrength={0.8} snapDuration={0.8}>
        {/* Hero Section */}
        <Section className="bg-gradient-to-b from-[#111111] via-[#1a1a1a] to-[#111111]">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#2d2d2d] mb-8 animate-fade-in">
              <Code2 className="h-4 w-4 text-[#808080]" />
              <span className="text-sm text-[#808080]">{t('index.hero.badge')}</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight leading-none text-white">
              <ShimmerTitle text={t('index.hero.title')} className="text-white" intensity={0.55} />
              <br />
              <span className="text-[#808080] text-4xl md:text-6xl font-light">
                {t('index.hero.subtitle')}
              </span>
            </h1>

            <CodeTypewriter />

                <div className="flex items-center justify-center gap-6 flex-wrap mb-20">
                  <Button 
                    size="lg" 
                    className="shine-effect group h-14 px-8 text-lg bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                    onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
                  >
                    <Download className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    {t('index.hero.getStarted')}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-lg bg-[#1a1a1a] border-[#2d2d2d] text-white hover:bg-[#2d2d2d]"
                    onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                  >
                    <Terminal className="mr-2 h-5 w-5" />
                    {t('index.hero.documentation')}
                  </Button>
                </div>

            {/* Floating Cards — скрыто, чтобы не раскрывать детали системы */}
          </div>
        </Section>

        {/* Features Section */}
        <Section id="features" className="bg-[#1a1a1a]">
          <div>
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-bold mb-4 text-white">
                {t('index.features.title')}
                <span className="text-blue-500"> {t('index.features.subtitle')}</span>
              </h2>
              <p className="text-xl text-[#808080] max-w-2xl mx-auto">
                {t('index.features.description')}
              </p>
            </div>

            {/* Main Feature Showcase */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Large Feature Card (без метрик) */}
              <div className="lg:row-span-2 bg-[#1f1f1f] border border-[#2d2d2d] hover:border-blue-500/50 rounded-3xl p-12 relative overflow-hidden group transition-all duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-600/10 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                <Layers className="h-16 w-16 mb-6 relative z-content text-blue-500" />
                <h3 className="text-4xl font-bold mb-4 relative z-content text-white">{t('index.features.modularArchitecture.title')}</h3>
                <p className="text-lg text-[#808080] mb-8 relative z-content leading-relaxed">
                  {t('index.features.modularArchitecture.description')}
                </p>
                {/* Убраны количественные метрики */}
              </div>

              {/* Smaller Feature Cards */}
              <div className="bg-[#1f1f1f] border border-[#2d2d2d] hover:border-blue-500/50 rounded-3xl p-8 group transition-all duration-300">
                <Zap className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform text-yellow-500" />
                <h3 className="text-2xl font-bold mb-3 text-white">{t('index.features.blazingFast.title')}</h3>
                <p className="text-[#808080] leading-relaxed">
                  {t('index.features.blazingFast.description')}
                </p>
              </div>

              <div className="bg-[#1f1f1f] border border-[#2d2d2d] hover:border-blue-500/50 rounded-3xl p-8 group transition-all duration-300">
                <Shield className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform text-green-500" />
                <h3 className="text-2xl font-bold mb-3 text-white">{t('index.features.fortKnoxSecurity.title')}</h3>
                <p className="text-[#808080] leading-relaxed">
                  {t('index.features.fortKnoxSecurity.description')}
                </p>
              </div>
            </div>

            {/* Features Grid — без раскрытия числовых характеристик */}
            <div className="grid md:grid-cols-3 gap-6">
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
                  className="bg-[#1f1f1f] border border-[#2d2d2d] hover:border-blue-500/50 rounded-2xl p-8 text-center group transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/10 mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-[#808080] text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Extension Features Section */}
        <Section className="bg-gradient-to-b from-[#111111] via-[#1a1a1a] to-[#111111]">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 text-white">
              {t('index.extensionFeatures.title')}
              <span className="text-blue-500"> {t('index.extensionFeatures.subtitle')}</span>
            </h2>
            <p className="text-xl text-[#808080] max-w-2xl mx-auto">
              {t('index.extensionFeatures.description')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="bg-[#1f1f1f] border border-[#2d2d2d] hover:border-blue-500/50 rounded-2xl p-6 transition-all group">
              <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code2 className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{t('index.extensionFeatures.scriptManager.title')}</h3>
              <p className="text-[#808080]">{t('index.extensionFeatures.scriptManager.description')}</p>
            </div>

            <div className="bg-[#1f1f1f] border border-[#2d2d2d] hover:border-blue-500/50 rounded-2xl p-6 transition-all group">
              <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Cloud className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{t('index.extensionFeatures.cloudSync.title')}</h3>
              <p className="text-[#808080]">{t('index.extensionFeatures.cloudSync.description')}</p>
            </div>

            <div className="bg-[#1f1f1f] border border-[#2d2d2d] hover:border-blue-500/50 rounded-2xl p-6 transition-all group">
              <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{t('index.extensionFeatures.guestMode.title')}</h3>
              <p className="text-[#808080]">{t('index.extensionFeatures.guestMode.description')}</p>
            </div>

            <div className="bg-[#1f1f1f] border border-[#2d2d2d] hover:border-blue-500/50 rounded-2xl p-6 transition-all group">
              <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <RefreshCw className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{t('index.extensionFeatures.autoUpdates.title')}</h3>
              <p className="text-[#808080]">{t('index.extensionFeatures.autoUpdates.description')}</p>
            </div>

            <div className="bg-[#1f1f1f] border border-[#2d2d2d] hover:border-blue-500/50 rounded-2xl p-6 transition-all group">
              <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{t('index.extensionFeatures.security.title')}</h3>
              <p className="text-[#808080]">{t('index.extensionFeatures.security.description')}</p>
            </div>

            <div className="bg-[#1f1f1f] border border-[#2d2d2d] hover:border-blue-500/50 rounded-2xl p-6 transition-all group">
              <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{t('index.extensionFeatures.profile.title')}</h3>
              <p className="text-[#808080]">{t('index.extensionFeatures.profile.description')}</p>
            </div>
          </div>

          {/* Workflow */}
          <div className="mb-12">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-3 text-white">Как начать работу</h3>
              <p className="text-[#808080]">Простой путь от установки до автоматизации</p>
            </div>
            <ExtensionWorkflow />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2 text-lg px-8 bg-blue-600 text-white hover:bg-blue-700">
              <Download className="h-5 w-5" />
              {t('index.extensionFeatures.downloadExtension')}
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-lg px-8 bg-[#1a1a1a] border-[#2d2d2d] text-white hover:bg-[#2d2d2d]">
              <Code2 className="h-5 w-5" />
              Документация
            </Button>
          </div>
        </Section>

        {/* FAQ Section */}
        <Section className="bg-gradient-to-b from-[#1a1a1a] via-[#111111] to-[#1a1a1a]">
          <FAQ />
        </Section>

      </ScrollReveal>

      {/* Footer - Outside of MagneticScroll */}
          <footer className="py-16 px-4 border-t border-[#2d2d2d] bg-[#111111]">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 text-white">{t('index.hero.title')}</h3>
              <p className="text-[#808080] leading-relaxed">
                {t('index.footer.description')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg text-white">{t('index.footer.product')}</h4>
              <ul className="space-y-3">
                <li><a href="https://ebuster.ru/advantages" className="text-[#808080] hover:text-white transition-colors">{t('index.footer.features')}</a></li>
                <li><a href="https://ebuster.ru/price" className="text-[#808080] hover:text-white transition-colors">{t('index.footer.pricing')}</a></li>
                <li><a href="https://ebuster.ru/contacts" className="text-[#808080] hover:text-white transition-colors">{t('index.footer.components')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg text-white">{t('index.footer.resources')}</h4>
              <ul className="space-y-3">
                <li><a href="https://ebuster.ru/price" className="text-[#808080] hover:text-white transition-colors">{t('index.footer.documentation')}</a></li>
                <li><a href="https://ebuster.ru/contacts" className="text-[#808080] hover:text-white transition-colors">{t('index.footer.support')}</a></li>
                <li><a href="#faq" className="text-[#808080] hover:text-white transition-colors">{t('index.footer.faq')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg text-white">{t('index.footer.company')}</h4>
              <ul className="space-y-3">
                <li><a href="https://ebuster.ru/contacts" className="text-[#808080] hover:text-white transition-colors">{t('index.footer.about')}</a></li>
                <li><a href="https://ebuster.ru/contacts" className="text-[#808080] hover:text-white transition-colors">{t('index.footer.privacy')}</a></li>
                <li><a href="https://ebuster.ru/contacts" className="text-[#808080] hover:text-white transition-colors">{t('index.footer.terms')}</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[#2d2d2d] text-center">
            <div className="text-sm text-[#808080]">
              {t('index.footer.copyright')}
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default Index;