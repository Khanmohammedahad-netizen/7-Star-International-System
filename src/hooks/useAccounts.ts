import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type CompanyAccount = Tables<'company_accounts'>;
export type CompanyAccountInsert = TablesInsert<'company_accounts'>;
export type CompanyAccountUpdate = TablesUpdate<'company_accounts'>;

export type PersonalAccount = Tables<'personal_accounts'>;
export type PersonalAccountInsert = TablesInsert<'personal_accounts'>;
export type PersonalAccountUpdate = TablesUpdate<'personal_accounts'>;

// Company Accounts
export function useCompanyAccounts() {
  const { userRole, isSuperAdmin } = useAuth();

  return useQuery({
    queryKey: ['company-accounts', userRole?.region],
    queryFn: async () => {
      let query = supabase
        .from('company_accounts')
        .select('*')
        .order('entry_date', { ascending: false });
      
      if (!isSuperAdmin && userRole?.region) {
        query = query.eq('region', userRole.region);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CompanyAccount[];
    },
    enabled: !!userRole,
  });
}

export function useCreateCompanyAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: CompanyAccountInsert) => {
      const { data, error } = await supabase
        .from('company_accounts')
        .insert(account)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-accounts'] });
      toast.success('Account entry created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create account entry: ${error.message}`);
    },
  });
}

export function useUpdateCompanyAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: CompanyAccountUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('company_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-accounts'] });
      toast.success('Account entry updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update account entry: ${error.message}`);
    },
  });
}

export function useDeleteCompanyAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('company_accounts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-accounts'] });
      toast.success('Account entry deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete account entry: ${error.message}`);
    },
  });
}

// Personal Accounts (Super Admin only)
export function usePersonalAccounts() {
  return useQuery({
    queryKey: ['personal-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personal_accounts')
        .select('*')
        .order('entry_date', { ascending: false });
      if (error) throw error;
      return data as PersonalAccount[];
    },
  });
}

export function useCreatePersonalAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: PersonalAccountInsert) => {
      const { data, error } = await supabase
        .from('personal_accounts')
        .insert(account)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-accounts'] });
      toast.success('Personal account entry created');
    },
    onError: (error) => {
      toast.error(`Failed to create entry: ${error.message}`);
    },
  });
}

export function useUpdatePersonalAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: PersonalAccountUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('personal_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-accounts'] });
      toast.success('Personal account entry updated');
    },
    onError: (error) => {
      toast.error(`Failed to update entry: ${error.message}`);
    },
  });
}

export function useDeletePersonalAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('personal_accounts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-accounts'] });
      toast.success('Personal account entry deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete entry: ${error.message}`);
    },
  });
}
