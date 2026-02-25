/**
 * Formats a number as Indian currency with ₹ symbol.
 * Uses Indian numbering system (lakhs, crores).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a number with ₹ prefix and 2 decimal places (compact).
 */
export function formatAmount(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}
