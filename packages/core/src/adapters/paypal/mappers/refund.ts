import type { UnifiedRefund, RefundStatus } from '../../../types/refund.js';
import type { Refund } from '@paypal/paypal-server-sdk';
import { ZERO_DECIMAL_CURRENCIES } from '../constants.js';

/**
 * PayPal refund statuses:
 * - CANCELLED
 * - FAILED
 * - PENDING
 * - COMPLETED
 */
const REFUND_STATUS_MAP: Record<string, RefundStatus> = {
  COMPLETED: 'succeeded',
  PENDING: 'pending',
  FAILED: 'failed',
  CANCELLED: 'canceled',
};

function amountToSmallestUnit(value: string, currencyCode: string): number {
  if (ZERO_DECIMAL_CURRENCIES.has(currencyCode.toUpperCase())) {
    return Math.round(Number(value));
  }
  return Math.round(Number(value) * 100);
}

export function mapPayPalRefund(refund: Refund, captureId?: string): UnifiedRefund {
  return {
    id: refund.id || '',
    providerId: refund.id || '',
    provider: 'paypal',
    chargeId: captureId ?? '',
    amount: refund.amount?.value
      ? amountToSmallestUnit(refund.amount.value, refund.amount.currencyCode || 'USD')
      : 0,
    currency: refund.amount?.currencyCode?.toUpperCase() ?? 'USD',
    status: REFUND_STATUS_MAP[refund.status || 'PENDING'] ?? 'pending',
    reason: refund.noteToPayer ?? undefined,
    metadata: undefined,
    createdAt: new Date(refund.createTime || Date.now()),
    _raw: refund,
  };
}
