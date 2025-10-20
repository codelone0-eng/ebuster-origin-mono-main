/**
 * Supabase Client
 * Main client for database operations and authentication
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY } from './supabase.config';

// Singleton pattern to prevent multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null;
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

// Main client for user operations
export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'sb-auth-token',
        flowType: 'pkce'
      }
    });
  }
  return supabaseInstance;
})();

// Admin client for server-side operations
export const supabaseAdmin = (() => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseAdminInstance;
})();

// Database types (will be generated from Supabase)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'user' | 'admin' | 'moderator';
          created_at: string;
          updated_at: string;
          last_sign_in: string | null;
          is_banned: boolean;
          ban_reason: string | null;
          ban_expires_at: string | null;
          subscription_type: 'free' | 'premium' | 'pro';
          subscription_expires_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin' | 'moderator';
          created_at?: string;
          updated_at?: string;
          last_sign_in?: string | null;
          is_banned?: boolean;
          ban_reason?: string | null;
          ban_expires_at?: string | null;
          subscription_type?: 'free' | 'premium' | 'pro';
          subscription_expires_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin' | 'moderator';
          created_at?: string;
          updated_at?: string;
          last_sign_in?: string | null;
          is_banned?: boolean;
          ban_reason?: string | null;
          ban_expires_at?: string | null;
          subscription_type?: 'free' | 'premium' | 'pro';
          subscription_expires_at?: string | null;
        };
      };
      scripts: {
        Row: {
          id: string;
          name: string;
          description: string;
          version: string;
          author: string;
          file_size: number;
          download_count: number;
          rating: number;
          tags: string[];
          category: string;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          file_url: string | null;
          icon_url: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          version: string;
          author: string;
          file_size: number;
          download_count?: number;
          rating?: number;
          tags: string[];
          category: string;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          file_url?: string | null;
          icon_url?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          version?: string;
          author?: string;
          file_size?: number;
          download_count?: number;
          rating?: number;
          tags?: string[];
          category?: string;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          file_url?: string | null;
          icon_url?: string | null;
        };
      };
      tickets: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          description: string;
          status: 'open' | 'in_progress' | 'resolved' | 'closed';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          category: string;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
          assigned_to: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          description: string;
          status?: 'open' | 'in_progress' | 'resolved' | 'closed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          category: string;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
          assigned_to?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          description?: string;
          status?: 'open' | 'in_progress' | 'resolved' | 'closed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          category?: string;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
          assigned_to?: string | null;
        };
      };
      user_scripts: {
        Row: {
          id: string;
          user_id: string;
          script_id: string;
          installed_at: string;
          is_active: boolean;
          settings: Record<string, any> | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          script_id: string;
          installed_at?: string;
          is_active?: boolean;
          settings?: Record<string, any> | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          script_id?: string;
          installed_at?: string;
          is_active?: boolean;
          settings?: Record<string, any> | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Typed client - используем singleton
export const typedSupabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'sb-auth-token',
        flowType: 'pkce'
      }
    });
  }
  return supabaseInstance;
})();

export const typedSupabaseAdmin = (() => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseAdminInstance;
})();
