// Currency utility for region-based currency handling

export type Region = 'UAE' | 'SAUDI';

export const CURRENCY_MAP: Record<Region, string> = {
  UAE: 'AED',
  SAUDI: 'SAR',
};

export const CURRENCY_NAMES: Record<Region, { main: string; sub: string }> = {
  UAE: { main: 'Dirhams', sub: 'Fils' },
  SAUDI: { main: 'Riyals', sub: 'Halalas' },
};

export function getCurrencyCode(region: Region | string): string {
  return CURRENCY_MAP[region as Region] || 'AED';
}

export function getCurrencyNames(region: Region | string): { main: string; sub: string } {
  return CURRENCY_NAMES[region as Region] || CURRENCY_NAMES.UAE;
}

export function formatCurrency(amount: number, region: Region | string): string {
  const code = getCurrencyCode(region);
  return `${amount.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${code}`;
}

// Number to words converter for amounts
export function numberToWords(num: number, region: Region | string): string {
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
