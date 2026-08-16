---
title: API Reference
description: >-
  Complete API reference for @squaredr/paykit — types, interfaces, classes, and utilities.
---

Complete reference for the `@squaredr/paykit` public API — classes, interfaces, types, and utility functions.

## PayKit

The main entry point. Wraps a provider adapter and exposes unified payment operations.

```typescript
import { PayKit } from '@squaredr/paykit'

const paykit = new PayKit({
  adapter: stripeAdapter,
})

paykit.charges      // ChargeOperations
paykit.refunds      // RefundOperations
paykit.customers    // CustomerOperations
paykit.webhooks     // WebhookOperations
paykit.provider     // string — adapter name
paykit.capabilities // ProviderCapabilities
```

## ChargeOperations

```typescript
interface ChargeOperations {
  create(params: CreateChargeParams): Promise<UnifiedCharge>
  retrieve(id: string): Promise<UnifiedCharge>
  capture(id: string, params?: CaptureParams): Promise<UnifiedCharge>
  cancel(id: string, options?: RequestOptions): Promise<UnifiedCharge>
  list(params?: ListParams): Promise<PaginatedList<UnifiedCharge>>
}
```

### CreateChargeParams

```typescript
interface CreateChargeParams {
  amount: number           // Smallest currency unit (e.g. cents)
  currency: string         // ISO 4217 (e.g. "USD", "INR")
  source?: string          // Payment source ID
  customer?: string        // Customer ID
  description?: string
  metadata?: Record<string, string>
  capture?: boolean        // Auto-capture (default: true)
  _provider?: string       // Force a specific provider (router)
  idempotencyKey?: string
  timeout?: number
}
```

### UnifiedCharge

```typescript
interface UnifiedCharge {
  id: string
  providerId: string
  provider: string
  amount: number
  currency: string
  status: ChargeStatus
  description?: string
  clientSecret?: string
  customer?: { id: string; email?: string }
  paymentMethod?: PaymentMethodSummary
  refundedAmount?: number
  metadata?: Record<string, string>
  redirectUrl?: string
  requestId?: string
  createdAt: Date
  updatedAt: Date
  _raw: unknown   // Provider-specific raw response
  _meta?: ResponseMeta
}

type ChargeStatus =
  | 'pending'
  | 'requires_action'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded'
  | 'partially_refunded'
```

## RefundOperations

```typescript
interface RefundOperations {
  create(params: CreateRefundParams): Promise<UnifiedRefund>
  retrieve(id: string): Promise<UnifiedRefund>
  list(params?: ListParams): Promise<PaginatedList<UnifiedRefund>>
}

interface CreateRefundParams {
  chargeId: string
  amount?: number           // Partial refund amount
  reason?: string
  metadata?: Record<string, string>
}

interface UnifiedRefund {
  id: string
  providerId: string
  provider: string
  chargeId: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed' | 'canceled'
  reason?: string
  metadata?: Record<string, string>
  createdAt: Date
  _raw: unknown
}
```

## CustomerOperations

```typescript
interface CustomerOperations {
  create(params: CreateCustomerParams): Promise<UnifiedCustomer>
  retrieve(id: string): Promise<UnifiedCustomer>
  update(id: string, params: UpdateCustomerParams): Promise<UnifiedCustomer>
  delete(id: string): Promise<void>
  list(params?: ListParams): Promise<PaginatedList<UnifiedCustomer>>
}

interface UnifiedCustomer {
  id: string
  providerId: string
  provider: string
  email?: string
  name?: string
  phone?: string
  metadata?: Record<string, string>
  createdAt: Date
  _raw: unknown
}
```

## WebhookOperations

```typescript
interface WebhookOperations {
  verify(payload: string | Buffer, headers: Record<string, string>, secret: string): boolean
  parse(payload: string | Buffer, headers: Record<string, string>, secret: string): UnifiedWebhookEvent
}

interface UnifiedWebhookEvent {
  id: string
  provider: string
  type: WebhookEventType
  providerType: string     // Original provider event name
  data: unknown
  createdAt: Date
  _raw: unknown
}

type WebhookEventType =
  | 'charge.succeeded'
  | 'charge.failed'
  | 'charge.pending'
  | 'charge.refunded'
  | 'charge.captured'
  | 'charge.canceled'
  | 'charge.disputed'
  | 'charge.chargeback_created'
  | 'charge.dispute_resolved'
  | 'refund.created'
  | 'refund.completed'
  | 'refund.updated'
  | 'refund.failed'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.renewed'
  | 'subscription.canceled'
  | 'subscription.payment_failed'
  | 'customer.created'
  | 'customer.updated'
  | 'payout.completed'
  | 'payout.failed'
```

## SubscriptionOperations

