import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusProgress } from '@/components/ui/status-progress';
import { 
  Ticket, 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Wrench,
  User,
  RefreshCw,
  Eye,
  Calendar,
  Tag,
  Mail,
  TrendingUp,
  TrendingDown,
  Filter,
  Upload,
  Paperclip,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FileUpload } from '@/components/ui/file-upload';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'open' | 'pending_customer' | 'pending_internal' | 'resolved' | 'closed';
  user_id: string;
  user?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  assigned_to?: string;
  assigned?: {
    full_name: string;
  };
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  author_id: string;
  message: string;
  is_internal: boolean;
  is_system: boolean;
  created_at: string;
  author?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    role: string;
  };
}

const TicketsManagement: React.FC = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [realtimeMessages, setRealtimeMessages] = useState<TicketMessage[]>([]);

  const statusColors = {
    new: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    open: 'bg-blue-100 text-blue-800 border-blue-300',
    pending_customer: 'bg-orange-100 text-orange-800 border-orange-300',
    pending_internal: 'bg-purple-100 text-purple-800 border-purple-300',
    resolved: 'bg-green-100 text-green-800 border-green-300',
    closed: 'bg-gray-100 text-gray-800 border-gray-300'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800 border-gray-300',
    medium: 'bg-blue-100 text-blue-800 border-blue-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    critical: 'bg-red-100 text-red-800 border-red-300'
  };

  const statusLabels = {
    new: 'Новое',
    open: 'В работе',
    pending_customer: 'Ожидает клиента',
    pending_internal: 'Ожидает внутреннее',
    resolved: 'Решено',
    closed: 'Закрыто'
  };

  const priorityLabels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    critical: 'Критический'
  };

  // Логотип молнии
  const LightningIcon = ({ size = 32 }: { size?: number }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={2}
      className="text-yellow-500"
    >
      <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter, categoryFilter]);

  // Realtime обновления сообщений
  useEffect(() => {
    if (!selectedTicket || !isTicketDialogOpen) return;

    // Polling для обновления сообщений каждые 3 секунды
    const interval = setInterval(() => {
      loadMessages(selectedTicket.id);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedTicket, isTicketDialogOpen]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ebuster_token');
      
      let url = 'https://api.ebuster.ru/api/tickets/all?';
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      
      url += params.toString();
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setTickets(data.data || []);
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
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Load messages error:', error);
    }
  };

  const openTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setMessages([]);
    setIsTicketDialogOpen(true);
    await loadMessages(ticket.id);
  };

  const updateTicketStatus = async (status: string) => {
    if (!selectedTicket) return;

    try {
      const token = localStorage.getItem('ebuster_token');
      
      const response = await fetch(`https://api.ebuster.ru/api/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectedTicket({ ...selectedTicket, status: status as any });
        toast({
          title: 'Успешно',
          description: 'Статус тикета обновлен',
          variant: 'success'
        });
        loadTickets();
      }
    } catch (error) {
      console.error('Update ticket error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive'
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || isSending) return;

    try {
      setIsSending(true);
      const token = localStorage.getItem('ebuster_token');
      
      const response = await fetch(`https://api.ebuster.ru/api/tickets/${selectedTicket.id}/messages`, {
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

      const data = await response.json();
      
      if (data.success) {
        setNewMessage('');
        loadMessages(selectedTicket.id);
        toast({
          title: 'Сообщение отправлено',
          variant: 'success'
        });
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Send message error:', error);
      toast({
        title: 'Ошибка отправки',
        description: error.message || 'Не удалось отправить сообщение',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
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
    return <div className="flex items-center justify-center h-64">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Управление тикетами</h2>
          <p className="text-muted-foreground">Обработка запросов поддержки</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="new">Новые</SelectItem>
              <SelectItem value="open">В работе</SelectItem>
              <SelectItem value="pending_customer">Ожидают клиента</SelectItem>
              <SelectItem value="resolved">Решенные</SelectItem>
              <SelectItem value="closed">Закрытые</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Приоритет" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все приоритеты</SelectItem>
              <SelectItem value="low">Низкий</SelectItem>
              <SelectItem value="medium">Средний</SelectItem>
              <SelectItem value="high">Высокий</SelectItem>
              <SelectItem value="critical">Критический</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              <SelectItem value="technical">Техническая</SelectItem>
              <SelectItem value="billing">Оплата</SelectItem>
              <SelectItem value="general">Общая</SelectItem>
              <SelectItem value="bug">Ошибка</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadTickets} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => openTicket(ticket)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-foreground truncate">{ticket.subject}</h3>
                    <Badge className={cn(statusColors[ticket.status], 'border')}>
                      {statusLabels[ticket.status]}
                    </Badge>
                    <Badge className={cn(priorityColors[ticket.priority], 'border')}>
                      {priorityLabels[ticket.priority]}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{ticket.message}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={ticket.user?.avatar_url} />
                        <AvatarFallback className="text-xs">{ticket.user?.full_name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{ticket.user?.full_name || 'Unknown'}</span>
                      <span className="text-muted-foreground/70">({ticket.user?.email})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Создан {formatDate(ticket.created_at)}</span>
                    </div>
                    {ticket.updated_at !== ticket.created_at && (
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>Обновлен {formatDate(ticket.updated_at)}</span>
                      </div>
                    )}
                    {ticket.assigned && (
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span>Назначен: {ticket.assigned.full_name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openTicket(ticket);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Открыть
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tickets.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Нет тикетов</h3>
            <p className="text-muted-foreground">
              {statusFilter === 'all' ? 'Нет тикетов в системе' : 'Нет тикетов с выбранным статусом'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Модальное окно тикета */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedTicket && (
            <>
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-2xl">{selectedTicket.subject}</DialogTitle>
                <div className="mt-3">
                  <StatusProgress 
                    currentStatus={selectedTicket.status} 
                    onStatusChange={updateTicketStatus}
                    isAdmin={true}
                  />
                </div>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
                {/* Информация о тикете */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Информация о тикете</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Клиент</p>
                          <p className="font-medium">{selectedTicket.user?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{selectedTicket.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Создан</p>
                          <p className="font-medium">{formatDate(selectedTicket.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Категория</p>
                          <Badge variant="secondary">{selectedTicket.category}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Приоритет</p>
                          <Badge className={priorityColors[selectedTicket.priority]}>
                            {priorityLabels[selectedTicket.priority]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-2">Описание</p>
                      <p className="text-foreground whitespace-pre-wrap">{selectedTicket.message}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* История сообщений */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      История сообщений ({messages.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isSupport = message.author?.role === 'admin';
                        const isSystem = message.is_system;

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
                              isSupport ? "flex-row-reverse" : "flex-row"
                            )}
                          >
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              {isSupport ? (
                                <div className="bg-yellow-100 flex items-center justify-center w-full h-full">
                                  <LightningIcon size={24} />
                                </div>
                              ) : (
                                <>
                                  <AvatarImage src={message.author?.avatar_url} />
                                  <AvatarFallback>
                                    {message.author?.full_name?.[0] || '?'}
                                  </AvatarFallback>
                                </>
                              )}
                            </Avatar>
                            <div className={cn(
                              "flex-1 max-w-[75%]",
                              isSupport ? "items-end" : "items-start"
                            )}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">
                                  {isSupport ? 'Техническая поддержка Ebuster' : message.author?.full_name || 'Пользователь'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(message.created_at)}
                                </span>
                                {message.is_internal && (
                                  <Badge variant="secondary" className="text-xs">
                                    Внутренняя заметка
                                  </Badge>
                                )}
                              </div>
                              <div
                                className={cn(
                                  "rounded-lg p-3 whitespace-pre-wrap",
                                  isSupport
                                    ? "bg-yellow-50 border border-yellow-200"
                                    : "bg-muted"
                                )}
                              >
                                {message.message}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {messages.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          Нет сообщений
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Форма отправки сообщения */}
              <div className="border-t pt-4 space-y-3 bg-background">
                <Textarea
                  placeholder="Введите ваш ответ..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      sendMessage();
                    }
                  }}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Ctrl + Enter для отправки
                  </span>
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim() || isSending}
                    className="min-w-[140px]"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Отправить ответ
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketsManagement;
