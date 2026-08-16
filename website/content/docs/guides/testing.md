---
title: Testing Guide
description: >-
  Test your PayKit integration with mock adapters, unit tests, and webhook simulation without hitting external APIs.
---

Test your payment integration without hitting external APIs. This guide covers mock adapters, unit testing patterns, webhook simulation, and error scenario testing.

## Why Mock?

Payment APIs are slow, rate-limited, and stateful. Hitting Stripe or Razorpay in your test suite means flaky tests, slow CI runs, and sandbox credentials leaking into your codebase. PayKit's adapter pattern makes mocking trivial — inject a fake adapter and your business logic runs identically.

## Creating a Mock Adapter

Build a mock adapter that implements the `PaymentAdapter` interface. You only need to implement the operations your code actually uses.

```typescript title="test/mock-adapter.ts"
import type {
  PaymentAdapter,
  ChargeOperations,
  RefundOperations,
  WebhookOperations,
  HealthStatus,
  ProviderCapabilities,
} from '@squaredr/paykit'

export class MockAdapter implements PaymentAdapter {
  readonly name = 'mock'
  readonly capabilities: ProviderCapabilities = {
    charges: true,
    authAndCapture: true,
    refunds: true,
    partialRefunds: true,
    subscriptions: false,
    savedPaymentMethods: false,
    hostedCheckout: false,
    embeddableUI: false,
    payouts: false,
    multiCurrency: true,
    directDebit: false,
    webhooks: true,
    threeDS: false,
  }

  // Track calls for assertions
  public chargesCreated: any[] = []
  public refundsCreated: any[] = []

  async initialize() {}
  async healthCheck(): Promise<HealthStatus> {
    return { healthy: true, latencyMs: 1 }
  }

  charges: ChargeOperations = {
    create: async (params) => {
      this.chargesCreated.push(params)
      return {
        id: `mock_ch_${Date.now()}`,
        providerId: `mock_pi_${Date.now()}`,
        provider: 'mock',
        amount: params.amount,
        currency: params.currency,
        status: 'succeeded',
        clientSecret: 'mock_secret_123',
        metadata: params.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
        _raw: {},
      }
    },
    retrieve: async (id) => ({
      id,
      providerId: id,
      provider: 'mock',
      amount: 5000,
      currency: 'usd',
      status: 'succeeded',
      clientSecret: 'mock_secret_123',
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      _raw: {},
    }),
    capture: async (id) => ({
      id,
      providerId: id,
      provider: 'mock',
      amount: 5000,
      currency: 'usd',
      status: 'succeeded',
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      _raw: {},
    }),
    cancel: async (id) => ({
      id,
      providerId: id,
      provider: 'mock',
      amount: 5000,
      currency: 'usd',
      status: 'canceled',
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      _raw: {},
    }),
    list: async () => ({ data: [], hasMore: false }),
  }

  refunds: RefundOperations = {
    create: async (params) => {
      this.refundsCreated.push(params)
      return {
        id: `mock_re_${Date.now()}`,
        providerId: `mock_re_${Date.now()}`,
        provider: 'mock',
        chargeId: params.chargeId,
        amount: params.amount || 5000,
        currency: 'usd',
        status: 'succeeded',
        createdAt: new Date(),
        _raw: {},
      }
    },
    retrieve: async (id) => ({
      id,
      providerId: id,
      provider: 'mock',
      chargeId: 'mock_ch_1',
      amount: 5000,
      currency: 'usd',
      status: 'succeeded',
      createdAt: new Date(),
      _raw: {},
    }),
    list: async () => ({ data: [], hasMore: false }),
  }

  customers: any = {}
  paymentMethods: any = {}
  webhooks: WebhookOperations = {
    verify: () => true,
    parse: (payload) => ({
      id: 'mock_evt_1',
      provider: 'mock',
      type: 'charge.succeeded',
      providerType: 'mock.charge.succeeded',
      data: JSON.parse(
        typeof payload === 'string' ? payload : payload.toString()
      ),
      createdAt: new Date(),
      _raw: {},
    }),
  }
}
```

## Using the Mock in Tests

Inject the mock adapter into PayKit and test your business logic directly:

```typescript title="test/checkout.test.ts"
import { describe, it, expect } from 'vitest'
import { PayKit } from '@squaredr/paykit'
import { MockAdapter } from './mock-adapter'

describe('Checkout', () => {
  it('creates a charge and returns clientSecret', async () => {
    const mock = new MockAdapter()
    const paykit = new PayKit({ adapter: mock })

    const charge = await paykit.charges.create({
      amount: 5000,
      currency: 'usd',
      metadata: { orderId: 'order_123' },
    })

    expect(charge.status).toBe('succeeded')
    expect(charge.clientSecret).toBeDefined()
    expect(charge.amount).toBe(5000)
    expect(mock.chargesCreated).toHaveLength(1)
    expect(mock.chargesCreated[0].metadata.orderId).toBe('order_123')
  })

  it('handles refunds', async () => {
    const mock = new MockAdapter()
    const paykit = new PayKit({ adapter: mock })

    const refund = await paykit.refunds.create({
      chargeId: 'ch_123',
      amount: 2500,
    })

    expect(refund.status).toBe('succeeded')
    expect(refund.amount).toBe(2500)
    expect(mock.refundsCreated).toHaveLength(1)
  })
})
```

## Testing Error Scenarios

Override specific methods to simulate failures:

```typescript title="test/errors.test.ts"
import { PayKit, PaymentError } from '@squaredr/paykit'
import { MockAdapter } from './mock-adapter'

it('handles declined cards', async () => {
  const mock = new MockAdapter()

  // Override create to throw
  mock.charges.create = async () => {
    throw new PaymentError({
      code: 'card_declined',
      message: 'Your card was declined.',
      provider: 'mock',
      isRetryable: false,
    })
  }

  const paykit = new PayKit({ adapter: mock })

  await expect(
    paykit.charges.create({ amount: 5000, currency: 'usd' })
  ).rejects.toThrow(PaymentError)
})
```

## Simulating Webhooks

Test your webhook handler by constructing events with the mock adapter:

```typescript title="test/webhooks.test.ts"
import { PayKit } from '@squaredr/paykit'
import { MockAdapter } from './mock-adapter'

it('processes charge.succeeded webhook', async () => {
  const mock = new MockAdapter()
  const paykit = new PayKit({ adapter: mock })

  const payload = JSON.stringify({
    id: 'ch_123',
    amount: 5000,
    status: 'succeeded',
  })

  const event = paykit.webhooks.construct({
    payload,
    signature: 'mock_sig',
    secret: 'mock_secret',
  })

  expect(event.type).toBe('charge.succeeded')
  expect(event.data.id).toBe('ch_123')
})
```

## Provider Sandbox Testing

For integration tests that hit the real provider sandbox, use test credentials. See the provider-specific guides for test card numbers and credentials:

- [Stripe test cards](/docs/guides/stripe#test-cards)
- [Razorpay test credentials](/docs/guides/razorpay#test-credentials)

> **Tip:** Keep sandbox tests separate from unit tests. Run them in a dedicated CI step with longer timeouts and rate-limit-aware retries.
