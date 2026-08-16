---
title: Handling Webhooks
description: >-
  Set up, verify, and process webhooks from Stripe, Razorpay, and PayPal using PayKit's unified webhook API.
---

Receive real-time payment events from any provider, verify their authenticity, and process them reliably with PayKit's unified webhook layer.

## Why Webhooks?

Payment providers send webhooks to notify your server about events such as successful payments, failed charges, and completed refunds. Webhooks are far more reliable than client-side callbacks or polling because they are delivered server-to-server, ensuring your application stays in sync with the provider even when the customer closes their browser mid-payment.

## Setting Up

Follow these three steps to start receiving webhooks:

1. **Configure an endpoint** in your payment provider's dashboard (e.g. `https://example.com/api/webhooks/stripe`).
2. **Copy the webhook secret** provided by the dashboard and store it in your environment variables.
3. **Add a POST handler** at the matching path in your server to receive and process events.

## Verifying Signatures

Every webhook request includes a cryptographic signature. Use `paykit.webhooks.construct` to verify the signature and parse the event in one step:

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
      await fulfillOrder(event.data.metadata.orderId)
      break
    case 'charge.failed':
      await notifyCustomer(event.data.metadata.orderId)
      break
    case 'refund.completed':
      await updateRefundRecords(event.data)
      break
  }

  return new Response('ok', { status: 200 })
}
```

> **Always verify webhook signatures.** Without verification, an attacker could forge webhook payloads and trick your server into fulfilling fraudulent orders. Never skip this step in production.

## Unified Event Types

PayKit normalises provider-specific event names into a consistent set of 22 unified event types. Here are the most common mappings:

| PayKit Event | Stripe | Razorpay | PayPal |
|---|---|---|---|
| `charge.succeeded` | `payment_intent.succeeded` | `payment.captured` | `PAYMENT.CAPTURE.COMPLETED` |
| `charge.failed` | `payment_intent.payment_failed` | `payment.failed` | `PAYMENT.CAPTURE.DENIED` |
| `charge.pending` | — | — | `PAYMENT.CAPTURE.PENDING` |
| `charge.refunded` | `charge.refunded` | — | `PAYMENT.CAPTURE.REFUNDED` |
| `charge.captured` | `charge.captured` | — | — |
| `charge.canceled` | `payment_intent.canceled` | — | — |
| `charge.disputed` | `charge.dispute.created` | — | `CUSTOMER.DISPUTE.CREATED` |
| `refund.created` | `refund.created` | `refund.created` | — |
| `refund.completed` | `refund.updated` | `refund.processed` | `PAYMENT.CAPTURE.REVERSED` |
| `refund.failed` | `refund.failed` | `refund.failed` | — |
| `subscription.created` | `customer.subscription.created` | `subscription.activated` | `BILLING.SUBSCRIPTION.CREATED` |
| `subscription.renewed` | `invoice.payment_succeeded` | `subscription.charged` | — |
| `subscription.canceled` | `customer.subscription.deleted` | `subscription.cancelled` | — |
| `subscription.payment_failed` | `invoice.payment_failed` | `subscription.halted` | — |
| `customer.created` | `customer.created` | — | — |
| `customer.updated` | `customer.updated` | — | — |
| `payout.completed` | `payout.paid` | — | — |
| `payout.failed` | `payout.failed` | — | — |

### UnifiedWebhookEvent Shape

Every parsed webhook returns the same interface:

```typescript title="UnifiedWebhookEvent"
interface UnifiedWebhookEvent {
  id: string              // Unique event ID from the provider
  provider: string        // 'stripe' | 'razorpay' | 'paypal'
  type: WebhookEventType  // Unified event name (e.g. 'charge.succeeded')
  providerType: string    // Original event name (e.g. 'payment_intent.succeeded')
  data: unknown           // Event payload (shape varies by event type)
  createdAt: Date         // When the event was created
  _raw: unknown           // Raw provider payload
}
```

## Multi-Provider Webhooks

If your application accepts payments from multiple providers, you have two options for structuring your webhook endpoints.

### Separate Endpoints (Recommended)

Create a dedicated route for each provider. This is the recommended approach because each provider uses a different signature scheme:

```text
/api/webhooks/stripe     → uses STRIPE_WEBHOOK_SECRET
/api/webhooks/razorpay   → uses RAZORPAY_WEBHOOK_SECRET
/api/webhooks/paypal     → uses PAYPAL_WEBHOOK_SECRET
```

### Using PaymentRouter

If you use `PaymentRouter` for multi-provider routing, use `router.webhooksFor()` to get the webhook operations for a specific provider:

```typescript title="src/app/api/webhooks/stripe/route.ts"
import { router } from '@/lib/paykit-router'

