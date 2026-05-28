import { describe, it, expect } from 'vitest';
import { mapPaymentIntentToCharge, mapChargeStatus } from '../../../src/adapters/stripe/mappers/charge.js';
import { mapStripeRefund, mapRefundStatus } from '../../../src/adapters/stripe/mappers/refund.js';
import { mapStripeCustomer } from '../../../src/adapters/stripe/mappers/customer.js';
import { mapStripePaymentMethod } from '../../../src/adapters/stripe/mappers/payment-method.js';
import { mapStripeSubscription } from '../../../src/adapters/stripe/mappers/subscription.js';
import { mapStripeWebhookEvent, mapStripeEventType } from '../../../src/adapters/stripe/mappers/webhook.js';
import { mapStripeError } from '../../../src/adapters/stripe/mappers/error.js';
import { PaymentError } from '../../../src/index.js';

// ─── Helpers ────────────────────────────────────────────────

function fakePaymentIntent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pi_123',
    amount: 5000,
    currency: 'usd',
    status: 'succeeded',
    description: 'Test charge',
    customer: 'cus_abc',
    payment_method: 'pm_xyz',
    metadata: { orderId: '42' },
    created: 1700000000,
    ...overrides,
  } as any;
}

function fakeRefund(overrides: Record<string, unknown> = {}) {
  return {
    id: 're_123',
    payment_intent: 'pi_123',
    amount: 2000,
    currency: 'eur',
    status: 'succeeded',
    reason: 'requested_by_customer',
    metadata: { note: 'partial' },
    created: 1700000000,
    ...overrides,
  } as any;
}

function fakeCustomer(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cus_123',
    email: 'alice@example.com',
    name: 'Alice',
    phone: '+1234567890',
    metadata: { tier: 'premium' },
    created: 1700000000,
    ...overrides,
  } as any;
}

function fakePaymentMethod(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pm_123',
    type: 'card',
    card: { last4: '4242', brand: 'visa', exp_month: 12, exp_year: 2026 },
    customer: 'cus_abc',
    metadata: {},
    created: 1700000000,
    ...overrides,
  } as any;
}

