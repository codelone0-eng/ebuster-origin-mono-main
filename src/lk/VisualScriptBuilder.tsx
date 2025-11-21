import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Workflow,
  Blocks,
  Sparkles,
  Search,
  Compass,
  BugPlay,
  History,
  BookOpen,
  Gift,
  Cpu,
  ShieldCheck,
  HardDriveDownload,
  Cloud,
  Globe,
  MessageCircle,
  Mail,
  Brain,
  Zap
} from 'lucide-react';

const blockCategories = [
  {
    title: 'Действия и взаимодействия',
    description: 'Готовые блоки для кликов, ввода текста, работы с формами и элементами интерфейса.',
    items: [
      'Нажать кнопку или ссылку',
      'Заполнить поле формы',
      'Прокрутить к элементу',
      'Выполнить кастомный JavaScript'
    ]
  },
  {
    title: 'Навигация и ожидания',
    description: 'Управление переходами, ожиданием загрузки и проверками состояния страниц.',
    items: [
      'Перейти по адресу',
      'Дождаться появление элемента',
      'Проверить текст или атрибут',
      'Повторить шаг при ошибке'
    ]
  },
  {
    title: 'Работа с данными',
    description: 'Хранение, анализ и передача данных между шагами сценария.',
    items: [
      'Извлечь таблицу или список',
      'Применить фильтры и условия',
      'Использовать переменные и выражения',
      'Передать результат в следующий скрипт'
    ]
  }
];

const helperCards = [
  {
    title: 'Умный подбор элементов',
    icon: <Search className="h-8 w-8 text-primary" />,
    description: 'Наведи курсор на элемент и получи устойчивые селекторы с оценкой надежности. Тестируй сразу на наборе страниц.'
  },
  {
    title: 'Встроенный отладчик',
    icon: <BugPlay className="h-8 w-8 text-primary" />,
    description: 'Пошаговое выполнение с подсветкой на странице, лог ошибок и готовые советы: когда добавить ожидание или изменить селектор.'
  },
  {
    title: 'История запусков',
    icon: <History className="h-8 w-8 text-primary" />,
    description: 'Просматривай журнал выполнения, откатывайся к любой версии, сравнивай изменения и отмечай стабильные сборки.'
  }
];

const knowledgeBlocks = [
  {
    title: 'Контекстная помощь',
    description: 'Для каждого блока показываем готовые примеры, подсказки и ссылки на релевантную документацию.',
    icon: <BookOpen className="h-6 w-6 text-primary" />
  },
  {
    title: 'Готовые шаблоны',
    description: 'Стартовые сценарии для авторизации, парсинга таблиц, синхронизации с Google Sheets и других популярных задач.',
    icon: <Gift className="h-6 w-6 text-primary" />
  },
  {
    title: 'Библиотека решений',
    description: 'Каталог сценариев с рейтингами и отзывами. Подбирай по цели, адаптируй под себя и отслеживай совместимость.',
    icon: <Brain className="h-6 w-6 text-primary" />
  }
];

const automationCards = [
  {
    title: 'Мощные триггеры',
    icon: <Zap className="h-6 w-6 text-primary" />,
    description: 'Запускай сценарии по событиям: новое письмо, изменение цены, веб-хук или расписание с условиями.'
  },
  {
    title: 'Цепочки сценариев',
    icon: <Workflow className="h-6 w-6 text-primary" />,
    description: 'Строй визуальные workflow: объединяй сценарии, передавай данные между ними и настраивай точки ветвления.'
  },
  {
    title: 'Общая база данных',
    icon: <HardDriveDownload className="h-6 w-6 text-primary" />,
    description: 'Используй общие таблицы и коллекции для обмена данными между сценариями и отслеживания состояния процессов.'
  }
];

const securityCards = [
  {
    title: 'Прозрачные разрешения',
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
    description: 'Показываем, какие доступы нужны каждому блоку и зачем. Предупреждаем о рискованных операциях.'
  },
  {
    title: 'Изолированные запуски',
    icon: <Cpu className="h-6 w-6 text-primary" />,
    description: 'Тестируй новые сценарии в песочнице с ограниченными правами, прежде чем отправлять на боевые задачи.'
  },
  {
    title: 'Версионность и бэкапы',
    icon: <Cloud className="h-6 w-6 text-primary" />,
    description: 'Автосохранение каждые несколько минут, сравнение изменений и мгновенный откат к стабильной версии.'
  }
];

const integrations = [
  {
    title: 'Google Workspace',
    description: 'Готовые действия для Sheets, Docs, Calendar и Drive: чтение, запись, триггеры и уведомления.',
    icon: <Globe className="h-6 w-6 text-primary" />
  },
  {
    title: 'Социальные сети',
    description: 'Модули для публикаций, аналитики и мониторинга комментариев во всех популярных соцсетях.',
    icon: <MessageCircle className="h-6 w-6 text-primary" />
  },
  {
    title: 'Email и мессенджеры',
    description: 'Поддержка SMTP, популярных почтовых сервисов и мессенджеров для отправки уведомлений и обработки входящих.',
    icon: <Mail className="h-6 w-6 text-primary" />
  }
];

