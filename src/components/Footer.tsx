import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Github, Twitter, Youtube, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="relative z-50 py-16 px-4 border-t border-white/10 bg-black">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          {/* Left Column - Branding & Subscription */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-white">{t('index.hero.title')}</h3>
              <p className="text-white/60 leading-relaxed mb-6">
                Monitoring made by Laravel.
              </p>
              <p className="text-white/60 leading-relaxed">
                Full observability with zero config.
              </p>
            </div>

            {/* Email Subscription */}
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Email address"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-10"
              />
              <Button className="bg-white/10 hover:bg-white/20 text-white border-white/10 h-10 px-6">
                Stay updated
              </Button>
            </div>

            {/* Social & Status */}
            <div className="flex items-center gap-4">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <div className="flex items-center gap-2 ml-4">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-white/60 text-sm">All systems operational</span>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Nightwatch</h4>
            <ul className="space-y-3">
              <li><a href="/price" className="text-white/60 hover:text-white transition-colors text-sm">Pricing</a></li>
              <li><a href="/documentation" className="text-white/60 hover:text-white transition-colors text-sm">Documentation</a></li>
              <li><a href="/contacts" className="text-white/60 hover:text-white transition-colors text-sm">Contact sales</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Explore</h4>
            <ul className="space-y-3">
              <li><a href="/advantages" className="text-white/60 hover:text-white transition-colors text-sm">Nightwatch vs Pulse</a></li>
              <li><a href="/about" className="text-white/60 hover:text-white transition-colors text-sm">Nightwatch vs Telescope</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Discover Laravel</h4>
            <ul className="space-y-3">
              <li><a href="/documentation" className="text-white/60 hover:text-white transition-colors text-sm">Documentation</a></li>
              <li><a href="/roadmap" className="text-white/60 hover:text-white transition-colors text-sm">Release notes</a></li>
              <li><a href="/contacts" className="text-white/60 hover:text-white transition-colors text-sm">Blog</a></li>
              <li><a href="/contacts" className="text-white/60 hover:text-white transition-colors text-sm">Community</a></li>
              <li><a href="/contacts" className="text-white/60 hover:text-white transition-colors text-sm">Careers</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="text-sm text-white/60">
            © 2025 Laravel
          </div>
          <div className="flex gap-6 text-sm">
            <a href="/privacy" className="text-white/60 hover:text-white transition-colors">Legal</a>
            <a href="/terms" className="text-white/60 hover:text-white transition-colors">Trust</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
