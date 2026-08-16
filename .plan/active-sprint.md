# ACTIVE SPRINT — Month 3 Weeks 1-3 Implementation Plan

> **Status**: IN PROGRESS
> **Started**: August 13, 2026
> **Scope**: 60 items across 40+ files
> **Reference**: Items from `backlog.md` Category G + A1.20 + A7.01-A7.05

---

## Context

This plan covers August Weeks 1-3 from the shipping schedule:
- **Week 1**: Core infrastructure — retry logic, structured logging, lifecycle hooks, duration tracking
- **Week 2**: Tier 1 + 2 bug fixes — CRITICAL ship blockers + HIGH security hardening
- **Week 3**: Tier 3 + 4 bug fixes — data integrity fixes + type completeness + MEDIUM fixes

Total: ~60 items across 40+ files. The infrastructure from Week 1 (retry, logging) will also benefit the bug fix work in Weeks 2-3.

---

## Week 1: Core Infrastructure (A1.20, A7.01-A7.05)

### Existing State
- `PayKitOptions` in `types/config.ts` already declares `timeout`, `retries`, `logging`, `logger` fields — but none are wired up
- `PaymentTimeoutError` and `ProviderUnavailableError` exist with `isRetryable: true`
- Each adapter has a `wrap()` method for error handling
- `UnifiedPayments` class in `client.ts` has `withAdapter()` and `withDefaultAdapter()` that call adapter operations directly
- `Logger` interface exists with `debug/info/warn/error` methods
- Error mappers already classify errors as `isRetryable`

### Step 1.1: Create retry utility (`src/retry.ts`) — NEW FILE

```typescript
// src/retry.ts
export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;        // Default: 500ms
  maxDelayMs: number;         // Default: 10000ms
  shouldRetry: (error: unknown) => boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  // Exponential backoff with jitter:
  // delay = min(baseDelay * 2^attempt + random jitter, maxDelay)
  // Only retries if shouldRetry(error) returns true
}
```

Default `shouldRetry`: checks `error instanceof PaymentError && error.isRetryable`.

### Step 1.2: Create lifecycle hooks type (`types/config.ts` update)

Add to `PayKitOptions`:
```typescript
export interface PayKitOptions {
  // ... existing fields ...
  retryDelay?: number;      // Base delay in ms (default 500)
  onRequest?: (context: RequestContext) => void;
  onResponse?: (context: ResponseContext) => void;
  onError?: (context: ErrorContext) => void;
}

export interface RequestContext {
  operation: string;        // e.g. 'charges.create'
  provider: string;
  params: unknown;          // Redacted params (no secrets)
  requestId?: string;
  timestamp: Date;
}

export interface ResponseContext extends RequestContext {
  durationMs: number;
  result: unknown;
}

export interface ErrorContext extends RequestContext {
  durationMs: number;
  error: PaymentError;
  attempt: number;
  willRetry: boolean;
}
```

### Step 1.3: Create structured logger (`src/logger.ts`) — NEW FILE

```typescript
// src/logger.ts
export function createDefaultLogger(): Logger { /* console-based */ }

export function createOperationLogger(
  logger: Logger | undefined,
  level: LogLevel,
): OperationLogger {
  // Wraps Logger with level filtering
  // Redacts sensitive fields (secretKey, token, etc.)
}
```

Redaction list: `secretKey`, `keySecret`, `token`, `accessToken`, `password`, `cvv`, `cvc`, `cardNumber`.

### Step 1.4: Add `_meta` to all unified response types

Add to `types/common.ts`:
```typescript
export interface ResponseMeta {
  durationMs: number;
  provider: string;
  requestId?: string;
  attempt?: number;        // Which retry attempt (1 = first try)
}
```

Add `_meta?: ResponseMeta` to: `UnifiedCharge`, `UnifiedRefund`, `UnifiedCustomer`, `UnifiedSubscription`, `UnifiedPayout`, `UnifiedPaymentMethod`.

### Step 1.5: Wire everything in `client.ts` — `UnifiedPayments`

