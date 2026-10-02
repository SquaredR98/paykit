/**
 * Provider config for the live demo.
 *
 * These are real test-mode integrations, not a mockup — each one creates an
 * actual PaymentIntent / Order through the matching adapter (see
 * app/actions/demo-payment.ts). `amount` is display text; the server action
 * owns the real amount so the two cannot disagree on anything that matters.
 */

export type DemoProvider = 'stripe' | 'razorpay' | 'paypal';

export interface DemoProviderConfig {
  name: string;
  /** Currency the adapter is configured with, shown in the code panel. */
  currency: string;
  /** Formatted total for the button and order summary. */
  amount: string;
  /** Payment methods this adapter actually supports. */
  methods: string;
}

export const DEMO_PROVIDERS: Record<DemoProvider, DemoProviderConfig> = {
  stripe: {
    name: 'Stripe',
    currency: 'USD',
    amount: '$49.00',
    methods: 'Cards · Wallets · 3D Secure',
  },
  razorpay: {
    name: 'Razorpay',
    currency: 'INR',
    amount: '₹4,100',
    methods: 'Cards · UPI · Netbanking',
  },
  paypal: {
    name: 'PayPal',
    currency: 'USD',
    amount: '$49.00',
    methods: 'PayPal · Venmo · Cards',
  },
};

export const DEMO_PROVIDER_ORDER: DemoProvider[] = ['stripe', 'razorpay', 'paypal'];

/**
 * The snippet shown beside the checkout. Only the adapter import and the
 * currency change between providers — which is the whole argument of the
 * section, so the differing lines are marked for highlighting.
 */
export function demoSnippet(provider: DemoProvider): string {
  const adapter = {
    stripe: 'StripeAdapter',
    razorpay: 'RazorpayAdapter',
    paypal: 'PayPalAdapter',
  }[provider];

  return `import { PayKit } from '@squaredr/paykit';
import { ${adapter} } from '@squaredr/paykit/${provider}';

const paykit = new PayKit({
  adapter: new ${adapter}(credentials),
});

const charge = await paykit.charges.create({
  amount: ${provider === 'razorpay' ? '410000' : '4900'},
  currency: '${DEMO_PROVIDERS[provider].currency}',
});`;
}
