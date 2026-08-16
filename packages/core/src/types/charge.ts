import type { PaymentMethodSummary } from './payment-method.js';
import type { RequestOptions, ResponseMeta } from './common.js';

/**
 * Normalized charge status across all providers.
 *
 * @example
 * if (charge.status === 'succeeded') {
 *   // Payment complete
 * } else if (charge.status === 'requires_action') {
 *   // Redirect user to charge.redirectUrl or use charge.clientSecret
 * }
 */
export type ChargeStatus =
  | 'pending'
  | 'requires_action'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded'
  | 'partially_refunded';

/**
 * Unified charge object — same shape regardless of provider.
 *
 * All amounts are in the smallest currency unit (e.g. cents for USD, paise for INR).
 *
 * @example
 * const charge = await paykit.charges.create({ amount: 5000, currency: 'USD' });
 * console.log(charge.id);       // 'ch_xxx'
 * console.log(charge.status);   // 'succeeded'
 * console.log(charge.provider); // 'stripe'
 */
export interface UnifiedCharge {
  /** PayKit-normalized charge ID. */
  id: string;
  /** The original ID from the provider (e.g. Stripe's `pi_xxx`). */
  providerId: string;
  /** Provider name that processed this charge. */
  provider: string;
  /** Amount in smallest currency unit (e.g. 5000 = $50.00 USD). */
  amount: number;
  /** ISO 4217 currency code (e.g. `'USD'`, `'INR'`). */
  currency: string;
  /** Current status of the charge. */
  status: ChargeStatus;
  /** Optional description attached to the charge. */
  description?: string;
  /** Provider-specific client secret for frontend confirmation (e.g. Stripe PaymentIntent client_secret). */
  clientSecret?: string;
  /** Customer associated with this charge, if any. */
  customer?: { id: string; email?: string };
  /** Payment method used for this charge. */
  paymentMethod?: PaymentMethodSummary;
  /** Total amount refunded in smallest currency unit. */
  refundedAmount?: number;
  /** Arbitrary key-value metadata attached to the charge. */
  metadata?: Record<string, string>;
  /** URL to redirect the user to for payment completion (3DS, bank redirect, etc.). */
  redirectUrl?: string;
  /** Provider request ID for debugging and support tickets. */
  requestId?: string;
  /** When the charge was created. */
  createdAt: Date;
  /** When the charge was last updated. */
  updatedAt: Date;
  /** Raw provider response — use for debugging or accessing provider-specific fields. */
  _raw: unknown;
  /** Operation metadata (timing, provider, retry info). Populated by the PayKit client. */
  _meta?: ResponseMeta;
}

/**
 * Parameters for creating a charge.
 *
 * @example
 * await paykit.charges.create({
 *   amount: 5000,        // $50.00 in cents
 *   currency: 'USD',
 *   description: 'Order #1234',
 *   metadata: { orderId: '1234' },
 * });
 */
export interface CreateChargeParams extends RequestOptions {
  /** Amount in smallest currency unit (e.g. 5000 = $50.00 USD). Must be a positive integer. */
  amount: number;
  /** ISO 4217 currency code (e.g. `'USD'`, `'INR'`). */
  currency: string;
  /** Payment source token or ID (provider-specific). */
  source?: string;
  /** Customer ID to associate with this charge. */
  customer?: string;
  /** Human-readable description for the charge. */
  description?: string;
  /** Arbitrary key-value metadata. */
  metadata?: Record<string, string>;
  /** If `false`, authorize only without capturing. Default: `true`. */
  capture?: boolean;
  /** Explicitly route this charge to a specific provider (used with PaymentRouter). */
  _provider?: string;
}

/**
 * Parameters for capturing an authorized charge.
 *
 * @example
 * // Capture the full amount
 * await paykit.charges.capture('ch_xxx');
 *
 * // Partial capture
 * await paykit.charges.capture('ch_xxx', { amount: 2500 });
 */
export interface CaptureParams extends RequestOptions {
  /** Amount to capture. If omitted, captures the full authorized amount. */
  amount?: number;
}
