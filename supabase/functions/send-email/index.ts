import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'invitation' | 'emirates_expiry';
  to: string;
  data: Record<string, string>;
}

const getInvitationEmail = (data: Record<string, string>) => ({
  subject: "You've been invited to 7 Star International Events",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>7 Star International Events</h1>
        </div>
        <div class="content">
          <h2>You've Been Invited!</h2>
          <p>Hello,</p>
          <p>You have been invited to join the 7 Star International Events management system with the following role:</p>
          <p><strong>Role:</strong> ${data.role}<br>
          <strong>Region:</strong> ${data.region}</p>
          <p>Please click the button below to complete your registration:</p>
          <p style="text-align: center;">
            <a href="${data.inviteUrl}" class="button">Accept Invitation</a>
          </p>
          <p>This invitation will expire in 7 days.</p>
          <p>If you did not expect this invitation, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>7 Star International Events L.L.C<br>
          P2A-J01, WHP2-BLOCK-A COMMERCIAL<br>
          SAIH SHUBAIB 3, DUBAI - UAE</p>
        </div>
      </div>
    </body>
    </html>
  `,
});

const getEmiratesExpiryEmail = (data: Record<string, string>) => ({
  subject: `Emirates ID Expiry Alert - ${data.employeeName}`,
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
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Emirates ID Expiry Alert</h1>
        </div>
        <div class="content">
          <h2>Document Expiry Reminder</h2>
          <p>This is an automated reminder about an upcoming Emirates ID expiration:</p>
          <div class="alert-box">
            <p><strong>Employee Name:</strong> ${data.employeeName}</p>
            <p><strong>Emirates ID:</strong> ${data.emiratesId}</p>
            <p><strong>Expiry Date:</strong> ${data.expiryDate}</p>
            <p><strong>Days Until Expiry:</strong> ${data.daysRemaining} days</p>
          </div>
          <p>Please take necessary action to renew this document before it expires.</p>
          <p>Region: ${data.region}</p>
        </div>
        <div class="footer">
          <p>7 Star International Events L.L.C<br>
          P2A-J01, WHP2-BLOCK-A COMMERCIAL<br>
          SAIH SHUBAIB 3, DUBAI - UAE</p>
        </div>
      </div>
    </body>
    </html>
  `,
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data }: EmailRequest = await req.json();

    let emailContent;
    switch (type) {
      case 'invitation':
        emailContent = getInvitationEmail(data);
        break;
      case 'emirates_expiry':
        emailContent = getEmiratesExpiryEmail(data);
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "7 Star Events <onboarding@resend.dev>",
      to: [to],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in send-email function:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
