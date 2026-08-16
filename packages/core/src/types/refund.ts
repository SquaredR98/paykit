import type { RequestOptions, ResponseMeta } from './common.js';

/**
 * Normalized refund status across all providers.
 */
export type RefundStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';

/**
 * Unified refund object — same shape regardless of provider.
 *
 * @example
 * const refund = await paykit.refunds.create({ chargeId: 'ch_xxx' });
 * console.log(refund.status); // 'pending' | 'succeeded'
 */
export interface UnifiedRefund {
  /** PayKit-normalized refund ID. */
  id: string;
  /** The original ID from the provider. */
  providerId: string;
  /** Provider name that processed this refund. */
  provider: string;
  /** ID of the charge being refunded. */
  chargeId: string;
  /** Refund amount in smallest currency unit. */
  amount: number;
  /** ISO 4217 currency code. */
  currency: string;
  /** Current status of the refund. */
  status: RefundStatus;
  /** Reason for the refund, if provided. */
  reason?: string;
  /** Arbitrary key-value metadata. */
  metadata?: Record<string, string>;
  /** Provider request ID for debugging. */
  requestId?: string;
  /** When the refund was created. */
  createdAt: Date;
  /** Raw provider response. */
  _raw: unknown;
  /** Operation metadata (timing, provider, retry info). Populated by the PayKit client. */
  _meta?: ResponseMeta;
}

/**
 * Parameters for creating a refund.
 *
 * @example
 * // Full refund
 * await paykit.refunds.create({ chargeId: 'ch_xxx' });
 *
 * // Partial refund
 * await paykit.refunds.create({ chargeId: 'ch_xxx', amount: 2500 });
 */
export interface CreateRefundParams extends RequestOptions {
  /** ID of the charge to refund. Required. */
  chargeId: string;
  /** Amount to refund in smallest currency unit. If omitted, refunds the full amount. */
  amount?: number;
  /** Reason for the refund. */
  reason?: string;
  /** Arbitrary key-value metadata. */
  metadata?: Record<string, string>;
}