```typescript
interface SubscriptionOperations {
  create(params: CreateSubscriptionParams): Promise<UnifiedSubscription>
  retrieve(id: string): Promise<UnifiedSubscription>
  update(id: string, params: UpdateSubscriptionParams): Promise<UnifiedSubscription>
  cancel(id: string, params?: CancelSubscriptionParams): Promise<UnifiedSubscription>
  list(params?: ListParams): Promise<PaginatedList<UnifiedSubscription>>
}

interface UnifiedSubscription {
  id: string
  providerId: string
  provider: string
  customerId: string
  status: SubscriptionStatus
  amount: number
  currency: string
  interval: BillingInterval
  intervalCount: number
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  metadata?: Record<string, string>
  createdAt: Date
  _raw: unknown
}

type SubscriptionStatus =
  | 'active' | 'past_due' | 'canceled'
  | 'paused' | 'trialing' | 'unpaid' | 'incomplete'

type BillingInterval = 'day' | 'week' | 'month' | 'year'
```

## PaymentRouter

Route payments to different providers based on currency, region, or explicit override.

```typescript
import { PaymentRouter } from '@squaredr/paykit'

const router = new PaymentRouter({
  routes: [
    { currency: 'INR', adapter: razorpay },
    { currency: 'USD', adapter: stripe },
  ],
  default: stripe,
})

// Create a charge — router picks the right adapter
await router.createCharge({ amount: 5000, currency: 'INR' })

// Preview routing decision
router.resolveAdapter({ currency: 'INR' }) // → razorpay

// Get webhook operations for a specific provider
router.webhooksFor('stripe').construct({ payload, signature, secret })
```

## PaymentAdapter

The interface that all provider adapters implement. Use this to build custom adapters.

```typescript
interface PaymentAdapter {
  readonly name: string
  readonly capabilities: ProviderCapabilities

  initialize(credentials: ProviderCredentials): Promise<void>
  healthCheck(): Promise<HealthStatus>

  charges: ChargeOperations
  refunds: RefundOperations
  customers: CustomerOperations
  paymentMethods: PaymentMethodOperations
  webhooks: WebhookOperations
  subscriptions?: SubscriptionOperations
  payouts?: PayoutOperations
}

interface ProviderCapabilities {
  charges: boolean
  authAndCapture: boolean
  refunds: boolean
  partialRefunds: boolean
  subscriptions: boolean
  savedPaymentMethods: boolean
  hostedCheckout: boolean
  embeddableUI: boolean
  payouts: boolean
  multiCurrency: boolean
  directDebit: boolean
  webhooks: boolean
  threeDS: boolean
}
```

## Error Handling

```typescript
class PaymentError extends Error {
  readonly code: PaymentErrorCode
  readonly provider: string
  readonly providerCode?: string
  readonly providerMessage?: string
  readonly isRetryable: boolean
  readonly suggestion: string
  readonly httpStatus?: number
  readonly requestId?: string
  readonly _raw?: unknown
}

class NotSupportedError extends PaymentError {
  // Thrown when an adapter doesn't support an operation
}

class ValidationError extends PaymentError {
  readonly field?: string
  // Thrown when input parameters fail validation
}

class PaymentTimeoutError extends PaymentError {
  readonly timeoutMs: number
  // Thrown when a provider request exceeds the configured timeout
}

class ProviderUnavailableError extends PaymentError {
  // Thrown when a provider's health check fails
}

type PaymentErrorCode =
  | 'card_declined'
  | 'insufficient_funds'
  | 'invalid_card'
  | 'expired_card'
  | 'processing_error'
  | 'authentication_required'
  | 'rate_limit'
  | 'network_error'
  | 'invalid_request'
  | 'provider_unavailable'
  | 'not_supported'
  | 'not_found'
  | 'duplicate_transaction'
  | 'fraud_detected'
  | 'currency_not_supported'
  | 'amount_too_small'
  | 'amount_too_large'
  | 'already_captured'
  | 'already_refunded'
```

Each error code has an auto-populated `suggestion` field with a human-readable fix recommendation.

## Currency Utilities

```typescript
import { toSmallestUnit, fromSmallestUnit } from '@squaredr/paykit'

// Convert human-readable amounts to smallest unit
toSmallestUnit(10, 'USD')   // 1000  (cents)
toSmallestUnit(500, 'INR')  // 50000 (paise)
toSmallestUnit(1000, 'JPY') // 1000  (yen — zero-decimal)

// Convert back
fromSmallestUnit(1000, 'USD')  // 10
fromSmallestUnit(50000, 'INR') // 500
```

## Common Types

```typescript
interface PaginatedList<T> {
  data: T[]
  hasMore: boolean
  totalCount?: number
}

interface ListParams {
  limit?: number
  startingAfter?: string
  endingBefore?: string
}

interface RequestOptions {
  idempotencyKey?: string
  timeout?: number
}
```
