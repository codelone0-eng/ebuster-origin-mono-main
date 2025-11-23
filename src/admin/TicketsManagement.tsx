import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusProgress } from '@/components/ui/status-progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Ticket as TicketIcon, 
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
  XCircle,
  Search,
  MoreVertical,
  Send,
  ChevronLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';
import { FileUpload } from '@/components/ui/file-upload';
import { AttachmentList } from '@/components/ui/attachment-list';

interface Attachment {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type?: string;
  created_at: string;
}

interface Ticket {
  id: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'open' | 'pending_customer' | 'pending_internal' | 'resolved' | 'closed';
  user_id: string;
  client?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  assigned_to?: string;
  agent?: {
    id?: string;
    full_name: string;
    email?: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

const normalizeTicket = (ticket: any): Ticket => {
  const client = ticket.client ?? ticket.customer ?? (ticket.user
    ? {
        id: ticket.user.id,
        full_name: ticket.user.full_name,
        email: ticket.user.email,
        avatar_url: ticket.user.avatar_url
      }
    : undefined);

  const agent = ticket.agent ?? ticket.assigned_agent ?? (ticket.assigned_to_user
    ? {
        id: ticket.assigned_to_user.id,
        full_name: ticket.assigned_to_user.full_name,
        email: ticket.assigned_to_user.email,
        avatar_url: ticket.assigned_to_user.avatar_url
      }
    : undefined);

  return {
    ...ticket,
    client,
    agent,
    assigned_to: ticket.assigned_to ?? ticket.assigned_agent_id ?? ticket.assigned_to_id,
  };
};

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
  attachments?: Attachment[];
}

const TicketsManagement: React.FC = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const messagesChannelRef = useRef<RealtimeChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const statusColors = {
    new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    open: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    pending_customer: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    pending_internal: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
    closed: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  };

