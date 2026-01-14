import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// HTML escape function to prevent XSS
function escapeHtml(unsafe: string | null | undefined): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

  // Verify user role/permissions
  const { data: userRole } = await supabaseClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!userRole || !['super_admin', 'admin', 'accountant', 'manager'].includes(userRole.role)) {
    return { error: 'Insufficient permissions', status: 403 };
  }

  return { user, userRole: userRole.role };
}

// Logo URL for PDF generation
const LOGO_URL = 'https://ybgxfnykoqaggytachnv.supabase.co/storage/v1/object/public/assets/logo.jpeg';

// ============================================
// HTML Templates with Placeholders
// ============================================

const INVOICE_TEMPLATE = `<!DOCTYPE html>
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
.sub-item { padding-left: 15px; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo">
      <img src="{{LOGO_URL}}" alt="Logo" onerror="this.style.display='none'">
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
      Invoice Date: {{INVOICE_DATE}}<br>
      Invoice No: {{INVOICE_NO}}<br>
      VAT TRN: 104038790200003
    </div>
    <div>
      <b>Client:</b><br>
      {{CLIENT_NAME}}
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th style="width:8%;">S.No</th>
        <th style="width:32%;">Description</th>
        <th style="width:8%;">Size</th>
        <th style="width:10%;">Qty</th>
        <th style="width:16%;">Rate {{CURRENCY}}</th>
        <th style="width:16%;" class="amount-col">Amount {{CURRENCY}}</th>
      </tr>
    </thead>
    <tbody>
      {{INVOICE_ROWS}}
    </tbody>
  </table>

  <table class="totals">
    <tr>
      <td>Net</td>
      <td class="text-right">{{NET}}</td>
    </tr>
    <tr>
      <td>5% VAT</td>
      <td class="text-right">{{VAT}}</td>
    </tr>
    <tr>
      <td>Total</td>
      <td class="text-right">{{TOTAL}}</td>
    </tr>
  </table>

  <div class="footer">
    <p><strong>Amount in Words:</strong> {{AMOUNT_WORDS}}</p>
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

const QUOTATION_TEMPLATE = `<!DOCTYPE html>
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
      <img src="{{LOGO_URL}}" alt="Logo" onerror="this.style.display='none'">
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
    <div><b>CLIENT :</b> {{CLIENT_NAME}}</div>
    <div><b>Element :</b> {{ELEMENT}}</div>
  </div>

  <div class="info">
    <div class="green-row">Quotation Date : {{QUOTATION_DATE}}</div>
    <div class="green-row">Quotation Number : {{QUOTATION_NO}}</div>
    <div class="green-row">VAT TRN : 104038790200003</div>
  </div>

  <table style="margin-top: 10px;">
    <thead>
      <tr>
        <th style="width:6%;">S.No</th>
        <th style="width:34%;">Description</th>
        <th style="width:8%;">Size</th>
        <th style="width:10%;">Quantity</th>
        <th style="width:16%;">Rate {{CURRENCY}}</th>
        <th style="width:16%;" class="green-col">Amount {{CURRENCY}}</th>
      </tr>
    </thead>
    <tbody>
      {{QUOTATION_ROWS}}
    </tbody>
  </table>

  <table class="totals-table">
    <tr>
      <td>Net Amount ({{CURRENCY}})</td>
      <td class="text-right">{{NET_AMOUNT}}</td>
    </tr>
    <tr>
      <td>5% VAT</td>
      <td class="text-right">{{VAT}}</td>
    </tr>
    <tr>
      <td>Total</td>
      <td class="text-right">{{TOTAL}}</td>
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

const LEDGER_TEMPLATE = `<!DOCTYPE html>
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

<h4 class="center">{{CLIENT_NAME}}</h4>
<h3 class="center">LEDGER ACCOUNT</h3>
<p class="center">{{FROM_DATE}} to {{TO_DATE}}</p>

<table>
<thead>
<tr>
<th>Date</th>
<th>Particulars</th>
<th>INV Type</th>
<th>INV No.</th>
<th>Debit ({{CURRENCY}})</th>
<th>Credit ({{CURRENCY}})</th>
</tr>
</thead>
<tbody>
{{LEDGER_ROWS}}
</tbody>
</table>

<table>
<tr>
<td class="right"><strong>Closing Balance</strong></td>
<td class="right">{{CLOSING_BALANCE}}</td>
</tr>
</table>

<p><strong>NOTE:</strong> Closing balance as on today in {{CURRENCY}} {{CLOSING_BALANCE}}</p>

<p>
<strong>Bank Details:</strong><br>
ADCB BANK<br>
IBAN: AE020030012980065820001
</p>

</body>
</html>`;

// ============================================
// Template replacement function
// ============================================

