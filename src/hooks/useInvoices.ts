import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Invoice = Tables<'invoices'> & {
  clients?: Tables<'clients'>;
  invoice_items?: Tables<'invoice_items'>[];
};
export type InvoiceInsert = TablesInsert<'invoices'>;
export type InvoiceUpdate = TablesUpdate<'invoices'>;
export type InvoiceItemInsert = TablesInsert<'invoice_items'>;

export function useInvoices() {
  const { userRole, isSuperAdmin } = useAuth();

  return useQuery({
    queryKey: ['invoices', userRole?.region],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*, clients(*), invoice_items(*)')
        .order('invoice_date', { ascending: false });
      
      if (!isSuperAdmin && userRole?.region) {
        query = query.eq('region', userRole.region);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!userRole,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, clients(*), invoice_items(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Invoice;
    },
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ items, ...invoice }: InvoiceInsert & { items: Omit<InvoiceItemInsert, 'invoice_id'>[] }) => {
      // Note: balance is a generated column (total_amount - amount_paid), so we don't include it
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoice)
        .select()
        .single();
      if (invoiceError) throw invoiceError;

      if (items.length > 0) {
        // Note: amount is a generated column (quantity * rate), so we don't include it
        const itemsWithInvoiceId = items.map(item => ({
          invoice_id: invoiceData.id,
          serial_no: item.serial_no,
          description: item.description,
          size: item.size || null,
          quantity: item.quantity,
          rate: item.rate,
          is_sub_item: item.is_sub_item || false,
          parent_serial_no: item.parent_serial_no || null,
        }));
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsWithInvoiceId);
        if (itemsError) throw itemsError;
      }

      return invoiceData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create invoice: ${error.message}`);
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, items, ...updates }: InvoiceUpdate & { id: string; items?: Omit<InvoiceItemInsert, 'invoice_id'>[] }) => {
      // Note: balance is a generated column (total_amount - amount_paid), so we don't include it
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      if (items) {
        await supabase.from('invoice_items').delete().eq('invoice_id', id);
        if (items.length > 0) {
          // Note: amount is a generated column (quantity * rate), so we don't include it
          const itemsWithInvoiceId = items.map(item => ({
            invoice_id: id,
            serial_no: item.serial_no,
            description: item.description,
            size: item.size || null,
            quantity: item.quantity,
            rate: item.rate,
            is_sub_item: item.is_sub_item || false,
            parent_serial_no: item.parent_serial_no || null,
          }));
          const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(itemsWithInvoiceId);
          if (itemsError) throw itemsError;
        }
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      toast.success('Invoice updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update invoice: ${error.message}`);
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete invoice: ${error.message}`);
    },
  });
}
