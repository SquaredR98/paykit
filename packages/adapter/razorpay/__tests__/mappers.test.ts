import { describe, it, expect } from 'vitest';
import {
  mapRazorpayOrderToCharge,
  mapRazorpayPaymentToCharge,
  mapOrderStatus,
  mapPaymentStatus,
} from '../src/mappers/charge.js';
import { mapRazorpayRefund, mapRefundStatus } from '../src/mappers/refund.js';
import { mapRazorpayCustomer } from '../src/mappers/customer.js';
import { mapRazorpaySubscription, mapSubscriptionStatus } from '../src/mappers/subscription.js';
import { mapRazorpayWebhookEvent, mapRazorpayEventType } from '../src/mappers/webhook.js';
import { mapRazorpayError } from '../src/mappers/error.js';
import { PaymentError } from '@squaredr/paykit';

// ─── Fixtures ─────��────────────────────────────────────────

function fakeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order_abc123',
    amount: 50000,
    currency: 'INR',
    status: 'created',
    receipt: 'receipt_1',
    notes: { key: 'value' },
    created_at: 1700000000,
    ...overrides,
  };
}

function fakePayment(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pay_xyz789',
    amount: 50000,
    currency: 'INR',
    status: 'captured',
    description: 'Test payment',
    customer_id: 'cust_123',
    method: 'card',
    notes: { orderId: '42' },
    created_at: 1700000000,
    ...overrides,
  };
}

function fakeRefund(overrides: Record<string, unknown> = {}) {
  return {
    id: 'rfnd_abc',
    payment_id: 'pay_xyz',
    amount: 20000,
    currency: 'INR',
    status: 'processed',
    notes: {},
    created_at: 1700000000,
    ...overrides,
  };
}

function fakeCustomer(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cust_123',
    name: 'Alice',
    email: 'alice@example.com',
    contact: '+919876543210',
    notes: { tier: 'premium' },
    created_at: 1700000000,
    ...overrides,
  };
}

function fakeSubscription(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sub_abc',
    customer_id: 'cust_123',
    status: 'active',
    current_start: 1700000000,
    current_end: 1702592000,
    notes: { plan: 'pro' },
    created_at: 1700000000,
    ...overrides,
  };
}

// ─── Charge Mappers ────────────��───────────────────────────

describe('charge mappers', () => {
  describe('mapOrderStatus', () => {
    it('maps created → pending', () => {
      expect(mapOrderStatus('created')).toBe('pending');
    });

    it('maps attempted → pending', () => {
      expect(mapOrderStatus('attempted')).toBe('pending');
    });

    it('maps paid → succeeded', () => {
      expect(mapOrderStatus('paid')).toBe('succeeded');
    });

    it('falls back to pending for unknown statuses', () => {
      expect(mapOrderStatus('unknown_status')).toBe('pending');
    });
  });

  describe('mapPaymentStatus', () => {
    it('maps created → pending', () => {
      expect(mapPaymentStatus('created')).toBe('pending');
    });

    it('maps authorized → requires_action', () => {
      expect(mapPaymentStatus('authorized')).toBe('requires_action');
    });

    it('maps captured → succeeded', () => {
      expect(mapPaymentStatus('captured')).toBe('succeeded');
    });

    it('maps refunded → succeeded', () => {
      expect(mapPaymentStatus('refunded')).toBe('succeeded');
    });

    it('maps failed → failed', () => {
      expect(mapPaymentStatus('failed')).toBe('failed');
    });

    it('falls back to pending for unknown statuses', () => {
      expect(mapPaymentStatus('some_new_status')).toBe('pending');
    });
  });

  describe('mapRazorpayOrderToCharge', () => {
    it('maps all fields correctly', () => {
      const result = mapRazorpayOrderToCharge(fakeOrder());
      expect(result.id).toBe('order_abc123');
      expect(result.providerId).toBe('order_abc123');
      expect(result.provider).toBe('razorpay');
      expect(result.amount).toBe(50000);
      expect(result.currency).toBe('INR');
      expect(result.status).toBe('pending');
      expect(result.description).toBe('receipt_1');
      expect(result.metadata).toEqual({ key: 'value' });
      expect(result.createdAt).toEqual(new Date(1700000000000));
      expect(result._raw).toEqual(fakeOrder());
    });

    it('handles missing receipt', () => {
      const result = mapRazorpayOrderToCharge(fakeOrder({ receipt: null }));
      expect(result.description).toBeUndefined();
    });

    it('uppercases currency', () => {
      const result = mapRazorpayOrderToCharge(fakeOrder({ currency: 'inr' }));
      expect(result.currency).toBe('INR');
    });
  });

  describe('mapRazorpayPaymentToCharge', () => {
    it('maps all fields correctly', () => {
      const result = mapRazorpayPaymentToCharge(fakePayment());
      expect(result.id).toBe('pay_xyz789');
      expect(result.providerId).toBe('pay_xyz789');
      expect(result.provider).toBe('razorpay');
      expect(result.amount).toBe(50000);
      expect(result.currency).toBe('INR');
      expect(result.status).toBe('succeeded');
      expect(result.description).toBe('Test payment');
      expect(result.customer).toEqual({ id: 'cust_123' });
      expect(result.paymentMethod?.type).toBe('card');
    });

    it('maps upi payment method', () => {
      const result = mapRazorpayPaymentToCharge(fakePayment({ method: 'upi' }));
      expect(result.paymentMethod?.type).toBe('upi');
    });

    it('maps other payment methods', () => {
      const result = mapRazorpayPaymentToCharge(fakePayment({ method: 'netbanking' }));
      expect(result.paymentMethod?.type).toBe('other');
    });

    it('handles missing customer_id', () => {
      const result = mapRazorpayPaymentToCharge(fakePayment({ customer_id: null }));
      expect(result.customer).toBeUndefined();
    });

    it('handles missing method', () => {
      const result = mapRazorpayPaymentToCharge(fakePayment({ method: null }));
      expect(result.paymentMethod).toBeUndefined();
    });
  });
});

