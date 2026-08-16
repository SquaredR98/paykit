import type { WebhookEventType } from '@squaredr/paykit';

export interface WebhookSample {
  provider: 'stripe' | 'razorpay' | 'paypal';
  providerType: string;
  normalizedType: WebhookEventType;
  rawPayload: Record<string, unknown>;
  normalizedEvent: {
    id: string;
    provider: string;
    type: WebhookEventType;
    providerType: string;
    data: Record<string, unknown>;
    createdAt: string;
  };
}

export const WEBHOOK_SAMPLES: WebhookSample[] = [
  // ── Stripe ────────────────────────────────────────────────
  {
    provider: 'stripe',
    providerType: 'payment_intent.succeeded',
    normalizedType: 'charge.succeeded',
    rawPayload: {
      id: 'evt_1QxR4e2eZvKYlo2C',
      object: 'event',
      api_version: '2024-12-18',
      created: 1705312200,
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_3QxR4d2eZvKYlo2C',
          object: 'payment_intent',
          amount: 4900,
          currency: 'usd',
          status: 'succeeded',
          description: 'Pro Plan — Monthly',
          payment_method: 'pm_1QxR4c2eZvKYlo2C',
          metadata: { planId: 'pro-monthly' },
          created: 1705312199,
        },
      },
      livemode: false,
    },
    normalizedEvent: {
      id: 'evt_1QxR4e2eZvKYlo2C',
      provider: 'stripe',
      type: 'charge.succeeded',
      providerType: 'payment_intent.succeeded',
      data: {
        id: 'pi_3QxR4d2eZvKYlo2C',
        amount: 4900,
        currency: 'usd',
        status: 'succeeded',
        description: 'Pro Plan — Monthly',
        metadata: { planId: 'pro-monthly' },
      },
      createdAt: '2025-01-15T10:30:00.000Z',
    },
  },
  {
    provider: 'stripe',
    providerType: 'payment_intent.payment_failed',
    normalizedType: 'charge.failed',
    rawPayload: {
      id: 'evt_1QxT9f3eZvKYlo2D',
      object: 'event',
      api_version: '2024-12-18',
      created: 1705315800,
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_3QxT9e3eZvKYlo2D',
          object: 'payment_intent',
          amount: 15000,
          currency: 'usd',
          status: 'requires_payment_method',
          last_payment_error: {
            code: 'card_declined',
            decline_code: 'insufficient_funds',
            message: 'Your card has insufficient funds.',
          },
          created: 1705315799,
        },
      },
      livemode: false,
    },
    normalizedEvent: {
      id: 'evt_1QxT9f3eZvKYlo2D',
      provider: 'stripe',
      type: 'charge.failed',
      providerType: 'payment_intent.payment_failed',
      data: {
        id: 'pi_3QxT9e3eZvKYlo2D',
        amount: 15000,
        currency: 'usd',
        status: 'requires_payment_method',
        error: {
          code: 'card_declined',
          decline_code: 'insufficient_funds',
          message: 'Your card has insufficient funds.',
        },
      },
      createdAt: '2025-01-15T11:30:00.000Z',
    },
  },
  {
    provider: 'stripe',
    providerType: 'charge.refunded',
    normalizedType: 'charge.refunded',
    rawPayload: {
      id: 'evt_1QxV2g4eZvKYlo2E',
      object: 'event',
      api_version: '2024-12-18',
      created: 1705319400,
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_3QxR4d2eZvKYlo2C',
          object: 'charge',
          amount: 4900,
          amount_refunded: 4900,
          currency: 'usd',
          refunded: true,
          status: 'succeeded',
          refunds: {
            data: [{ id: 're_3QxV2f4eZvKYlo2E', amount: 4900, status: 'succeeded' }],
          },
          created: 1705312199,
        },
      },
      livemode: false,
    },
    normalizedEvent: {
      id: 'evt_1QxV2g4eZvKYlo2E',
      provider: 'stripe',
      type: 'charge.refunded',
      providerType: 'charge.refunded',
      data: {
        id: 'ch_3QxR4d2eZvKYlo2C',
        amount: 4900,
        amountRefunded: 4900,
        currency: 'usd',
        refunded: true,
      },
      createdAt: '2025-01-15T12:30:00.000Z',
    },
  },
  {
    provider: 'stripe',
    providerType: 'customer.subscription.created',
    normalizedType: 'subscription.created',
    rawPayload: {
      id: 'evt_1QxW3h5eZvKYlo2F',
      object: 'event',
      api_version: '2024-12-18',
      created: 1705323000,
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_1QxW3g5eZvKYlo2F',
          object: 'subscription',
          customer: 'cus_PqR5tU7vW8xY',
          status: 'active',
          items: {
            data: [
              {
                price: { id: 'price_1QxW3f5e', unit_amount: 4900, currency: 'usd', recurring: { interval: 'month' } },
              },
            ],
          },
          current_period_start: 1705323000,
          current_period_end: 1707915000,
          created: 1705323000,
        },
      },
      livemode: false,
    },
    normalizedEvent: {
      id: 'evt_1QxW3h5eZvKYlo2F',
      provider: 'stripe',
      type: 'subscription.created',
      providerType: 'customer.subscription.created',
      data: {
        id: 'sub_1QxW3g5eZvKYlo2F',
        customer: 'cus_PqR5tU7vW8xY',
        status: 'active',
        amount: 4900,
        currency: 'usd',
        interval: 'month',
      },
      createdAt: '2025-01-15T13:30:00.000Z',
    },
  },

  // ── Razorpay ──────────────────────────────────────────────
  {
    provider: 'razorpay',
    providerType: 'payment.captured',
    normalizedType: 'charge.succeeded',
    rawPayload: {
      entity: 'event',
      account_id: 'acc_DGf4kL7rNb2X',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: 'pay_FgR7dShV9kGN2b',
            entity: 'payment',
            amount: 410000,
            currency: 'INR',
            status: 'captured',
            method: 'upi',
            description: 'Pro Plan — Monthly',
            email: 'user@example.com',
            contact: '+919876543210',
            created_at: 1705312200,
          },
        },
      },
      created_at: 1705312201,
    },
    normalizedEvent: {
      id: 'pay_FgR7dShV9kGN2b',
      provider: 'razorpay',
      type: 'charge.succeeded',
      providerType: 'payment.captured',
      data: {
        id: 'pay_FgR7dShV9kGN2b',
        amount: 410000,
        currency: 'INR',
        status: 'captured',
        method: 'upi',
        description: 'Pro Plan — Monthly',
      },
      createdAt: '2025-01-15T10:30:01.000Z',
    },
  },
  {
    provider: 'razorpay',
    providerType: 'payment.failed',
    normalizedType: 'charge.failed',
    rawPayload: {
      entity: 'event',
      account_id: 'acc_DGf4kL7rNb2X',
      event: 'payment.failed',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: 'pay_HgS8eTiW0lHO3c',
            entity: 'payment',
            amount: 150000,
            currency: 'INR',
            status: 'failed',
            method: 'card',
            error_code: 'BAD_REQUEST_ERROR',
            error_description: 'Payment was declined by the issuing bank',
            error_reason: 'payment_declined',
            created_at: 1705315800,
          },
        },
      },
      created_at: 1705315801,
    },
    normalizedEvent: {
      id: 'pay_HgS8eTiW0lHO3c',
      provider: 'razorpay',
      type: 'charge.failed',
      providerType: 'payment.failed',
      data: {
        id: 'pay_HgS8eTiW0lHO3c',
        amount: 150000,
        currency: 'INR',
        status: 'failed',
        error: {
          code: 'BAD_REQUEST_ERROR',
          description: 'Payment was declined by the issuing bank',
          reason: 'payment_declined',
        },
      },
      createdAt: '2025-01-15T11:30:01.000Z',
    },
  },
  {
    provider: 'razorpay',
    providerType: 'refund.processed',
    normalizedType: 'refund.completed',
    rawPayload: {
      entity: 'event',
      account_id: 'acc_DGf4kL7rNb2X',
      event: 'refund.processed',
      contains: ['refund', 'payment'],
      payload: {
        refund: {
          entity: {
            id: 'rfnd_IjT9fUjX1mIP4d',
            entity: 'refund',
            amount: 410000,
            currency: 'INR',
            payment_id: 'pay_FgR7dShV9kGN2b',
            status: 'processed',
            speed_processed: 'normal',
            created_at: 1705319400,
          },
        },
        payment: {
          entity: {
            id: 'pay_FgR7dShV9kGN2b',
            amount: 410000,
            currency: 'INR',
            status: 'refunded',
          },
        },
      },
      created_at: 1705319401,
    },
    normalizedEvent: {
      id: 'rfnd_IjT9fUjX1mIP4d',
      provider: 'razorpay',
      type: 'refund.completed',
      providerType: 'refund.processed',
      data: {
        id: 'rfnd_IjT9fUjX1mIP4d',
        amount: 410000,
        currency: 'INR',
        paymentId: 'pay_FgR7dShV9kGN2b',
        status: 'processed',
      },
      createdAt: '2025-01-15T12:30:01.000Z',
    },
  },

  // ── PayPal ────────────────────────────────────────────────
  {
    provider: 'paypal',
    providerType: 'PAYMENT.CAPTURE.COMPLETED',
    normalizedType: 'charge.succeeded',
    rawPayload: {
      id: 'WH-7YX49823S2290830J',
      event_version: '1.0',
      create_time: '2025-01-15T10:30:00.000Z',
      resource_type: 'capture',
      event_type: 'PAYMENT.CAPTURE.COMPLETED',
      summary: 'Payment completed for $49.00 USD',
      resource: {
        id: '2GG279541U471',
        status: 'COMPLETED',
        amount: { currency_code: 'USD', value: '49.00' },
        seller_protection: { status: 'ELIGIBLE' },
        final_capture: true,
        create_time: '2025-01-15T10:29:58.000Z',
        update_time: '2025-01-15T10:30:00.000Z',
      },
    },
    normalizedEvent: {
      id: 'WH-7YX49823S2290830J',
      provider: 'paypal',
      type: 'charge.succeeded',
      providerType: 'PAYMENT.CAPTURE.COMPLETED',
      data: {
        id: '2GG279541U471',
        status: 'COMPLETED',
        amount: 4900,
        currency: 'USD',
      },
      createdAt: '2025-01-15T10:30:00.000Z',
    },
  },
  {
    provider: 'paypal',
    providerType: 'PAYMENT.CAPTURE.DENIED',
    normalizedType: 'charge.failed',
    rawPayload: {
      id: 'WH-9AB52934T3401941K',
      event_version: '1.0',
      create_time: '2025-01-15T11:30:00.000Z',
      resource_type: 'capture',
      event_type: 'PAYMENT.CAPTURE.DENIED',
      summary: 'Payment denied',
      resource: {
        id: '5HH390652V582',
        status: 'DECLINED',
        amount: { currency_code: 'USD', value: '150.00' },
        final_capture: true,
        create_time: '2025-01-15T11:29:58.000Z',
        update_time: '2025-01-15T11:30:00.000Z',
      },
    },
    normalizedEvent: {
      id: 'WH-9AB52934T3401941K',
      provider: 'paypal',
      type: 'charge.failed',
      providerType: 'PAYMENT.CAPTURE.DENIED',
      data: {
        id: '5HH390652V582',
        status: 'DECLINED',
        amount: 15000,
        currency: 'USD',
      },
      createdAt: '2025-01-15T11:30:00.000Z',
    },
  },
  {
    provider: 'paypal',
    providerType: 'CUSTOMER.DISPUTE.CREATED',
    normalizedType: 'charge.disputed',
    rawPayload: {
      id: 'WH-3CD63045U4512052L',
      event_version: '1.0',
      create_time: '2025-01-15T14:00:00.000Z',
      resource_type: 'dispute',
      event_type: 'CUSTOMER.DISPUTE.CREATED',
      summary: 'A dispute was filed',
      resource: {
        dispute_id: 'PP-D-67890',
        reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
        status: 'OPEN',
        dispute_amount: { currency_code: 'USD', value: '49.00' },
        disputed_transactions: [
          { buyer_transaction_id: '5TX12345678', seller_transaction_id: '2GG279541U471' },
        ],
        create_time: '2025-01-15T14:00:00.000Z',
      },
    },
    normalizedEvent: {
      id: 'WH-3CD63045U4512052L',
      provider: 'paypal',
      type: 'charge.disputed',
      providerType: 'CUSTOMER.DISPUTE.CREATED',
      data: {
        disputeId: 'PP-D-67890',
        reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
        status: 'OPEN',
        amount: 4900,
        currency: 'USD',
      },
      createdAt: '2025-01-15T14:00:00.000Z',
    },
  },
  {
    provider: 'paypal',
    providerType: 'BILLING.SUBSCRIPTION.CREATED',
    normalizedType: 'subscription.created',
    rawPayload: {
      id: 'WH-4DE74156V5623163M',
      event_version: '1.0',
      create_time: '2025-01-15T15:00:00.000Z',
      resource_type: 'subscription',
      event_type: 'BILLING.SUBSCRIPTION.CREATED',
      summary: 'Subscription created',
      resource: {
        id: 'I-BW452GLLEP1G',
        plan_id: 'P-5ML4271244454',
        status: 'ACTIVE',
        start_time: '2025-01-15T15:00:00.000Z',
        subscriber: {
          email_address: 'user@example.com',
          name: { given_name: 'Jane', surname: 'Doe' },
        },
        billing_info: {
          outstanding_balance: { currency_code: 'USD', value: '0.00' },
          cycle_executions: [
            { tenure_type: 'REGULAR', sequence: 1, cycles_completed: 0, total_cycles: 0 },
          ],
          next_billing_time: '2025-02-15T10:00:00.000Z',
        },
        create_time: '2025-01-15T15:00:00.000Z',
      },
    },
    normalizedEvent: {
      id: 'WH-4DE74156V5623163M',
      provider: 'paypal',
      type: 'subscription.created',
      providerType: 'BILLING.SUBSCRIPTION.CREATED',
      data: {
        id: 'I-BW452GLLEP1G',
        planId: 'P-5ML4271244454',
        status: 'ACTIVE',
        subscriber: 'user@example.com',
      },
      createdAt: '2025-01-15T15:00:00.000Z',
    },
  },
];

/** Group samples by provider for UI selectors */
export function getSamplesByProvider(provider: string): WebhookSample[] {
  return WEBHOOK_SAMPLES.filter((s) => s.provider === provider);
}

/** Unique providers in the sample set */
export const WEBHOOK_PROVIDERS = ['stripe', 'razorpay', 'paypal'] as const;
