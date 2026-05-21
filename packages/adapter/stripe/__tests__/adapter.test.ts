import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StripeAdapter } from '../src/adapter.js';

// ─── Mock Stripe SDK ────────────────────────────────────────

function createMockStripe() {
  return {
    balance: {
      retrieve: vi.fn().mockResolvedValue({ available: [] }),
    },
    paymentIntents: {
      create: vi.fn(),
      retrieve: vi.fn(),
      capture: vi.fn(),
      cancel: vi.fn(),
      list: vi.fn(),
    },
    refunds: {
      create: vi.fn(),
      retrieve: vi.fn(),
      list: vi.fn(),
    },
    customers: {
      create: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn(),
      del: vi.fn(),
      list: vi.fn(),
    },
    paymentMethods: {
      create: vi.fn(),
      retrieve: vi.fn(),
      attach: vi.fn(),
      detach: vi.fn(),
      list: vi.fn(),
    },
    subscriptions: {
      create: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn(),
      cancel: vi.fn(),
      list: vi.fn(),
    },
    products: {
      create: vi.fn(),
    },
    prices: {
      create: vi.fn(),
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  };
}

function piFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pi_test',
    amount: 5000,
    currency: 'usd',
    status: 'succeeded',
    description: 'Test',
    customer: 'cus_1',
    payment_method: 'pm_1',
    metadata: {},
    created: 1700000000,
    ...overrides,
  };
}

// ─── Setup ──────────────────────────────────────────────────

let adapter: StripeAdapter;
let mockStripe: ReturnType<typeof createMockStripe>;

beforeEach(async () => {
  adapter = new StripeAdapter();
  mockStripe = createMockStripe();
  // Bypass initialize — inject mock directly
  (adapter as any).stripe = mockStripe;
});

// ─── Initialization ─────────────────────────────────────────

describe('initialize', () => {
  it('throws without secretKey', async () => {
    const fresh = new StripeAdapter();
    await expect(fresh.initialize({} as any)).rejects.toThrow('secretKey');
  });
});

// ─── Capabilities & metadata ────────────────────────────────

describe('metadata', () => {
  it('has name stripe', () => {
    expect(adapter.name).toBe('stripe');
  });

  it('advertises expected capabilities', () => {
    expect(adapter.capabilities.charges).toBe(true);
    expect(adapter.capabilities.authAndCapture).toBe(true);
    expect(adapter.capabilities.refunds).toBe(true);
    expect(adapter.capabilities.partialRefunds).toBe(true);
    expect(adapter.capabilities.subscriptions).toBe(true);
    expect(adapter.capabilities.webhooks).toBe(true);
    expect(adapter.capabilities.multiCurrency).toBe(true);
  });
});

// ─── Health Check ───────────────────────────────────────────

describe('healthCheck', () => {
  it('returns healthy when balance API responds', async () => {
    const result = await adapter.healthCheck();
    expect(result.healthy).toBe(true);
    expect(typeof result.latencyMs).toBe('number');
  });

  it('returns unhealthy when API fails', async () => {
    mockStripe.balance.retrieve.mockRejectedValueOnce(new Error('fail'));
    const result = await adapter.healthCheck();
    expect(result.healthy).toBe(false);
    expect(result.message).toBe('Stripe API unreachable');
  });
});

// ─── Charges ────────────────────────────────────────────────

