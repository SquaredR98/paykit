import type Stripe from 'stripe';
import type { UnifiedWebhookEvent, WebhookEventType } from '../../../types/webhook.js';

const EVENT_TYPE_MAP: Record<string, WebhookEventType> = {
  'payment_intent.succeeded': 'charge.succeeded',
  'payment_intent.payment_failed': 'charge.failed',
  'charge.refunded': 'charge.refunded',
  'charge.dispute.created': 'charge.disputed',
  'refund.created': 'refund.created',
  'refund.updated': 'refund.completed',
  'refund.failed': 'refund.failed',
  'customer.subscription.created': 'subscription.created',
  'invoice.payment_succeeded': 'subscription.renewed',
  'customer.subscription.deleted': 'subscription.canceled',
  'invoice.payment_failed': 'subscription.payment_failed',
  'customer.created': 'customer.created',
  'customer.updated': 'customer.updated',
  'payout.paid': 'payout.completed',
  'payout.failed': 'payout.failed',
};

export function mapStripeEventType(stripeType: string): WebhookEventType | null {
  return EVENT_TYPE_MAP[stripeType] ?? null;
}

export function mapStripeWebhookEvent(event: Stripe.Event): UnifiedWebhookEvent | null {
  const mappedType = mapStripeEventType(event.type);
  if (!mappedType) return null;

  return {
    id: event.id,
    provider: 'stripe',
    type: mappedType,
    providerType: event.type,
    data: event.data.object,
    createdAt: new Date(event.created * 1000),
    _raw: event,
  };
}
