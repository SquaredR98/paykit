---
title: Custom adapters
description: Build a custom PaymentAdapter to connect any payment provider to PayKit's unified API.
---

## When to build a custom adapter

PayKit ships adapters for Stripe, Razorpay, and PayPal. If your provider isn't on the list, you can implement the `PaymentAdapter` interface yourself and plug it in. Your application code stays the same — only the adapter changes.

## The PaymentAdapter interface

Every adapter implements this contract:

```ts
import type {
  PaymentAdapter,
  HealthStatus,
  ChargeOperations,
  RefundOperations,
  CustomerOperations,
  PaymentMethodOperations,
  WebhookOperations,
  SubscriptionOperations,
  PayoutOperations,
} from '@squaredr/paykit';
import type { ProviderCapabilities } from '@squaredr/paykit';
import type { ProviderCredentials } from '@squaredr/paykit';

export interface PaymentAdapter {
  readonly name: string;
  readonly capabilities: ProviderCapabilities;

  initialize(credentials: ProviderCredentials): Promise<void>;
  healthCheck(): Promise<HealthStatus>;

  // Required
  charges: ChargeOperations;
  refunds: RefundOperations;
  customers: CustomerOperations;
  paymentMethods: PaymentMethodOperations;
  webhooks: WebhookOperations;

  // Optional
  subscriptions?: SubscriptionOperations;
  payouts?: PayoutOperations;
}
```

Five operation groups are required. Two — `subscriptions` and `payouts` — are optional. If your provider doesn't support them, omit them and set the corresponding capability flags to `false`.

## Declaring capabilities

The `ProviderCapabilities` object tells PayKit what your adapter supports at runtime. The SDK checks these flags before calling optional operations and throws `NotSupportedError` when a capability is `false`.

```ts
const capabilities: ProviderCapabilities = {
  charges: true,
  authAndCapture: false, // set true if your provider supports auth + capture
  refunds: true,
  partialRefunds: false,
  subscriptions: false,
  savedPaymentMethods: false,
  hostedCheckout: false,
  embeddableUI: false,
  payouts: false,
  multiCurrency: true,
  directDebit: false,
  webhooks: true,
  threeDS: false,
};
```

All 13 flags must be set explicitly — there are no defaults.

## Step-by-step: build a minimal adapter

This example builds an adapter for a fictional provider called **Acme Pay**. It covers charges, refunds, and webhooks — the minimum useful adapter.

### 1. Scaffold the class

```ts
import type {
  PaymentAdapter,
  ChargeOperations,
  RefundOperations,
  CustomerOperations,
  PaymentMethodOperations,
  WebhookOperations,
  HealthStatus,
} from '@squaredr/paykit';
import type { ProviderCapabilities } from '@squaredr/paykit';
import type { ProviderCredentials } from '@squaredr/paykit';
import { PaymentError, NotSupportedError } from '@squaredr/paykit';

export class AcmePayAdapter implements PaymentAdapter {
  readonly name = 'acme-pay';
  readonly capabilities: ProviderCapabilities = {
    charges: true,
    authAndCapture: false,
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
  };

  private apiKey!: string;
  private baseUrl = 'https://api.acmepay.com/v1';

  async initialize(credentials: ProviderCredentials): Promise<void> {
    const creds = credentials as Record<string, string>;
    if (!creds.apiKey) {
      throw new Error('Missing apiKey for Acme Pay adapter.');
    }
    this.apiKey = creds.apiKey;
  }

  async healthCheck(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return {
        healthy: res.ok,
        latencyMs: Date.now() - start,
      };
    } catch {
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        message: 'Acme Pay API unreachable',
      };
    }
  }

  // Operation groups implemented below...
  charges!: ChargeOperations;
  refunds!: RefundOperations;
  customers!: CustomerOperations;
  paymentMethods!: PaymentMethodOperations;
  webhooks!: WebhookOperations;
}
```

### 2. Implement charges

Each operation in `ChargeOperations` returns a `UnifiedCharge` — you write mapper functions that convert the provider's response format into PayKit's unified type.

