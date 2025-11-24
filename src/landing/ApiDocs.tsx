import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/hooks/useLanguage';
import { 
  Code2, 
  Play, 
  Copy, 
  Check, 
  Zap, 
  Shield, 
  Layers, 
  Terminal,
  ArrowRight,
  Globe,
  Database,
  Settings,
  Key,
  Clock,
  Users
} from 'lucide-react';

const ApiDocs = () => {
  const { t } = useLanguage();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const apiEndpoints = t('api-docs.endpoints');
  const features = t('api-docs.features.items');

  return (
    <div className="min-h-screen bg-[#111111]">
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#1a1a1a] border border-[#2d2d2d] mb-8">
            <Code2 className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-semibold text-[#808080]">{t('api-docs.hero.badge')}</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            {t('api-docs.hero.title')} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('api-docs.hero.subtitle')}</span>
          </h1>
          
          <p className="text-xl text-[#808080] max-w-3xl mx-auto mb-8 leading-relaxed">
            {t('api-docs.hero.description')}
          </p>

          <div className="flex items-center justify-center gap-4 mb-12">
            <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const getIcon = (iconName: string) => {
                switch (iconName) {
                  case 'Zap': return Zap;
                  case 'Shield': return Shield;
                  case 'Database': return Database;
                  case 'Code': return Code2;
                  default: return Code2;
                }
              };
              const IconComponent = getIcon(feature.icon);
              
              return (
                <div key={index} className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 group text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-600/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-blue-500 transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-[#808080] text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
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
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-[#1a1a1a] border border-[#2d2d2d]">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-[#808080]">{t('api-docs.sections.overview')}</TabsTrigger>
              <TabsTrigger value="authentication" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-[#808080]">{t('api-docs.sections.authentication.title')}</TabsTrigger>
              <TabsTrigger value="endpoints" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-[#808080]">{t('api-docs.sections.endpoints.title')}</TabsTrigger>
              <TabsTrigger value="examples" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-[#808080]">{t('api-docs.sections.examples.title')}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-white">{t('api-docs.sections.baseUrl')}</h3>
                </div>
                <code className="text-lg font-mono bg-[#111111] border border-[#2d2d2d] px-4 py-2 rounded-lg text-white block">
                  https://api.ebuster.ru/v1
                </code>
              </div>

              <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-white">{t('api-docs.sections.dataFormat')}</h3>
                </div>
                <p className="text-[#808080] mb-4">
                  {t('api-docs.sections.dataFormatDescription')}
                </p>
                <div className="flex gap-2">
                  <Badge className="bg-[#2d2d2d] text-[#a3a3a3] border-[#404040]">JSON</Badge>
                  <Badge className="bg-[#2d2d2d] text-[#a3a3a3] border-[#404040]">UTF-8</Badge>
                  <Badge className="bg-[#2d2d2d] text-[#a3a3a3] border-[#404040]">RESTful</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="authentication" className="space-y-6">
              <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Key className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-white">{t('api-docs.sections.authentication.title')}</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-[#808080]">
                    {t('api-docs.sections.authentication.description')}
                  </p>
                  <div className="bg-[#111111] border border-[#2d2d2d] rounded-lg p-4 font-mono text-sm text-[#d4d4d4]">
                    <div>Authorization: Bearer YOUR_API_KEY</div>
                  </div>
                  <Button variant="outline" size="sm" className="bg-[#1f1f1f] border-[#2d2d2d] text-white hover:bg-[#2d2d2d]">
                    <Key className="h-4 w-4 mr-2" />
                    {t('api-docs.cta.getApiKey')}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-6">
              {apiEndpoints.map((endpoint, index) => (
                <div key={index} className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge 
                        className={endpoint.method === 'GET' ? 'bg-green-600 text-white' : 
                                endpoint.method === 'POST' ? 'bg-blue-600 text-white' :
                                endpoint.method === 'PUT' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'}
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-lg font-mono text-white">{endpoint.path}</code>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-[#1f1f1f] border-[#2d2d2d] text-white hover:bg-[#2d2d2d]"
                      onClick={() => copyToClipboard(endpoint.example, `endpoint-${index}`)}
                    >
                      {copiedCode === `endpoint-${index}` ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-[#808080] text-base mb-4">
                    {endpoint.description}
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-white">{t('api-docs.sections.requestExample')}:</h4>
                      <div className="bg-[#111111] border border-[#2d2d2d] rounded-lg p-4 font-mono text-sm overflow-x-auto text-[#d4d4d4]">
                        <pre>{endpoint.example}</pre>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-white">{t('api-docs.sections.response')}:</h4>
                      <div className="bg-[#111111] border border-[#2d2d2d] rounded-lg p-4 font-mono text-sm text-[#d4d4d4]">
                        <pre>{JSON.stringify(endpoint.response, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="examples" className="space-y-6">
              <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Code2 className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-white">JavaScript SDK</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-[#111111] border border-[#2d2d2d] rounded-lg p-4 font-mono text-sm text-[#d4d4d4]">
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
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ApiDocs;
