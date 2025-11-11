import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/hooks/useLanguage';
import { Milestone, Calendar, CircleCheck, Loader2, Flag, Sparkles } from 'lucide-react';

const roadmapContent = {
  ru: {
    hero: {
      badge: 'Дорожная карта EBUSTER',
      title: 'План развития EBUSTER',
      subtitle: 'Прозрачная карта обновлений и приоритетов продукта',
      description:
        'Мы открыто делимся тем, что уже сделали, что в работе и какие улучшения планируем. Следите за прогрессом и влияйте на развитие EBUSTER.',
    },
    timeline: [
      {
        period: 'IV квартал 2025',
        status: 'in-progress',
        items: [
          'Публичная библиотека готовых скриптов с оценками и отзывами',
          'Обновлённый интерфейс управления скриптами с режимом drag & drop',
          'Интеграция с Supabase для ускоренного отклика тикетов',
        ],
      },
      {
        period: 'I квартал 2026',
        status: 'planned',
        items: [
          'Гибкие роли и права доступа для команд',
          'Webhook-уведомления о событиях расширения',
          'Расширенный режим аналитики по usage-метрикам',
        ],
      },
      {
        period: 'II квартал 2026',
        status: 'planned',
        items: [
          'Улучшенная интеграция с Jira / YouTrack для тикетов',
          'Marketplace кастомных модулей и шаблонов',
          'Оффлайн-режим с автоматической синхронизацией',
        ],
      },
    ],
    updates: {
      title: 'Последние обновления',
      list: [
        {
          date: 'Октябрь 2025',
          summary: 'SEO-оптимизация, обновлённая навигация, улучшенный футер',
          points: [
            'Добавлен HelmetProvider и динамические SEO-теги для ключевых страниц',
            'Переработана навигация: новые ссылки, унификация футера',
            'Улучшены фильтры тикетов и интерфейс модалей оценки скриптов',
          ],
        },
        {
          date: 'Сентябрь 2025',
          summary: 'Улучшения пользовательского опыта и безопасности',
          points: [
            'Оптимизирована авторизация и проверка токенов в OAuth-флоу',
            'Добавлены новые подсказки и валидации в личном кабинете',
            'Расширены системные уведомления и мониторинг SLA',
          ],
        },
      ],
    },
    influence: {
      title: 'Как повлиять на Roadmap',
      description:
        'EBUSTER развивается вместе с сообществом. Чем активнее вы делитесь обратной связью, тем быстрее нужные вам функции попадут в работу.',
      actions: [
        'Создавайте тикеты в разделе поддержки и голосуйте за существующие предложения',
        'Участвуйте в ежемесячных AMA-сессиях и пользовательских интервью',
        'Пишите на feedback@ebuster.ru с кейсами и пожеланиями — на каждое письмо отвечаем лично',
      ],
    },
    statusLabels: {
      completed: 'Выполнено',
      'in-progress': 'В работе',
      planned: 'Запланировано',
    },
  },
  eng: {
    hero: {
      badge: 'EBUSTER Roadmap',
      title: 'EBUSTER Roadmap',
      subtitle: 'Transparent updates and product priorities',
      description:
        'We share what has shipped, what is in progress, and what is coming next. Follow our progress and help us shape the future of EBUSTER.',
    },
    timeline: [
      {
        period: 'Q4 2025',
        status: 'in-progress',
        items: [
          'Public script library with ratings and reviews',
          'Revamped drag & drop script management UI',
          'Supabase-powered SLA improvements for support tickets',
        ],
      },
      {
        period: 'Q1 2026',
        status: 'planned',
        items: [
          'Advanced team roles and permission matrix',
          'Webhook notifications for extension events',
          'Extended analytics with usage insights and trends',
        ],
      },
      {
        period: 'Q2 2026',
        status: 'planned',
        items: [
          'Deep Jira / YouTrack integration for ticket workflows',
          'Marketplace for custom modules and templates',
          'Offline mode with automatic sync once reconnected',
        ],
      },
    ],
    updates: {
      title: 'Latest updates',
      list: [
        {
          date: 'October 2025',
          summary: 'SEO overhaul, navigation refresh, footer consistency',
          points: [
            'Added HelmetProvider with dynamic SEO tags across key pages',
            'Navigation simplified and footer links unified across the site',
            'Improved ticket filters and polished rating modal UX',
          ],
        },
        {
          date: 'September 2025',
          summary: 'User experience and security improvements',
          points: [
            'Optimised OAuth flow with additional token validation',
            'New hints and validations across dashboard forms',
            'Expanded system notifications and SLA monitoring',
          ],
        },
      ],
    },
    influence: {
      title: 'How to influence the roadmap',
      description:
        'EBUSTER grows together with its community. The more feedback you share, the faster the features you need reach production.',
      actions: [
        'Create support tickets and vote for existing feature requests',
        'Join our monthly AMA sessions and customer interviews',
        'Email feedback@ebuster.ru with real-world scenarios — every message gets a response',
      ],
    },
    statusLabels: {
      completed: 'Completed',
      'in-progress': 'In progress',
      planned: 'Planned',
    },
  },
} as const;

