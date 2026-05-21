import type { UnifiedCharge, ChargeStatus } from '@squaredr/paykit';

const ORDER_STATUS_MAP: Record<string, ChargeStatus> = {
  created: 'pending',
  attempted: 'pending',
  paid: 'succeeded',
};

const PAYMENT_STATUS_MAP: Record<string, ChargeStatus> = {
  created: 'pending',
  authorized: 'requires_action',
  captured: 'succeeded',
  refunded: 'succeeded',
  failed: 'failed',
};

export function mapOrderStatus(status: string): ChargeStatus {
  return ORDER_STATUS_MAP[status] ?? 'pending';
}

export function mapPaymentStatus(status: string): ChargeStatus {
  return PAYMENT_STATUS_MAP[status] ?? 'pending';
}

// We use `any` for SDK inputs to avoid coupling to Razorpay's
// internal type definitions which may change between versions.

export function mapRazorpayOrderToCharge(order: any): UnifiedCharge {
  return {
    id: order.id,
    providerId: order.id,
    provider: 'razorpay',
    amount: Number(order.amount),
    currency: String(order.currency).toUpperCase(),
    status: mapOrderStatus(order.status),
    description: order.receipt ?? undefined,
    clientSecret: order.id,
    metadata: order.notes ?? undefined,
    createdAt: new Date(order.created_at * 1000),
    updatedAt: new Date(order.created_at * 1000),
    _raw: order,
  };
}

export function mapRazorpayPaymentToCharge(payment: any): UnifiedCharge {
  return {
    id: payment.id,
    providerId: payment.id,
    provider: 'razorpay',
    amount: Number(payment.amount),
    currency: String(payment.currency).toUpperCase(),
    status: mapPaymentStatus(payment.status),
    description: payment.description ?? undefined,
    customer: payment.customer_id ? { id: payment.customer_id } : undefined,
    paymentMethod: payment.method
      ? {
          type: payment.method === 'card' ? 'card' : payment.method === 'upi' ? 'upi' : 'other',
          last4: undefined,
          brand: undefined,
        }
      : undefined,
    metadata: payment.notes ?? undefined,
    createdAt: new Date(payment.created_at * 1000),
    updatedAt: new Date(payment.created_at * 1000),
    _raw: payment,
  };
}
