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

const TICKET_SELECT = `
  id,
  ticket_number,
  user_id,
  user_email,
  subject,
  message,
  priority,
  status,
  category,
  created_at,
  updated_at,
  closed_at
`;

const ensureAuthenticated = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  return { userId, role: (req as any).user?.role || 'user' };
};

const generateTicketNumber = () => {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TICKET-${Date.now()}-${suffix}`;
};

export const getUserTickets = async (req: Request, res: Response) => {
  const auth = ensureAuthenticated(req, res);
  if (!auth) return;

  try {
    const supabase = getSupabase();
    const { status, priority, search } = req.query;

    let query = supabase
      .from('tickets')
      .select(TICKET_SELECT)
      .order('created_at', { ascending: false });

    if (auth.role !== 'admin') {
      query = query.eq('user_id', auth.userId);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (search) {
      query = query.or(`subject.ilike.%${search}%,message.ilike.%${search}%,ticket_number.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Get user tickets error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllTickets = async (req: Request, res: Response) => {
  const auth = ensureAuthenticated(req, res);
  if (!auth) return;

  if (auth.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const supabase = getSupabase();
    const { status, priority, search, page = 1, limit = 50 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('tickets')
      .select(TICKET_SELECT, { count: 'exact' })
      .range(offset, offset + Number(limit) - 1)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (search) {
      query = query.or(`subject.ilike.%${search}%,message.ilike.%${search}%,ticket_number.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      count: count || 0,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error: any) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getTicket = async (req: Request, res: Response) => {
  const auth = ensureAuthenticated(req, res);
  if (!auth) return;

  try {
    const supabase = getSupabase();
    const { id } = req.params;

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(TICKET_SELECT)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (auth.role !== 'admin' && ticket.user_id !== auth.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ success: true, data: ticket });
  } catch (error: any) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createTicket = async (req: Request, res: Response) => {
  const auth = ensureAuthenticated(req, res);
  if (!auth) return;

  try {
    const supabase = getSupabase();
    const { subject, message, priority = 'medium', category = 'general' } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    const payload = {
      ticket_number: generateTicketNumber(),
      user_id: auth.userId,
      user_email: (req as any).user?.email || null,
      subject,
      message,
      priority,
      category,
      status: 'new'
    };

    const { data, error } = await supabase
      .from('tickets')
      .insert(payload)
      .select(TICKET_SELECT)
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error: any) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateTicket = async (req: Request, res: Response) => {
  const auth = ensureAuthenticated(req, res);
  if (!auth) return;

  if (auth.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const supabase = getSupabase();
    const { id } = req.params;
    const { status, priority, category, message } = req.body;

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
      updateData.updated_at = new Date().toISOString();
      updateData.closed_at = status === 'closed' ? new Date().toISOString() : null;
    }

    if (priority) {
      updateData.priority = priority;
      updateData.updated_at = updateData.updated_at || new Date().toISOString();
    }

    if (category) {
      updateData.category = category;
      updateData.updated_at = updateData.updated_at || new Date().toISOString();
    }

    if (message) {
      updateData.message = message;
      updateData.updated_at = updateData.updated_at || new Date().toISOString();
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const { data, error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', id)
      .select(TICKET_SELECT)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const addMessage = async (req: Request, res: Response) => {
  const auth = ensureAuthenticated(req, res);
  if (!auth) return;

  try {
    const supabase = getSupabase();
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('user_id, status')
      .eq('id', id)
      .single();

    if (ticketError) throw ticketError;

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (auth.role !== 'admin' && ticket.user_id !== auth.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { data, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: id,
        user_id: auth.userId,
        message,
        is_admin: auth.role === 'admin'
      })
      .select('*')
      .single();

    if (error) throw error;

    await supabase
      .from('tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Add message error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getTicketMessages = async (req: Request, res: Response) => {
  const auth = ensureAuthenticated(req, res);
  if (!auth) return;

  try {
    const supabase = getSupabase();
    const { id } = req.params;

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('user_id')
      .eq('id', id)
      .single();

    if (ticketError) throw ticketError;

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (auth.role !== 'admin' && ticket.user_id !== auth.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Get ticket messages error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getTicketStats = async (req: Request, res: Response) => {
  const auth = ensureAuthenticated(req, res);
  if (!auth) return;

  if (auth.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('tickets')
      .select('status');

    if (error) throw error;

    const stats = (data || []).reduce<Record<string, number>>((acc, ticket) => {
      const status = ticket.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      acc.total = (acc.total || 0) + 1;
      return acc;
    }, { total: 0 });

    res.json({ success: true, data: stats });
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
