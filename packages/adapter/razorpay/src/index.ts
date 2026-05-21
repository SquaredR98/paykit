import { registerAdapter } from '@squaredr/paykit';
import { RazorpayAdapter } from './adapter.js';

registerAdapter('razorpay', RazorpayAdapter);

export { RazorpayAdapter };
export { mapRazorpayOrderToCharge, mapRazorpayPaymentToCharge, mapOrderStatus, mapPaymentStatus } from './mappers/charge.js';
export { mapRazorpayRefund, mapRefundStatus } from './mappers/refund.js';
export { mapRazorpayCustomer } from './mappers/customer.js';
export { mapRazorpaySubscription, mapSubscriptionStatus } from './mappers/subscription.js';
export { mapRazorpayWebhookEvent, mapRazorpayEventType } from './mappers/webhook.js';
export { mapRazorpayError } from './mappers/error.js';
