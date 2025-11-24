import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="py-16 px-4 border-t border-[#2d2d2d] bg-[#111111]">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('index.hero.title')}</h3>
            <p className="text-[#808080] leading-relaxed">
              {t('index.footer.description')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg text-white">{t('index.footer.product')}</h4>
            <ul className="space-y-3">
              <li><a href="https://ebuster.ru/advantages" className="text-[#808080] hover:text-white transition-colors">{t('index.footer.features')}</a></li>
              <li><a href="https://ebuster.ru/price" className="text-[#808080] hover:text-white transition-colors">{t('index.footer.pricing')}</a></li>
              <li><a href="https://ebuster.ru/contacts" className="text-[#808080] hover:text-white transition-colors">{t('index.footer.components')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg text-white">{t('index.footer.resources')}</h4>
            <ul className="space-y-3">
              <li><a href="https://ebuster.ru/price" className="text-[#808080] hover:text-white transition-colors">{t('index.footer.documentation')}</a></li>
              <li><a href="https://ebuster.ru/contacts" className="text-[#808080] hover:text-white transition-colors">{t('index.footer.support')}</a></li>
              <li><a href="#faq" className="text-[#808080] hover:text-white transition-colors">{t('index.footer.faq')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg text-white">{t('index.footer.company')}</h4>
            <ul className="space-y-3">
              <li><a href="https://ebuster.ru/contacts" className="text-[#808080] hover:text-white transition-colors">{t('index.footer.about')}</a></li>
              <li><a href="https://ebuster.ru/contacts" className="text-[#808080] hover:text-white transition-colors">{t('index.footer.privacy')}</a></li>
              <li><a href="https://ebuster.ru/contacts" className="text-[#808080] hover:text-white transition-colors">{t('index.footer.terms')}</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#2d2d2d] text-center">
          <div className="text-sm text-[#808080]">
            {t('index.footer.copyright')}
          </div>
        </div>
      </div>
    </footer>
  );
};
