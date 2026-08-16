---
title: Introduction
description: >-
  PayKit is a unified payment SDK for JavaScript and TypeScript. One API surface across Stripe, Razorpay, PayPal, and more.
---

PayKit is a unified, type-safe payment SDK for Node.js and the browser. Write payment logic once and route it to any provider — swap Stripe for Razorpay (or run both) without changing your application code.

## Quick example

```ts
import { PayKit } from '@squaredr/paykit'
import { StripeAdapter } from '@squaredr/paykit/stripe'

const paykit = new PayKit({
  adapter: new StripeAdapter({
    secretKey: process.env.STRIPE_SECRET_KEY!,
  }),
})

const charge = await paykit.charges.create({
  amount: 5000,
  currency: 'USD',
  metadata: { orderId: 'order_123' },
})
```

## Architecture

| Layer | Package | What it does |
|-------|---------|-------------|
| Core | `@squaredr/paykit` | Unified types, client, router, error handling, validation, currency utilities. No UI, no framework deps. |
| JS SDK | `@squaredr/paykit-js` | Browser client for confirming payments and rendering checkout UIs. |
| React | `@squaredr/paykit-react` | React components (`PayKitProvider`, `CheckoutForm`) for payment UIs. |

Core is framework-agnostic. It works with Next.js, Express, Fastify, Hono, and any other Node.js framework.

## What's included (free, MIT)

- **Stripe, Razorpay, and PayPal adapters** — charges, refunds, customers, subscriptions, webhooks
- **PaymentRouter** — route transactions by currency, region, or custom rules
- **19 unified error codes** with auto-populated suggestions
- **22 normalised webhook event types** across all providers
- **React components** and a headless vanilla JS SDK
- **13 provider capability flags** for runtime feature detection

## Next steps

- [Installation](/docs/getting-started/installation) — install the SDK and your first adapter
- [Quick Start](/docs/getting-started/quick-start) — go from zero to accepting payments
- [Core Concepts](/docs/core-concepts/architecture) — understand the adapter pattern and unified types
