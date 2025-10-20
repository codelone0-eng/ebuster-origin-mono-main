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
  Zap
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import StarRating from './StarRating';
import RatingModal from './RatingModal';
import { useToast } from '../hooks/use-toast';

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
}

const ScriptsList: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
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
      if (categoryFilter) params.append('category', categoryFilter);

      const token = localStorage.getItem('jwt_token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:3001/api/scripts/public?${params}`, {
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

  useEffect(() => {
    loadScripts();
  }, [searchTerm, categoryFilter, sortBy, sortOrder]);

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
        timestamp: Date.now()
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
      const token = localStorage.getItem('jwt_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:3001/api/scripts/public/${scriptId}/download`, {
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
            // Показываем уведомление об успешной установке
            console.log('✅ Скрипт успешно установлен в расширение');
            toast({
              title: t('header.dashboard.scripts.installSuccess') || 'Скрипт установлен!',
              description: t('header.dashboard.scripts.installSuccessDesc') || 'Скрипт успешно установлен в расширение Ebuster',
              variant: 'success'
            });
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
      const token = localStorage.getItem('jwt_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:3001/api/scripts/public/${selectedScript.id}/rate`, {
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
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || script.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Получение цвета категории - единый стиль
  const getCategoryColor = (category: string) => {
    // Используем единый стиль для всех категорий
    return 'bg-muted text-muted-foreground';
  };

  // Форматирование размера файла
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t('header.dashboard.scripts.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h2 className="text-2xl font-bold">{t('header.dashboard.scripts.title')}</h2>
        <p className="text-muted-foreground">{t('header.dashboard.scripts.description')}</p>
      </div>

      {/* Фильтры и поиск */}
      <Card className="bg-card/50 backdrop-blur-sm border border-border/30">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('header.dashboard.scripts.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('header.dashboard.scripts.allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('header.dashboard.scripts.allCategories')}</SelectItem>
                <SelectItem value="ui">UI</SelectItem>
                <SelectItem value="privacy">Privacy</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">По дате</SelectItem>
                <SelectItem value="downloads_count">По загрузкам</SelectItem>
                <SelectItem value="rating">По рейтингу</SelectItem>
                <SelectItem value="title">По названию</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">↓ Убывание</SelectItem>
                <SelectItem value="asc">↑ Возрастание</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Список скриптов */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredScripts.map((script) => (
          <Card key={script.id} className="bg-card/50 backdrop-blur-sm border border-border/30 hover:border-border/50 transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg line-clamp-1">{script.title}</CardTitle>
                    {script.is_featured && (
                      <Badge variant="secondary">
                        <Zap className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {script.is_premium && (
                      <Badge variant="outline">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {script.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Категория и теги */}
                <div className="flex gap-2">
                  <Badge className={getCategoryColor(script.category)}>
                    {script.category}
                  </Badge>
                  {script.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {script.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{script.tags.length - 2}
                    </Badge>
                  )}
                </div>

                {/* Статистика */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {script.downloads_count.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <StarRating 
                        rating={script.rating} 
                        size="sm" 
                        showValue={true}
                        interactive={false}
                      />
                      <span className="text-xs text-muted-foreground">
                        ({script.rating_count})
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {formatFileSize(script.file_size)}
                    </span>
                  </div>
                </div>

                {/* Автор и дата */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {script.author_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(script.published_at || script.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Кнопки действий */}
                <div className="flex gap-2 pt-2">
                  {/* Убираем кнопку просмотра кода для опубликованных скриптов */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRateScript(script)}
                    className="flex-1"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Оценить
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDownloadScript(script.id)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t('header.dashboard.scripts.install')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Пустое состояние */}
      {filteredScripts.length === 0 && !loading && (
        <Card className="bg-card/50 backdrop-blur-sm border border-border/30">
          <CardContent className="p-8 text-center">
            <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t('header.dashboard.scripts.notFound')}</h3>
            <p className="text-muted-foreground">
              {t('header.dashboard.scripts.notFoundDescription')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Диалог просмотра скрипта */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedScript?.title}
              {selectedScript?.is_featured && (
                <Badge variant="secondary">
                  <Zap className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {selectedScript?.is_premium && (
                <Badge variant="outline">
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
                  <label className="text-sm font-medium">Описание</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedScript.description}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Автор</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedScript.author_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Версия</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedScript.version}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Размер</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatFileSize(selectedScript.file_size)}
                  </p>
                </div>
              </div>

              {/* Теги */}
              {selectedScript.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Теги</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedScript.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Код скрипта */}
              <div>
                <label className="text-sm font-medium">Код скрипта</label>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto mt-1 max-h-96">
                  {selectedScript.code}
                </pre>
              </div>

              {/* Кнопка загрузки */}
              <div className="flex justify-end">
                <Button onClick={() => handleDownloadScript(selectedScript.id)}>
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
    </div>
  );
};

export default ScriptsList;