// ─── Refund Mapper ─────────────────────────────────────────

describe('refund mapper', () => {
  describe('mapRefundStatus', () => {
    it('maps pending → pending', () => {
      expect(mapRefundStatus('pending')).toBe('pending');
    });

    it('maps processed → succeeded', () => {
      expect(mapRefundStatus('processed')).toBe('succeeded');
    });

    it('maps failed → failed', () => {
      expect(mapRefundStatus('failed')).toBe('failed');
    });

    it('falls back to pending for unknown', () => {
      expect(mapRefundStatus('unknown')).toBe('pending');
    });
  });

  describe('mapRazorpayRefund', () => {
    it('maps all fields correctly', () => {
      const result = mapRazorpayRefund(fakeRefund());
      expect(result.id).toBe('rfnd_abc');
      expect(result.providerId).toBe('rfnd_abc');
      expect(result.provider).toBe('razorpay');
      expect(result.chargeId).toBe('pay_xyz');
      expect(result.amount).toBe(20000);
      expect(result.currency).toBe('INR');
      expect(result.status).toBe('succeeded');
      expect(result.createdAt).toEqual(new Date(1700000000000));
      expect(result._raw).toEqual(fakeRefund());
    });

    it('handles missing payment_id', () => {
      const result = mapRazorpayRefund(fakeRefund({ payment_id: null }));
      expect(result.chargeId).toBe('');
    });

    it('handles missing status', () => {
      const result = mapRazorpayRefund(fakeRefund({ status: undefined }));
      expect(result.status).toBe('pending');
    });
  });
});

// ─── Customer Mapper ───────────────────────────────────────

describe('customer mapper', () => {
  describe('mapRazorpayCustomer', () => {
    it('maps all fields correctly', () => {
      const result = mapRazorpayCustomer(fakeCustomer());
      expect(result.id).toBe('cust_123');
      expect(result.providerId).toBe('cust_123');
      expect(result.provider).toBe('razorpay');
      expect(result.email).toBe('alice@example.com');
      expect(result.name).toBe('Alice');
      expect(result.phone).toBe('+919876543210');
      expect(result.metadata).toEqual({ tier: 'premium' });
      expect(result.createdAt).toEqual(new Date(1700000000000));
    });

    it('handles missing contact', () => {
      const result = mapRazorpayCustomer(fakeCustomer({ contact: null }));
      expect(result.phone).toBeUndefined();
    });

    it('handles missing email', () => {
      const result = mapRazorpayCustomer(fakeCustomer({ email: null }));
      expect(result.email).toBeUndefined();
    });

    it('handles missing name', () => {
      const result = mapRazorpayCustomer(fakeCustomer({ name: null }));
      expect(result.name).toBeUndefined();
    });
  });
});

