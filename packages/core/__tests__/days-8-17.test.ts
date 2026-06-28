import { describe, it, expect, vi } from 'vitest';
import {
  PaymentError,
  ValidationError,
  PaymentTimeoutError,
  ProviderUnavailableError,
  NotSupportedError,
} from '../src/errors';
import { UnifiedPayments } from '../src/client';
import { PaymentRouter } from '../src/payment-router';
import { debug, getProviderInfo } from '../src/debug';
import { getProviderCurrencies } from '../src/currency';
import { MockAdapter } from '../src/testing/mock-adapter';
import {
  createMockCharge,
  createMockRefund,
  createMockCustomer,
  createMockWebhookEvent,
} from '../src/testing/factories';

// ── Day 8: Refund + Customer validation ──────────────────────────────

describe('refunds.create validation', () => {
  const mock = new MockAdapter();
  const paykit = new UnifiedPayments({ adapter: mock });

  it('rejects empty chargeId', async () => {
    await expect(
      paykit.refunds.create({ chargeId: '' }),
    ).rejects.toThrow(ValidationError);

    try {
      await paykit.refunds.create({ chargeId: '' });
    } catch (err) {
      expect((err as ValidationError).field).toBe('chargeId');
    }
  });

  it('rejects whitespace-only chargeId', async () => {
    await expect(
      paykit.refunds.create({ chargeId: '   ' }),
    ).rejects.toThrow(ValidationError);
  });

  it('rejects negative refund amount', async () => {
    await expect(
      paykit.refunds.create({ chargeId: 'ch_123', amount: -100 }),
    ).rejects.toThrow(ValidationError);
  });

  it('rejects non-integer refund amount', async () => {
    await expect(
      paykit.refunds.create({ chargeId: 'ch_123', amount: 10.5 }),
    ).rejects.toThrow(ValidationError);
  });

  it('accepts valid refund without amount (full refund)', async () => {
    await expect(
      paykit.refunds.create({ chargeId: 'ch_123' }),
    ).resolves.toBeDefined();
  });

  it('accepts valid refund with amount', async () => {
    await expect(
      paykit.refunds.create({ chargeId: 'ch_123', amount: 500 }),
    ).resolves.toBeDefined();
  });
});

describe('customers.create validation', () => {
  const mock = new MockAdapter();
  const paykit = new UnifiedPayments({ adapter: mock });

  it('rejects invalid email', async () => {
    await expect(
      paykit.customers.create({ email: 'not-an-email' }),
    ).rejects.toThrow(ValidationError);

    try {
      await paykit.customers.create({ email: 'not-an-email' });
    } catch (err) {
      expect((err as ValidationError).field).toBe('email');
      expect((err as ValidationError).message).toContain('valid email');
    }
  });

  it('rejects name longer than 100 characters', async () => {
    await expect(
      paykit.customers.create({ name: 'A'.repeat(101) }),
    ).rejects.toThrow(ValidationError);
  });

  it('accepts valid email', async () => {
    await expect(
      paykit.customers.create({ email: 'test@example.com' }),
    ).resolves.toBeDefined();
  });

  it('accepts no email or name (both optional)', async () => {
    await expect(
      paykit.customers.create({}),
    ).resolves.toBeDefined();
  });
});

// ── Day 9: PaymentTimeoutError + ProviderUnavailableError ────────────

describe('PaymentTimeoutError', () => {
  it('creates error with correct fields', () => {
    const err = new PaymentTimeoutError('stripe', 30000);

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(PaymentError);
    expect(err).toBeInstanceOf(PaymentTimeoutError);
    expect(err.name).toBe('PaymentTimeoutError');
    expect(err.code).toBe('processing_error');
    expect(err.provider).toBe('stripe');
    expect(err.isRetryable).toBe(true);
    expect(err.timeoutMs).toBe(30000);
    expect(err.message).toContain('30000ms');
  });
});

describe('ProviderUnavailableError', () => {
  it('creates error without reason', () => {
    const err = new ProviderUnavailableError('razorpay');

    expect(err).toBeInstanceOf(PaymentError);
    expect(err.name).toBe('ProviderUnavailableError');
    expect(err.code).toBe('provider_unavailable');
    expect(err.isRetryable).toBe(true);
    expect(err.message).toBe('razorpay is unavailable');
  });

  it('creates error with reason', () => {
    const err = new ProviderUnavailableError('stripe', 'API returned 503');

    expect(err.message).toBe('stripe is unavailable: API returned 503');
  });
});

