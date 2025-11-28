import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Download, 
  Star, 
  Eye, 
  Search, 
  Filter,
  Tag,
  User,
  Calendar,
  Code,
  FileText,
  Crown,
  Zap,
  History
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import StarRating from './StarRating';
import RatingModal from './RatingModal';
import { useToast } from '../hooks/use-toast';
import { API_CONFIG } from '@/config/api';
import { ScriptChangelog } from '@/lk/ScriptChangelog';
import { ScriptCard } from './ScriptCard';

interface Script {
  id: string;
  title: string;
  description: string;
  code: string;
  category: string;
  tags: string[];
  author_name: string;
  version: string;
  status: 'draft' | 'published' | 'archived' | 'banned';
  is_featured: boolean;
  is_premium: boolean;
  downloads_count: number;
  rating: number;
  rating_count: number;
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  icon_url?: string | null;
  icon?: string;
}

const ScriptsList: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [installedScriptIds, setInstalledScriptIds] = useState<Set<string>>(new Set());
  const [ratedScriptIds, setRatedScriptIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isChangelogDialogOpen, setIsChangelogDialogOpen] = useState(false);
  const [changelogScript, setChangelogScript] = useState<{ id: string; name: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Загрузка скриптов
  const loadScripts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        status: 'published',
        sort: sortBy,
        order: sortOrder
      });

      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);

      const token = localStorage.getItem('ebuster_token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/public?${params}`, {
        headers
      });
      const data = await response.json();
      
      if (data.success) {
        setScripts(data.data.scripts || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки скриптов:', error);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка установленных скриптов
  const loadInstalledScripts = async () => {
    try {
      const token = localStorage.getItem('ebuster_token');
      if (!token) return;
      
      const response = await fetch('https://api.ebuster.ru/api/scripts/user/installed', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          let installedScripts = data.data.map((item: any) => String(item.script_id));
          
          // Проверяем наличие скриптов в расширении
          if ((window as any).EbusterBridge) {
            try {
              const extensionScripts = await new Promise<any[]>((resolve) => {
                (window as any).EbusterBridge.sendMessage(
                  { action: 'GET_INSTALLED_SCRIPTS' },
                  (response: any, error: any) => {
                    if (error) {
                      console.error('❌ [loadInstalledScripts] Ошибка получения скриптов:', error);
                      resolve([]);
                    } else {
                      resolve(Array.isArray(response) ? response : []);
                    }
                  }
                );
              });
              console.log('📦 [loadInstalledScripts] Скрипты в расширении:', extensionScripts);
              
              // Оставляем только те скрипты, которые есть в расширении с source="Установлено с сайта"
              const validScripts = installedScripts.filter((id: string) => 
                extensionScripts.some((s: any) => 
                  s.id === id && s.source === 'Установлено с сайта'
                )
              );
              
              if (validScripts.length !== installedScripts.length) {
                console.log('⚠️ [loadInstalledScripts] Расхождение! На сервере:', installedScripts.length, 'В расширении:', validScripts.length);
                
                // Синхронизируем с сервером
                await fetch('https://api.ebuster.ru/api/scripts/user/sync', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    scriptIds: extensionScripts
                      .filter((s: any) => s.source === 'Установлено с сайта')
                      .map((s: any) => s.id)
                  })
                });
                
                installedScripts = validScripts;
              }
            } catch (error) {
              console.error('❌ [loadInstalledScripts] Ошибка проверки расширения:', error);
            }
          }
          
          const ids = new Set<string>(installedScripts);
          setInstalledScriptIds(ids);
        }
      }
    } catch (error) {
      console.error('Failed to load installed scripts:', error);
    }
  };

  // Загрузка оцененных скриптов
  const loadRatedScripts = async () => {
    try {
      const token = localStorage.getItem('ebuster_token');
      if (!token) return;
      
      // Загружаем все скрипты и проверяем, какие из них оценены пользователем
      const ratedIds = new Set<string>();
      
      for (const script of scripts) {
        try {
          const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/public/${script.id}/ratings`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            // Проверяем, есть ли оценка от текущего пользователя
            if (data.success && data.data && data.data.length > 0) {
              ratedIds.add(script.id);
            }
          }
        } catch (error) {
          console.error(`Failed to check rating for script ${script.id}:`, error);
        }
      }
      
      setRatedScriptIds(ratedIds);
    } catch (error) {
      console.error('Failed to load rated scripts:', error);
    }
  };

  useEffect(() => {
    loadScripts();
    loadInstalledScripts();
  }, [categoryFilter, sortBy, sortOrder]); // Убрали searchTerm - фильтрация локальная
  
  // Загружаем оцененные скрипты после загрузки списка скриптов
  useEffect(() => {
    if (scripts.length > 0) {
      loadRatedScripts();
    }
  }, [scripts]);

  // Слушатель событий от расширения для синхронизации
  useEffect(() => {
    const handleExtensionSync = async (event: MessageEvent) => {
      if (event.data?.type === 'EBUSTER_SCRIPT_UNINSTALLED') {
        const { scriptId } = event.data;
        console.log('🗑️ Получено событие удаления скрипта:', scriptId);
        
        // Удаляем из локального состояния
        setInstalledScriptIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(scriptId);
          return newSet;
        });
        
        // Удаляем на сервере
        try {
          const token = localStorage.getItem('ebuster_token');
          if (token) {
            await fetch(`${API_CONFIG.SCRIPTS_URL}/user/uninstall/${scriptId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            console.log('✅ Скрипт удален на сервере');
          }
        } catch (error) {
          console.error('❌ Ошибка удаления скрипта на сервере:', error);
        }
        
        // Перезагружаем список
        loadInstalledScripts();
      }
    };

    window.addEventListener('message', handleExtensionSync);
    return () => window.removeEventListener('message', handleExtensionSync);
  }, []);

  // Проверка наличия расширения Ebuster
  const checkExtensionInstalled = (): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log('🔍 [checkExtensionInstalled] Начинаем проверку расширения...');
      
      // Функция для проверки Bridge с повторными попытками
      const checkBridge = (attempts = 0) => {
        console.log(`🔍 [checkExtensionInstalled] Попытка ${attempts + 1}/10`);
        
        // Проверяем, загружен ли content script
        console.log('🔍 [checkExtensionInstalled] window.ebusterContentScriptLoaded =', (window as any).ebusterContentScriptLoaded);
        if ((window as any).ebusterContentScriptLoaded) {
          console.log('✅ [checkExtensionInstalled] Content script загружен');
        } else {
          console.log('❌ [checkExtensionInstalled] Content script не загружен');
        }
        
        // Проверяем наличие Ebuster Bridge
        console.log('🔍 [checkExtensionInstalled] window.EbusterBridge =', (window as any).EbusterBridge);
        console.log('🔍 [checkExtensionInstalled] typeof window.EbusterBridge =', typeof (window as any).EbusterBridge);
        
        if (typeof (window as any).EbusterBridge !== 'undefined') {
          console.log('✅ [checkExtensionInstalled] Ebuster Bridge найден, проверяем расширение...');
          
          // Используем Ebuster Bridge для проверки расширения
          (window as any).EbusterBridge.sendMessage({ action: 'ping' }, (response: any, error: any) => {
            if (error) {
              console.log('❌ [checkExtensionInstalled] Расширение недоступно:', error);
              resolve(false);
            } else {
              console.log('✅ [checkExtensionInstalled] Расширение Ebuster доступно через Bridge');
              (window as any).ebusterExtensionId = 'bridge'; // Используем bridge для связи
              resolve(true);
            }
          });
        } else {
          console.log('❌ [checkExtensionInstalled] Ebuster Bridge не найден');
          
          // Если Bridge не найден, пробуем еще раз через 100мс
          if (attempts < 9) {
            console.log('🔄 [checkExtensionInstalled] Повторяем попытку через 100мс...');
            setTimeout(() => checkBridge(attempts + 1), 100);
          } else {
            console.log('❌ [checkExtensionInstalled] Превышено максимальное количество попыток');
            resolve(false);
          }
        }
      };
      
      // Начинаем проверку
      checkBridge();
    });
  };

  // Установка скрипта в расширение
  const installScriptInExtension = async (scriptData: any): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log('🔧 [installScriptInExtension] Начинаем установку скрипта:', scriptData.title);
      
      // Используем Ebuster Bridge для установки скрипта
      const scriptInstallData = {
        action: 'installScript',
        name: scriptData.title,
        code: scriptData.code,
        url: window.location.href,
        timestamp: Date.now(),
        script_id: scriptData.id  // ВАЖНО! ID скрипта из БД для синхронизации
      };
      
      if (typeof (window as any).EbusterBridge !== 'undefined') {
        console.log('🔍 [installScriptInExtension] Используем Ebuster Bridge для установки скрипта');
        
        (window as any).EbusterBridge.sendMessage(scriptInstallData, (response: any, error: any) => {
          if (error) {
            console.log('❌ [installScriptInExtension] Ошибка установки через Bridge:', error);
            // Fallback на localStorage
            localStorage.setItem('ebuster_script_install', JSON.stringify(scriptInstallData));
            console.log('📦 [installScriptInExtension] Используем localStorage как fallback');
            
            toast({
              title: t('header.dashboard.scripts.installInstructions') || 'Инструкции по установке',
              description: t('header.dashboard.scripts.installInstructionsDesc') || 'Откройте расширение Ebuster для завершения установки скрипта',
              variant: 'info'
            });
          } else {
            console.log('✅ [installScriptInExtension] Скрипт установлен через Bridge');
            
            toast({
              title: t('header.dashboard.scripts.installSuccess') || 'Скрипт установлен!',
              description: t('header.dashboard.scripts.installSuccessDesc') || 'Скрипт успешно установлен в расширение Ebuster',
              variant: 'success'
            });
          }
          resolve(true);
        });
      } else {
        console.log('❌ [installScriptInExtension] Ebuster Bridge не найден, используем localStorage');
        localStorage.setItem('ebuster_script_install', JSON.stringify(scriptInstallData));
        
        toast({
          title: t('header.dashboard.scripts.installInstructions') || 'Инструкции по установке',
          description: t('header.dashboard.scripts.installInstructionsDesc') || 'Откройте расширение Ebuster для завершения установки скрипта',
          variant: 'info'
        });
        
        resolve(true);
      }
    });
  };

  // Загрузка/установка скрипта
  const handleDownloadScript = async (scriptId: string) => {
    try {
      const token = localStorage.getItem('ebuster_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/public/${scriptId}/download`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}) // Убираем user_id, так как он теперь получается из токена
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ [handleDownloadScript] Скрипт получен, проверяем расширение...');
        // Проверяем наличие расширения
        const extensionInstalled = await checkExtensionInstalled();
        console.log('🔍 [handleDownloadScript] Расширение установлено:', extensionInstalled);
        
        if (extensionInstalled) {
          // Устанавливаем в расширение
          const installSuccess = await installScriptInExtension(data.data);
          
          if (installSuccess) {
            // Сохраняем установку на сервере
            try {
              const installToken = localStorage.getItem('ebuster_token');
              const installResponse = await fetch(`${API_CONFIG.SCRIPTS_URL}/user/install/${scriptId}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${installToken}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (installResponse.ok) {
                console.log('✅ Установка сохранена на сервере');
              } else {
                console.error('❌ Ошибка сохранения установки на сервере');
              }
            } catch (error) {
              console.error('❌ Ошибка API сохранения установки:', error);
            }
            
            // Добавляем скрипт в список установленных
            setInstalledScriptIds(prev => new Set(prev).add(scriptId));
            
            // Показываем уведомление об успешной установке
            console.log('✅ Скрипт успешно установлен в расширение');
            toast({
              title: t('header.dashboard.scripts.installSuccess') || 'Скрипт установлен!',
              description: t('header.dashboard.scripts.installSuccessDesc') || 'Скрипт успешно установлен в расширение Ebuster',
              variant: 'success'
            });
            
            // Отправляем событие установки на сайт (для Dashboard)
            window.postMessage({
              type: 'EBUSTER_SCRIPT_INSTALLED',
              scriptId: scriptId
            }, '*');
            
            // Перезагружаем список установленных скриптов с небольшой задержкой
            // чтобы дать серверу время обновить данные
            setTimeout(() => {
              console.log('🔄 Обновляем список установленных скриптов...');
              loadInstalledScripts();
            }, 500);
          } else {
            console.error('❌ Ошибка установки в расширение');
            toast({
              title: t('header.dashboard.scripts.installError') || 'Ошибка установки',
              description: t('header.dashboard.scripts.installErrorDesc') || 'Ошибка установки в расширение. Скачиваем файл.',
              variant: 'destructive'
            });
            // Fallback: скачиваем файл
            downloadScriptFile(data.data);
          }
        } else {
          // Расширение не установлено, скачиваем файл
          console.log('📥 Расширение не найдено, скачиваем файл');
          toast({
            title: t('header.dashboard.scripts.extensionNotFound') || 'Расширение не найдено',
            description: t('header.dashboard.scripts.extensionNotFoundDesc') || 'Установите расширение Ebuster для автоматической установки скриптов',
            variant: 'warning'
          });
          downloadScriptFile(data.data);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки скрипта:', error);
    }
  };

  // Скачивание файла скрипта (fallback)
  const downloadScriptFile = (scriptData: any) => {
    const blob = new Blob([scriptData.code], { type: 'text/javascript' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scriptData.title}.js`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Тестовая функция для проверки расширения
  const testExtensionConnection = async () => {
    console.log('🧪 [testExtensionConnection] Тестируем подключение к расширению...');
    const isInstalled = await checkExtensionInstalled();
    
    if (isInstalled) {
      toast({
        title: '✅ Расширение найдено!',
        description: `ID: ${(window as any).ebusterExtensionId}`,
        variant: 'success'
      });
    } else {
      toast({
        title: '❌ Расширение не найдено',
        description: 'Установите расширение Ebuster для автоматической установки скриптов',
        variant: 'destructive'
      });
    }
  };

  // Просмотр скрипта
  const handleViewScript = (script: Script) => {
    setSelectedScript(script);
    setIsViewDialogOpen(true);
  };

  // Открытие модального окна оценки
  const handleRateScript = (script: Script) => {
    setSelectedScript(script);
    setIsRatingModalOpen(true);
  };

  // Отправка оценки
  const handleRatingSubmit = async (rating: number, review: string) => {
    if (!selectedScript) return;

    try {
      const token = localStorage.getItem('ebuster_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/public/${selectedScript.id}/rate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          rating,
          review: review.trim() || null
        }),
      });

      if (response.ok) {
        // Обновляем список скриптов для обновления рейтинга
        loadScripts();
        console.log('Оценка отправлена успешно');
      } else {
        const errorData = await response.json();
        console.error('Ошибка отправки оценки:', errorData.error);
        throw new Error(errorData.error);
      }
    } catch (error) {
      console.error('Ошибка отправки оценки:', error);
      throw error;
    }
  };

  // Фильтрация скриптов
  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !categoryFilter || categoryFilter === '' || categoryFilter === 'all' || script.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Получение цвета категории - единый стиль
  const getCategoryColor = (category: string) => {
    // Используем единый стиль для всех категорий
    return 'bg-muted text-muted-foreground';
  };

  // Форматирование размера файла
  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 rounded-xl border border-white/10 bg-white/[0.02]">
        <div className=" w-full h-full flex items-center justify-center">
        <div className="text-lg text-white">{t('header.dashboard.scripts.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-2xl font-bold text-white mb-2">{t('header.dashboard.scripts.title')}</h2>
        <p className="text-sm text-white/60">{t('header.dashboard.scripts.description')}</p>
      </div>

      {/* Фильтры и поиск */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                placeholder={t('header.dashboard.scripts.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-white focus:ring-0 rounded-xl"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 bg-white/5 border-white/15 text-white rounded-xl">
              <SelectValue placeholder={t('header.dashboard.scripts.allCategories')} />
            </SelectTrigger>
              <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10 text-white rounded-xl">
              <SelectItem value="all">{t('header.dashboard.scripts.allCategories')}</SelectItem>
              <SelectItem value="ui">UI</SelectItem>
              <SelectItem value="privacy">Privacy</SelectItem>
              <SelectItem value="productivity">Productivity</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 bg-white/5 border-white/15 text-white rounded-xl">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
              <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10 text-white rounded-xl">
              <SelectItem value="created_at">По дате</SelectItem>
              <SelectItem value="downloads_count">По загрузкам</SelectItem>
              <SelectItem value="rating">По рейтингу</SelectItem>
              <SelectItem value="title">По названию</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-32 bg-white/5 border-white/15 text-white rounded-xl">
              <SelectValue />
            </SelectTrigger>
              <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10 text-white rounded-xl">
              <SelectItem value="desc">↓ Убывание</SelectItem>
              <SelectItem value="asc">↑ Возрастание</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Список скриптов */}
      <div className="grid grid-cols-1 gap-4">
        {filteredScripts.map((script) => (
          <div
            key={script.id}
            className="rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors p-6"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                  {script.icon_url ? (
                    <img src={script.icon_url} alt={script.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">{script.icon || '⚡'}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-white line-clamp-1">
                      {script.title}
                    </h3>
                    {script.is_featured && (
                        <Badge className="text-xs font-medium bg-yellow-500/10 text-yellow-400 border-yellow-500/20 rounded-lg">
                        <Crown className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {script.is_premium && (
                        <Badge className="text-xs font-medium bg-purple-500/10 text-purple-400 border-purple-500/20 rounded-lg">
                        <Zap className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>

                    <p className="text-sm text-white/60 line-clamp-2">
                    {script.description || t('header.dashboard.scripts.descriptionPlaceholder')}
                  </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
                      <Badge className="bg-white/5 text-white/70 border-white/10 text-xs px-2 py-0.5 rounded-lg">
                      {script.category}
                    </Badge>
                    <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium text-white">{(script.rating ?? 0).toFixed(1)}</span>
                        <span className="text-white/40">({script.rating_count ?? 0})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {script.downloads_count.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {script.author_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {formatFileSize(script.file_size)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
                  onClick={() => {
                    setChangelogScript({ id: script.id, name: script.title });
                    setIsChangelogDialogOpen(true);
                  }}
                >
                  <History className="h-4 w-4 mr-2" />
                  История
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
                  onClick={() => handleRateScript(script)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  {ratedScriptIds.has(script.id) ? 'Изменить' : 'Оценить'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
                  onClick={() => handleViewScript(script)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Просмотр
                </Button>
                <Button
                  size="sm"
                  disabled={installedScriptIds.has(script.id)}
                    className="bg-white text-black hover:bg-white/90 disabled:bg-white/5 disabled:text-white/40 disabled:border-white/10 rounded-xl"
                  onClick={() => handleDownloadScript(script.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {installedScriptIds.has(script.id) ? 'Установлен' : 'Установить'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Пустое состояние */}
      {filteredScripts.length === 0 && !loading && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-12 text-center">
          <Code className="h-12 w-12 mx-auto mb-4 text-white/60" />
          <h3 className="text-lg font-semibold mb-2 text-white">{t('header.dashboard.scripts.notFound')}</h3>
          <p className="text-white/60">
            {t('header.dashboard.scripts.notFoundDescription')}
          </p>
        </div>
      )}

      {/* Диалог просмотра скрипта */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              {selectedScript?.title}
              {selectedScript?.is_featured && (
                <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                  <Zap className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {selectedScript?.is_premium && (
                <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedScript && (
            <div className="space-y-6">
              {/* Информация о скрипте */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide">Описание</label>
                  <p className="text-sm text-[#a3a3a3] mt-1">
                    {selectedScript.description}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide">Автор</label>
                  <p className="text-sm text-white mt-1">
                    {selectedScript.author_name}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide">Версия</label>
                  <p className="text-sm text-white mt-1 font-mono">
                    {selectedScript.version}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide">Размер</label>
                  <p className="text-sm text-white mt-1">
                    {formatFileSize(selectedScript.file_size)}
                  </p>
                </div>
              </div>

              {/* Теги */}
              {selectedScript.tags.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">Теги</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedScript.tags.map((tag, index) => (
                      <Badge key={index} className="bg-[#2d2d2d] text-[#a3a3a3] border-[#404040]">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Код скрипта */}
              <div>
                <label className="text-xs font-semibold text-[#808080] uppercase tracking-wide mb-2 block">Код скрипта</label>
                <pre className="bg-[#111111] border border-[#2d2d2d] p-4 rounded-md text-sm overflow-x-auto max-h-96 text-[#d4d4d4] font-mono">
                  {selectedScript.code}
                </pre>
              </div>

              {/* Кнопка загрузки */}
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleDownloadScript(selectedScript.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('header.dashboard.scripts.downloadScript')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Модальное окно оценки */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        scriptId={selectedScript?.id || ''}
        scriptTitle={selectedScript?.title || ''}
        onRatingSubmit={handleRatingSubmit}
      />

      {/* Диалог истории версий */}
      {changelogScript && (
        <ScriptChangelog
          isOpen={isChangelogDialogOpen}
          onClose={() => {
            setIsChangelogDialogOpen(false);
            setChangelogScript(null);
          }}
          scriptId={changelogScript.id}
          scriptName={changelogScript.name}
        />
      )}
    </div>
  );
};

export default ScriptsList;
