import type Stripe from 'stripe';
import type { UnifiedCharge, ChargeStatus } from '../../../types/charge.js';
import type { PaymentMethodType } from '../../../types/payment-method.js';

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

const PM_TYPE_MAP: Record<string, PaymentMethodType> = {
  card: 'card',
  us_bank_account: 'bank_transfer',
  sepa_debit: 'direct_debit',
  bacs_debit: 'direct_debit',
  ideal: 'wallet',
  bancontact: 'wallet',
  link: 'wallet',
  cashapp: 'wallet',
  alipay: 'wallet',
  wechat_pay: 'wallet',
};

function mapStripePaymentMethodType(type: string): PaymentMethodType {
  return PM_TYPE_MAP[type] ?? 'other';
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
      ? typeof pi.payment_method === 'string'
        ? { type: 'card', last4: undefined, brand: undefined }
        : {
            type: mapStripePaymentMethodType(pi.payment_method.type),
            last4: pi.payment_method.card?.last4,
            brand: pi.payment_method.card?.brand,
          }
      : undefined,
    metadata: (pi.metadata as Record<string, string>) ?? undefined,
    createdAt: new Date(pi.created * 1000),
    updatedAt: new Date(pi.created * 1000),
    _raw: pi,
  };
}
