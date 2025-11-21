import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
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
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { scriptsAdminApi } from '../api/scriptsAdminApi';
import { QueryState } from '@/components/state/QueryState';
import { EmptyState } from '@/components/state/EmptyState';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ScriptChecksPanelProps {
  scriptId: string;
}

const checkStatusColors = {
  pending: 'bg-yellow-100 text-yellow-900',
  running: 'bg-blue-100 text-blue-900',
  passed: 'bg-emerald-100 text-emerald-900',
  failed: 'bg-red-100 text-red-900',
  error: 'bg-destructive text-destructive-foreground'
};

const checkStatusIcons = {
  pending: Clock,
  running: Play,
  passed: CheckCircle2,
  failed: XCircle,
  error: AlertTriangle
};

export const ScriptChecksPanel: React.FC<ScriptChecksPanelProps> = ({ scriptId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [checkType, setCheckType] = useState('security');
  const [comment, setComment] = useState('');

  const checksQuery = useQuery({
    queryKey: ['admin-script-checks', scriptId],
    queryFn: () => scriptsAdminApi.listChecks(scriptId)
  });

  const createCheck = useMutation({
    mutationFn: (payload: { check_type: string }) =>
      scriptsAdminApi.createCheck(scriptId, { script_id: scriptId, ...payload }),
    onSuccess: () => {
      toast({ title: 'Проверка создана', description: 'Запущена автоматическая проверка' });
      queryClient.invalidateQueries({ queryKey: ['admin-script-checks', scriptId] });
      setIsCreateOpen(false);
      setCheckType('security');
      setComment('');
    },
    onError: () => {
      toast({ title: 'Ошибка', description: 'Не удалось создать проверку', variant: 'destructive' });
    }
  });

  const handleCreate = () => {
    createCheck.mutate({
      check_type: checkType
    });
  };

  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-primary" />
              Автоматические проверки
            </CardTitle>
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Запустить проверку
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <QueryState query={checksQuery}>
            {checksQuery.data && checksQuery.data.length === 0 ? (
              <EmptyState
                title="Проверки не запускались"
                description="Запустите первую автоматическую проверку безопасности и качества кода"
                action={{
                  label: 'Запустить проверку',
                  onClick: () => setIsCreateOpen(true)
                }}
              />
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {checksQuery.data?.map((check) => {
                    const StatusIcon = checkStatusIcons[check.status as keyof typeof checkStatusIcons];
                    return (
                      <div
                        key={check.id}
                        className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={checkStatusColors[check.status as keyof typeof checkStatusColors]}
                              >
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {check.status}
                              </Badge>
                              <span className="text-sm font-semibold">{check.check_type}</span>
                            </div>


                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Запущена{' '}
                                {formatDistanceToNow(new Date(check.started_at), {
                                  addSuffix: true,
                                  locale: ru
                                })}
                              </span>
                              {check.finished_at && (
                                <span>
                                  Завершена{' '}
                                  {formatDistanceToNow(new Date(check.finished_at), {
                                    addSuffix: true,
                                    locale: ru
                                  })}
                                </span>
                              )}
                            </div>

                            {check.details && typeof check.details === 'object' && (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                  Детали проверки
                                </summary>
                                <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs">
                                  {JSON.stringify(check.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </QueryState>
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Запустить проверку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Тип проверки</label>
              <Select value={checkType} onValueChange={setCheckType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="security">Безопасность</SelectItem>
                  <SelectItem value="performance">Производительность</SelectItem>
                  <SelectItem value="quality">Качество кода</SelectItem>
                  <SelectItem value="compatibility">Совместимость</SelectItem>
                  <SelectItem value="syntax">Синтаксис</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Комментарий</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Опциональный комментарий к проверке"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreate} disabled={createCheck.isPending}>
              {createCheck.isPending ? 'Запуск...' : 'Запустить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScriptChecksPanel;
