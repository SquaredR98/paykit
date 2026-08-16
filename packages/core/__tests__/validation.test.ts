import { describe, it, expect } from 'vitest';
import { ValidationError, PaymentError } from '../src/errors';
import { UnifiedPayments } from '../src/client';

describe('ValidationError', () => {
  it('extends PaymentError with code invalid_request', () => {
    const err = new ValidationError('amount must be a positive number');

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(PaymentError);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.name).toBe('ValidationError');
    expect(err.code).toBe('invalid_request');
    expect(err.message).toBe('amount must be a positive number');
    expect(err.provider).toBe('paykit');
    expect(err.isRetryable).toBe(false);
  });

  it('stores the field name when provided', () => {
    const err = new ValidationError('currency is required', { field: 'currency' });

    expect(err.field).toBe('currency');
    expect(err.message).toBe('currency is required');
  });

  it('field is undefined when not provided', () => {
    const err = new ValidationError('invalid params');

    expect(err.field).toBeUndefined();
  });

  it('has auto-populated suggestion from ERROR_SUGGESTIONS', () => {
    const err = new ValidationError('bad request');

    expect(err.suggestion).toBeTruthy();
    expect(typeof err.suggestion).toBe('string');
  });

  it('has a proper stack trace', () => {
    const err = new ValidationError('test error');

    expect(err.stack).toBeDefined();
    expect(err.stack).toContain('test error');
  });
});

describe('charges.create validation', () => {
  // We test the validation function indirectly by importing and calling it
  // through the client. Since the client requires an adapter, we test the
  // validation logic by importing the client with a mock adapter.

  // For unit tests, we extract the validation checks and test them directly.
  // The validateChargeParams function is private to client.ts, so we test
  // through the public API using a minimal mock adapter.

  const mockAdapter = {
    name: 'mock',
    capabilities: {
      charges: true,
      refunds: true,
      customers: true,
      paymentMethods: true,
      webhooks: true,
      subscriptions: false,
      payouts: false,
    },
    charges: {
      create: async () => ({} as any),
      retrieve: async () => ({} as any),
      capture: async () => ({} as any),
      cancel: async () => ({} as any),
      list: async () => ({} as any),
    },
    refunds: {
      create: async () => ({} as any),
      retrieve: async () => ({} as any),
      list: async () => ({} as any),
    },
    customers: {
      create: async () => ({} as any),
      retrieve: async () => ({} as any),
      update: async () => ({} as any),
      delete: async () => ({} as any),
      list: async () => ({} as any),
    },
    paymentMethods: {
      create: async () => ({} as any),
      retrieve: async () => ({} as any),
      attach: async () => ({} as any),
      detach: async () => ({} as any),
      list: async () => ({} as any),
    },
    webhooks: {
      verify: () => true,
      parse: () => ({} as any),
    },
    initialize: async () => {},
    healthCheck: async () => ({ healthy: true }),
  } as any;

  function createClient() {
    return new UnifiedPayments({ adapter: mockAdapter });
  }

  it('rejects amount = 0', async () => {
    const paykit = createClient();
    await expect(
      paykit.charges.create({ amount: 0, currency: 'USD' }),
    ).rejects.toThrow(ValidationError);

    try {
      await paykit.charges.create({ amount: 0, currency: 'USD' });
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).field).toBe('amount');
      expect((err as ValidationError).message).toContain('positive number');
    }
  });

  it('rejects negative amount', async () => {
    const paykit = createClient();
    await expect(
      paykit.charges.create({ amount: -100, currency: 'USD' }),
    ).rejects.toThrow(ValidationError);
  });

  it('rejects non-integer amount', async () => {
    const paykit = createClient();
    await expect(
      paykit.charges.create({ amount: 49.99, currency: 'USD' }),
    ).rejects.toThrow(ValidationError);

    try {
      await paykit.charges.create({ amount: 49.99, currency: 'USD' });
    } catch (err) {
      expect((err as ValidationError).message).toContain('integer');
      expect((err as ValidationError).field).toBe('amount');
    }
  });

  it('rejects NaN amount', async () => {
    const paykit = createClient();
    await expect(
      paykit.charges.create({ amount: NaN, currency: 'USD' }),
    ).rejects.toThrow(ValidationError);
  });

  it('rejects Infinity amount', async () => {
    const paykit = createClient();
    await expect(
      paykit.charges.create({ amount: Infinity, currency: 'USD' }),
    ).rejects.toThrow(ValidationError);
  });

  it('rejects empty currency', async () => {
    const paykit = createClient();
    await expect(
      paykit.charges.create({ amount: 1000, currency: '' }),
    ).rejects.toThrow(ValidationError);

    try {
      await paykit.charges.create({ amount: 1000, currency: '' });
    } catch (err) {
      expect((err as ValidationError).field).toBe('currency');
      expect((err as ValidationError).message).toContain('currency is required');
    }
  });

  it('rejects whitespace-only currency', async () => {
    const paykit = createClient();
    await expect(
      paykit.charges.create({ amount: 1000, currency: '   ' }),
    ).rejects.toThrow(ValidationError);
  });

  it('rejects non-string description', async () => {
    const paykit = createClient();
    await expect(
      paykit.charges.create({
        amount: 1000,
        currency: 'USD',
        description: 123 as any,
      }),
    ).rejects.toThrow(ValidationError);

    try {
      await paykit.charges.create({
        amount: 1000,
        currency: 'USD',
        description: 123 as any,
      });
    } catch (err) {
      expect((err as ValidationError).field).toBe('description');
    }
  });

  it('accepts valid params', async () => {
    const paykit = createClient();
    // Should not throw — the mock adapter returns an empty object
    await expect(
      paykit.charges.create({ amount: 1000, currency: 'USD' }),
    ).resolves.toBeDefined();
  });

  it('accepts valid params with optional description', async () => {
    const paykit = createClient();
    await expect(
      paykit.charges.create({
        amount: 5000,
        currency: 'INR',
        description: 'Test charge',
      }),
    ).resolves.toBeDefined();
  });

  it('accepts valid params without description', async () => {
    const paykit = createClient();
    await expect(
      paykit.charges.create({ amount: 1, currency: 'JPY' }),
    ).resolves.toBeDefined();
  });
});

