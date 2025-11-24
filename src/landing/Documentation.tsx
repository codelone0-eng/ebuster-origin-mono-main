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
    <div className="min-h-screen bg-[#111111]">
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#1a1a1a] border border-[#2d2d2d] mb-8">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-semibold text-[#808080]">{t('documentation.hero.badge')}</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            {t('documentation.hero.title')} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('documentation.hero.subtitle')}</span>
          </h1>
          
          <p className="text-xl text-[#808080] max-w-3xl mx-auto mb-8 leading-relaxed">
            {t('documentation.hero.description')}
          </p>

          <div className="flex items-center justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('documentation.cta.downloadExtension')}
            </Button>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
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
                <div key={index} className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <IconComponent className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="text-xs bg-[#2d2d2d] text-[#a3a3a3] border-[#404040]">{t('documentation.quickStart.stepLabel')} {step.step}</Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-blue-500 transition-colors duration-200">
                        {step.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-[#808080] text-base mb-4">
                    {step.description}
                  </p>
                  <div className="space-y-3">
                    {step.instructions.map((instruction, instructionIndex) => (
                      <div key={instructionIndex} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/10 flex items-center justify-center mt-0.5">
                          <span className="text-xs font-semibold text-blue-500">
                            {instructionIndex + 1}
                          </span>
                        </div>
                        <p className="text-sm text-[#808080] leading-relaxed">
                          {instruction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Download CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600/10 via-transparent to-purple-600/10 border border-[#2d2d2d] rounded-2xl p-12">
            <h3 className="text-3xl font-bold mb-4 text-white">{t('documentation.cta.title')}</h3>
            <p className="text-[#808080] text-lg mb-6">
              {t('documentation.cta.description')}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                onClick={() => window.open('https://chromewebstore.google.com/detail/ebuster/npfeodlflpggafijagnhchkgkflpjhgl?hl=ru', '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                {t('documentation.cta.downloadExtension')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 bg-[#1a1a1a] border-[#2d2d2d] text-white hover:bg-[#2d2d2d]" asChild>
                <Link to="/api-docs">
                  <Terminal className="h-4 w-4 mr-2" />
                  API Docs
                </Link>
              </Button>
            </div>
          </div>
        </div>

      </div>
      
      <Footer />
    </div>
  );
};

export default Documentation;
