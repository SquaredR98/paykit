import type { UnifiedRefund, RefundStatus } from '@squaredr/paykit';

const REFUND_STATUS_MAP: Record<string, RefundStatus> = {
  pending: 'pending',
  processed: 'succeeded',
  failed: 'failed',
};

export function mapRefundStatus(status: string): RefundStatus {
  return REFUND_STATUS_MAP[status] ?? 'pending';
}

export function mapRazorpayRefund(refund: any): UnifiedRefund {
  return {
    id: refund.id,
    providerId: refund.id,
    provider: 'razorpay',
    chargeId: refund.payment_id ?? '',
    amount: Number(refund.amount),
    currency: String(refund.currency).toUpperCase(),
    status: mapRefundStatus(refund.status ?? 'pending'),
    reason: undefined,
    metadata: refund.notes ?? undefined,
    createdAt: new Date(refund.created_at * 1000),
    _raw: refund,
  };
}
