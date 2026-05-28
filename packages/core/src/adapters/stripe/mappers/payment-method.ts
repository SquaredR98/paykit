import type Stripe from 'stripe';
import type { UnifiedPaymentMethod, PaymentMethodType } from '../../../types/payment-method.js';

const TYPE_MAP: Record<string, PaymentMethodType> = {
  card: 'card',
  upi: 'upi',
  bank_transfer: 'bank_transfer',
  us_bank_account: 'direct_debit',
  sepa_debit: 'direct_debit',
  klarna: 'bnpl',
  afterpay_clearpay: 'bnpl',
  affirm: 'bnpl',
};

export function mapStripePaymentMethod(pm: Stripe.PaymentMethod): UnifiedPaymentMethod {
  return {
    id: pm.id,
    providerId: pm.id,
    provider: 'stripe',
    type: TYPE_MAP[pm.type] ?? 'other',
    last4: pm.card?.last4 ?? undefined,
    brand: pm.card?.brand ?? undefined,
    expiryMonth: pm.card?.exp_month ?? undefined,
    expiryYear: pm.card?.exp_year ?? undefined,
    customerId: typeof pm.customer === 'string'
      ? pm.customer
      : pm.customer?.id ?? undefined,
    metadata: (pm.metadata as Record<string, string>) ?? undefined,
    createdAt: new Date(pm.created * 1000),
    _raw: pm,
  };
}
