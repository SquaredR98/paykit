import type Stripe from 'stripe';
import type { UnifiedCustomer } from '../../../types/customer.js';

export function mapStripeCustomer(customer: Stripe.Customer): UnifiedCustomer {
  return {
    id: customer.id,
    providerId: customer.id,
    provider: 'stripe',
    email: customer.email ?? undefined,
    name: customer.name ?? undefined,
    phone: customer.phone ?? undefined,
    metadata: (customer.metadata as Record<string, string>) ?? undefined,
    createdAt: new Date(customer.created * 1000),
    _raw: customer,
  };
}