// ─── Subscription Mapper ───────────────────────────────────

describe('subscription mapper', () => {
  describe('mapSubscriptionStatus', () => {
    it('maps created → incomplete', () => {
      expect(mapSubscriptionStatus('created')).toBe('incomplete');
    });

    it('maps authenticated → incomplete', () => {
      expect(mapSubscriptionStatus('authenticated')).toBe('incomplete');
    });

    it('maps active → active', () => {
      expect(mapSubscriptionStatus('active')).toBe('active');
    });

    it('maps pending → past_due', () => {
      expect(mapSubscriptionStatus('pending')).toBe('past_due');
    });

    it('maps halted → past_due', () => {
      expect(mapSubscriptionStatus('halted')).toBe('past_due');
    });

    it('maps cancelled → canceled', () => {
      expect(mapSubscriptionStatus('cancelled')).toBe('canceled');
    });

    it('maps completed → canceled', () => {
      expect(mapSubscriptionStatus('completed')).toBe('canceled');
    });

    it('maps expired → canceled', () => {
      expect(mapSubscriptionStatus('expired')).toBe('canceled');
    });

    it('falls back to active for unknown', () => {
      expect(mapSubscriptionStatus('some_new_status')).toBe('active');
    });
  });

  describe('mapRazorpaySubscription', () => {
    it('maps all fields correctly', () => {
      const result = mapRazorpaySubscription(fakeSubscription());
      expect(result.id).toBe('sub_abc');
      expect(result.providerId).toBe('sub_abc');
      expect(result.provider).toBe('razorpay');
      expect(result.customerId).toBe('cust_123');
      expect(result.status).toBe('active');
      expect(result.currentPeriodStart).toEqual(new Date(1700000000000));
      expect(result.currentPeriodEnd).toEqual(new Date(1702592000000));
      expect(result.metadata).toEqual({ plan: 'pro' });
    });

    it('falls back to created_at when current_start is missing', () => {
      const result = mapRazorpaySubscription(fakeSubscription({ current_start: null }));
      expect(result.currentPeriodStart).toEqual(new Date(1700000000000));
    });

    it('falls back to created_at when current_end is missing', () => {
      const result = mapRazorpaySubscription(fakeSubscription({ current_end: null }));
      expect(result.currentPeriodEnd).toEqual(new Date(1700000000000));
    });

    it('handles array notes (returns undefined)', () => {
      const result = mapRazorpaySubscription(fakeSubscription({ notes: [] }));
      expect(result.metadata).toBeUndefined();
    });

    it('handles missing customer_id', () => {
      const result = mapRazorpaySubscription(fakeSubscription({ customer_id: null }));
      expect(result.customerId).toBe('');
    });
  });
});

// ─── Webhook Mapper ────────────────────────────────────────

describe('webhook mapper', () => {
  describe('mapRazorpayEventType', () => {
    it('maps payment.authorized → charge.succeeded', () => {
      expect(mapRazorpayEventType('payment.authorized')).toBe('charge.succeeded');
    });

    it('maps payment.captured ��� charge.succeeded', () => {
      expect(mapRazorpayEventType('payment.captured')).toBe('charge.succeeded');
    });

    it('maps payment.failed → charge.failed', () => {
      expect(mapRazorpayEventType('payment.failed')).toBe('charge.failed');
    });

    it('maps refund.created → refund.created', () => {
      expect(mapRazorpayEventType('refund.created')).toBe('refund.created');
    });

    it('maps refund.processed → refund.completed', () => {
      expect(mapRazorpayEventType('refund.processed')).toBe('refund.completed');
    });

    it('maps refund.failed → refund.failed', () => {
      expect(mapRazorpayEventType('refund.failed')).toBe('refund.failed');
    });

    it('maps subscription.activated → subscription.created', () => {
      expect(mapRazorpayEventType('subscription.activated')).toBe('subscription.created');
    });

    it('maps subscription.charged → subscription.renewed', () => {
      expect(mapRazorpayEventType('subscription.charged')).toBe('subscription.renewed');
    });

    it('maps subscription.cancelled �� subscription.canceled', () => {
      expect(mapRazorpayEventType('subscription.cancelled')).toBe('subscription.canceled');
    });

    it('maps subscription.halted → subscription.payment_failed', () => {
      expect(mapRazorpayEventType('subscription.halted')).toBe('subscription.payment_failed');
    });

    it('maps subscription.pending → subscription.payment_failed', () => {
      expect(mapRazorpayEventType('subscription.pending')).toBe('subscription.payment_failed');
    });

    it('returns null for unknown events', () => {
      expect(mapRazorpayEventType('account.updated')).toBeNull();
    });
  });

  describe('mapRazorpayWebhookEvent', () => {
    it('maps a known event correctly', () => {
      const payload = {
        entity: 'event',
        account_id: 'acc_123',
        event: 'payment.captured',
        contains: ['payment'],
        payload: {
          payment: { entity: { id: 'pay_xyz', amount: 5000 } },
        },
        created_at: 1700000000,
      };
      const result = mapRazorpayWebhookEvent(payload);
      expect(result).not.toBeNull();
      expect(result!.type).toBe('charge.succeeded');
      expect(result!.provider).toBe('razorpay');
      expect(result!.providerType).toBe('payment.captured');
      expect(result!.data).toEqual({ id: 'pay_xyz', amount: 5000 });
      expect(result!.createdAt).toEqual(new Date(1700000000000));
    });

    it('returns null for unmapped events', () => {
      const payload = {
        entity: 'event',
        account_id: 'acc_123',
        event: 'account.updated',
        contains: ['account'],
        payload: { account: { entity: { id: 'acc_1' } } },
        created_at: 1700000000,
      };
      const result = mapRazorpayWebhookEvent(payload);
      expect(result).toBeNull();
    });
  });
});

