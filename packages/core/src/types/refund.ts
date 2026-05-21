import type { RequestOptions } from './common.js';

/**
 * Normalized refund status.
 */
export type RefundStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';

/**
 * Unified refund object.
 */
export interface UnifiedRefund {
  id: string;
  providerId: string;
  provider: string;
  chargeId: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  reason?: string;
  metadata?: Record<string, string>;
  createdAt: Date;
  _raw: unknown;
}

/**
 * Parameters for creating a refund.
 */
export interface CreateRefundParams extends RequestOptions {
  chargeId: string;
  amount?: number;
  reason?: string;
  metadata?: Record<string, string>;
}