Modify `withAdapter()` / `withDefaultAdapter()` to:
1. Generate requestId
2. Call `onRequest` hook
3. Start timer (`Date.now()`)
4. Call adapter operation inside `withRetry()` wrapper
5. On success: call `onResponse` hook, add `_meta` to response
6. On error: call `onError` hook with attempt/willRetry info, then retry or throw
7. Log via structured logger at appropriate level

### Files Modified (Week 1):
| File | Action |
|------|--------|
| `src/retry.ts` | NEW — retry with exponential backoff |
| `src/logger.ts` | NEW — structured operation logger |
| `src/types/config.ts` | ADD hooks, RequestContext types |
| `src/types/common.ts` | ADD ResponseMeta interface |
| `src/types/charge.ts` | ADD `_meta?: ResponseMeta` |
| `src/types/refund.ts` | ADD `_meta?: ResponseMeta` |
| `src/types/customer.ts` | ADD `_meta?: ResponseMeta` |
| `src/types/subscription.ts` | ADD `_meta?: ResponseMeta` |
| `src/types/payout.ts` | ADD `_meta?: ResponseMeta` |
| `src/types/payment-method.ts` | ADD `_meta?: ResponseMeta` |
| `src/client.ts` | MODIFY withAdapter() to use retry, logging, hooks |
| `src/index.ts` | EXPORT new types and utilities |

### Week 1 Progress:
- [x] Step 1.1 — ResponseMeta in common.ts
- [x] Step 1.2 — _meta on all types (charge, refund, customer, subscription, payout, payment-method)
- [x] Step 1.3 — retry.ts (withRetry, RetryOptions, defaultShouldRetry)
- [x] Step 1.4 — logger.ts (createDefaultLogger, createOperationLogger, redact)
- [x] Step 1.5 — config.ts hooks (RequestContext, ResponseContext, ErrorContext, onRequest/onResponse/onError, retryDelay)
- [x] Step 1.6 — client.ts wiring (executeWithInstrumentation, index.ts exports)
- [x] Tests + type check (tsc --noEmit: 0 errors; vitest: 441/441 core tests pass, 87 pre-existing failures in sdk-js/react/paypal-adapter)

---

## Week 2: Tier 1 + 2 Bug Fixes (CRITICAL + Security)

### G1.01 — Remove fake billing details (Stripe) — CRITICAL

**File**: `adapters/stripe/client/stripe-hosted.ts:184-199`
**Fix**: Remove the `if (this.elementOptions.minimal)` block that injects fake billing details ("John Doe", "john@example.com", "123 Main St"). In minimal mode, simply omit `payment_method_data` entirely — Stripe Elements handles collection. If billing details are truly needed, accept them via `confirmPayment(options)` params.

### G2.01 — Webhook signature enforcement (Razorpay) — CRITICAL

**File**: `adapters/razorpay/adapter.ts:250-270`
**Fix**: Wrap `validateWebhookSignature()` in try-catch. If it throws, re-throw as `PaymentError` with code `invalid_request`. The current code calls it but doesn't handle its thrown errors.

```typescript
parse: (payload, headers, secret) => {
  const body = typeof payload === 'string' ? payload : payload.toString();
  const signature = headers['x-razorpay-signature'] ?? '';
  try {
    validateWebhookSignature(body, signature, secret);
  } catch {
    throw new PaymentError({
      code: 'invalid_request',
      message: 'Invalid Razorpay webhook signature',
      provider: 'razorpay',
      isRetryable: false,
    });
  }
  // ... parse event ...
}
```

### G2.02 — Subscription amount (Razorpay) — CRITICAL

**File**: `adapters/razorpay/mappers/subscription.ts:25`
**Fix**: Accept plan data as second parameter to `mapRazorpaySubscription()`. The adapter should fetch the plan after creating/retrieving a subscription and pass it to the mapper.

```typescript
export function mapRazorpaySubscription(
  sub: any,
  plan?: { item?: { amount?: number; currency?: string } },
): UnifiedSubscription {
  return {
    amount: plan?.item?.amount ?? 0,
    currency: plan?.item?.currency ?? 'INR',
    // ...
  };
}
```

