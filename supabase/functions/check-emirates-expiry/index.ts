import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// HTML escape function to prevent XSS in emails
function escapeHtml(unsafe: string | null | undefined): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Authentication helper
async function authenticateRequest(req: Request, supabaseUrl: string, supabaseAnonKey: string) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return { error: 'Missing authorization header', status: 401 };
  }

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 };
  }

  // Verify user role/permissions - only super_admin and admin can trigger expiry checks
  const { data: userRole } = await supabaseClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!userRole || !['super_admin', 'admin'].includes(userRole.role)) {
    return { error: 'Insufficient permissions', status: 403 };
  }

  return { user, userRole: userRole.role };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Authenticate the request
    const authResult = await authenticateRequest(req, supabaseUrl, supabaseAnonKey);
    if ('error' in authResult) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { status: authResult.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service key for data access after authentication is verified
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get employees with Emirates ID expiring in next 30 days
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .not('emirates_id_expiry', 'is', null)
      .gte('emirates_id_expiry', today.toISOString().split('T')[0])
      .lte('emirates_id_expiry', thirtyDaysFromNow.toISOString().split('T')[0])
      .eq('is_active', true);

    if (error) throw error;

    // Get super admins to notify
    const { data: superAdmins, error: adminsError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'super_admin');

    if (adminsError) throw adminsError;

    const adminIds = superAdmins?.map(a => a.user_id) || [];

    // Get admin emails
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('email')
      .in('id', adminIds);

    if (profilesError) throw profilesError;

    const adminEmails = profiles?.map(p => p.email) || [];

    if (adminEmails.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No admin emails found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailsSent: string[] = [];

    for (const employee of employees || []) {
      const expiryDate = new Date(employee.emirates_id_expiry);
      const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Send to all admins
      for (const adminEmail of adminEmails) {
        try {
          await resend.emails.send({
            from: "7 Star Events <onboarding@resend.dev>",
            to: [adminEmail],
            subject: `Emirates ID Expiry Alert - ${escapeHtml(employee.full_name)}`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                  .alert-box { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 15px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>⚠️ Emirates ID Expiry Alert</h1>
                  </div>
                  <div class="content">
                    <h2>Document Expiry Reminder</h2>
                    <div class="alert-box">
                      <p><strong>Employee Name:</strong> ${escapeHtml(employee.full_name)}</p>
                      <p><strong>Emirates ID:</strong> ${escapeHtml(employee.emirates_id) || 'N/A'}</p>
                      <p><strong>Expiry Date:</strong> ${escapeHtml(employee.emirates_id_expiry)}</p>
                      <p><strong>Days Until Expiry:</strong> ${daysRemaining} days</p>
                      <p><strong>Region:</strong> ${escapeHtml(employee.region)}</p>
                    </div>
                    <p>Please take necessary action to renew this document before it expires.</p>
                  </div>
                </div>
              </body>
              </html>
            `,
          });
          emailsSent.push(`${employee.full_name} -> ${adminEmail}`);
        } catch (emailError) {
          console.error(`Failed to send email for ${employee.full_name}:`, emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Expiry check completed', 
        employeesChecked: employees?.length || 0,
        emailsSent: emailsSent.length,
        details: emailsSent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Check emirates expiry error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});