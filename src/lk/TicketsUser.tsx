import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface TicketComment {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  user?: {
    full_name: string;
    role: string;
  };
}

const TicketsUser: React.FC = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'technical',
    priority: 'medium'
  });
  const [newComment, setNewComment] = useState('');

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    new: 'Открыт',
    in_progress: 'В работе',
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

  const loadTickets = async () => {
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
        loadTickets();
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
    setIsViewDialogOpen(true);
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
      
      if (data.success) {
        setNewComment('');
        loadComments(selectedTicket.id);
        toast({
          title: 'Успешно',
          description: 'Комментарий добавлен'
        });
      }
    } catch (error) {
      console.error('Add comment error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить комментарий',
        variant: 'destructive'
      });
    }
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Создать тикет
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать тикет</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Тема</label>
                  <Input
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    placeholder="Проблема с установкой скрипта"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Категория</label>
                  <Select 
                    value={newTicket.category} 
                    onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Техническая проблема</SelectItem>
                      <SelectItem value="feature">Запрос на новую функцию</SelectItem>
                      <SelectItem value="bug">Сообщение об ошибке</SelectItem>
                      <SelectItem value="other">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Приоритет</label>
                  <Select 
                    value={newTicket.priority} 
                    onValueChange={(value: any) => setNewTicket({ ...newTicket, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Низкий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="high">Высокий</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Сообщение</label>
                  <Textarea
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                    placeholder="Опишите вашу проблему подробно..."
                    rows={4}
                  />
                </div>
                <Button onClick={createTicket} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Создать тикет
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{ticket.subject}</h3>
                    <Badge className={statusColors[ticket.status]}>
                      {statusLabels[ticket.status]}
                    </Badge>
                    <Badge className={priorityColors[ticket.priority]}>
                      {priorityLabels[ticket.priority]}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{ticket.message}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Создан {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                    {ticket.updated_at !== ticket.created_at && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Обновлен {new Date(ticket.updated_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openTicket(ticket)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Открыть
                  </Button>
                </div>
              </div>
            </CardContent>
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

      {/* Модальное окно просмотра тикета */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTicket.subject}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[selectedTicket.status]}>
                    {statusLabels[selectedTicket.status]}
                  </Badge>
                  <Badge className={priorityColors[selectedTicket.priority]}>
                    {priorityLabels[selectedTicket.priority]}
                  </Badge>
                </div>
                
                <div className="border rounded-lg p-4 bg-muted/50">
                  <p>{selectedTicket.message}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Комментарии ({comments.length})</h4>
                  {comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comment.user?.full_name}</span>
                          {comment.is_internal && (
                            <Badge variant="secondary">Внутренний</Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p>{comment.message}</p>
                    </div>
                  ))}
                </div>

                {selectedTicket.status !== 'closed' && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Добавить комментарий..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={addComment} disabled={!newComment.trim()}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Добавить комментарий
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketsUser;