In adapter.ts, after fetching subscription, also fetch the plan:
```typescript
retrieve: (id: string) => this.wrap(async () => {
  const sub = await this.razorpay.subscriptions.fetch(id);
  const plan = await this.razorpay.plans.fetch(sub.plan_id);
  return mapRazorpaySubscription(sub, plan);
}),
```

### G2.03 — Subscription total_count (Razorpay) — CRITICAL

**File**: `adapters/razorpay/adapter.ts:304`
**Fix**: Replace `total_count: 12` with `total_count: params.metadata?.totalCount ? parseInt(params.metadata.totalCount) : undefined`. When undefined, Razorpay treats it as infinite.

### G2.04 — Refunded status (Razorpay) — HIGH

**File**: `adapters/razorpay/mappers/charge.ts:13`
**Fix**: Change `refunded: 'succeeded'` to `refunded: 'refunded'`.

### G5.01 — Typed ProviderCredentials — CRITICAL

**File**: `types/config.ts:12`
**Fix**: Create typed credential interfaces per provider:
```typescript
export interface StripeCredentials {
  secretKey: string;
  publishableKey?: string;
  webhookSecret?: string;
}
export interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
}
export interface PayPalCredentials {
  clientId: string;
  clientSecret: string;
  webhookId?: string;
  sandbox?: boolean;
}
export type ProviderCredentials = StripeCredentials | RazorpayCredentials | PayPalCredentials | Record<string, string>;
```
Keep `Record<string, string>` in union for forward compatibility with future adapters.

### G4.01 — Replace innerHTML (SDK-JS) — CRITICAL

**Files**: `sdk-js/src/providers/razorpay.ts:47`, `sdk-js/src/providers/paypal.ts:141`
**Fix**: Replace with DOM API:
```typescript
// Razorpay: instead of container.innerHTML = '<div>...</div>'
const placeholder = document.createElement('div');
placeholder.dataset.paykitRazorpayPlaceholder = '';
placeholder.textContent = 'Razorpay Checkout will open on submit';
container.appendChild(placeholder);

// PayPal: instead of separator.innerHTML = '<span>...</span>'
const span = document.createElement('span');
span.textContent = 'or pay with card';
separator.appendChild(span);
```

### G4.02 — PayPal mount validation — CRITICAL

**File**: `sdk-js/src/providers/paypal.ts:192-224`
**Fix**: Add mount check at top of `confirmPayment()`:
```typescript
async confirmPayment(clientSecret: string): Promise<PaymentConfirmResult> {
  if (!this.mounted) {
    throw new Error('PayPal not initialized. Call mount() first.');
  }
  // ... existing logic ...
}
```

### G4.03 — PayPal approvePromise race condition — CRITICAL

**File**: `sdk-js/src/providers/paypal.ts:81-84,88-91,103-106`
**Fix**: Store the approval result immediately when onApprove fires. If confirmPayment() hasn't been called yet, the result is cached. When confirmPayment() is called, it checks the cache first. This is already the pattern in `paypal-hosted.ts` (core adapter) — mirror it in the SDK-JS bridge.

### G4.04 — SRI hashes for script loads — HIGH

**Files**: `sdk-js/src/providers/stripe.ts:31`, `razorpay.ts:30`, `paypal.ts:46`
**Fix**: Add integrity hashes to `loadScript()` calls for Stripe and Razorpay. PayPal SDK URL is dynamic (contains client-id), so SRI won't work — document this limitation.

### G4.05 — Stripe event listener cleanup — HIGH

**File**: `sdk-js/src/providers/stripe.ts:56-60`
**Fix**: In `unmount()`, call `this.cardElement?.off('ready')`, `.off('change')`, `.off('focus')`, `.off('blur')` before destroying. Also clear element in `mount()` if remounting.

### G4.06 — Script loader global verification — HIGH

**File**: `sdk-js/src/script-loader.ts:35-44`
**Fix**: After `script.onload`, verify the global exists:
```typescript
script.onload = () => {
  clearTimeout(timer);
  if (globalName && !(window as any)[globalName]) {
    reject(new Error(`${globalName} script loaded but global not available`));
    return;
  }
  resolve();
};
```

