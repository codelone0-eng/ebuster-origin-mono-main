/**
 * Supabase API Functions
 * High-level functions for database operations
 */

import { typedSupabase, typedSupabaseAdmin } from './supabase';
import type { Database } from './supabase';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

type Script = Database['public']['Tables']['scripts']['Row'];
type ScriptInsert = Database['public']['Tables']['scripts']['Insert'];
type ScriptUpdate = Database['public']['Tables']['scripts']['Update'];

type Ticket = Database['public']['Tables']['tickets']['Row'];
type TicketInsert = Database['public']['Tables']['tickets']['Insert'];
type TicketUpdate = Database['public']['Tables']['tickets']['Update'];

type UserScript = Database['public']['Tables']['user_scripts']['Row'];
type UserScriptInsert = Database['public']['Tables']['user_scripts']['Insert'];
type UserScriptUpdate = Database['public']['Tables']['user_scripts']['Update'];

// ===== AUTHENTICATION =====

export const authApi = {
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await typedSupabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await typedSupabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await typedSupabase.auth.signOut();
    return { error };
  },

  async resetPassword(email: string) {
    const { data, error } = await typedSupabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    return { data, error };
  },

  async updatePassword(password: string) {
    const { data, error } = await typedSupabase.auth.updateUser({
      password
    });
    return { data, error };
  },

  async getCurrentUser() {
    const { data: { user }, error } = await typedSupabase.auth.getUser();
    return { user, error };
  },

  async getSession() {
    const { data: { session }, error } = await typedSupabase.auth.getSession();
    return { session, error };
  }
};

// ===== USERS =====

export const usersApi = {
  async getCurrentUserProfile() {
    const { data: { user } } = await typedSupabase.auth.getUser();
    if (!user) return { data: null, error: null };

    const { data, error } = await typedSupabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return { data, error };
  },

  async updateUserProfile(updates: UserUpdate) {
    const { data: { user } } = await typedSupabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    // Ограничиваем поля, которые может изменять пользователь
    const allowedFields = {
      full_name: updates.full_name,
      avatar_url: updates.avatar_url,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await typedSupabase
      .from('users')
      .update(allowedFields)
      .eq('id', user.id)
      .select()
      .single();

    return { data, error };
  },

  async getAllUsers() {
    const { data, error } = await typedSupabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getUserById(id: string) {
    const { data, error } = await typedSupabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  async banUser(id: string, reason: string, expiresAt?: string) {
    const { data, error } = await typedSupabaseAdmin
      .from('users')
      .update({
        is_banned: true,
        ban_reason: reason,
        ban_expires_at: expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async unbanUser(id: string) {
    const { data, error } = await typedSupabaseAdmin
      .from('users')
      .update({
        is_banned: false,
        ban_reason: null,
        ban_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async deleteUser(id: string) {
    // Сначала удаляем из auth.users (это вызовет каскадное удаление из users)
    const { error: authError } = await typedSupabaseAdmin.auth.admin.deleteUser(id);
    
    if (authError) {
      return { error: authError };
    }

    return { error: null };
  },

  async updateUserRole(id: string, role: 'user' | 'admin' | 'moderator') {
    const { data, error } = await typedSupabaseAdmin
      .from('users')
      .update({
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async updateUserSubscription(id: string, subscriptionType: 'free' | 'premium' | 'pro', expiresAt?: string) {
    const { data, error } = await typedSupabaseAdmin
      .from('users')
      .update({
        subscription_type: subscriptionType,
        subscription_expires_at: expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }
};

// ===== SCRIPTS =====

export const scriptsApi = {
  async getAllScripts() {
    const { data, error } = await typedSupabase
      .from('scripts')
      .select('*')
      .eq('is_active', true)
      .order('download_count', { ascending: false });

    return { data, error };
  },

  async getScriptById(id: string) {
    const { data, error } = await typedSupabase
      .from('scripts')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  async searchScripts(query: string) {
    const { data, error } = await typedSupabase
      .from('scripts')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
      .eq('is_active', true)
      .order('download_count', { ascending: false });

    return { data, error };
  },

  async createScript(script: ScriptInsert) {
    const { data, error } = await typedSupabaseAdmin
      .from('scripts')
      .insert(script)
      .select()
      .single();

    return { data, error };
  },

  async updateScript(id: string, updates: ScriptUpdate) {
    const { data, error } = await typedSupabaseAdmin
      .from('scripts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async deleteScript(id: string) {
    const { error } = await typedSupabaseAdmin
      .from('scripts')
      .delete()
      .eq('id', id);

    return { error };
  },

  async incrementDownloadCount(id: string) {
    const { data, error } = await typedSupabase
      .from('scripts')
      .update({
        download_count: typedSupabase.raw('download_count + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }
};

// ===== USER SCRIPTS =====

export const userScriptsApi = {
  async getUserScripts() {
    const { data: { user } } = await typedSupabase.auth.getUser();
    if (!user) return { data: null, error: null };

    const { data, error } = await typedSupabase
      .from('user_scripts')
      .select(`
        *,
        scripts (*)
      `)
      .eq('user_id', user.id)
      .order('installed_at', { ascending: false });

    return { data, error };
  },

  async installScript(scriptId: string) {
    const { data: { user } } = await typedSupabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await typedSupabase
      .from('user_scripts')
      .insert({
        user_id: user.id,
        script_id: scriptId,
        is_active: true
      })
      .select()
      .single();

    return { data, error };
  },

  async uninstallScript(scriptId: string) {
    const { data: { user } } = await typedSupabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { error } = await typedSupabase
      .from('user_scripts')
      .delete()
      .eq('user_id', user.id)
      .eq('script_id', scriptId);

    return { error };
  },

  async updateScriptSettings(scriptId: string, settings: Record<string, any>) {
    const { data: { user } } = await typedSupabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await typedSupabase
      .from('user_scripts')
      .update({ settings })
      .eq('user_id', user.id)
      .eq('script_id', scriptId)
      .select()
      .single();

    return { data, error };
  }
};

// ===== TICKETS =====

export const ticketsApi = {
  async getUserTickets() {
    const { data: { user } } = await typedSupabase.auth.getUser();
    if (!user) return { data: null, error: null };

    const { data, error } = await typedSupabase
      .from('tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async createTicket(ticket: TicketInsert) {
    const { data: { user } } = await typedSupabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await typedSupabase
      .from('tickets')
      .insert({
        ...ticket,
        user_id: user.id
      })
      .select()
      .single();

    return { data, error };
  },

  async updateTicket(id: string, updates: TicketUpdate) {
    const { data, error } = await typedSupabase
      .from('tickets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async getAllTickets() {
    const { data, error } = await typedSupabaseAdmin
      .from('tickets')
      .select(`
        *,
        users (full_name, email)
      `)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getTicketById(id: string) {
    const { data, error } = await typedSupabase
      .from('tickets')
      .select(`
        *,
        users (full_name, email)
      `)
      .eq('id', id)
      .single();

    return { data, error };
  }
};
