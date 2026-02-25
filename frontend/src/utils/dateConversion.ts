/**
 * Convert nanoseconds (bigint) to milliseconds (number)
 */
export function nsToMs(ns: bigint): number {
  return Number(ns / 1_000_000n);
}

/**
 * Convert milliseconds (number) to nanoseconds (bigint)
 */
export function msToNs(ms: number): bigint {
  return BigInt(Math.floor(ms)) * 1_000_000n;
}

/**
 * Format a nanosecond timestamp as DD/MM/YYYY
 */
export function formatDateDDMMYYYY(ns: bigint): string {
  const ms = nsToMs(ns);
  const d = new Date(ms);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Convert a date input value (YYYY-MM-DD string) to nanoseconds bigint
 */
export function dateInputToNs(dateStr: string): bigint {
  const ms = new Date(dateStr).getTime();
  return msToNs(ms);
}

/**
 * Convert nanoseconds bigint to date input value (YYYY-MM-DD)
 */
export function nsToDateInput(ns: bigint): string {
  const ms = nsToMs(ns);
  const d = new Date(ms);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function todayDateInput(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
