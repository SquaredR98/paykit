import type { UnifiedWebhookEvent, WebhookEventType } from '../../../types/webhook.js';

// Razorpay webhook event types → unified types
const EVENT_TYPE_MAP: Record<string, WebhookEventType> = {
  'payment.authorized': 'charge.succeeded',
  'payment.captured': 'charge.succeeded',
  'payment.failed': 'charge.failed',
  'refund.created': 'refund.created',
  'refund.processed': 'refund.completed',
  'refund.failed': 'refund.failed',
  'subscription.activated': 'subscription.created',
  'subscription.charged': 'subscription.renewed',
  'subscription.cancelled': 'subscription.canceled',
  'subscription.halted': 'subscription.payment_failed',
  'subscription.pending': 'subscription.payment_failed',
};

export function mapRazorpayEventType(rzpType: string): WebhookEventType | null {
  return EVENT_TYPE_MAP[rzpType] ?? null;
}

export interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: Record<string, { entity: Record<string, unknown> }>;
  created_at: number;
}

export function mapRazorpayWebhookEvent(payload: RazorpayWebhookPayload): UnifiedWebhookEvent | null {
  const mappedType = mapRazorpayEventType(payload.event);
  if (!mappedType) return null;

  // Get the first entity from payload
  const firstKey = payload.contains?.[0];
  const data = firstKey ? payload.payload[firstKey]?.entity : payload.payload;

  return {
    id: `${payload.event}_${payload.created_at}`,
    provider: 'razorpay',
    type: mappedType,
    providerType: payload.event,
    data,
    createdAt: new Date(payload.created_at * 1000),
    _raw: payload,
  };
}