// ── Day 10: Request ID tracking ──────────────────────────────────────

describe('requestId on PaymentError', () => {
  it('stores requestId when provided', () => {
    const err = new PaymentError({
      code: 'processing_error',
      message: 'fail',
      provider: 'stripe',
      requestId: 'req_abc123',
    });
    expect(err.requestId).toBe('req_abc123');
  });

  it('requestId is undefined when not provided', () => {
    const err = new PaymentError({
      code: 'processing_error',
      message: 'fail',
      provider: 'stripe',
    });
    expect(err.requestId).toBeUndefined();
  });
});

describe('requestId on unified response types', () => {
  it('createMockCharge includes requestId when set', () => {
    const charge = createMockCharge({ requestId: 'req_charge_1' });
    expect(charge.requestId).toBe('req_charge_1');
  });

  it('createMockRefund includes requestId when set', () => {
    const refund = createMockRefund({ requestId: 'req_refund_1' });
    expect(refund.requestId).toBe('req_refund_1');
  });

  it('createMockCustomer includes requestId when set', () => {
    const customer = createMockCustomer({ requestId: 'req_cus_1' });
    expect(customer.requestId).toBe('req_cus_1');
  });
});

// ── Day 11: debug() + getProviderInfo() ──────────────────────────────

describe('getProviderInfo', () => {
  it('returns name, capabilities, and health', async () => {
    const mock = new MockAdapter();
    const info = await getProviderInfo(mock);

    expect(info.name).toBe('mock');
    expect(info.capabilities.charges).toBe(true);
    expect(info.health).toBeDefined();
    expect(info.health!.healthy).toBe(true);
  });

  it('reports unhealthy when failWith is set', async () => {
    const mock = new MockAdapter();
    mock.failWith = new Error('down');
    const info = await getProviderInfo(mock);

    expect(info.health!.healthy).toBe(false);
  });
});

describe('debug', () => {
  it('returns a formatted string', async () => {
    const mock = new MockAdapter();
    const output = await debug(mock);

    expect(output).toContain('Provider: mock');
    expect(output).toContain('Health: healthy');
    expect(output).toContain('Capabilities:');
    expect(output).toContain('charges');
  });
});

describe('UnifiedPayments.getProviderInfo()', () => {
  it('returns provider info through the client', async () => {
    const mock = new MockAdapter();
    const paykit = new UnifiedPayments({ adapter: mock });
    const info = await paykit.getProviderInfo();

    expect(info.name).toBe('mock');
    expect(info.capabilities.charges).toBe(true);
  });
});

describe('UnifiedPayments.debug()', () => {
  it('returns debug string through the client', async () => {
    const mock = new MockAdapter();
    const paykit = new UnifiedPayments({ adapter: mock });
    const output = await paykit.debug();

    expect(output).toContain('Provider: mock');
  });
});

// ── Day 12: Better credential errors ─────────────────────────────────

describe('better credential error messages', () => {
  it('Stripe shows actionable error', async () => {
    const { StripeAdapter } = await import('../src/adapters/stripe/adapter');
    const adapter = new StripeAdapter();
    await expect(adapter.initialize({})).rejects.toThrow('Missing secretKey');
    await expect(adapter.initialize({})).rejects.toThrow('STRIPE_SECRET_KEY');
  });

  it('Razorpay shows actionable error with missing fields', async () => {
    const { RazorpayAdapter } = await import('../src/adapters/razorpay/adapter');
    const adapter = new RazorpayAdapter();
    await expect(adapter.initialize({})).rejects.toThrow('Missing credentials');
    await expect(adapter.initialize({})).rejects.toThrow('RAZORPAY_KEY_ID');
    await expect(adapter.initialize({})).rejects.toThrow('RAZORPAY_KEY_SECRET');
  });

  it('Razorpay shows only missing keySecret', async () => {
    const { RazorpayAdapter } = await import('../src/adapters/razorpay/adapter');
    const adapter = new RazorpayAdapter();
    await expect(adapter.initialize({ keyId: 'rzp_test_123' })).rejects.toThrow('RAZORPAY_KEY_SECRET');
  });
});

