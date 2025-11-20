import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Download, 
  Star, 
  Eye, 
  Crown, 
  Zap,
  Lock,
  TrendingUp,
  Code,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScriptCardProps {
  script: {
    id: string;
    title: string;
    description: string;
    category: string;
    author_name: string;
    downloads_count: number;
    rating: number;
    rating_count: number;
    is_featured: boolean;
    is_premium: boolean;
    file_size: number;
    access?: {
      hasAccess: boolean;
      reason?: string;
      requiredRole?: any;
    };
  };
  onView: () => void;
  onDownload: () => void;
}

export function ScriptCard({ script, onView, onDownload }: ScriptCardProps) {
  const hasAccess = script.access?.hasAccess !== false;
  
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1",
        script.is_featured && "border-2 border-yellow-400",
        script.is_premium && "border-2 border-purple-400"
      )}
    >
      {/* Градиентный фон */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Бейджи сверху */}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        {script.is_featured && (
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
            <Crown className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
        {script.is_premium && (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
            <Zap className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        )}
      </div>

      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Иконка категории */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <Code className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
              {script.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="truncate">{script.author_name}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Описание */}
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {script.description}
        </p>

        {/* Категория */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-medium">
            {script.category}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {(script.file_size / 1024).toFixed(2)} KB
          </span>
        </div>

        {/* Статистика */}
        <div className="flex items-center justify-between py-3 border-t border-border/50">
          <div className="flex items-center gap-4">
            {/* Рейтинг */}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-sm">
                {(script.rating ?? 0).toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({script.rating_count ?? 0})
              </span>
            </div>
            
            {/* Загрузки */}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">
                {script.downloads_count}
              </span>
            </div>
          </div>

          {/* Trending indicator */}
          {script.downloads_count > 100 && (
            <div className="flex items-center gap-1 text-green-500">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Hot</span>
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onView}
          >
            <Eye className="h-4 w-4 mr-2" />
            Просмотр
          </Button>
          
          {hasAccess ? (
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              onClick={onDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Скачать
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              className="flex-1"
              onClick={() => window.location.href = '/pricing'}
            >
              <Lock className="h-4 w-4 mr-2" />
              Подписка
            </Button>
          )}
        </div>

        {/* Блокировка для премиум скриптов */}
        {!hasAccess && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center rounded-lg">
            <div className="text-center p-6">
              <Lock className="h-12 w-12 mx-auto mb-3 text-white" />
              <p className="text-white font-semibold mb-2">
                {script.access?.reason}
              </p>
              {script.access?.requiredRole && (
                <>
                  <Badge variant="secondary" className="mb-3 text-base py-1 px-3">
                    {script.access.requiredRole.display_name}
                  </Badge>
                  <Button 
                    size="sm" 
                    className="bg-white text-black hover:bg-gray-100"
                    onClick={() => window.location.href = '/pricing'}
                  >
                    Оформить подписку
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
