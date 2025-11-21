import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { KeyRound, Plus, Trash2, User, Calendar } from 'lucide-react';
import { scriptsAdminApi } from '../api/scriptsAdminApi';
import { QueryState } from '@/components/state/QueryState';
import { EmptyState } from '@/components/state/EmptyState';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ScriptAccessPanelProps {
  scriptId: string;
}

const accessLevelLabels = {
  viewer: 'Просмотр',
  tester: 'Тестирование',
  editor: 'Редактирование'
};

export const ScriptAccessPanel: React.FC<ScriptAccessPanelProps> = ({ scriptId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGrantOpen, setIsGrantOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [accessLevel, setAccessLevel] = useState<'viewer' | 'tester' | 'editor'>('viewer');

  const accessQuery = useQuery({
    queryKey: ['admin-script-access', scriptId],
    queryFn: () => scriptsAdminApi.listAccessOverrides(scriptId)
  });

  const grantAccess = useMutation({
    mutationFn: (payload: { user_id: string; access_level: 'viewer' | 'tester' | 'editor' }) =>
      scriptsAdminApi.grantAccess(scriptId, payload),
    onSuccess: () => {
      toast({ title: 'Доступ предоставлен', description: 'Пользователь добавлен в список доступа' });
      queryClient.invalidateQueries({ queryKey: ['admin-script-access', scriptId] });
      setIsGrantOpen(false);
      setUserId('');
      setAccessLevel('viewer');
    },
    onError: () => {
      toast({ title: 'Ошибка', description: 'Не удалось предоставить доступ', variant: 'destructive' });
    }
  });

  const revokeAccess = useMutation({
    mutationFn: (targetUserId: string) => scriptsAdminApi.revokeAccess(scriptId, targetUserId),
    onSuccess: () => {
      toast({ title: 'Доступ отозван' });
      queryClient.invalidateQueries({ queryKey: ['admin-script-access', scriptId] });
    },
    onError: () => {
      toast({ title: 'Ошибка', description: 'Не удалось отозвать доступ', variant: 'destructive' });
    }
  });

  const handleGrant = () => {
    if (!userId.trim()) return;
    grantAccess.mutate({ user_id: userId.trim(), access_level: accessLevel });
  };

  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4 text-primary" />
              Индивидуальные доступы
            </CardTitle>
            <Button size="sm" onClick={() => setIsGrantOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить доступ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <QueryState query={accessQuery}>
            {accessQuery.data && accessQuery.data.length === 0 ? (
              <EmptyState
                title="Индивидуальные доступы не настроены"
                description="Добавьте пользователей с особыми правами доступа к этому скрипту"
                action={{
                  label: 'Добавить доступ',
                  onClick: () => setIsGrantOpen(true)
                }}
              />
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {accessQuery.data?.map((override) => (
                    <div
                      key={override.id}
                      className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10">
                            {override.user_id.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{override.user_id}</span>
                            <Badge variant="outline">
                              {accessLevelLabels[override.access_level as keyof typeof accessLevelLabels]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Добавлен{' '}
                              {formatDistanceToNow(new Date(override.created_at), {
                                addSuffix: true,
                                locale: ru
                              })}
                            </span>
                            {override.expires_at && (
                              <span>
                                Истекает{' '}
                                {formatDistanceToNow(new Date(override.expires_at), {
                                  addSuffix: true,
                                  locale: ru
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeAccess.mutate(override.user_id)}
                        disabled={revokeAccess.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Отозвать
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </QueryState>
        </CardContent>
      </Card>

      <Dialog open={isGrantOpen} onOpenChange={setIsGrantOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Предоставить доступ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">ID пользователя</label>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="user-uuid или email"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Введите UUID пользователя или email адрес
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Уровень доступа</label>
              <Select
                value={accessLevel}
                onValueChange={(value) => setAccessLevel(value as typeof accessLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Просмотр</SelectItem>
                  <SelectItem value="tester">Тестирование</SelectItem>
                  <SelectItem value="editor">Редактирование</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGrantOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleGrant} disabled={grantAccess.isPending || !userId.trim()}>
              {grantAccess.isPending ? 'Добавление...' : 'Предоставить доступ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScriptAccessPanel;
