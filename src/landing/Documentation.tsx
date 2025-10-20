import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/hooks/useLanguage';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Zap, 
  Shield, 
  Layers, 
  Terminal,
  Settings,
  Key,
  Download,
  ExternalLink,
  Puzzle,
  CheckCircle,
  Globe,
  ArrowRight
} from 'lucide-react';

const Documentation = () => {
  const { t } = useLanguage();

  const quickStartSteps = t('documentation.quickStart.steps');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card/50 backdrop-blur-sm border content-border-50 mb-8">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-muted-foreground">{t('documentation.hero.badge')}</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            {t('documentation.hero.title')} <span className="gradient-text">{t('documentation.hero.subtitle')}</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            {t('documentation.hero.description')}
          </p>

          <div className="flex items-center justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('documentation.cta.downloadExtension')}
            </Button>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            {t('documentation.quickStart.title')}
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {quickStartSteps.map((step, index) => {
              const getIcon = (iconName: string) => {
                switch (iconName) {
                  case 'Download': return Download;
                  case 'Puzzle': return Puzzle;
                  case 'Key': return Key;
                  case 'CheckCircle': return CheckCircle;
                  default: return Download;
                }
              };
              const IconComponent = getIcon(step.icon);
              
              return (
                <Card key={index} className="bg-card/30 backdrop-blur-sm border content-border-30 hover:bg-card/50 transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{t('documentation.quickStart.stepLabel')} {step.step}</Badge>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors duration-200">
                          {step.title}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-base mb-4">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {step.instructions.map((instruction, instructionIndex) => (
                      <div key={instructionIndex} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <span className="text-xs font-semibold text-primary">
                            {instructionIndex + 1}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {instruction}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </div>

        {/* Download CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary/5 via-transparent to-accent/5 border content-border-30 p-12">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">{t('documentation.cta.title')}</CardTitle>
              <CardDescription className="text-lg">
                {t('documentation.cta.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('documentation.cta.downloadExtension')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                  <Link to="/api-docs">
                    <Terminal className="h-4 w-4 mr-2" />
                    API Docs
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
      
      <Footer />
    </div>
  );
};

export default Documentation;
