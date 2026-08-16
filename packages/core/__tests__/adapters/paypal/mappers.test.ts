import { describe, it, expect } from 'vitest';
import { mapPayPalOrderToCharge, mapChargeStatus } from '../../../src/adapters/paypal/mappers/charge.js';
import { mapPayPalRefund } from '../../../src/adapters/paypal/mappers/refund.js';
import { mapPayPalCustomer } from '../../../src/adapters/paypal/mappers/customer.js';
import { mapPayPalPaymentMethod } from '../../../src/adapters/paypal/mappers/payment-method.js';
import { mapPayPalSubscription } from '../../../src/adapters/paypal/mappers/subscription.js';
import { mapPayPalWebhookEvent, mapPayPalEventType } from '../../../src/adapters/paypal/mappers/webhook.js';
import { mapPayPalError } from '../../../src/adapters/paypal/mappers/error.js';
import { PayPalApiError } from '../../../src/adapters/paypal/client/paypal-client.js';

// ─── Charge Mapper ──────────────────────────────────────────

describe('mapChargeStatus', () => {
  it.each([
    ['CREATED', 'pending'],
    ['SAVED', 'pending'],
    ['APPROVED', 'requires_action'],
    ['VOIDED', 'canceled'],
    ['COMPLETED', 'succeeded'],
    ['PAYER_ACTION_REQUIRED', 'requires_action'],
    ['UNKNOWN', 'pending'],
  ])('maps %s to %s', (input, expected) => {
    expect(mapChargeStatus(input)).toBe(expected);
  });
});

describe('mapPayPalOrderToCharge', () => {
  // The PayPal SDK transforms REST API responses from snake_case to camelCase.
  // Test data must use camelCase to match what the mappers actually receive.

  it('maps a completed order', () => {
    const order = {
      id: 'ORDER-1',
      status: 'COMPLETED',
      intent: 'CAPTURE',
      purchaseUnits: [
        {
          amount: { currencyCode: 'USD', value: '29.99' },
          description: 'Widget',
        },
      ],
      payer: { payerId: 'P-1', emailAddress: 'payer@test.com' },
      paymentSource: { card: { lastDigits: '1234', brand: 'MASTERCARD' } },
      createTime: '2026-07-01T00:00:00Z',
      updateTime: '2026-07-01T00:00:05Z',
    };

    const charge = mapPayPalOrderToCharge(order);
    expect(charge.id).toBe('ORDER-1');
    expect(charge.providerId).toBe('ORDER-1');
    expect(charge.provider).toBe('paypal');
    expect(charge.amount).toBe(2999);
    expect(charge.currency).toBe('USD');
    expect(charge.status).toBe('succeeded');
    expect(charge.description).toBe('Widget');
    expect(charge.customer).toEqual({ id: 'P-1', email: 'payer@test.com' });
    expect(charge.paymentMethod).toEqual({ type: 'card', last4: '1234', brand: 'mastercard' });
    expect(charge._raw).toBe(order);
  });

  it('converts JPY amount without decimals', () => {
    const order = {
      id: 'ORDER-2',
      status: 'COMPLETED',
      intent: 'CAPTURE',
      purchaseUnits: [
        { amount: { currencyCode: 'JPY', value: '5000' } },
      ],
      createTime: '2026-07-01T00:00:00Z',
      updateTime: '2026-07-01T00:00:00Z',
    };
    const charge = mapPayPalOrderToCharge(order);
    expect(charge.amount).toBe(5000);
    expect(charge.currency).toBe('JPY');
  });

  it('extracts approve redirect URL', () => {
    const order = {
      id: 'ORDER-3',
      status: 'CREATED',
      intent: 'CAPTURE',
      purchaseUnits: [{ amount: { currencyCode: 'USD', value: '10.00' } }],
      links: [
        { href: 'https://api.paypal.com/self', rel: 'self', method: 'GET' },
        { href: 'https://paypal.com/approve', rel: 'approve', method: 'GET' },
      ],
      createTime: '2026-07-01T00:00:00Z',
      updateTime: '2026-07-01T00:00:00Z',
    };
    const charge = mapPayPalOrderToCharge(order);
    expect(charge.redirectUrl).toBe('https://paypal.com/approve');
  });

  it('handles PayPal wallet payment source', () => {
    const order = {
      id: 'ORDER-4',
      status: 'COMPLETED',
      intent: 'CAPTURE',
      purchaseUnits: [{ amount: { currencyCode: 'USD', value: '10.00' } }],
      paymentSource: { paypal: { emailAddress: 'payer@test.com', accountId: 'ACC-1' } },
      createTime: '2026-07-01T00:00:00Z',
      updateTime: '2026-07-01T00:00:00Z',
    };
    const charge = mapPayPalOrderToCharge(order);
    expect(charge.paymentMethod).toEqual({ type: 'wallet' });
  });
});

// ─── Refund Mapper ──────────────────────────────────────────

