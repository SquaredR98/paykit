import type { RequestOptions } from './common.js';

/**
 * Unified customer object.
 */
export interface UnifiedCustomer {
  id: string;
  providerId: string;
  provider: string;
  email?: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
  createdAt: Date;
  _raw: unknown;
}

/**
 * Parameters for creating a customer.
 */
export interface CreateCustomerParams extends RequestOptions {
  email?: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}

/**
 * Parameters for updating a customer.
 */
export interface UpdateCustomerParams extends RequestOptions {
  email?: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}
