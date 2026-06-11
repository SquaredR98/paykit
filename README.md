# PayKit

> Unified payment SDK for Node.js — one type-safe API for Stripe, Razorpay, and more.

[![npm version](https://img.shields.io/npm/v/@squaredr/paykit.svg)](https://www.npmjs.com/package/@squaredr/paykit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://github.com/SquaredR98/paykit/actions/workflows/test.yml/badge.svg)](https://github.com/SquaredR98/paykit/actions/workflows/test.yml)

PayKit provides a single, type-safe API for accepting payments across multiple providers. Write your integration once, swap providers without changing code.

```ts
import { PayKit } from '@squaredr/paykit';
import { StripeAdapter } from '@squaredr/paykit/stripe';

const paykit = new PayKit({ adapter: new StripeAdapter({ secretKey: '...' }) });
const charge = await paykit.charges.create({ amount: 5000, currency: 'usd' });
```

```tsx
import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react';
import { StripeClientAdapter } from '@squaredr/paykit/stripe/client';

<PayKitProvider clientAdapter={new StripeClientAdapter(publicKey)}>
  <CheckoutForm clientSecret={charge.clientSecret} onSuccess={handleSuccess} />
</PayKitProvider>
```

---

## Features

- **Unified API** -- One interface for charges, refunds, customers, subscriptions, and webhooks
- **Type-safe** -- Full TypeScript coverage with normalized types across providers
- **Adapter pattern** -- Swap providers without changing business logic
- **Webhook normalization** -- Unified webhook events regardless of provider
- **Multi-provider routing** -- Route payments by currency or region
- **React components** -- Drop-in `<CheckoutForm>`, `<CardInput>`, and hooks
- **Lightweight** -- Tree-shakeable subpath exports; only bundle what you use

---

## Packages

| Package | Description | npm |
|---------|-------------|-----|
| [`@squaredr/paykit`](packages/core) | Core SDK + Stripe & Razorpay adapters | [![npm](https://img.shields.io/npm/v/@squaredr/paykit)](https://www.npmjs.com/package/@squaredr/paykit) |
| [`@squaredr/paykit-react`](packages/react) | React components and hooks | [![npm](https://img.shields.io/npm/v/@squaredr/paykit-react)](https://www.npmjs.com/package/@squaredr/paykit-react) |
| [`@squaredr/paykit-js`](packages/sdk-js) | Vanilla JS/TS frontend SDK (headless) | [![npm](https://img.shields.io/npm/v/@squaredr/paykit-js)](https://www.npmjs.com/package/@squaredr/paykit-js) |

**Adapters included in `@squaredr/paykit` (free, MIT licensed):**

| Subpath Export | Provider SDK | Status |
|---------------|-------------|--------|
| `@squaredr/paykit/stripe` | `stripe` (peer dep) | Stable |
| `@squaredr/paykit/razorpay` | `razorpay` (peer dep) | Stable |
| `@squaredr/paykit/stripe/client` | Frontend adapter | Stable |
| `@squaredr/paykit/razorpay/client` | Frontend adapter | Stable |
| `@squaredr/paykit/testing` | Mock adapter | Stable |

**Free adapters include:** charges, refunds, customers, subscriptions, payment methods, webhooks, health checks, and frontend integration.

### Paid Adapter Bundles

Additional payment providers (Square, Adyen, Cashfree, PhonePe, Mollie, and more) will be available as paid adapter bundles -- one-time purchase, no subscriptions.

| Bundle | Price | Includes |
|--------|-------|----------|
| Individual adapter | $19 | Single provider |
| India Pack | $49 | Cashfree, PhonePe, Paytm |
| Global Pack | $79 | Square, Adyen, Mollie + more |
| All Access | $149 | All current and future adapters |

[View pricing](https://squaredr.tech/products/paykit#pricing)

---

## Quick Start

### 1. Install

```bash
# Backend (pick your provider)
npm install @squaredr/paykit stripe

# Frontend (React)
npm install @squaredr/paykit-react
```

### 2. Backend: Create a charge

```ts
import { PayKit } from '@squaredr/paykit';
import { StripeAdapter } from '@squaredr/paykit/stripe';

const paykit = new PayKit({
  adapter: new StripeAdapter({ secretKey: process.env.STRIPE_SECRET_KEY! }),
});

const charge = await paykit.charges.create({
  amount: 5000,
  currency: 'usd',
  metadata: { orderId: 'order_123' },
});

console.log(charge.clientSecret); // Send to frontend
```

### 3. Frontend: Collect payment

```tsx
import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react';
import { StripeClientAdapter } from '@squaredr/paykit/stripe/client';

function App() {
  return (
    <PayKitProvider clientAdapter={new StripeClientAdapter(process.env.NEXT_PUBLIC_STRIPE_KEY!)}>
      <CheckoutForm
        clientSecret={clientSecret}
        onSuccess={(result) => console.log('Paid!', result)}
        onError={(error) => console.error(error)}
      />
    </PayKitProvider>
  );
}
```

### 4. Handle webhooks

```ts
const event = paykit.webhooks.construct({
  payload: rawBody,
  signature: req.headers['stripe-signature'],
  secret: process.env.STRIPE_WEBHOOK_SECRET!,
});

switch (event.type) {
  case 'charge.succeeded':
    // Fulfill order
    break;
  case 'charge.failed':
    // Handle failure
    break;
}
```

---

## Architecture

```
┌─────────────────────────────────────────────┐
│  Your Application                           │
│  (Express, Next.js, Fastify, etc.)          │
└──────────────────┬──────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────┐
│  @squaredr/paykit (Core)                    │
│  - PayKit client                            │
│  - Unified types                            │
│  - PaymentRouter                            │
│  - Error normalization                      │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────┴─────────┐
         v                   v
┌─────────────────┐  ┌──────────────────┐
│ StripeAdapter   │  │ RazorpayAdapter  │
│ (subpath export)│  │ (subpath export) │
└────────┬────────┘  └────────┬─────────┘
         │                    │
         v                    v
┌─────────────────┐  ┌──────────────────┐
│ stripe (npm)    │  │ razorpay (npm)   │
│ (peer dep)      │  │ (peer dep)       │
└─────────────────┘  └──────────────────┘
```

Each adapter wraps the official provider SDK and translates requests/responses into PayKit's unified types. The adapters are real implementations -- `StripeAdapter` calls `stripe.paymentIntents.create()`, `RazorpayAdapter` calls `razorpay.orders.create()`, etc.

---

## Development

This is a [Turborepo](https://turbo.build/repo) monorepo using npm workspaces.

### Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 11.0.0

### Setup

```bash
git clone https://github.com/SquaredR98/paykit.git
cd paykit
npm install
npm run build
npm test
```

### Project Structure

```
paykit/
├── packages/
│   ├── core/        # @squaredr/paykit (core + adapters)
│   ├── sdk-js/      # @squaredr/paykit-js
│   └── react/       # @squaredr/paykit-react
├── apps/
│   └── demo/        # Next.js demo application
├── turbo.json
└── package.json
```

### Commands

```bash
npm run build          # Build all packages
npm test               # Run all tests
npm run test:watch     # Watch mode
npm run typecheck      # Type check
npm run lint           # Lint with Biome
npm run clean          # Clean build artifacts
```

---

## Demo App

```bash
cd apps/demo
cp .env.example .env.local  # Add your API keys
npm run dev
```

Includes: provider selection, Stripe Payment Element, Razorpay Checkout modal, 3D Secure handling, payment status polling, and mock adapter for offline dev.

---

## Testing

All packages use [Vitest](https://vitest.dev/). 252 tests passing across all packages.

```bash
npm test                              # All tests
npm test --workspace=packages/core    # Core only
npm run test:watch                    # Watch mode
```

---

## Documentation

Full docs at [squaredr.tech/products/paykit/docs](https://squaredr.tech/products/paykit/docs)

- [Installation](https://squaredr.tech/products/paykit/docs/getting-started/installation)
- [Quick Start](https://squaredr.tech/products/paykit/docs/getting-started/quick-start)
- [Stripe Guide](https://squaredr.tech/products/paykit/docs/guides/stripe)
- [Razorpay Guide](https://squaredr.tech/products/paykit/docs/guides/razorpay)
- [Webhooks](https://squaredr.tech/products/paykit/docs/guides/webhooks)
- [Multi-Provider Routing](https://squaredr.tech/products/paykit/docs/guides/multi-provider)
- [API Reference](https://squaredr.tech/products/paykit/docs/reference)

---

## License

MIT License -- see [LICENSE](LICENSE) for details.

**Free (MIT):** Core SDK, Stripe adapter, Razorpay adapter, PayPal adapter (coming soon), React components, JS SDK.

**Paid (one-time purchase):** Additional provider adapters via adapter bundles. [View pricing](https://squaredr.tech/products/paykit#pricing).

---

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting PRs.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/SquaredR98/paykit/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SquaredR98/paykit/discussions)
- **Docs**: [squaredr.tech/products/paykit/docs](https://squaredr.tech/products/paykit/docs)

---

Built by [SquaredR](https://github.com/SquaredR98)
