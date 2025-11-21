import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  Settings, 
  User, 
  Shield, 
  Mail, 
  Key,
  FileText,
  Headphones,
  Download,
  Library,
  Users,
  Code,
  Palette,
  Bell,
  ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'settings' | 'profile' | 'scripts' | 'support' | 'docs';
  icon: React.ReactNode;
  path: string;
  keywords: string[];
}

const searchData: SearchResult[] = [
  // Настройки
  {
    id: 'change-password',
    title: 'Сменить пароль',
    description: 'Изменить пароль учётной записи',
    category: 'settings',
    icon: <Key className="h-4 w-4" />,
    path: '/lk?tab=settings',
    keywords: ['пароль', 'пороль', 'безопасность', 'смена', 'изменить', 'password', 'change']
  },
  {
    id: 'change-email',
    title: 'Сменить email',
    description: 'Изменить адрес электронной почты',
    category: 'settings',
    icon: <Mail className="h-4 w-4" />,
    path: '/lk?tab=settings',
    keywords: ['email', 'почта', 'емейл', 'имейл', 'адрес', 'изменить', 'смена']
  },
  {
    id: '2fa',
    title: 'Двухфакторная аутентификация',
    description: 'Настроить 2FA для дополнительной защиты',
    category: 'settings',
    icon: <Shield className="h-4 w-4" />,
    path: '/lk?tab=settings',
    keywords: ['2fa', '2фа', 'двухфакторная', 'аутентификация', 'безопасность', 'защита', 'otp']
  },
  {
    id: 'security',
    title: 'Безопасность',
    description: 'Настройки безопасности аккаунта',
    category: 'settings',
    icon: <Shield className="h-4 w-4" />,
    path: '/lk?tab=settings',
    keywords: ['безопасность', 'безопастность', 'security', 'защита', 'настройки']
  },
  
  // Профиль
  {
    id: 'profile',
    title: 'Профиль',
    description: 'Личная информация и настройки профиля',
    category: 'profile',
    icon: <User className="h-4 w-4" />,
    path: '/lk?tab=profile',
    keywords: ['профиль', 'профайл', 'личные данные', 'информация', 'profile', 'аватар']
  },
  {
    id: 'avatar',
    title: 'Аватар',
    description: 'Загрузить или изменить фото профиля',
    category: 'profile',
    icon: <User className="h-4 w-4" />,
    path: '/lk?tab=profile',
    keywords: ['аватар', 'фото', 'изображение', 'avatar', 'картинка', 'загрузить']
  },
  
  // Скрипты
  {
    id: 'scripts',
    title: 'Скрипты',
    description: 'Библиотека доступных скриптов',
    category: 'scripts',
    icon: <Library className="h-4 w-4" />,
    path: '/lk?tab=scripts',
    keywords: ['скрипты', 'скрипт', 'библиотека', 'scripts', 'расширения', 'extensions']
  },
  {
    id: 'installed',
    title: 'Установленные скрипты',
    description: 'Управление установленными скриптами',
    category: 'scripts',
    icon: <Download className="h-4 w-4" />,
    path: '/lk?tab=installed',
    keywords: ['установленные', 'скрипты', 'мои', 'installed', 'загруженные']
  },
  
  // Поддержка
  {
    id: 'support',
    title: 'Поддержка',
    description: 'Создать тикет или связаться с поддержкой',
    category: 'support',
    icon: <Headphones className="h-4 w-4" />,
    path: '/lk?tab=support',
    keywords: ['поддержка', 'подержка', 'support', 'помощь', 'тикет', 'ticket', 'связаться']
  },
  {
    id: 'tickets',
    title: 'Тикеты',
    description: 'Просмотр и управление тикетами',
    category: 'support',
    icon: <FileText className="h-4 w-4" />,
    path: '/lk?tab=support',
    keywords: ['тикеты', 'тикет', 'tickets', 'обращения', 'запросы']
  },
  
  // Документация
  {
    id: 'api-docs',
    title: 'API Документация',
    description: 'Документация по API',
    category: 'docs',
    icon: <Code className="h-4 w-4" />,
    path: '/lk?tab=api-docs',
    keywords: ['api', 'апи', 'документация', 'docs', 'разработка', 'integration']
  },
  
];

const categoryConfig = {
  settings: { label: 'Настройки', color: 'bg-primary/10 text-primary border border-primary/20' },
  profile: { label: 'Профиль', color: 'bg-primary/10 text-primary border border-primary/20' },
  scripts: { label: 'Скрипты', color: 'bg-primary/10 text-primary border border-primary/20' },
  support: { label: 'Поддержка', color: 'bg-primary/10 text-primary border border-primary/20' },
  docs: { label: 'Документация', color: 'bg-primary/10 text-primary border border-primary/20' }
} as const;

