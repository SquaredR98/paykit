export interface CheckoutStep {
  key: string;
  label: string;
  code: string;
}

export const CHECKOUT_STEPS: CheckoutStep[] = [
  {
    key: 'init',
    label: 'Initialize',
    code: `import { PayKit } from '@squaredr/paykit';
import { StripeAdapter } from '@squaredr/paykit/stripe';

const paykit = new PayKit({
  adapter: new StripeAdapter({
    secretKey: process.env.STRIPE_SECRET_KEY,
  }),
});`,
  },
  {
    key: 'provider',
    label: 'Pick provider',
    code: `// Switch providers without changing your integration
import { RazorpayAdapter } from '@squaredr/paykit/razorpay';
import { PayPalAdapter } from '@squaredr/paykit/paypal';

const paykit = new PayKit({
  adapter: provider === 'razorpay'
    ? new RazorpayAdapter({ keyId, keySecret })
    : provider === 'paypal'
    ? new PayPalAdapter({ clientId, clientSecret })
    : new StripeAdapter({ secretKey }),
});`,
  },
  {
    key: 'charge',
    label: 'Create charge',
    code: `// Same API regardless of provider
const charge = await paykit.charges.create({
  amount: 4900,
  currency: 'usd',
  description: 'Pro Plan — Monthly',
  metadata: { planId: 'pro-monthly' },
});

// charge.clientSecret → pass to frontend`,
  },
  {
    key: 'result',
    label: 'Handle result',
    code: `// Unified response shape across all providers
{
  id: 'ch_unified_abc123',
  provider: 'stripe',
  status: 'succeeded',
  amount: 4900,
  currency: 'usd',
  description: 'Pro Plan — Monthly',
  metadata: { planId: 'pro-monthly' },
  createdAt: '2025-01-15T10:30:00Z',
}`,
  },
];
