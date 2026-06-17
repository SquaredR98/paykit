import { describe, it, expect } from 'vitest';
import {
  toSmallestUnit,
  fromSmallestUnit,
  getDecimalPlaces,
  getCurrencyInfo,
  formatAmount,
  isSupportedCurrency,
} from '../src/currency';

describe('getDecimalPlaces', () => {
  it('returns 2 for standard currencies (USD, EUR, GBP, INR)', () => {
    expect(getDecimalPlaces('USD')).toBe(2);
    expect(getDecimalPlaces('EUR')).toBe(2);
    expect(getDecimalPlaces('GBP')).toBe(2);
    expect(getDecimalPlaces('INR')).toBe(2);
    expect(getDecimalPlaces('BRL')).toBe(2);
  });

  it('returns 0 for zero-decimal currencies (JPY, KRW, VND)', () => {
    expect(getDecimalPlaces('JPY')).toBe(0);
    expect(getDecimalPlaces('KRW')).toBe(0);
    expect(getDecimalPlaces('VND')).toBe(0);
    expect(getDecimalPlaces('UGX')).toBe(0);
  });

  it('returns 3 for three-decimal currencies (BHD, KWD, OMR)', () => {
    expect(getDecimalPlaces('BHD')).toBe(3);
    expect(getDecimalPlaces('KWD')).toBe(3);
    expect(getDecimalPlaces('OMR')).toBe(3);
    expect(getDecimalPlaces('JOD')).toBe(3);
  });

  it('is case-insensitive', () => {
    expect(getDecimalPlaces('usd')).toBe(2);
    expect(getDecimalPlaces('jpy')).toBe(0);
    expect(getDecimalPlaces('bhd')).toBe(3);
  });

  it('defaults to 2 for unknown currencies', () => {
    expect(getDecimalPlaces('XYZ')).toBe(2);
  });
});

describe('getCurrencyInfo', () => {
  it('returns full info for known currencies', () => {
    const usd = getCurrencyInfo('USD');
    expect(usd).toEqual({
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      decimalPlaces: 2,
    });

    const inr = getCurrencyInfo('INR');
    expect(inr).toEqual({
      code: 'INR',
      symbol: '₹',
      name: 'Indian Rupee',
      decimalPlaces: 2,
    });

    const jpy = getCurrencyInfo('JPY');
    expect(jpy).toEqual({
      code: 'JPY',
      symbol: '¥',
      name: 'Japanese Yen',
      decimalPlaces: 0,
    });
  });

  it('returns info for three-decimal currencies', () => {
    const bhd = getCurrencyInfo('BHD');
    expect(bhd.symbol).toBe('BD');
    expect(bhd.decimalPlaces).toBe(3);
  });

  it('is case-insensitive', () => {
    const info = getCurrencyInfo('eur');
    expect(info.code).toBe('EUR');
    expect(info.symbol).toBe('€');
  });

  it('returns fallback for unknown currencies', () => {
    const info = getCurrencyInfo('XYZ');
    expect(info.code).toBe('XYZ');
    expect(info.symbol).toBe('XYZ');
    expect(info.name).toBe('XYZ');
    expect(info.decimalPlaces).toBe(2);
  });
});

describe('formatAmount', () => {
  it('formats USD correctly', () => {
    expect(formatAmount(4900, 'USD')).toBe('$49.00');
    expect(formatAmount(100, 'USD')).toBe('$1.00');
    expect(formatAmount(0, 'USD')).toBe('$0.00');
    expect(formatAmount(999999, 'USD')).toBe('$9,999.99');
  });

  it('formats INR correctly', () => {
    expect(formatAmount(409900, 'INR')).toBe('₹4,099.00');
    expect(formatAmount(100, 'INR')).toBe('₹1.00');
  });

  it('formats zero-decimal currencies (JPY)', () => {
    expect(formatAmount(5000, 'JPY')).toBe('¥5,000');
    expect(formatAmount(100, 'JPY')).toBe('¥100');
  });

  it('formats three-decimal currencies (BHD)', () => {
    expect(formatAmount(1500, 'BHD')).toBe('BD1.500');
    expect(formatAmount(1234, 'BHD')).toBe('BD1.234');
  });

  it('formats EUR correctly', () => {
    expect(formatAmount(1050, 'EUR')).toBe('€10.50');
  });

  it('formats GBP correctly', () => {
    expect(formatAmount(2500, 'GBP')).toBe('£25.00');
  });

  it('formats large amounts with commas', () => {
    expect(formatAmount(10000000, 'USD')).toBe('$100,000.00');
  });

  it('is case-insensitive', () => {
    expect(formatAmount(4900, 'usd')).toBe('$49.00');
  });
});