```ts
import type { UnifiedCharge, CreateChargeParams, CaptureParams } from '@squaredr/paykit';
import type { ListParams, PaginatedList, RequestOptions } from '@squaredr/paykit';

// Inside the AcmePayAdapter class:

charges: ChargeOperations = {
  create: async (params: CreateChargeParams): Promise<UnifiedCharge> => {
    const res = await this.request('POST', '/charges', {
      amount: params.amount,
      currency: params.currency,
      description: params.description,
      metadata: params.metadata,
    });
    return this.mapCharge(res);
  },

  retrieve: async (id: string): Promise<UnifiedCharge> => {
    const res = await this.request('GET', `/charges/${id}`);
    return this.mapCharge(res);
  },

  capture: async (id: string, params?: CaptureParams): Promise<UnifiedCharge> => {
    throw new NotSupportedError('acme-pay', 'charges.capture');
  },

  cancel: async (id: string, options?: RequestOptions): Promise<UnifiedCharge> => {
    const res = await this.request('POST', `/charges/${id}/cancel`);
    return this.mapCharge(res);
  },

  list: async (params?: ListParams): Promise<PaginatedList<UnifiedCharge>> => {
    const res = await this.request('GET', '/charges', {
      limit: params?.limit ?? 10,
      after: params?.startingAfter,
    });
    return {
      data: res.items.map(this.mapCharge),
      hasMore: res.has_more,
    };
  },
};
```

### 3. Write mapper functions

Mappers convert provider responses to unified types. Keep them as pure functions.

```ts
private mapCharge(raw: any): UnifiedCharge {
  return {
    id: raw.id,
    providerId: raw.id,
    provider: 'acme-pay',
    amount: raw.amount,
    currency: raw.currency.toUpperCase(),
    status: this.mapChargeStatus(raw.state),
    description: raw.description ?? undefined,
    metadata: raw.metadata ?? undefined,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at ?? raw.created_at),
    _raw: raw,
  };
}

private mapChargeStatus(state: string): UnifiedCharge['status'] {
  const map: Record<string, UnifiedCharge['status']> = {
    completed: 'succeeded',
    pending: 'pending',
    failed: 'failed',
    voided: 'canceled',
    refunded: 'refunded',
    partial_refund: 'partially_refunded',
  };
  return map[state] ?? 'pending';
}
```

### 4. Map provider errors to PaymentError

When the provider returns an error, throw a `PaymentError` with the appropriate unified error code. PayKit has 19 error codes — map the provider's codes to the closest match.

```ts
import { PaymentError } from '@squaredr/paykit';
import type { PaymentErrorCode } from '@squaredr/paykit';

const ACME_ERROR_MAP: Record<string, PaymentErrorCode> = {
  card_declined: 'card_declined',
  bad_card: 'invalid_card',
  no_funds: 'insufficient_funds',
  rate_limited: 'rate_limit',
  not_found: 'not_found',
};

private async request(method: string, path: string, body?: unknown) {
  const res = await fetch(`${this.baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new PaymentError({
      code: ACME_ERROR_MAP[error.code] ?? 'processing_error',
      message: error.message,
      provider: 'acme-pay',
      providerCode: error.code,
      providerMessage: error.message,
      isRetryable: error.code === 'rate_limited',
      httpStatus: res.status,
      _raw: error,
    });
  }

  return res.json();
}
```

### 5. Handle webhooks

Webhook operations have two methods: `verify` (returns a boolean) and `parse` (returns a `UnifiedWebhookEvent`).

```ts
import type { UnifiedWebhookEvent, WebhookEventType } from '@squaredr/paykit';
import { createHmac } from 'node:crypto';

webhooks: WebhookOperations = {
  verify: (
    payload: string | Buffer,
    headers: Record<string, string>,
    secret: string,
  ): boolean => {
    const signature = headers['x-acme-signature'];
    if (!signature) return false;
    const expected = createHmac('sha256', secret)
      .update(typeof payload === 'string' ? payload : payload.toString())
      .digest('hex');
    return signature === expected;
  },

  parse: (
    payload: string | Buffer,
    headers: Record<string, string>,
    secret: string,
  ): UnifiedWebhookEvent => {
    if (!this.webhooks.verify(payload, headers, secret)) {
      throw new Error('Invalid webhook signature');
    }
    const body = JSON.parse(typeof payload === 'string' ? payload : payload.toString());

    const EVENT_MAP: Record<string, WebhookEventType> = {
      'payment.completed': 'charge.succeeded',
      'payment.failed': 'charge.failed',
      'refund.completed': 'refund.completed',
    };

    return {
      id: body.event_id,
      provider: 'acme-pay',
      type: EVENT_MAP[body.type] ?? ('charge.succeeded' as WebhookEventType),
      providerType: body.type,
      data: body.data,
      createdAt: new Date(body.timestamp),
      _raw: body,
    };
  },
};
```

### 6. Implement remaining required operations

Customers, refunds, and payment methods follow the same pattern — call the provider API, map the response to the unified type. If your provider doesn't support an operation (e.g. stored payment methods), throw `NotSupportedError`:

```ts
import { NotSupportedError } from '@squaredr/paykit';

