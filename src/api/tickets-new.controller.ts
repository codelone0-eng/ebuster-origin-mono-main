import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });
};


// Получить тикеты пользователя (клиент видит только свои)
export const getUserTickets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { status, priority, category, search } = req.query;
    const supabase = getSupabase();
    
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        user:auth_users(full_name, email, avatar_url)
      `)
      ;

    // Клиенты видят только свои тикеты
    if (userRole !== 'admin' && userRole !== 'agent') {
      query = query.eq('user_id', userId);
    }
    
    // Фильтры
    if (status && status !== 'all') query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (category) query = query.eq('category', category);
    if (search) {
      query = query.or(`subject.ilike.%${search}%,message.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Get user tickets error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получить все тикеты (админы и агенты)
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    
    if (!userId || (userRole !== 'admin' && userRole !== 'agent')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { status, priority, team_id, assigned_to, search, page = 1, limit = 50 } = req.query;
    const supabase = getSupabase();
    
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        client:user_id (id, full_name, email, avatar_url),
        agent:assigned_to (id, full_name, email, avatar_url)
      `, { count: 'exact' })
      ;
    
    // Агенты видят только тикеты своих команд
    if (userRole === 'agent') {
      const { data: teams } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId);
      
      if (teams && teams.length > 0) {
        const teamIds = teams.map(t => t.team_id);
        query = query.in('team_id', teamIds);
      } else {
        return res.json({ success: true, data: [], count: 0 });
      }
    }
    
    // Фильтры
    if (status && status !== 'all') query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (team_id) query = query.eq('team_id', team_id);
    if (assigned_to) query = query.eq('assigned_agent_id', assigned_to);
    if (search) {
      query = query.or(`subject.ilike.%${search}%,description.ilike.%${search}%,ticket_number.ilike.%${search}%`);
    }

    // Пагинация
    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data, count, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получить один тикет
export const getTicket = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = getSupabase();
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
            .single();

    if (error) throw error;
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Проверка прав доступа
    if (userRole !== 'admin' && userRole !== 'agent' && ticket.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ success: true, data: ticket });
  } catch (error: any) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Создать тикет
export const createTicket = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { subject, message, category, priority } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    const supabase = getSupabase();
    
    // Создаем тикет
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        subject,
        message,
        category: category || 'general',
        priority: priority || 'medium',
        status: 'new'
      })
      .select('*')
      .single();

    if (ticketError) throw ticketError;

    res.json({ success: true, data: ticket });
  } catch (error: any) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Обновить тикет
export const updateTicket = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { id } = req.params;
    const { status, assigned_agent_id, priority, team_id, tags } = req.body;
    
    if (!userId || (userRole !== 'admin' && userRole !== 'agent')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const supabase = getSupabase();
    
    // Получаем текущий тикет
    const { data: oldTicket } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (!oldTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const updateData: any = {};
    
    // Обновляем поля
    if (status !== undefined && status !== oldTicket.status) {
      updateData.status = status;
      updateData.updated_at = new Date().toISOString();
      
      if (status === 'closed' && !oldTicket.closed_at) {
        updateData.closed_at = new Date().toISOString();
      }
    }
    
    if (assigned_agent_id !== undefined && assigned_agent_id !== oldTicket.assigned_to) {
      updateData.assigned_to = assigned_agent_id;
      if (!updateData.updated_at) updateData.updated_at = new Date().toISOString();
    }
    
    if (priority && priority !== oldTicket.priority) {
      updateData.priority = priority;
      if (!updateData.updated_at) updateData.updated_at = new Date().toISOString();
    }
    
    if (tags) {
      updateData.tags = tags;
      if (!updateData.updated_at) updateData.updated_at = new Date().toISOString();
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.json({ success: true, data: oldTicket });
    }
    
    const { data, error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Добавить сообщение к тикету
export const addMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { id } = req.params;
    const { message, is_internal } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const isInternalNote = is_internal && (userRole === 'admin' || userRole === 'agent');
    
    const supabase = getSupabase();
    
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('user_id, status, assigned_to')
      .eq('id', id)
      .single();

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (userRole !== 'admin' && userRole !== 'agent' && ticket.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { data: newMessage, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: id,
        author_id: userId,
        message,
        is_internal: isInternalNote || false,
        is_system: false
      })
      .select(`
        *,
        author:auth_users(id, full_name, email, avatar_url, role)
      `)
      .single();

    if (error) throw error;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (ticket.status === 'new' && ticket.assigned_to) {
      updateData.status = 'open';
    }
    
    if (ticket.status === 'pending_customer' && ticket.user_id === userId) {
      updateData.status = 'open';
    }

    if (Object.keys(updateData).length > 0) {
      await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', id);
    }

    res.json({ success: true, data: newMessage });
  } catch (error: any) {
    console.error('Add message error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получить сообщения тикета
export const getTicketMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = getSupabase();
    
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (userRole !== 'admin' && userRole !== 'agent' && ticket.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    let query = supabase
      .from('ticket_messages')
      .select(`
        *,
        author:auth_users(id, full_name, email, avatar_url, role),
        attachments:ticket_attachments(*)
      `)
      .eq('ticket_id', id);

    // Клиенты не видят внутренние заметки
    if (userRole !== 'admin' && userRole !== 'agent') {
      query = query.or('is_internal.eq.false,is_internal.is.null');
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Get ticket messages error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Загрузить вложение
export const uploadAttachment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { ticketId, messageId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = getSupabase();
    
    // Проверяем права доступа к тикету
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('user_id')
      .eq('id', ticketId)
      .single();

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (userRole !== 'admin' && ticket.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // TODO: Реализовать полную загрузку файла через Supabase Storage
    // Пока возвращаем заглушку с URL для загрузки
    res.json({ 
      success: true, 
      data: { 
        message: 'File upload ready',
        uploadUrl: `/storage/ticket-attachments/${ticketId}/${messageId || 'ticket'}/`,
        ticketId,
        messageId 
      } 
    });
  } catch (error: any) {
    console.error('Upload attachment error:', error);
    res.status(500).json({ error: error.message });
  }
};


// Получить статистику (dashboard)
export const getTicketStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    
    if (!userId || (userRole !== 'admin' && userRole !== 'agent')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const supabase = getSupabase();
    
    const { data: statusCounts } = await supabase
      .from('support_tickets')
      .select('status')
      ;

    const stats = {
      new: statusCounts?.filter(t => t.status === 'new').length || 0,
      open: statusCounts?.filter(t => t.status === 'open').length || 0,
      pending_customer: statusCounts?.filter(t => t.status === 'pending_customer').length || 0,
      pending_internal: statusCounts?.filter(t => t.status === 'pending_internal').length || 0,
      resolved: statusCounts?.filter(t => t.status === 'resolved').length || 0,
      closed: statusCounts?.filter(t => t.status === 'closed').length || 0,
      total: statusCounts?.length || 0
    };

    const { data: responseTime } = await supabase
      .from('support_tickets')
      .select('created_at, first_response_at')
      .not('first_response_at', 'is', null)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    let avgResponseTime = 0;
    if (responseTime && responseTime.length > 0) {
      const times = responseTime.map(t => {
        const created = new Date(t.created_at).getTime();
        const responded = new Date(t.first_response_at).getTime();
        return (responded - created) / (1000 * 60 * 60);
      });
      avgResponseTime = times.reduce((a, b) => a + b, 0) / times.length;
    }

    res.json({ 
      success: true, 
      data: {
        ...stats,
        avgResponseTimeHours: Math.round(avgResponseTime * 10) / 10
      }
    });
  } catch (error: any) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получить команды поддержки
export const getSupportTeams = async (req: Request, res: Response) => {
  try {
    // TODO: Таблица support_teams еще не создана, возвращаем пустой массив
    res.json({ success: true, data: [] });
  } catch (error: any) {
    console.error('Get support teams error:', error);
    res.status(500).json({ error: error.message });
  }
};
