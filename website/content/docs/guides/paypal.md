---
title: PayPal Guide
description: >-
  Integrate PayPal with PayKit for order-based payments, PayPal Buttons, inline card fields, and webhook verification.
---

End-to-end guide for integrating PayPal with PayKit — covering backend setup, frontend checkout with PayPal Buttons and Advanced Card Fields, and webhook verification.

## Installation

Install the core PayKit package. PayPal does not require a separate provider SDK — the adapter uses the PayPal REST API directly via `@paypal/paypal-server-sdk` (bundled as a dependency).

```bash title="Terminal"
npm install @squaredr/paykit
```

For frontend checkout, also install the React bindings:

```bash title="Terminal"
npm install @squaredr/paykit-react
```

## Backend Setup

Import PayKit and the PayPal adapter, then initialise the client with your PayPal client ID and secret:

```typescript title="src/lib/paykit.ts"
import { PayKit } from '@squaredr/paykit'
import { PayPalAdapter } from '@squaredr/paykit/paypal'

const paykit = new PayKit({
  adapter: new PayPalAdapter({
    clientId: process.env.PAYPAL_CLIENT_ID!,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
    sandbox: process.env.PAYPAL_SANDBOX ?? 'true',
  }),
})
```

Set `sandbox` to `'false'` for production. When omitted or set to any value other than `'false'`, the adapter connects to PayPal's sandbox environment.

## Creating an Order

PayPal uses an **order-based** payment flow. You create an order on the server, the customer approves it on the frontend (via PayPal Buttons or card fields), and then the order is captured.

PayPal amounts are decimal strings internally (e.g. `"50.00"`), but PayKit normalises this — you pass amounts in the **smallest currency unit** (cents) just like with any other adapter:

```typescript title="src/app/api/checkout/route.ts"
import { paykit } from '@/lib/paykit'

export async function POST(request: Request) {
  const { amount, currency, orderId } = await request.json()

  const charge = await paykit.charges.create({
    amount,        // in cents, e.g. 5000 = $50.00
    currency,
    metadata: { orderId },
  })

  return Response.json({ clientSecret: charge.clientSecret })
}
```

The `clientSecret` contains the PayPal order ID needed for frontend approval.

## Frontend (React)

Wrap your checkout page with `PayKitProvider` and render the `CheckoutForm`. The `PayPalClientAdapter` renders PayPal Buttons (and optionally inline card fields) automatically.

```tsx title="src/components/Checkout.tsx"
'use client'

import {
  PayKitProvider,
  CheckoutForm,
} from '@squaredr/paykit-react'
import { PayPalClientAdapter } from '@squaredr/paykit/paypal/client'

const paypalAdapter = new PayPalClientAdapter(
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
)

export default function Checkout({
  clientSecret,
}: {
  clientSecret: string
}) {
  return (
    <PayKitProvider
      clientAdapter={paypalAdapter}
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

The `PayPalClientAdapter` constructor takes the client ID as a plain string. You can pass an optional second argument for customisation:

```typescript
const paypalAdapter = new PayPalClientAdapter(
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  {
    currency: 'EUR',
    buttonStyle: {
      layout: 'vertical',
      color: 'gold',
      shape: 'rect',
      label: 'pay',
    },
  }
)
```

## Frontend (Vanilla JS)

Use the imperative `PayKitClient` API for non-React setups:

```typescript title="src/checkout.ts"
import { PayKitClient } from '@squaredr/paykit-js'
import { PayPalClientAdapter } from '@squaredr/paykit/paypal/client'

const pk = new PayKitClient({
  clientAdapter: new PayPalClientAdapter(
    'your_paypal_client_id'
  ),
})

async function checkout(clientSecret: string) {
  await pk.loadProvider()

  await pk.mountCardInput('#paypal-container', { clientSecret })

  const result = await pk.confirmPayment(clientSecret)

  if (result.status === 'failed') {
    console.error(result.error?.message)
  } else {
    console.log('Payment confirmed:', result.chargeId)
  }
}
```

## Checkout Modes

The PayPal client adapter supports two checkout modes:

### PayPal Buttons

Always rendered. Opens the standard PayPal popup where the customer logs in and approves the payment. Works on every PayPal merchant account with no special enablement.

### Advanced Card Fields

Optional. Renders inline card number, expiry, and CVV iframes — similar to Stripe's Payment Element. Only available when your PayPal merchant account has **Advanced Card Processing** enabled. If not eligible, the adapter falls back to PayPal Buttons only.

To disable card fields even when eligible:

```typescript
const paypalAdapter = new PayPalClientAdapter(clientId, {
  disableCardFields: true,
})
```

## Payment Methods

PayPal supports:

- **PayPal Wallet** — pay with PayPal balance, linked bank accounts, or linked cards
- **Debit and Credit Cards** — Visa, Mastercard, American Express, Discover (via Advanced Card Fields)
- **Pay Later** — PayPal Pay in 4, PayPal Credit (market-dependent)
- **Venmo** — available in the US when enabled on your PayPal account

## Webhooks

Use the adapter's `webhooks.construct` method to parse incoming webhook events. PayPal webhook verification uses the postback API (`verify-webhook-signature`):

```typescript title="src/app/api/webhooks/paypal/route.ts"
import { paykit } from '@/lib/paykit'

export async function POST(request: Request) {
  const payload = await request.text()
  const headers = Object.fromEntries(request.headers.entries())
  const secret = process.env.PAYPAL_WEBHOOK_ID!

  const event = paykit.webhooks.construct({
    payload,
    signature: JSON.stringify(headers),
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

PayKit maps PayPal's native event types to unified names. For example, `PAYMENT.CAPTURE.COMPLETED` becomes `charge.succeeded`, and `PAYMENT.CAPTURE.REVERSED` becomes `refund.completed`. See the [Webhooks Guide](/docs/guides/webhooks) for the full mapping table.

## Environment Variables

```bash title=".env"
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_SANDBOX=true
PAYPAL_WEBHOOK_ID=your_webhook_id
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
```

The `NEXT_PUBLIC_` prefixed variable is used by the frontend adapter. `PAYPAL_WEBHOOK_ID` is the webhook ID from your PayPal developer dashboard, used for webhook signature verification.

## Sandbox Testing

Use PayPal's sandbox environment for testing. Create sandbox accounts at [developer.paypal.com](https://developer.paypal.com/):

1. Create a **sandbox business account** (merchant) to get your client ID and secret
2. Create a **sandbox personal account** (buyer) to simulate payments

When testing in the browser, log in with the sandbox personal account credentials when the PayPal popup appears.

For the full testing guide, see the [PayPal sandbox documentation](https://developer.paypal.com/tools/sandbox/).