describe('mapPayPalRefund', () => {
  it('maps a completed refund', () => {
    const refund = {
      id: 'REF-1',
      status: 'COMPLETED',
      amount: { currencyCode: 'USD', value: '15.50' },
      noteToPayer: 'Overbilled',
      createTime: '2026-07-02T00:00:00Z',
    };
    const result = mapPayPalRefund(refund, 'CAPTURE-1');
    expect(result.id).toBe('REF-1');
    expect(result.provider).toBe('paypal');
    expect(result.chargeId).toBe('CAPTURE-1');
    expect(result.amount).toBe(1550);
    expect(result.currency).toBe('USD');
    expect(result.status).toBe('succeeded');
    expect(result.reason).toBe('Overbilled');
  });

  it.each([
    ['COMPLETED', 'succeeded'],
    ['PENDING', 'pending'],
    ['FAILED', 'failed'],
    ['CANCELLED', 'canceled'],
  ])('maps refund status %s to %s', (paypalStatus, expected) => {
    const refund = {
      id: 'REF-2',
      status: paypalStatus,
      amount: { currencyCode: 'USD', value: '1.00' },
      createTime: '2026-07-02T00:00:00Z',
    };
    expect(mapPayPalRefund(refund).status).toBe(expected);
  });
});

// ─── Customer Mapper ────────────────────────────────────────

describe('mapPayPalCustomer', () => {
  it('maps a full customer', () => {
    const customer = {
      id: 'CUST-1',
      email: 'john@test.com',
      name: { given_name: 'John', surname: 'Doe' },
      phone: { phone_number: { national_number: '5551234' } },
      merchant_customer_id: 'my-123',
      create_time: '2026-07-01T00:00:00Z',
    };
    const result = mapPayPalCustomer(customer);
    expect(result.id).toBe('CUST-1');
    expect(result.provider).toBe('paypal');
    expect(result.email).toBe('john@test.com');
    expect(result.name).toBe('John Doe');
    expect(result.phone).toBe('5551234');
    expect(result.metadata).toEqual({ merchant_customer_id: 'my-123' });
  });

  it('handles missing fields gracefully', () => {
    const customer = { id: 'CUST-2' };
    const result = mapPayPalCustomer(customer);
    expect(result.id).toBe('CUST-2');
    expect(result.email).toBeUndefined();
    expect(result.name).toBeUndefined();
    expect(result.phone).toBeUndefined();
  });
});

// ─── Payment Method Mapper ──────────────────────────────────

describe('mapPayPalPaymentMethod', () => {
  it('maps a card token', () => {
    const token = {
      id: 'TOK-1',
      customer: { id: 'CUST-1' },
      paymentSource: {
        card: { lastDigits: '4242', brand: 'VISA', expiry: '2028-12' },
      },
    };
    const result = mapPayPalPaymentMethod(token);
    expect(result.id).toBe('TOK-1');
    expect(result.type).toBe('card');
    expect(result.last4).toBe('4242');
    expect(result.brand).toBe('visa');
    expect(result.expiryMonth).toBe(12);
    expect(result.expiryYear).toBe(2028);
    expect(result.customerId).toBe('CUST-1');
  });

  it('maps a PayPal wallet token', () => {
    const token = {
      id: 'TOK-2',
      paymentSource: {
        paypal: { emailAddress: 'p@test.com', accountId: 'ACC-1' },
      },
    };
    const result = mapPayPalPaymentMethod(token);
    expect(result.type).toBe('wallet');
    expect(result.last4).toBeUndefined();
  });

  it('maps a Venmo token', () => {
    const token = {
      id: 'TOK-3',
      paymentSource: {
        venmo: { emailAddress: 'v@test.com' },
      },
    };
    const result = mapPayPalPaymentMethod(token);
    expect(result.type).toBe('wallet');
  });
});

// ─── Subscription Mapper ────────────────────────────────────

describe('mapPayPalSubscription', () => {
  it('maps a subscription with plan info', () => {
    const sub = {
      id: 'SUB-1',
      planId: 'PLAN-1',
      status: 'ACTIVE',
      subscriber: { payerId: 'P-1' },
      billingInfo: { nextBillingTime: '2026-08-01T00:00:00Z' },
      createTime: '2026-07-01T00:00:00Z',
    };
    const plan = {
      id: 'PLAN-1',
      status: 'ACTIVE',
      billingCycles: [
        {
          tenureType: 'REGULAR',
          sequence: 1,
          totalCycles: 0,
          frequency: { intervalUnit: 'MONTH', intervalCount: 1 },
          pricingScheme: {
            fixedPrice: { currencyCode: 'USD', value: '19.99' },
          },
        },
      ],
    };

    const result = mapPayPalSubscription(sub, plan);
    expect(result.id).toBe('SUB-1');
    expect(result.provider).toBe('paypal');
    expect(result.status).toBe('active');
    expect(result.amount).toBe(1999);
    expect(result.currency).toBe('USD');
    expect(result.interval).toBe('month');
    expect(result.intervalCount).toBe(1);
    expect(result.customerId).toBe('P-1');
  });

  it.each([
    ['APPROVAL_PENDING', 'incomplete'],
    ['APPROVED', 'incomplete'],
    ['ACTIVE', 'active'],
    ['SUSPENDED', 'paused'],
    ['CANCELLED', 'canceled'],
    ['EXPIRED', 'canceled'],
  ])('maps subscription status %s to %s', (paypalStatus, expected) => {
    const sub = {
      id: 'SUB-X',
      planId: 'P-1',
      status: paypalStatus,
      createTime: '2026-07-01T00:00:00Z',
    };
    expect(mapPayPalSubscription(sub).status).toBe(expected);
  });
});

