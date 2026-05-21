import { describe, it, expect } from 'vitest';
import { toSmallestUnit, fromSmallestUnit, getDecimalPlaces } from '../src/currency';

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
