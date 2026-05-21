import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerAdapter,
  getAdapter,
  getRegisteredAdapters,
  _clearRegistry,
} from '../src/registry';
import type { PaymentAdapter } from '../src/adapter';
import type { ProviderCapabilities } from '../src/capabilities';

// Minimal mock adapter for testing registration
class MockAdapter implements PaymentAdapter {
  readonly name = 'mock';
  readonly capabilities: ProviderCapabilities = {
    charges: true,
    authAndCapture: false,
    refunds: true,
    partialRefunds: false,
    subscriptions: false,
    savedPaymentMethods: false,
    hostedCheckout: false,
    embeddableUI: false,
    payouts: false,
    multiCurrency: false,
    directDebit: false,
    webhooks: true,
    threeDS: false,
  };

  async initialize() {}
  async healthCheck() {
    return { healthy: true };
  }

  charges = {} as PaymentAdapter['charges'];
  refunds = {} as PaymentAdapter['refunds'];
  customers = {} as PaymentAdapter['customers'];
  paymentMethods = {} as PaymentAdapter['paymentMethods'];
  webhooks = {} as PaymentAdapter['webhooks'];
}

class AnotherMockAdapter extends MockAdapter {
  readonly name = 'another';
}

describe('registry', () => {
  beforeEach(() => {
    _clearRegistry();
  });

  it('registers and retrieves an adapter', () => {
    registerAdapter('mock', MockAdapter);
    const AdapterClass = getAdapter('mock');
    expect(AdapterClass).toBe(MockAdapter);
  });

  it('returns undefined for unregistered adapter', () => {
    expect(getAdapter('nonexistent')).toBeUndefined();
  });

  it('throws on duplicate registration', () => {
    registerAdapter('mock', MockAdapter);
    expect(() => registerAdapter('mock', AnotherMockAdapter)).toThrow(
      'Adapter "mock" is already registered',
    );
  });

  it('lists all registered adapter names', () => {
    registerAdapter('mock', MockAdapter);
    registerAdapter('another', AnotherMockAdapter);
    const names = getRegisteredAdapters();
    expect(names).toEqual(['mock', 'another']);
  });

  it('returns empty array when no adapters registered', () => {
    expect(getRegisteredAdapters()).toEqual([]);
  });

  it('clears registry (test utility)', () => {
    registerAdapter('mock', MockAdapter);
    expect(getAdapter('mock')).toBe(MockAdapter);
    _clearRegistry();
    expect(getAdapter('mock')).toBeUndefined();
  });
});
