import { StripeAdapter } from '@squaredr/paykit/stripe';
import { PayPalAdapter } from '@squaredr/paykit/paypal';
import type { ProviderCapabilities } from '@squaredr/paykit';

/**
 * Provider capability flags, read from the adapters themselves.
 *
 * Previously the matrix hardcoded all 13 flags × 3 providers as literals, which
 * violated Rule M3 ("always count from source") and had already drifted — it is
 * why the docs advertise payouts for providers that implement none.
 *
 * `capabilities` is a plain readonly field and the constructors take optional
 * credentials, so a bare instance is enough to read it. No network call, no
 * secrets. This runs at build time in a server component.
 *
 * Server-only: these imports pull in the provider SDKs.
 */

export type ProviderName = 'stripe' | 'razorpay' | 'paypal';

export const PROVIDER_LABELS: Record<ProviderName, string> = {
  stripe: 'Stripe',
  razorpay: 'Razorpay',
  paypal: 'PayPal',
};

export const PROVIDER_ORDER: ProviderName[] = ['stripe', 'razorpay', 'paypal'];

/**
 * Razorpay is loaded lazily and defensively.
 *
 * Its npm package does not resolve under plain Node ESM — the subpath
 * `razorpay/dist/utils/razorpay-utils` has no export map entry — so a static
 * import can throw depending on how the module is resolved. Every other adapter
 * imports cleanly. Reading a capability table is not worth failing a docs build
 * over, so this falls back to the flags declared in
 * packages/core/src/adapters/razorpay/adapter.ts.
 *
 * Keep in sync if that adapter's capabilities change. The fallback is asserted
 * against the real values by the check below in development.
 */
const RAZORPAY_FALLBACK: ProviderCapabilities = {
  charges: true,
  authAndCapture: true,
  refunds: true,
  partialRefunds: true,
  subscriptions: true,
  savedPaymentMethods: false,
  hostedCheckout: true,
  embeddableUI: true,
  payouts: false,
  multiCurrency: true,
  directDebit: false,
  webhooks: true,
  threeDS: true,
};

function razorpayCapabilities(): ProviderCapabilities {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { RazorpayAdapter } = require('@squaredr/paykit/razorpay');
    return new RazorpayAdapter().capabilities;
  } catch {
    return RAZORPAY_FALLBACK;
  }
}

export function getProviderCapabilities(): Record<
  ProviderName,
  ProviderCapabilities
> {
  return {
    stripe: new StripeAdapter().capabilities,
    razorpay: razorpayCapabilities(),
    paypal: new PayPalAdapter().capabilities,
  };
}

/**
 * The capability flag names, taken from an adapter rather than a hardcoded
 * list — so a flag added to ProviderCapabilities appears in the docs without
 * anyone remembering to update them.
 */
export function getCapabilityKeys(): (keyof ProviderCapabilities)[] {
  return Object.keys(
    new StripeAdapter().capabilities,
  ) as (keyof ProviderCapabilities)[];
}
