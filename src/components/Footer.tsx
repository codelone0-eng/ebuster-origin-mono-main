import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="py-16 px-4 border-t border-border bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-4 mb-10">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 gradient-text">{t('index.hero.title')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('index.footer.description')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg text-foreground">{t('index.footer.navigation')}</h4>
            <ul className="space-y-3">
              <li><a href="https://ebuster.ru/" className="text-muted-foreground hover:text-foreground transition-colors">{t('index.footer.home')}</a></li>
              <li><a href="https://ebuster.ru/contacts" className="text-muted-foreground hover:text-foreground transition-colors">{t('index.footer.contacts')}</a></li>
              <li><a href="https://ebuster.ru/roadmap" className="text-muted-foreground hover:text-foreground transition-colors">Roadmap</a></li>
              <li><a href="https://ebuster.ru/price" className="text-muted-foreground hover:text-foreground transition-colors">{t('index.footer.pricing')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg text-foreground">{t('index.footer.company')}</h4>
            <ul className="space-y-3">
              <li><a href="https://ebuster.ru/about" className="text-muted-foreground hover:text-foreground transition-colors">{t('index.footer.about')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg text-foreground">{t('index.footer.legal')}</h4>
            <ul className="space-y-3">
              <li><a href="https://ebuster.ru/privacy" className="text-muted-foreground hover:text-foreground transition-colors">{t('index.footer.privacy')}</a></li>
              <li><a href="https://ebuster.ru/terms" className="text-muted-foreground hover:text-foreground transition-colors">{t('index.footer.terms')}</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border text-center">
          <div className="text-sm text-muted-foreground">
            {t('index.footer.copyright')}
          </div>
        </div>
      </div>
    </footer>
  );
};
