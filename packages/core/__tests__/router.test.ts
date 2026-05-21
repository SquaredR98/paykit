import { describe, it, expect } from 'vitest';
import { resolveProvider } from '../src/router';
import type { RoutingConfig } from '../src/types/config';

const routingConfig: RoutingConfig = {
  default: 'stripe',
  rules: [
    { currency: 'INR', provider: 'razorpay' },
    { currency: 'BRL', provider: 'mercadopago' },
    { currency: 'NGN', provider: 'flutterwave' },
    { region: 'eu', provider: 'mollie' },
    { paymentMethod: 'upi', provider: 'razorpay' },
  ],
};

describe('resolveProvider', () => {
  it('matches by currency', () => {
    expect(resolveProvider(routingConfig, { currency: 'INR' })).toBe('razorpay');
    expect(resolveProvider(routingConfig, { currency: 'BRL' })).toBe('mercadopago');
    expect(resolveProvider(routingConfig, { currency: 'NGN' })).toBe('flutterwave');
  });

  it('currency matching is case-insensitive', () => {
    expect(resolveProvider(routingConfig, { currency: 'inr' })).toBe('razorpay');
    expect(resolveProvider(routingConfig, { currency: 'Inr' })).toBe('razorpay');
  });

  it('matches by region', () => {
    expect(resolveProvider(routingConfig, { region: 'eu' })).toBe('mollie');
    expect(resolveProvider(routingConfig, { region: 'EU' })).toBe('mollie');
  });

  it('matches by payment method', () => {
    expect(resolveProvider(routingConfig, { paymentMethod: 'upi' })).toBe('razorpay');
    expect(resolveProvider(routingConfig, { paymentMethod: 'UPI' })).toBe('razorpay');
  });

  it('falls back to default when no rule matches', () => {
    expect(resolveProvider(routingConfig, { currency: 'USD' })).toBe('stripe');
    expect(resolveProvider(routingConfig, {})).toBe('stripe');
  });

  it('explicit _provider override takes highest priority', () => {
    expect(
      resolveProvider(routingConfig, { currency: 'INR', _provider: 'stripe' }),
    ).toBe('stripe');

    expect(
      resolveProvider(routingConfig, { _provider: 'adyen' }),
    ).toBe('adyen');
  });

  it('first matching rule wins', () => {
    const config: RoutingConfig = {
      default: 'stripe',
      rules: [
        { currency: 'INR', provider: 'razorpay' },
        { currency: 'INR', provider: 'cashfree' },
      ],
    };

    expect(resolveProvider(config, { currency: 'INR' })).toBe('razorpay');
  });

  it('returns default when context has no matching fields', () => {
    expect(resolveProvider(routingConfig, { region: 'us' })).toBe('stripe');
  });

  it('works with empty rules', () => {
    const config: RoutingConfig = { default: 'stripe', rules: [] };
    expect(resolveProvider(config, { currency: 'INR' })).toBe('stripe');
  });
});
