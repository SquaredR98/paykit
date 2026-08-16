import type { RequestOptions, ResponseMeta } from './common.js';

/**
 * Normalized subscription status across all providers.
 */
export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'paused'
  | 'trialing'
  | 'unpaid'
  | 'incomplete'
  | 'expired';

/**
 * Billing interval for subscriptions.
 *
 * @example
 * // Monthly billing
 * { interval: 'month', intervalCount: 1 }
 *
 * // Quarterly billing
 * { interval: 'month', intervalCount: 3 }
 */
export type BillingInterval = 'day' | 'week' | 'month' | 'year';

/**
 * Unified subscription object — same shape regardless of provider.
 *
 * @example
 * const sub = await paykit.subscriptions.create({
 *   customer: 'cus_xxx',
 *   amount: 999,
 *   currency: 'USD',
 *   interval: 'month',
 * });
 * console.log(sub.status); // 'active'
 */
export interface UnifiedSubscription {
  /** PayKit-normalized subscription ID. */
  id: string;
  /** The original ID from the provider. */
  providerId: string;
  /** Provider name that created this subscription. */
  provider: string;
  /** Customer ID this subscription belongs to. */
  customerId: string;
  /** Current status of the subscription. */
  status: SubscriptionStatus;
  /** Recurring amount in smallest currency unit. */
  amount: number;
  /** ISO 4217 currency code. */
  currency: string;
  /** Billing interval (day, week, month, year). */
  interval: BillingInterval;
  /** Number of intervals between billings (e.g. 3 with `'month'` = quarterly). */
  intervalCount: number;
  /** Start of the current billing period. */
  currentPeriodStart: Date;
  /** End of the current billing period. */
  currentPeriodEnd: Date;
  /** Whether the subscription will cancel at the end of the current period. */
  cancelAtPeriodEnd: boolean;
  /** Arbitrary key-value metadata. */
  metadata?: Record<string, string>;
  /** Provider request ID for debugging. */
  requestId?: string;
  /** When the subscription was created. */
  createdAt: Date;
  /** Raw provider response. */
  _raw: unknown;
  /** Operation metadata (timing, provider, retry info). Populated by the PayKit client. */
  _meta?: ResponseMeta;
}

/**
 * Parameters for creating a subscription.
 *
 * @example
 * await paykit.subscriptions.create({
 *   customer: 'cus_xxx',
 *   amount: 999,          // $9.99 in cents
 *   currency: 'USD',
 *   interval: 'month',
 *   intervalCount: 1,     // optional, defaults to 1
 * });
 */
export interface CreateSubscriptionParams extends RequestOptions {
  /** Customer ID to subscribe. Required. */
  customer: string;
  /** Recurring amount in smallest currency unit. Must be a positive integer. */
  amount: number;
  /** ISO 4217 currency code. Required. */
  currency: string;
  /** Billing interval. Must be `'day'`, `'week'`, `'month'`, or `'year'`. */
  interval: BillingInterval;
  /** Number of intervals between billings. Defaults to 1. Must be a positive integer. */
  intervalCount?: number;
  /** Number of days for a free trial before billing starts. */
  trialDays?: number;
  /** Arbitrary key-value metadata. */
  metadata?: Record<string, string>;
}

/**
 * Parameters for updating a subscription.
 *
 * @example
 * await paykit.subscriptions.update('sub_xxx', { amount: 1999 });
 */
export interface UpdateSubscriptionParams extends RequestOptions {
  /** New recurring amount in smallest currency unit. */
  amount?: number;
  /** Updated metadata. */
  metadata?: Record<string, string>;
}

/**
 * Parameters for canceling a subscription.
 *
 * @example
 * // Cancel immediately
 * await paykit.subscriptions.cancel('sub_xxx');
 *
 * // Cancel at end of billing period
 * await paykit.subscriptions.cancel('sub_xxx', { cancelAtPeriodEnd: true });
 */
export interface CancelSubscriptionParams extends RequestOptions {
  /** If `true`, the subscription remains active until the current period ends. Default: `false` (immediate cancel). */
  cancelAtPeriodEnd?: boolean;
}
