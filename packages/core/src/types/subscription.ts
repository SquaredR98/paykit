import type { RequestOptions } from './common.js';

/**
 * Normalized subscription status.
 */
export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'paused'
  | 'trialing'
  | 'unpaid'
  | 'incomplete';

/**
 * Billing interval for subscriptions.
 */
export type BillingInterval = 'day' | 'week' | 'month' | 'year';

/**
 * Unified subscription object.
 */
export interface UnifiedSubscription {
  id: string;
  providerId: string;
  provider: string;
  customerId: string;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  interval: BillingInterval;
  intervalCount: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  metadata?: Record<string, string>;
  createdAt: Date;
  _raw: unknown;
}

/**
 * Parameters for creating a subscription.
 */
export interface CreateSubscriptionParams extends RequestOptions {
  customer: string;
  amount: number;
  currency: string;
  interval: BillingInterval;
  intervalCount?: number;
  metadata?: Record<string, string>;
}

/**
 * Parameters for updating a subscription.
 */
export interface UpdateSubscriptionParams extends RequestOptions {
  amount?: number;
  metadata?: Record<string, string>;
}

/**
 * Parameters for canceling a subscription.
 */
export interface CancelSubscriptionParams extends RequestOptions {
  cancelAtPeriodEnd?: boolean;
}
