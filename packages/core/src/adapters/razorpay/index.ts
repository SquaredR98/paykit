export { RazorpayAdapter } from './adapter.js';
export { mapRazorpayOrderToCharge, mapRazorpayPaymentToCharge, mapOrderStatus, mapPaymentStatus } from './mappers/charge.js';
export { mapRazorpayRefund, mapRefundStatus } from './mappers/refund.js';
export { mapRazorpayCustomer } from './mappers/customer.js';
export { mapRazorpaySubscription, mapSubscriptionStatus } from './mappers/subscription.js';
export { mapRazorpayWebhookEvent, mapRazorpayEventType } from './mappers/webhook.js';
export { mapRazorpayError } from './mappers/error.js';

// Auto-register on import so `import "@squaredr/paykit/razorpay"` works as a side-effect
import { RazorpayAdapter } from './adapter.js';
import { registerAdapter } from '../../registry.js';
registerAdapter('razorpay', RazorpayAdapter);
