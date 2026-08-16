/**
 * Currencies where the smallest unit is a whole number (no fractional digits).
 * Used when converting between PayPal's decimal string amounts and PayKit's integer amounts.
 */
export const ZERO_DECIMAL_CURRENCIES = new Set([
  'JPY', 'KRW', 'VND', 'BIF', 'CLP', 'GNF',
  'ISK', 'KMF', 'PYG', 'RWF', 'UGX', 'XAF',
  'XOF', 'XPF',
]);
