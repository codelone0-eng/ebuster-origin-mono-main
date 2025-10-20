/**
 * Supabase Configuration
 * Centralized configuration for Supabase client
 */

export const SUPABASE_CONFIG = {
  url: 'https://dzvpnlersyitinfvthdf.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dnBubGVyc3lpdGluZnZ0aGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MjU2MzIsImV4cCI6MjA3NTUwMTYzMn0.AHXDOWm5nqlZSKTHmWpYYQ3lGTziVL3WQLtb5Me4uaw',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dnBubGVyc3lpdGluZnZ0aGRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkyNTYzMiwiZXhwIjoyMDc1NTAxNjMyfQ.MGe7hAX2HfTCv1WPw8x4uO1DjGIntS-Za3xXUVZ_Z8w'
} as const;

// Environment variables fallback
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || SUPABASE_CONFIG.url;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;
export const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || SUPABASE_CONFIG.serviceKey;
