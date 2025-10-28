import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Clock, Upload, RotateCcw, CheckCircle, FileText } from 'lucide-react';
import { API_CONFIG } from '@/config/api';

interface Version {
  id: string;
  version: string;
  changelog: string;
  is_current: boolean;
  created_at: string;
  published_at: string;
}

interface ScriptVersionManagerProps {
  scriptId: string;
  currentVersion: string;
}

export const ScriptVersionManager: React.FC<ScriptVersionManagerProps> = ({ scriptId, currentVersion }) => {
  const { toast } = useToast();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  
  const [newVersion, setNewVersion] = useState({
    version: '',
    code: '',
    description: '',
    changelog: ''
  });

  useEffect(() => {
    loadVersions();
  }, [scriptId]);

  const loadVersions = async () => {
    try {
      const token = localStorage.getItem('ebuster_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/script-versions/${scriptId}/versions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setVersions(data.data);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки версий:', error);
    }
  };

  const handlePublishVersion = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ebuster_token');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/script-versions/${scriptId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newVersion)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Версия опубликована!',
          description: `Обновление отправлено ${data.usersNotified} пользователям`,
          variant: 'success'
        });
        
        setIsPublishOpen(false);
        setNewVersion({ version: '', code: '', description: '', changelog: '' });
        loadVersions();
      } else {
        throw new Error(data.error || 'Ошибка публикации');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (versionId: string) => {
    if (!confirm('Вы уверены что хотите откатиться к этой версии?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('ebuster_token');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/script-versions/${scriptId}/versions/${versionId}/rollback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Откат выполнен',
          description: 'Версия успешно восстановлена',
          variant: 'success'
        });
        loadVersions();
      } else {
        throw new Error(data.error || 'Ошибка отката');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка публикации */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Версии скрипта</h3>
          <p className="text-sm text-muted-foreground">Текущая версия: {currentVersion}</p>
        </div>
        
        <Dialog open={isPublishOpen} onOpenChange={setIsPublishOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Опубликовать новую версию
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Публикация новой версии</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Номер версии</Label>
                <Input
                  placeholder="1.1.0"
                  value={newVersion.version}
                  onChange={(e) => setNewVersion({ ...newVersion, version: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Код скрипта</Label>
                <Textarea
                  placeholder="// Код скрипта..."
                  value={newVersion.code}
                  onChange={(e) => setNewVersion({ ...newVersion, code: e.target.value })}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              
              <div>
                <Label>Описание</Label>
                <Input
                  placeholder="Краткое описание изменений"
                  value={newVersion.description}
                  onChange={(e) => setNewVersion({ ...newVersion, description: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Changelog</Label>
                <Textarea
                  placeholder="- Исправлен баг X&#10;- Добавлена функция Y&#10;- Улучшена производительность"
                  value={newVersion.changelog}
                  onChange={(e) => setNewVersion({ ...newVersion, changelog: e.target.value })}
                  rows={5}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsPublishOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handlePublishVersion} disabled={loading}>
                  {loading ? 'Публикация...' : 'Опубликовать и отправить всем'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Список версий */}
      <div className="space-y-3">
        {versions.map((version) => (
          <Card key={version.id} className={version.is_current ? 'border-primary' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Версия {version.version}</h4>
                    {version.is_current && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Текущая
                      </Badge>
                    )}
                  </div>
                  
                  {version.changelog && (
                    <div className="mb-2">
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {version.changelog}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(version.published_at || version.created_at).toLocaleString('ru-RU')}
                    </span>
                  </div>
                </div>
                
                {!version.is_current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRollback(version.id)}
                    disabled={loading}
                    className="flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Откатить
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {versions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Версии пока не созданы</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
