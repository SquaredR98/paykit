/**
 * Provider data for the Providers section.
 *
 * `shipped` is counted from packages/core/src/adapters/ — three adapters exist
 * (Rule M3). The design mockup shows eleven providers all marked GA; that is
 * fiction and is deliberately not reproduced here.
 *
 * The feature blurbs describe what each adapter actually implements, checked
 * against its `capabilities` block in packages/core/src/adapters/<name>/adapter.ts.
 */

export interface Provider {
  slug: string;
  /** Two-letter glyph shown in the tile. */
  glyph: string;
  name: string;
  summary: string;
}

export const shippedProviders: Provider[] = [
  {
    slug: 'stripe',
    glyph: 'St',
    name: 'Stripe',
    summary: 'Cards, wallets, SEPA, 3D Secure',
  },
  {
    slug: 'razorpay',
    glyph: 'Rz',
    name: 'Razorpay',
    summary: 'UPI, cards, netbanking',
  },
  {
    slug: 'paypal',
    glyph: 'Pp',
    name: 'PayPal',
    summary: 'Wallet, cards, Pay Later',
  },
];

/**
 * Not built yet. Ordered by how often they are asked for, and shown dimmed with
 * a "planned" badge so the distinction from `shipped` is unmissable.
 */
export const plannedProviders: Provider[] = [
  { slug: 'square', glyph: 'Sq', name: 'Square', summary: 'Cards, in-person' },
  { slug: 'adyen', glyph: 'Ad', name: 'Adyen', summary: 'Global cards, local methods' },
  { slug: 'cashfree', glyph: 'Cf', name: 'Cashfree', summary: 'UPI, payouts' },
  { slug: 'phonepe', glyph: 'Pe', name: 'PhonePe', summary: 'UPI intent, collect' },
  { slug: 'mollie', glyph: 'Mo', name: 'Mollie', summary: 'iDEAL, Bancontact' },
];