// ── Day 13: router.resolveAdapter() ──────────────────────────────────

describe('PaymentRouter.resolveAdapter()', () => {
  const stripe = new MockAdapter();
  (stripe as any).name = 'stripe';
  const razorpay = new MockAdapter();
  (razorpay as any).name = 'razorpay';

  const router = new PaymentRouter({
    routes: [
      { currency: 'INR', adapter: razorpay },
      { currency: 'USD', adapter: stripe },
      { region: 'IN', adapter: razorpay },
    ],
    default: stripe,
  });

  it('resolves by currency', () => {
    expect(router.resolveAdapter({ currency: 'INR' }).name).toBe('razorpay');
    expect(router.resolveAdapter({ currency: 'USD' }).name).toBe('stripe');
  });

  it('resolves by region', () => {
    expect(router.resolveAdapter({ region: 'IN' }).name).toBe('razorpay');
  });

  it('resolves by explicit provider', () => {
    expect(router.resolveAdapter({ provider: 'razorpay' }).name).toBe('razorpay');
  });

  it('falls back to default', () => {
    expect(router.resolveAdapter({ currency: 'GBP' }).name).toBe('stripe');
  });

  it('falls back to default with no options', () => {
    expect(router.resolveAdapter().name).toBe('stripe');
  });

  it('throws for unknown explicit provider', () => {
    expect(() => router.resolveAdapter({ provider: 'nonexistent' })).toThrow('No adapter registered');
  });
});

// ── Day 14-15: MockAdapter + factories ───────────────────────────────

describe('MockAdapter', () => {
  it('creates and retrieves charges', async () => {
    const mock = new MockAdapter();
    const charge = await mock.charges.create({ amount: 2000, currency: 'USD' });
    expect(charge.amount).toBe(2000);
    expect(charge.currency).toBe('USD');
    expect(charge.status).toBe('succeeded');

    const retrieved = await mock.charges.retrieve(charge.id);
    expect(retrieved.id).toBe(charge.id);
  });

  it('creates and retrieves refunds', async () => {
    const mock = new MockAdapter();
    const refund = await mock.refunds.create({ chargeId: 'ch_123', amount: 500 });
    expect(refund.amount).toBe(500);

    const retrieved = await mock.refunds.retrieve(refund.id);
    expect(retrieved.id).toBe(refund.id);
  });

  it('creates, updates, and deletes customers', async () => {
    const mock = new MockAdapter();
    const customer = await mock.customers.create({ email: 'a@b.com', name: 'Test' });
    expect(customer.email).toBe('a@b.com');

    const updated = await mock.customers.update(customer.id, { name: 'Updated' });
    expect(updated.name).toBe('Updated');

    await mock.customers.delete(customer.id);
    await expect(mock.customers.retrieve(customer.id)).rejects.toThrow('not found');
  });

  it('lists charges', async () => {
    const mock = new MockAdapter();
    await mock.charges.create({ amount: 100, currency: 'USD' });
    await mock.charges.create({ amount: 200, currency: 'EUR' });
    const list = await mock.charges.list({ limit: 10 });
    expect(list.data.length).toBe(2);
  });

  it('captures and cancels charges', async () => {
    const mock = new MockAdapter();
    const charge = await mock.charges.create({ amount: 1000, currency: 'USD' });

    const captured = await mock.charges.capture(charge.id);
    expect(captured.status).toBe('succeeded');

    const canceled = await mock.charges.cancel(charge.id);
    expect(canceled.status).toBe('canceled');
  });

  it('throws errors when failWith is set', async () => {
    const mock = new MockAdapter();
    mock.failWith = new Error('Simulated failure');

    await expect(mock.charges.create({ amount: 100, currency: 'USD' })).rejects.toThrow('Simulated failure');
    await expect(mock.refunds.create({ chargeId: 'ch_1' })).rejects.toThrow('Simulated failure');
    await expect(mock.customers.create({})).rejects.toThrow('Simulated failure');
  });

  it('reports unhealthy when failWith is set', async () => {
    const mock = new MockAdapter();
    mock.failWith = new Error('down');
    const health = await mock.healthCheck();
    expect(health.healthy).toBe(false);
  });

  it('verifies webhooks always return true', () => {
    const mock = new MockAdapter();
    expect(mock.webhooks.verify('', {}, '')).toBe(true);
  });
});

