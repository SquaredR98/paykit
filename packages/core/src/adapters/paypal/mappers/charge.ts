import type { UnifiedCharge, ChargeStatus } from '../../../types/charge.js';
import type { Order } from '@paypal/paypal-server-sdk';
import { ZERO_DECIMAL_CURRENCIES } from '../constants.js';

/**
 * PayPal order status → unified charge status.
 *
 * PayPal order statuses:
 * - CREATED: order created, not yet approved
 * - SAVED: order saved (draft)
 * - APPROVED: payer approved, ready to capture
 * - VOIDED: order voided/cancelled
 * - COMPLETED: payment captured successfully
 * - PAYER_ACTION_REQUIRED: 3DS or redirect needed
 */
const STATUS_MAP: Record<string, ChargeStatus> = {
  CREATED: 'pending',
  SAVED: 'pending',
  APPROVED: 'requires_action',
  VOIDED: 'canceled',
  COMPLETED: 'succeeded',
  PAYER_ACTION_REQUIRED: 'requires_action',
};

export function mapChargeStatus(paypalStatus: string): ChargeStatus {
  return STATUS_MAP[paypalStatus] ?? 'pending';
}

/**
 * Convert a PayPal amount string ("29.99") to smallest-unit integer (2999).
 */
function amountToSmallestUnit(value: string, currencyCode: string): number {
  if (ZERO_DECIMAL_CURRENCIES.has(currencyCode.toUpperCase())) {
    return Math.round(Number(value));
  }
  return Math.round(Number(value) * 100);
}

function parseMetadata(customId: string): Record<string, string> {
  try {
    const parsed = JSON.parse(customId);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
  } catch {
    // Not valid JSON — wrap as simple key-value
  }
  return { custom_id: customId };
}

export function mapPayPalOrderToCharge(order: Order): UnifiedCharge {
  const unit = order.purchaseUnits?.[0];
  const amount = unit?.amount?.value
    ? amountToSmallestUnit(unit.amount.value, unit.amount.currencyCode || 'USD')
    : 0;
  const currency = unit?.amount?.currencyCode?.toUpperCase() ?? 'USD';

  // Find approve link for redirect-based flows
  const approveLink = order.links?.find((l) => l.rel === 'approve');

  // Try to extract payment method info from payment_source
  const card = order.paymentSource?.card;

  return {
    id: order.id || '',
    providerId: order.id || '',
    provider: 'paypal',
    amount,
    currency,
    status: mapChargeStatus(order.status || 'CREATED'),
    description: unit?.description ?? undefined,
    clientSecret: order.id, // Order ID used as clientSecret for Card Fields / Buttons
    customer: order.payer?.payerId
      ? { id: order.payer.payerId, email: order.payer.emailAddress }
      : undefined,
    paymentMethod: card
      ? { type: 'card', last4: card.lastDigits, brand: card.brand?.toLowerCase() }
      : order.paymentSource?.paypal
        ? { type: 'wallet' }
        : undefined,
    metadata: unit?.customId ? parseMetadata(unit.customId) : undefined,
    redirectUrl: approveLink?.href,
    createdAt: new Date(order.createTime || Date.now()),
    updatedAt: new Date(order.updateTime || Date.now()),
    _raw: order,
  };
}