// ─── Webhook Mapper ─────────────────────────────────────────

describe('mapPayPalEventType', () => {
  it.each([
    ['PAYMENT.CAPTURE.COMPLETED', 'charge.succeeded'],
    ['PAYMENT.CAPTURE.DENIED', 'charge.failed'],
    ['PAYMENT.CAPTURE.PENDING', 'charge.pending'],
    ['PAYMENT.CAPTURE.REFUNDED', 'charge.refunded'],
    ['CUSTOMER.DISPUTE.CREATED', 'charge.disputed'],
    ['BILLING.SUBSCRIPTION.CREATED', 'subscription.created'],
    ['BILLING.SUBSCRIPTION.CANCELLED', 'subscription.canceled'],
    ['BILLING.SUBSCRIPTION.PAYMENT.FAILED', 'subscription.payment_failed'],
    ['PAYMENT.PAYOUTS-ITEM.SUCCEEDED', 'payout.completed'],
    ['PAYMENT.PAYOUTS-ITEM.FAILED', 'payout.failed'],
  ])('maps %s to %s', (paypalType, expected) => {
    expect(mapPayPalEventType(paypalType)).toBe(expected);
  });

  it('returns null for unknown event types', () => {
    expect(mapPayPalEventType('MERCHANT.ONBOARDING.COMPLETED')).toBeNull();
  });
});

describe('mapPayPalWebhookEvent', () => {
  it('maps a known event', () => {
    const event = {
      id: 'WH-1',
      event_type: 'PAYMENT.CAPTURE.COMPLETED',
      event_version: '1.0',
      resource_type: 'capture',
      resource: { id: 'CAP-1' },
      summary: 'Payment captured',
      create_time: '2026-07-01T00:00:00Z',
    };
    const result = mapPayPalWebhookEvent(event);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('charge.succeeded');
    expect(result!.provider).toBe('paypal');
    expect(result!.providerType).toBe('PAYMENT.CAPTURE.COMPLETED');
    expect(result!.data).toEqual({ id: 'CAP-1' });
  });

  it('returns null for unknown events', () => {
    const event = {
      id: 'WH-2',
      event_type: 'UNKNOWN.EVENT',
      event_version: '1.0',
      resource_type: 'unknown',
      resource: {},
      summary: 'Unknown',
      create_time: '2026-07-01T00:00:00Z',
    };
    expect(mapPayPalWebhookEvent(event)).toBeNull();
  });
});

// ─── Error Mapper ───────────────────────────────────────────

describe('mapPayPalError', () => {
  it('maps INSTRUMENT_DECLINED to card_declined', () => {
    const err = new PayPalApiError(422, 'INSTRUMENT_DECLINED', 'Card declined');
    const result = mapPayPalError(err);
    expect(result.code).toBe('card_declined');
    expect(result.provider).toBe('paypal');
    expect(result.isRetryable).toBe(false);
  });

  it('maps RATE_LIMIT_REACHED as retryable', () => {
    const err = new PayPalApiError(429, 'RATE_LIMIT_REACHED', 'Too many requests');
    const result = mapPayPalError(err);
    expect(result.code).toBe('rate_limit');
    expect(result.isRetryable).toBe(true);
  });

  it('maps RESOURCE_NOT_FOUND to not_found', () => {
    const err = new PayPalApiError(404, 'RESOURCE_NOT_FOUND', 'Not found');
    const result = mapPayPalError(err);
    expect(result.code).toBe('not_found');
  });

  it('maps INTERNAL_SERVER_ERROR as retryable', () => {
    const err = new PayPalApiError(500, 'INTERNAL_SERVER_ERROR', 'Server error');
    const result = mapPayPalError(err);
    expect(result.code).toBe('provider_unavailable');
    expect(result.isRetryable).toBe(true);
  });

  it('uses issue-level detail when available', () => {
    const err = new PayPalApiError(422, 'UNPROCESSABLE_ENTITY', 'Validation error', [
      { issue: 'CARD_EXPIRED', description: 'The card is expired' },
    ]);
    const result = mapPayPalError(err);
    expect(result.code).toBe('expired_card');
    expect(result.providerMessage).toBe('The card is expired');
  });

  it('falls back to processing_error for unknown errors', () => {
    const err = new PayPalApiError(400, 'SOMETHING_NEW', 'Unknown error');
    const result = mapPayPalError(err);
    expect(result.code).toBe('processing_error');
  });
});