describe('createMockCharge', () => {
  it('returns valid charge with defaults', () => {
    const charge = createMockCharge();
    expect(charge.id).toBe('ch_mock_1');
    expect(charge.provider).toBe('mock');
    expect(charge.amount).toBe(1000);
    expect(charge.currency).toBe('USD');
    expect(charge.status).toBe('succeeded');
    expect(charge.createdAt).toBeInstanceOf(Date);
  });

  it('allows overrides', () => {
    const charge = createMockCharge({ amount: 5000, currency: 'EUR', status: 'pending' });
    expect(charge.amount).toBe(5000);
    expect(charge.currency).toBe('EUR');
    expect(charge.status).toBe('pending');
  });
});

describe('createMockRefund', () => {
  it('returns valid refund with defaults', () => {
    const refund = createMockRefund();
    expect(refund.id).toBe('re_mock_1');
    expect(refund.chargeId).toBe('ch_mock_1');
    expect(refund.status).toBe('succeeded');
  });

  it('allows overrides', () => {
    const refund = createMockRefund({ chargeId: 'ch_real', amount: 250 });
    expect(refund.chargeId).toBe('ch_real');
    expect(refund.amount).toBe(250);
  });
});

describe('createMockCustomer', () => {
  it('returns valid customer with defaults', () => {
    const customer = createMockCustomer();
    expect(customer.id).toBe('cus_mock_1');
    expect(customer.email).toBe('test@example.com');
    expect(customer.name).toBe('Test User');
  });

  it('allows overrides', () => {
    const customer = createMockCustomer({ email: 'custom@test.com' });
    expect(customer.email).toBe('custom@test.com');
  });
});

describe('createMockWebhookEvent', () => {
  it('returns valid event with defaults', () => {
    const event = createMockWebhookEvent();
    expect(event.id).toBe('evt_mock_1');
    expect(event.type).toBe('charge.succeeded');
    expect(event.provider).toBe('mock');
  });

  it('allows overrides', () => {
    const event = createMockWebhookEvent({ type: 'refund.succeeded' });
    expect(event.type).toBe('refund.succeeded');
  });
});

// ── Day 16: CurrencyConverter + getProviderCurrencies ────────────────

describe('getProviderCurrencies', () => {
  it('returns Stripe currencies', () => {
    const currencies = getProviderCurrencies('stripe');
    expect(currencies).toContain('USD');
    expect(currencies).toContain('EUR');
    expect(currencies).toContain('INR');
    expect(currencies.length).toBeGreaterThan(20);
  });

  it('returns Razorpay currencies', () => {
    const currencies = getProviderCurrencies('razorpay');
    expect(currencies).toContain('INR');
    expect(currencies).toContain('USD');
    expect(currencies.length).toBeGreaterThan(3);
  });

  it('returns empty array for unknown provider', () => {
    expect(getProviderCurrencies('nonexistent')).toEqual([]);
  });

  it('is case-insensitive', () => {
    expect(getProviderCurrencies('Stripe')).toEqual(getProviderCurrencies('stripe'));
  });
});

// ── Day 17: Currency warning + idempotencyKey ────────────────────────

describe('currency validation warning', () => {
  it('warns for unknown currency but does not throw', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mock = new MockAdapter();
    const paykit = new UnifiedPayments({ adapter: mock });

    await expect(
      paykit.charges.create({ amount: 1000, currency: 'XYZ' }),
    ).resolves.toBeDefined();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('XYZ'),
    );
    warnSpy.mockRestore();
  });

  it('does not warn for known currencies', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mock = new MockAdapter();
    const paykit = new UnifiedPayments({ adapter: mock });

    await paykit.charges.create({ amount: 1000, currency: 'USD' });

    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('idempotencyKey support', () => {
  it('idempotencyKey is accepted in CreateChargeParams', async () => {
    const mock = new MockAdapter();
    const paykit = new UnifiedPayments({ adapter: mock });

    // Should not throw — idempotencyKey is just passed through
    await expect(
      paykit.charges.create({
        amount: 1000,
        currency: 'USD',
        idempotencyKey: 'idem_123',
      }),
    ).resolves.toBeDefined();
  });
});