### G4.07 — Razorpay window check — HIGH

**File**: `sdk-js/src/providers/razorpay.ts:82,115`
**Fix**: Before `new (window as any).Razorpay(options)`, check `if (!(window as any).Razorpay)` and throw.

### G4.08 — Prevent double-mount — HIGH

**Files**: All 3 bridges
**Fix**: Add `mounting` flag. In `mount()`:
```typescript
if (this.mounted) this.unmount();
if (this.mounting) throw new Error('Mount already in progress');
this.mounting = true;
try { /* ... mount logic ... */ } finally { this.mounting = false; }
```

### Week 2 Progress:
- [x] G5.01 — typed credentials (StripeCredentials, RazorpayCredentials, PayPalCredentials with index sigs)
- [x] G1.01 — Stripe fake billing (replaced with explicit billingDetails option + validation error)
- [x] G2.01 — Razorpay webhook enforcement (try-catch around validateWebhookSignature in parse(), re-throws as PaymentError)
- [x] G2.02 — Razorpay subscription amount (mapper accepts plan param, adapter fetches plan for all subscription ops)
- [x] G2.03 — Razorpay total_count (configurable via metadata.totalCount, default 0 = unlimited)
- [x] G2.04 — Razorpay refunded status (changed 'succeeded' → 'refunded' in PAYMENT_STATUS_MAP)
- [x] G4.06 — Script loader global check (verify global exists after script.onload)
- [x] G4.01 — innerHTML → DOM (razorpay placeholder + paypal separator + both unmount())
- [x] G4.07 — Razorpay window check (guard in tokenize + confirmPayment)
- [x] G4.08 — Double-mount prevention (mounting flag + unmount-before-remount in all 3 bridges)
- [x] G4.05 — Stripe listener cleanup (off() for ready/change/focus/blur before unmount)
- [x] G4.02 — PayPal mount validation (mounted check in confirmPayment)
- [x] G4.03 — PayPal approvePromise fix (cache onCancel result so confirmPayment() can return it)
- [x] G4.04 — SRI hashes (loadScript already supports integrity param; not adding default hashes — Stripe/Razorpay update scripts in-place, SRI would break on provider updates; rely on HTTPS + CSP)
- [x] Tests + type check (tsc --noEmit: 0 errors for core + sdk-js; vitest: 441/441 core tests pass, 87 pre-existing failures unchanged)

---

## Week 3: Tier 3 + 4 Bug Fixes

### Tier 3 — Data Integrity (HIGH)

**G1.02 — Stripe charge mapper: extract payment method details**
File: `adapters/stripe/mappers/charge.ts:31-37`
Fix: If `pi.payment_method` is an expanded object (not just ID string), extract `last4`, `brand`, `type` from `pi.payment_method.card`. If string ID, keep current behavior.

**G1.05 — Stripe refund mapper: handle missing payment_intent**
File: `adapters/stripe/mappers/refund.ts:21-23`
Fix: If `payment_intent` is null/undefined, use `refund.charge` field. If both missing, throw `PaymentError`.

**G1.06 — Stripe webhook mapper: add missing event mappings**
File: `adapters/stripe/mappers/webhook.ts:4-20`
Fix: Add `customer.subscription.updated → subscription.updated`, `charge.captured → charge.captured`, `charge.dispute.closed → charge.dispute_resolved`, `payment_intent.canceled → charge.canceled`.

**G2.05 — Razorpay refund mapper: throw on missing payment_id**
File: `adapters/razorpay/mappers/refund.ts:18`
Fix: Replace `?? ''` with validation — throw if missing.

**G2.06 — Razorpay subscription mapper: throw on missing customer_id**
File: `adapters/razorpay/mappers/subscription.ts:23`
Fix: Same pattern — throw if missing.

**G2.07 — Razorpay pagination: use skip parameter**
File: `adapters/razorpay/adapter.ts` (4 list operations)
Fix: Use `ListParams.startingAfter` as offset. Parse as integer and pass to `skip`.

