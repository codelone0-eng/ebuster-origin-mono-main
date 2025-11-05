import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, FileText } from 'lucide-react';
import { API_CONFIG } from '@/config/api';

interface Version {
  version: string;
  changelog: string;
  created_at: string;
  published_at: string;
}

interface ScriptChangelogProps {
  scriptId: string;
  scriptName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ScriptChangelog: React.FC<ScriptChangelogProps> = ({ 
  scriptId, 
  scriptName, 
  isOpen, 
  onClose 
}) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && scriptId) {
      loadChangelog();
    }
  }, [isOpen, scriptId]);

  const loadChangelog = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/script-versions/${scriptId}/versions`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setVersions(data.data);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки changelog:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>История версий: {scriptName}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Загрузка...
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Пока нет обновлений</p>
              <p className="text-sm text-muted-foreground">Это первая версия скрипта. История изменений появится после первого обновления.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div 
                  key={version.version} 
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={index === 0 ? "default" : "outline"}>
                      v{version.version}
                    </Badge>
                    {index === 0 && (
                      <Badge variant="secondary">Последняя</Badge>
                    )}
                  </div>
                  
                  {version.changelog ? (
                    <div className="mb-3">
                      <p className="text-sm whitespace-pre-line">
                        {version.changelog}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-3">
                      Описание изменений отсутствует
                    </p>
                  )}
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(version.published_at || version.created_at).toLocaleString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
