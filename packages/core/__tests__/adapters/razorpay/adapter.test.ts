import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RazorpayAdapter } from '../../../src/adapters/razorpay/adapter.js';
import { NotSupportedError } from '../../../src/index.js';

// ─── Mock Razorpay SDK ─────────────────────────────────────

function createMockRazorpay() {
  return {
    orders: {
      create: vi.fn(),
      fetch: vi.fn(),
      all: vi.fn(),
    },
    payments: {
      fetch: vi.fn(),
      capture: vi.fn(),
      refund: vi.fn(),
    },
    refunds: {
      fetch: vi.fn(),
      all: vi.fn(),
    },
    customers: {
      create: vi.fn(),
      fetch: vi.fn(),
      edit: vi.fn(),
      all: vi.fn(),
    },
    plans: {
      create: vi.fn(),
    },
    subscriptions: {
      create: vi.fn(),
      fetch: vi.fn(),
      update: vi.fn(),
      cancel: vi.fn(),
      all: vi.fn(),
    },
  };
}

// ─── Mock validateWebhookSignature ─────────────────────────

vi.mock('razorpay/dist/utils/razorpay-utils', () => ({
  validateWebhookSignature: vi.fn(() => true),
}));

import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils';
const mockValidateWebhook = vi.mocked(validateWebhookSignature);

// ─── Fixtures ──────────────────────────────────────────────

function orderFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order_test',
    amount: 50000,
    currency: 'INR',
    status: 'created',
    receipt: 'Test order',
    notes: {},
    created_at: 1700000000,
    ...overrides,
  };
}

function paymentFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pay_test',
    amount: 50000,
    currency: 'INR',
    status: 'captured',
    description: 'Test',
    customer_id: 'cust_1',
    method: 'card',
    notes: {},
    created_at: 1700000000,
    ...overrides,
  };
}

// ─── Setup ─────────────────────────────────────────────────

let adapter: RazorpayAdapter;
let mockRazorpay: ReturnType<typeof createMockRazorpay>;

beforeEach(() => {
  adapter = new RazorpayAdapter();
  mockRazorpay = createMockRazorpay();
  // Inject mock directly, bypassing initialize
  (adapter as any).razorpay = mockRazorpay;
  mockValidateWebhook.mockReturnValue(true);
});

// ─── Initialization ────────────────────────────────────────

describe('initialize', () => {
  it('throws without keyId', async () => {
    const fresh = new RazorpayAdapter();
    await expect(fresh.initialize({ keySecret: 'secret' })).rejects.toThrow('keyId');
  });

  it('throws without keySecret', async () => {
    const fresh = new RazorpayAdapter();
    await expect(fresh.initialize({ keyId: 'key' })).rejects.toThrow('keySecret');
  });
});

// ─── Capabilities & metadata ───────────────────────────────

describe('metadata', () => {
  it('has name razorpay', () => {
    expect(adapter.name).toBe('razorpay');
  });

  it('advertises expected capabilities', () => {
    expect(adapter.capabilities.charges).toBe(true);
    expect(adapter.capabilities.authAndCapture).toBe(true);
    expect(adapter.capabilities.refunds).toBe(true);
    expect(adapter.capabilities.partialRefunds).toBe(true);
    expect(adapter.capabilities.subscriptions).toBe(true);
    expect(adapter.capabilities.savedPaymentMethods).toBe(false);
    expect(adapter.capabilities.webhooks).toBe(true);
  });
});

// ─── Health Check ──────────────────────────────────────────

describe('healthCheck', () => {
  it('returns healthy when orders API responds', async () => {
    mockRazorpay.orders.all.mockResolvedValue({ items: [] });
    const result = await adapter.healthCheck();
    expect(result.healthy).toBe(true);
    expect(typeof result.latencyMs).toBe('number');
  });

  it('returns unhealthy when API fails', async () => {
    mockRazorpay.orders.all.mockRejectedValueOnce(new Error('fail'));
    const result = await adapter.healthCheck();
    expect(result.healthy).toBe(false);
    expect(result.message).toBe('Razorpay API unreachable');
  });
});

