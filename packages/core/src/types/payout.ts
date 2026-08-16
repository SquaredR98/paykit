import type { RequestOptions, ResponseMeta } from './common.js';

/**
 * Normalized payout status across all providers.
 */
export type PayoutStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';

/**
 * Unified payout object — same shape regardless of provider.
 *
 * @example
 * const payout = await paykit.payouts.create({
 *   amount: 100000,
 *   currency: 'USD',
 *   destination: 'ba_xxx',
 * });
 */
export interface UnifiedPayout {
  /** PayKit-normalized payout ID. */
  id: string;
  /** The original ID from the provider. */
  providerId: string;
  /** Provider name. */
  provider: string;
  /** Payout amount in smallest currency unit. */
  amount: number;
  /** ISO 4217 currency code. */
  currency: string;
  /** Current status of the payout. */
  status: PayoutStatus;
  /** Destination (bank account, card, etc.) for the payout. */
  destination?: string;
  /** Reason for payout failure, if applicable. */
  failureReason?: string;
  /** Arbitrary key-value metadata. */
  metadata?: Record<string, string>;
  /** When the payout was created. */
  createdAt: Date;
  /** Raw provider response. */
  _raw: unknown;
  /** Operation metadata (timing, provider, retry info). Populated by the PayKit client. */
  _meta?: ResponseMeta;
}

/**
 * Parameters for creating a payout.
 *
 * @example
 * await paykit.payouts.create({
 *   amount: 100000,        // $1,000.00
 *   currency: 'USD',
 *   destination: 'ba_xxx', // bank account ID
 * });
 */
export interface CreatePayoutParams extends RequestOptions {
  /** Amount in smallest currency unit. */
  amount: number;
  /** ISO 4217 currency code. */
  currency: string;
  /** Destination ID (bank account, card, etc.). */
  destination: string;
  /** Arbitrary key-value metadata. */
  metadata?: Record<string, string>;
}
