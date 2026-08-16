---
title: Multi-Provider Guide
description: >-
  Route payments to different providers based on currency, region, or custom rules using PayKit PaymentRouter.
---

Route payments to different providers based on currency, region, or custom rules. Send INR transactions to Razorpay, USD to Stripe, and EUR to PayPal — automatically.

## Why Multiple Providers?

- **Cost optimisation** — local providers often have lower fees for domestic transactions
- **Higher success rates** — UPI payments in India succeed more reliably through Razorpay than through Stripe
- **Redundancy** — if one provider has an outage, route to another
- **Regulatory compliance** — some regions require local payment processing

## Setting Up the Router

Create a `PaymentRouter` with routing rules and a default fallback adapter:

```typescript title="src/lib/paykit.ts"
import { PaymentRouter } from '@squaredr/paykit'
import { StripeAdapter } from '@squaredr/paykit/stripe'
import { RazorpayAdapter } from '@squaredr/paykit/razorpay'
import { PayPalAdapter } from '@squaredr/paykit/paypal'

const stripe = new StripeAdapter({
  secretKey: process.env.STRIPE_SECRET_KEY!,
})

const razorpay = new RazorpayAdapter({
  keyId: process.env.RAZORPAY_KEY_ID!,
  keySecret: process.env.RAZORPAY_KEY_SECRET!,
})

const paypal = new PayPalAdapter({
  clientId: process.env.PAYPAL_CLIENT_ID!,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
})

export const router = new PaymentRouter({
  routes: [
    { currency: 'INR', adapter: razorpay },
    { currency: 'USD', adapter: stripe },
    { currency: 'EUR', adapter: paypal },
  ],
  default: stripe,
})
```

## Using the Router

The router automatically selects the right adapter based on the charge parameters:

```typescript title="src/app/api/checkout/route.ts"
import { router } from '@/lib/paykit'

export async function POST(request: Request) {
  const { amount, currency, orderId } = await request.json()

  // Router picks Razorpay for INR, Stripe for USD, PayPal for EUR
  const charge = await router.createCharge({
    amount,
    currency,
    metadata: { orderId },
  })

  return Response.json({
    clientSecret: charge.clientSecret,
    provider: charge.provider,  // "stripe", "razorpay", or "paypal"
  })
}
```

## Routing Rules

Routes are evaluated in order. The first match wins. Each rule can include:

| Property | Type | Description |
|---|---|---|
| `currency` | `string` | ISO 4217 currency code (e.g. "INR", "USD") |
| `region` | `string` | Region identifier (e.g. "IN", "US", "EU") |
| `adapter` | `PaymentAdapter` | The adapter to use when this rule matches |

If no rule matches, the `default` adapter handles the charge.

## Previewing Routing Decisions

Use `resolveAdapter()` to check which adapter would be selected without creating a charge:

```typescript
const adapter = router.resolveAdapter({ currency: 'INR' })
console.log(adapter.name) // 'razorpay'

const adapter2 = router.resolveAdapter({ currency: 'GBP' })
console.log(adapter2.name) // 'stripe' (default fallback)
```

## Explicit Provider Override

You can bypass routing entirely by passing `_provider` in the charge params:

```typescript
// Force Stripe regardless of currency
const charge = await router.createCharge({
  amount: 50000,
  currency: 'INR',
  _provider: 'stripe',  // Overrides routing rules
})
```

## Handling Webhooks from Multiple Providers

When using `PaymentRouter`, use `router.webhooksFor()` to get webhook operations for each provider:

```typescript title="src/app/api/webhooks/stripe/route.ts"
import { router } from '@/lib/paykit'

export async function POST(req: Request) {
  const event = router.webhooksFor('stripe').construct({
    payload: await req.text(),
    signature: req.headers.get('stripe-signature')!,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  })

  await handlePaymentEvent(event)
  return new Response('ok')
}
```

```typescript title="src/app/api/webhooks/razorpay/route.ts"
import { router } from '@/lib/paykit'

export async function POST(req: Request) {
  const event = router.webhooksFor('razorpay').construct({
    payload: await req.text(),
    signature: req.headers.get('x-razorpay-signature')!,
    secret: process.env.RAZORPAY_WEBHOOK_SECRET!,
  })

  // Same handler — PayKit normalises the event shape
  await handlePaymentEvent(event)
  return new Response('ok')
}
```

Both endpoints call the same `handlePaymentEvent` function because PayKit normalises all webhook events into the same shape.

## Frontend: Dynamic Provider Selection

Return the provider name from your checkout API so the frontend can load the correct client adapter:

```tsx title="src/components/DynamicCheckout.tsx"
'use client'

import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react'
import { StripeClientAdapter } from '@squaredr/paykit/stripe/client'
import { RazorpayClientAdapter } from '@squaredr/paykit/razorpay/client'

const adapters = {
  stripe: new StripeClientAdapter(
    process.env.NEXT_PUBLIC_STRIPE_PK!
  ),
  razorpay: new RazorpayClientAdapter(
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!
  ),
}

export function DynamicCheckout({
  clientSecret,
  provider,
}: {
  clientSecret: string
  provider: 'stripe' | 'razorpay'
}) {
  return (
    <PayKitProvider
      clientAdapter={adapters[provider]}
      clientSecret={clientSecret}
    >
      <CheckoutForm
        onSuccess={(result) => console.log('Paid:', result.id)}
        onError={(err) => console.error(err.message)}
      />
    </PayKitProvider>
  )
}
```
