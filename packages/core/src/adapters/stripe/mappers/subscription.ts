import type Stripe from 'stripe';
import type { UnifiedSubscription, SubscriptionStatus, BillingInterval } from '../../../types/subscription.js';

const SUB_STATUS_MAP: Record<string, SubscriptionStatus> = {
  active: 'active',
  past_due: 'past_due',
  canceled: 'canceled',
  paused: 'paused',
  trialing: 'trialing',
  unpaid: 'unpaid',
  incomplete: 'incomplete',
  incomplete_expired: 'incomplete',
};

const INTERVAL_MAP: Record<string, BillingInterval> = {
  day: 'day',
  week: 'week',
  month: 'month',
  year: 'year',
};

export function mapStripeSubscription(sub: Stripe.Subscription): UnifiedSubscription {
  const item = sub.items.data[0];
  const price = item?.price;

  return {
    id: sub.id,
    providerId: sub.id,
    provider: 'stripe',
    customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    status: SUB_STATUS_MAP[sub.status] ?? 'active',
    amount: price?.unit_amount ?? 0,
    currency: (price?.currency ?? 'usd').toUpperCase(),
    interval: INTERVAL_MAP[price?.recurring?.interval ?? 'month'] ?? 'month',
    intervalCount: price?.recurring?.interval_count ?? 1,
    currentPeriodStart: new Date(sub.current_period_start * 1000),
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    metadata: (sub.metadata as Record<string, string>) ?? undefined,
    createdAt: new Date(sub.created * 1000),
    _raw: sub,
  };
}