// ─── Error Mapper ────��─────────────────────────────��───────

describe('error mapper', () => {
  describe('mapRazorpayError', () => {
    it('maps BAD_REQUEST_ERROR to invalid_request', () => {
      const err = {
        statusCode: 400,
        error: {
          code: 'BAD_REQUEST_ERROR',
          description: 'The amount field is required',
          reason: 'input_validation_failed',
        },
      };
      const result = mapRazorpayError(err);
      expect(result).toBeInstanceOf(PaymentError);
      expect(result.code).toBe('invalid_request');
      expect(result.provider).toBe('razorpay');
      expect(result.providerCode).toBe('BAD_REQUEST_ERROR');
      expect(result.message).toBe('The amount field is required');
      expect(result.isRetryable).toBe(false);
      expect(result.httpStatus).toBe(400);
    });

    it('maps SERVER_ERROR as retryable', () => {
      const err = {
        statusCode: 500,
        error: {
          code: 'SERVER_ERROR',
          description: 'Internal server error',
        },
      };
      const result = mapRazorpayError(err);
      expect(result.code).toBe('processing_error');
      expect(result.isRetryable).toBe(true);
    });

    it('maps GATEWAY_ERROR as retryable', () => {
      const err = {
        statusCode: 502,
        error: {
          code: 'GATEWAY_ERROR',
          description: 'Gateway timeout',
          reason: 'gateway_error',
        },
      };
      const result = mapRazorpayError(err);
      expect(result.code).toBe('processing_error');
      expect(result.isRetryable).toBe(true);
    });

    it('maps insufficient_balance reason', () => {
      const err = {
        statusCode: 400,
        error: {
          code: 'BAD_REQUEST_ERROR',
          description: 'Insufficient balance',
          reason: 'insufficient_balance',
        },
      };
      const result = mapRazorpayError(err);
      expect(result.code).toBe('insufficient_funds');
    });

    it('maps payment_failed reason to card_declined', () => {
      const err = {
        statusCode: 400,
        error: {
          code: 'BAD_REQUEST_ERROR',
          description: 'Payment failed',
          reason: 'payment_failed',
        },
      };
      const result = mapRazorpayError(err);
      expect(result.code).toBe('card_declined');
    });

    it('falls back to processing_error for unknown codes', () => {
      const err = {
        statusCode: 422,
        error: {
          code: 'UNKNOWN_ERROR',
          description: 'Something went wrong',
        },
      };
      const result = mapRazorpayError(err);
      expect(result.code).toBe('processing_error');
      expect(result.isRetryable).toBe(false);
    });

    it('handles missing error body', () => {
      const err = {
        statusCode: 500,
        error: undefined,
        message: 'Fallback message',
      };
      const result = mapRazorpayError(err as any);
      expect(result.message).toBe('Fallback message');
    });

    it('uses default message when everything is missing', () => {
      const err = { statusCode: 500 };
      const result = mapRazorpayError(err as any);
      expect(result.message).toBe('Unknown Razorpay error');
    });
  });
});