describe('charges', () => {
  describe('create', () => {
    it('creates a payment intent and maps the result', async () => {
      mockStripe.paymentIntents.create.mockResolvedValue(piFixture());
      const result = await adapter.charges.create({
        amount: 5000,
        currency: 'USD',
        description: 'Test',
      });
      expect(result.id).toBe('pi_test');
      expect(result.amount).toBe(5000);
      expect(result.currency).toBe('USD');
      expect(result.status).toBe('succeeded');
    });

    it('passes idempotency key', async () => {
      mockStripe.paymentIntents.create.mockResolvedValue(piFixture());
      await adapter.charges.create({
        amount: 1000,
        currency: 'USD',
        idempotencyKey: 'idem_123',
      });
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.any(Object),
        { idempotencyKey: 'idem_123' },
      );
    });

    it('sets capture_method to manual when capture is false', async () => {
      mockStripe.paymentIntents.create.mockResolvedValue(piFixture());
      await adapter.charges.create({
        amount: 3000,
        currency: 'EUR',
        capture: false,
      });
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({ capture_method: 'manual' }),
        undefined,
      );
    });
  });

  describe('retrieve', () => {
    it('retrieves a payment intent by id', async () => {
      mockStripe.paymentIntents.retrieve.mockResolvedValue(piFixture({ id: 'pi_456' }));
      const result = await adapter.charges.retrieve('pi_456');
      expect(result.id).toBe('pi_456');
    });
  });

  describe('capture', () => {
    it('captures with optional amount', async () => {
      mockStripe.paymentIntents.capture.mockResolvedValue(piFixture());
      await adapter.charges.capture('pi_test', { amount: 3000 });
      expect(mockStripe.paymentIntents.capture).toHaveBeenCalledWith('pi_test', {
        amount_to_capture: 3000,
      });
    });
  });

  describe('cancel', () => {
    it('cancels a payment intent', async () => {
      mockStripe.paymentIntents.cancel.mockResolvedValue(piFixture({ status: 'canceled' }));
      const result = await adapter.charges.cancel('pi_test');
      expect(result.status).toBe('canceled');
    });
  });

  describe('list', () => {
    it('lists payment intents with pagination', async () => {
      mockStripe.paymentIntents.list.mockResolvedValue({
        data: [piFixture({ id: 'pi_a' }), piFixture({ id: 'pi_b' })],
        has_more: true,
      });
      const result = await adapter.charges.list({ limit: 2 });
      expect(result.data).toHaveLength(2);
      expect(result.hasMore).toBe(true);
    });

    it('defaults limit to 10', async () => {
      mockStripe.paymentIntents.list.mockResolvedValue({ data: [], has_more: false });
      await adapter.charges.list();
      expect(mockStripe.paymentIntents.list).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10 }),
      );
    });
  });
});

// ─── Refunds ────────────────────────────────────────────────

describe('refunds', () => {
  const refundFixture = {
    id: 're_1',
    payment_intent: 'pi_1',
    amount: 2000,
    currency: 'usd',
    status: 'succeeded',
    reason: null,
    metadata: {},
    created: 1700000000,
  };

  it('creates a refund', async () => {
    mockStripe.refunds.create.mockResolvedValue(refundFixture);
    const result = await adapter.refunds.create({ chargeId: 'pi_1', amount: 2000 });
    expect(result.id).toBe('re_1');
    expect(result.amount).toBe(2000);
    expect(mockStripe.refunds.create).toHaveBeenCalledWith(
      expect.objectContaining({ payment_intent: 'pi_1', amount: 2000 }),
      undefined,
    );
  });

  it('retrieves a refund', async () => {
    mockStripe.refunds.retrieve.mockResolvedValue(refundFixture);
    const result = await adapter.refunds.retrieve('re_1');
    expect(result.id).toBe('re_1');
  });

  it('lists refunds', async () => {
    mockStripe.refunds.list.mockResolvedValue({ data: [refundFixture], has_more: false });
    const result = await adapter.refunds.list({ limit: 5 });
    expect(result.data).toHaveLength(1);
    expect(result.hasMore).toBe(false);
  });
});

// ─── Customers ──────────────────────────────────────────────

