/**
 * Declares what a payment provider supports.
 * Adapters set these to `true`/`false` based on their provider's capabilities.
 *
 * @example
 * if (paykit.capabilities.subscriptions) {
 *   await paykit.subscriptions.create({ ... });
 * }
 */
export interface ProviderCapabilities {
  /** Can create and process charges/payments. */
  charges: boolean;
  /** Supports separate authorize and capture flows. */
  authAndCapture: boolean;
  /** Can issue refunds. */
  refunds: boolean;
  /** Can issue partial refunds (less than the full charge amount). */
  partialRefunds: boolean;
  /** Supports recurring billing / subscriptions. */
  subscriptions: boolean;
  /** Can store and reuse payment methods. */
  savedPaymentMethods: boolean;
  /** Provides a provider-hosted checkout page. */
  hostedCheckout: boolean;
  /** Provides embeddable UI elements (card inputs, etc.). */
  embeddableUI: boolean;
  /** Can send payouts to bank accounts or cards. */
  payouts: boolean;
  /** Supports charging in multiple currencies. */
  multiCurrency: boolean;
  /** Supports direct debit / ACH / SEPA payments. */
  directDebit: boolean;
  /** Can send and verify webhook notifications. */
  webhooks: boolean;
  /** Supports 3D Secure authentication. */
  threeDS: boolean;
}
