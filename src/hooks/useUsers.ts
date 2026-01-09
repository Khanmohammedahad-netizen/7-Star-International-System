import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;
export type UserRole = Tables<'user_roles'>;
export type UserInvitation = Tables<'user_invitations'>;
export type UserInvitationInsert = TablesInsert<'user_invitations'>;

export interface UserWithRole extends Profile {
  user_roles?: UserRole[];
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      if (rolesError) throw rolesError;

      return profiles.map(profile => ({
        ...profile,
        user_roles: roles.filter(role => role.user_id === profile.id),
      })) as UserWithRole[];
    },
  });
}

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as UserInvitation[];
    },
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitation: Omit<UserInvitationInsert, 'token' | 'invited_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const token = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('user_invitations')
        .insert({
          ...invitation,
          token,
          invited_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;

      // Send invitation email
      const inviteUrl = `${window.location.origin}/register?token=${token}`;
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'invitation',
          to: invitation.email,
          data: {
            role: invitation.role,
            region: invitation.region,
            inviteUrl,
          },
        },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation sent successfully');
    },
    onError: (error) => {
      toast.error(`Failed to send invitation: ${error.message}`);
    },
  });
}

export function useDeleteInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_invitations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete invitation: ${error.message}`);
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role, region }: { userId: string; role: string; region: string }) => {
      // Delete existing role
      await supabase.from('user_roles').delete().eq('user_id', userId);
      
      // Insert new role
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role as any,
          region: region as any,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated');
    },
    onError: (error) => {
      toast.error(`Failed to update user role: ${error.message}`);
    },
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated');
    },
    onError: (error) => {
      toast.error(`Failed to update user status: ${error.message}`);
    },
  });
}
