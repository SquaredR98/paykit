---
title: Installation
description: Install PayKit packages, configure TypeScript, and set up environment variables for Stripe, Razorpay, and PayPal.
---

Install the PayKit packages you need, configure TypeScript, and set up environment variables for your payment providers.

## Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 11.0.0 (or the equivalent pnpm / yarn version)

## Package overview

| Package | Description | Install when |
|---------|-------------|-------------|
| `@squaredr/paykit` | Core SDK + all adapters (Stripe, Razorpay, PayPal) | Always — required by every project |
| `@squaredr/paykit-react` | React components and hooks | React or Next.js frontends |

## Backend installation

Install the core SDK alongside one or more provider SDKs. Pick the command that matches your stack.

### Stripe

```bash
npm install @squaredr/paykit stripe
```

### Razorpay

```bash
npm install @squaredr/paykit razorpay
```

### PayPal

```bash
npm install @squaredr/paykit
```

PayPal does not require a separate SDK — the PayPal adapter uses the PayPal REST API directly.

### Multiple providers

```bash
npm install @squaredr/paykit stripe razorpay
```

Adapters are built into the core package as subpath exports. Install the provider SDK (`stripe`, `razorpay`) as a peer dependency, then import the adapter from `@squaredr/paykit/stripe`, `@squaredr/paykit/razorpay`, or `@squaredr/paykit/paypal`.

> **Auto-registration:** Importing an adapter subpath (e.g. `import '@squaredr/paykit/stripe'`) automatically registers it with the adapter registry. You do not need to call `registerAdapter()` manually for built-in adapters.

## Frontend installation

### React / Next.js

```bash
npm install @squaredr/paykit-react
```

## TypeScript configuration

All PayKit packages ship with full type declarations. Make sure your `tsconfig.json` uses the `bundler` module resolution so that subpath exports (like `@squaredr/paykit/stripe` and `@squaredr/paykit/stripe/client`) resolve correctly.

> **Bundler note:** Use static `import` statements for PayKit subpath exports. Dynamic `import()` of subpath exports (e.g. `await import('@squaredr/paykit/stripe/client')`) may fail in some bundlers such as Next.js Turbopack.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## Environment variables

Each provider adapter reads credentials from environment variables. Create a `.env` file (or `.env.local` in Next.js) at the root of your project.

### Stripe

```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Razorpay

```bash
RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

### PayPal

```bash
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_SANDBOX=true
```

> **Security:** Never commit `.env` files to version control. Add `.env` and `.env.local` to your `.gitignore`. In production, inject secrets via your hosting provider's environment variable settings (Vercel, Railway, AWS, etc.).

## Next steps

Everything is installed. Head to the [Quick Start](/docs/getting-started/quick-start) guide to create your first charge and collect a payment.