describe('isSupportedCurrency', () => {
  it('returns true for supported currencies', () => {
    expect(isSupportedCurrency('USD')).toBe(true);
    expect(isSupportedCurrency('INR')).toBe(true);
    expect(isSupportedCurrency('JPY')).toBe(true);
    expect(isSupportedCurrency('EUR')).toBe(true);
    expect(isSupportedCurrency('NGN')).toBe(true);
  });

  it('returns false for unknown currencies', () => {
    expect(isSupportedCurrency('XYZ')).toBe(false);
    expect(isSupportedCurrency('ABC')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isSupportedCurrency('usd')).toBe(true);
    expect(isSupportedCurrency('inr')).toBe(true);
  });
});

describe('toSmallestUnit', () => {
  it('converts USD dollars to cents', () => {
    expect(toSmallestUnit(10, 'USD')).toBe(1000);
    expect(toSmallestUnit(0.5, 'USD')).toBe(50);
    expect(toSmallestUnit(99.99, 'USD')).toBe(9999);
  });

  it('converts INR rupees to paise', () => {
    expect(toSmallestUnit(500, 'INR')).toBe(50000);
    expect(toSmallestUnit(1, 'INR')).toBe(100);
  });

  it('returns same value for zero-decimal currencies (JPY)', () => {
    expect(toSmallestUnit(1000, 'JPY')).toBe(1000);
    expect(toSmallestUnit(1, 'JPY')).toBe(1);
  });

  it('converts three-decimal currencies (BHD)', () => {
    expect(toSmallestUnit(1, 'BHD')).toBe(1000);
    expect(toSmallestUnit(0.5, 'BHD')).toBe(500);
    expect(toSmallestUnit(1.234, 'BHD')).toBe(1234);
  });

  it('rounds to avoid floating point issues', () => {
    expect(toSmallestUnit(19.99, 'USD')).toBe(1999);
    expect(toSmallestUnit(0.1 + 0.2, 'USD')).toBe(30);
  });
});

describe('fromSmallestUnit', () => {
  it('converts cents to USD dollars', () => {
    expect(fromSmallestUnit(1000, 'USD')).toBe(10);
    expect(fromSmallestUnit(50, 'USD')).toBe(0.5);
    expect(fromSmallestUnit(9999, 'USD')).toBe(99.99);
  });

  it('converts paise to INR rupees', () => {
    expect(fromSmallestUnit(50000, 'INR')).toBe(500);
    expect(fromSmallestUnit(100, 'INR')).toBe(1);
  });

  it('returns same value for zero-decimal currencies (JPY)', () => {
    expect(fromSmallestUnit(1000, 'JPY')).toBe(1000);
  });

  it('converts three-decimal currencies (BHD)', () => {
    expect(fromSmallestUnit(1000, 'BHD')).toBe(1);
    expect(fromSmallestUnit(1234, 'BHD')).toBe(1.234);
  });

  it('is the inverse of toSmallestUnit', () => {
    expect(fromSmallestUnit(toSmallestUnit(500, 'INR'), 'INR')).toBe(500);
    expect(fromSmallestUnit(toSmallestUnit(10, 'USD'), 'USD')).toBe(10);
    expect(fromSmallestUnit(toSmallestUnit(1000, 'JPY'), 'JPY')).toBe(1000);
    expect(fromSmallestUnit(toSmallestUnit(1, 'BHD'), 'BHD')).toBe(1);
  });
});