describe('subscriptions.create validation', () => {
  const mockAdapterWithSubs = {
    name: 'mock',
    capabilities: {
      charges: true,
      refunds: true,
      customers: true,
      paymentMethods: true,
      webhooks: true,
      subscriptions: true,
      payouts: false,
      authAndCapture: false,
      partialRefunds: false,
      savedPaymentMethods: false,
      hostedCheckout: false,
      embeddableUI: false,
      multiCurrency: false,
      directDebit: false,
      threeDS: false,
    },
    charges: {
      create: async () => ({} as any),
      retrieve: async () => ({} as any),
      capture: async () => ({} as any),
      cancel: async () => ({} as any),
      list: async () => ({} as any),
    },
    refunds: {
      create: async () => ({} as any),
      retrieve: async () => ({} as any),
      list: async () => ({} as any),
    },
    customers: {
      create: async () => ({} as any),
      retrieve: async () => ({} as any),
      update: async () => ({} as any),
      delete: async () => ({} as any),
      list: async () => ({} as any),
    },
    paymentMethods: {
      create: async () => ({} as any),
      retrieve: async () => ({} as any),
      attach: async () => ({} as any),
      detach: async () => ({} as any),
      list: async () => ({} as any),
    },
    webhooks: {
      verify: () => true,
      parse: () => ({} as any),
    },
    subscriptions: {
      create: async () => ({} as any),
      retrieve: async () => ({} as any),
      update: async () => ({} as any),
      cancel: async () => ({} as any),
      list: async () => ({} as any),
    },
    initialize: async () => {},
    healthCheck: async () => ({ healthy: true }),
  } as any;

  function createSubClient() {
    return new UnifiedPayments({ adapter: mockAdapterWithSubs });
  }

  it('rejects empty customer', async () => {
    const paykit = createSubClient();
    await expect(
      paykit.subscriptions!.create({ customer: '', amount: 999, currency: 'USD', interval: 'month' }),
    ).rejects.toThrow(ValidationError);

    try {
      await paykit.subscriptions!.create({ customer: '', amount: 999, currency: 'USD', interval: 'month' });
    } catch (err) {
      expect((err as ValidationError).field).toBe('customer');
    }
  });

  it('rejects whitespace-only customer', async () => {
    const paykit = createSubClient();
    await expect(
      paykit.subscriptions!.create({ customer: '   ', amount: 999, currency: 'USD', interval: 'month' }),
    ).rejects.toThrow(ValidationError);
  });

  it('rejects amount = 0', async () => {
    const paykit = createSubClient();
    await expect(
      paykit.subscriptions!.create({ customer: 'cus_xxx', amount: 0, currency: 'USD', interval: 'month' }),
    ).rejects.toThrow(ValidationError);
  });

  it('rejects negative amount', async () => {
    const paykit = createSubClient();
    await expect(
      paykit.subscriptions!.create({ customer: 'cus_xxx', amount: -100, currency: 'USD', interval: 'month' }),
    ).rejects.toThrow(ValidationError);
  });

  it('rejects non-integer amount', async () => {
    const paykit = createSubClient();
    await expect(
      paykit.subscriptions!.create({ customer: 'cus_xxx', amount: 9.99, currency: 'USD', interval: 'month' }),
    ).rejects.toThrow(ValidationError);

    try {
      await paykit.subscriptions!.create({ customer: 'cus_xxx', amount: 9.99, currency: 'USD', interval: 'month' });
    } catch (err) {
      expect((err as ValidationError).message).toContain('integer');
      expect((err as ValidationError).field).toBe('amount');
    }
  });

  it('rejects empty currency', async () => {
    const paykit = createSubClient();
    await expect(
      paykit.subscriptions!.create({ customer: 'cus_xxx', amount: 999, currency: '', interval: 'month' }),
    ).rejects.toThrow(ValidationError);

    try {
      await paykit.subscriptions!.create({ customer: 'cus_xxx', amount: 999, currency: '', interval: 'month' });
    } catch (err) {
      expect((err as ValidationError).field).toBe('currency');
    }
  });

  it('rejects invalid interval', async () => {
    const paykit = createSubClient();
    await expect(
      paykit.subscriptions!.create({ customer: 'cus_xxx', amount: 999, currency: 'USD', interval: 'hourly' as any }),
    ).rejects.toThrow(ValidationError);

    try {
      await paykit.subscriptions!.create({ customer: 'cus_xxx', amount: 999, currency: 'USD', interval: 'hourly' as any });
    } catch (err) {
      expect((err as ValidationError).field).toBe('interval');
      expect((err as ValidationError).message).toContain('day, week, month, year');
    }
  });

  it('rejects non-integer intervalCount', async () => {
    const paykit = createSubClient();
    await expect(
      paykit.subscriptions!.create({ customer: 'cus_xxx', amount: 999, currency: 'USD', interval: 'month', intervalCount: 1.5 }),
    ).rejects.toThrow(ValidationError);
  });

  it('rejects zero intervalCount', async () => {
    const paykit = createSubClient();
    await expect(
      paykit.subscriptions!.create({ customer: 'cus_xxx', amount: 999, currency: 'USD', interval: 'month', intervalCount: 0 }),
    ).rejects.toThrow(ValidationError);
  });

  it('accepts valid params', async () => {
    const paykit = createSubClient();
    await expect(
      paykit.subscriptions!.create({ customer: 'cus_xxx', amount: 999, currency: 'USD', interval: 'month' }),
    ).resolves.toBeDefined();
  });

  it('accepts valid params with intervalCount', async () => {
    const paykit = createSubClient();
    await expect(
      paykit.subscriptions!.create({ customer: 'cus_xxx', amount: 999, currency: 'USD', interval: 'month', intervalCount: 3 }),
    ).resolves.toBeDefined();
  });

  it('accepts all valid intervals', async () => {
    const paykit = createSubClient();
    for (const interval of ['day', 'week', 'month', 'year'] as const) {
      await expect(
        paykit.subscriptions!.create({ customer: 'cus_xxx', amount: 999, currency: 'USD', interval }),
      ).resolves.toBeDefined();
    }
  });
});
