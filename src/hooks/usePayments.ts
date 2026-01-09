import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Payment = Tables<'payments'> & {
  invoices?: Tables<'invoices'> & {
    clients?: Tables<'clients'>;
  };
};
export type PaymentInsert = TablesInsert<'payments'>;
export type PaymentUpdate = TablesUpdate<'payments'>;

export function usePayments() {
  const { userRole, isSuperAdmin } = useAuth();

  return useQuery({
    queryKey: ['payments', userRole?.region],
    queryFn: async () => {
      let query = supabase
        .from('payments')
        .select('*, invoices(*, clients(*))')
        .order('payment_date', { ascending: false });
      
      if (!isSuperAdmin && userRole?.region) {
        query = query.eq('region', userRole.region);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!userRole,
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*, invoices(*, clients(*))')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Payment;
    },
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: PaymentInsert) => {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select()
        .single();
      if (error) throw error;

      // Update invoice amount_paid
      const { data: invoice } = await supabase
        .from('invoices')
        .select('amount_paid')
        .eq('id', payment.invoice_id)
        .single();
      
      if (invoice) {
        await supabase
          .from('invoices')
          .update({ amount_paid: invoice.amount_paid + payment.amount })
          .eq('id', payment.invoice_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error) => {
      toast.error(`Failed to record payment: ${error.message}`);
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: PaymentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Payment updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update payment: ${error.message}`);
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Payment deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete payment: ${error.message}`);
    },
  });
}
