import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { Vendor, VendorType, VendorStatus, Region } from '@/types/database';

export interface VendorInsert {
  vendor_name: string;
  vendor_type: VendorType;
  facilities_provided?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  representative_name?: string;
  representative_phone?: string;
  representative_email?: string;
  notes?: string;
  status?: VendorStatus;
  region: Region;
}

export interface VendorUpdate extends Partial<VendorInsert> {
  id: string;
}

export interface VendorWithStats extends Vendor {
  events_count?: number;
}

export function useVendors() {
  const { isSuperAdmin, userRegion } = useAuth();

  return useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      let query = supabase
        .from('vendors')
        .select('*')
        .order('vendor_name');

      if (!isSuperAdmin && userRegion) {
        query = query.eq('region', userRegion);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Vendor[];
    },
  });
}

// Fetch vendors with linked event counts
export function useVendorsWithStats() {
  const { isSuperAdmin, userRegion } = useAuth();

  return useQuery({
    queryKey: ['vendors-with-stats'],
    queryFn: async () => {
      // First get vendors
      let vendorQuery = supabase
        .from('vendors')
        .select('*')
        .order('vendor_name');

      if (!isSuperAdmin && userRegion) {
        vendorQuery = vendorQuery.eq('region', userRegion);
      }

      const { data: vendors, error: vendorError } = await vendorQuery;
      if (vendorError) throw vendorError;

      // Then get event_vendors counts
      const { data: eventVendors, error: evError } = await supabase
        .from('event_vendors')
        .select('vendor_id');
      
      if (evError) throw evError;

      // Count events per vendor
      const countMap = new Map<string, number>();
      eventVendors?.forEach(ev => {
        countMap.set(ev.vendor_id, (countMap.get(ev.vendor_id) || 0) + 1);
      });

      return vendors.map(vendor => ({
        ...vendor,
        events_count: countMap.get(vendor.id) || 0,
      })) as VendorWithStats[];
    },
  });
}

// Fetch all event-vendor mappings for display purposes
export function useAllEventVendors() {
  return useQuery({
    queryKey: ['all-event-vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_vendors')
        .select(`
          event_id,
          vendor_id,
          vendor:vendors(id, vendor_name, vendor_type)
        `);
      if (error) throw error;
      return data;
    },
  });
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Vendor;
    },
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendor: VendorInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('vendors')
        .insert({
          ...vendor,
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create vendor: ${error.message}`);
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: VendorUpdate) => {
      const { data, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', variables.id] });
      toast.success('Vendor updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update vendor: ${error.message}`);
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vendors').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete vendor: ${error.message}`);
    },
  });
}

// Event-Vendor linking hooks
export function useEventVendors(eventId: string) {
  return useQuery({
    queryKey: ['event-vendors', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_vendors')
        .select(`
          *,
          vendor:vendors(*)
        `)
        .eq('event_id', eventId);
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
}

export function useVendorEvents(vendorId: string) {
  return useQuery({
    queryKey: ['vendor-events', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_vendors')
        .select(`
          *,
          event:events(*, client:clients(*))
        `)
        .eq('vendor_id', vendorId);
      if (error) throw error;
      return data;
    },
    enabled: !!vendorId,
  });
}

export function useLinkVendorToEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, vendorId, notes }: { eventId: string; vendorId: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('event_vendors')
        .insert({
          event_id: eventId,
          vendor_id: vendorId,
          notes,
          assigned_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-vendors', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-events', variables.vendorId] });
      toast.success('Vendor linked to event');
    },
    onError: (error) => {
      toast.error(`Failed to link vendor: ${error.message}`);
    },
  });
}

export function useUnlinkVendorFromEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, vendorId }: { eventId: string; vendorId: string }) => {
      const { error } = await supabase
        .from('event_vendors')
        .delete()
        .eq('event_id', eventId)
        .eq('vendor_id', vendorId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-vendors', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-events', variables.vendorId] });
      toast.success('Vendor unlinked from event');
    },
    onError: (error) => {
      toast.error(`Failed to unlink vendor: ${error.message}`);
    },
  });
}
