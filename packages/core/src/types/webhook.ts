/**
 * Normalized webhook event types.
 */
export type WebhookEventType =
  | 'charge.succeeded'
  | 'charge.failed'
  | 'charge.refunded'
  | 'charge.disputed'
  | 'refund.created'
  | 'refund.completed'
  | 'refund.failed'
  | 'subscription.created'
  | 'subscription.renewed'
  | 'subscription.canceled'
  | 'subscription.payment_failed'
  | 'customer.created'
  | 'customer.updated'
  | 'payout.completed'
  | 'payout.failed';

/**
 * Unified webhook event object.
 */
export interface UnifiedWebhookEvent {
  id: string;
  provider: string;
  type: WebhookEventType;
  providerType: string;
  data: unknown;
  createdAt: Date;
  _raw: unknown;
}
