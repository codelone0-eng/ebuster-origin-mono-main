import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { History, User, Calendar, FileText } from 'lucide-react';
import { scriptsAdminApi } from '../api/scriptsAdminApi';
import { QueryState } from '@/components/state/QueryState';
import { EmptyState } from '@/components/state/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ScriptAuditPanelProps {
  scriptId: string;
}

export const ScriptAuditPanel: React.FC<ScriptAuditPanelProps> = ({ scriptId }) => {
  const auditQuery = useQuery({
    queryKey: ['admin-script-audit', scriptId],
    queryFn: () => scriptsAdminApi.listAuditLogs(scriptId)
  });

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-primary" />
          История изменений
        </CardTitle>
      </CardHeader>
      <CardContent>
        <QueryState query={auditQuery}>
          {auditQuery.data && auditQuery.data.length === 0 ? (
            <EmptyState
              title="История пуста"
              description="Пока нет записей об изменениях этого скрипта"
              variant="default"
            />
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {auditQuery.data?.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-xs">
                          {log.actor_email?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              {log.actor_email || log.actor_id || 'Система'}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {log.action}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(log.created_at), {
                              addSuffix: true,
                              locale: ru
                            })}
                          </div>
                        </div>

                        {log.comment && (
                          <p className="text-sm text-muted-foreground">{log.comment}</p>
                        )}

                        {log.changes && typeof log.changes === 'object' && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              <FileText className="mr-1 inline h-3 w-3" />
                              Детали изменений
                            </summary>
                            <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs">
                              {JSON.stringify(log.changes, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </QueryState>
      </CardContent>
    </Card>
  );
};

export default ScriptAuditPanel;
