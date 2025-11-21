// Полная система разрешений для RBAC

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: PermissionCategory;
}

export type PermissionCategory = 
  | 'scripts'
  | 'visual_builder'
  | 'marketplace'
  | 'profile'
  | 'support'
  | 'admin'
  | 'api'
  | 'analytics';

// Детальные разрешения для каждого функционала
export const PERMISSIONS: Record<string, Permission> = {
  // === СКРИПТЫ ===
  'scripts.view': {
    id: 'scripts.view',
    name: 'Просмотр скриптов',
    description: 'Просмотр списка скриптов в маркетплейсе',
    category: 'scripts'
  },
  'scripts.download': {
    id: 'scripts.download',
    name: 'Скачивание скриптов',
    description: 'Скачивание бесплатных скриптов',
    category: 'scripts'
  },
  'scripts.download_premium': {
    id: 'scripts.download_premium',
    name: 'Скачивание Premium скриптов',
    description: 'Доступ к премиум скриптам',
    category: 'scripts'
  },
  'scripts.create': {
    id: 'scripts.create',
    name: 'Создание скриптов',
    description: 'Создание собственных скриптов',
    category: 'scripts'
  },
  'scripts.edit_own': {
    id: 'scripts.edit_own',
    name: 'Редактирование своих скриптов',
    description: 'Редактирование собственных скриптов',
    category: 'scripts'
  },
  'scripts.delete_own': {
    id: 'scripts.delete_own',
    name: 'Удаление своих скриптов',
    description: 'Удаление собственных скриптов',
    category: 'scripts'
  },
  'scripts.publish': {
    id: 'scripts.publish',
    name: 'Публикация скриптов',
    description: 'Публикация скриптов в маркетплейс',
    category: 'scripts'
  },
  'scripts.mark_premium': {
    id: 'scripts.mark_premium',
    name: 'Отметка Premium',
    description: 'Возможность помечать свои скрипты как Premium',
    category: 'scripts'
  },
  'scripts.moderate': {
    id: 'scripts.moderate',
    name: 'Модерация скриптов',
    description: 'Модерация чужих скриптов',
    category: 'scripts'
  },
  'scripts.edit_any': {
    id: 'scripts.edit_any',
    name: 'Редактирование любых скриптов',
    description: 'Редактирование скриптов других пользователей',
    category: 'scripts'
  },
  'scripts.delete_any': {
    id: 'scripts.delete_any',
    name: 'Удаление любых скриптов',
    description: 'Удаление скриптов других пользователей',
    category: 'scripts'
  },

  // === ВИЗУАЛЬНЫЙ КОНСТРУКТОР ===
  'visual_builder.access': {
    id: 'visual_builder.access',
    name: 'Доступ к визуальному конструктору',
    description: 'Использование визуального конструктора скриптов',
    category: 'visual_builder'
  },
  'visual_builder.save_to_extension': {
    id: 'visual_builder.save_to_extension',
    name: 'Сохранение в расширение',
    description: 'Сохранение созданных скриптов напрямую в расширение',
    category: 'visual_builder'
  },
  'visual_builder.export_code': {
    id: 'visual_builder.export_code',
    name: 'Экспорт кода',
    description: 'Экспорт сгенерированного кода',
    category: 'visual_builder'
  },
  'visual_builder.advanced_blocks': {
    id: 'visual_builder.advanced_blocks',
    name: 'Продвинутые блоки',
    description: 'Доступ к продвинутым блокам (циклы, условия, API)',
    category: 'visual_builder'
  },

  // === МАРКЕТПЛЕЙС ===
  'marketplace.view': {
    id: 'marketplace.view',
    name: 'Просмотр маркетплейса',
    description: 'Доступ к маркетплейсу скриптов',
    category: 'marketplace'
  },
  'marketplace.rate': {
    id: 'marketplace.rate',
    name: 'Оценка скриптов',
    description: 'Возможность оценивать скрипты',
    category: 'marketplace'
  },
  'marketplace.comment': {
    id: 'marketplace.comment',
    name: 'Комментирование',
    description: 'Оставление комментариев к скриптам',
    category: 'marketplace'
  },
  'marketplace.report': {
    id: 'marketplace.report',
    name: 'Жалобы',
    description: 'Отправка жалоб на скрипты',
    category: 'marketplace'
  },

  // === ПРОФИЛЬ ===
  'profile.edit': {
    id: 'profile.edit',
    name: 'Редактирование профиля',
    description: 'Изменение данных профиля',
    category: 'profile'
  },
  'profile.avatar': {
    id: 'profile.avatar',
    name: 'Загрузка аватара',
    description: 'Загрузка и изменение аватара',
    category: 'profile'
  },
  'profile.custom_badge': {
    id: 'profile.custom_badge',
    name: 'Кастомный бейдж',
    description: 'Установка кастомного бейджа в профиле',
    category: 'profile'
  },
  'profile.referrals': {
    id: 'profile.referrals',
    name: 'Реферальная программа',
    description: 'Доступ к реферальной программе',
    category: 'profile'
  },

  // === ПОДДЕРЖКА ===
  'support.create_ticket': {
    id: 'support.create_ticket',
    name: 'Создание тикетов',
    description: 'Создание обращений в поддержку',
    category: 'support'
  },
  'support.priority': {
    id: 'support.priority',
    name: 'Приоритетная поддержка',
    description: 'Приоритетная обработка тикетов',
    category: 'support'
  },
  'support.chat': {
    id: 'support.chat',
    name: 'Чат поддержки',
    description: 'Доступ к онлайн-чату поддержки',
    category: 'support'
  },
  'support.attachments': {
    id: 'support.attachments',
    name: 'Вложения в тикетах',
    description: 'Прикрепление файлов к тикетам',
    category: 'support'
  },

  // === АДМИНИСТРИРОВАНИЕ ===
  'admin.access': {
    id: 'admin.access',
    name: 'Доступ к админ-панели',
    description: 'Базовый доступ к админ-панели',
    category: 'admin'
  },
  'admin.users.view': {
    id: 'admin.users.view',
    name: 'Просмотр пользователей',
    description: 'Просмотр списка пользователей',
    category: 'admin'
  },
  'admin.users.edit': {
    id: 'admin.users.edit',
    name: 'Редактирование пользователей',
    description: 'Изменение данных пользователей',
    category: 'admin'
  },
  'admin.users.ban': {
    id: 'admin.users.ban',
    name: 'Блокировка пользователей',
    description: 'Блокировка и разблокировка пользователей',
    category: 'admin'
  },
  'admin.users.delete': {
    id: 'admin.users.delete',
    name: 'Удаление пользователей',
    description: 'Удаление пользователей из системы',
    category: 'admin'
  },
  'admin.roles.manage': {
    id: 'admin.roles.manage',
    name: 'Управление ролями',
    description: 'Создание и редактирование ролей',
    category: 'admin'
  },
  'admin.roles.assign': {
    id: 'admin.roles.assign',
    name: 'Назначение ролей',
    description: 'Назначение ролей пользователям',
    category: 'admin'
  },
  'admin.scripts.manage': {
    id: 'admin.scripts.manage',
    name: 'Управление скриптами',
    description: 'Полное управление всеми скриптами',
    category: 'admin'
  },
  'admin.tickets.view': {
    id: 'admin.tickets.view',
    name: 'Просмотр тикетов',
    description: 'Просмотр всех тикетов поддержки',
    category: 'admin'
  },
  'admin.tickets.manage': {
    id: 'admin.tickets.manage',
    name: 'Управление тикетами',
    description: 'Ответы и управление тикетами',
    category: 'admin'
  },
  'admin.monitoring': {
    id: 'admin.monitoring',
    name: 'Мониторинг системы',
    description: 'Доступ к мониторингу и логам',
    category: 'admin'
  },
  'admin.settings': {
    id: 'admin.settings',
    name: 'Настройки системы',
    description: 'Изменение глобальных настроек',
    category: 'admin'
  },

  // === API ===
  'api.access': {
    id: 'api.access',
    name: 'Доступ к API',
    description: 'Использование REST API',
    category: 'api'
  },
  'api.webhooks': {
    id: 'api.webhooks',
    name: 'Вебхуки',
    description: 'Настройка вебхуков',
    category: 'api'
  },
  'api.extended_limits': {
    id: 'api.extended_limits',
    name: 'Расширенные лимиты API',
    description: 'Увеличенные лимиты запросов к API',
    category: 'api'
  },

  // === АНАЛИТИКА ===
  'analytics.view_own': {
    id: 'analytics.view_own',
    name: 'Своя аналитика',
    description: 'Просмотр статистики своих скриптов',
    category: 'analytics'
  },
  'analytics.view_all': {
    id: 'analytics.view_all',
    name: 'Вся аналитика',
    description: 'Просмотр полной аналитики системы',
    category: 'analytics'
  },
  'analytics.export': {
    id: 'analytics.export',
    name: 'Экспорт аналитики',
    description: 'Экспорт данных аналитики',
    category: 'analytics'
  }
};

