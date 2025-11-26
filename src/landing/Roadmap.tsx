import React, { useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { Milestone, Calendar, CircleCheck, Loader2, Flag, Sparkles } from 'lucide-react';
import Silk from '@/components/Silk';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
    icon: <CircleCheck className="h-3.5 w-3.5 text-white/60" />,
    dotClass: 'h-2.5 w-2.5 rounded-full bg-white/5 border border-white/10',
  },
  'in-progress': {
    icon: <Loader2 className="h-3.5 w-3.5 text-white/60" />,
    dotClass: 'h-2.5 w-2.5 rounded-full bg-white/5 border border-white/10',
  },
  planned: {
    icon: <Flag className="h-3.5 w-3.5 text-white/60" />,
    dotClass: 'h-2.5 w-2.5 rounded-full bg-white/5 border border-white/10',
  },
};

const Roadmap = () => {
  const { language } = useLanguage();
  const content = language === 'ru' ? roadmapContent.ru : roadmapContent.eng;
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;

    const elements = heroRef.current.querySelectorAll('.hero-element');
    gsap.from(elements, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out"
    });

    return () => {
      gsap.killTweensOf(elements);
    };
  }, []);

  useEffect(() => {
    if (!sectionsRef.current) return;

    const sections = sectionsRef.current.querySelectorAll('.roadmap-section');
    sections.forEach((section) => {
      gsap.fromTo(section,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 90%",
            toggleActions: "play none none none",
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden text-white">
      <SEO
        title={content.hero.title}
        description={content.hero.description}
        url="https://ebuster.ru/roadmap"
        keywords="ebuster roadmap, обновления ebuster, ebuster updates, chrome extension roadmap"
      />
      <div className="relative">
        <Header />

        {/* Silk background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Silk speed={5} scale={1} color="#ffffff" noiseIntensity={4.3} rotation={0} />
        </div>
        <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-[1] pointer-events-none" />

        <div className="relative z-10">
        <section className="relative bg-black/80 px-4 py-32 z-10">
          <div className="container mx-auto max-w-5xl px-4 py-16 space-y-16">
        <section ref={heroRef} className="text-center space-y-6">
          <div className="hero-element mx-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Milestone className="h-4 w-4 text-white" />
            <span className="text-xs text-white/60 uppercase tracking-wider" style={{ fontSize: '11px', letterSpacing: '0.08em' }}>
              {content.hero.badge}
            </span>
          </div>
          <h1 className="hero-element text-4xl md:text-6xl font-bold text-white" style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: '1.1'
          }}>
            {content.hero.title}
          </h1>
          <p className="hero-element text-lg text-white/60 max-w-3xl mx-auto" style={{ fontSize: '16px', lineHeight: '1.6' }}>
            {content.hero.subtitle}
          </p>
          <p className="hero-element text-white/60 max-w-3xl mx-auto" style={{ fontSize: '14px', lineHeight: '1.5' }}>
            {content.hero.description}
          </p>
        </section>

        <section ref={sectionsRef} className="space-y-6">
          {content.timeline.map((entry, index) => (
            <Card 
              key={entry.period} 
              className="roadmap-section rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-colors duration-200"
            >
              <CardContent className="p-0">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-white" />
                    <h3 className="text-2xl font-semibold text-white">{entry.period}</h3>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium tracking-wide bg-white/5 border border-white/10 text-white/60">
                    <span className={statusConfig[entry.status as Status].dotClass} aria-hidden="true" />
                    {statusConfig[entry.status as Status].icon}
                    <span className="text-sm">{content.statusLabels[entry.status as Status]}</span>
                  </div>
                </div>
                <ul className="space-y-2 text-white/60">
                  {entry.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Sparkles className="mt-1 h-4 w-4 text-white flex-shrink-0" />
                      <span style={{ fontSize: '14px', lineHeight: '1.5' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="h-px bg-[#2d2d2d]" />

        <section className="roadmap-section space-y-6">
          <h2 className="text-3xl font-semibold text-white text-center">
            {content.updates.title}
          </h2>
          <div className="space-y-6">
            {content.updates.list.map((update, index) => (
              <Card 
                key={update.date} 
                className="rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-colors duration-200"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3 text-white">
                      <Calendar className="h-5 w-5" />
                      <span className="font-semibold">{update.date}</span>
                    </div>
                    <span className="text-white/60" style={{ fontSize: '14px' }}>{update.summary}</span>
                  </div>
                  <ul className="space-y-2 text-white/60">
                    {update.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <CircleCheck className="mt-1 h-4 w-4 text-white flex-shrink-0" />
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

        <section className="roadmap-section space-y-6 text-center">
          <h2 className="text-3xl font-semibold text-white">
            {content.influence.title}
          </h2>
          <p className="text-white/60 max-w-3xl mx-auto" style={{ fontSize: '16px', lineHeight: '1.6' }}>
            {content.influence.description}
          </p>
          <div className="grid gap-6 md:grid-cols-3 text-left">
            {content.influence.actions.map((action, index) => (
              <Card 
                key={action} 
                className="rounded-xl border border-white/10 bg-white/[0.02] p-6 h-full transition-colors duration-200"
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-1 h-5 w-5 text-white flex-shrink-0" />
                    <span className="text-white/60" style={{ fontSize: '14px', lineHeight: '1.5' }}>{action}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
        </section>
        </div>
      
      <Footer />
      </div>
    </div>
  );
};

export default Roadmap;
