import type { RequestOptions, ResponseMeta } from './common.js';

/**
 * Supported payment method types across all providers.
 */
export type PaymentMethodType =
  | 'card'
  | 'upi'
  | 'netbanking'
  | 'wallet'
  | 'bank_transfer'
  | 'direct_debit'
  | 'mobile_money'
  | 'bnpl'
  | 'qr_code'
  | 'other';

/**
 * Summary of a payment method (embedded in charges, subscriptions, etc.).
 */
export interface PaymentMethodSummary {
  /** Type of payment method. */
  type: PaymentMethodType;
  /** Last 4 digits of the card number (cards only). */
  last4?: string;
  /** Card brand (e.g. `'visa'`, `'mastercard'`). */
  brand?: string;
  /** Card expiry month (1-12). */
  expiryMonth?: number;
  /** Card expiry year (4-digit). */
  expiryYear?: number;
}

/**
 * Full payment method object — same shape regardless of provider.
 *
 * @example
 * const methods = await paykit.paymentMethods.list('cus_xxx');
 * for (const pm of methods.data) {
 *   console.log(`${pm.brand} **** ${pm.last4}`);
 * }
 */
export interface UnifiedPaymentMethod {
  /** PayKit-normalized payment method ID. */
  id: string;
  /** The original ID from the provider. */
  providerId: string;
  /** Provider name. */
  provider: string;
  /** Type of payment method. */
  type: PaymentMethodType;
  /** Last 4 digits (cards only). */
  last4?: string;
  /** Card brand (cards only). */
  brand?: string;
  /** Card expiry month (cards only). */
  expiryMonth?: number;
  /** Card expiry year (cards only). */
  expiryYear?: number;
  /** Customer this payment method is attached to. */
  customerId?: string;
  /** Arbitrary key-value metadata. */
  metadata?: Record<string, string>;
  /** When the payment method was created. */
  createdAt: Date;
  /** Raw provider response. */
  _raw: unknown;
  /** Operation metadata (timing, provider, retry info). Populated by the PayKit client. */
  _meta?: ResponseMeta;
}

/**
 * Parameters for creating/tokenizing a payment method.
 *
 * @example
 * const pm = await paykit.paymentMethods.create({
 *   type: 'card',
 *   token: 'tok_visa',
 *   customerId: 'cus_xxx',
 * });
 */
export interface CreatePaymentMethodParams extends RequestOptions {
  /** Type of payment method to create. */
  type: PaymentMethodType;
  /** Provider-specific token (e.g. from Stripe.js or Razorpay checkout). */
  token?: string;
  /** Customer ID to attach this payment method to. */
  customerId?: string;
  /** Arbitrary key-value metadata. */
  metadata?: Record<string, string>;
}
