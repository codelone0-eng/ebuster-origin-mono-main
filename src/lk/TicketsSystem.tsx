import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus,
  Ticket,
  Clock,
  Users,
  Eye,
  X
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
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadTickets();
  }, [initialFilter, searchQuery]);

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
      if (initialFilter !== 'all') params.append('status', initialFilter);
      if (searchQuery) params.append('search', searchQuery);

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


  const handleCreateTicket = () => {
    setIsCreateModalOpen(true);
  };

  const handleTicketCreated = () => {
    setIsCreateModalOpen(false);
    loadTickets();
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
        }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Фильтры и поиск */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Тикеты поддержки</h2>
              <p className="text-sm text-white/60">
                Управление запросами в службу поддержки
              </p>
            </div>
            <Button onClick={handleCreateTicket} className="bg-white text-black hover:bg-white/90 rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Создать тикет
            </Button>
          </div>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <Input
                placeholder="Поиск по номеру, теме или описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-12 bg-white/5 border-white/15 text-white rounded-xl focus:border-white focus:ring-0 placeholder:text-white/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded-md transition-colors"
                >
                  <X className="h-4 w-4 text-white/60" />
                </button>
              )}
            </div>
          </div>

          {/* Список тикетов */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="mt-4 text-white/60">Загрузка тикетов...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 mx-auto text-white/60 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">Тикетов не найдено</h3>
              <p className="text-white/60 mb-4">
                {searchQuery
                  ? 'Попробуйте изменить запрос'
                  : 'Создайте первый тикет для обращения в поддержку'}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreateTicket} className="bg-white text-black hover:bg-white/90 rounded-xl">
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
                  <div
                    key={ticket.id}
                    className="rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-all cursor-pointer"
                    onClick={() => setSelectedTicket(ticket.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-mono text-white/60">
                              Тикет # {ticket.ticket_number || formatTicketNumber(ticket.id)}
                            </span>
                            <Badge
                              className={cn(
                                'text-xs rounded-lg',
                                statusInfo.color,
                                'text-white'
                              )}
                            >
                              {statusInfo.label}
                            </Badge>
                            <div className={cn('w-2 h-2 rounded-full', priorityInfo.color)} />
                          </div>
                          <h4 className="font-semibold text-base mb-1 line-clamp-1 text-white">
                            {ticket.subject}
                          </h4>
                          <p className="text-sm text-white/60 line-clamp-2 mb-2">
                            {ticket.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/40">
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
                          className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedTicket(ticket.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleTicketCreated}
      />
    </div>
  );
};
