import type { UnifiedSubscription, SubscriptionStatus, BillingInterval } from '../../../types/subscription.js';
import { PaymentError } from '../../../errors.js';

const SUB_STATUS_MAP: Record<string, SubscriptionStatus> = {
  created: 'incomplete',
  authenticated: 'incomplete',
  active: 'active',
  pending: 'past_due',
  halted: 'past_due',
  cancelled: 'canceled',
  completed: 'canceled',
  expired: 'expired',
};

const PERIOD_TO_INTERVAL: Record<string, BillingInterval> = {
  daily: 'day',
  weekly: 'week',
  monthly: 'month',
  yearly: 'year',
};

export function mapSubscriptionStatus(status: string): SubscriptionStatus {
  return SUB_STATUS_MAP[status] ?? 'active';
}

export function mapRazorpaySubscription(
  sub: any,
  plan?: { item?: { amount?: string | number; currency?: string }; period?: string; interval?: number },
): UnifiedSubscription {
  if (!sub.customer_id) {
    throw new PaymentError({
      code: 'processing_error',
      message: 'Subscription missing customer_id',
      provider: 'razorpay',
      isRetryable: false,
    });
  }

  const rawAmount = plan?.item?.amount;
  const amount = typeof rawAmount === 'string' ? parseInt(rawAmount, 10) || 0 : rawAmount ?? 0;
  return {
    id: sub.id,
    providerId: sub.id,
    provider: 'razorpay',
    customerId: sub.customer_id,
    status: mapSubscriptionStatus(sub.status),
    amount,
    currency: (plan?.item?.currency ?? 'INR').toUpperCase(),
    interval: PERIOD_TO_INTERVAL[plan?.period ?? ''] ?? 'month',
    intervalCount: plan?.interval ?? 1,
    currentPeriodStart: sub.current_start ? new Date(sub.current_start * 1000) : new Date(sub.created_at * 1000),
    currentPeriodEnd: sub.current_end ? new Date(sub.current_end * 1000) : new Date(sub.created_at * 1000),
    cancelAtPeriodEnd: false,
    metadata: (Array.isArray(sub.notes) ? undefined : sub.notes) ?? undefined,
    createdAt: new Date(sub.created_at * 1000),
    _raw: sub,
  };
}
