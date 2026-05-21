/**
 * Declares what a payment provider supports.
 * Adapters set these to true/false based on their provider's capabilities.
 */
export interface ProviderCapabilities {
  charges: boolean;
  authAndCapture: boolean;
  refunds: boolean;
  partialRefunds: boolean;
  subscriptions: boolean;
  savedPaymentMethods: boolean;
  hostedCheckout: boolean;
  embeddableUI: boolean;
  payouts: boolean;
  multiCurrency: boolean;
  directDebit: boolean;
  webhooks: boolean;
  threeDS: boolean;
}
