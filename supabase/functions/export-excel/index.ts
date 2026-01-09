import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Currency mapping based on region
const CURRENCY_MAP: Record<string, string> = {
  UAE: 'AED',
  SAUDI: 'SAR',
};

function getCurrencyCode(region: string): string {
  return CURRENCY_MAP[region] || 'AED';
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
    const { type, id, fromDate, toDate, region } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let csv = '';
    let filename = '';

    // Single invoice export
    if (type === 'single-invoice' && id) {
      const { data: invoice, error } = await supabase
        .from('invoices')
        .select('*, clients(name), invoice_items(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const currency = getCurrencyCode(invoice.region);
      const sortedItems = (invoice.invoice_items || []).sort((a: any, b: any) => a.serial_no - b.serial_no);
      
      const headers = ['S.No', 'Description', 'Size', 'Quantity', `Rate (${currency})`, `Amount (${currency})`];
      const rows: string[][] = sortedItems.map((item: any) => [
        String(item.serial_no),
        item.description,
        item.size || '-',
        String(item.quantity),
        formatNumber(item.rate),
        formatNumber(item.amount || item.quantity * item.rate)
      ]);

      // Add totals
      rows.push(['', '', '', '', '', '']);
      rows.push(['', '', '', '', 'Net Amount', formatNumber(invoice.net_amount)]);
      rows.push(['', '', '', '', '5% VAT', formatNumber(invoice.vat_amount)]);
      rows.push(['', '', '', '', 'Total', formatNumber(invoice.total_amount)]);
      rows.push(['', '', '', '', '', '']);
      rows.push(['Invoice Number:', invoice.invoice_number, '', '', '', '']);
      rows.push(['Client:', invoice.clients?.name || '', '', '', '', '']);
      rows.push(['Date:', formatDate(invoice.invoice_date), '', '', '', '']);
      rows.push(['Region:', invoice.region, '', '', '', '']);

      csv = generateCSV(headers, rows);
      filename = `Invoice-${invoice.invoice_number}.csv`;
    }
    // Single quotation export
    else if (type === 'single-quotation' && id) {
      const { data: quotation, error } = await supabase
        .from('quotations')
        .select('*, clients(name), quotation_items(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const currency = getCurrencyCode(quotation.region);
      const sortedItems = (quotation.quotation_items || []).sort((a: any, b: any) => a.serial_no - b.serial_no);
      
      const headers = ['S.No', 'Description', 'Size', 'Quantity', `Rate (${currency})`, `Amount (${currency})`];
      const rows: string[][] = sortedItems.map((item: any) => [
        String(item.serial_no),
        item.description,
        item.size || '-',
        String(item.quantity),
        formatNumber(item.rate),
        formatNumber(item.amount || item.quantity * item.rate)
      ]);

      // Add totals
      rows.push(['', '', '', '', '', '']);
      rows.push(['', '', '', '', 'Net Amount', formatNumber(quotation.net_amount)]);
      rows.push(['', '', '', '', '5% VAT', formatNumber(quotation.vat_amount)]);
      rows.push(['', '', '', '', 'Total', formatNumber(quotation.total_amount)]);
      rows.push(['', '', '', '', '', '']);
      rows.push(['Quotation Number:', quotation.quotation_number, '', '', '', '']);
      rows.push(['Client:', quotation.clients?.name || '', '', '', '', '']);
      rows.push(['Date:', formatDate(quotation.quotation_date), '', '', '', '']);
      rows.push(['Element:', quotation.element || '-', '', '', '', '']);
      rows.push(['Region:', quotation.region, '', '', '', '']);

      csv = generateCSV(headers, rows);
      filename = `Quotation-${quotation.quotation_number}.csv`;
    }
    // Ledger export
    else if (type === 'ledger') {
      const { clientId } = await req.json().catch(() => ({}));
      
      // Get client info
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (clientError) throw clientError;
      
      const currency = getCurrencyCode(client.region);

      // Fetch invoices for this client within date range
      let invoiceQuery = supabase
        .from('invoices')
        .select('*')
        .eq('client_id', id)
        .order('invoice_date', { ascending: true });
      
      if (fromDate) invoiceQuery = invoiceQuery.gte('invoice_date', fromDate);
      if (toDate) invoiceQuery = invoiceQuery.lte('invoice_date', toDate);
      
      const { data: invoices, error: invoicesError } = await invoiceQuery;
      if (invoicesError) throw invoicesError;

      // Fetch payments for these invoices
      const invoiceIds = invoices?.map((i: any) => i.id) || [];
      let payments: any[] = [];
      
      if (invoiceIds.length > 0) {
        let paymentQuery = supabase
          .from('payments')
          .select('*, invoices(invoice_number)')
          .in('invoice_id', invoiceIds)
          .order('payment_date', { ascending: true });
        
        if (fromDate) paymentQuery = paymentQuery.gte('payment_date', fromDate);
        if (toDate) paymentQuery = paymentQuery.lte('payment_date', toDate);
        
        const { data: paymentsData, error: paymentsError } = await paymentQuery;
        if (paymentsError) throw paymentsError;
        payments = paymentsData || [];
      }

      // Combine and sort by date
      const ledgerEntries: any[] = [];
      
      invoices?.forEach((inv: any) => {
        ledgerEntries.push({
          date: inv.invoice_date,
          particulars: 'Invoice',
          invType: 'TAX INV',
          invNo: inv.invoice_number,
          debit: inv.total_amount,
          credit: 0,
        });
      });
      
      payments.forEach((pmt: any) => {
        ledgerEntries.push({
          date: pmt.payment_date,
          particulars: `Payment - ${pmt.payment_mode.replace('_', ' ')}`,
          invType: 'PAYMENT',
          invNo: pmt.invoices?.invoice_number || pmt.reference_number || '-',
          debit: 0,
          credit: pmt.amount,
        });
      });
      
      // Sort by date
      ledgerEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calculate closing balance
      let closingBalance = 0;
      
      const headers = ['Date', 'Particulars', 'INV Type', 'INV No.', `Debit (${currency})`, `Credit (${currency})`];
      const rows: string[][] = ledgerEntries.map(entry => {
        closingBalance += entry.debit - entry.credit;
        return [
          formatDate(entry.date),
          entry.particulars,
          entry.invType,
          entry.invNo,
          entry.debit > 0 ? formatNumber(entry.debit) : '-',
          entry.credit > 0 ? formatNumber(entry.credit) : '-'
        ];
      });

      // Add closing balance
      rows.push(['', '', '', '', '', '']);
      rows.push(['', '', '', 'Closing Balance', '', formatNumber(closingBalance)]);
      rows.push(['', '', '', '', '', '']);
      rows.push(['Client:', client.name, '', '', '', '']);
      rows.push(['Period:', `${fromDate ? formatDate(fromDate) : 'Beginning'} to ${toDate ? formatDate(toDate) : 'Today'}`, '', '', '', '']);

      csv = generateCSV(headers, rows);
      filename = `Ledger-${client.name.replace(/\s+/g, '-')}-${fromDate || 'all'}-to-${toDate || 'all'}.csv`;
    }
    // Bulk invoices export
    else if (type === 'invoices') {
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
