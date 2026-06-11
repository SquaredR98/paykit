# @squaredr/paykit

Unified payment SDK for Node.js. One type-safe API for Stripe, Razorpay, and more.

[![npm version](https://img.shields.io/npm/v/@squaredr/paykit.svg)](https://www.npmjs.com/package/@squaredr/paykit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Install

```bash
npm install @squaredr/paykit stripe
# or
npm install @squaredr/paykit razorpay
```

Stripe and Razorpay are **peer dependencies** — install only the provider SDK you need.

## Quick Start

### Direct adapter mode (recommended)

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

console.log(charge.id);           // "pi_..."
console.log(charge.clientSecret); // Send to frontend
```

### Registry mode (multi-provider)

```ts
import { PayKit } from '@squaredr/paykit';
import '@squaredr/paykit/stripe';    // auto-registers
import '@squaredr/paykit/razorpay';  // auto-registers

const paykit = new PayKit({
  providers: {
    stripe: { secretKey: process.env.STRIPE_SECRET_KEY! },
    razorpay: { keyId: process.env.RZP_KEY_ID!, keySecret: process.env.RZP_KEY_SECRET! },
  },
  routing: {
    default: 'stripe',
    rules: [
      { currency: 'INR', provider: 'razorpay' },
    ],
  },
});
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

### Payment Methods (Stripe only)

```ts
const pm = await paykit.paymentMethods.create({ type: 'card' });
await paykit.paymentMethods.attach(pm.id, customer.id);
await paykit.paymentMethods.detach(pm.id);
const methods = await paykit.paymentMethods.list(customer.id);
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

## PaymentRouter

Route payments across multiple providers by currency:

```ts
import { PaymentRouter } from '@squaredr/paykit';
import { StripeAdapter } from '@squaredr/paykit/stripe';
import { RazorpayAdapter } from '@squaredr/paykit/razorpay';

const router = new PaymentRouter({
  default: new StripeAdapter({ secretKey: process.env.STRIPE_SECRET_KEY! }),
  routes: {
    INR: new RazorpayAdapter({ keyId: process.env.RZP_KEY_ID!, keySecret: process.env.RZP_KEY_SECRET! }),
  },
});

// Automatically routes to Razorpay for INR, Stripe for everything else
const charge = await router.createCharge({ amount: 50000, currency: 'INR' });
```

## Currency Utilities

```ts
import { toSmallestUnit, fromSmallestUnit } from '@squaredr/paykit';

toSmallestUnit(49.99, 'USD');  // 4999
fromSmallestUnit(4999, 'USD'); // 49.99
toSmallestUnit(500, 'JPY');    // 500 (zero-decimal currency)
```

## Subpath Exports

The package uses subpath exports to keep adapters tree-shakeable:

| Import | What you get |
|--------|-------------|
| `@squaredr/paykit` | Core: `PayKit`, types, utilities, `PaymentRouter` |
| `@squaredr/paykit/stripe` | `StripeAdapter` (requires `stripe` peer dep) |
| `@squaredr/paykit/razorpay` | `RazorpayAdapter` (requires `razorpay` peer dep) |
| `@squaredr/paykit/stripe/client` | `StripeClientAdapter` for frontend |
| `@squaredr/paykit/razorpay/client` | `RazorpayClientAdapter` for frontend |
| `@squaredr/paykit/testing` | `MockAdapter` for unit tests |

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
const adapter = new StripeAdapter({ secretKey: '...' });
console.log(adapter.capabilities);
// {
//   charges: true, refunds: true, subscriptions: true,
//   savedPaymentMethods: true, webhooks: true, threeDS: true,
//   hostedCheckout: true, embeddableUI: true, multiCurrency: true,
//   payouts: true, authAndCapture: true, partialRefunds: true,
//   directDebit: true,
// }
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

## License

MIT
