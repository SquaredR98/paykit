import type { UnifiedSubscription, SubscriptionStatus } from '../../../types/subscription.js';

const SUB_STATUS_MAP: Record<string, SubscriptionStatus> = {
  created: 'incomplete',
  authenticated: 'incomplete',
  active: 'active',
  pending: 'past_due',
  halted: 'past_due',
  cancelled: 'canceled',
  completed: 'canceled',
  expired: 'canceled',
};

export function mapSubscriptionStatus(status: string): SubscriptionStatus {
  return SUB_STATUS_MAP[status] ?? 'active';
}

export function mapRazorpaySubscription(sub: any): UnifiedSubscription {
  return {
    id: sub.id,
    providerId: sub.id,
    provider: 'razorpay',
    customerId: sub.customer_id ?? '',
    status: mapSubscriptionStatus(sub.status),
    amount: 0, // Razorpay subscriptions use plan_id — amount is in the plan
    currency: 'INR',
    interval: 'month', // Default; actual interval is on the plan object
    intervalCount: 1,
    currentPeriodStart: sub.current_start ? new Date(sub.current_start * 1000) : new Date(sub.created_at * 1000),
    currentPeriodEnd: sub.current_end ? new Date(sub.current_end * 1000) : new Date(sub.created_at * 1000),
    cancelAtPeriodEnd: false,
    metadata: (Array.isArray(sub.notes) ? undefined : sub.notes) ?? undefined,
    createdAt: new Date(sub.created_at * 1000),
    _raw: sub,
  };
}
