import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft,
  Send,
  User,
  Calendar,
  Tag,
  Users,
  Clock,
  MessageSquare,
  Lock,
  AlertCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { API_CONFIG } from '@/config/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface TicketViewProps {
  ticketId: number;
  onClose: () => void;
}

interface Ticket {
  id: string | number;
  ticket_number: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  customer_id: string | number;
  assigned_agent_id?: string | number;
  team_id?: string | number;
  closed_at?: string | null;
  resolved_at?: string | null;
  customer?: {
    id: number;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  assigned_agent?: {
    id: number;
    full_name: string;
    email: string;
  };
  team?: {
    id: number;
    name: string;
  };
}

interface Message {
  id: string | number;
  ticket_id: number;
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

const statusConfig = {
  new: { label: 'Новый', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' },
  open: { label: 'Открыт', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
  pending_customer: { label: 'Ожидание клиента', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50' },
  pending_internal: { label: 'Ожидание внутреннее', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50' },
  resolved: { label: 'Решен', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' },
  closed: { label: 'Закрыт', color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50' },
  cancelled: { label: 'Отменен', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' }
};

const priorityConfig = {
  low: { label: 'Низкий', color: 'bg-gray-500' },
  medium: { label: 'Средний', color: 'bg-blue-500' },
  high: { label: 'Высокий', color: 'bg-orange-500' },
  critical: { label: 'Критический', color: 'bg-red-500' }
};

const normalizeTicketData = (data: any): Ticket => {
  const customer = data.customer ?? data.client ?? (data.user
    ? {
        id: data.user.id,
        full_name: data.user.full_name,
        email: data.user.email,
        avatar_url: data.user.avatar_url
      }
    : undefined);

  const assignedAgent = data.assigned_agent ?? data.agent ?? (data.assigned_to_user
    ? {
        id: data.assigned_to_user.id,
        full_name: data.assigned_to_user.full_name,
        email: data.assigned_to_user.email
      }
    : undefined);

  return {
    ...data,
    id: data.id,
    customer,
    customer_id: data.customer_id ?? data.user_id,
    assigned_agent: assignedAgent,
    assigned_agent_id: data.assigned_agent_id ?? data.assigned_to ?? data.assigned_to_id,
    team_id: data.team_id
  };
};

export const TicketView: React.FC<TicketViewProps> = ({ ticketId, onClose }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTicket();
    loadMessages();
    
    // Получаем роль пользователя
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || 'user');
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadTicket = async () => {
    try {
      const token = localStorage.getItem('ebuster_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setTicket(normalizeTicketData(result.data));
      } else {
        throw new Error(result.error || 'Failed to load ticket');
      }
    } catch (error: any) {
      console.error('Load ticket error:', error);
      toast({
        title: 'Ошибка загрузки',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('ebuster_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/tickets/${ticketId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setMessages(result.data || []);
      }
    } catch (error) {
      console.error('Load messages error:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticket || isTicketClosed(ticket)) return;

    try {
      setSending(true);
      const token = localStorage.getItem('ebuster_token');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: newMessage,
          is_internal: false
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setNewMessage('');
        loadMessages();
        loadTicket();
        toast({
          title: 'Сообщение отправлено',
          variant: 'success'
        });
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Send message error:', error);
      toast({
        title: 'Ошибка отправки',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const token = localStorage.getItem('ebuster_token');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();
      
      if (result.success) {
        loadTicket();
        loadMessages();
        toast({
          title: 'Статус обновлен',
          variant: 'success'
        });
      } else {
        throw new Error(result.error || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('Update status error:', error);
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isTicketClosed = (currentTicket: Ticket) => {
    return ['closed', 'cancelled', 'resolved'].includes(currentTicket.status);
  };

  const closedTicketMessage = (currentTicket: Ticket) => {
    const dateValue = currentTicket.closed_at || currentTicket.resolved_at;
    const formattedDate = dateValue ? new Date(dateValue).toLocaleString('ru-RU') : 'дата не указана';
    const agentName = currentTicket.assigned_agent?.full_name || 'администратор';
    return `Тикет закрыт, ${formattedDate}, ${agentName}`;
  };

  useEffect(() => {
    if (!ticket) {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
      return;
    }

    const channel = supabase.channel(`ticket-messages-${ticket.id}`);
    realtimeChannelRef.current = channel;

    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'ticket_messages',
      filter: `ticket_id=eq.${ticket.id}`
    }, async () => {
      await loadMessages();
      await loadTicket();
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (realtimeChannelRef.current === channel) {
        realtimeChannelRef.current = null;
      }
    };
  }, [ticket?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Тикет не найден</h3>
        <Button onClick={onClose}>Вернуться к списку</Button>
      </div>
    );
  }

  const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || { label: ticket.status, color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50' };
  const priorityInfo = priorityConfig[ticket.priority as keyof typeof priorityConfig] || { label: ticket.priority, color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50' };

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-mono text-muted-foreground">
              {ticket.ticket_number}
            </span>
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs",
                statusInfo.bgLight,
                statusInfo.textColor
              )}
            >
              {statusInfo.label}
            </Badge>
            <div className={cn("w-2 h-2 rounded-full", priorityInfo.color)} />
            <span className="text-xs text-muted-foreground">
              {priorityInfo.label}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{ticket.subject}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая часть - История сообщений */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                История сообщений
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {messages.map((message, index) => {
                  const isCustomer = message.author?.role === 'user';
                  const isSystem = message.is_system;
                  const isInternal = message.is_internal;

                  if (isSystem) {
                    return (
                      <div key={message.id} className="flex justify-center">
                        <div className="bg-muted px-4 py-2 rounded-full text-xs text-muted-foreground">
                          {message.message}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        isCustomer ? "flex-row" : "flex-row-reverse"
                      )}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={message.author?.avatar_url} />
                        <AvatarFallback>
                          {message.author?.full_name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "flex-1 max-w-[70%]",
                        isCustomer ? "items-start" : "items-end"
                      )}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {message.author?.full_name || 'Система'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.created_at)}
                          </span>
                          {isInternal && (
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Внутренняя заметка
                            </Badge>
                          )}
                        </div>
                        <div
                          className={cn(
                            "rounded-lg p-3 whitespace-pre-wrap",
                            isCustomer
                              ? "bg-muted"
                              : isInternal
                              ? "bg-purple-50 border border-purple-200"
                              : "bg-primary text-primary-foreground"
                          )}
                        >
                          {message.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Форма ответа */}
              {!isTicketClosed(ticket) ? (
                <div className="mt-4 pt-4 border-t">
                  <Textarea
                    placeholder="Введите ваше сообщение..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                    disabled={sending}
                  />
                  <div className="mt-2 flex justify-between items-center text-xs text-muted-foreground">
                    <span>Ctrl + Enter для отправки</span>
                    <Button
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Отправить
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t">
                  <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-sm text-muted-foreground">
                    {closedTicketMessage(ticket)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Правая часть - Информация и действия */}
        <div className="space-y-4">
          {/* Свойства тикета */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Свойства тикета</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Статус */}
              {(userRole === 'admin' || userRole === 'agent') ? (
                <div>
                  <label className="text-sm font-medium mb-2 block">Статус</label>
                  <Select value={ticket.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Новый</SelectItem>
                      <SelectItem value="open">Открыт</SelectItem>
                      <SelectItem value="pending_customer">Ожидание клиента</SelectItem>
                      <SelectItem value="pending_internal">Ожидание внутреннее</SelectItem>
                      <SelectItem value="resolved">Решен</SelectItem>
                      <SelectItem value="closed">Закрыт</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-2 block">Статус</label>
                  <Badge className={cn(statusInfo.bgLight, statusInfo.textColor)}>
                    {statusInfo.label}
                  </Badge>
                </div>
              )}

              {/* Приоритет */}
              <div>
                <label className="text-sm font-medium mb-2 block">Приоритет</label>
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", priorityInfo.color)} />
                  <span className="text-sm">{priorityInfo.label}</span>
                </div>
              </div>

              {/* Информация о клиенте отображаем только для сотрудников */}
              {userRole !== 'user' && (
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Клиент
                  </label>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={ticket.customer?.avatar_url} />
                      <AvatarFallback>{ticket.customer?.full_name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{ticket.customer?.full_name || `ID: ${ticket.customer_id}`}</div>
                      <div className="text-xs text-muted-foreground">{ticket.customer?.email || ''}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Команда */}
              {ticket.team && (
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Команда
                  </label>
                  <span className="text-sm">{ticket.team.name}</span>
                </div>
              )}

              {/* Агент */}
              {ticket.assigned_agent && (
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Назначен
                  </label>
                  <span className="text-sm">{ticket.assigned_agent.full_name}</span>
                </div>
              )}

              {/* Даты */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Создан
                </label>
                <span className="text-sm text-muted-foreground">
                  {formatDate(ticket.created_at)}
                </span>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Обновлен
                </label>
                <span className="text-sm text-muted-foreground">
                  {formatDate(ticket.updated_at)}
                </span>
              </div>

              {/* Теги */}
              {ticket.tags && ticket.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Теги
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ticket.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Быстрые действия */}
          {ticket.status === 'resolved' && userRole === 'user' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full" 
                  variant="default"
                  onClick={() => handleStatusChange('closed')}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Подтвердить решение
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleStatusChange('open')}
                >
                  Проблема не решена
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
