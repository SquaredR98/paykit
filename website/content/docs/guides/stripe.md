---
title: Stripe Guide
description: >-
  Integrate Stripe with PayKit for server-side and client-side payments, 3D Secure handling, and webhook processing.
---

End-to-end guide for integrating Stripe with PayKit's unified payment abstraction — covering backend setup, frontend checkout, 3D Secure, and webhooks.

## Installation

Install the core PayKit package along with the Stripe SDK:

```bash title="Terminal"
npm install @squaredr/paykit stripe
```

For frontend checkout, also install the React bindings:

```bash title="Terminal"
npm install @squaredr/paykit-react
```

## Backend Setup

Import PayKit and the Stripe adapter, then initialise the client with your Stripe secret key.

```typescript title="src/lib/paykit.ts"
import { PayKit } from '@squaredr/paykit'
import { StripeAdapter } from '@squaredr/paykit/stripe'

const paykit = new PayKit({
  adapter: new StripeAdapter({
    secretKey: process.env.STRIPE_SECRET_KEY!,
  }),
})
```

## Creating a Payment Intent

Use `paykit.charges.create` to create a payment intent on the server. The returned `clientSecret` is passed to your frontend to confirm the payment.

```typescript title="src/app/api/checkout/route.ts"
import { paykit } from '@/lib/paykit'

export async function POST(request: Request) {
  const { amount, currency, orderId } = await request.json()

  const charge = await paykit.charges.create({
    amount,
    currency,
    metadata: { orderId },
  })

  return Response.json({ clientSecret: charge.clientSecret })
}
```

## Frontend (React)

Wrap your checkout page with `PayKitProvider` and use the `CheckoutForm` component to collect card details. The `StripeClientAdapter` bridges PayKit's UI layer with the Stripe Payment Element.

```tsx title="src/components/Checkout.tsx"
'use client'

import {
  PayKitProvider,
  CheckoutForm,
} from '@squaredr/paykit-react'
import { StripeClientAdapter } from '@squaredr/paykit/stripe/client'

const stripeAdapter = new StripeClientAdapter(
  process.env.NEXT_PUBLIC_STRIPE_PK!
)

export default function Checkout({
  clientSecret,
}: {
  clientSecret: string
}) {
  return (
    <PayKitProvider
      clientAdapter={stripeAdapter}
      clientSecret={clientSecret}
    >
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

Note that `StripeClientAdapter` takes the publishable key as a plain string, and `PayKitProvider` uses the `clientAdapter` prop (not `adapter`).

## Frontend (Vanilla JS)

If you are not using React, the imperative `PayKitClient` API gives you full control over the payment lifecycle.

```typescript title="src/checkout.ts"
import { PayKitClient } from '@squaredr/paykit-js'
import { StripeClientAdapter } from '@squaredr/paykit/stripe/client'

const pk = new PayKitClient({
  clientAdapter: new StripeClientAdapter(
    'pk_test_...'
  ),
})

async function checkout(clientSecret: string) {
  await pk.loadProvider()

  await pk.mountCardInput('#card-element', { clientSecret })

  const result = await pk.confirmPayment(clientSecret, {
    returnUrl: window.location.origin + '/order/confirm',
  })

  if (result.status === 'failed') {
    console.error(result.error?.message)
  } else {
    console.log('Payment confirmed:', result.chargeId)
  }
}
```

## Handling 3D Secure

Stripe's Payment Element handles 3D Secure authentication automatically when required by the card issuer. No additional code is needed for inline challenges.

For redirect-based 3D Secure flows, pass a `returnUrl` so the customer is sent back to your site after completing authentication:

```typescript
const result = await pk.confirmPayment(clientSecret, {
  returnUrl: 'https://example.com/order/confirm',
})
```

On the return page, check the payment status and display the appropriate confirmation or error message.

## Webhooks

Use the adapter's `webhooks.construct` method to verify incoming webhook events and handle them safely:

```typescript title="src/app/api/webhooks/stripe/route.ts"
import { paykit } from '@/lib/paykit'

export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature')!
  const secret = process.env.STRIPE_WEBHOOK_SECRET!

  const event = paykit.webhooks.construct({
    payload,
    signature,
    secret,
  })

  switch (event.type) {
    case 'charge.succeeded':
      // fulfil the order
      break
    case 'charge.failed':
      // notify the customer
      break
    case 'refund.created':
      // update records
      break
  }

  return new Response('ok', { status: 200 })
}
```

PayKit maps Stripe's native event types to unified names automatically. For example, `payment_intent.succeeded` becomes `charge.succeeded`. See the [Webhooks Guide](/docs/guides/webhooks) for the full mapping table.

## Test Cards

Use these card numbers in Stripe's test mode to simulate different payment scenarios:

| Card Number | Scenario |
|---|---|
| `4242 4242 4242 4242` | Success |
| `4000 0025 0000 3155` | 3D Secure required |
| `4000 0000 0000 9995` | Declined |

Use any future expiry date and any 3-digit CVC. For the full list of test cards, see the [Stripe testing documentation](https://docs.stripe.com/testing).
