import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'EBUSTER - Лучшее расширение для Chrome | Userscript менеджер 2025',
  description = 'EBUSTER - №1 расширение для Chrome в России. Мощный userscript менеджер с автоматизацией браузера, библиотекой скриптов и API. Бесплатная альтернатива Tampermonkey и Greasemonkey.',
  keywords = 'ebuster, расширение chrome, userscript manager, tampermonkey альтернатива, greasemonkey, автоматизация браузера, скрипты для chrome, менеджер скриптов',
  image = 'https://ebuster.ru/og-image.png',
  url = 'https://ebuster.ru/',
  type = 'website',
  noindex = false
}) => {
  const fullTitle = title.includes('EBUSTER') ? title : `${title} | EBUSTER`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}
      
      {/* Canonical */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="EBUSTER" />
      <meta property="og:locale" content="ru_RU" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ebuster_ru" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Yandex */}
      <meta name="yandex" content="index, follow" />
    </Helmet>
  );
};
