---
title: Razorpay Guide
description: >-
  Integrate Razorpay with PayKit for order-based payments, modal checkout, and webhook verification in India.
---

End-to-end guide for integrating Razorpay with PayKit — covering order creation, modal-based checkout, supported payment methods, and webhook verification.

## Installation

Install the core PayKit package along with the Razorpay SDK:

```bash title="Terminal"
npm install @squaredr/paykit razorpay
```

For frontend checkout, also install the React bindings:

```bash title="Terminal"
npm install @squaredr/paykit-react
```

## Backend Setup

Import PayKit and the Razorpay adapter, then initialise the client with your Razorpay key ID and key secret:

```typescript title="src/lib/paykit.ts"
import { PayKit } from '@squaredr/paykit'
import { RazorpayAdapter } from '@squaredr/paykit/razorpay'

const paykit = new PayKit({
  adapter: new RazorpayAdapter({
    keyId: process.env.RAZORPAY_KEY_ID!,
    keySecret: process.env.RAZORPAY_KEY_SECRET!,
  }),
})
```

## Creating an Order

Razorpay uses an **order-based** payment flow. You first create an order on the server, then the customer authorises the payment on the frontend. The `clientSecret` returned by PayKit contains the Razorpay `order_id` needed for the frontend SDK.

Amounts must be specified in **paise** (the smallest currency unit for INR). For example, `50000` represents ₹500.00.

```typescript title="src/app/api/checkout/route.ts"
import { paykit } from '@/lib/paykit'

export async function POST(request: Request) {
  const { amount, orderId } = await request.json()

  const charge = await paykit.charges.create({
    amount,        // amount in paise, e.g. 50000 = ₹500
    currency: 'INR',
    metadata: { orderId },
  })

  return Response.json({ clientSecret: charge.clientSecret })
}
```

## Frontend (React)

Wrap your checkout page with `PayKitProvider` and render the `CheckoutForm`. The `RazorpayClientAdapter` opens Razorpay's modal-based checkout overlay automatically when the customer submits the form.

```tsx title="src/components/Checkout.tsx"
'use client'

import {
  PayKitProvider,
  CheckoutForm,
} from '@squaredr/paykit-react'
import { RazorpayClientAdapter } from '@squaredr/paykit/razorpay/client'

const razorpayAdapter = new RazorpayClientAdapter(
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!
)

export default function Checkout({
  clientSecret,
}: {
  clientSecret: string
}) {
  return (
    <PayKitProvider
      clientAdapter={razorpayAdapter}
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

**Note:** Razorpay uses a modal-based checkout flow rather than inline card fields. The modal is managed by the Razorpay SDK and opened automatically by the adapter.

## Frontend (Vanilla JS)

Use the imperative `PayKitClient` API to trigger Razorpay's modal checkout without React:

```typescript title="src/checkout.ts"
import { PayKitClient } from '@squaredr/paykit-js'
import { RazorpayClientAdapter } from '@squaredr/paykit/razorpay/client'

const pk = new PayKitClient({
  clientAdapter: new RazorpayClientAdapter(
    'rzp_test_...'
  ),
})

async function checkout(clientSecret: string) {
  await pk.loadProvider()

  const result = await pk.confirmPayment(clientSecret)

  if (result.status === 'failed') {
    console.error(result.error?.message)
  } else {
    console.log('Payment confirmed:', result.chargeId)
  }
}
```

## Payment Methods

Razorpay supports a broad range of payment methods popular in India:

- **Cards** — Visa, Mastercard, RuPay, American Express, Diners Club
- **Netbanking** — 50+ banks including SBI, HDFC, ICICI, Axis, and Kotak
- **UPI** — Google Pay, PhonePe, Paytm, BHIM, and other UPI apps
- **Wallets** — Paytm, Mobikwik, Freecharge, Amazon Pay, and more
- **EMI** — Card-based and cardless EMI options from major banks

## Webhooks

Use the Razorpay adapter's `webhooks.construct` method to verify the `x-razorpay-signature` header and safely parse incoming events:

```typescript title="src/app/api/webhooks/razorpay/route.ts"
import { paykit } from '@/lib/paykit'

export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get('x-razorpay-signature')!
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!

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
    case 'refund.completed':
      // update records
      break
  }

  return new Response('ok', { status: 200 })
}
```

PayKit maps Razorpay's native event types to unified names. For example, `payment.captured` becomes `charge.succeeded`, and `refund.processed` becomes `refund.completed`. See the [Webhooks Guide](/docs/guides/webhooks) for the full mapping table.

## Test Credentials

Use the following credentials in Razorpay's test mode to simulate payment scenarios:

### Cards

| Field | Value |
|---|---|
| Card Number | `4111 1111 1111 1111` |
| CVV | Any 3 digits |
| Expiry | Any future date |
| OTP | `0007` |

### UPI

Use `success@razorpay` as the VPA for a successful UPI payment simulation.

### Netbanking

Use `test` / `test` as the username and password when redirected to the test bank page.

For the full list of test credentials, see the [Razorpay testing documentation](https://razorpay.com/docs/payments/payments/test-card-upi-details/).
