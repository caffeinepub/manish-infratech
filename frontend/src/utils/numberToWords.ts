const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

function convertHundreds(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ones[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return tens[t] + (o ? ' ' + ones[o] : '');
  }
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return ones[h] + ' Hundred' + (rest ? ' ' + convertHundreds(rest) : '');
}

function convertToIndianWords(n: number): string {
  if (n === 0) return 'Zero';

  const crore = Math.floor(n / 10_000_000);
  n %= 10_000_000;
  const lakh = Math.floor(n / 100_000);
  n %= 100_000;
  const thousand = Math.floor(n / 1_000);
  n %= 1_000;
  const rest = n;

  const parts: string[] = [];
  if (crore) parts.push(convertHundreds(crore) + ' Crore');
  if (lakh) parts.push(convertHundreds(lakh) + ' Lakh');
  if (thousand) parts.push(convertHundreds(thousand) + ' Thousand');
  if (rest) parts.push(convertHundreds(rest));

  return parts.join(' ');
}

/**
 * Convert a numeric amount to Indian currency words.
 * e.g. 12500.50 → "Rupees Twelve Thousand Five Hundred and Fifty Paise Only"
 */
export function numberToWords(amount: number): string {
  if (isNaN(amount) || amount < 0) return 'Rupees Zero Only';

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let result = 'Rupees ' + convertToIndianWords(rupees);
  if (paise > 0) {
    result += ' and ' + convertToIndianWords(paise) + ' Paise';
  }
  result += ' Only';
  return result;
}
