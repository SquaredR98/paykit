import type Stripe from 'stripe';
import type { UnifiedCharge, ChargeStatus } from '@squaredr/paykit';

const STATUS_MAP: Record<string, ChargeStatus> = {
  requires_payment_method: 'pending',
  requires_confirmation: 'pending',
  requires_action: 'requires_action',
  processing: 'processing',
  succeeded: 'succeeded',
  canceled: 'canceled',
  requires_capture: 'requires_action',
};

export function mapChargeStatus(stripeStatus: string): ChargeStatus {
  return STATUS_MAP[stripeStatus] ?? 'pending';
}

export function mapPaymentIntentToCharge(pi: Stripe.PaymentIntent): UnifiedCharge {
  return {
    id: pi.id,
    providerId: pi.id,
    provider: 'stripe',
    amount: pi.amount,
    currency: pi.currency.toUpperCase(),
    status: mapChargeStatus(pi.status),
    description: pi.description ?? undefined,
    clientSecret: pi.client_secret ?? undefined,
    customer: pi.customer
      ? { id: typeof pi.customer === 'string' ? pi.customer : pi.customer.id }
      : undefined,
    paymentMethod: pi.payment_method
      ? {
          type: 'card',
          last4: undefined,
          brand: undefined,
        }
      : undefined,
    metadata: (pi.metadata as Record<string, string>) ?? undefined,
    createdAt: new Date(pi.created * 1000),
    updatedAt: new Date(pi.created * 1000),
    _raw: pi,
  };
}