// ─── Charges ───────────────────────────────────────────────

describe('charges', () => {
  describe('create', () => {
    it('creates an order and maps the result', async () => {
      mockRazorpay.orders.create.mockResolvedValue(orderFixture());
      const result = await adapter.charges.create({
        amount: 50000,
        currency: 'INR',
        description: 'Test order',
      });
      expect(result.id).toBe('order_test');
      expect(result.amount).toBe(50000);
      expect(result.currency).toBe('INR');
      expect(result.status).toBe('pending');
      expect(mockRazorpay.orders.create).toHaveBeenCalledWith({
        amount: 50000,
        currency: 'INR',
        receipt: 'Test order',
        notes: {},
      });
    });

    it('passes metadata as notes', async () => {
      mockRazorpay.orders.create.mockResolvedValue(orderFixture());
      await adapter.charges.create({
        amount: 1000,
        currency: 'INR',
        metadata: { orderId: '42' },
      });
      expect(mockRazorpay.orders.create).toHaveBeenCalledWith(
        expect.objectContaining({ notes: { orderId: '42' } }),
      );
    });
  });

  describe('retrieve', () => {
    it('fetches as payment when ID starts with pay_', async () => {
      mockRazorpay.payments.fetch.mockResolvedValue(paymentFixture());
      const result = await adapter.charges.retrieve('pay_test');
      expect(result.id).toBe('pay_test');
      expect(result.status).toBe('succeeded');
      expect(mockRazorpay.payments.fetch).toHaveBeenCalledWith('pay_test');
    });

    it('fetches as order when ID does not start with pay_', async () => {
      mockRazorpay.orders.fetch.mockResolvedValue(orderFixture());
      const result = await adapter.charges.retrieve('order_test');
      expect(result.id).toBe('order_test');
      expect(mockRazorpay.orders.fetch).toHaveBeenCalledWith('order_test');
    });
  });

  describe('capture', () => {
    it('fetches payment then captures with amount and currency', async () => {
      mockRazorpay.payments.fetch.mockResolvedValue(paymentFixture());
      mockRazorpay.payments.capture.mockResolvedValue(paymentFixture());
      const result = await adapter.charges.capture('pay_test', { amount: 50000 });
      expect(mockRazorpay.payments.fetch).toHaveBeenCalledWith('pay_test');
      expect(mockRazorpay.payments.capture).toHaveBeenCalledWith('pay_test', 50000, 'INR');
      expect(result.status).toBe('succeeded');
    });

    it('uses payment amount when no amount specified', async () => {
      mockRazorpay.payments.fetch.mockResolvedValue(paymentFixture({ amount: 30000 }));
      mockRazorpay.payments.capture.mockResolvedValue(paymentFixture());
      await adapter.charges.capture('pay_test');
      expect(mockRazorpay.payments.capture).toHaveBeenCalledWith('pay_test', 30000, 'INR');
    });
  });

  describe('cancel', () => {
    it('throws an error (Razorpay does not support cancellation)', () => {
      expect(() => adapter.charges.cancel('order_test')).toThrow('does not support cancelling');
    });
  });

  describe('list', () => {
    it('lists orders with pagination', async () => {
      mockRazorpay.orders.all.mockResolvedValue({
        items: [orderFixture({ id: 'order_a' }), orderFixture({ id: 'order_b' })],
      });
      const result = await adapter.charges.list({ limit: 2 });
      expect(result.data).toHaveLength(2);
      expect(result.hasMore).toBe(true);
    });

    it('defaults limit to 10', async () => {
      mockRazorpay.orders.all.mockResolvedValue({ items: [] });
      await adapter.charges.list();
      expect(mockRazorpay.orders.all).toHaveBeenCalledWith({ count: 10, skip: 0 });
    });

    it('returns hasMore false when fewer items than limit', async () => {
      mockRazorpay.orders.all.mockResolvedValue({
        items: [orderFixture()],
      });
      const result = await adapter.charges.list({ limit: 5 });
      expect(result.hasMore).toBe(false);
    });
  });
});

