import React, { useState, useEffect, useRef } from 'react';
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
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  category?: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'open' | 'pending_customer' | 'pending_internal' | 'resolved' | 'closed' | 'cancelled';
  user_id: string;
  created_at: string;
  updated_at: string;
  closed_at?: string | null;
  resolved_at?: string | null;
  client?: { id: string; full_name: string; email: string; avatar_url?: string; };
  agent?: { full_name: string };
  ticket_number: string;
}

interface TicketMessage {
  id: number;
  ticket_id: string | number;
  author_id?: number;
  message: string;
  is_internal: boolean;
  is_system: boolean;
  created_at: string;
  author?: {
    id: number;
    full_name: string;
    email: string;
    avatar_url?: string;
    role: string;
  };
}

const normalizeTicket = (ticket: any): Ticket => {
  return {
    ...ticket,
    id: ticket.id,
    ticket_number: ticket.ticket_number || ticket.id,
    status: ticket.status,
    priority: ticket.priority,
    updated_at: ticket.updated_at,
    created_at: ticket.created_at,
    closed_at: ticket.closed_at || null,
    agent: ticket.agent ?? ticket.assigned_agent ?? ticket.assigned_to_user ?? null
  };
};

const TicketsUser: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [reopenLoading, setReopenLoading] = useState(false);
  
  const [newComment, setNewComment] = useState('');
  const commentsChannelRef = useRef<RealtimeChannel | null>(null);

  const statusColors = {
    new: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    open: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    pending_customer: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    pending_internal: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
    closed: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/20'
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
    closed: 'Закрыт',
    cancelled: 'Отменен'
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
        const normalized = (data.data || []).map((ticket: any) => normalizeTicket(ticket));
        setTickets(normalized);
        if (options?.keepSelected && selectedTicket) {
          const updated = normalized.find((item: Ticket) => item.id === selectedTicket.id);
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

  const loadMessages = async (ticketId: string) => {
    try {
      const token = localStorage.getItem('ebuster_token');
      
      const response = await fetch(`https://api.ebuster.ru/api/tickets/${ticketId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Load comments error:', error);
    }
  };

  const openTicket = async (ticket: Ticket) => {
    setSelectedTicket(normalizeTicket(ticket));
    await loadMessages(ticket.id);
    setIsViewSheetOpen(true);
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedTicket || isTicketClosed(selectedTicket)) return;

    try {
      const token = localStorage.getItem('ebuster_token');
      
      const response = await fetch(`https://api.ebuster.ru/api/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
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
      await loadMessages(selectedTicket.id);
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
      await loadMessages(selectedTicket.id);
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
    return ['closed', 'cancelled', 'resolved'].includes(ticket.status);
  };

  const getClosedTicketMessage = (ticket: Ticket) => {
    const dateValue = ticket.closed_at || ticket.resolved_at;
    const formattedDate = dateValue ? new Date(dateValue).toLocaleString() : 'дата не указана';
    const agentName = ticket.agent?.full_name || 'администратор поддержки';
    return `Тикет закрыт, ${formattedDate}, ${agentName}`;
  };

  useEffect(() => {
    if (!selectedTicket) {
      if (commentsChannelRef.current) {
        supabase.removeChannel(commentsChannelRef.current);
        commentsChannelRef.current = null;
      }
      return;
    }

    const ticketId = selectedTicket.id;
    const normalizedTicketId = String(ticketId);
    const channel = supabase.channel(`ticket-messages-${normalizedTicketId}`);
    commentsChannelRef.current = channel;

    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'ticket_messages',
      filter: `ticket_id=eq.${normalizedTicketId}`
    }, async (payload) => {
      console.log('[Realtime] New message received:', payload);
      const payloadTicketId = payload.new?.ticket_id;
      console.log('[Realtime] Comparing ticket IDs:', { payloadTicketId, ticketId });
      if (String(payloadTicketId) !== normalizedTicketId) {
        console.log('[Realtime] Ticket ID mismatch, ignoring');
        return;
      }

      console.log('[Realtime] Loading messages for ticket:', ticketId);
      await loadMessages(ticketId);
      await loadTickets({ keepSelected: true });
    });

    const subscription = channel.subscribe((status) => {
      console.log('[Realtime] Subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('[Realtime] Successfully subscribed to ticket-messages-' + normalizedTicketId);
      }
    });

    return () => {
      supabase.removeChannel(channel);
      if (subscription) {
        subscription.unsubscribe?.().catch((err: unknown) => {
          console.warn('[Realtime] Failed to unsubscribe cleanly', err);
        });
      }
      if (commentsChannelRef.current === channel) {
        commentsChannelRef.current = null;
      }
    };
  }, [selectedTicket?.id]);

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
              <p className="text-xs text-muted-foreground mt-1">Тикет № {ticket.ticket_number}</p>
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
                  Тикет № {selectedTicket.ticket_number || selectedTicket.id}
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
                  {messages.map((message) => {
                    const isSupport = message.author?.role !== 'user';
                    return (
                      <div key={message.id} className={cn('flex items-start gap-3', isSupport && 'flex-row-reverse')}>
                        <Avatar>
                          <AvatarImage src={message.author?.avatar_url} />
                          <AvatarFallback>{message.author?.full_name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className={cn('p-3 rounded-lg max-w-[80%]', isSupport ? 'bg-primary/10' : 'bg-muted')}>
                          <div className="font-semibold text-sm mb-1">{message.author?.full_name}</div>
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          <div className="text-xs text-muted-foreground mt-2 text-right">{new Date(message.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                  {messages.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-8">Нет сообщений</div>
                  )}
                </div>

                {isTicketClosed(selectedTicket) ? (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="rounded-xl border content-border-40 bg-muted/40 p-4">
                      <h5 className="font-semibold mb-1">Тикет закрыт</h5>
                      <p className="text-sm text-muted-foreground">
                        Тикет закрыт {selectedTicket.closed_at ? new Date(selectedTicket.closed_at).toLocaleString() : ''}
                        {selectedTicket.agent?.full_name ? `, ${selectedTicket.agent.full_name}` : ''}
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
