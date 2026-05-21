# PayKit

> Unified payment SDK — Stripe-like DX across 25+ providers

[![npm version](https://img.shields.io/npm/v/@squaredr/paykit.svg)](https://www.npmjs.com/package/@squaredr/paykit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://github.com/squaredr/paykit/actions/workflows/test.yml/badge.svg)](https://github.com/squaredr/paykit/actions/workflows/test.yml)

PayKit provides a single, type-safe API for accepting payments across multiple payment providers. Write your integration once, swap providers without changing code.

```ts
// Backend — works with Stripe, Razorpay, PayPal, etc.
import { PayKit } from '@squaredr/paykit';
import { StripeAdapter } from '@squaredr/paykit-stripe';

const paykit = new PayKit({ adapter: new StripeAdapter({ secretKey: '...' }) });
const charge = await paykit.charges.create({ amount: 5000, currency: 'usd' });
```

```tsx
// Frontend — React components or vanilla JS
import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react';
import { StripeClientAdapter } from '@squaredr/paykit-stripe/client';

<PayKitProvider clientAdapter={new StripeClientAdapter(publicKey)}>
  <CheckoutForm clientSecret={charge.clientSecret} onSuccess={handleSuccess} />
</PayKitProvider>
```

---

## Features

- **Unified API** — One interface for accepting payments across providers
- **Type-safe** — Full TypeScript support with generics for provider-specific types
- **Framework-agnostic** — Works with Next.js, Express, vanilla Node.js, Deno, Bun
- **Frontend SDK** — React components + headless vanilla JS SDK
- **Provider routing** — Route payments by currency, region, or custom rules
- **Webhook normalization** — Unified webhook events across providers
- **Tree-shakeable** — Only bundle what you use (adapters, client code separate)
- **Open Core** — All adapters open source. Advanced features in Pro packages (one-time purchase).

---

## Packages

### Open Source (MIT License)

This monorepo contains 5 npm packages, all free and open source:

| Package | Description | Version |
|---------|-------------|---------|
| [`@squaredr/paykit`](packages/core) | Core SDK with unified types and adapter system | ![npm](https://img.shields.io/npm/v/@squaredr/paykit) |
| [`@squaredr/paykit-stripe`](packages/adapter/stripe) | Stripe adapter — charges + webhooks | ![npm](https://img.shields.io/npm/v/@squaredr/paykit-stripe) |
| [`@squaredr/paykit-razorpay`](packages/adapter/razorpay) | Razorpay adapter — charges + webhooks | ![npm](https://img.shields.io/npm/v/@squaredr/paykit-razorpay) |
| [`@squaredr/paykit-js`](packages/sdk-js) | Vanilla JS/TS frontend SDK (headless) | ![npm](https://img.shields.io/npm/v/@squaredr/paykit-js) |
| [`@squaredr/paykit-react`](packages/react) | React components and hooks | ![npm](https://img.shields.io/npm/v/@squaredr/paykit-react) |

**What's included in free adapters:**
- ✅ Create payment sessions and charge customers
- ✅ Retrieve payment status
- ✅ Webhook signature verification and basic event handling
- ✅ Frontend integration (Payment Element, Checkout modal)
- ✅ 3D Secure / SCA support

### Pro Packages (Commercial License)

Advanced features available in separate Pro packages:

| Package | Description | License |
|---------|-------------|---------|
| `@squaredr/paykit-stripe-pro` | Refunds, payouts, subscriptions, dashboard | Commercial |
| `@squaredr/paykit-razorpay-pro` | Refunds, payouts, subscriptions, dashboard | Commercial |

**Pro features:**
- 🔥 Refunds and payouts
- 🔥 Full subscription lifecycle management
- 🔥 Transaction dashboard with analytics
- 🔥 Customer portal and payment method management
- 🔥 Dispute management and reconciliation

**Pricing (one-time payment):**
- **Single Adapter:** $29 (e.g., Stripe Pro only)
- **Starter Bundle:** $79 (up to 3 adapters)
- **All Access:** $249 (all current & future adapters + priority support)

[Learn more about PayKit Pro →](https://squaredr.tech/products/paykit#pricing)

---

## Quick Start

### 1. Install packages

```bash
# Backend
npm install @squaredr/paykit @squaredr/paykit-stripe

# Frontend (React)
npm install @squaredr/paykit-react @squaredr/paykit-stripe
```

### 2. Backend: Create a payment intent

```ts
import { PayKit } from '@squaredr/paykit';
import { StripeAdapter } from '@squaredr/paykit-stripe';

const paykit = new PayKit({
  adapter: new StripeAdapter({ secretKey: process.env.STRIPE_SECRET_KEY! })
});

// Create a charge
const charge = await paykit.charges.create({
  amount: 5000,
  currency: 'usd',
  metadata: { orderId: 'order_123' }
});

console.log(charge.clientSecret); // Send to frontend
```

### 3. Frontend: Collect payment

```tsx
import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react';
import { StripeClientAdapter } from '@squaredr/paykit-stripe/client';

function App() {
  const [clientSecret, setClientSecret] = useState<string>();

  useEffect(() => {
    fetch('/api/create-payment')
      .then(r => r.json())
      .then(data => setClientSecret(data.clientSecret));
  }, []);

  if (!clientSecret) return <div>Loading...</div>;

  return (
    <PayKitProvider clientAdapter={new StripeClientAdapter(process.env.NEXT_PUBLIC_STRIPE_KEY!)}>
      <CheckoutForm
        clientSecret={clientSecret}
        onSuccess={(result) => console.log('Payment succeeded:', result)}
        onError={(error) => console.error('Payment failed:', error)}
      />
    </PayKitProvider>
  );
}
```

---

## Documentation

- **[Core SDK](packages/core/README.md)** — Unified types, adapter system, provider routing
- **[Stripe Adapter](packages/adapter/stripe/README.md)** — Stripe integration (charges, subscriptions, webhooks)
- **[Razorpay Adapter](packages/adapter/razorpay/README.md)** — Razorpay integration (orders, UPI, netbanking)
- **[Frontend SDK](packages/sdk-js/README.md)** — Vanilla JS/TS headless SDK
- **[React Components](packages/react/README.md)** — `<CheckoutForm>`, `<CardInput>`, hooks

---

## Architecture

PayKit uses an **adapter pattern** to provide a unified API:

```
┌─────────────────────────────────────────────┐
│  Your Application                           │
│  (Express, Next.js, Fastify, etc.)          │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  @squaredr/paykit (Core)                    │
│  • Unified types (UnifiedCharge, etc.)      │
│  • PayKit client                            │
│  • Provider registry & routing              │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────┴─────────┬─────────┐
         ▼                   ▼         ▼
┌─────────────────┐  ┌──────────┐  ┌───────┐
│ StripeAdapter   │  │ Razorpay │  │ etc.  │
│ @squaredr/      │  │ Adapter  │  │       │
│ paykit-stripe   │  │          │  │       │
│ (FREE)          │  │ (FREE)   │  │       │
└─────────────────┘  └──────────┘  └───────┘
         │                   │
         ▼                   ▼
┌─────────────────┐  ┌──────────────────┐
│ Stripe SDK      │  │ Razorpay SDK     │
└─────────────────┘  └──────────────────┘

For advanced features:
         ┌─────────────────────┬──────────────────────┐
         ▼                     ▼                      ▼
┌──────────────────┐  ┌───────────────────┐  ┌──────────┐
│ StripeProAdapter │  │ RazorpayProAdapter│  │ etc.     │
│ (extends base)   │  │ (extends base)    │  │          │
│ • Refunds        │  │ • Refunds         │  │          │
│ • Payouts        │  │ • Payouts         │  │          │
│ • Dashboard UI   │  │ • Dashboard UI    │  │          │
└──────────────────┘  └───────────────────┘  └──────────┘
```

### Open Core Model

**Free Adapters** (open source) provide core payment acceptance:
- Create payment sessions
- Charge customers
- Retrieve payment status
- Handle webhooks

**Pro Adapters** (commercial) extend free adapters with:
- Refunds and payouts
- Full subscription management
- Transaction dashboard with analytics
- Customer portal and payment method management

Each adapter implements the same interface (`PaymentAdapter`), allowing you to swap providers without changing application code. Pro adapters extend the free adapters with additional methods and UI components.

---

## Development

This is a [Turborepo](https://turbo.build/repo) monorepo using npm workspaces.

### Prerequisites

- **Node.js** ≥ 20.0.0
- **npm** ≥ 11.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/squaredr/paykit.git
cd paykit

# Install dependencies
npm install

# Build all packages
npm run build

# Run all tests
npm test

# Run demo app (with hot reload)
npm run dev --workspace=apps/demo
```

### Project structure

```
paykit/
├── packages/
│   ├── core/              # @squaredr/paykit
│   ├── adapter/
│   │   ├── stripe/        # @squaredr/paykit-stripe (free)
│   │   ├── stripe-pro/    # @squaredr/paykit-stripe-pro (commercial)
│   │   ├── razorpay/      # @squaredr/paykit-razorpay (free)
│   │   └── razorpay-pro/  # @squaredr/paykit-razorpay-pro (commercial)
│   ├── sdk-js/            # @squaredr/paykit-js
│   └── react/             # @squaredr/paykit-react
├── apps/
│   └── demo/              # Next.js demo application
├── turbo.json             # Turborepo config
└── package.json           # Workspace root
```

**Note:** Pro packages (`*-pro`) will be released separately and are not yet available in this repository.

### Available commands

```bash
# Build all packages
npm run build

# Run tests across all packages
npm test

# Run tests in watch mode
npm run test:watch

# Type check all packages
npm run typecheck

# Lint with Biome
npm run lint

# Format code
npm run format

# Clean all build artifacts
npm run clean
```

### Adding a new adapter

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide on creating custom adapters.

---

## Demo App

A full-stack Next.js demo is included in [`apps/demo`](apps/demo):

```bash
cd apps/demo
cp .env.example .env.local  # Add your API keys
npm run dev
```

The demo includes:
- Provider selection page
- Checkout flow with Stripe Payment Element and Razorpay Checkout
- 3D Secure redirect handling
- Payment status polling
- Mock adapter for offline development

---

## Testing

All packages use [Vitest](https://vitest.dev/) for testing:

```bash
# Run all tests
npm test

# Run tests for a specific package
npm test --workspace=packages/core

# Watch mode
npm run test:watch
```

Current test coverage: **320 tests passing** across 15 test files.

---

## Publishing

This monorepo uses [Changesets](https://github.com/changesets/changesets) for version management and publishing.

```bash
# Create a changeset
npx changeset

# Version packages (bumps versions, updates CHANGELOG)
npx changeset version

# Publish to npm
npx changeset publish
```

---

## License

MIT License — see [LICENSE](LICENSE) for details.

**Open Source (MIT):**
- Core SDK (`@squaredr/paykit`)
- All base adapters (`@squaredr/paykit-stripe`, `@squaredr/paykit-razorpay`, etc.)
- Frontend SDKs (`@squaredr/paykit-js`, `@squaredr/paykit-react`)

**Commercial License (one-time purchase):**
- Pro adapters (`@squaredr/paykit-*-pro`) with advanced features
- Includes refunds, payouts, subscriptions, dashboards, and analytics
- Single adapter $29 / Starter bundle $79 / All Access $249
- Purchase at: [squaredr.tech/products/paykit](https://squaredr.tech/products/paykit#pricing)

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting PRs.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/squaredr/paykit/issues)
- **Discussions**: [GitHub Discussions](https://github.com/squaredr/paykit/discussions)
- **Docs**: [Documentation](https://squaredr.tech/products/paykit/docs)

---

Built with ❤️ by [SquaredR](https://github.com/squaredr)