// ─── Refunds ───────────────────────────────────────────────

describe('refunds', () => {
  const refundFixture = {
    id: 'rfnd_1',
    payment_id: 'pay_1',
    amount: 20000,
    currency: 'INR',
    status: 'processed',
    notes: {},
    created_at: 1700000000,
  };

  it('creates a refund', async () => {
    mockRazorpay.payments.refund.mockResolvedValue(refundFixture);
    const result = await adapter.refunds.create({ chargeId: 'pay_1', amount: 20000 });
    expect(result.id).toBe('rfnd_1');
    expect(result.amount).toBe(20000);
    expect(mockRazorpay.payments.refund).toHaveBeenCalledWith('pay_1', {
      amount: 20000,
      notes: {},
    });
  });

  it('retrieves a refund', async () => {
    mockRazorpay.refunds.fetch.mockResolvedValue(refundFixture);
    const result = await adapter.refunds.retrieve('rfnd_1');
    expect(result.id).toBe('rfnd_1');
    expect(result.chargeId).toBe('pay_1');
  });

  it('lists refunds', async () => {
    mockRazorpay.refunds.all.mockResolvedValue({ items: [refundFixture] });
    const result = await adapter.refunds.list({ limit: 5 });
    expect(result.data).toHaveLength(1);
    expect(result.hasMore).toBe(false);
  });
});

// ─── Customers ─────────────────────────────────────────────

describe('customers', () => {
  const custFixture = {
    id: 'cust_1',
    name: 'Alice',
    email: 'alice@test.com',
    contact: '+91999',
    notes: {},
    created_at: 1700000000,
  };

  it('creates a customer', async () => {
    mockRazorpay.customers.create.mockResolvedValue(custFixture);
    const result = await adapter.customers.create({
      email: 'alice@test.com',
      name: 'Alice',
      phone: '+91999',
    });
    expect(result.id).toBe('cust_1');
    expect(result.email).toBe('alice@test.com');
    expect(result.phone).toBe('+91999');
    expect(mockRazorpay.customers.create).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@test.com',
      contact: '+91999',
      notes: {},
    });
  });

  it('retrieves a customer', async () => {
    mockRazorpay.customers.fetch.mockResolvedValue(custFixture);
    const result = await adapter.customers.retrieve('cust_1');
    expect(result.id).toBe('cust_1');
  });

  it('updates a customer', async () => {
    mockRazorpay.customers.edit.mockResolvedValue({ ...custFixture, name: 'Bob' });
    const result = await adapter.customers.update('cust_1', { name: 'Bob' });
    expect(result.name).toBe('Bob');
    expect(mockRazorpay.customers.edit).toHaveBeenCalledWith('cust_1', {
      name: 'Bob',
      email: undefined,
      contact: undefined,
    });
  });

  it('throws on delete (not supported)', () => {
    expect(() => adapter.customers.delete('cust_1')).toThrow('does not support deleting');
  });

  it('lists customers', async () => {
    mockRazorpay.customers.all.mockResolvedValue({ items: [custFixture] });
    const result = await adapter.customers.list();
    expect(result.data).toHaveLength(1);
  });
});

// ─── Payment Methods ───────────────────────────────────────

describe('paymentMethods', () => {
  it('throws NotSupportedError for create', () => {
    expect(() => adapter.paymentMethods.create({} as any)).toThrow(NotSupportedError);
  });

  it('throws NotSupportedError for retrieve', () => {
    expect(() => adapter.paymentMethods.retrieve('pm_1')).toThrow(NotSupportedError);
  });

  it('throws NotSupportedError for attach', () => {
    expect(() => adapter.paymentMethods.attach('pm_1', 'cust_1')).toThrow(NotSupportedError);
  });

  it('throws NotSupportedError for detach', () => {
    expect(() => adapter.paymentMethods.detach('pm_1')).toThrow(NotSupportedError);
  });

  it('throws NotSupportedError for list', () => {
    expect(() => adapter.paymentMethods.list('cust_1')).toThrow(NotSupportedError);
  });
});