describe('customers', () => {
  const custFixture = {
    id: 'cus_1',
    email: 'test@test.com',
    name: 'Test',
    phone: null,
    metadata: {},
    created: 1700000000,
  };

  it('creates a customer', async () => {
    mockStripe.customers.create.mockResolvedValue(custFixture);
    const result = await adapter.customers.create({ email: 'test@test.com', name: 'Test' });
    expect(result.id).toBe('cus_1');
    expect(result.email).toBe('test@test.com');
  });

  it('retrieves a customer', async () => {
    mockStripe.customers.retrieve.mockResolvedValue(custFixture);
    const result = await adapter.customers.retrieve('cus_1');
    expect(result.id).toBe('cus_1');
  });

  it('throws for deleted customer', async () => {
    mockStripe.customers.retrieve.mockResolvedValue({ id: 'cus_1', deleted: true });
    await expect(adapter.customers.retrieve('cus_1')).rejects.toThrow('deleted');
  });

  it('updates a customer', async () => {
    mockStripe.customers.update.mockResolvedValue({ ...custFixture, name: 'Updated' });
    const result = await adapter.customers.update('cus_1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('deletes a customer', async () => {
    mockStripe.customers.del.mockResolvedValue({ id: 'cus_1', deleted: true });
    await adapter.customers.delete('cus_1');
    expect(mockStripe.customers.del).toHaveBeenCalledWith('cus_1');
  });

  it('lists customers', async () => {
    mockStripe.customers.list.mockResolvedValue({ data: [custFixture], has_more: false });
    const result = await adapter.customers.list();
    expect(result.data).toHaveLength(1);
  });
});

// ─── Payment Methods ────────────────────────────────────────

describe('paymentMethods', () => {
  const pmFixture = {
    id: 'pm_1',
    type: 'card',
    card: { last4: '4242', brand: 'visa', exp_month: 12, exp_year: 2026 },
    customer: 'cus_1',
    metadata: {},
    created: 1700000000,
  };

  it('creates a payment method', async () => {
    mockStripe.paymentMethods.create.mockResolvedValue(pmFixture);
    const result = await adapter.paymentMethods.create({ type: 'card' });
    expect(result.id).toBe('pm_1');
    expect(result.type).toBe('card');
  });

  it('retrieves a payment method', async () => {
    mockStripe.paymentMethods.retrieve.mockResolvedValue(pmFixture);
    const result = await adapter.paymentMethods.retrieve('pm_1');
    expect(result.last4).toBe('4242');
  });

  it('attaches a payment method to a customer', async () => {
    mockStripe.paymentMethods.attach.mockResolvedValue(pmFixture);
    await adapter.paymentMethods.attach('pm_1', 'cus_1');
    expect(mockStripe.paymentMethods.attach).toHaveBeenCalledWith('pm_1', { customer: 'cus_1' });
  });

  it('detaches a payment method', async () => {
    mockStripe.paymentMethods.detach.mockResolvedValue(pmFixture);
    await adapter.paymentMethods.detach('pm_1');
    expect(mockStripe.paymentMethods.detach).toHaveBeenCalledWith('pm_1');
  });

  it('lists payment methods for a customer', async () => {
    mockStripe.paymentMethods.list.mockResolvedValue({ data: [pmFixture] });
    const result = await adapter.paymentMethods.list('cus_1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('pm_1');
  });
});

// ─── Subscriptions ──────────────────────────────────────────

describe('subscriptions', () => {
  const subFixture = {
    id: 'sub_1',
    customer: 'cus_1',
    status: 'active',
    items: {
      data: [
        {
          price: {
            unit_amount: 999,
            currency: 'usd',
            recurring: { interval: 'month', interval_count: 1 },
          },
        },
      ],
    },
    current_period_start: 1700000000,
    current_period_end: 1702592000,
    cancel_at_period_end: false,
    metadata: {},
    created: 1700000000,
  };

  it('creates a subscription (product + price + sub)', async () => {
    mockStripe.products.create.mockResolvedValue({ id: 'prod_1' });
    mockStripe.prices.create.mockResolvedValue({ id: 'price_1' });
    mockStripe.subscriptions.create.mockResolvedValue(subFixture);

    const result = await adapter.subscriptions.create({
      customer: 'cus_1',
      amount: 999,
      currency: 'USD',
      interval: 'month',
    });

    expect(result.id).toBe('sub_1');
    expect(result.status).toBe('active');
    expect(mockStripe.products.create).toHaveBeenCalled();
    expect(mockStripe.prices.create).toHaveBeenCalledWith(
      expect.objectContaining({ unit_amount: 999, product: 'prod_1' }),
    );
    expect(mockStripe.subscriptions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_1',
        items: [{ price: 'price_1' }],
      }),
    );
  });

  it('retrieves a subscription', async () => {
    mockStripe.subscriptions.retrieve.mockResolvedValue(subFixture);
    const result = await adapter.subscriptions.retrieve('sub_1');
    expect(result.id).toBe('sub_1');
  });

  it('updates a subscription', async () => {
    mockStripe.subscriptions.update.mockResolvedValue(subFixture);
    await adapter.subscriptions.update('sub_1', { metadata: { key: 'val' } });
    expect(mockStripe.subscriptions.update).toHaveBeenCalledWith('sub_1', {
      metadata: { key: 'val' },
    });
  });

  it('cancels immediately by default', async () => {
    mockStripe.subscriptions.cancel.mockResolvedValue({ ...subFixture, status: 'canceled' });
    const result = await adapter.subscriptions.cancel('sub_1');
    expect(result.status).toBe('canceled');
    expect(mockStripe.subscriptions.cancel).toHaveBeenCalledWith('sub_1');
  });

  it('cancels at period end', async () => {
    mockStripe.subscriptions.update.mockResolvedValue({
      ...subFixture,
      cancel_at_period_end: true,
    });
    const result = await adapter.subscriptions.cancel('sub_1', { cancelAtPeriodEnd: true });
    expect(result.cancelAtPeriodEnd).toBe(true);
    expect(mockStripe.subscriptions.update).toHaveBeenCalledWith('sub_1', {
      cancel_at_period_end: true,
    });
  });

  it('lists subscriptions', async () => {
    mockStripe.subscriptions.list.mockResolvedValue({
      data: [subFixture],
      has_more: false,
    });
    const result = await adapter.subscriptions.list();
    expect(result.data).toHaveLength(1);
    expect(result.hasMore).toBe(false);
  });
});

