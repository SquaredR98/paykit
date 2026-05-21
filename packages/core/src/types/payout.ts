import type { RequestOptions } from './common.js';

/**
 * Normalized payout status.
 */
export type PayoutStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';

/**
 * Unified payout object.
 */
export interface UnifiedPayout {
  id: string;
  providerId: string;
  provider: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  destination?: string;
  metadata?: Record<string, string>;
  createdAt: Date;
  _raw: unknown;
}

/**
 * Parameters for creating a payout.
 */
export interface CreatePayoutParams extends RequestOptions {
  amount: number;
  currency: string;
  destination: string;
  metadata?: Record<string, string>;
}
