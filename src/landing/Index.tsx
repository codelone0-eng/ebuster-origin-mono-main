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
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <ParticleBackground />
      <div className="relative z-content">
        <AuthStatusChecker />
        <Header />

      <ScrollReveal snapStrength={0.8} snapDuration={0.8}>
        {/* Hero Section */}
        <Section className="bg-gradient-to-b from-background via-muted/5 to-background">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border content-border-50 mb-8 animate-fade-in">
              <Code2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t('index.hero.badge')}</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight leading-none text-foreground">
              <ShimmerTitle text={t('index.hero.title')} className="gradient-text" intensity={0.55} />
              <br />
              <span className="text-muted-foreground text-4xl md:text-6xl font-light">
                {t('index.hero.subtitle')}
              </span>
            </h1>

            <CodeTypewriter />

                <div className="flex items-center justify-center gap-6 flex-wrap mb-20">
                  <Button 
                    size="lg" 
                    className="shine-effect group h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
                  >
                    <Download className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    {t('index.hero.getStarted')}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-card/50 backdrop-blur-sm border content-border-50 hover:bg-accent/50" asChild>
                    <Link to="/documentation">
                      <Terminal className="mr-2 h-5 w-5" />
                      {t('index.hero.documentation')}
                    </Link>
                  </Button>
                </div>

            {/* Floating Cards — скрыто, чтобы не раскрывать детали системы */}
          </div>
        </Section>

        {/* Features Section */}
        <Section className="bg-background">
          <div>
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-bold mb-4 text-foreground">
                {t('index.features.title')}
                <span className="gradient-text"> {t('index.features.subtitle')}</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('index.features.description')}
              </p>
            </div>

            {/* Main Feature Showcase */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Large Feature Card (без метрик) */}
              <div className="lg:row-span-2 bg-card/50 backdrop-blur-sm border content-border-50 hover:bg-card/70 hover:content-border-70 rounded-3xl p-12 relative overflow-hidden group transition-all duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-foreground/5 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                <Layers className="h-16 w-16 mb-6 relative z-content text-foreground" />
                <h3 className="text-4xl font-bold mb-4 relative z-content text-foreground">{t('index.features.modularArchitecture.title')}</h3>
                <p className="text-lg text-muted-foreground mb-8 relative z-content leading-relaxed">
                  {t('index.features.modularArchitecture.description')}
                </p>
                {/* Убраны количественные метрики */}
              </div>

              {/* Smaller Feature Cards */}
              <div className="bg-card/50 backdrop-blur-sm border content-border-50 hover:bg-card/70 hover:content-border-70 rounded-3xl p-8 group transition-all duration-300">
                <Zap className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform text-foreground" />
                <h3 className="text-2xl font-bold mb-3 text-foreground">{t('index.features.blazingFast.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('index.features.blazingFast.description')}
                </p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border content-border-50 hover:bg-card/70 hover:content-border-70 rounded-3xl p-8 group transition-all duration-300">
                <Shield className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform text-foreground" />
                <h3 className="text-2xl font-bold mb-3 text-foreground">{t('index.features.fortKnoxSecurity.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">
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
                  className="bg-card/50 backdrop-blur-sm border content-border-50 hover:bg-card/70 hover:content-border-70 rounded-2xl p-8 text-center group transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/50 mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-8 w-8 text-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Extension Features Section */}
        <Section className="bg-gradient-to-b from-background via-muted/5 to-background">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 text-foreground">
              {t('index.extensionFeatures.title')}
              <span className="gradient-text"> {t('index.extensionFeatures.subtitle')}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('index.extensionFeatures.description')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:bg-card/70 transition-all group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">{t('index.extensionFeatures.scriptManager.title')}</h3>
              <p className="text-muted-foreground">{t('index.extensionFeatures.scriptManager.description')}</p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:bg-card/70 transition-all group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Cloud className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">{t('index.extensionFeatures.cloudSync.title')}</h3>
              <p className="text-muted-foreground">{t('index.extensionFeatures.cloudSync.description')}</p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:bg-card/70 transition-all group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">{t('index.extensionFeatures.guestMode.title')}</h3>
              <p className="text-muted-foreground">{t('index.extensionFeatures.guestMode.description')}</p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:bg-card/70 transition-all group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <RefreshCw className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">{t('index.extensionFeatures.autoUpdates.title')}</h3>
              <p className="text-muted-foreground">{t('index.extensionFeatures.autoUpdates.description')}</p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:bg-card/70 transition-all group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">{t('index.extensionFeatures.security.title')}</h3>
              <p className="text-muted-foreground">{t('index.extensionFeatures.security.description')}</p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:bg-card/70 transition-all group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">{t('index.extensionFeatures.profile.title')}</h3>
              <p className="text-muted-foreground">{t('index.extensionFeatures.profile.description')}</p>
            </div>
          </div>

          {/* Workflow */}
          <div className="mb-12">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-3 text-foreground">Как начать работу</h3>
              <p className="text-muted-foreground">Простой путь от установки до автоматизации</p>
            </div>
            <ExtensionWorkflow />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2 text-lg px-8">
              <Download className="h-5 w-5" />
              {t('index.extensionFeatures.downloadExtension')}
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
              <Code2 className="h-5 w-5" />
              Документация
            </Button>
          </div>
        </Section>

        {/* FAQ Section */}
        <Section className="bg-gradient-to-b from-background via-muted/5 to-background">
          <FAQ />
        </Section>

      </ScrollReveal>

      {/* Footer - Outside of MagneticScroll */}
          <footer className="py-16 px-4 border-t content-border bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 gradient-text">{t('index.hero.title')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('index.footer.description')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg text-foreground">{t('index.footer.product')}</h4>
              <ul className="space-y-3">
                <li><a href="https://ebuster.ru/advantages" className="text-muted-foreground hover:text-foreground transition-colors">{t('index.footer.features')}</a></li>
                <li><a href="https://ebuster.ru/price" className="text-muted-foreground hover:text-foreground transition-colors">{t('index.footer.pricing')}</a></li>
                <li><a href="https://ebuster.ru/documentation" className="text-muted-foreground hover:text-foreground transition-colors">{t('index.footer.components')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg text-foreground">{t('index.footer.resources')}</h4>
              <ul className="space-y-3">
                <li><a href="https://ebuster.ru/documentation" className="text-muted-foreground hover:text-foreground transition-colors">{t('index.footer.documentation')}</a></li>
                <li><a href="https://ebuster.ru/contacts" className="text-muted-foreground hover:text-foreground transition-colors">{t('index.footer.support')}</a></li>
                <li><a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">{t('index.footer.faq')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg text-foreground">{t('index.footer.company')}</h4>
              <ul className="space-y-3">
                <li><a href="https://ebuster.ru/contacts" className="text-muted-foreground hover:text-foreground transition-colors">{t('index.footer.about')}</a></li>
                <li><a href="https://ebuster.ru/contacts" className="text-muted-foreground hover:text-foreground transition-colors">{t('index.footer.privacy')}</a></li>
                <li><a href="https://ebuster.ru/contacts" className="text-muted-foreground hover:text-foreground transition-colors">{t('index.footer.terms')}</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t content-border text-center">
            <div className="text-sm text-muted-foreground">
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