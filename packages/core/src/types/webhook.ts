/**
 * Normalized webhook event types.
 */
export type WebhookEventType =
  | 'charge.succeeded'
  | 'charge.failed'
  | 'charge.pending'
  | 'charge.refunded'
  | 'charge.captured'
  | 'charge.canceled'
  | 'charge.disputed'
  | 'charge.chargeback_created'
  | 'charge.dispute_resolved'
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
  CHARGE_CAPTURED: 'charge.captured',
  CHARGE_CANCELED: 'charge.canceled',
  CHARGE_DISPUTED: 'charge.disputed',
  CHARGE_CHARGEBACK_CREATED: 'charge.chargeback_created',
  CHARGE_DISPUTE_RESOLVED: 'charge.dispute_resolved',
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
 * Unified webhook event object — normalized from any provider's webhook payload.
 *
 * @example
 * const event = paykit.webhooks.construct({ payload, signature, secret });
 * if (event.type === WEBHOOK_EVENTS.CHARGE_SUCCEEDED) {
 *   console.log('Payment received:', event.id);
 * }
 */
export interface UnifiedWebhookEvent {
  /** Unique event ID from the provider. */
  id: string;
  /** Provider that sent this webhook. */
  provider: string;
  /** Normalized event type (e.g. `'charge.succeeded'`). */
  type: WebhookEventType;
  /** Original event type string from the provider (e.g. Stripe's `'payment_intent.succeeded'`). */
  providerType: string;
  /** Event payload data (shape varies by event type). */
  data: unknown;
  /** When the event was created. */
  createdAt: Date;
  /** Raw provider webhook payload. */
  _raw: unknown;
}
