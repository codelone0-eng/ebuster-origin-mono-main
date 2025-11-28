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
      <DialogContent className="max-w-2xl max-h-[80vh] rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl text-white">
        <DialogHeader>
          <DialogTitle className="text-white">История версий: {scriptName}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="text-center py-8 text-white/60">
              Загрузка...
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-white/40" />
              <p className="text-lg font-medium mb-2 text-white">Пока нет обновлений</p>
              <p className="text-sm text-white/60">Это первая версия скрипта. История изменений появится после первого обновления.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div 
                  key={version.version} 
                  className="border border-white/10 rounded-xl p-4 bg-white/5 hover:bg-white/10 transition-colors"
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
                      <p className="text-sm whitespace-pre-line text-white/80">
                        {version.changelog}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-white/60 mb-3">
                      Описание изменений отсутствует
                    </p>
                  )}
                  
                  <div className="flex items-center gap-1 text-xs text-white/60">
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
