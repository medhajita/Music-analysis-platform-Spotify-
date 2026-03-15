/**
 * Format large numbers into abbreviated form.
 * e.g., 1234567 → "1.2M", 45000 → "45K"
 */
export function formatNumber(num) {
  if (num == null || isNaN(num)) return '—';
  const n = Number(num);

  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
}

/**
 * Format a number with commas: 1234567 → "1,234,567"
 */
export function formatWithCommas(num) {
  if (num == null || isNaN(num)) return '—';
  return Number(num).toLocaleString();
}

/**
 * Format a number compactly using Intl.NumberFormat 
 * e.g., 1500000 -> 1.5M
 */
export function formatCompactNumber(num) {
  if (num == null || isNaN(num)) return '—';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(num);
}
