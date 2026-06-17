/**
 * Top 30 ISO 4217 currency codes as a union type.
 */
export type CurrencyCode =
  | 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY'
  | 'CNY' | 'BRL' | 'MXN' | 'KRW' | 'AUD'
  | 'CAD' | 'CHF' | 'HKD' | 'SGD' | 'SEK'
  | 'NOK' | 'DKK' | 'NZD' | 'ZAR' | 'THB'
  | 'MYR' | 'IDR' | 'PHP' | 'VND' | 'TWD'
  | 'AED' | 'SAR' | 'EGP' | 'NGN' | 'KES';

/**
 * Currency metadata returned by getCurrencyInfo().
 */
export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  decimalPlaces: number;
}

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
 * Currency metadata — symbol, name, decimal places.
 */
const CURRENCY_DATA: Record<string, { symbol: string; name: string }> = {
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
  BRL: { symbol: 'R$', name: 'Brazilian Real' },
  MXN: { symbol: '$', name: 'Mexican Peso' },
  KRW: { symbol: '₩', name: 'South Korean Won' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc' },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar' },
  SEK: { symbol: 'kr', name: 'Swedish Krona' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone' },
  DKK: { symbol: 'kr', name: 'Danish Krone' },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar' },
  ZAR: { symbol: 'R', name: 'South African Rand' },
  THB: { symbol: '฿', name: 'Thai Baht' },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit' },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah' },
  PHP: { symbol: '₱', name: 'Philippine Peso' },
  VND: { symbol: '₫', name: 'Vietnamese Dong' },
  TWD: { symbol: 'NT$', name: 'New Taiwan Dollar' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham' },
  SAR: { symbol: '﷼', name: 'Saudi Riyal' },
  EGP: { symbol: 'E£', name: 'Egyptian Pound' },
  NGN: { symbol: '₦', name: 'Nigerian Naira' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling' },
  BHD: { symbol: 'BD', name: 'Bahraini Dinar' },
  KWD: { symbol: 'KD', name: 'Kuwaiti Dinar' },
  OMR: { symbol: 'OMR', name: 'Omani Rial' },
  JOD: { symbol: 'JD', name: 'Jordanian Dinar' },
};

/**
 * Get the number of decimal places for a currency.
 * Defaults to 2 if not explicitly listed.
 */
export function getDecimalPlaces(currency: string): number {
  return CURRENCY_DECIMALS[currency.toUpperCase()] ?? 2;
}

/**
 * Get metadata for a currency code.
 *
 * @example
 * getCurrencyInfo('USD') // { code: 'USD', symbol: '$', name: 'US Dollar', decimalPlaces: 2 }
 * getCurrencyInfo('JPY') // { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0 }
 */
export function getCurrencyInfo(code: string): CurrencyInfo {
  const upper = code.toUpperCase();
  const data = CURRENCY_DATA[upper];
  return {
    code: upper,
    symbol: data?.symbol ?? upper,
    name: data?.name ?? upper,
    decimalPlaces: getDecimalPlaces(upper),
  };
}

/**
 * Format an amount in smallest units to a human-readable currency string.
 *
 * @example
 * formatAmount(4900, 'USD')    // '$49.00'
 * formatAmount(409900, 'INR')  // '₹4,099.00'
 * formatAmount(5000, 'JPY')    // '¥5,000'
 * formatAmount(1500, 'BHD')    // 'BD1.500'
 */
export function formatAmount(amountInSmallestUnit: number, currency: string): string {
  const info = getCurrencyInfo(currency);
  const value = amountInSmallestUnit / 10 ** info.decimalPlaces;

  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: info.decimalPlaces,
    maximumFractionDigits: info.decimalPlaces,
  });

  return `${info.symbol}${formatted}`;
}

/**
 * Check if a currency code is in the supported CurrencyCode list.
 */
export function isSupportedCurrency(code: string): boolean {
  return code.toUpperCase() in CURRENCY_DATA;
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