export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature')!
  const secret = process.env.STRIPE_WEBHOOK_SECRET!

  const event = router.webhooksFor('stripe').construct({
    payload,
    signature,
    secret,
  })

  await handlePayKitEvent(event)

  return new Response('ok', { status: 200 })
}
```

### Single Endpoint with Provider Detection

Alternatively, detect the provider from the request headers:

```typescript title="src/app/api/webhooks/route.ts"
import { stripePaykit, razorpayPaykit } from '@/lib/paykit'

export async function POST(request: Request) {
  const payload = await request.text()
  const headers = Object.fromEntries(request.headers)

  let event

  if (headers['stripe-signature']) {
    event = stripePaykit.webhooks.construct({
      payload,
      signature: headers['stripe-signature'],
      secret: process.env.STRIPE_WEBHOOK_SECRET!,
    })
  } else if (headers['x-razorpay-signature']) {
    event = razorpayPaykit.webhooks.construct({
      payload,
      signature: headers['x-razorpay-signature'],
      secret: process.env.RAZORPAY_WEBHOOK_SECRET!,
    })
  } else {
    return new Response('Unknown provider', { status: 400 })
  }

  await handlePayKitEvent(event)

  return new Response('ok', { status: 200 })
}
```

## Testing Locally

Webhooks require a publicly accessible URL. During local development, use a tunnel to forward events to your machine.

### ngrok

```bash title="Terminal"
ngrok http 3000
```

Copy the generated `https://` URL and paste it into your provider's webhook dashboard.

### Stripe CLI

Stripe provides a dedicated CLI for forwarding test webhooks:

```bash title="Terminal"
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Razorpay

Razorpay offers a webhook simulator in the dashboard under **Account Settings → Webhooks → Test**. Enter your ngrok URL and select the event type to send a test payload.

## Idempotency

Providers may deliver the same webhook more than once. Always check whether an event has already been processed before acting on it:

```typescript title="src/lib/webhook-handler.ts"
import { db } from '@/lib/db'
import type { UnifiedWebhookEvent } from '@squaredr/paykit'

export async function handlePayKitEvent(event: UnifiedWebhookEvent) {
  // Check if this webhook was already processed
  const existing = await db.processedWebhooks.findUnique({
    where: { webhookId: event.id },
  })

  if (existing) {
    console.log('Webhook already processed:', event.id)
    return
  }

  // Process the event
  switch (event.type) {
    case 'charge.succeeded':
      await fulfillOrder(event.data.metadata.orderId)
      break
    case 'refund.completed':
      await updateRefundRecords(event.data)
      break
  }

  // Record the webhook as processed
  await db.processedWebhooks.create({
    data: {
      webhookId: event.id,
      eventType: event.type,
      processedAt: new Date(),
    },
  })
}
```

## Error Handling

Return a `2xx` status code to acknowledge successful receipt. If your handler throws or returns a `5xx`, most providers will retry the delivery with exponential back-off. Wrap your handler in a try/catch to avoid accidental retries:

```typescript
export async function POST(request: Request) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature')!

    const event = paykit.webhooks.construct({
      payload,
      signature,
      secret: process.env.STRIPE_WEBHOOK_SECRET!,
    })

    await handlePayKitEvent(event)

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('Webhook processing failed:', err)
    // Return 500 so the provider retries later
    return new Response('Internal error', { status: 500 })
  }
}
```