paymentMethods: PaymentMethodOperations = {
  create: async () => { throw new NotSupportedError('acme-pay', 'paymentMethods.create'); },
  retrieve: async () => { throw new NotSupportedError('acme-pay', 'paymentMethods.retrieve'); },
  attach: async () => { throw new NotSupportedError('acme-pay', 'paymentMethods.attach'); },
  detach: async () => { throw new NotSupportedError('acme-pay', 'paymentMethods.detach'); },
  list: async () => { throw new NotSupportedError('acme-pay', 'paymentMethods.list'); },
};
```

Set the corresponding capability to `false` so the PayKit client knows not to route these calls to your adapter.

## Registering your adapter

Use `registerAdapter()` to make your adapter discoverable by name:

```ts
import { registerAdapter } from '@squaredr/paykit';
import { AcmePayAdapter } from './acme-pay-adapter';

registerAdapter('acme-pay', AcmePayAdapter);
```

Once registered, you can reference it by name in multi-provider configs:

```ts
import { PayKit } from '@squaredr/paykit';

const paykit = new PayKit({
  providers: {
    stripe: { secretKey: 'sk_test_xxx' },
    'acme-pay': { apiKey: 'ak_xxx' },
  },
  routing: {
    default: 'stripe',
    rules: [{ currency: 'XYZ', provider: 'acme-pay' }],
  },
});
```

Or pass the adapter instance directly:

```ts
const paykit = new PayKit({
  adapter: new AcmePayAdapter(),
});
await paykit.initialize({ apiKey: 'ak_xxx' });
```

## Testing your adapter

Use PayKit's unified types to write provider-agnostic tests:

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { AcmePayAdapter } from './acme-pay-adapter';
import type { PaymentAdapter } from '@squaredr/paykit';

describe('AcmePayAdapter', () => {
  let adapter: PaymentAdapter;

  beforeAll(async () => {
    adapter = new AcmePayAdapter();
    await adapter.initialize({ apiKey: process.env.ACME_API_KEY! });
  });

  it('creates a charge', async () => {
    const charge = await adapter.charges.create({
      amount: 5000,
      currency: 'USD',
      description: 'Test charge',
    });

    expect(charge.provider).toBe('acme-pay');
    expect(charge.amount).toBe(5000);
    expect(charge.currency).toBe('USD');
    expect(charge.status).toBe('succeeded');
    expect(charge.createdAt).toBeInstanceOf(Date);
  });

  it('reports correct capabilities', () => {
    expect(adapter.capabilities.charges).toBe(true);
    expect(adapter.capabilities.subscriptions).toBe(false);
  });

  it('health check returns valid status', async () => {
    const health = await adapter.healthCheck();
    expect(typeof health.healthy).toBe('boolean');
    expect(typeof health.latencyMs).toBe('number');
  });
});
```

Look at the `MockAdapter` in `packages/core/src/testing/mock-adapter.ts` for a complete in-memory reference implementation.

## Reference adapters

Study the included adapters for real-world patterns:

| Adapter | Source | Key patterns |
|---------|--------|-------------|
| Stripe | `packages/core/src/adapters/stripe/` | Full capabilities, mapper-per-resource pattern, error type mapping |
| Razorpay | `packages/core/src/adapters/razorpay/` | Order-based flow, HMAC webhook verification |
| PayPal | `packages/core/src/adapters/paypal/` | OAuth token management, REST API mapping |

## Checklist

Before shipping your adapter:

- [ ] All 5 required operation groups implemented (charges, refunds, customers, paymentMethods, webhooks)
- [ ] `capabilities` object has all 13 flags set explicitly
- [ ] `initialize()` validates credentials and throws clear errors
- [ ] `healthCheck()` returns latency and handles failures gracefully
- [ ] Provider errors mapped to `PaymentError` with correct unified error codes
- [ ] Webhook `verify()` and `parse()` use cryptographic signature validation
- [ ] Unsupported operations throw `NotSupportedError`
- [ ] Tests cover create, retrieve, and list for each operation group
- [ ] `registerAdapter()` called if you want name-based discovery
