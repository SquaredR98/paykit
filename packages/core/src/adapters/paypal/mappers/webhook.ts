import type { UnifiedWebhookEvent, WebhookEventType } from '../../../types/webhook.js';

/**
 * PayPal webhook event structure.
 * Ref: https://developer.paypal.com/api/rest/webhooks/event-names/
 */
export interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  event_version: string;
  resource_type: string;
  resource: unknown;
  summary: string;
  create_time: string;
  links?: Array<{ href: string; rel: string; method: string }>;
}

/**
 * PayPal event_type → unified event type.
 */
const EVENT_TYPE_MAP: Record<string, WebhookEventType> = {
  // Orders / Payments
  'PAYMENT.CAPTURE.COMPLETED': 'charge.succeeded',
  'PAYMENT.CAPTURE.DENIED': 'charge.failed',
  'PAYMENT.CAPTURE.PENDING': 'charge.pending',
  'PAYMENT.CAPTURE.REFUNDED': 'charge.refunded',
  'CHECKOUT.ORDER.COMPLETED': 'charge.succeeded',

  // Refunds
  'PAYMENT.CAPTURE.REVERSED': 'refund.completed',

  // Disputes
  'CUSTOMER.DISPUTE.CREATED': 'charge.disputed',

  // Subscriptions
  'BILLING.SUBSCRIPTION.CREATED': 'subscription.created',
  'BILLING.SUBSCRIPTION.UPDATED': 'subscription.updated',
  'BILLING.SUBSCRIPTION.ACTIVATED': 'subscription.created',
  'BILLING.SUBSCRIPTION.CANCELLED': 'subscription.canceled',
  'BILLING.SUBSCRIPTION.SUSPENDED': 'subscription.updated',
  'BILLING.SUBSCRIPTION.PAYMENT.FAILED': 'subscription.payment_failed',

  // Payouts
  'PAYMENT.PAYOUTSBATCH.SUCCESS': 'payout.completed',
  'PAYMENT.PAYOUTS-ITEM.SUCCEEDED': 'payout.completed',
  'PAYMENT.PAYOUTS-ITEM.FAILED': 'payout.failed',
};

export function mapPayPalEventType(paypalType: string): WebhookEventType | null {
  return EVENT_TYPE_MAP[paypalType] ?? null;
}

export function mapPayPalWebhookEvent(event: PayPalWebhookEvent): UnifiedWebhookEvent | null {
  const mappedType = mapPayPalEventType(event.event_type);
  if (!mappedType) return null;

  return {
    id: event.id,
    provider: 'paypal',
    type: mappedType,
    providerType: event.event_type,
    data: event.resource,
    createdAt: new Date(event.create_time),
    _raw: event,
  };
}
