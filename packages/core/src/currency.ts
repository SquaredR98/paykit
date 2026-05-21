/**
 * Map of ISO 4217 currency codes to their decimal places.
 * Used to convert between human-readable amounts and smallest units.
 *
 * Examples:
 * - USD has 2 decimal places: $10.00 = 1000 cents
 * - INR has 2 decimal places: ₹500.00 = 50000 paise
 * - JPY has 0 decimal places: ¥1000 = 1000 (no subdivision)
 * - BHD has 3 decimal places: 1.000 BHD = 1000 fils
 */
const CURRENCY_DECIMALS: Record<string, number> = {
  // Zero-decimal currencies
  BIF: 0, CLP: 0, DJF: 0, GNF: 0, ISK: 0, JPY: 0, KMF: 0,
  KRW: 0, PYG: 0, RWF: 0, UGX: 0, VND: 0, VUV: 0, XAF: 0,
  XOF: 0, XPF: 0,

  // Three-decimal currencies
  BHD: 3, IQD: 3, JOD: 3, KWD: 3, LYD: 3, OMR: 3, TND: 3,

  // Everything else defaults to 2 (USD, EUR, GBP, INR, BRL, etc.)
};

/**
 * Get the number of decimal places for a currency.
 * Defaults to 2 if not explicitly listed.
 */
export function getDecimalPlaces(currency: string): number {
  return CURRENCY_DECIMALS[currency.toUpperCase()] ?? 2;
}

/**
 * Convert a human-readable amount to the smallest currency unit.
 *
 * @example
 * toSmallestUnit(500, 'INR')  // 50000 (paise)
 * toSmallestUnit(10, 'USD')   // 1000 (cents)
 * toSmallestUnit(1000, 'JPY') // 1000 (yen — no subdivision)
 * toSmallestUnit(1, 'BHD')    // 1000 (fils — 3 decimals)
 */
export function toSmallestUnit(amount: number, currency: string): number {
  const decimals = getDecimalPlaces(currency);
  return Math.round(amount * 10 ** decimals);
}

/**
 * Convert from smallest currency unit to human-readable amount.
 *
 * @example
 * fromSmallestUnit(50000, 'INR')  // 500
 * fromSmallestUnit(1000, 'USD')   // 10
 * fromSmallestUnit(1000, 'JPY')   // 1000
 * fromSmallestUnit(1000, 'BHD')   // 1
 */
export function fromSmallestUnit(amount: number, currency: string): number {
  const decimals = getDecimalPlaces(currency);
  return amount / 10 ** decimals;
}