// ─── Webhooks ───────────────────────────────────────────────

describe('webhooks', () => {
  describe('verify', () => {
    it('returns true for valid signature', () => {
      mockStripe.webhooks.constructEvent.mockReturnValue({ id: 'evt_1' });
      const result = adapter.webhooks.verify('payload', { 'stripe-signature': 'sig' }, 'secret');
      expect(result).toBe(true);
    });

    it('returns false for invalid signature', () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });
      const result = adapter.webhooks.verify('payload', { 'stripe-signature': 'bad' }, 'secret');
      expect(result).toBe(false);
    });
  });

  describe('parse', () => {
    it('parses a known event type', () => {
      mockStripe.webhooks.constructEvent.mockReturnValue({
        id: 'evt_1',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_1' } },
        created: 1700000000,
      });
      const result = adapter.webhooks.parse('payload', { 'stripe-signature': 'sig' }, 'secret');
      expect(result.type).toBe('charge.succeeded');
      expect(result.provider).toBe('stripe');
    });

    it('returns raw event for unknown event types', () => {
      mockStripe.webhooks.constructEvent.mockReturnValue({
        id: 'evt_1',
        type: 'account.updated',
        data: { object: { id: 'acct_1' } },
        created: 1700000000,
      });
      const result = adapter.webhooks.parse('payload', { 'stripe-signature': 'sig' }, 'secret');
      expect(result.id).toBe('evt_1');
      expect(result.providerType).toBe('account.updated');
      expect(result.provider).toBe('stripe');
    });
  });
});
