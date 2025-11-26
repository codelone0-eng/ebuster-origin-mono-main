import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Key, Copy, Trash2, Plus, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/config/api';

interface ApiKey {
  id: string;
  key_name: string;
  api_key: string;
  permissions: string[];
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export function ApiKeysManagement() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadKeys = async () => {
    try {
      const token = localStorage.getItem('ebuster_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/user/api-keys`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setKeys(data.data);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить API ключи',
        variant: 'destructive'
      });
    }
  };

  const createKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название ключа',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('ebuster_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          key_name: newKeyName,
          permissions: ['scripts.read', 'scripts.download']
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setNewKeyValue(data.data.api_key);
        setShowNewKey(true);
        setNewKeyName('');
        loadKeys();
        toast({
          title: 'Успешно',
          description: 'API ключ создан'
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать ключ',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать API ключ',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteKey = async (id: string) => {
    if (!confirm('Удалить API ключ? Это действие нельзя отменить.')) return;
    
    try {
      const token = localStorage.getItem('ebuster_token');
      await fetch(`${API_CONFIG.BASE_URL}/api/user/api-keys/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      loadKeys();
      toast({
        title: 'Успешно',
        description: 'API ключ удален'
      });
    } catch (error) {
      console.error('Failed to delete API key:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить ключ',
        variant: 'destructive'
      });
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: 'Скопировано!',
      description: 'API ключ скопирован в буфер обмена'
    });
  };

  useEffect(() => {
    loadKeys();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Key className="h-5 w-5" />
            Создать новый API ключ
          </h3>
          <div className="space-y-4 mt-4">
          <div className="flex gap-2">
            <div className="flex-1">
                <Label htmlFor="keyName" className="text-white/60">Название ключа</Label>
              <Input
                id="keyName"
                placeholder="Мое приложение"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createKey()}
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-white focus:ring-0 rounded-xl mt-2"
              />
            </div>
            <div className="flex items-end">
                <Button onClick={createKey} disabled={loading} className="bg-white text-black hover:bg-white/90 rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Создать
              </Button>
            </div>
          </div>
          
          {showNewKey && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                    Сохраните ключ — после закрытия блока он больше не будет доступен.
                  </p>
                    <p className="text-xs text-white/60">
                    Скопируйте ключ и добавьте его в надёжный менеджер секретов.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                  <code className="flex-1 rounded-lg border border-white/10 bg-black/50 p-3 text-sm font-mono text-white break-all">
                  {newKeyValue}
                </code>
                  <Button variant="outline" size="sm" onClick={() => copyKey(newKeyValue)} className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
                onClick={() => setShowNewKey(false)}
              >
                Я сохранил ключ
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Ваши API ключи ({keys.length}/10)</h3>
        
        {keys.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="p-8 text-center">
              <Key className="h-12 w-12 mx-auto mb-4 text-white/60" />
              <h3 className="text-lg font-semibold mb-2 text-white">Нет API ключей</h3>
              <p className="text-white/60 text-sm">
                Создайте первый API ключ для доступа к нашему API
              </p>
            </div>
          </div>
        ) : (
          keys.map((key) => (
            <div key={key.id} className="rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Key className="h-5 w-5 text-white/60 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-white">{key.key_name}</p>
                      <code className="text-sm text-white/60 font-mono">
                        {key.api_key}
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={key.is_active ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/30 rounded-lg" : "bg-white/5 text-white/60 border-white/10 rounded-lg"}>
                      {key.is_active ? 'Активен' : 'Неактивен'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteKey(key.id)}
                      className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-white/40">
                  <span>Создан: {new Date(key.created_at).toLocaleDateString('ru-RU')}</span>
                  {key.last_used_at && (
                    <span>
                      Последнее использование: {new Date(key.last_used_at).toLocaleString('ru-RU')}
                    </span>
                  )}
                  {key.expires_at && (
                    <span>
                      Истекает: {new Date(key.expires_at).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
