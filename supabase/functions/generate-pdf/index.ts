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
            <td class="text-center">${item.serial_no}</td>
            <td>${item.description}</td>
            <td class="text-center">${item.size || '-'}</td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right">${formatNumber(item.rate)}</td>
            <td class="text-right green-col">${formatNumber(item.amount || item.quantity * item.rate)}</td>
          </tr>
        `).join('');

      // Generate empty rows to fill the table
      const emptyRowCount = Math.max(0, 10 - quotation.quotation_items.length);
      const emptyRows = Array(emptyRowCount).fill(`
        <tr>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td class="green-col">&nbsp;</td>
        </tr>
      `).join('');

      html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Quotation</title>
<style>
html, body { width:210mm; margin:0; }
@page { size:A4; margin:18mm; }
body { font-family:Calibri, Arial; font-size:12px; }
.page {
  width:174mm;
  height:261mm;
  position:relative;
}
.page-break { page-break-after: always; }
.green { background:#cfe5b3; padding:6px; font-weight:bold; }
.footer-bar {
  position:absolute; bottom:0; left:0; right:0;
  background:#cfe5b3; padding:6px;
  display:flex; justify-content:space-between;
  font-size:10.5px;
}
.header {
  display: flex;
  justify-content: space-between;
}
.logo img { height: 65px; }
.company {
  text-align: right;
  font-size: 11px;
}
.title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin: 6px 0;
}
.info { font-size: 11px; margin: 6px 0; }
.terms { font-size: 11px; line-height: 1.6; }
.bank { font-size: 11px; line-height: 1.6; }
.approval {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}
</style>
</head>
<body>

<!-- PAGE 1: Dynamic content -->
<div class="page page-break">
  <div class="header">
    <div class="logo">
      <img src="https://ybgxfnykoqaggytachnv.supabase.co/storage/v1/object/public/assets/logo.jpeg" alt="Logo" onerror="this.style.display='none'">
    </div>
    <div class="company">
      <b>7 STAR INTERNATIONAL EVENTS L.L.C</b><br>
      P2A-J01, WHP2-BLOCK-A COMMERCIAL<br>
      SAIH SHUBAIB 3<br>DUBAI - UAE
    </div>
  </div>

  <div class="title">Quotation</div>

  <div class="info">
    <div>CLIENT: ${quotation.clients?.name || ''}</div>
    <div>Element: ${quotation.element || '-'}</div>
  </div>

  <div class="green">
    <div>Date: ${formatDate(quotation.quotation_date)}</div>
    <div>Quotation No: ${quotation.quotation_number}</div>
    <div>VAT TRN: 104038790200003</div>
  </div>

  <table style="width:100%; border-collapse:collapse; margin-top:8px;">
    <thead>
      <tr>
        <th style="border:1px solid #000; background:#e6e6e6; padding:5px; width:6%;">S.No</th>
        <th style="border:1px solid #000; background:#e6e6e6; padding:5px; width:34%;">Description</th>
        <th style="border:1px solid #000; background:#e6e6e6; padding:5px; width:8%;">Size</th>
        <th style="border:1px solid #000; background:#e6e6e6; padding:5px; width:10%;">Qty</th>
        <th style="border:1px solid #000; background:#e6e6e6; padding:5px; width:16%;">Rate ${currency}</th>
        <th style="border:1px solid #000; background:#cfe5b3; padding:5px; width:16%; font-weight:bold;">Amount ${currency}</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      ${emptyRows}
    </tbody>
  </table>

  <table style="width:40%; margin-left:auto; margin-top:10px; border:2px solid #000;">
    <tr>
      <td style="background:#cfe5b3; padding:6px; font-weight:bold;">Net (${currency})</td>
      <td style="background:#cfe5b3; padding:6px; font-weight:bold; text-align:right;">${formatNumber(quotation.net_amount)}</td>
    </tr>
    <tr>
      <td style="background:#cfe5b3; padding:6px; font-weight:bold;">5% VAT</td>
      <td style="background:#cfe5b3; padding:6px; font-weight:bold; text-align:right;">${formatNumber(quotation.vat_amount)}</td>
    </tr>
    <tr>
      <td style="background:#cfe5b3; padding:6px; font-weight:bold;">Total</td>
      <td style="background:#cfe5b3; padding:6px; font-weight:bold; text-align:right;">${formatNumber(quotation.total_amount)}</td>
    </tr>
  </table>

  <div class="footer-bar">
    <span>NAD AL HAMMAR, DUBAI</span>
    <span>ShajiKhan@7starinternational.com</span>
    <span>00971 56 506 5566</span>
  </div>
</div>

<!-- PAGE 2: Static content (terms, bank, signatures) -->
<div class="page">
  <div class="green" style="text-align:center; margin-bottom:10px;">Terms & Conditions</div>

  <div class="terms">
    • Any change in drawings before fabrication only<br>
    • Any size change affects cost<br>
    • NOC & approvals extra as actuals<br>
    • Utilities by client<br>
    • Payment 50% advance, 50% on completion<br>
    • Payment via bank transfer / cheque only
  </div>

  <div class="green" style="text-align:center; margin:20px 0 10px;">Bank Details</div>

  <div class="bank">
    ADCB BANK<br>
    Account: 7 Star International Events LLC SHJ BR<br>
    IBAN: AE020300012980065820001<br>
    Swift: ADCBAEAA
  </div>

  <div class="approval">
    <div>
      <b>7 Star International Events LLC</b><br>
      Approved by: Shaji Mohammed Khan
    </div>
    <div>
      <b>Client</b><br>
      Signature:
    </div>
  </div>

  <div class="footer-bar">
    <span>Quotation Date: ${formatDate(quotation.quotation_date)}</span>
    <span>Quotation No: ${quotation.quotation_number}</span>
  </div>
</div>

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
            <td class="text-center">${item.serial_no}</td>
            <td>${item.description}</td>
            <td class="text-center">${item.size || '-'}</td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right">${formatNumber(item.rate)}</td>
            <td class="text-right amount-col">${formatNumber(item.amount || item.quantity * item.rate)}</td>
          </tr>
        `).join('');

      html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Tax Invoice</title>
