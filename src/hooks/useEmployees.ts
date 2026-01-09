import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Employee = Tables<'employees'>;
export type EmployeeInsert = TablesInsert<'employees'>;
export type EmployeeUpdate = TablesUpdate<'employees'>;

export function useEmployees() {
  const { userRole, isSuperAdmin } = useAuth();

  return useQuery({
    queryKey: ['employees', userRole?.region],
    queryFn: async () => {
      let query = supabase.from('employees').select('*').order('full_name');
      
      if (!isSuperAdmin && userRole?.region) {
        query = query.eq('region', userRole.region);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Employee[];
    },
    enabled: !!userRole,
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Employee;
    },
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employee: EmployeeInsert) => {
      const { data, error } = await supabase
        .from('employees')
        .insert(employee)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create employee: ${error.message}`);
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: EmployeeUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
      toast.success('Employee updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update employee: ${error.message}`);
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete employee: ${error.message}`);
    },
  });
}
