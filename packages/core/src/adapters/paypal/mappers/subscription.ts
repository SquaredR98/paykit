import type { UnifiedSubscription, SubscriptionStatus, BillingInterval } from '../../../types/subscription.js';
import type { Subscription, BillingPlan } from '@paypal/paypal-server-sdk';
import { ZERO_DECIMAL_CURRENCIES } from '../constants.js';

/**
 * Map PayPal subscription status to unified status.
 *
 * The SDK's Subscription type doesn't declare `status`, but the PayPal REST API
 * does return it. We read it via `(sub as any).status`.
 */
const STATUS_MAP: Record<string, SubscriptionStatus> = {
  APPROVAL_PENDING: 'incomplete',
  APPROVED: 'incomplete',
  ACTIVE: 'active',
  SUSPENDED: 'paused',
  CANCELLED: 'canceled',
  EXPIRED: 'canceled',
};

function mapSubscriptionStatus(sub: Subscription): SubscriptionStatus {
  const rawStatus: string | undefined = (sub as any).status;
  if (rawStatus && STATUS_MAP[rawStatus]) {
    return STATUS_MAP[rawStatus];
  }
  return 'active';
}

const INTERVAL_MAP: Record<string, BillingInterval> = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
};

function amountToSmallestUnit(value: string, currencyCode: string): number {
  if (ZERO_DECIMAL_CURRENCIES.has(currencyCode.toUpperCase())) {
    return Math.round(Number(value));
  }
  return Math.round(Number(value) * 100);
}

export function mapPayPalSubscription(
  sub: Subscription,
  plan?: BillingPlan,
): UnifiedSubscription {
  // Extract billing info from plan if available
  const regularCycle = plan?.billingCycles?.find((c) => c.tenureType === 'REGULAR');
  const amount = regularCycle
    ? amountToSmallestUnit(
        regularCycle.pricingScheme?.fixedPrice?.value || '0',
        regularCycle.pricingScheme?.fixedPrice?.currencyCode || 'USD',
      )
    : sub.billingInfo?.lastPayment
      ? amountToSmallestUnit(
          sub.billingInfo.lastPayment.amount?.value || '0',
          sub.billingInfo.lastPayment.amount?.currencyCode || 'USD',
        )
      : 0;

  const currency = regularCycle
    ? (regularCycle.pricingScheme?.fixedPrice?.currencyCode?.toUpperCase() || 'USD')
    : (sub.billingInfo?.lastPayment?.amount?.currencyCode?.toUpperCase() ?? 'USD');

  const interval: BillingInterval = regularCycle
    ? (INTERVAL_MAP[regularCycle.frequency?.intervalUnit || 'MONTH'] ?? 'month')
    : 'month';

  const intervalCount = regularCycle?.frequency?.intervalCount ?? 1;

  const now = new Date();
  const nextBilling = sub.billingInfo?.nextBillingTime
    ? new Date(sub.billingInfo.nextBillingTime)
    : now;

  return {
    id: sub.id || '',
    providerId: sub.id || '',
    provider: 'paypal',
    customerId: sub.subscriber?.payerId ?? '',
    status: mapSubscriptionStatus(sub),
    amount,
    currency,
    interval,
    intervalCount,
    currentPeriodStart: new Date(sub.createTime || Date.now()),
    currentPeriodEnd: nextBilling,
    cancelAtPeriodEnd: false, // PayPal doesn't have this concept natively
    metadata: undefined,
    createdAt: new Date(sub.createTime || Date.now()),
    _raw: sub,
  };
}