<style>
html, body {
  width: 210mm;
  height: 297mm;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
@page { size: A4; margin: 18mm; }
body {
  font-family: Calibri, Arial, sans-serif;
  font-size: 12px;
}
.page {
  width: 174mm;
  height: 261mm;
  position: relative;
}
.header {
  display: flex;
  justify-content: space-between;
}
.logo img { height: 65px; }
.company {
  text-align: right;
  font-size: 11px;
}
.title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin: 6px 0;
}
.green-bar {
  height: 22px;
  background: #cfe5b3;
  margin-bottom: 8px;
}
.info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}
table, th, td {
  border: 1px solid #000;
}
th {
  background: #e6e6e6;
  padding: 5px;
}
td {
  height: 26px;
  padding: 4px;
}
.amount-col {
  background: #cfe5b3;
  font-weight: bold;
}
.items {
  height: 420px;
}
.text-right { text-align: right; }
.text-center { text-align: center; }
.totals {
  width: 32%;
  position: absolute;
  right: 0;
  bottom: 90px;
}
.totals td {
  background: #cfe5b3;
  font-weight: bold;
  padding: 6px;
}
.footer {
  position: absolute;
  bottom: 40px;
  font-size: 11px;
}
.footer-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #cfe5b3;
  padding: 6px;
  font-size: 10.5px;
  display: flex;
  justify-content: space-between;
}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo">
      <img src="https://ybgxfnykoqaggytachnv.supabase.co/storage/v1/object/public/assets/logo.jpeg" alt="Logo" onerror="this.style.display='none'">
    </div>
    <div class="company">
      <b>7 STAR INTERNATIONAL EVENTS L.L.C</b><br>
      P2A-J01, WHP2-BLOCK-A COMMERCIAL<br>
      SAIH SHUBAIB 3<br>DUBAI - UAE
    </div>
  </div>

  <div class="title">Tax Invoice</div>
  <div class="green-bar"></div>

  <div class="info">
    <div>
      Invoice Date: ${formatDate(invoice.invoice_date)}<br>
      Invoice No: ${invoice.invoice_number}<br>
      VAT TRN: 104038790200003
    </div>
    <div>
      <b>Client:</b><br>
      ${invoice.clients?.name || ''}
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th style="width:6%;">S.No</th>
        <th style="width:34%;">Description</th>
        <th style="width:8%;">Size</th>
        <th style="width:10%;">Qty</th>
        <th style="width:16%;">Rate</th>
        <th style="width:16%;" class="amount-col">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <table class="totals">
    <tr>
      <td>Net</td>
      <td class="text-right">${formatNumber(invoice.net_amount)}</td>
    </tr>
    <tr>
      <td>5% VAT</td>
      <td class="text-right">${formatNumber(invoice.vat_amount)}</td>
    </tr>
    <tr>
      <td>Total</td>
      <td class="text-right">${formatNumber(invoice.total_amount)}</td>
    </tr>
  </table>

  <div class="footer">
    Confirmed by: Shaji Mohammed Khan<br>
    Signature: ____________________
  </div>

  <div class="footer-bar">
    <span>NAD AL HAMMAR, DUBAI, UAE</span>
    <span>info@7starinternational.com</span>
    <span>+971 56 506 5566</span>
  </div>
</div>
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
