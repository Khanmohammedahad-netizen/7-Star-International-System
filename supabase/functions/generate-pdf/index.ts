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

const CURRENCY_NAMES: Record<string, { main: string; sub: string }> = {
  UAE: { main: 'Dirhams', sub: 'Fils' },
  SAUDI: { main: 'Riyals', sub: 'Halalas' },
};

function getCurrencyCode(region: string): string {
  return CURRENCY_MAP[region] || 'AED';
}

function getCurrencyNames(region: string): { main: string; sub: string } {
  return CURRENCY_NAMES[region] || CURRENCY_NAMES.UAE;
}

// Number to words converter for amounts
function numberToWords(num: number, region: string): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  
  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };
  
  const wholePart = Math.floor(num);
  const decimalPart = Math.round((num - wholePart) * 100);
  
  const currencyNames = getCurrencyNames(region);
  let result = '';
  
  if (wholePart >= 1000000) {
    result += convertLessThanThousand(Math.floor(wholePart / 1000000)) + ' Million ';
    result += convertLessThanThousand(Math.floor((wholePart % 1000000) / 1000)) + ' Thousand ';
    result += convertLessThanThousand(wholePart % 1000);
  } else if (wholePart >= 1000) {
    result += convertLessThanThousand(Math.floor(wholePart / 1000)) + ' Thousand ';
    result += convertLessThanThousand(wholePart % 1000);
  } else {
    result = convertLessThanThousand(wholePart);
  }
  
  result = result.trim() + ' ' + currencyNames.main;
  
  if (decimalPart > 0) {
    result += ' and ' + convertLessThanThousand(decimalPart) + ' ' + currencyNames.sub;
  }
  
  return result + ' Only';
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatNumber = (num: number): string => {
  return num.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, id, clientId, fromDate, toDate } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let html = '';

    if (type === 'quotation') {
      const { data: quotation, error } = await supabase
        .from('quotations')
        .select('*, clients(*), quotation_items(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const currency = getCurrencyCode(quotation.region);
      const rows = quotation.quotation_items
        .sort((a: any, b: any) => a.serial_no - b.serial_no)
        .map((item: any) => `
          <tr>
            <td class="center">${item.serial_no}</td>
            <td>${item.description}</td>
            <td class="center">${item.size || '-'}</td>
            <td class="center">${item.quantity}</td>
            <td class="right">${formatNumber(item.rate)}</td>
            <td class="right">${formatNumber(item.amount || item.quantity * item.rate)}</td>
          </tr>
        `).join('');

      html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Quotation</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; margin: 30px; }
  h1,h2,h3 { margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
  th, td { border: 1px solid #000; padding: 6px; }
  .no-border td { border: none; }
  .right { text-align: right; }
  .center { text-align: center; }
</style>
</head>
<body>

<h3>7 STAR INTERNATIONAL EVENTS L.L.C</h3>
<p>P2A-J01, WHP2-BLOCK-A COMMERCIAL<br>
SAIH SHUBAIB 3<br>
DUBAI - UAE</p>

<h2 class="center">Quotation</h2>

<table class="no-border">
<tr><td>CLIENT:</td><td>${quotation.clients?.name || ''}</td></tr>
<tr><td>Element:</td><td>${quotation.element || '-'}</td></tr>
<tr><td>Quotation Date:</td><td>${formatDate(quotation.quotation_date)}</td></tr>
<tr><td>Quotation Number:</td><td>${quotation.quotation_number}</td></tr>
<tr><td>VAT TRN:</td><td>104038790200003</td></tr>
</table>

<br>

<table>
<thead>
<tr>
<th>S.No</th><th>Description</th><th>Size</th>
<th>Quantity</th><th>Rate ${currency}</th><th>Amount ${currency}</th>
</tr>
</thead>
<tbody>
${rows}
</tbody>
</table>

<table>
<tr><td class="right">Net Amount (${currency})</td><td class="right">${formatNumber(quotation.net_amount)}</td></tr>
<tr><td class="right">5% VAT</td><td class="right">${formatNumber(quotation.vat_amount)}</td></tr>
<tr><td class="right"><strong>Total</strong></td><td class="right"><strong>${formatNumber(quotation.total_amount)}</strong></td></tr>
</table>

<h4>Terms & Conditions</h4>
<ul>
<li>Any change in drawings before fabrication only</li>
<li>Size changes affect cost</li>
<li>NOC & approvals charged extra</li>
<li>50% advance, 50% on completion</li>
<li>Payment via bank transfer or cheque only</li>
</ul>

<p>
<strong>Bank Details:</strong><br>
ADCB BANK<br>
Account: 7Star International Events LLC SHJ BR<br>
IBAN: AE020030012980065820001<br>
Swift: ADCBAEAA
</p>

<p class="center">
Approved by: Shaji Mohammed Khan<br>
Signature: ___________________
</p>

</body>
</html>`;

    } else if (type === 'invoice') {
      const { data: invoice, error } = await supabase
        .from('invoices')
        .select('*, clients(*), invoice_items(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const currency = getCurrencyCode(invoice.region);
      const rows = invoice.invoice_items
        .sort((a: any, b: any) => a.serial_no - b.serial_no)
        .map((item: any) => `
          <tr>
            <td class="center">${item.serial_no}</td>
            <td>${item.description}</td>
            <td class="center">${item.size || '-'}</td>
            <td class="center">${item.quantity}</td>
            <td class="right">${formatNumber(item.rate)}</td>
            <td class="right">${formatNumber(item.amount || item.quantity * item.rate)}</td>
          </tr>
        `).join('');

      html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Tax Invoice</title>
<style>
body { font-family: Arial; font-size: 12px; margin: 30px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
th, td { border: 1px solid black; padding: 6px; }
.right { text-align: right; }
.center { text-align: center; }
.client-table td { border: none; }
</style>
</head>
<body>

<h3>7 STAR INTERNATIONAL EVENTS L.L.C</h3>
<p>P2A-J01, WHP2-BLOCK-A COMMERCIAL<br>
SAIH SHUBAIB 3<br>
DUBAI - UAE</p>

<h2 class="center">TAX INVOICE</h2>

<table class="client-table">
<tr><td>Client:</td><td>${invoice.clients?.name || ''}</td></tr>
<tr><td>Invoice Date:</td><td>${formatDate(invoice.invoice_date)}</td></tr>
<tr><td>Invoice Number:</td><td>${invoice.invoice_number}</td></tr>
<tr><td>VAT TRN:</td><td>104038790200003</td></tr>
</table>

<br>

<table>
<thead>
<tr>
<th>S.No</th><th>Description</th><th>Size</th>
<th>Qty</th><th>Rate ${currency}</th><th>Amount ${currency}</th>
</tr>
</thead>
<tbody>
${rows}
</tbody>
</table>

<table>
<tr><td class="right">Net Amount</td><td class="right">${formatNumber(invoice.net_amount)} ${currency}</td></tr>
<tr><td class="right">5% VAT</td><td class="right">${formatNumber(invoice.vat_amount)} ${currency}</td></tr>
<tr><td class="right"><strong>Total</strong></td><td class="right"><strong>${formatNumber(invoice.total_amount)} ${currency}</strong></td></tr>
</table>

<p>Amount in Words: ${numberToWords(invoice.total_amount, invoice.region)}</p>

<p>
Confirmed by: Shaji Mohammed Khan<br>
Signature: ____________
</p>

<p>
<strong>Bank Details:</strong><br>
ADCB BANK<br>
IBAN: AE020030012980065820001
</p>

</body>
</html>`;

    } else if (type === 'ledger') {
      // Fetch client info
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
      
      if (clientError) throw clientError;

      const currency = getCurrencyCode(client.region);

      // Fetch invoices for this client within date range
      let invoiceQuery = supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientId)
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
      
      // Calculate running balance and closing balance
      let closingBalance = 0;
      const rows = ledgerEntries.map(entry => {
        closingBalance += entry.debit - entry.credit;
        return `
          <tr>
            <td>${formatDate(entry.date)}</td>
            <td>${entry.particulars}</td>
            <td class="center">${entry.invType}</td>
            <td>${entry.invNo}</td>
            <td class="right">${entry.debit > 0 ? formatNumber(entry.debit) : '-'}</td>
            <td class="right">${entry.credit > 0 ? formatNumber(entry.credit) : '-'}</td>
          </tr>
        `;
      }).join('');

      html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Statement of Account</title>
<style>
body { font-family: Arial; font-size: 12px; margin: 25px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
th, td { border: 1px solid black; padding: 6px; }
.center { text-align: center; }
.right { text-align: right; }
</style>
</head>
<body>

<h3 class="center">7 STAR INTERNATIONAL EVENTS LLC</h3>
<p class="center">
92A-J01, WHP2 - BLOCK A COMMERCIAL<br>
SAIH SHUBAIB 3<br>
DUBAI - UAE
</p>

<h4 class="center">${client.name}</h4>
<h3 class="center">LEDGER ACCOUNT</h3>
<p class="center">${fromDate ? formatDate(fromDate) : 'Beginning'} to ${toDate ? formatDate(toDate) : 'Today'}</p>

<table>
<thead>
<tr>
<th>Date</th>
<th>Particulars</th>
<th>INV Type</th>
<th>INV No.</th>
<th>Debit (${currency})</th>
<th>Credit (${currency})</th>
</tr>
</thead>
<tbody>
${rows}
</tbody>
</table>

<table>
<tr>
<td class="right"><strong>Closing Balance</strong></td>
<td class="right">${formatNumber(closingBalance)} ${currency}</td>
</tr>
</table>

<p><strong>NOTE:</strong> Closing balance as on today in ${currency} ${formatNumber(closingBalance)}</p>

<p>
<strong>Bank Details:</strong><br>
ADCB BANK<br>
IBAN: AE020030012980065820001
</p>

</body>
</html>`;

    } else {
      throw new Error('Invalid document type');
    }

    return new Response(
      JSON.stringify({ html }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: unknown) {
    console.error('PDF generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
