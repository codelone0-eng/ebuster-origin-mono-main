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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Создать новый API ключ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="keyName">Название ключа</Label>
              <Input
                id="keyName"
                placeholder="Мое приложение"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createKey()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={createKey} disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                Создать
              </Button>
            </div>
          </div>
          
          {showNewKey && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    ⚠️ Сохраните ключ! Вы не сможете увидеть его снова.
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Скопируйте ключ и сохраните в безопасном месте
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <code className="flex-1 p-3 bg-white dark:bg-gray-950 rounded text-sm font-mono break-all border">
                  {newKeyValue}
                </code>
                <Button size="sm" onClick={() => copyKey(newKeyValue)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setShowNewKey(false)}
              >
                Я сохранил ключ
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ваши API ключи ({keys.length}/10)</h3>
        
        {keys.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Нет API ключей</h3>
              <p className="text-muted-foreground text-sm">
                Создайте первый API ключ для доступа к нашему API
              </p>
            </CardContent>
          </Card>
        ) : (
          keys.map((key) => (
            <Card key={key.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Key className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{key.key_name}</p>
                      <code className="text-sm text-muted-foreground font-mono">
                        {key.api_key}
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={key.is_active ? 'default' : 'secondary'}>
                      {key.is_active ? 'Активен' : 'Неактивен'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteKey(key.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
