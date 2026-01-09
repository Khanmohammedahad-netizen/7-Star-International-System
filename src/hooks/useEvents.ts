import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Event = Tables<'events'> & {
  clients?: Tables<'clients'>;
};
export type EventInsert = TablesInsert<'events'>;
export type EventUpdate = TablesUpdate<'events'>;

export function useEvents() {
  const { userRole, isSuperAdmin } = useAuth();

  return useQuery({
    queryKey: ['events', userRole?.region],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*, clients(*)')
        .order('event_date', { ascending: false });
      
      if (!isSuperAdmin && userRole?.region) {
        query = query.eq('region', userRole.region);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Event[];
    },
    enabled: !!userRole,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, clients(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Event;
    },
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: EventInsert) => {
      const { data, error } = await supabase
        .from('events')
        .insert(event)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create event: ${error.message}`);
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: EventUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', variables.id] });
      toast.success('Event updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update event: ${error.message}`);
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete event: ${error.message}`);
    },
  });
}

export function useApproveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' | 'completed' }) => {
      const { data, error } = await supabase
        .from('events')
        .update({ 
          status,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', variables.id] });
      toast.success(`Event ${variables.status} successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to update event status: ${error.message}`);
    },
  });
}
