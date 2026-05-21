import type { UnifiedCustomer } from '@squaredr/paykit';

export function mapRazorpayCustomer(customer: any): UnifiedCustomer {
  return {
    id: customer.id,
    providerId: customer.id,
    provider: 'razorpay',
    email: customer.email ?? undefined,
    name: customer.name ?? undefined,
    phone: customer.contact ? String(customer.contact) : undefined,
    metadata: customer.notes ?? undefined,
    createdAt: new Date(customer.created_at * 1000),
    _raw: customer,
  };
}
