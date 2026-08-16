import type { RequestOptions, ResponseMeta } from './common.js';

/**
 * Unified customer object — same shape regardless of provider.
 *
 * @example
 * const customer = await paykit.customers.create({ email: 'user@example.com' });
 * console.log(customer.id); // 'cus_xxx'
 */
export interface UnifiedCustomer {
  /** PayKit-normalized customer ID. */
  id: string;
  /** The original ID from the provider. */
  providerId: string;
  /** Provider name that created this customer. */
  provider: string;
  /** Customer email address. */
  email?: string;
  /** Customer full name. */
  name?: string;
  /** Customer phone number. */
  phone?: string;
  /** Arbitrary key-value metadata. */
  metadata?: Record<string, string>;
  /** Provider request ID for debugging. */
  requestId?: string;
  /** When the customer was created. */
  createdAt: Date;
  /** Raw provider response. */
  _raw: unknown;
  /** Operation metadata (timing, provider, retry info). Populated by the PayKit client. */
  _meta?: ResponseMeta;
}

/**
 * Parameters for creating a customer.
 *
 * @example
 * await paykit.customers.create({
 *   email: 'user@example.com',
 *   name: 'Jane Doe',
 *   metadata: { plan: 'pro' },
 * });
 */
export interface CreateCustomerParams extends RequestOptions {
  /** Customer email address. Must be a valid email format if provided. */
  email?: string;
  /** Customer full name. Max 100 characters. */
  name?: string;
  /** Customer phone number. */
  phone?: string;
  /** Arbitrary key-value metadata. */
  metadata?: Record<string, string>;
}

/**
 * Parameters for updating a customer.
 *
 * @example
 * await paykit.customers.update('cus_xxx', { name: 'Jane Smith' });
 */
export interface UpdateCustomerParams extends RequestOptions {
  /** Updated email address. */
  email?: string;
  /** Updated name. */
  name?: string;
  /** Updated phone number. */
  phone?: string;
  /** Updated metadata (merges with existing). */
  metadata?: Record<string, string>;
}
