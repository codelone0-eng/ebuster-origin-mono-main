import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
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
    icon: <CircleCheck className="h-3.5 w-3.5 text-[#808080]" />,
    dotClass: 'h-2.5 w-2.5 rounded-full bg-green-600/20 border border-green-500/40',
  },
  'in-progress': {
    icon: <Loader2 className="h-3.5 w-3.5 text-[#808080]" />,
    dotClass: 'h-2.5 w-2.5 rounded-full bg-blue-600/20 border border-blue-500/40',
  },
  planned: {
    icon: <Flag className="h-3.5 w-3.5 text-[#808080]" />,
    dotClass: 'h-2.5 w-2.5 rounded-full bg-[#2d2d2d] border border-[#404040]',
  },
};

const Roadmap = () => {
  const { language } = useLanguage();
  const content = language === 'ru' ? roadmapContent.ru : roadmapContent.eng;

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-in-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#111111]">
      <SEO
        title={content.hero.title}
        description={content.hero.description}
        url="https://ebuster.ru/roadmap"
        keywords="ebuster roadmap, обновления ebuster, ebuster updates, chrome extension roadmap"
      />
      <Header />

      <div className="container mx-auto max-w-5xl px-4 py-16 space-y-16">
        <section className="text-center space-y-6 fade-in-on-scroll">
          <div className="mx-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#2d2d2d]">
            <Milestone className="h-4 w-4 text-[#d9d9d9]" />
            <span className="text-xs text-[#808080] uppercase tracking-wider" style={{ fontSize: '11px', letterSpacing: '0.08em' }}>
              {content.hero.badge}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white" style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: '1.1'
          }}>
            {content.hero.title}
          </h1>
          <p className="text-lg text-[#808080] max-w-3xl mx-auto" style={{ fontSize: '16px', lineHeight: '1.6' }}>
            {content.hero.subtitle}
          </p>
          <p className="text-[#808080] max-w-3xl mx-auto" style={{ fontSize: '14px', lineHeight: '1.5' }}>
            {content.hero.description}
          </p>
        </section>

        <section className="space-y-6">
          {content.timeline.map((entry, index) => (
            <Card 
              key={entry.period} 
              className="bg-[#1f1f1f] border-[#2d2d2d] p-6 fade-in-on-scroll hover:border-blue-500/30 transition-colors"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-0">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-blue-500" />
                    <h3 className="text-2xl font-semibold text-white">{entry.period}</h3>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium tracking-wide bg-[#1a1a1a] border border-[#2d2d2d] text-[#808080]">
                    <span className={statusConfig[entry.status as Status].dotClass} aria-hidden="true" />
                    {statusConfig[entry.status as Status].icon}
                    <span className="text-sm">{content.statusLabels[entry.status as Status]}</span>
                  </div>
                </div>
                <ul className="space-y-2 text-[#808080]">
                  {entry.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Sparkles className="mt-1 h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span style={{ fontSize: '14px', lineHeight: '1.5' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="h-px bg-[#2d2d2d]" />

        <section className="space-y-6 fade-in-on-scroll">
          <h2 className="text-3xl font-semibold text-white text-center">
            {content.updates.title}
          </h2>
          <div className="space-y-6">
            {content.updates.list.map((update, index) => (
              <Card 
                key={update.date} 
                className="bg-[#1f1f1f] border-[#2d2d2d] p-6 hover:border-blue-500/30 transition-colors"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3 text-blue-500">
                      <Calendar className="h-5 w-5" />
                      <span className="font-semibold">{update.date}</span>
                    </div>
                    <span className="text-[#808080]" style={{ fontSize: '14px' }}>{update.summary}</span>
                  </div>
                  <ul className="space-y-2 text-[#808080]">
                    {update.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <CircleCheck className="mt-1 h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span style={{ fontSize: '14px', lineHeight: '1.5' }}>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="h-px bg-[#2d2d2d]" />

        <section className="space-y-6 text-center fade-in-on-scroll">
          <h2 className="text-3xl font-semibold text-white">
            {content.influence.title}
          </h2>
          <p className="text-[#808080] max-w-3xl mx-auto" style={{ fontSize: '16px', lineHeight: '1.6' }}>
            {content.influence.description}
          </p>
          <div className="grid gap-6 md:grid-cols-3 text-left">
            {content.influence.actions.map((action, index) => (
              <Card 
                key={action} 
                className="bg-[#1f1f1f] border-[#2d2d2d] p-6 h-full hover:border-blue-500/30 transition-colors"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-1 h-5 w-5 text-blue-500 flex-shrink-0" />
                    <span className="text-[#808080]" style={{ fontSize: '14px', lineHeight: '1.5' }}>{action}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <Footer />

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-in-on-scroll {
          opacity: 0;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Roadmap;
