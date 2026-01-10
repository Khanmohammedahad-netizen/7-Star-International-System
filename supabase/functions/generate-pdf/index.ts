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
<html lang="en">
<head>
<meta charset="UTF-8">
<title>7 Star Quotation</title>
<style>
@page { size: A4; margin: 18mm; }
body {
  font-family: Calibri, Arial, sans-serif;
  font-size: 12px;
  color: #000;
  margin: 0;
  padding: 0;
}
.wrapper {
  width: 100%;
  min-height: 260mm;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.logo img {
  height: 70px;
}
.company {
  text-align: right;
  font-size: 11px;
}
.company b {
  font-size: 14px;
}
.title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin: 8px 0;
}
.green-bar {
  background: #cfe5b3;
  padding: 6px;
  font-weight: bold;
  text-align: center;
  margin: 6px 0;
}
.green-row {
  background: #cfe5b3;
  padding: 6px;
  font-weight: bold;
}
.info {
  font-size: 11px;
  margin-top: 6px;
}
.info div {
  margin: 3px 0;
}
table {
  width: 100%;
  border-collapse: collapse;
}
table, th, td {
  border: 1px solid #000;
}
th {
  background: #e6e6e6;
  padding: 5px;
  text-align: center;
}
td {
  padding: 4px;
  height: 26px;
}
.green-col {
  background: #cfe5b3;
  font-weight: bold;
}
.text-right { text-align: right; }
.text-center { text-align: center; }
.terms {
  font-size: 11px;
  line-height: 1.6;
  margin-top: 8px;
}
.bank {
  font-size: 11px;
  line-height: 1.6;
  margin-top: 8px;
}
.approval {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}
.footer-bar {
  position: fixed;
  bottom: 12mm;
  left: 18mm;
  right: 18mm;
  background: #cfe5b3;
  padding: 6px;
  font-size: 10.5px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
}
.totals-table {
  width: 40%;
  margin-left: auto;
  margin-top: 10px;
  border: 2px solid #000;
}
.totals-table td {
  background: #cfe5b3;
  padding: 8px;
  font-weight: bold;
}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="logo">
      <img src="https://ybgxfnykoqaggytachnv.supabase.co/storage/v1/object/public/assets/logo.jpeg" alt="Logo" onerror="this.style.display='none'">
    </div>
    <div class="company">
      <b>7 STAR INTERNATIONAL EVENTS L.L.C</b><br>
      P2A-J01, WHP2-BLOCK-A COMMERCIAL<br>
      SAIH SHUBAIB 3<br>
      DUBAI - UAE
    </div>
  </div>

  <div class="title">Quotation</div>

  <div class="info">
    <div><b>CLIENT :</b> ${quotation.clients?.name || ''}</div>
    <div><b>Element :</b> ${quotation.element || '-'}</div>
  </div>

  <div class="info">
    <div class="green-row">Quotation Date : ${formatDate(quotation.quotation_date)}</div>
    <div class="green-row">Quotation Number : ${quotation.quotation_number}</div>
    <div class="green-row">VAT TRN : 104038790200003</div>
  </div>

  <table style="margin-top: 10px;">
    <thead>
      <tr>
        <th style="width:6%;">S.No</th>
        <th style="width:34%;">Description</th>
        <th style="width:8%;">Size</th>
        <th style="width:10%;">Quantity</th>
        <th style="width:16%;">Rate ${currency}</th>
        <th style="width:16%;" class="green-col">Amount ${currency}</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      ${emptyRows}
    </tbody>
  </table>

  <table class="totals-table">
    <tr>
      <td>Net Amount (${currency})</td>
      <td class="text-right">${formatNumber(quotation.net_amount)}</td>
    </tr>
    <tr>
      <td>5% VAT</td>
      <td class="text-right">${formatNumber(quotation.vat_amount)}</td>
    </tr>
    <tr>
      <td>Total</td>
      <td class="text-right">${formatNumber(quotation.total_amount)}</td>
    </tr>
  </table>

  <div class="green-bar">Terms & Conditions</div>

  <div class="terms">
    • Any Change in working drawings should be given before the fabrication has started<br>
    • Any Change in size will have cost implications<br>
    • Any NOC's from Municipality, Horticulture & DEWA/SEWA/FEWA are additions costs as per actuals.<br>
    • Economic Department approvals to be obtained by 7 Star International fees to be paid by Client.<br>
    • All site Utilities (Water, Electrical and Telephone) to be provided by Client.<br>
    • Enclosed storage area to be provided by client for storing the finished work till the time of Installation.<br>
    • Variation to any of the above information must be confirmed in writing by the officials.<br>
    • Payment Terms 50% advance along with order confirmation and 50% upon completion of project.<br>
    • The payment will be accepted only via Transfer & Cheques to our Bank Account.
  </div>

  <div class="green-bar">Bank Details</div>

  <div class="bank">
    • ADCB BANK<br>
    • Account name - 7 Star International Events LLC SHJ BR<br>
    • Iban - AE020300012980065820001<br>
    • A/c no - 12980065820001<br>
    • Swiftcode - ADCBAEAA<br>
    • Branch - Abu Dhabi Main Branch
  </div>

  <div class="approval">
    <div>
      <b>7 Star International Events LLC</b><br>
      Approved by : Shaji Mohammed Khan<br>
      Signature :
    </div>
    <div>
      <b>Client</b><br>
      Approved by :<br>
      Signature :
    </div>
  </div>

  <div class="footer-bar">
    <div>NAD AL HAMMAR, DUBAI, UAE.</div>
    <div>ShajiKhan@7StarInternational.com</div>
    <div>00971 56 506 5566</div>
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
            <td class="text-right green-col">${formatNumber(item.amount || item.quantity * item.rate)}</td>
          </tr>
        `).join('');

      // Generate empty rows to fill the table (8 empty rows to match Excel layout)
      const emptyRowCount = Math.max(0, 8 - invoice.invoice_items.length);
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
<html lang="en">
<head>
<meta charset="UTF-8">
<title>7 Star Tax Invoice</title>
<style>
@page { size: A4; margin: 18mm; }
body { font-family: Calibri, Arial, sans-serif; font-size: 12px; color:#000; margin: 0; padding: 0; }
.wrapper { width:100%; }
.header {
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
}
.logo {
  display:flex;
  align-items:center;
  gap:10px;
}
.logo img { height:60px; }
.company-name {
  font-size:20px;
  font-weight:bold;
  color:#c00000;
}
.company {
  text-align:right;
  font-size:11px;
}
.title {
  text-align:center;
  font-size:20px;
  font-weight:bold;
  margin:10px 0;
}
.green-bar {
  background:#cfe5b3;
  height:22px;
  margin-bottom:10px;
}
.info {
  display:flex;
  justify-content:space-between;
  font-size:11px;
  margin-bottom:6px;
}
table {
  width:100%;
  border-collapse:collapse;
}
table, th, td {
  border:1px solid #000;
}
th {
  background:#e6e6e6;
  padding:5px;
  text-align:center;
}
td {
  padding:4px;
  height:26px;
}
.green-col {
  background:#cfe5b3;
  font-weight:bold;
}
.text-right { text-align:right; }
.text-center { text-align:center; }
.totals {
  width:32%;
  float:right;
  margin-top:10px;
  border:2px solid #000;
}
.totals td {
  background:#cfe5b3;
  padding:8px;
  font-weight:bold;
}
.footer {
  clear:both;
  font-size:11px;
  margin-top:15px;
}
.bottom-bar {
  position:fixed;
  bottom:12mm;
  left:18mm;
  right:18mm;
  background:#cfe5b3;
  padding:6px;
  font-size:10.5px;
  font-weight:bold;
  display:flex;
  justify-content:space-between;
}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="logo">
      <img src="https://ybgxfnykoqaggytachnv.supabase.co/storage/v1/object/public/assets/logo.jpeg" alt="Logo" onerror="this.style.display='none'">
      <span class="company-name">7 STAR INTERNATIONAL EVENTS L.L.C</span>
    </div>
    <div class="company">
      P2A-J01, WHP2-BLOCK-A COMMERCIAL<br>
      SAIH SHUBAIB 3<br>
      DUBAI - UAE
    </div>
  </div>

  <div class="title">Tax Invoice</div>
  <div class="green-bar"></div>

  <div class="info">
    <div>
      Invoice Date: ${formatDate(invoice.invoice_date)}<br>
      Invoice Number: ${invoice.invoice_number}
    </div>
    <div>
      <b>Client:</b><br>
      ${invoice.clients?.name || ''}
    </div>
  </div>

  <div style="font-size:11px; margin-bottom:6px;">VAT TRN: 104038790200003</div>

  <table>
    <thead>
      <tr>
        <th style="width:6%;">S.No</th>
        <th style="width:34%;">Description</th>
        <th style="width:8%;">Size</th>
        <th style="width:10%;">Quantity</th>
        <th style="width:16%;">Rate ${currency}</th>
        <th style="width:16%;" class="green-col">Amount ${currency}</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      ${emptyRows}
    </tbody>
  </table>

  <table class="totals">
    <tr>
      <td>Net Amount (${currency})</td>
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
    <p>Amount in Words: ${numberToWords(invoice.total_amount, invoice.region)}</p>
    <p>Confirmed by: Shaji Mohammed Khan<br>Signature: ____________________</p>
    <p>
      <b>Bank Details:</b><br>
      ADCB BANK<br>
      Account Name: 7 Star International Events LLC SHJ BR<br>
      IBAN: AE020300012980065820001<br>
      A/C No: 12980065820001<br>
      Swift Code: ADCBAEAA<br>
      Branch: Abu Dhabi Main Branch
    </p>
  </div>

  <div class="bottom-bar">
    <div>NAD AL HAMMAR, DUBAI, UAE.</div>
    <div>info@7starinternational.com</div>
    <div>+971 56 506 5566</div>
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
