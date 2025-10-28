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

// Получить все категории
export const getCategories = async (req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('script_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Создать категорию (только админ)
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, icon, color, display_order } = req.body;
    
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('script_categories')
      .insert({
        name,
        slug,
        description,
        icon,
        color,
        display_order: display_order || 0
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Create category error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Обновить категорию (только админ)
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, color, display_order, is_active } = req.body;
    
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('script_categories')
      .update({
        name,
        slug,
        description,
        icon,
        color,
        display_order,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Update category error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Удалить категорию (только админ)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const supabase = getSupabase();
    const { error } = await supabase
      .from('script_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: error.message });
  }
};
