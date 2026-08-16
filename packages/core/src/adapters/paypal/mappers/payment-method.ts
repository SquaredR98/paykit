import type { UnifiedPaymentMethod, PaymentMethodType } from '../../../types/payment-method.js';
import type { PaymentTokenResponse } from '@paypal/paypal-server-sdk';

const BRAND_MAP: Record<string, string> = {
  VISA: 'visa',
  MASTERCARD: 'mastercard',
  AMEX: 'amex',
  DISCOVER: 'discover',
  JCB: 'jcb',
  DINERS: 'diners',
  UNIONPAY: 'unionpay',
};

export function mapPayPalPaymentMethod(token: PaymentTokenResponse): UnifiedPaymentMethod {
  const card = token.paymentSource?.card;
  const paypal = token.paymentSource?.paypal;

  let type: PaymentMethodType = 'other';
  if (card) type = 'card';
  else if (paypal) type = 'wallet';
  else if (token.paymentSource?.venmo) type = 'wallet';

  let expiryMonth: number | undefined;
  let expiryYear: number | undefined;
  if (card?.expiry) {
    const [year, month] = card.expiry.split('-');
    expiryYear = Number(year);
    expiryMonth = Number(month);
  }

  return {
    id: token.id || '',
    providerId: token.id || '',
    provider: 'paypal',
    type,
    last4: card?.lastDigits ?? undefined,
    brand: card?.brand ? (BRAND_MAP[card.brand] ?? card.brand.toLowerCase()) : undefined,
    expiryMonth,
    expiryYear,
    customerId: token.customer?.id ?? undefined,
    metadata: undefined,
    createdAt: new Date(),
    _raw: token,
  };
}