// ─── Subscriptions ─────────────────────────────────────────

describe('subscriptions', () => {
  const subFixture = {
    id: 'sub_1',
    customer_id: 'cust_1',
    status: 'active',
    current_start: 1700000000,
    current_end: 1702592000,
    notes: {},
    created_at: 1700000000,
  };

  it('creates a plan then a subscription', async () => {
    mockRazorpay.plans.create.mockResolvedValue({ id: 'plan_1' });
    mockRazorpay.subscriptions.create.mockResolvedValue(subFixture);

    const result = await adapter.subscriptions.create({
      customer: 'cust_1',
      amount: 99900,
      currency: 'INR',
      interval: 'month',
    });

    expect(result.id).toBe('sub_1');
    expect(result.status).toBe('active');
    expect(mockRazorpay.plans.create).toHaveBeenCalledWith({
      period: 'monthly',
      interval: 1,
      item: {
        name: 'Subscription',
        amount: 99900,
        currency: 'INR',
      },
    });
    expect(mockRazorpay.subscriptions.create).toHaveBeenCalledWith({
      plan_id: 'plan_1',
      total_count: 12,
      customer_notify: 1,
      notes: {},
    });
  });

  it('maps interval correctly (day → daily)', async () => {
    mockRazorpay.plans.create.mockResolvedValue({ id: 'plan_1' });
    mockRazorpay.subscriptions.create.mockResolvedValue(subFixture);

    await adapter.subscriptions.create({
      customer: 'cust_1',
      amount: 100,
      currency: 'INR',
      interval: 'day',
    });

    expect(mockRazorpay.plans.create).toHaveBeenCalledWith(
      expect.objectContaining({ period: 'daily' }),
    );
  });

  it('maps interval correctly (year → yearly)', async () => {
    mockRazorpay.plans.create.mockResolvedValue({ id: 'plan_1' });
    mockRazorpay.subscriptions.create.mockResolvedValue(subFixture);

    await adapter.subscriptions.create({
      customer: 'cust_1',
      amount: 100,
      currency: 'INR',
      interval: 'year',
    });

    expect(mockRazorpay.plans.create).toHaveBeenCalledWith(
      expect.objectContaining({ period: 'yearly' }),
    );
  });

  it('retrieves a subscription', async () => {
    mockRazorpay.subscriptions.fetch.mockResolvedValue(subFixture);
    const result = await adapter.subscriptions.retrieve('sub_1');
    expect(result.id).toBe('sub_1');
  });

  it('updates a subscription', async () => {
    mockRazorpay.subscriptions.update.mockResolvedValue(subFixture);
    await adapter.subscriptions.update('sub_1', { metadata: { key: 'val' } });
    expect(mockRazorpay.subscriptions.update).toHaveBeenCalledWith('sub_1', {
      notes: { key: 'val' },
    });
  });

  it('cancels immediately (cancelAtPeriodEnd=false)', async () => {
    mockRazorpay.subscriptions.cancel.mockResolvedValue({ ...subFixture, status: 'cancelled' });
    const result = await adapter.subscriptions.cancel('sub_1');
    expect(result.status).toBe('canceled');
    expect(mockRazorpay.subscriptions.cancel).toHaveBeenCalledWith('sub_1', false);
  });

  it('cancels at period end', async () => {
    mockRazorpay.subscriptions.cancel.mockResolvedValue(subFixture);
    await adapter.subscriptions.cancel('sub_1', { cancelAtPeriodEnd: true });
    expect(mockRazorpay.subscriptions.cancel).toHaveBeenCalledWith('sub_1', true);
  });

  it('lists subscriptions', async () => {
    mockRazorpay.subscriptions.all.mockResolvedValue({ items: [subFixture] });
    const result = await adapter.subscriptions.list();
    expect(result.data).toHaveLength(1);
    expect(result.hasMore).toBe(false);
  });
});

