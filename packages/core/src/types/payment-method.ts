import type { RequestOptions } from './common.js';

/**
 * Supported payment method types.
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
 * Summary of a payment method (embedded in charges, etc.)
 */
export interface PaymentMethodSummary {
  type: PaymentMethodType;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

/**
 * Full payment method object.
 */
export interface UnifiedPaymentMethod {
  id: string;
  providerId: string;
  provider: string;
  type: PaymentMethodType;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  customerId?: string;
  metadata?: Record<string, string>;
  createdAt: Date;
  _raw: unknown;
}

/**
 * Parameters for creating/tokenizing a payment method.
 */
export interface CreatePaymentMethodParams extends RequestOptions {
  type: PaymentMethodType;
  token?: string;
  customerId?: string;
  metadata?: Record<string, string>;
}
