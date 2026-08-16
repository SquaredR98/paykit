---
title: Quick Start
description: >-
  Get up and running with PayKit in five minutes. Install, create a charge, collect payment on the frontend, handle webhooks, and swap providers.
---

Go from zero to accepting payments in five minutes. This guide walks you through installing PayKit, creating a charge on the server, collecting payment on the client, handling webhooks, and switching providers with a single line change.

## 1. Install packages

Install the core SDK together with the adapter for your payment provider. The example below uses Stripe, but you can swap it for any supported adapter later.

```bash title="Terminal"
# Core SDK + Stripe provider SDK
npm install @squaredr/paykit stripe

# React bindings (for frontend checkout)
npm install @squaredr/paykit-react
```

## 2. Backend: Create a payment intent

On your server, initialise PayKit with the Stripe adapter and create a charge. The returned `clientSecret` is what the frontend needs to confirm the payment.

```typescript title="server/checkout.ts"
import { PayKit } from '@squaredr/paykit'
import { StripeAdapter } from '@squaredr/paykit/stripe'

// Initialise PayKit with the Stripe adapter
const paykit = new PayKit({
  adapter: new StripeAdapter({
    secretKey: process.env.STRIPE_SECRET_KEY!,
  }),
})

// Create a charge (amount is in the smallest currency unit)
const charge = await paykit.charges.create({
  amount: 5000,          // $50.00
  currency: 'usd',
  metadata: {
    orderId: 'order_abc123',
    customer: 'cust_42',
  },
})

// Send the clientSecret to the frontend
console.log(charge.clientSecret)
```

## 3. Frontend: Collect payment

Wrap your checkout UI with `PayKitProvider` and render the pre-built `CheckoutForm`. The provider handles loading the correct provider SDK behind the scenes.

```tsx title="app/checkout/page.tsx"
'use client'

import { useState, useEffect } from 'react'
import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react'
import { StripeClientAdapter } from '@squaredr/paykit/stripe/client'

const stripeClient = new StripeClientAdapter(
  process.env.NEXT_PUBLIC_STRIPE_PK!
)

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/checkout', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
  }, [])

  if (!clientSecret) return <p>Loading...</p>

  return (
    <PayKitProvider clientAdapter={stripeClient} clientSecret={clientSecret}>
      <CheckoutForm
        onSuccess={(result) => {
          console.log('Payment succeeded:', result.id)
        }}
        onError={(err) => {
          console.error('Payment failed:', err.message)
        }}
      />
    </PayKitProvider>
  )
}
```

Note that `StripeClientAdapter` takes the publishable key as a plain string argument, and `PayKitProvider` uses the `clientAdapter` prop.

## 4. Handle webhooks

Webhooks let your server react to asynchronous payment events. PayKit normalises every provider's webhook payload into a unified event shape so your handler logic stays the same regardless of provider.

```typescript title="app/api/webhooks/route.ts"
import { PayKit } from '@squaredr/paykit'
import { StripeAdapter } from '@squaredr/paykit/stripe'

const paykit = new PayKit({
  adapter: new StripeAdapter({
    secretKey: process.env.STRIPE_SECRET_KEY!,
  }),
})

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!
  const secret = process.env.STRIPE_WEBHOOK_SECRET!

  // Verify the signature and parse the event
  const event = paykit.webhooks.construct({
    payload: body,
    signature,
    secret,
  })

  switch (event.type) {
    case 'charge.succeeded':
      console.log('Charge succeeded:', event.data.id)
      // fulfil the order
      break
    case 'charge.failed':
      console.log('Charge failed:', event.data.id)
      // notify the customer
      break
  }

  return new Response('ok', { status: 200 })
}
```

PayKit normalises 22 event types across all providers. See the [Webhooks Guide](/docs/guides/webhooks) for the full list and advanced patterns.

## 5. Switch providers

Because every adapter exposes the same interface, switching from Stripe to Razorpay (or any other supported provider) is a one-line change. Your charge creation code, webhook handler, and frontend components stay exactly the same.

```typescript title="server/checkout.ts"
// Before — Stripe
// import { StripeAdapter } from '@squaredr/paykit/stripe'

// After — Razorpay
import { RazorpayAdapter } from '@squaredr/paykit/razorpay'

const paykit = new PayKit({
  adapter: new RazorpayAdapter({
    keyId: process.env.RAZORPAY_KEY_ID!,
    keySecret: process.env.RAZORPAY_KEY_SECRET!,
  }),
})
```

Everything downstream — charges, webhooks, the React checkout — works without modification. You can also use the [PaymentRouter](/docs/guides/multi-provider) to run multiple providers simultaneously with currency-based or region-based routing.

## Next steps

- [Stripe Guide](/docs/guides/stripe) — deep dive into Stripe-specific configuration and features.
- [Razorpay Guide](/docs/guides/razorpay) — set up Razorpay for INR payments and UPI.
- [Webhooks Guide](/docs/guides/webhooks) — advanced webhook patterns, retry handling, and event mapping.
- [Multi-Provider Routing](/docs/guides/multi-provider) — run multiple providers with automatic routing.
