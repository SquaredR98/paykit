import { registerAdapter } from '@squaredr/paykit';
import { StripeAdapter } from './adapter.js';

registerAdapter('stripe', StripeAdapter);

export { StripeAdapter };
export { mapPaymentIntentToCharge, mapChargeStatus } from './mappers/charge.js';
export { mapStripeRefund } from './mappers/refund.js';
export { mapStripeCustomer } from './mappers/customer.js';
export { mapStripePaymentMethod } from './mappers/payment-method.js';
export { mapStripeSubscription } from './mappers/subscription.js';
export { mapStripeWebhookEvent, mapStripeEventType } from './mappers/webhook.js';
export { mapStripeError } from './mappers/error.js';
