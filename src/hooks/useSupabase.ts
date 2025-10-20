/**
 * Supabase Data Hooks
 * Custom hooks for working with Supabase data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, scriptsApi, ticketsApi, userScriptsApi } from '@/lib/supabase-api';
import { useAuth } from '@/contexts/AuthContext';

// ===== USERS =====

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAllUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getUserById(id),
    enabled: !!id,
  });
};

export const useCurrentUserProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: usersApi.getCurrentUserProfile,
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason, expiresAt }: { id: string; reason: string; expiresAt?: string }) =>
      usersApi.banUser(id, reason, expiresAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => usersApi.unbanUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// ===== SCRIPTS =====

export const useScripts = () => {
  return useQuery({
    queryKey: ['scripts'],
    queryFn: scriptsApi.getAllScripts,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useScript = (id: string) => {
  return useQuery({
    queryKey: ['script', id],
    queryFn: () => scriptsApi.getScriptById(id),
    enabled: !!id,
  });
};

export const useSearchScripts = (query: string) => {
  return useQuery({
    queryKey: ['scripts', 'search', query],
    queryFn: () => scriptsApi.searchScripts(query),
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateScript = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: scriptsApi.createScript,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] });
    },
  });
};

export const useUpdateScript = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      scriptsApi.updateScript(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] });
    },
  });
};

export const useDeleteScript = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => scriptsApi.deleteScript(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] });
    },
  });
};

export const useIncrementDownloadCount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => scriptsApi.incrementDownloadCount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] });
    },
  });
};

// ===== USER SCRIPTS =====

export const useUserScripts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userScripts'],
    queryFn: userScriptsApi.getUserScripts,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInstallScript = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (scriptId: string) => userScriptsApi.installScript(scriptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userScripts'] });
      queryClient.invalidateQueries({ queryKey: ['scripts'] });
    },
  });
};

export const useUninstallScript = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (scriptId: string) => userScriptsApi.uninstallScript(scriptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userScripts'] });
      queryClient.invalidateQueries({ queryKey: ['scripts'] });
    },
  });
};

export const useUpdateScriptSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ scriptId, settings }: { scriptId: string; settings: Record<string, any> }) =>
      userScriptsApi.updateScriptSettings(scriptId, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userScripts'] });
    },
  });
};

// ===== TICKETS =====

export const useUserTickets = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userTickets'],
    queryFn: ticketsApi.getUserTickets,
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAllTickets = () => {
  return useQuery({
    queryKey: ['allTickets'],
    queryFn: ticketsApi.getAllTickets,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.getTicketById(id),
    enabled: !!id,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ticketsApi.createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTickets'] });
      queryClient.invalidateQueries({ queryKey: ['allTickets'] });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      ticketsApi.updateTicket(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTickets'] });
      queryClient.invalidateQueries({ queryKey: ['allTickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket'] });
    },
  });
};
