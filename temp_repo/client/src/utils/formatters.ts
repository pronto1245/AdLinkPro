// Utility functions for formatting data

/**
 * Rounds CR (conversion rate) value up to 2 decimal places
 * Examples: 4.858477373333 → 4.86, 3.1 → 3.1, 5.001 → 5.01
 */
export function formatCR(crValue: string | number | null | undefined): string {
  if (!crValue || crValue === '' || crValue === '0' || crValue === 0) {
    return '0.00';
  }
  
  const numericValue = typeof crValue === 'string' ? parseFloat(crValue) : crValue;
  
  if (isNaN(numericValue)) {
    return '0.00';
  }
  
  // Round up to 2 decimal places
  const rounded = Math.ceil(numericValue * 100) / 100;
  
  return rounded.toFixed(2);
}

/**
 * Formats payout value with proper currency formatting
 */
export function formatPayout(payout: string | number | null | undefined, currency: string = 'USD'): string {
  if (!payout || payout === '' || payout === '0' || payout === 0) {
    return `$0.00 ${currency}`;
  }
  
  const numericValue = typeof payout === 'string' ? parseFloat(payout) : payout;
  
  if (isNaN(numericValue)) {
    return `$0.00 ${currency}`;
  }
  
  return `$${numericValue.toFixed(2)} ${currency}`;
}