// Группировка разрешений по категориям для UI
export const PERMISSION_CATEGORIES = {
  scripts: {
    name: 'Скрипты',
    description: 'Управление скриптами',
    permissions: Object.values(PERMISSIONS).filter(p => p.category === 'scripts')
  },
  visual_builder: {
    name: 'Визуальный конструктор',
    description: 'Создание скриптов визуально',
    permissions: Object.values(PERMISSIONS).filter(p => p.category === 'visual_builder')
  },
  marketplace: {
    name: 'Маркетплейс',
    description: 'Взаимодействие с маркетплейсом',
    permissions: Object.values(PERMISSIONS).filter(p => p.category === 'marketplace')
  },
  profile: {
    name: 'Профиль',
    description: 'Настройки профиля',
    permissions: Object.values(PERMISSIONS).filter(p => p.category === 'profile')
  },
  support: {
    name: 'Поддержка',
    description: 'Техническая поддержка',
    permissions: Object.values(PERMISSIONS).filter(p => p.category === 'support')
  },
  admin: {
    name: 'Администрирование',
    description: 'Административные функции',
    permissions: Object.values(PERMISSIONS).filter(p => p.category === 'admin')
  },
  api: {
    name: 'API',
    description: 'Программный интерфейс',
    permissions: Object.values(PERMISSIONS).filter(p => p.category === 'api')
  },
  analytics: {
    name: 'Аналитика',
    description: 'Статистика и отчёты',
    permissions: Object.values(PERMISSIONS).filter(p => p.category === 'analytics')
  }
};

