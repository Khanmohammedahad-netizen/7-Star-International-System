import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Quotation = Tables<'quotations'> & {
  clients?: Tables<'clients'>;
  quotation_items?: Tables<'quotation_items'>[];
};
export type QuotationInsert = TablesInsert<'quotations'>;
export type QuotationUpdate = TablesUpdate<'quotations'>;
export type QuotationItemInsert = TablesInsert<'quotation_items'>;

export function useQuotations() {
  const { userRole, isSuperAdmin } = useAuth();

  return useQuery({
    queryKey: ['quotations', userRole?.region],
    queryFn: async () => {
      let query = supabase
        .from('quotations')
        .select('*, clients(*)')
        .order('quotation_date', { ascending: false });
      
      if (!isSuperAdmin && userRole?.region) {
        query = query.eq('region', userRole.region);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Quotation[];
    },
    enabled: !!userRole,
  });
}

export function useQuotation(id: string) {
  return useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select('*, clients(*), quotation_items(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Quotation;
    },
    enabled: !!id,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ items, ...quotation }: QuotationInsert & { items: Omit<QuotationItemInsert, 'quotation_id'>[] }) => {
      const { data: quotationData, error: quotationError } = await supabase
        .from('quotations')
        .insert(quotation)
        .select()
        .single();
      if (quotationError) throw quotationError;

      if (items.length > 0) {
        // Calculate amount for each item (quantity * rate) before inserting
        const itemsWithQuotationId = items.map(item => ({
          quotation_id: quotationData.id,
          serial_no: item.serial_no,
          description: item.description,
          size: item.size || null,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate, // Always calculate amount
        }));
        const { error: itemsError } = await supabase
          .from('quotation_items')
          .insert(itemsWithQuotationId);
        if (itemsError) throw itemsError;
      }

      return quotationData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create quotation: ${error.message}`);
    },
  });
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, items, ...updates }: QuotationUpdate & { id: string; items?: Omit<QuotationItemInsert, 'quotation_id'>[] }) => {
      const { data, error } = await supabase
        .from('quotations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      if (items) {
        // Delete existing items and insert new ones
        await supabase.from('quotation_items').delete().eq('quotation_id', id);
        if (items.length > 0) {
          // Calculate amount for each item (quantity * rate) before inserting
          const itemsWithQuotationId = items.map(item => ({
            quotation_id: id,
            serial_no: item.serial_no,
            description: item.description,
            size: item.size || null,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate, // Always calculate amount
          }));
          const { error: itemsError } = await supabase
            .from('quotation_items')
            .insert(itemsWithQuotationId);
          if (itemsError) throw itemsError;
        }
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', variables.id] });
      toast.success('Quotation updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update quotation: ${error.message}`);
    },
  });
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('quotations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete quotation: ${error.message}`);
    },
  });
}