// ─── Webhooks ──────────────────────────────────────────────

describe('webhooks', () => {
  describe('verify', () => {
    it('returns true for valid signature', () => {
      mockValidateWebhook.mockReturnValue(true);
      const result = adapter.webhooks.verify('body', { 'x-razorpay-signature': 'sig' }, 'secret');
      expect(result).toBe(true);
      expect(mockValidateWebhook).toHaveBeenCalledWith('body', 'sig', 'secret');
    });

    it('returns false when validation throws', () => {
      mockValidateWebhook.mockImplementation(() => {
        throw new Error('Invalid signature');
      });
      const result = adapter.webhooks.verify('body', { 'x-razorpay-signature': 'bad' }, 'secret');
      expect(result).toBe(false);
    });

    it('handles Buffer payload', () => {
      mockValidateWebhook.mockReturnValue(true);
      const buf = Buffer.from('payload');
      adapter.webhooks.verify(buf, { 'x-razorpay-signature': 'sig' }, 'secret');
      expect(mockValidateWebhook).toHaveBeenCalledWith('payload', 'sig', 'secret');
    });
  });

  describe('parse', () => {
    it('parses a known event type', () => {
      const payload = JSON.stringify({
        event: 'payment.captured',
        contains: ['payment'],
        payload: { payment: { entity: { id: 'pay_1', amount: 5000 } } },
        created_at: 1700000000,
      });
      const result = adapter.webhooks.parse(payload, { 'x-razorpay-signature': 'sig' }, 'secret');
      expect(result.type).toBe('charge.succeeded');
      expect(result.provider).toBe('razorpay');
    });

    it('returns raw event for unknown event types', () => {
      const payload = JSON.stringify({
        event: 'account.updated',
        contains: ['account'],
        payload: { account: { entity: { id: 'acc_1' } } },
        created_at: 1700000000,
      });
      const result = adapter.webhooks.parse(payload, { 'x-razorpay-signature': 'sig' }, 'secret');
      expect(result.providerType).toBe('account.updated');
      expect(result.provider).toBe('razorpay');
    });

    it('throws when signature is invalid', () => {
      mockValidateWebhook.mockImplementation(() => {
        throw new Error('Invalid signature');
      });
      expect(() =>
        adapter.webhooks.parse('{}', { 'x-razorpay-signature': 'bad' }, 'secret'),
      ).toThrow('Invalid signature');
    });
  });
});

// ─── Error Wrapping ────────────────────────────────────────

describe('error wrapping', () => {
  it('converts Razorpay errors to PaymentError', async () => {
    const rzpError = {
      statusCode: 400,
      error: {
        code: 'BAD_REQUEST_ERROR',
        description: 'Amount is required',
        reason: 'input_validation_failed',
      },
    };
    mockRazorpay.orders.create.mockRejectedValue(rzpError);

    try {
      await adapter.charges.create({ amount: 0, currency: 'INR' });
      expect.fail('Should have thrown');
    } catch (err: any) {
      expect(err.code).toBe('invalid_request');
      expect(err.provider).toBe('razorpay');
      expect(err.isRetryable).toBe(false);
    }
  });

  it('rethrows non-Razorpay errors as-is', async () => {
    mockRazorpay.orders.create.mockRejectedValue(new Error('Network failure'));

    try {
      await adapter.charges.create({ amount: 1000, currency: 'INR' });
      expect.fail('Should have thrown');
    } catch (err: any) {
      expect(err.message).toBe('Network failure');
      expect(err.code).toBeUndefined(); // Not a PaymentError
    }
  });
});
