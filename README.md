# PayKit

<div align="center">

![PayKit Banner](https://squaredr.tech/assets/paykit-banner.png)

**One API for Stripe, Razorpay, PayPal, and 25+ payment providers**

[![npm version](https://img.shields.io/npm/v/@squaredr/paykit.svg)](https://www.npmjs.com/package/@squaredr/paykit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-252%20passing-brightgreen)](https://github.com/SquaredR98/paykit)

[Features](#-features) •
[Quick Start](#-quick-start) •
[Documentation](#-documentation) •
[Examples](#-examples) •
[Adapters](#-supported-providers)

</div>

---

## Why PayKit?

**Problem:** Payment providers have different APIs, data formats, and integration patterns. Switching providers or supporting multiple regions means rewriting your entire payment stack.

**Solution:** PayKit provides a **single, type-safe API** that works across all major payment providers. Write your integration once, swap providers instantly.

```typescript
// Same code works for Stripe, Razorpay, PayPal, and 25+ providers
const charge = await paykit.charges.create({
  amount: 5000,
  currency: 'usd',
  metadata: { orderId: 'order_123' }
});
```

**Switch providers in 2 lines:**
```diff
- import { StripeAdapter } from '@squaredr/paykit/stripe';
- const paykit = new PayKit({ adapter: new StripeAdapter({ secretKey }) });
+ import { RazorpayAdapter } from '@squaredr/paykit/razorpay';
+ const paykit = new PayKit({ adapter: new RazorpayAdapter({ keyId, keySecret }) });
```

Your business logic stays the same. No rewrites. No vendor lock-in.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 Unified API
One interface for charges, refunds, customers, subscriptions, webhooks, and payment methods across **all providers**

### 🔒 Type-Safe
Full TypeScript coverage with normalized types. IntelliSense works everywhere, catching errors at compile-time

### 🔌 Zero Lock-In
Swap providers without changing business logic. Test locally with mock adapter, deploy with real providers

</td>
<td width="50%">

### 🪝 Normalized Webhooks
Unified webhook events regardless of provider. Write one handler for all payment events

### 🌍 Multi-Provider Routing
Route payments by currency, region, or custom rules. Accept INR via Razorpay, USD via Stripe automatically

### ⚛️ React Components
Drop-in `<CheckoutForm>`, `<CardInput>`, and hooks. Works with Stripe Elements, Razorpay Checkout, PayPal buttons

</td>
</tr>
</table>

**Plus:** Tree-shakeable exports • Official SDKs under the hood • Comprehensive error normalization • Health checks • Test mode support • Edge runtime compatible

---

## 📦 Packages

| Package | Description | Size | npm |
|---------|-------------|------|-----|
| **[@squaredr/paykit](packages/core)** | Core SDK + all adapters (Stripe, Razorpay, PayPal) | 26 KB | [![npm](https://img.shields.io/npm/v/@squaredr/paykit)](https://www.npmjs.com/package/@squaredr/paykit) |
| **[@squaredr/paykit-react](packages/react)** | React components & hooks | 7 KB | [![npm](https://img.shields.io/npm/v/@squaredr/paykit-react)](https://www.npmjs.com/package/@squaredr/paykit-react) |
| **[@squaredr/paykit-js](packages/sdk-js)** | Vanilla JS/TS frontend SDK (headless) | 4 KB | [![npm](https://img.shields.io/npm/v/@squaredr/paykit-js)](https://www.npmjs.com/package/@squaredr/paykit-js) |

---

## 🚀 Quick Start

### Installation

```bash
# Install core SDK
npm install @squaredr/paykit

# Install provider SDKs (peer dependencies - choose what you need)
npm install stripe              # For Stripe
npm install razorpay            # For Razorpay
npm install @paypal/paypal-server-sdk  # For PayPal

# For React
npm install @squaredr/paykit-react
```

### Backend: Create a Payment

```typescript
import { PayKit } from '@squaredr/paykit';
import { StripeAdapter } from '@squaredr/paykit/stripe';

// Initialize with your provider
const paykit = new PayKit({
  adapter: new StripeAdapter({
    secretKey: process.env.STRIPE_SECRET_KEY!
  })
});

// Create a charge
const charge = await paykit.charges.create({
  amount: 5000,        // $50.00 (amounts in smallest unit)
  currency: 'usd',
  description: 'Premium subscription',
  metadata: {
    userId: 'user_123',
    plan: 'premium'
  }
});

// Send clientSecret to frontend
res.json({ clientSecret: charge.clientSecret });
```

### Frontend: Collect Payment (React)

```tsx
import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react';
import { StripeClientAdapter } from '@squaredr/paykit/stripe/client';

function App() {
  const [clientSecret, setClientSecret] = useState('');

  return (
    <PayKitProvider
      clientAdapter={new StripeClientAdapter(process.env.NEXT_PUBLIC_STRIPE_KEY!)}
    >
      <CheckoutForm
        clientSecret={clientSecret}
        onSuccess={(result) => {
          console.log('Payment successful!', result);
          // Show success message, redirect to thank you page
        }}
        onError={(error) => {
          console.error('Payment failed:', error.message);
          // Show error message
        }}
        appearance={{
          theme: 'stripe',
          variables: { colorPrimary: '#0070f3' }
        }}
      />
    </PayKitProvider>
  );
}
```

### Handle Webhooks

```typescript
import express from 'express';

app.post('/webhooks', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;

  // Verify and parse webhook
  const event = paykit.webhooks.construct({
    payload: req.body,
    signature,
    secret: process.env.STRIPE_WEBHOOK_SECRET!
  });

  // Handle unified events (same for all providers!)
  switch (event.type) {
    case 'charge.succeeded':
      await fulfillOrder(event.data.id);
      break;
    case 'charge.failed':
      await handleFailure(event.data.id);
      break;
    case 'subscription.canceled':
      await cancelAccess(event.data.customer);
      break;
  }

  res.json({ received: true });
});
```

---

## 🔌 Supported Providers

### Free & Open Source (MIT License)

| Provider | Status | Subpath Import | Features |
|----------|--------|----------------|----------|
| **Stripe** | ✅ Stable | `@squaredr/paykit/stripe` | Charges, Refunds, Customers, Subscriptions, Payment Methods, Webhooks |
| **Razorpay** | ✅ Stable | `@squaredr/paykit/razorpay` | Charges, Refunds, Customers, Subscriptions, Payment Methods, Webhooks |
| **PayPal** | ✅ Stable | `@squaredr/paykit/paypal` | Charges, Refunds, Subscriptions, Payment Methods (Vault), Webhooks |
| **Mock** | ✅ Stable | `@squaredr/paykit/testing` | Full API simulation for local development |

**Frontend Adapters:**
- `@squaredr/paykit/stripe/client` - Stripe Elements integration
- `@squaredr/paykit/razorpay/client` - Razorpay Checkout integration

### Coming Soon (Paid Adapter Bundles)

Additional providers available as one-time purchase adapter bundles:

| Bundle | Price | Providers Included |
|--------|-------|-------------------|
| **Individual** | $19 | Any single provider |
| **India Pack** | $49 | Cashfree, PhonePe, Paytm, BillDesk |
| **Global Pack** | $79 | Square, Adyen, Mollie, Braintree, Authorize.net |
| **All Access** | $149 | All current + future adapters (lifetime) |

[View Pricing & Roadmap →](https://squaredr.tech/products/paykit#pricing)

---

## 💡 Examples

### Multi-Provider Routing

Route payments intelligently based on currency or region:

```typescript
import { PaymentRouter } from '@squaredr/paykit';
import { StripeAdapter } from '@squaredr/paykit/stripe';
import { RazorpayAdapter } from '@squaredr/paykit/razorpay';

const router = new PaymentRouter({
  adapters: [
    new StripeAdapter({ secretKey: process.env.STRIPE_SECRET_KEY! }),
    new RazorpayAdapter({
      keyId: process.env.RAZORPAY_KEY_ID!,
      keySecret: process.env.RAZORPAY_KEY_SECRET!
    })
  ],
  rules: [
    { currency: 'inr', provider: 'razorpay' },  // INR → Razorpay
    { currency: 'usd', provider: 'stripe' },     // USD → Stripe
    { default: 'stripe' }                        // Fallback → Stripe
  ]
});

// Automatically routes to the right provider
const charge = await router.createCharge({
  amount: 50000,
  currency: 'inr'  // Will use Razorpay
});
```

### Subscriptions

```typescript
// Create a subscription
const subscription = await paykit.subscriptions.create({
  customer: 'cus_123',
  amount: 2999,           // $29.99/month
  currency: 'usd',
  interval: 'month',
  intervalCount: 1
});

// Cancel subscription
await paykit.subscriptions.cancel(subscription.id);

// List customer subscriptions
const subs = await paykit.subscriptions.list({ customer: 'cus_123' });
```

### Refunds

```typescript
// Full refund
await paykit.refunds.create({
  chargeId: 'ch_123',
  reason: 'Customer requested'
});

// Partial refund
await paykit.refunds.create({
  chargeId: 'ch_123',
  amount: 2500,  // $25.00
  reason: 'Partial order cancellation'
});
```

### Error Handling

```typescript
import { PaymentError } from '@squaredr/paykit';

try {
  await paykit.charges.create({ amount, currency });
} catch (error) {
  if (error instanceof PaymentError) {
    switch (error.code) {
      case 'card_declined':
        // Show user-friendly message
        break;
      case 'insufficient_funds':
        // Suggest alternative payment method
        break;
      case 'authentication_required':
        // Trigger 3D Secure flow
        break;
      default:
        // Generic error handling
    }
  }
}
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│        Your Application Layer            │
│   (Express, Next.js, Fastify, etc.)      │
└─────────────────┬────────────────────────┘
                  │
                  v
┌──────────────────────────────────────────┐
│      @squaredr/paykit (Core)             │
│  • PayKit Client                         │
│  • Unified Types & Interfaces            │
│  • Payment Router                        │
│  • Error Normalization                   │
└─────────────────┬────────────────────────┘
                  │
       ┌──────────┴──────────┬──────────────┐
       v                     v              v
┌─────────────┐      ┌─────────────┐  ┌──────────────┐
│ Stripe      │      │ Razorpay    │  │ PayPal       │
│ Adapter     │      │ Adapter     │  │ Adapter      │
└──────┬──────┘      └──────┬──────┘  └──────┬───────┘
       │                    │                 │
       v                    v                 v
┌─────────────┐      ┌─────────────┐  ┌──────────────────────┐
│ stripe      │      │ razorpay    │  │ @paypal/paypal-      │
│ (npm)       │      │ (npm)       │  │ server-sdk (npm)     │
│ Peer Dep    │      │ Peer Dep    │  │ Peer Dep             │
└─────────────┘      └─────────────┘  └──────────────────────┘
```

**How it works:**
1. Your app uses PayKit's unified API
2. PayKit routes to the appropriate adapter
3. Adapter translates to provider's native SDK
4. Provider SDK makes actual API calls
5. Response is normalized back to PayKit types

**Benefits:**
- ✅ Use official SDKs under the hood (not reinventing the wheel)
- ✅ Swap providers without code changes
- ✅ Test locally with mock adapter
- ✅ Tree-shake unused adapters (only bundle what you use)

---

## 🧪 Development

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.15.3 (recommended) or npm >= 11.0.0

### Setup

```bash
git clone https://github.com/SquaredR98/paykit.git
cd paykit
pnpm install
pnpm run build
pnpm test
```

### Project Structure

```
paykit/
├── packages/
│   ├── core/          # @squaredr/paykit (SDK + all adapters)
│   │   ├── src/
│   │   │   ├── adapters/
│   │   │   │   ├── stripe/      # Stripe adapter + client
│   │   │   │   ├── razorpay/    # Razorpay adapter + client
│   │   │   │   └── paypal/      # PayPal adapter
│   │   │   ├── types/           # Unified types
│   │   │   └── index.ts         # Main exports
│   │   └── package.json
│   ├── sdk-js/        # @squaredr/paykit-js (frontend SDK)
│   └── react/         # @squaredr/paykit-react (React components)
├── website/           # Documentation site (Fumadocs)
├── turbo.json
└── package.json
```

### Commands

```bash
pnpm run build          # Build all packages
pnpm test               # Run all tests (252 passing)
pnpm run test:watch     # Watch mode
pnpm run typecheck      # Type check all packages
pnpm run lint           # Lint with Biome
pnpm run lint:fix       # Auto-fix linting issues
pnpm run clean          # Clean build artifacts
```

### Testing

All packages use [Vitest](https://vitest.dev/).

```bash
# Run all tests
pnpm test

# Test specific package
pnpm test --filter @squaredr/paykit

# Watch mode
pnpm test:watch

# Coverage
pnpm test --coverage
```

---

## 📚 Documentation

**Full documentation:** [squaredr.tech/products/paykit/docs](https://squaredr.tech/products/paykit/docs)

### Getting Started
- [Installation](https://squaredr.tech/products/paykit/docs/getting-started/installation)
- [Quick Start](https://squaredr.tech/products/paykit/docs/getting-started/quick-start)
- [Core Concepts](https://squaredr.tech/products/paykit/docs/getting-started/concepts)

### Provider Guides
- [Stripe Integration](https://squaredr.tech/products/paykit/docs/guides/stripe)
- [Razorpay Integration](https://squaredr.tech/products/paykit/docs/guides/razorpay)
- [PayPal Integration](https://squaredr.tech/products/paykit/docs/guides/paypal)
- [Multi-Provider Setup](https://squaredr.tech/products/paykit/docs/guides/multi-provider)

### Advanced
- [Webhook Handling](https://squaredr.tech/products/paykit/docs/advanced/webhooks)
- [Error Handling](https://squaredr.tech/products/paykit/docs/advanced/errors)
- [Testing Strategies](https://squaredr.tech/products/paykit/docs/advanced/testing)
- [Payment Routing](https://squaredr.tech/products/paykit/docs/advanced/routing)

### API Reference
- [PayKit Core](https://squaredr.tech/products/paykit/docs/reference/core)
- [Adapters](https://squaredr.tech/products/paykit/docs/reference/adapters)
- [React Components](https://squaredr.tech/products/paykit/docs/reference/react)
- [Types](https://squaredr.tech/products/paykit/docs/reference/types)

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Areas We Need Help

- 🐛 Bug fixes and issue reports
- 📝 Documentation improvements
- ✨ Feature requests and RFC discussions
- 🧪 Test coverage expansion
- 🌍 Internationalization

---

## 📄 License

**MIT License** - see [LICENSE](LICENSE) for details.

### What's Free?

✅ Core SDK (`@squaredr/paykit`)
✅ All included adapters (Stripe, Razorpay, PayPal)
✅ React components (`@squaredr/paykit-react`)
✅ JS SDK (`@squaredr/paykit-js`)
✅ Mock/testing adapter
✅ Full source code
✅ Commercial use allowed
✅ No attribution required

### What's Paid?

Additional provider adapters (Square, Adyen, Cashfree, etc.) are available as **one-time purchase** adapter bundles. No subscriptions, no vendor lock-in.

[View Pricing →](https://squaredr.tech/products/paykit#pricing)

---

## 💬 Support

- **Issues:** [GitHub Issues](https://github.com/SquaredR98/paykit/issues)
- **Discussions:** [GitHub Discussions](https://github.com/SquaredR98/paykit/discussions)
- **Docs:** [squaredr.tech/products/paykit/docs](https://squaredr.tech/products/paykit/docs)
- **Email:** support@squaredr.tech
- **Twitter:** [@SquaredRDev](https://twitter.com/SquaredRDev)

---

## 🌟 Show Your Support

If PayKit saves you time and effort, please consider:

- ⭐ Starring the repo
- 🐦 Sharing on Twitter
- 📝 Writing a blog post about your experience
- 💬 Joining our [community discussions](https://github.com/SquaredR98/paykit/discussions)

---

## 🗺️ Roadmap

### Q1 2027
- ✅ Core SDK with Stripe & Razorpay
- ✅ React components
- ✅ PayPal adapter (official SDK migration)
- 🚧 Documentation site
- 📅 Square adapter (paid)
- 📅 Adyen adapter (paid)

### Q2 2027
- 📅 India Pack (Cashfree, PhonePe, Paytm)
- 📅 Global Pack (Mollie, Braintree, Authorize.net)
- 📅 Advanced routing rules
- 📅 Payment analytics dashboard

### Q3 2027
- 📅 Mobile SDKs (React Native, Flutter)
- 📅 Serverless framework plugins
- 📅 CLI for provider migration

[Full Roadmap →](https://squaredr.tech/products/paykit#roadmap)

---

<div align="center">

**Built with ❤️ by [SquaredR](https://github.com/SquaredR98)**

[Website](https://squaredr.tech) •
[Documentation](https://squaredr.tech/products/paykit/docs) •
[GitHub](https://github.com/SquaredR98/paykit) •
[npm](https://www.npmjs.com/package/@squaredr/paykit)

</div>
