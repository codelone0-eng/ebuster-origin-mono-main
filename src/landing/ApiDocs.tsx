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
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card/50 backdrop-blur-sm border content-border-50 mb-8">
            <Code2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-muted-foreground">{t('api-docs.hero.badge')}</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            {t('api-docs.hero.title')} <span className="gradient-text">{t('api-docs.hero.subtitle')}</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            {t('api-docs.hero.description')}
          </p>

          <div className="flex items-center justify-center gap-4 mb-12">
            <Button size="lg" className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
              <Key className="h-4 w-4 mr-2" />
              {t('api-docs.cta.getApiKey')}
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
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
                <Card key={index} className="bg-card/30 backdrop-blur-sm border content-border-30 hover:bg-card/50 transition-all duration-300 group">
                  <CardHeader className="text-center pb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl mb-3 group-hover:text-primary transition-colors duration-200">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* API Endpoints */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            {t('api-docs.sections.endpoints.title')}
          </h2>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview">{t('api-docs.sections.overview')}</TabsTrigger>
              <TabsTrigger value="authentication">{t('api-docs.sections.authentication.title')}</TabsTrigger>
              <TabsTrigger value="endpoints">{t('api-docs.sections.endpoints.title')}</TabsTrigger>
              <TabsTrigger value="examples">{t('api-docs.sections.examples.title')}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="bg-card/30 backdrop-blur-sm border content-border-30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    {t('api-docs.sections.baseUrl')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-lg font-mono bg-muted/50 px-4 py-2 rounded-lg">
                    https://api.ebuster.ru/v1
                  </code>
                </CardContent>
              </Card>

              <Card className="bg-card/30 backdrop-blur-sm border content-border-30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    {t('api-docs.sections.dataFormat')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {t('api-docs.sections.dataFormatDescription')}
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">JSON</Badge>
                    <Badge variant="secondary">UTF-8</Badge>
                    <Badge variant="secondary">RESTful</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="authentication" className="space-y-6">
              <Card className="bg-card/30 backdrop-blur-sm border content-border-30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    {t('api-docs.sections.authentication.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {t('api-docs.sections.authentication.description')}
                  </p>
                  <div className="bg-black/90 rounded-lg p-4 font-mono text-sm">
                    <div className="text-gray-400">Authorization: Bearer YOUR_API_KEY</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Key className="h-4 w-4 mr-2" />
                    {t('api-docs.cta.getApiKey')}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-6">
              {apiEndpoints.map((endpoint, index) => (
                <Card key={index} className="bg-card/30 backdrop-blur-sm border content-border-30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={endpoint.method === 'GET' ? 'default' : 
                                  endpoint.method === 'POST' ? 'secondary' :
                                  endpoint.method === 'PUT' ? 'outline' : 'destructive'}
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="text-lg font-mono">{endpoint.path}</code>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(endpoint.example, `endpoint-${index}`)}
                      >
                        {copiedCode === `endpoint-${index}` ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <CardDescription className="text-base">
                      {endpoint.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">{t('api-docs.sections.requestExample')}:</h4>
                      <div className="bg-black/90 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                        <pre>{endpoint.example}</pre>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">{t('api-docs.sections.response')}:</h4>
                      <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                        <pre>{JSON.stringify(endpoint.response, null, 2)}</pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="examples" className="space-y-6">
              <Card className="bg-card/30 backdrop-blur-sm border content-border-30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-primary" />
                    JavaScript SDK
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-black/90 rounded-lg p-4 font-mono text-sm">
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
      
      <Footer />
    </div>
  );
};

export default ApiDocs;
