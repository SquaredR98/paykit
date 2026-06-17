/**
 * Normalized webhook event types.
 */
export type WebhookEventType =
  | 'charge.succeeded'
  | 'charge.failed'
  | 'charge.pending'
  | 'charge.refunded'
  | 'charge.disputed'
  | 'refund.created'
  | 'refund.completed'
  | 'refund.updated'
  | 'refund.failed'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.renewed'
  | 'subscription.canceled'
  | 'subscription.payment_failed'
  | 'customer.created'
  | 'customer.updated'
  | 'payout.completed'
  | 'payout.failed';

/**
 * Webhook event type constants for runtime use.
 * Avoids typos when comparing event types.
 *
 * @example
 * ```ts
 * if (event.type === WEBHOOK_EVENTS.CHARGE_SUCCEEDED) { ... }
 * ```
 */
export const WEBHOOK_EVENTS = {
  CHARGE_SUCCEEDED: 'charge.succeeded',
  CHARGE_FAILED: 'charge.failed',
  CHARGE_PENDING: 'charge.pending',
  CHARGE_REFUNDED: 'charge.refunded',
  CHARGE_DISPUTED: 'charge.disputed',
  REFUND_CREATED: 'refund.created',
  REFUND_COMPLETED: 'refund.completed',
  REFUND_UPDATED: 'refund.updated',
  REFUND_FAILED: 'refund.failed',
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_RENEWED: 'subscription.renewed',
  SUBSCRIPTION_CANCELED: 'subscription.canceled',
  SUBSCRIPTION_PAYMENT_FAILED: 'subscription.payment_failed',
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
  PAYOUT_COMPLETED: 'payout.completed',
  PAYOUT_FAILED: 'payout.failed',
} as const satisfies Record<string, WebhookEventType>;

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
