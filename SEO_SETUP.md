# SEO Оптимизация EBUSTER

## Что сделано:

### 1. **index.html** - Мощные мета-теги
- ✅ Расширенные keywords (30+ ключевых слов для Яндекса)
- ✅ Улучшенный title с "№1" и "2025"
- ✅ Специальные теги для Яндекса (`yandex`, `geo.region`, `geo.placename`)
- ✅ Alternate languages (ru, en, x-default)
- ✅ Расширенные Open Graph теги
- ✅ Twitter Card теги
- ✅ 4 типа Schema.org разметки:
  - SoftwareApplication (с featureList, downloadUrl, ratings)
  - Organization (с контактами и соцсетями)
  - WebSite (с SearchAction)
  - BreadcrumbList (навигация)

### 2. **robots.txt** - Оптимизация для ботов
- ✅ Приоритет для Yandex бота
- ✅ Crawl-delay: 0 для быстрой индексации
- ✅ Host директива для Яндекса
- ✅ Disallow для админки и API
- ✅ Ссылка на sitemap

### 3. **sitemap.xml** - Полная карта сайта
- ✅ Все основные страницы
- ✅ Правильные приоритеты (главная = 1.0, цены = 0.9)
- ✅ hreflang теги для мультиязычности
- ✅ Частота обновлений (daily, weekly, monthly)

### 4. **SEO.tsx** - Динамические мета-теги
- ✅ React компонент для каждой страницы
- ✅ Автоматическая генерация title, description, OG tags
- ✅ Поддержка noindex для служебных страниц

## Установка зависимостей:

```bash
npm install react-helmet-async
```

## Использование SEO компонента:

```tsx
import { SEO } from '@/components/SEO';

// В любом компоненте страницы:
<SEO 
  title="Цены на EBUSTER"
  description="Выберите подходящий план подписки EBUSTER"
  url="https://ebuster.ru/price"
  keywords="ebuster цены, подписка chrome extension, premium userscript"
/>
```

## Следующие шаги для ТОП-1 в Яндексе:

### 1. Верификация в Яндекс.Вебмастер
1. Зайти на https://webmaster.yandex.ru/
2. Добавить сайт ebuster.ru
3. Получить код верификации
4. Вставить в `index.html` строка 61:
   ```html
   <meta name="yandex-verification" content="ВАШ_КОД" />
   ```

### 2. Верификация в Google Search Console
1. Зайти на https://search.google.com/search-console
2. Добавить сайт
3. Получить код верификации
4. Вставить в `index.html` строка 62:
   ```html
   <meta name="google-site-verification" content="ВАШ_КОД" />
   ```

### 3. Отправить sitemap
- В Яндекс.Вебмастер: Индексирование → Файлы Sitemap → Добавить sitemap
- URL: `https://ebuster.ru/sitemap.xml`
- В Google Search Console: Файлы Sitemap → Добавить новый файл Sitemap

### 4. Настроить Яндекс.Метрику (опционально)
```html
<!-- Вставить перед </head> в index.html -->
<script type="text/javascript">
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();
   for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

   ym(ВАШ_СЧЕТЧИК, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:true
   });
</script>
```

### 5. Контент-оптимизация
- ✅ Добавить больше ключевых слов в тексты страниц
- ✅ Создать блог/статьи про userscripts
- ✅ Добавить FAQ с популярными вопросами
- ✅ Создать страницу сравнения с конкурентами (vs Tampermonkey)

### 6. Внешние ссылки (backlinks)
- Разместить на GitHub
- Добавить в каталоги расширений
- Написать статьи на Habr, VC.ru
- Создать канал в Telegram
- Разместить на ProductHunt

### 7. Технические улучшения
- ✅ Добавить preconnect для шрифтов (уже есть)
- ✅ Оптимизировать изображения (WebP)
- ✅ Настроить кэширование
- ✅ Включить GZIP/Brotli сжатие
- ✅ Настроить CDN (Cloudflare)

## Ключевые метрики для мониторинга:

1. **Яндекс.Вебмастер**
   - Индексация страниц
   - Позиции по запросам
   - Ошибки сканирования
   - Скорость загрузки

2. **Google Search Console**
   - Показы и клики
   - CTR
   - Средняя позиция
   - Core Web Vitals

3. **Целевые запросы для ТОП-1:**
   - "расширение chrome userscript"
   - "tampermonkey альтернатива"
   - "менеджер скриптов chrome"
   - "ebuster расширение"
   - "userscript manager russia"
   - "автоматизация браузера chrome"

## Результат:
После всех этих оптимизаций сайт будет:
- ✅ Полностью оптимизирован для Яндекса и Google
- ✅ Иметь богатую Schema.org разметку
- ✅ Быстро индексироваться
- ✅ Показываться в расширенных сниппетах
- ✅ Иметь высокий CTR благодаря красивым превью

**Ожидаемый срок выхода в ТОП-3 Яндекса: 2-4 недели при активном продвижении**
