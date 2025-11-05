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

// Получить тикеты пользователя
export const getUserTickets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        user:auth_users!user_id(full_name, email),
        assigned:auth_users!assigned_to(full_name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Get user tickets error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получить все тикеты (только админ)
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const { status } = req.query;
    
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        user:auth_users!user_id(full_name, email),
        assigned:auth_users!assigned_to(full_name)
      `);
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Get all tickets error:', error);
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
    
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        subject,
        message,
        category: category || 'general',
        priority: priority || 'medium',
        status: 'new'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Обновить тикет (только админ)
export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assigned_to, priority } = req.body;
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (status) updateData.status = status;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    if (priority) updateData.priority = priority;
    
    if (status === 'closed') {
      updateData.closed_at = new Date().toISOString();
    }
    
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Добавить комментарий к тикету
export const addComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { ticket_id, message, is_internal } = req.body;
    
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('ticket_comments')
      .insert({
        ticket_id,
        user_id: userId,
        message,
        is_internal: is_internal || false
      })
      .select()
      .single();

    if (error) throw error;

    // Обновляем updated_at тикета
    await supabase
      .from('support_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticket_id);

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получить комментарии тикета
export const getTicketComments = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('ticket_comments')
      .select(`
        *,
        author:user_id(full_name, email, role, avatar_url)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Get ticket comments error:', error);
    res.status(500).json({ error: error.message });
  }
};
