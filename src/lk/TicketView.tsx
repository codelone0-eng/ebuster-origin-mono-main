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

interface TicketViewProps {
  ticketId: number;
  onClose: () => void;
}

interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  customer_id: number;
  assigned_agent_id?: number;
  team_id?: number;
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
  id: number;
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

export const TicketView: React.FC<TicketViewProps> = ({ ticketId, onClose }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
        setTicket(result.data);
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
    if (!newMessage.trim()) return;

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

  const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig];
  const priorityInfo = priorityConfig[ticket.priority as keyof typeof priorityConfig];

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
              <div className="mt-4 pt-4 border-t">
                <Textarea
                  placeholder="Введите ваше сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                  className="mb-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleSendMessage();
                    }
                  }}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Ctrl + Enter для отправки
                  </span>
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={sending || !newMessage.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Отправить
                  </Button>
                </div>
              </div>
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

              {/* Клиент */}
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
