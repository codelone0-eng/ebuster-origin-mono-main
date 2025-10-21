import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { 
  Code2, 
  Terminal, 
  Boxes
} from 'lucide-react';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="py-16 px-4 border-t border-border bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 gradient-text">{t('index.hero.title')}</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {t('index.footer.description')}
            </p>
            <div className="flex gap-4">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-3 hover:bg-accent/20 transition-colors cursor-pointer">
                <Code2 className="h-5 w-5 text-foreground" />
              </div>
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-3 hover:bg-accent/20 transition-colors cursor-pointer">
                <Terminal className="h-5 w-5 text-foreground" />
              </div>
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-3 hover:bg-accent/20 transition-colors cursor-pointer">
                <Boxes className="h-5 w-5 text-foreground" />
              </div>
            </div>
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
              <li><a href="https://ebuster.ru/api-docs" className="text-muted-foreground hover:text-foreground transition-colors">{t('index.footer.tutorials')}</a></li>
              <li><a href="https://ebuster.ru/advantages" className="text-muted-foreground hover:text-foreground transition-colors">{t('index.footer.templates')}</a></li>
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

        <div className="pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {t('index.footer.copyright')}
          </div>
        </div>
      </div>
    </footer>
  );
};