// Предустановленные наборы разрешений для ролей
const userPermissions = [
  'scripts.view',
  'scripts.download',
  'marketplace.view',
  'marketplace.rate',
  'marketplace.comment',
  'profile.edit',
  'support.create_ticket'
];

const proPermissions = [
  ...userPermissions,
  'scripts.create',
  'scripts.edit_own',
  'scripts.delete_own',
  'scripts.publish',
  'visual_builder.access',
  'visual_builder.export_code',
  'profile.avatar',
  'profile.referrals',
  'support.attachments',
  'analytics.view_own'
];

const premiumPermissions = [
  ...proPermissions,
  'scripts.download_premium',
  'scripts.mark_premium',
  'visual_builder.save_to_extension',
  'visual_builder.advanced_blocks',
  'profile.custom_badge',
  'support.priority',
  'support.chat',
  'api.access',
  'api.webhooks',
  'analytics.export'
];

const moderatorPermissions = [
  ...premiumPermissions,
  'scripts.moderate',
  'scripts.edit_any',
  'admin.access',
  'admin.users.view',
  'admin.scripts.manage',
  'admin.tickets.view',
  'admin.tickets.manage',
  'marketplace.report'
];

export const ROLE_PRESETS = {
  user: userPermissions,
  pro: proPermissions,
  premium: premiumPermissions,
  moderator: moderatorPermissions,
  admin: Object.keys(PERMISSIONS) // Все разрешения
};
