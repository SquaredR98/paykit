import type { UnifiedCustomer } from '../../../types/customer.js';

/**
 * PayPal Customer (Vault) API response.
 * Ref: https://developer.paypal.com/docs/api/customer-management/v1/
 */
export interface PayPalCustomer {
  id: string;
  merchant_customer_id?: string;
  email?: string;
  phone?: {
    phone_number?: {
      national_number?: string;
    };
  };
  name?: {
    given_name?: string;
    surname?: string;
  };
  create_time?: string;
}

export function mapPayPalCustomer(customer: PayPalCustomer): UnifiedCustomer {
  const fullName = customer.name
    ? [customer.name.given_name, customer.name.surname].filter(Boolean).join(' ') || undefined
    : undefined;

  return {
    id: customer.id,
    providerId: customer.id,
    provider: 'paypal',
    email: customer.email ?? undefined,
    name: fullName,
    phone: customer.phone?.phone_number?.national_number ?? undefined,
    metadata: customer.merchant_customer_id
      ? { merchant_customer_id: customer.merchant_customer_id }
      : undefined,
    createdAt: customer.create_time ? new Date(customer.create_time) : new Date(),
    _raw: customer,
  };
}