type Status = keyof typeof roadmapContent.ru.statusLabels;

const statusConfig: Record<Status, {
  icon: React.ReactNode;
  dotClass: string;
}> = {
  completed: {
    icon: <CircleCheck className="h-3.5 w-3.5 text-muted-foreground" />,
    dotClass: 'h-2.5 w-2.5 rounded-full bg-white/45 shadow-[0_0_0_5px_rgba(15,17,26,0.6)]',
  },
  'in-progress': {
    icon: <Loader2 className="h-3.5 w-3.5 text-muted-foreground" />,
    dotClass: 'h-2.5 w-2.5 rounded-full bg-white/45 shadow-[0_0_0_5px_rgba(15,17,26,0.6)]',
  },
  planned: {
    icon: <Flag className="h-3.5 w-3.5 text-muted-foreground" />,
    dotClass: 'h-2.5 w-2.5 rounded-full bg-white/45 shadow-[0_0_0_5px_rgba(15,17,26,0.6)]',
  },
};

const statusContainerBaseClasses =
  'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium tracking-wide border border-white/10 bg-[#0f111a]/90 text-muted-foreground backdrop-blur-md shadow-[0_16px_36px_-26px_rgba(0,0,0,0.85)] transition-all';

const Roadmap = () => {
  const { language } = useLanguage();
  const content = language === 'ru' ? roadmapContent.ru : roadmapContent.eng;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={content.hero.title}
        description={content.hero.description}
        url="https://ebuster.ru/roadmap"
        keywords="ebuster roadmap, обновления ebuster, ebuster updates, chrome extension roadmap"
      />
      <Header />

      <div className="container mx-auto max-w-5xl px-4 py-16 space-y-16">
        <section className="text-center space-y-6">
          <div className="mx-auto inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#0f111a]/90 border border-white/10 backdrop-blur-md shadow-[0_22px_45px_-30px_rgba(0,0,0,0.85)]">
            <Milestone className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground">{content.hero.badge}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            {content.hero.title.split(' ').map((word, index) => (
              <span key={index} className={index % 2 === 1 ? 'gradient-text' : undefined}>
                {word}{' '}
              </span>
            ))}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {content.hero.subtitle}
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {content.hero.description}
          </p>
        </section>

        <section className="space-y-8">
          <div className="space-y-6">
            {content.timeline.map((entry) => (
              <Card key={entry.period} className="bg-card/40 backdrop-blur border border-border/60">
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">{entry.period}</CardTitle>
                  </div>
                  <div className={statusContainerBaseClasses}>
                    <span className={statusConfig[entry.status as Status].dotClass} aria-hidden="true" />
                    {statusConfig[entry.status as Status].icon}
                    <span className="text-sm text-muted-foreground">{content.statusLabels[entry.status as Status]}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    {entry.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Sparkles className="mt-1 h-4 w-4 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="bg-border/50" />

        <section className="space-y-8">
          <h2 className="text-3xl font-semibold text-foreground text-center">
            {content.updates.title}
          </h2>
          <div className="space-y-6">
            {content.updates.list.map((update) => (
              <Card key={update.date} className="bg-card/40 border border-border/60">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div className="flex items-center gap-3 text-primary">
                      <Calendar className="h-5 w-5" />
                      <span className="font-semibold">{update.date}</span>
                    </div>
                    <span className="text-muted-foreground">{update.summary}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    {update.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <CircleCheck className="mt-1 h-4 w-4 text-primary" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="bg-border/50" />

        <section className="space-y-6 text-center">
          <h2 className="text-3xl font-semibold text-foreground">
            {content.influence.title}
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {content.influence.description}
          </p>
          <div className="grid gap-4 md:grid-cols-3 text-left">
            {content.influence.actions.map((action) => (
              <Card key={action} className="bg-card/40 border border-border/60 h-full">
                <CardContent className="p-6 flex items-start gap-3">
                  <Sparkles className="mt-1 h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">{action}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Roadmap;
