import type Stripe from 'stripe';
import type { UnifiedRefund, RefundStatus } from '@squaredr/paykit';

const REFUND_STATUS_MAP: Record<string, RefundStatus> = {
  succeeded: 'succeeded',
  pending: 'pending',
  failed: 'failed',
  canceled: 'canceled',
  requires_action: 'pending',
};

export function mapRefundStatus(stripeStatus: string): RefundStatus {
  return REFUND_STATUS_MAP[stripeStatus] ?? 'pending';
}

export function mapStripeRefund(refund: Stripe.Refund): UnifiedRefund {
  return {
    id: refund.id,
    providerId: refund.id,
    provider: 'stripe',
    chargeId: typeof refund.payment_intent === 'string'
      ? refund.payment_intent
      : refund.payment_intent?.id ?? '',
    amount: refund.amount,
    currency: refund.currency.toUpperCase(),
    status: mapRefundStatus(refund.status ?? 'pending'),
    reason: refund.reason ?? undefined,
    metadata: (refund.metadata as Record<string, string>) ?? undefined,
    createdAt: new Date(refund.created * 1000),
    _raw: refund,
  };
}
