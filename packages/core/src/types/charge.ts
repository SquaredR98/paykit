import type { PaymentMethodSummary } from './payment-method.js';
import type { RequestOptions } from './common.js';

/**
 * Normalized charge status across all providers.
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
 */
export interface UnifiedCharge {
  id: string;
  providerId: string;
  provider: string;
  amount: number;
  currency: string;
  status: ChargeStatus;
  description?: string;
  /** Provider-specific client secret for frontend confirmation (e.g. Stripe PaymentIntent client_secret). */
  clientSecret?: string;
  customer?: { id: string; email?: string };
  paymentMethod?: PaymentMethodSummary;
  metadata?: Record<string, string>;
  redirectUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  _raw: unknown;
}

/**
 * Parameters for creating a charge.
 */
export interface CreateChargeParams extends RequestOptions {
  amount: number;
  currency: string;
  source?: string;
  customer?: string;
  description?: string;
  metadata?: Record<string, string>;
  capture?: boolean;
  _provider?: string;
}

/**
 * Parameters for capturing an authorized charge.
 */
export interface CaptureParams extends RequestOptions {
  amount?: number;
}
