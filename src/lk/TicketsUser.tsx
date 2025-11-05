import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { CreateTicketModal } from './CreateTicketModal';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Plus,
  Eye,
  Send,
  RefreshCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'open' | 'pending_customer' | 'pending_internal' | 'resolved' | 'closed' | 'cancelled';
  user_id: string;
  created_at: string;
  updated_at: string;
  client?: { id: string; full_name: string; email: string; avatar_url?: string; };
  agent?: { full_name: string; };
}

interface TicketComment {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  author?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    role: string;
  };
}

const TicketsUser: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [reopenLoading, setReopenLoading] = useState(false);
  
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'technical',
    priority: 'medium'
  });
  const [newComment, setNewComment] = useState('');

  const statusColors = {
    new: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    open: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    pending_customer: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    pending_internal: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
    closed: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    new: 'Новый',
    open: 'В работе',
    pending_customer: 'Ожидает ответа',
    pending_internal: 'Внутреннее ожидание',
    resolved: 'Решен',
    closed: 'Закрыт'
  };

  const priorityLabels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий'
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const loadTickets = async (options?: { keepSelected?: boolean }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ebuster_token');
      
      const response = await fetch(`https://api.ebuster.ru/api/tickets${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setTickets(data.data);
        if (options?.keepSelected && selectedTicket) {
          const updated = data.data.find((item: Ticket) => item.id === selectedTicket.id);
          if (updated) {
            setSelectedTicket(updated);
          }
        }
      }
    } catch (error) {
      console.error('Load tickets error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить тикеты',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (ticketId: string) => {
    try {
      const token = localStorage.getItem('ebuster_token');
      
      const response = await fetch(`https://api.ebuster.ru/api/tickets/${ticketId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('Load comments error:', error);
    }
  };

  const createTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните тему и сообщение',
        variant: 'destructive'
      });
      return;
    }

    try {
      const token = localStorage.getItem('ebuster_token');
      
      const response = await fetch('https://api.ebuster.ru/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTicket)
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Тикет создан'
        });
        setIsCreateDialogOpen(false);
        setNewTicket({
          subject: '',
          message: '',
          category: 'technical',
          priority: 'medium'
        });
        loadTickets({ keepSelected: true });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать тикет',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Create ticket error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать тикет',
        variant: 'destructive'
      });
    }
  };

  const openTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    await loadComments(ticket.id);
    setIsViewSheetOpen(true);
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedTicket) return;

    try {
      const token = localStorage.getItem('ebuster_token');
      
      const response = await fetch('https://api.ebuster.ru/api/tickets/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          message: newComment,
          is_internal: false
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось добавить комментарий',
          variant: 'destructive'
        });

        if (response.status === 403) {
          await loadTickets({ keepSelected: true });
        }
        return;
      }

      setNewComment('');
      await loadComments(selectedTicket.id);
      await loadTickets({ keepSelected: true });
      toast({
        title: 'Успешно',
        description: 'Комментарий добавлен'
      });
    } catch (error) {
      console.error('Add comment error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить комментарий',
        variant: 'destructive'
      });
    }
  };

  const reopenTicket = async () => {
    if (!selectedTicket) return;

    try {
      setReopenLoading(true);
      const token = localStorage.getItem('ebuster_token');

      const response = await fetch(`https://api.ebuster.ru/api/tickets/${selectedTicket.id}/reopen`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось переоткрыть тикет',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Готово',
        description: 'Тикет переоткрыт'
      });

      await loadTickets({ keepSelected: true });
      await loadComments(selectedTicket.id);
    } catch (error) {
      console.error('Reopen ticket error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось переоткрыть тикет',
        variant: 'destructive'
      });
    } finally {
      setReopenLoading(false);
    }
  };

  const isTicketClosed = (ticket?: Ticket | null) => {
    if (!ticket) return false;
    return ticket.status === 'closed' || ticket.status === 'cancelled';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Поддержка</h2>
          <p className="text-muted-foreground">Управление запросами поддержки</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="new">Открытые</SelectItem>
              <SelectItem value="in_progress">В работе</SelectItem>
              <SelectItem value="resolved">Решен</SelectItem>
              <SelectItem value="closed">Закрытые</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Создать тикет
          </Button>
          <CreateTicketModal 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)} 
            onSuccess={() => {
              setIsCreateModalOpen(false);
              loadTickets();
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="line-clamp-2">{ticket.subject}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center gap-2 mb-4">
                <Badge className={cn(statusColors[ticket.status], 'border')}>{statusLabels[ticket.status]}</Badge>
                <Badge className={cn(priorityColors[ticket.priority], 'border')}>{priorityLabels[ticket.priority]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{ticket.message}</p>
            </CardContent>
            <div className="p-6 pt-0 mt-auto">
              <div className="text-xs text-muted-foreground mb-4">
                Обновлено: {new Date(ticket.updated_at).toLocaleString()}
              </div>
              <Button variant="outline" className="w-full" onClick={() => openTicket(ticket)}>
                <Eye className="h-4 w-4 mr-2" />
                Просмотреть тикет
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {tickets.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Нет тикетов</h3>
            <p className="text-muted-foreground">
              {statusFilter === 'all' ? 'У вас нет тикетов' : 'Нет тикетов с выбранным статусом'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Боковая панель просмотра тикета */}
      <Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedTicket && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedTicket.subject}</SheetTitle>
                <SheetDescription>
                  ID: {selectedTicket.id}
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={cn(statusColors[selectedTicket.status], 'border')}>{statusLabels[selectedTicket.status]}</Badge>
                  <Badge className={cn(priorityColors[selectedTicket.priority], 'border')}>{priorityLabels[selectedTicket.priority]}</Badge>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Исходное сообщение</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedTicket.message}</p>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h4 className="font-medium text-lg">История сообщений</h4>
                  {comments.map((comment) => {
                    const isSupport = comment.author?.role !== 'user';
                    return (
                      <div key={comment.id} className={cn('flex items-start gap-3', isSupport && 'flex-row-reverse')}>
                        <Avatar>
                          <AvatarImage src={comment.author?.avatar_url} />
                          <AvatarFallback>{comment.author?.full_name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className={cn('p-3 rounded-lg max-w-[80%]', isSupport ? 'bg-primary/10' : 'bg-muted')}>
                          <div className="font-semibold text-sm mb-1">{comment.author?.full_name}</div>
                          <p className="text-sm whitespace-pre-wrap">{comment.message}</p>
                          <div className="text-xs text-muted-foreground mt-2 text-right">{new Date(comment.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                  {comments.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-8">Нет сообщений</div>
                  )}
                </div>

                {isTicketClosed(selectedTicket) ? (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="rounded-xl border content-border-40 bg-muted/40 p-4">
                      <h5 className="font-semibold mb-1">Тикет закрыт</h5>
                      <p className="text-sm text-muted-foreground">
                        Чтобы продолжить обсуждение, переоткройте тикет или создайте новый запрос в поддержку.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={reopenTicket}
                      disabled={reopenLoading}
                    >
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      {reopenLoading ? 'Переоткрываем...' : 'Переоткрыть тикет'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-4 border-t">
                    <Textarea
                      placeholder="Напишите ваш ответ..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={4}
                    />
                    <Button onClick={addComment} disabled={!newComment.trim()} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Отправить
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TicketsUser;
