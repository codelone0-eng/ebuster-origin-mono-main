import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Github, Twitter, Youtube, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Footer = () => {
  const { t } = useLanguage();
  const f = (key: string) => t(`index.footer.${key}`);

  return (
    <footer className="relative z-50 py-16 px-4 border-t border-white/10 bg-[#0a0a0a]">
      {/* Noise effect */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
      
      <div className="relative container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          {/* Left Column - Branding & Subscription */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-white">{t('index.hero.title')}</h3>
              <p className="text-white/60 leading-relaxed mb-6">
                {f('description')}
              </p>
            </div>

            {/* Email Subscription */}
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={f('emailPlaceholder')}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-10"
              />
              <Button className="bg-white/10 hover:bg-white/20 text-white border-white/10 h-10 px-6">
                {f('subscribe')}
              </Button>
            </div>

            {/* Social & Status */}
            <div className="flex items-center gap-4">
              <a href="https://github.com/ebuster" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/ebuster" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://youtube.com/@ebuster" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="https://discord.gg/ebuster" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <div className="flex items-center gap-2 ml-4">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-white/60 text-sm">{f('status')}</span>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          <div>
            <h4 className="font-semibold mb-4 text-white">{f('product')}</h4>
            <ul className="space-y-3">
              <li><a href="/price" className="text-white/60 hover:text-white transition-colors text-sm">{f('pricing')}</a></li>
              <li><a href="/documentation" className="text-white/60 hover:text-white transition-colors text-sm">{f('documentation')}</a></li>
              <li><a href="/contacts" className="text-white/60 hover:text-white transition-colors text-sm">{f('contacts')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">{f('resources')}</h4>
            <ul className="space-y-3">
              <li><a href="/advantages" className="text-white/60 hover:text-white transition-colors text-sm">{f('features')}</a></li>
              <li><a href="/about" className="text-white/60 hover:text-white transition-colors text-sm">{f('about')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">{f('company')}</h4>
            <ul className="space-y-3">
              <li><a href="/documentation" className="text-white/60 hover:text-white transition-colors text-sm">{f('documentation')}</a></li>
              <li><a href="/roadmap" className="text-white/60 hover:text-white transition-colors text-sm">{f('roadmap')}</a></li>
              <li><a href="/contacts" className="text-white/60 hover:text-white transition-colors text-sm">{f('support')}</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="text-sm text-white/60">
            {f('copyright')}
          </div>
          <div className="flex gap-6 text-sm">
            <a href="/privacy" className="text-white/60 hover:text-white transition-colors">{f('legal')}</a>
            <a href="/terms" className="text-white/60 hover:text-white transition-colors">{f('terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
