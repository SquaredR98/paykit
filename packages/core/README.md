# @squaredr/paykit

Unified payment SDK for Node.js. One interface, many providers.

## Install

```bash
npm install @squaredr/paykit
```

## What it provides

- **Unified types** for charges, refunds, customers, subscriptions, payment methods, webhooks
- **Adapter registry** — adapters self-register on import
- **Multi-provider routing** — route payments by currency, region, or payment method
- **Currency utilities** — convert between major and smallest units
- **Error classes** — `PaymentError` and `NotSupportedError` with provider context

## Quick start

```ts
import { UnifiedPayments } from '@squaredr/paykit';
import '@squaredr/paykit-stripe'; // registers the adapter

const payments = new UnifiedPayments({
  provider: 'stripe',
  credentials: { secretKey: process.env.STRIPE_SECRET_KEY },
});

// Create a charge
const charge = await payments.charges.create({
  amount: 5000, // $50.00 in cents
  currency: 'USD',
  description: 'Order #42',
});
```

## Multi-provider routing

```ts
import { UnifiedPayments } from '@squaredr/paykit';
import '@squaredr/paykit-stripe';
import '@squaredr/paykit-razorpay';

const payments = new UnifiedPayments({
  providers: {
    stripe: { secretKey: process.env.STRIPE_SECRET_KEY },
    razorpay: { keyId: process.env.RZP_KEY_ID, keySecret: process.env.RZP_KEY_SECRET },
  },
  routing: {
    default: 'stripe',
    rules: [
      { currency: 'INR', provider: 'razorpay' },
      { region: 'IN', provider: 'razorpay' },
    ],
  },
});
```

## Currency utilities

```ts
import { toSmallestUnit, fromSmallestUnit } from '@squaredr/paykit';

toSmallestUnit(49.99, 'USD'); // 4999
fromSmallestUnit(4999, 'USD'); // 49.99
toSmallestUnit(500, 'JPY'); // 500 (JPY has no decimals)
```

## Building an adapter

Adapters implement the `PaymentAdapter` interface and register themselves:

```ts
import { registerAdapter } from '@squaredr/paykit';
import type { PaymentAdapter } from '@squaredr/paykit';

class MyAdapter implements PaymentAdapter {
  // implement charges, refunds, customers, etc.
}

registerAdapter('my-provider', MyAdapter);
```

See `@squaredr/paykit-stripe` and `@squaredr/paykit-razorpay` for reference implementations.

## API

### Types

| Type | Description |
|------|-------------|
| `UnifiedCharge` | Normalized charge/payment |
| `UnifiedRefund` | Normalized refund |
| `UnifiedCustomer` | Normalized customer |
| `UnifiedSubscription` | Normalized subscription |
| `UnifiedPaymentMethod` | Normalized payment method |
| `UnifiedWebhookEvent` | Normalized webhook event |
| `PaymentError` | Error with provider code, retryable flag |
| `NotSupportedError` | Thrown when a provider lacks a capability |

### Utilities

| Function | Description |
|----------|-------------|
| `toSmallestUnit(amount, currency)` | Convert major units to smallest (e.g. dollars to cents) |
| `fromSmallestUnit(amount, currency)` | Convert smallest units to major |
| `registerAdapter(name, AdapterClass)` | Register an adapter |
| `getAdapter(name)` | Retrieve a registered adapter class |

## License

MIT