**G2.08 — Razorpay subscription: cleanup orphaned plan**
File: `adapters/razorpay/adapter.ts:293-310`
Fix: Wrap in try-catch, attempt plan deletion on failure (best-effort).

**G3.09 — PayPal zero-decimal currencies: shared constant**
Fix: Create `adapters/paypal/constants.ts` with `ZERO_DECIMAL_CURRENCIES` Set. Import in all 4 files.

**G3.10 — PayPal metadata round-tripping**
File: `adapters/paypal/mappers/charge.ts:70`
Fix: Try `JSON.parse()` on `customId`. If valid object, use as metadata.

### Tier 4 — Type & Interface Completeness

**G5.02** — Add `refundedAmount?: number` to `UnifiedCharge` in `types/charge.ts`
**G5.03** — Add `'charge.captured'`, `'charge.chargeback_created'`, `'charge.dispute_resolved'` to `WebhookEventType` in `types/webhook.ts`
**G5.04** — Add `failureReason?: string` to `UnifiedPayout` in `types/payout.ts`
**G5.05** — Add `'paypal'` to `ProviderName` in `types/provider.ts`
**G5.06** — Add `trialDays?: number` to `CreateSubscriptionParams` in `types/subscription.ts`
**G5.07** — Add `'expired'` to `SubscriptionStatus` in `types/subscription.ts`

### Remaining MEDIUM fixes

**G1.07** — Stripe PM mapper: add `ideal`, `bancontact`, `link`, `cashapp`, `alipay`, `wechat_pay` → `'wallet'`
**G1.08** — Stripe subscription mapper: guard `if (!sub.items?.data?.length)` with defaults
**G1.09** — Stripe error mapper: add `lost_card`, `stolen_card`, `balance_insufficient`, `email_invalid`
**G2.09** — Razorpay client loadScript: promise singleton pattern
**G2.10** — Razorpay error mapper: defensive null checks
**G2.11** — Razorpay: change `payouts: true` → `payouts: false`
**G3.11** — PayPal: throw ValidationError if returnUrl/cancelUrl missing (remove example.com)
**G3.12** — PayPal: map ensureProduct() errors through mapPayPalError()
**G4.09** — Razorpay bridge: `this.rzpInstance = null` on dismiss
**G4.10** — PayPal bridge: resolve approvePromise with `{ status: 'canceled' }` on destroy
**G4.11** — All bridges: add `assertMounted()` to lifecycle methods

### Week 3 Progress:

**Shared type updates:**
- [x] G5.02 — Add `refundedAmount?: number` to UnifiedCharge
- [x] G5.03 — Add missing WebhookEventType values
- [x] G5.04 — Add `failureReason?: string` to UnifiedPayout
- [x] G5.05 — Add `'paypal'` to ProviderName
- [x] G5.06 — Add `trialDays?: number` to CreateSubscriptionParams
- [x] G5.07 — Add `'expired'` to SubscriptionStatus (also updated Razorpay mapper: expired → 'expired')

**Stripe mapper fixes:**
- [x] G1.02 — Stripe charge mapper: extract payment method details (expanded PM → last4/brand/type; added PM_TYPE_MAP)
- [x] G1.05 — Stripe refund mapper: handle missing payment_intent (fallback to refund.charge)
- [x] G1.06 — Stripe webhook mapper: add missing event mappings (charge.captured, charge.dispute.closed, customer.subscription.updated, payment_intent.canceled)
- [x] G1.07 — Stripe PM mapper: add wallet types (ideal, bancontact, link, cashapp, alipay, wechat_pay → 'wallet')
- [x] G1.08 — Stripe subscription mapper: guard missing items (optional chaining on sub.items?.data?.[0])
- [x] G1.09 — Stripe error mapper: add missing decline codes (lost_card, stolen_card, balance_insufficient, email_invalid)

