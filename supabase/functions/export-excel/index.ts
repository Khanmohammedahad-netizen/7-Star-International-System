import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple CSV generation (can be opened in Excel)
function generateCSV(headers: string[], rows: string[][]): string {
  const headerRow = headers.join(',');
  const dataRows = rows.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(cell || '').replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') 
        ? `"${escaped}"` 
        : escaped;
    }).join(',')
  );
  return [headerRow, ...dataRows].join('\n');
}

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatNumber = (num: number | null): string => {
  if (num === null || num === undefined) return '0.00';
  return num.toFixed(2);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, fromDate, toDate, region } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let csv = '';
    let filename = '';

    if (type === 'invoices') {
      let query = supabase
        .from('invoices')
        .select('*, clients(name)')
        .order('invoice_date', { ascending: false });
      
      if (fromDate) query = query.gte('invoice_date', fromDate);
      if (toDate) query = query.lte('invoice_date', toDate);
      if (region) query = query.eq('region', region);

      const { data: invoices, error } = await query;
      if (error) throw error;

      const headers = ['Invoice #', 'Client', 'Date', 'Net Amount', 'VAT', 'Total', 'Amount Paid', 'Balance', 'Status', 'Region'];
      const rows = (invoices || []).map(inv => [
        inv.invoice_number,
        inv.clients?.name || '',
        formatDate(inv.invoice_date),
        formatNumber(inv.net_amount),
        formatNumber(inv.vat_amount),
        formatNumber(inv.total_amount),
        formatNumber(inv.amount_paid),
        formatNumber(inv.balance),
        inv.status,
        inv.region
      ]);

      // Add summary
      const totalNet = invoices?.reduce((sum, inv) => sum + (inv.net_amount || 0), 0) || 0;
      const totalVat = invoices?.reduce((sum, inv) => sum + (inv.vat_amount || 0), 0) || 0;
      const totalAmount = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
      const totalPaid = invoices?.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0) || 0;
      const totalBalance = invoices?.reduce((sum, inv) => sum + (inv.balance || 0), 0) || 0;

      rows.push(['', '', '', '', '', '', '', '', '', '']);
      rows.push(['TOTALS', '', '', formatNumber(totalNet), formatNumber(totalVat), formatNumber(totalAmount), formatNumber(totalPaid), formatNumber(totalBalance), '', '']);

      csv = generateCSV(headers, rows);
      filename = `invoices_${fromDate || 'all'}_to_${toDate || 'all'}.csv`;

    } else if (type === 'payments') {
      let query = supabase
        .from('payments')
        .select('*, invoices(invoice_number, clients(name))')
        .order('payment_date', { ascending: false });
      
      if (fromDate) query = query.gte('payment_date', fromDate);
      if (toDate) query = query.lte('payment_date', toDate);
      if (region) query = query.eq('region', region);

      const { data: payments, error } = await query;
      if (error) throw error;

      const headers = ['Date', 'Invoice #', 'Client', 'Amount', 'Payment Mode', 'Reference', 'Region', 'Notes'];
      const rows = (payments || []).map(pmt => [
        formatDate(pmt.payment_date),
        pmt.invoices?.invoice_number || '',
        pmt.invoices?.clients?.name || '',
        formatNumber(pmt.amount),
        pmt.payment_mode.replace('_', ' '),
        pmt.reference_number || '',
        pmt.region,
        pmt.notes || ''
      ]);

      // Add summary
      const totalAmount = payments?.reduce((sum, pmt) => sum + (pmt.amount || 0), 0) || 0;

      rows.push(['', '', '', '', '', '', '', '']);
      rows.push(['TOTAL', '', '', formatNumber(totalAmount), '', '', '', '']);

      csv = generateCSV(headers, rows);
      filename = `payments_${fromDate || 'all'}_to_${toDate || 'all'}.csv`;

    } else if (type === 'accounts') {
      let query = supabase
        .from('company_accounts')
        .select('*')
        .order('entry_date', { ascending: false });
      
      if (fromDate) query = query.gte('entry_date', fromDate);
      if (toDate) query = query.lte('entry_date', toDate);
      if (region) query = query.eq('region', region);

      const { data: accounts, error } = await query;
      if (error) throw error;

      const headers = ['Date', 'Description', 'Expense Head', 'Project', 'Amount', 'VAT', 'Total', 'Payment Mode', 'Region'];
      const rows = (accounts || []).map(acc => [
        formatDate(acc.entry_date),
        acc.description || '',
        acc.expense_head || '',
        acc.project_name || '',
        formatNumber(acc.amount),
        formatNumber(acc.vat),
        formatNumber(acc.total),
        acc.mode_of_payment?.replace('_', ' ') || '',
        acc.region
      ]);

      // Add summary
      const totalAmount = accounts?.reduce((sum, acc) => sum + (acc.total || 0), 0) || 0;

      rows.push(['', '', '', '', '', '', '', '', '']);
      rows.push(['TOTAL', '', '', '', '', '', formatNumber(totalAmount), '', '']);

      csv = generateCSV(headers, rows);
      filename = `accounts_${fromDate || 'all'}_to_${toDate || 'all'}.csv`;

    } else {
      throw new Error('Invalid export type');
    }

    return new Response(
      JSON.stringify({ csv, filename }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
