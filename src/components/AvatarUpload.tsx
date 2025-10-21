import { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { API_CONFIG } from '@/config/api';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/CustomAuthContext";
import { useLanguage } from "@/hooks/useLanguage";

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload?: (file: File) => void;
  onRemove?: () => void;
  onAvatarUpdate?: (avatarUrl: string) => void;
}

export const AvatarUpload = ({ currentAvatar, onUpload, onRemove, onAvatarUpdate }: AvatarUploadProps) => {
  const [preview, setPreview] = useState<string | undefined>(currentAvatar);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Обновляем preview при изменении currentAvatar извне
  useEffect(() => {
    setPreview(currentAvatar);
  }, [currentAvatar]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверяем размер файла (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Ошибка загрузки",
        description: "Размер файла не должен превышать 5MB",
        variant: "destructive"
      });
      return;
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ошибка загрузки",
        description: "Пожалуйста, выберите изображение",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Создаем FormData для отправки файла
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('email', user?.email || '');

      const response = await fetch(`${API_CONFIG.USER_URL}/upload-avatar`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Обновляем превью
        setPreview(data.data.avatar_url);
        
        // Уведомляем родительский компонент
        if (onAvatarUpdate) {
          onAvatarUpdate(data.data.avatar_url);
        }

        toast({
          title: "Аватар обновлен",
          description: "Изображение успешно загружено",
          variant: "success"
        });
      } else {
        throw new Error(data.error || 'Ошибка загрузки');
      }
    } catch (error) {
      toast({
        title: "Ошибка загрузки",
        description: error instanceof Error ? error.message : "Не удалось загрузить изображение",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }

    // Вызываем оригинальный callback если есть
    if (onUpload) {
      onUpload(file);
    }
  };

  const handleRemove = async () => {
    try {
      setUploading(true);

      // Отправляем запрос на удаление аватара
      const response = await fetch(`${API_CONFIG.USER_URL}/remove-avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user?.email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Очищаем локальное состояние
        setPreview(undefined);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Уведомляем родительский компонент
        if (onAvatarUpdate) {
          onAvatarUpdate('/api/placeholder/40/40');
        }

        toast({
          title: "Аватар удален",
          description: "Изображение успешно удалено",
          variant: "success"
        });
      } else {
        throw new Error(data.error || 'Ошибка удаления');
      }
    } catch (error) {
      toast({
        title: "Ошибка удаления",
        description: error instanceof Error ? error.message : "Не удалось удалить аватар",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }

    // Вызываем оригинальный callback если есть
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className="glass-effect rounded-lg p-6 max-w-md">
      <h3 className="text-lg font-semibold mb-4">{t('header.dashboard.profile.photo')}</h3>
      
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border-2 border-border">
          <AvatarImage src={preview} alt="Profile" />
          <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
            {preview ? "" : "?"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="avatar-upload"
          />
          
          <label htmlFor="avatar-upload">
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full" 
              disabled={uploading}
              asChild
            >
              <span className="cursor-pointer">
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {uploading ? t('header.dashboard.profile.uploading') : t('header.dashboard.profile.uploadImage')}
              </span>
            </Button>
          </label>

          {preview && preview !== '/api/placeholder/40/40' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              {t('header.dashboard.profile.remove')}
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        {t('header.dashboard.profile.recommendation')}
      </p>
    </div>
  );
};