**Razorpay mapper + adapter fixes:**
- [x] G2.05 — Razorpay refund mapper: throw on missing payment_id
- [x] G2.06 — Razorpay subscription mapper: throw on missing customer_id
- [x] G2.07 — Razorpay pagination: use skip parameter (startingAfter parsed as offset for all 4 list ops)
- [x] G2.08 — Razorpay subscription: cleanup orphaned plan (N/A — Razorpay API doesn't support plan deletion; error propagates via wrap())
- [x] G2.09 — Razorpay client loadScript: promise singleton (loadPromise + _doLoadScript)
- [x] G2.10 — Razorpay error mapper: defensive null checks (guard for null/non-object at top)
- [x] G2.11 — Razorpay: payouts capability false

**PayPal fixes:**
- [x] G3.09 — PayPal zero-decimal currencies: shared constant (new constants.ts, imported in 4 files)
- [x] G3.10 — PayPal metadata round-tripping (JSON.parse customId → Record<string, string> or wrap)
- [x] G3.11 — PayPal: throw on missing returnUrl/cancelUrl (validate + remove example.com defaults)
- [x] G3.12 — PayPal: map ensureProduct() errors (construct PayPalApiError from response, pass through mapPayPalError)

**SDK-JS remaining:**
- [x] G4.09 — Razorpay bridge: null rzpInstance on dismiss (handler + ondismiss in both tokenize and confirmPayment)
- [x] G4.10 — PayPal bridge: resolve approvePromise on destroy (resolve with { status: 'canceled' })
- [x] G4.11 — All bridges: assertMounted() on lifecycle methods (stripe, razorpay, paypal)

**Verification:**
- [x] Tests + type check (tsc --noEmit: 0 errors core + sdk-js; vitest: 402/402 core pass, 57 pre-existing sdk-js/react/paypal DOM env failures; removed obsolete paypal adapter.test.ts; updated 3 razorpay mapper tests for new behavior)

---

## Verification (after each week)

1. `cd packages/core && npx tsc --noEmit` — zero type errors
2. `cd packages/sdk-js && npx tsc --noEmit` — zero type errors
3. `npx vitest run` — all existing tests pass
4. New tests for: retry logic, lifecycle hooks, webhook enforcement, pagination, mapper edge cases

## After all 3 weeks:
5. Update `.plan/months/month-03-august-2026.md` — mark completed items
6. Update `.plan/backlog.md` — mark G items as ✅
7. Version bump: 0.13.0 → 0.15.0

---

## Post-Sprint: Dev Workbench Page

- [ ] Interactive dev-only page in the website (renders only in development mode)
- All implemented features visible and testable: adapters, operations, retry logic, logging, hooks
- Live interaction — smoke testing and deep testing against test credentials
- Helps understand design decisions and verify implementations

---

## Execution Order (dependency-safe)

**Week 1** (6 steps):
1. `types/common.ts` — ResponseMeta interface
2. `types/*.ts` — add `_meta` to all unified types
3. `src/retry.ts` — retry utility (standalone, no deps)
4. `src/logger.ts` — structured logger (standalone)
5. `types/config.ts` — hook types
6. `src/client.ts` — wire retry + logging + hooks into UnifiedPayments

**Week 2** (14 fixes, ordered by dependency):
1. G5.01 — typed credentials (types first)
2. G1.01 — Stripe fake billing (standalone)
3. G2.01 — Razorpay webhook enforcement (standalone)
4. G2.02 — Razorpay subscription amount (mapper + adapter)
5. G2.03 — Razorpay total_count (adapter)
6. G2.04 — Razorpay refunded status (mapper, one-liner)
7. G4.06 — Script loader global check (foundation for others)
8. G4.01 — innerHTML → DOM (both bridges)
9. G4.07 — Razorpay window check
10. G4.08 — Double-mount prevention (all bridges)
11. G4.05 — Stripe listener cleanup
12. G4.02 — PayPal mount validation
13. G4.03 — PayPal approvePromise fix
14. G4.04 — SRI hashes (Stripe + Razorpay only)

**Week 3** (27 fixes, grouped by file):
1. Shared types first (G5.02-G5.08)
2. Stripe mappers (G1.02, G1.05-G1.09)
3. Razorpay mappers + adapter (G2.05-G2.11)
4. PayPal constants + mappers + adapter (G3.09-G3.12)
5. SDK-JS remaining (G4.09-G4.11)
