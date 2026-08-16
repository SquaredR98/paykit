# @squaredr/paykit

> Unified payment SDK for Node.js. One type-safe API for Stripe, Razorpay, PayPal, and more.

[![npm version](https://img.shields.io/npm/v/@squaredr/paykit.svg)](https://www.npmjs.com/package/@squaredr/paykit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-252%20passing-brightgreen)](packages/core/test)

## Installation

```bash
# Install PayKit core + your provider SDK (peer dependency)
npm install @squaredr/paykit stripe
# or
npm install @squaredr/paykit razorpay
# or
npm install @squaredr/paykit @paypal/paypal-server-sdk
```

**Provider SDKs are peer dependencies** — install only what you need. PayKit bundles all adapters in a single package with tree-shakeable subpath exports.

## Architecture

PayKit uses a **single-package architecture** with **bundled adapters**. All adapters (Stripe, Razorpay, PayPal) are included in `@squaredr/paykit` as **subpath exports**:

```
@squaredr/paykit
├── /stripe        → StripeAdapter (requires stripe peer dep)
├── /razorpay      → RazorpayAdapter (requires razorpay peer dep)
├── /paypal        → PayPalAdapter (requires @paypal/paypal-server-sdk peer dep)
├── /stripe/client → StripeClientAdapter (frontend)
├── /razorpay/client → RazorpayClientAdapter (frontend)
└── /testing       → MockAdapter (unit tests)
```

This design ensures:
- **Tree-shaking** — Only import the adapters you use
- **Type safety** — Full TypeScript support across all providers
- **Peer dependencies** — Install only the provider SDKs you need
- **No legacy packages** — All old `@squaredr/paykit-adapter-*` packages are deprecated

## Quick Start

### Single Provider (Direct Adapter Mode)

```ts
import { PayKit } from '@squaredr/paykit';
import { StripeAdapter } from '@squaredr/paykit/stripe';

const paykit = new PayKit({
  adapter: new StripeAdapter({ secretKey: process.env.STRIPE_SECRET_KEY! }),
});

// Create a charge
const charge = await paykit.charges.create({
  amount: 5000,       // $50.00 in cents
  currency: 'usd',
  metadata: { orderId: 'order_123' },
});

console.log(charge.id);           // "ch_..." or "pi_..."
console.log(charge.clientSecret); // Send to frontend for confirmation
```

### PayPal Example

```ts
import { PayKit } from '@squaredr/paykit';
import { PayPalAdapter } from '@squaredr/paykit/paypal';

const paykit = new PayKit({
  adapter: new PayPalAdapter({
    clientId: process.env.PAYPAL_CLIENT_ID!,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
    environment: 'sandbox', // or 'production'
  }),
});

const charge = await paykit.charges.create({
  amount: 10000, // $100.00
  currency: 'usd',
});

console.log(charge.providerId); // PayPal order ID
```

### Multi-Provider with Routing

Route payments across providers by currency or other criteria:

```ts
import { PaymentRouter } from '@squaredr/paykit';
import { StripeAdapter } from '@squaredr/paykit/stripe';
import { RazorpayAdapter } from '@squaredr/paykit/razorpay';
import { PayPalAdapter } from '@squaredr/paykit/paypal';

const router = new PaymentRouter({
  default: new StripeAdapter({ secretKey: process.env.STRIPE_SECRET_KEY! }),
  routes: {
    INR: new RazorpayAdapter({
      keyId: process.env.RZP_KEY_ID!,
      keySecret: process.env.RZP_KEY_SECRET!
    }),
    // PayPal for specific currencies or use cases
    EUR: new PayPalAdapter({
      clientId: process.env.PAYPAL_CLIENT_ID!,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
      environment: 'production',
    }),
  },
});

// Automatically routes to the right provider
const charge = await router.createCharge({ amount: 50000, currency: 'INR' }); // → Razorpay
const charge2 = await router.createCharge({ amount: 10000, currency: 'EUR' }); // → PayPal
const charge3 = await router.createCharge({ amount: 5000, currency: 'USD' }); // → Stripe (default)
```

## Operations

Both adapters implement the same interface. Here's what you get:

### Charges

```ts
const charge = await paykit.charges.create({ amount: 5000, currency: 'usd' });
const fetched = await paykit.charges.retrieve(charge.id);
const captured = await paykit.charges.capture(charge.id);
const cancelled = await paykit.charges.cancel(charge.id);
const list = await paykit.charges.list({ limit: 10 });
```

### Refunds

```ts
const refund = await paykit.refunds.create({
  chargeId: charge.id,
  amount: 2500,      // partial refund
  reason: 'requested_by_customer',
});
const fetched = await paykit.refunds.retrieve(refund.id);
const list = await paykit.refunds.list({ limit: 10 });
```

### Customers

```ts
const customer = await paykit.customers.create({
  email: 'user@example.com',
  name: 'Jane Doe',
});
const updated = await paykit.customers.update(customer.id, { name: 'Jane Smith' });
await paykit.customers.delete(customer.id);
const list = await paykit.customers.list({ limit: 10 });
```

### Payment Methods

```ts
// Stripe - full support
const pm = await paykit.paymentMethods.create({ type: 'card' });
await paykit.paymentMethods.attach(pm.id, customer.id);
await paykit.paymentMethods.detach(pm.id);
const methods = await paykit.paymentMethods.list(customer.id);

// PayPal - vault token support
const token = await paykit.paymentMethods.create({
  token: 'setup_token_from_frontend', // from PayPal Vault JS SDK
  customerId: 'PAYPAL_CUSTOMER_ID',
});
```

### Subscriptions

```ts
const sub = await paykit.subscriptions.create({
  customer: customer.id,
  amount: 1999,
  currency: 'usd',
  interval: 'month',
});
const updated = await paykit.subscriptions.update(sub.id, { metadata: { plan: 'pro' } });
await paykit.subscriptions.cancel(sub.id, { cancelAtPeriodEnd: true });
const list = await paykit.subscriptions.list({ limit: 10 });
```

### Webhooks

Two ways to parse webhooks:

```ts
// Method 1: parse() — pass raw headers
const event = paykit.webhooks.parse(rawBody, headers, webhookSecret);

// Method 2: construct() — pass just the signature string
const event = paykit.webhooks.construct({
  payload: rawBody,
  signature: req.headers['stripe-signature'],
  secret: webhookSecret,
});

// Both return a UnifiedWebhookEvent
console.log(event.type);     // 'charge.succeeded'
console.log(event.provider); // 'stripe'
console.log(event.data);     // normalized payload

// Verify without parsing
const isValid = paykit.webhooks.verify(rawBody, headers, webhookSecret);
```

## Provider Comparison

| Feature | Stripe | Razorpay | PayPal |
|---------|--------|----------|--------|
| Charges | ✅ | ✅ | ✅ |
| Refunds | ✅ | ✅ | ✅ |
| Customers | ✅ | ✅ | ❌ (no API) |
| Payment Methods | ✅ | ❌ | ✅ (vault tokens) |
| Subscriptions | ✅ | ✅ | ✅ |
| Webhooks | ✅ | ✅ | ✅ |
| 3D Secure | ✅ | ✅ | N/A |
| Auth & Capture | ✅ | ✅ | ✅ |
| Partial Refunds | ✅ | ✅ | ✅ |
| Multi-Currency | ✅ (135+) | ✅ (100+) | ✅ (25+) |

**Note:** PayPal doesn't have a dedicated Customers API — customer IDs are just references used in subscriptions and vault operations.

## Currency Utilities

```ts
import { toSmallestUnit, fromSmallestUnit } from '@squaredr/paykit';

toSmallestUnit(49.99, 'USD');  // 4999
fromSmallestUnit(4999, 'USD'); // 49.99
toSmallestUnit(500, 'JPY');    // 500 (zero-decimal currency)
```

## Subpath Exports

PayKit uses **subpath exports** to keep adapters tree-shakeable. Import only what you need:

| Import Path | Exports | Peer Dependency |
|------------|---------|-----------------|
| `@squaredr/paykit` | Core: `PayKit`, `PaymentRouter`, types, utilities | None |
| `@squaredr/paykit/stripe` | `StripeAdapter` | `stripe` |
| `@squaredr/paykit/razorpay` | `RazorpayAdapter` | `razorpay` |
| `@squaredr/paykit/paypal` | `PayPalAdapter` | `@paypal/paypal-server-sdk` |
| `@squaredr/paykit/stripe/client` | `StripeClientAdapter` (frontend) | `@stripe/stripe-js` |
| `@squaredr/paykit/razorpay/client` | `RazorpayClientAdapter` (frontend) | None (uses CDN) |
| `@squaredr/paykit/testing` | `MockAdapter` (unit tests) | None |

### Example: Tree-shaking in action

```ts
// ✅ Only StripeAdapter code is bundled (not Razorpay or PayPal)
import { PayKit } from '@squaredr/paykit';
import { StripeAdapter } from '@squaredr/paykit/stripe';

const paykit = new PayKit({
  adapter: new StripeAdapter({ secretKey: '...' }),
});
```

This keeps your bundle size minimal — you never ship code for providers you don't use.

## Error Handling

All provider errors are normalized into `PaymentError`:

```ts
import { PaymentError, NotSupportedError } from '@squaredr/paykit';

try {
  await paykit.charges.create({ amount: 5000, currency: 'usd' });
} catch (err) {
  if (err instanceof PaymentError) {
    console.log(err.code);      // 'card_declined', 'insufficient_funds', etc.
    console.log(err.provider);  // 'stripe'
    console.log(err.retryable); // boolean
  }
}
```

## Unified Types

Every operation returns normalized types regardless of provider:

| Type | Description |
|------|-------------|
| `UnifiedCharge` | Payment intent / order with status, amount, clientSecret |
| `UnifiedRefund` | Refund with status, amount, reason |
| `UnifiedCustomer` | Customer with email, name, metadata |
| `UnifiedSubscription` | Subscription with status, interval, current period |
| `UnifiedPaymentMethod` | Saved card/payment method details |
| `UnifiedWebhookEvent` | Webhook event with normalized type and data |
| `PaymentError` | Error with provider code and retryable flag |
| `NotSupportedError` | Thrown when a provider lacks a capability |

## Provider Capabilities

Each adapter declares what it supports. Check at runtime:

```ts
import { StripeAdapter } from '@squaredr/paykit/stripe';
import { PayPalAdapter } from '@squaredr/paykit/paypal';

const stripe = new StripeAdapter({ secretKey: '...' });
console.log(stripe.capabilities.savedPaymentMethods); // true

const paypal = new PayPalAdapter({ clientId: '...', clientSecret: '...', environment: 'sandbox' });
console.log(paypal.capabilities.savedPaymentMethods); // true (vault tokens)
console.log(paypal.capabilities.customers); // false (no API)
```

**Full capability set:**

```ts
interface AdapterCapabilities {
  charges: boolean;
  refunds: boolean;
  customers: boolean;
  subscriptions: boolean;
  savedPaymentMethods: boolean;
  webhooks: boolean;
  threeDS: boolean;
  hostedCheckout: boolean;
  embeddableUI: boolean;
  multiCurrency: boolean;
  payouts: boolean;
  authAndCapture: boolean;
  partialRefunds: boolean;
  directDebit: boolean;
}
```

## Frontend Integration

For React checkout components, install `@squaredr/paykit-react`:

```bash
npm install @squaredr/paykit-react
```

```tsx
import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react';
import { StripeClientAdapter } from '@squaredr/paykit/stripe/client';

<PayKitProvider clientAdapter={new StripeClientAdapter(publicKey)}>
  <CheckoutForm
    clientSecret={charge.clientSecret}
    onSuccess={(result) => console.log('Paid!', result)}
    onError={(err) => console.error(err)}
  />
</PayKitProvider>
```

See [@squaredr/paykit-react](../react/README.md) for full documentation.

## Development

PayKit is a **pnpm monorepo**. The core package lives in `packages/core/` and contains all adapters:

```
packages/core/
├── src/
│   ├── adapters/
│   │   ├── stripe/        ← StripeAdapter implementation
│   │   ├── razorpay/      ← RazorpayAdapter implementation
│   │   └── paypal/        ← PayPalAdapter implementation (migrated to official SDK)
│   ├── types/             ← Unified types
│   ├── errors/            ← Error classes
│   ├── utils/             ← Currency helpers
│   ├── paykit.ts          ← PayKit class
│   └── router.ts          ← PaymentRouter class
└── test/                  ← 252 passing tests
```

### Important Notes

1. **Legacy packages are ditched**: The old `packages/adapter-*` directories are deprecated and NOT published. All adapters now live in `packages/core/src/adapters/`.

2. **PayPal uses official SDK**: PayPal adapter was migrated from a custom HTTP client to `@paypal/paypal-server-sdk` v2.4.0 for better reliability and type safety.

3. **Subpath exports**: All adapters are exposed via package.json exports:
   ```json
   {
     "exports": {
       ".": "./dist/index.js",
       "./stripe": "./dist/adapters/stripe/index.js",
       "./razorpay": "./dist/adapters/razorpay/index.js",
       "./paypal": "./dist/adapters/paypal/index.js",
       "./stripe/client": "./dist/adapters/stripe/client.js",
       "./razorpay/client": "./dist/adapters/razorpay/client.js",
       "./testing": "./dist/testing/mock-adapter.js"
     }
   }
   ```

### Building

```bash
# From monorepo root
pnpm install
pnpm build

# Just core package
pnpm --filter @squaredr/paykit build
```

### Testing

```bash
# Run all tests
pnpm test

# Core tests only
pnpm --filter @squaredr/paykit test

# Watch mode
pnpm --filter @squaredr/paykit test:watch
```

## Migration Guide

If you're upgrading from separate adapter packages (`@squaredr/paykit-adapter-stripe`, etc.), update your imports:

```ts
// ❌ Old (separate packages)
import { StripeAdapter } from '@squaredr/paykit-adapter-stripe';

// ✅ New (subpath exports)
import { StripeAdapter } from '@squaredr/paykit/stripe';
```

All functionality remains the same — only the import paths changed.

## License

MIT — See [LICENSE](../../LICENSE) for details.

## Related Packages

- [@squaredr/paykit-react](../react/) — React components for checkout UI
- [@squaredr/paykit-sdk-js](../sdk-js/) — Browser SDK for client-side operations