export const VisualScriptBuilder: React.FC = () => {
  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="bg-card/70 backdrop-blur border border-border/60">
          <CardHeader className="space-y-3">
            <Badge variant="outline" className="w-fit bg-primary/10 text-primary border-primary/30">
              Визуальный конструктор
            </Badge>
            <CardTitle className="text-3xl font-bold">Создавайте сценарии в стиле Scratch</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Перетаскивайте блоки действий, комбинируйте условия и циклы. Платформа автоматически соберёт чистый JavaScript-код, готовый к тонкой ручной доработке и публикации.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="edit">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="edit">Редактор</TabsTrigger>
                <TabsTrigger value="preview">Сгенерированный код</TabsTrigger>
                <TabsTrigger value="assist">Интеллект-помощник</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="space-y-4">
                <div className="rounded-xl border border-dashed border-border/50 bg-muted/30 p-6">
                  <p className="text-sm text-muted-foreground">
                    Перетащите блок <span className="font-semibold text-foreground">"Нажать кнопку с текстом \"Submit\""</span>, затем добавьте ожидание загрузки и извлечение данных. Каждый блок можно превратить в функцию или шаг сценария.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="preview" className="space-y-4">
                <Card className="border border-border/50 bg-muted/20">
                  <CardContent className="font-mono text-xs text-muted-foreground p-4 space-y-2">
                    <p>{'await page.click("button:text(\'Submit\')");'}</p>
                    <p>{'await page.waitForLoadState("networkidle");'}</p>
                    <p>{'const table = await page.$$eval("table tr", rows => rows.map(r => r.innerText));'}</p>
                    <p>{'await fillFormWithData(table);'}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="assist" className="space-y-4">
                <Card className="border border-primary/40 bg-primary/5">
                  <CardContent className="p-4 text-sm text-muted-foreground space-y-2">
                    <p className="flex items-center gap-2 text-foreground font-medium">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Совет ассистента
                    </p>
                    <p>Добавьте ожидание <span className="font-semibold text-foreground">page.waitForSelector()</span>, чтобы убедиться, что таблица появилась перед парсингом.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur border border-border/60">
          <CardHeader className="space-y-3">
            <Blocks className="h-10 w-10 text-primary" />
            <CardTitle className="text-xl">Категории блоков</CardTitle>
            <CardDescription>
              Поддержка drag&drop, вложенных условий, циклов и встроенного тестирования шагов.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {blockCategories.map((category) => (
              <div key={category.title} className="rounded-lg border border-border/40 bg-muted/20 p-4">
                <h3 className="text-sm font-semibold text-foreground mb-1">{category.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{category.description}</p>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((item) => (
                    <Badge key={item} variant="secondary" className="bg-background/60">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {helperCards.map((card) => (
          <Card key={card.title} className="bg-card/70 backdrop-blur border border-border/60 h-full">
            <CardHeader className="space-y-3">
              {card.icon}
              <CardTitle className="text-xl">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Обучение и помощь</h2>
            <p className="text-sm text-muted-foreground">Всегда под рукой: подсказки, шаблоны и примеры для ускорения разработки.</p>
          </div>
          <Button variant="outline">Открыть документацию</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {knowledgeBlocks.map((card) => (
            <Card key={card.title} className="bg-card/70 backdrop-blur border border-border/60">
              <CardHeader className="space-y-3">
                {card.icon}
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Управление и автоматизация</h2>
        <p className="text-sm text-muted-foreground">Запускайте сценарии по событиям, соединяйте их в цепочки и управляйте данными централизованно.</p>
        <div className="grid gap-4 md:grid-cols-3">
          {automationCards.map((card) => (
            <Card key={card.title} className="bg-card/70 backdrop-blur border border-border/60">
              <CardHeader className="space-y-3">
                {card.icon}
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Безопасность и надежность</h2>
        <p className="text-sm text-muted-foreground">Контроль прав, безопасные среды и автоматическое резервирование защищают вашу работу.</p>
        <div className="grid gap-4 md:grid-cols-3">
          {securityCards.map((card) => (
            <Card key={card.title} className="bg-card/70 backdrop-blur border border-border/60">
              <CardHeader className="space-y-3">
                {card.icon}
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Интеграции и экосистема</h2>
            <p className="text-sm text-muted-foreground">Используйте готовые коннекторы для популярных сервисов и строите сложные сценарии без кода.</p>
          </div>
          <Button>Каталог интеграций</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {integrations.map((integration) => (
            <Card key={integration.title} className="bg-card/70 backdrop-blur border border-border/60">
              <CardHeader className="space-y-3">
                {integration.icon}
                <CardTitle className="text-lg">{integration.title}</CardTitle>
                <CardDescription>{integration.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="space-y-2 max-w-2xl">
          <h3 className="text-xl font-semibold text-foreground">Получайте ранний доступ к визуальному редактору</h3>
          <p className="text-sm text-muted-foreground">
            Мы готовим закрытую бету. Подпишитесь, чтобы первыми попробовать визуальное проектирование сценариев и получить доступ к эксклюзивным шаблонам.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Посмотреть гайд</Button>
          <Button>Подписаться на бету</Button>
        </div>
      </section>
    </div>
  );
};

export default VisualScriptBuilder;