  const priorityColors = {
    low: 'text-gray-400',
    medium: 'text-blue-400',
    high: 'text-orange-400',
    critical: 'text-red-500'
  };

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter]);

  // Realtime updates
  useEffect(() => {
    if (!selectedTicket) {
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
      }
      return;
    }

    // Load messages initially
    loadMessages(selectedTicket.id);

    const ticketId = selectedTicket.id;
    const normalizedTicketId = String(ticketId);
    const channel = supabase.channel(`admin-ticket-messages-${normalizedTicketId}`);
    messagesChannelRef.current = channel;

    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'ticket_messages',
      filter: `ticket_id=eq.${normalizedTicketId}`
    }, async () => {
      await loadMessages(ticketId);
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTicket?.id]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ebuster_token');
      
      let url = 'https://api.ebuster.ru/api/tickets/all?';
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      
      url += params.toString();
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        const normalized = (data.data || []).map((ticket: any) => normalizeTicket(ticket));
        setTickets(normalized);
      }
    } catch (error) {
      console.error('Load tickets error:', error);
      toast({ title: 'Error', description: 'Failed to load tickets', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (ticketId: string) => {
    try {
      const token = localStorage.getItem('ebuster_token');
      const response = await fetch(`https://api.ebuster.ru/api/tickets/${ticketId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Load messages error:', error);
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !selectedTicket || isSending) return;

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
        setSelectedFiles([]);
        loadMessages(selectedTicket.id);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
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
        setSelectedTicket(prev => prev ? { ...prev, status: status as any } : null);
        loadTickets(); // Refresh list
        toast({ title: 'Status updated', variant: 'success' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.client?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.includes(searchQuery)
  );

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg overflow-hidden">
      <div className="grid h-full grid-cols-[350px_1fr] divide-x divide-[#2d2d2d]">
        
        {/* Left Sidebar - Ticket List */}
        <aside className="flex h-full flex-col bg-[#1a1a1a]">
          <div className="p-4 border-b border-[#2d2d2d] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <TicketIcon className="h-4 w-4" /> Tickets
              </h2>
              <Button variant="ghost" size="icon" onClick={loadTickets} className="h-7 w-7">
                <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 bg-[#111111] border-[#2d2d2d] text-xs"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-7 text-xs bg-[#111111] border-[#2d2d2d] flex-1">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending_customer">Pending Client</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-7 text-xs bg-[#111111] border-[#2d2d2d] w-[100px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {filteredTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={cn(
                    "flex flex-col items-start p-3 text-left border-b border-[#2d2d2d] hover:bg-[#2d2d2d]/50 transition-colors",
                    selectedTicket?.id === ticket.id && "bg-[#2d2d2d] border-l-2 border-l-blue-500 pl-[10px]"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-2 max-w-[70%]">
                       <span className={cn("w-2 h-2 rounded-full flex-shrink-0", priorityColors[ticket.priority].replace('text-', 'bg-'))} />
                       <span className="font-medium text-sm text-white truncate">{ticket.subject}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2 w-full line-clamp-1">
                    {ticket.client?.email}
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <Badge variant="outline" className={cn("text-[10px] px-1 py-0 h-4 border-0 font-normal", statusColors[ticket.status])}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                       #{ticket.id.slice(0, 6)}
                    </span>
                  </div>
                </button>
              ))}
              {filteredTickets.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">No tickets found</div>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Right Content - Chat/Details */}
        <main className="flex h-full flex-col bg-[#1f1f1f] overflow-hidden relative">
          {selectedTicket ? (
            <>
              {/* Ticket Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#2d2d2d] bg-[#1a1a1a]">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedTicket(null)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{selectedTicket.client?.full_name} ({selectedTicket.client?.email})</span>
                      <span>•</span>
                      <span>Created {new Date(selectedTicket.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedTicket.status} onValueChange={updateTicketStatus}>
                    <SelectTrigger className={cn("h-8 w-[140px] border-0 text-xs", statusColors[selectedTicket.status])}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending_customer">Pending Customer</SelectItem>
                      <SelectItem value="pending_internal">Pending Internal</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Chat Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-3xl mx-auto">
                  {/* Ticket Description */}
                  <div className="bg-[#2d2d2d]/50 p-4 rounded-lg border border-[#2d2d2d] mb-6">
                    <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                       <User className="h-3 w-3" /> 
                       <span className="font-medium text-white">{selectedTicket.client?.full_name}</span>
                       original request:
                    </div>
                    <p className="text-sm text-white whitespace-pre-wrap">{selectedTicket.message}</p>
                  </div>

                  {/* Messages */}
                  {messages.map((msg) => {
                    const isAgent = msg.author_id !== selectedTicket.user_id;
                    return (
                      <div key={msg.id} className={cn("flex gap-3", isAgent ? "flex-row-reverse" : "flex-row")}>
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage src={isAgent ? undefined : msg.author?.avatar_url} />
                          <AvatarFallback className={isAgent ? "bg-blue-600 text-white" : "bg-[#333] text-white"}>
                            {isAgent ? "S" : msg.author?.full_name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "flex flex-col max-w-[80%]",
                          isAgent ? "items-end" : "items-start"
                        )}>
                          <div className={cn(
                            "p-3 rounded-lg text-sm whitespace-pre-wrap",
                            isAgent 
                              ? "bg-blue-600 text-white rounded-tr-none" 
                              : "bg-[#2d2d2d] text-gray-200 rounded-tl-none"
                          )}>
                            {msg.message}
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-1">
                            {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          {msg.attachments && msg.attachments.length > 0 && (
                             <div className="mt-1 w-full">
                                <AttachmentList attachments={msg.attachments} canDelete={false} />
                             </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-[#2d2d2d] bg-[#1a1a1a]">
                <div className="max-w-3xl mx-auto space-y-3">
                  {selectedFiles.length > 0 && (
                    <AttachmentList 
                      attachments={selectedFiles.map((f, i) => ({
                        id: `temp-${i}`,
                        filename: f.name,
                        original_filename: f.name,
                        file_path: URL.createObjectURL(f),
                        file_size: f.size,
                        created_at: new Date().toISOString()
                      }))}
                      canDelete={true}
                      onDelete={(id) => {
                        const idx = parseInt(id.split('-')[1]);
                        setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
                      }}
                    />
                  )}
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 relative">
                      <Textarea
                        placeholder="Reply to ticket..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        className="min-h-[80px] bg-[#111111] border-[#2d2d2d] text-white resize-none pr-10"
                      />
                      <div className="absolute bottom-2 right-2">
                        <FileUpload
                          onFileSelect={setSelectedFiles}
                          maxFiles={5}
                          maxSize={10 * 1024 * 1024}
                          disabled={isSending}
                        >
                          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-[#2d2d2d]">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </FileUpload>
                      </div>
                    </div>
                    <Button 
                      onClick={sendMessage} 
                      disabled={(!newMessage.trim() && selectedFiles.length === 0) || isSending}
                      className="h-[80px] w-[80px] bg-blue-600 hover:bg-blue-700"
                    >
                      {isSending ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
              <p>Select a ticket to view details</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TicketsManagement;
