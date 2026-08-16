---
title: Migration Guides
description: >-
  Migrate your existing Stripe or Razorpay integration to PayKit with minimal code changes.
---

Already using Stripe or Razorpay directly? Migrate to PayKit with minimal code changes. Your provider-specific code becomes provider-agnostic without losing any functionality.

## Migrating from Stripe SDK

### 1. Install PayKit

```bash title="Terminal"
# You already have stripe installed — just add PayKit
npm install @squaredr/paykit
```

### 2. Replace Stripe client with PayKit

```typescript title="Before — Stripe SDK directly"
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Create a payment intent
const intent = await stripe.paymentIntents.create({
  amount: 5000,
  currency: 'usd',
  metadata: { orderId: 'order_123' },
})

const clientSecret = intent.client_secret
```

```typescript title="After — PayKit"
import { PayKit } from '@squaredr/paykit'
import { StripeAdapter } from '@squaredr/paykit/stripe'

const paykit = new PayKit({
  adapter: new StripeAdapter({
    secretKey: process.env.STRIPE_SECRET_KEY!,
  }),
})

// Same result, provider-agnostic
const charge = await paykit.charges.create({
  amount: 5000,
  currency: 'usd',
  metadata: { orderId: 'order_123' },
})

const clientSecret = charge.clientSecret
```

### 3. Replace webhook handler

```typescript title="Before — Stripe webhooks"
const sig = req.headers['stripe-signature']!
const event = stripe.webhooks.constructEvent(body, sig, secret)

switch (event.type) {
  case 'payment_intent.succeeded':
    const intent = event.data.object as Stripe.PaymentIntent
    await fulfillOrder(intent.metadata.orderId)
    break
}
```

```typescript title="After — PayKit webhooks"
const event = paykit.webhooks.construct({
  payload: body,
  signature: req.headers.get('stripe-signature')!,
  secret: process.env.STRIPE_WEBHOOK_SECRET!,
})

switch (event.type) {
  case 'charge.succeeded':
    await fulfillOrder(event.data.metadata.orderId)
    break
}
```

### 4. Frontend — Replace Stripe Elements

```tsx title="Before — @stripe/react-stripe-js"
import { Elements, PaymentElement, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe('pk_test_...')

function CheckoutForm() {
  const stripe = useStripe()
  // ... lots of Stripe-specific code
}
```

```tsx title="After — @squaredr/paykit-react"
import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react'
import { StripeClientAdapter } from '@squaredr/paykit/stripe/client'

const adapter = new StripeClientAdapter('pk_test_...')

function Checkout({ clientSecret }: { clientSecret: string }) {
  return (
    <PayKitProvider clientAdapter={adapter} clientSecret={clientSecret}>
      <CheckoutForm
        onSuccess={(result) => console.log('Paid:', result.id)}
        onError={(err) => console.error(err.message)}
      />
    </PayKitProvider>
  )
}
```

### API mapping

| Stripe SDK | PayKit |
|---|---|
| `stripe.paymentIntents.create()` | `paykit.charges.create()` |
| `stripe.paymentIntents.retrieve()` | `paykit.charges.retrieve()` |
| `stripe.paymentIntents.capture()` | `paykit.charges.capture()` |
| `stripe.paymentIntents.cancel()` | `paykit.charges.cancel()` |
| `stripe.refunds.create()` | `paykit.refunds.create()` |
| `stripe.customers.create()` | `paykit.customers.create()` |
| `stripe.webhooks.constructEvent()` | `paykit.webhooks.construct()` |

### Accessing Stripe-specific data

If you need data that PayKit doesn't normalise, use the `_raw` escape hatch:

```typescript
import type Stripe from 'stripe'

const charge = await paykit.charges.create({ amount: 5000, currency: 'usd' })

// Access Stripe-specific fields
const intent = charge._raw as Stripe.PaymentIntent
console.log(intent.latest_charge)
console.log(intent.payment_method_options)
```

## Migrating from Razorpay SDK

### 1. Install PayKit

```bash title="Terminal"
# You already have razorpay installed — just add PayKit
npm install @squaredr/paykit
```

### 2. Replace Razorpay client with PayKit

```typescript title="Before — Razorpay SDK directly"
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Create an order
const order = await razorpay.orders.create({
  amount: 50000,     // paise
  currency: 'INR',
  receipt: 'order_123',
})
```

```typescript title="After — PayKit"
import { PayKit } from '@squaredr/paykit'
import { RazorpayAdapter } from '@squaredr/paykit/razorpay'

const paykit = new PayKit({
  adapter: new RazorpayAdapter({
    keyId: process.env.RAZORPAY_KEY_ID!,
    keySecret: process.env.RAZORPAY_KEY_SECRET!,
  }),
})

// Same result, provider-agnostic
const charge = await paykit.charges.create({
  amount: 50000,
  currency: 'INR',
  metadata: { orderId: 'order_123' },
})
```

### 3. Replace webhook handler

```typescript title="Before — Razorpay webhooks"
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils'

const isValid = validateWebhookSignature(body, signature, secret)
if (!isValid) throw new Error('Invalid signature')

const event = JSON.parse(body)
if (event.event === 'payment.captured') {
  // handle payment
}
```

```typescript title="After — PayKit webhooks"
const event = paykit.webhooks.construct({
  payload: body,
  signature: req.headers.get('x-razorpay-signature')!,
  secret: process.env.RAZORPAY_WEBHOOK_SECRET!,
})

// Signature verified automatically, event normalised
switch (event.type) {
  case 'charge.succeeded':    // was "payment.captured"
    await fulfillOrder(event.data.metadata.orderId)
    break
}
```

### API mapping

| Razorpay SDK | PayKit |
|---|---|
| `razorpay.orders.create()` | `paykit.charges.create()` |
| `razorpay.payments.fetch()` | `paykit.charges.retrieve()` |
| `razorpay.payments.capture()` | `paykit.charges.capture()` |
| `razorpay.refunds.create()` | `paykit.refunds.create()` |
| `razorpay.customers.create()` | `paykit.customers.create()` |
| `validateWebhookSignature()` | `paykit.webhooks.construct()` |

### Key differences

- Razorpay uses a two-step flow (create order then capture payment). PayKit's `charges.create()` handles the order creation step. The `clientSecret` contains the Razorpay order ID for frontend confirmation.
- Amounts are always in the smallest currency unit (paise for INR). No conversion needed.
- Webhook event names are normalised: `payment.captured` becomes `charge.succeeded`.