// Простая fuzzy search функция
const fuzzyMatch = (str: string, pattern: string): number => {
  const strLower = str.toLowerCase();
  const patternLower = pattern.toLowerCase();
  
  // Точное совпадение - максимальный приоритет
  if (strLower === patternLower) return 1000;
  
  // Начинается с паттерна - высокий приоритет
  if (strLower.startsWith(patternLower)) return 500;
  
  // Содержит паттерн - средний приоритет
  if (strLower.includes(patternLower)) return 100;
  
  // Fuzzy matching - низкий приоритет
  let score = 0;
  let patternIdx = 0;
  
  for (let i = 0; i < strLower.length && patternIdx < patternLower.length; i++) {
    if (strLower[i] === patternLower[patternIdx]) {
      score += 10;
      patternIdx++;
    }
  }
  
  // Все символы найдены
  if (patternIdx === patternLower.length) {
    return score;
  }
  
  return 0;
};

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<(SearchResult & { score: number })[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      resultRefs.current = [];
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults = searchData
      .map(item => {
        // Ищем по всем полям
        const titleScore = fuzzyMatch(item.title, query);
        const descScore = fuzzyMatch(item.description, query);
        const keywordsScore = Math.max(...item.keywords.map(k => fuzzyMatch(k, query)));
        
        const maxScore = Math.max(titleScore, descScore, keywordsScore);
        
        return { ...item, score: maxScore };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    setResults(searchResults);
    setSelectedIndex(0);
    resultRefs.current = [];
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      if (!results.length) return;
      e.preventDefault();
      setSelectedIndex(prev => {
        const nextIndex = prev >= results.length - 1 ? 0 : prev + 1;
        return nextIndex;
      });
    } else if (e.key === 'ArrowUp') {
      if (!results.length) return;
      e.preventDefault();
      setSelectedIndex(prev => {
        const nextIndex = prev <= 0 ? results.length - 1 : prev - 1;
        return nextIndex;
      });
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    const current = resultRefs.current[selectedIndex];
    if (current) {
      current.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, results.length]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-global-search bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-2xl px-4">
        <div 
          className="bg-card border border-border/60 rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Поле поиска */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border/40">
            <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Поиск настроек, функций, документации..."
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-auto p-0"
            />
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-accent rounded-md transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Результаты */}
          {results.length > 0 ? (
            <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden">
              {results.map((result, index) => {
                const categoryInfo = categoryConfig[result.category];
                const isSelected = index === selectedIndex;
                
                return (
                  <button
                    key={result.id}
                    ref={(el) => {
                      resultRefs.current[index] = el;
                    }}
                    onClick={() => handleSelect(result)}
                    className={cn(
                      "relative w-full flex items-center gap-4 px-4 py-3 text-left transition-all border-b border-border/20 last:border-0 focus:outline-none",
                      isSelected
                        ? "bg-primary/10 border-primary/40 ring-2 ring-primary/40 shadow-lg scale-[1.01] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-primary"
                        : "hover:bg-accent/30"
                    )}
                    aria-selected={index === selectedIndex}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={cn("font-medium text-sm truncate", isSelected ? "text-primary" : "text-foreground") }>
                          {result.title}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs px-2 py-0", categoryInfo.color, isSelected && "border-primary bg-primary/20 text-primary")}
                        >
                          {categoryInfo.label}
                        </Badge>
                      </div>
                      <p className={cn("text-xs truncate", isSelected ? "text-primary/80" : "text-muted-foreground") }>
                        {result.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          ) : query.trim() ? (
            <div className="px-4 py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Ничего не найдено по запросу "<span className="font-medium">{query}</span>"
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Попробуйте изменить запрос или использовать другие ключевые слова
              </p>
            </div>
          ) : (
            <div className="px-4 py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                Начните вводить для поиска
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary" className="text-xs">Настройки</Badge>
                <Badge variant="secondary" className="text-xs">Профиль</Badge>
                <Badge variant="secondary" className="text-xs">Скрипты</Badge>
                <Badge variant="secondary" className="text-xs">Поддержка</Badge>
              </div>
            </div>
          )}

          {/* Подсказки */}
          <div className="px-4 py-2 bg-muted/30 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground rounded-b-xl">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px]">↓</kbd>
                навигация
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px]">Enter</kbd>
                выбрать
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px]">Esc</kbd>
              закрыть
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
