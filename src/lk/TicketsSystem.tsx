import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Plus,
  Ticket,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp,
  MessageSquare,
  Eye
} from 'lucide-react';
import { API_CONFIG } from '@/config/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { TicketView } from './TicketView';
import { CreateTicketModal } from './CreateTicketModal';

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  customer_id: string;
  assigned_agent_id?: string;
  team_id?: string;
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

interface TicketStats {
  new: number;
  open: number;
  pending_customer: number;
  pending_internal: number;
  resolved: number;
  closed: number;
  total: number;
  avgResponseTimeHours: number;
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

interface TicketsSystemProps {
  initialFilter?: string;
}

export const TicketsSystem: React.FC<TicketsSystemProps> = ({ initialFilter = 'all' }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: initialFilter,
    priority: '',
    search: ''
  });
  const { toast } = useToast();

  // Синхронизируем фильтр с initialFilter при изменении вкладки
  useEffect(() => {
    setFilters(prev => ({ ...prev, status: initialFilter }));
  }, [initialFilter]);

  useEffect(() => {
    loadTickets();
    loadStats();
  }, [filters]);

  const formatTicketNumber = (value: string | number | undefined) => {
    if (!value) return '—';
    if (typeof value === 'number') return value.toString();

    const sanitized = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return sanitized.slice(0, 8) || value;
  };

  const normalizeTicket = (ticket: any): Ticket => ({
    ...ticket,
    id: String(ticket.id),
    customer_id: ticket.customer_id ? String(ticket.customer_id) : String(ticket.user_id || ''),
    assigned_agent_id: ticket.assigned_agent_id ? String(ticket.assigned_agent_id) : ticket.assigned_to ? String(ticket.assigned_to) : undefined,
    team_id: ticket.team_id ? String(ticket.team_id) : undefined,
    ticket_number: ticket.ticket_number || formatTicketNumber(ticket.id)
  });

  const loadTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ebuster_token');
      
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/tickets?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        const normalized = (result.data || []).map((ticket: any) => normalizeTicket(ticket));
        setTickets(normalized);
      } else {
        throw new Error(result.error || 'Failed to load tickets');
      }
    } catch (error: any) {
      console.error('Load tickets error:', error);
      toast({
        title: 'Ошибка загрузки',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('ebuster_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/tickets/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const handleCreateTicket = () => {
    setIsCreateModalOpen(true);
  };

  const handleTicketCreated = () => {
    setIsCreateModalOpen(false);
    loadTickets();
    loadStats();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (selectedTicket) {
    return (
      <TicketView 
        ticketId={selectedTicket} 
        onClose={() => {
          setSelectedTicket(null);
          loadTickets();
          loadStats();
        }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Новые тикеты
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.new}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Требуют внимания
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                В работе
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.open}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Активные тикеты
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Решено
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolved}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ожидают закрытия
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Среднее время ответа
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgResponseTimeHours.toFixed(1)}ч
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                За последние 30 дней
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Фильтры и поиск */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Тикеты поддержки</CardTitle>
              <CardDescription>
                Управление запросами в службу поддержки
              </CardDescription>
            </div>
            <Button onClick={handleCreateTicket}>
              <Plus className="h-4 w-4 mr-2" />
              Создать тикет
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по номеру, теме или описанию..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="new">Новые</SelectItem>
                <SelectItem value="open">Открытые</SelectItem>
                <SelectItem value="pending_customer">Ожидание клиента</SelectItem>
                <SelectItem value="resolved">Решенные</SelectItem>
                <SelectItem value="closed">Закрытые</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.priority || 'all'}
              onValueChange={(value) => setFilters({ ...filters, priority: value === 'all' ? '' : value })}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Все приоритеты" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все приоритеты</SelectItem>
                <SelectItem value="low">Низкий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
                <SelectItem value="critical">Критический</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Список тикетов */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Загрузка тикетов...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Тикетов не найдено</h3>
              <p className="text-muted-foreground mb-4">
                {filters.status !== 'all' || filters.priority || filters.search
                  ? 'Попробуйте изменить фильтры'
                  : 'Создайте первый тикет для обращения в поддержку'}
              </p>
              {filters.status === 'all' && !filters.priority && !filters.search && (
                <Button onClick={handleCreateTicket}>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать тикет
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || { label: ticket.status, color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50' };
                const priorityInfo = priorityConfig[ticket.priority as keyof typeof priorityConfig] || { label: ticket.priority, color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50' };

                return (
                  <Card
                    key={ticket.id}
                    className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50"
                    onClick={() => setSelectedTicket(ticket.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-mono text-muted-foreground">
                              Тикет # {ticket.ticket_number || formatTicketNumber(ticket.id)}
                            </span>
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-xs',
                                statusInfo.bgLight,
                                statusInfo.textColor
                              )}
                            >
                              {statusInfo.label}
                            </Badge>
                            <div className={cn('w-2 h-2 rounded-full', priorityInfo.color)} />
                          </div>
                          <h4 className="font-semibold text-base mb-1 line-clamp-1">
                            {ticket.subject}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {ticket.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                            {ticket.customer?.full_name && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {ticket.customer.full_name}
                              </span>
                            )}
                            {ticket.team && (
                              <span className="flex items-center gap-1">
                                <Ticket className="h-3 w-3" />
                                {ticket.team.name}
                              </span>
                            )}
                            {ticket.assigned_agent && (
                              <span className="flex items-center gap-1">
                                Агент: {ticket.assigned_agent.full_name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(ticket.updated_at)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedTicket(ticket.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleTicketCreated}
      />
    </div>
  );
};
