import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InvitationEmailData {
  email: string;
  role: string;
  region: string;
  inviteUrl: string;
}

interface EmiratesExpiryEmailData {
  adminEmail: string;
  employeeName: string;
  emiratesId: string;
  expiryDate: string;
  daysRemaining: string;
  region: string;
}

export function useEmailNotifications() {
  const sendInvitationEmail = async (data: InvitationEmailData) => {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'invitation',
          to: data.email,
          data: {
            role: data.role,
            region: data.region,
            inviteUrl: data.inviteUrl,
          },
        },
      });

      if (error) throw error;
      toast.success('Invitation email sent successfully');
      return true;
    } catch (error: any) {
      console.error('Failed to send invitation email:', error);
      toast.error(`Failed to send email: ${error.message}`);
      return false;
    }
  };

  const sendEmiratesExpiryEmail = async (data: EmiratesExpiryEmailData) => {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'emirates_expiry',
          to: data.adminEmail,
          data: {
            employeeName: data.employeeName,
            emiratesId: data.emiratesId,
            expiryDate: data.expiryDate,
            daysRemaining: data.daysRemaining,
            region: data.region,
          },
        },
      });

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Failed to send expiry email:', error);
      return false;
    }
  };

  const triggerExpiryCheck = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-emirates-expiry');
      if (error) throw error;
      toast.success(`Expiry check completed. ${data.emailsSent} notifications sent.`);
      return data;
    } catch (error: any) {
      console.error('Failed to run expiry check:', error);
      toast.error(`Failed to check expiries: ${error.message}`);
      return null;
    }
  };

  return { sendInvitationEmail, sendEmiratesExpiryEmail, triggerExpiryCheck };
}
