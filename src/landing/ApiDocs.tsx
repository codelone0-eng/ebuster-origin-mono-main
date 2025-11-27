import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/hooks/useLanguage';
import { 
  Code2, 
  Copy, 
  Check, 
  Zap, 
  Shield, 
  Database,
  Settings,
  Key,
  Globe
} from 'lucide-react';
import { SilkBackground } from '@/components/SilkBackground';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ApiDocs = () => {
  const { t } = useLanguage();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;

    const elements = heroRef.current.querySelectorAll('.hero-element');
    gsap.from(elements, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out"
    });

    return () => {
      gsap.killTweensOf(elements);
    };
  }, []);

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll('.api-card');
    cards.forEach((card) => {
      gsap.fromTo(card,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none none",
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const apiEndpoints = t('api-docs.endpoints');
  const features = t('api-docs.features.items');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return Zap;
      case 'Shield': return Shield;
      case 'Database': return Database;
      case 'Code': return Code2;
      default: return Code2;
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden text-white">
      <div className="relative">
        <Header />

        <SilkBackground />

        <div className="relative z-10">
        <section className="relative px-4 py-32 z-10">
          <div className="container mx-auto max-w-7xl px-4 py-16">
        {/* Hero Section */}
        <div ref={heroRef} className="text-center mb-16">
          <div className="hero-element inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <Code2 className="h-4 w-4 text-white" />
            <span className="text-xs text-white/60 uppercase tracking-wider" style={{ fontSize: '11px', letterSpacing: '0.08em' }}>
              {t('api-docs.hero.badge')}
            </span>
          </div>
          
          <h1 className="hero-element text-4xl md:text-6xl font-bold mb-6 text-white" style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: '1.1'
          }}>
            {t('api-docs.hero.title')}
          </h1>
          
          <p className="hero-element text-lg text-white/60 max-w-3xl mx-auto mb-8 leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.6' }}>
            {t('api-docs.hero.description')}
          </p>

          <div className="hero-element flex items-center justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              className="h-12 px-8 bg-white text-white hover:bg-white/90 transition-colors"
            >
              <Key className="h-4 w-4 mr-2" />
              {t('api-docs.cta.getApiKey')}
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            {t('api-docs.features.title')}
          </h2>
          
          <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.isArray(features) && features.map((feature: any, index: number) => {
              const IconComponent = getIcon(feature.icon);
              
              return (
                <Card 
                  key={index} 
                  className="api-card bg-[#1a1a1a] border-[#2d2d2d] p-6 transition-colors duration-200 text-center"
                >
                  <CardContent className="p-0">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-white/5 border border-white/10 mb-6">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* API Endpoints */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            {t('api-docs.sections.endpoints.title')}
          </h2>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-[#1a1a1a] border-[#2d2d2d]">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-white text-white/60">
              {t('api-docs.sections.overview')}
              </TabsTrigger>
              <TabsTrigger value="authentication" className="data-[state=active]:bg-white data-[state=active]:text-white text-white/60">
              {t('api-docs.sections.authentication.title')}
              </TabsTrigger>
              <TabsTrigger value="endpoints" className="data-[state=active]:bg-white data-[state=active]:text-white text-white/60">
              {t('api-docs.sections.endpoints.title')}
              </TabsTrigger>
              <TabsTrigger value="examples" className="data-[state=active]:bg-white data-[state=active]:text-white text-white/60">
                {t('api-docs.sections.examples.title')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="h-5 w-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">{t('api-docs.sections.baseUrl')}</h3>
                  </div>
                  <code className="text-lg font-mono bg-[#111111] border border-[#2d2d2d] px-4 py-2 rounded-lg text-white block">
                    https://api.ebuster.ru/v1
                  </code>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">{t('api-docs.sections.dataFormat')}</h3>
                  </div>
                  <p className="text-white/60 mb-4" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                    {t('api-docs.sections.dataFormatDescription')}
                  </p>
                  <div className="flex gap-2">
                    <Badge className="bg-white/5 border border-white/10 text-white/60 border-[#404040]">JSON</Badge>
                    <Badge className="bg-white/5 border border-white/10 text-white/60 border-[#404040]">UTF-8</Badge>
                    <Badge className="bg-white/5 border border-white/10 text-white/60 border-[#404040]">RESTful</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="authentication" className="space-y-6">
              <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Key className="h-5 w-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">{t('api-docs.sections.authentication.title')}</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-white/60" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      {t('api-docs.sections.authentication.description')}
                    </p>
                    <div className="bg-[#111111] border border-[#2d2d2d] rounded-lg p-4 font-mono text-sm text-white">
                      <div>Authorization: Bearer YOUR_API_KEY</div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-[#1a1a1a] border-[#2d2d2d] text-white hover:bg-white/5 border border-white/10 transition-colors"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      {t('api-docs.cta.getApiKey')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-6">
              {Array.isArray(apiEndpoints) && apiEndpoints.map((endpoint: any, index: number) => (
                <Card key={index} className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge 
                          className={endpoint.method === 'GET' ? 'bg-green-600 text-white' : 
                                  endpoint.method === 'POST' ? 'bg-white text-white' :
                                  endpoint.method === 'PUT' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'}
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="text-lg font-mono text-white">{endpoint.path}</code>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-[#1a1a1a] border-[#2d2d2d] text-white hover:bg-white/5 border border-white/10 transition-colors"
                        onClick={() => copyToClipboard(endpoint.example, `endpoint-${index}`)}
                      >
                        {copiedCode === `endpoint-${index}` ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-white/60 text-sm mb-4" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      {endpoint.description}
                    </p>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-white text-sm">{t('api-docs.sections.requestExample')}:</h4>
                        <div className="bg-[#111111] border border-[#2d2d2d] rounded-lg p-4 font-mono text-xs overflow-x-auto text-white">
                          <pre>{endpoint.example}</pre>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-white text-sm">{t('api-docs.sections.response')}:</h4>
                        <div className="bg-[#111111] border border-[#2d2d2d] rounded-lg p-4 font-mono text-xs text-white overflow-x-auto">
                          <pre>{JSON.stringify(endpoint.response, null, 2)}</pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="examples" className="space-y-6">
              <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Code2 className="h-5 w-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">JavaScript SDK</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-[#111111] border border-[#2d2d2d] rounded-lg p-4 font-mono text-sm text-white overflow-x-auto">
                      <pre>{`// Установка
npm install @ebuster/api-sdk

// Использование
import { EbusterAPI } from '@ebuster/api-sdk';

const api = new EbusterAPI('YOUR_API_KEY');

// Получить все расширения
const extensions = await api.extensions.list();

// Создать новое расширение
const newExtension = await api.extensions.create({
  name: 'My Extension',
  description: 'Custom extension',
  permissions: ['tabs', 'storage']
});`}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
        </section>
        </div>
      
      <Footer />
      </div>
    </div>
  );
};

export default ApiDocs;