function fakeSubscription(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sub_123',
    customer: 'cus_abc',
    status: 'active',
    items: {
      data: [
        {
          price: {
            unit_amount: 1999,
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
    ...overrides,
  } as any;
}

function fakeStripeEvent(type: string, overrides: Record<string, unknown> = {}) {
  return {
    id: 'evt_123',
    type,
    data: { object: { id: 'pi_123' } },
    created: 1700000000,
    ...overrides,
  } as any;
}

function fakeStripeError(overrides: Record<string, unknown> = {}) {
  const err = new Error('Your card was declined') as any;
  err.type = 'card_error';
  err.code = 'card_declined';
  err.statusCode = 402;
  err.message = 'Your card was declined';
  Object.assign(err, overrides);
  return err;
}

// ─── Charge Mapper ──────────────────────────────────────────

describe('charge mapper', () => {
  describe('mapChargeStatus', () => {
    it.each([
      ['requires_payment_method', 'pending'],
      ['requires_confirmation', 'pending'],
      ['requires_action', 'requires_action'],
      ['processing', 'processing'],
      ['succeeded', 'succeeded'],
      ['canceled', 'canceled'],
      ['requires_capture', 'requires_action'],
    ])('maps %s → %s', (input, expected) => {
      expect(mapChargeStatus(input)).toBe(expected);
    });

    it('falls back to pending for unknown statuses', () => {
      expect(mapChargeStatus('some_new_status')).toBe('pending');
    });
  });

  describe('mapPaymentIntentToCharge', () => {
    it('maps a basic PaymentIntent', () => {
      const charge = mapPaymentIntentToCharge(fakePaymentIntent());
      expect(charge).toMatchObject({
        id: 'pi_123',
        providerId: 'pi_123',
        provider: 'stripe',
        amount: 5000,
        currency: 'USD',
        status: 'succeeded',
        description: 'Test charge',
        metadata: { orderId: '42' },
      });
      expect(charge.createdAt).toBeInstanceOf(Date);
      expect(charge._raw).toBeDefined();
    });

    it('handles customer as string', () => {
      const charge = mapPaymentIntentToCharge(fakePaymentIntent({ customer: 'cus_abc' }));
      expect(charge.customer).toEqual({ id: 'cus_abc' });
    });

    it('handles customer as object', () => {
      const charge = mapPaymentIntentToCharge(
        fakePaymentIntent({ customer: { id: 'cus_obj' } }),
      );
      expect(charge.customer).toEqual({ id: 'cus_obj' });
    });

    it('handles missing customer', () => {
      const charge = mapPaymentIntentToCharge(fakePaymentIntent({ customer: null }));
      expect(charge.customer).toBeUndefined();
    });

    it('handles missing payment_method', () => {
      const charge = mapPaymentIntentToCharge(fakePaymentIntent({ payment_method: null }));
      expect(charge.paymentMethod).toBeUndefined();
    });

    it('uppercases currency', () => {
      const charge = mapPaymentIntentToCharge(fakePaymentIntent({ currency: 'gbp' }));
      expect(charge.currency).toBe('GBP');
    });

    it('converts timestamp to Date', () => {
      const charge = mapPaymentIntentToCharge(fakePaymentIntent({ created: 1700000000 }));
      expect(charge.createdAt).toEqual(new Date(1700000000 * 1000));
    });
  });
});

// ─── Refund Mapper ──────────────────────────────────────────

describe('refund mapper', () => {
  describe('mapRefundStatus', () => {
    it.each([
      ['succeeded', 'succeeded'],
      ['pending', 'pending'],
      ['failed', 'failed'],
      ['canceled', 'canceled'],
      ['requires_action', 'pending'],
    ])('maps %s → %s', (input, expected) => {
      expect(mapRefundStatus(input)).toBe(expected);
    });

    it('falls back to pending for unknown statuses', () => {
      expect(mapRefundStatus('unknown')).toBe('pending');
    });
  });

  describe('mapStripeRefund', () => {
    it('maps a basic refund', () => {
      const refund = mapStripeRefund(fakeRefund());
      expect(refund).toMatchObject({
        id: 're_123',
        providerId: 're_123',
        provider: 'stripe',
        chargeId: 'pi_123',
        amount: 2000,
        currency: 'EUR',
        status: 'succeeded',
        reason: 'requested_by_customer',
      });
    });

    it('handles payment_intent as object', () => {
      const refund = mapStripeRefund(fakeRefund({ payment_intent: { id: 'pi_obj' } }));
      expect(refund.chargeId).toBe('pi_obj');
    });

    it('handles null payment_intent', () => {
      const refund = mapStripeRefund(fakeRefund({ payment_intent: null }));
      expect(refund.chargeId).toBe('');
    });

    it('handles null status', () => {
      const refund = mapStripeRefund(fakeRefund({ status: null }));
      expect(refund.status).toBe('pending');
    });
  });
});

// ─── Customer Mapper ────────────────────────────────────────

describe('customer mapper', () => {
  it('maps a full customer', () => {
    const customer = mapStripeCustomer(fakeCustomer());
    expect(customer).toMatchObject({
      id: 'cus_123',
      providerId: 'cus_123',
      provider: 'stripe',
      email: 'alice@example.com',
      name: 'Alice',
      phone: '+1234567890',
      metadata: { tier: 'premium' },
    });
    expect(customer.createdAt).toBeInstanceOf(Date);
  });

  it('handles null optional fields', () => {
    const customer = mapStripeCustomer(fakeCustomer({ email: null, name: null, phone: null }));
    expect(customer.email).toBeUndefined();
    expect(customer.name).toBeUndefined();
    expect(customer.phone).toBeUndefined();
  });
});

// ─── Payment Method Mapper ──────────────────────────────────

describe('payment method mapper', () => {
  it('maps a card payment method', () => {
    const pm = mapStripePaymentMethod(fakePaymentMethod());
    expect(pm).toMatchObject({
      id: 'pm_123',
      provider: 'stripe',
      type: 'card',
      last4: '4242',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2026,
      customerId: 'cus_abc',
    });
  });

  it('maps type upi', () => {
    const pm = mapStripePaymentMethod(fakePaymentMethod({ type: 'upi', card: null }));
    expect(pm.type).toBe('upi');
    expect(pm.last4).toBeUndefined();
  });

  it('maps sepa_debit → direct_debit', () => {
    const pm = mapStripePaymentMethod(fakePaymentMethod({ type: 'sepa_debit', card: null }));
    expect(pm.type).toBe('direct_debit');
  });

  it('maps unknown type to other', () => {
    const pm = mapStripePaymentMethod(fakePaymentMethod({ type: 'unknown_type', card: null }));
    expect(pm.type).toBe('other');
  });

  it('handles customer as object', () => {
    const pm = mapStripePaymentMethod(fakePaymentMethod({ customer: { id: 'cus_obj' } }));
    expect(pm.customerId).toBe('cus_obj');
  });

  it('handles null customer', () => {
    const pm = mapStripePaymentMethod(fakePaymentMethod({ customer: null }));
    expect(pm.customerId).toBeUndefined();
  });
});

// ─── Subscription Mapper ────────────────────────────────────

describe('subscription mapper', () => {
  it('maps a basic subscription', () => {
    const sub = mapStripeSubscription(fakeSubscription());
    expect(sub).toMatchObject({
      id: 'sub_123',
      providerId: 'sub_123',
      provider: 'stripe',
      customerId: 'cus_abc',
      status: 'active',
      amount: 1999,
      currency: 'USD',
      interval: 'month',
      intervalCount: 1,
      cancelAtPeriodEnd: false,
    });
    expect(sub.currentPeriodStart).toBeInstanceOf(Date);
    expect(sub.currentPeriodEnd).toBeInstanceOf(Date);
  });

  it('handles customer as object', () => {
    const sub = mapStripeSubscription(fakeSubscription({ customer: { id: 'cus_obj' } }));
    expect(sub.customerId).toBe('cus_obj');
  });

  it.each([
    ['active', 'active'],
    ['past_due', 'past_due'],
    ['canceled', 'canceled'],
    ['paused', 'paused'],
    ['trialing', 'trialing'],
    ['unpaid', 'unpaid'],
    ['incomplete', 'incomplete'],
    ['incomplete_expired', 'incomplete'],
  ])('maps status %s → %s', (input, expected) => {
    const sub = mapStripeSubscription(fakeSubscription({ status: input }));
    expect(sub.status).toBe(expected);
  });

  it('handles yearly interval', () => {
    const sub = mapStripeSubscription(
      fakeSubscription({
        items: {
          data: [
            {
              price: {
                unit_amount: 9999,
                currency: 'usd',
                recurring: { interval: 'year', interval_count: 1 },
              },
            },
          ],
        },
      }),
    );
    expect(sub.interval).toBe('year');
    expect(sub.amount).toBe(9999);
  });
});

// ─── Webhook Mapper ─────────────────────────────────────────

describe('webhook mapper', () => {
  describe('mapStripeEventType', () => {
    it.each([
      ['payment_intent.succeeded', 'charge.succeeded'],
      ['payment_intent.payment_failed', 'charge.failed'],
      ['charge.refunded', 'charge.refunded'],
      ['charge.dispute.created', 'charge.disputed'],
      ['refund.created', 'refund.created'],
      ['refund.updated', 'refund.completed'],
      ['refund.failed', 'refund.failed'],
      ['customer.subscription.created', 'subscription.created'],
      ['invoice.payment_succeeded', 'subscription.renewed'],
      ['customer.subscription.deleted', 'subscription.canceled'],
      ['invoice.payment_failed', 'subscription.payment_failed'],
      ['customer.created', 'customer.created'],
      ['customer.updated', 'customer.updated'],
      ['payout.paid', 'payout.completed'],
      ['payout.failed', 'payout.failed'],
    ])('maps %s → %s', (input, expected) => {
      expect(mapStripeEventType(input)).toBe(expected);
    });

    it('returns null for unmapped event types', () => {
      expect(mapStripeEventType('account.updated')).toBeNull();
    });
  });

  describe('mapStripeWebhookEvent', () => {
    it('maps a known event', () => {
      const event = mapStripeWebhookEvent(fakeStripeEvent('payment_intent.succeeded'));
      expect(event).not.toBeNull();
      expect(event!.type).toBe('charge.succeeded');
      expect(event!.providerType).toBe('payment_intent.succeeded');
      expect(event!.provider).toBe('stripe');
      expect(event!.id).toBe('evt_123');
      expect(event!.createdAt).toBeInstanceOf(Date);
    });

    it('returns null for unknown event types', () => {
      const event = mapStripeWebhookEvent(fakeStripeEvent('account.updated'));
      expect(event).toBeNull();
    });
  });
});

// ─── Error Mapper ───────────────────────────────────────────

describe('error mapper', () => {
  it('maps a card_declined error', () => {
    const err = mapStripeError(fakeStripeError());
    expect(err).toBeInstanceOf(PaymentError);
    expect(err.code).toBe('card_declined');
    expect(err.provider).toBe('stripe');
    expect(err.providerCode).toBe('card_declined');
    expect(err.httpStatus).toBe(402);
    expect(err.isRetryable).toBe(false);
    expect(err.message).toBe('Your card was declined');
  });

  it('maps an insufficient_funds error', () => {
    const err = mapStripeError(fakeStripeError({ code: 'insufficient_funds' }));
    expect(err.code).toBe('insufficient_funds');
  });

  it('maps invalid card errors', () => {
    for (const code of ['invalid_number', 'invalid_expiry_month', 'invalid_expiry_year', 'invalid_cvc']) {
      const err = mapStripeError(fakeStripeError({ code }));
      expect(err.code).toBe('invalid_card');
    }
  });

  it('marks rate_limit as retryable', () => {
    const err = mapStripeError(fakeStripeError({ code: 'rate_limit' }));
    expect(err.isRetryable).toBe(true);
    expect(err.code).toBe('rate_limit');
  });

  it('marks processing_error as retryable', () => {
    const err = mapStripeError(fakeStripeError({ code: 'processing_error' }));
    expect(err.isRetryable).toBe(true);
  });

  it('falls back to type when code is missing', () => {
    const err = mapStripeError(fakeStripeError({ code: undefined, type: 'invalid_request_error' }));
    expect(err.code).toBe('invalid_request');
  });

  it('defaults to processing_error for unknown codes', () => {
    const err = mapStripeError(fakeStripeError({ code: 'something_new' }));
    expect(err.code).toBe('processing_error');
    expect(err.isRetryable).toBe(false);
  });
});
