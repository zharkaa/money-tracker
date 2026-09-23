/**
 * Utility functions for Rupiah formatting and Indonesian localization
 */

// Formatter for Indonesian Rupiah
const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format a number to Rupiah string, e.g. 50000 -> "Rp 50.000"
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  return rupiahFormatter.format(amount);
}

/**
 * Format a standard date string (YYYY-MM-DD) into Indonesian locale format
 * e.g. "2026-09-23" -> "23 September 2026"
 */
export function formatDateIndo(dateStr: string, options?: { short?: boolean }): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: options?.short ? 'short' : 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Get today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format month-year display for Indonesian locale, e.g. "September 2026"
 */
export function formatMonthYearIndo(year: number, monthIndex: number): string {
  const date = new Date(year, monthIndex, 1);
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}