function replaceTemplatePlaceholders(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{{${key}}}`;
    result = result.split(placeholder).join(value);
  }
  return result;
}

// ============================================
// Main server handler
// ============================================

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

    const { type, id, clientId, fromDate, toDate } = await req.json();
    
    // Use service key for data access after authentication is verified
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
      
      // Generate rows HTML
      const rows = quotation.quotation_items
        .sort((a: any, b: any) => a.serial_no - b.serial_no)
        .map((item: any) => `
          <tr>
            <td class="text-center">${escapeHtml(String(item.serial_no))}</td>
            <td>${escapeHtml(item.description)}</td>
            <td class="text-center">${escapeHtml(item.size) || '-'}</td>
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

      // Replace placeholders
      html = replaceTemplatePlaceholders(QUOTATION_TEMPLATE, {
        LOGO_URL: LOGO_URL,
        CLIENT_NAME: escapeHtml(quotation.clients?.name || ''),
        ELEMENT: escapeHtml(quotation.element) || '-',
        QUOTATION_DATE: formatDate(quotation.quotation_date),
        QUOTATION_NO: escapeHtml(quotation.quotation_number),
        CURRENCY: currency,
        QUOTATION_ROWS: rows + emptyRows,
        NET_AMOUNT: formatNumber(quotation.net_amount),
        VAT: formatNumber(quotation.vat_amount),
        TOTAL: formatNumber(quotation.total_amount),
      });

    } else if (type === 'invoice') {
      const { data: invoice, error } = await supabase
        .from('invoices')
        .select('*, clients(*), invoice_items(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const currency = getCurrencyCode(invoice.region);
      
      // Sort items: main items first by serial_no, then sub-items under their parent
      const sortedItems = invoice.invoice_items.sort((a: any, b: any) => {
        // If both are main items, sort by serial_no
        if (!a.is_sub_item && !b.is_sub_item) {
          return a.serial_no - b.serial_no;
        }
        // If both are sub-items with the same parent, sort by serial_no
        if (a.is_sub_item && b.is_sub_item && a.parent_serial_no === b.parent_serial_no) {
          return a.serial_no - b.serial_no;
        }
        // Get effective parent for sorting
        const aParent = a.is_sub_item ? a.parent_serial_no : a.serial_no;
        const bParent = b.is_sub_item ? b.parent_serial_no : b.serial_no;
        
        if (aParent !== bParent) {
          return aParent - bParent;
        }
        // Same parent: main item comes before its sub-items
        if (!a.is_sub_item) return -1;
        if (!b.is_sub_item) return 1;
        return a.serial_no - b.serial_no;
      });
      
      // Generate rows HTML with hierarchical numbering
      const rows = sortedItems
        .map((item: any) => {
          // Generate display serial number (1, 1.1, 1.2, 2, etc.)
          const displaySerialNo = item.is_sub_item && item.parent_serial_no 
            ? `${item.parent_serial_no}.${item.serial_no}` 
            : String(item.serial_no);
          
          // Add sub-item class for indentation
          const descriptionClass = item.is_sub_item ? 'class="sub-item"' : '';
          
          return `
            <tr>
              <td class="text-center">${escapeHtml(displaySerialNo)}</td>
              <td ${descriptionClass}>${escapeHtml(item.description)}</td>
              <td class="text-center">${escapeHtml(item.size) || '-'}</td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">${formatNumber(item.rate)}</td>
              <td class="text-right amount-col">${formatNumber(item.amount || item.quantity * item.rate)}</td>
            </tr>
          `;
        }).join('');

      // Replace placeholders
      html = replaceTemplatePlaceholders(INVOICE_TEMPLATE, {
        LOGO_URL: LOGO_URL,
        INVOICE_DATE: formatDate(invoice.invoice_date),
        INVOICE_NO: escapeHtml(invoice.invoice_number),
        CLIENT_NAME: escapeHtml(invoice.clients?.name || ''),
        CURRENCY: currency,
        INVOICE_ROWS: rows,
        NET: formatNumber(invoice.net_amount),
        VAT: formatNumber(invoice.vat_amount),
        TOTAL: formatNumber(invoice.total_amount),
        AMOUNT_WORDS: numberToWords(invoice.total_amount, invoice.region),
      });

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
            <td>${escapeHtml(entry.particulars)}</td>
            <td class="center">${escapeHtml(entry.invType)}</td>
            <td>${escapeHtml(entry.invNo)}</td>
            <td class="right">${entry.debit > 0 ? formatNumber(entry.debit) : '-'}</td>
            <td class="right">${entry.credit > 0 ? formatNumber(entry.credit) : '-'}</td>
          </tr>
        `;
      }).join('');

      // Replace placeholders
      html = replaceTemplatePlaceholders(LEDGER_TEMPLATE, {
        CLIENT_NAME: escapeHtml(client.name),
        FROM_DATE: fromDate ? formatDate(fromDate) : 'Beginning',
        TO_DATE: toDate ? formatDate(toDate) : 'Today',
        CURRENCY: currency,
        LEDGER_ROWS: rows,
        CLOSING_BALANCE: formatNumber(closingBalance),
      });

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
