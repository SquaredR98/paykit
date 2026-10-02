# Month 1 — June 2026 (June 14 – June 30) ✅ COMPLETE

> **Theme:** Core hardening, error handling, type exports, testing utilities, router enhancements
> **Publish cadence:** Weekly on Sundays (updated from daily)
> **Blog cadence:** Publish on squaredr.tech only (no 3rd-party cross-posting)
> **Starting version:** 0.6.0
> **Final version:** 0.9.0
> **Published:** 0.9.0 on June 29, 2026

---

## Week 1 (June 14 – June 20) ✅ Published as 0.7.1

### Commit 1b9c7cd — June 14
**Backlog:** A1.01–A1.06
- 4 new error codes: `network_error`, `not_found`, `already_captured`, `already_refunded`
- `suggestion` field on `PaymentError` with `ERROR_SUGGESTIONS` map
- Updated Stripe + Razorpay error mappers
- Version: 0.6.0 → 0.6.1

### Commit 06e85a6 — June 17
**Backlog:** A2.01–A2.07, A3.01, A3.03–A3.05
- `WEBHOOK_EVENTS` constants, `ProviderName` type, `CurrencyCode` type
- `getCurrencyInfo()`, `formatAmount()`, `isSupportedCurrency()`, currency metadata for 34 currencies
- Version: 0.6.1 → 0.7.0

### Commit 95f718d — June 20
**Backlog:** A1.13 + A1.14
- `ValidationError` class with `field` property
- `charges.create` param validation (amount, currency, description)
- Version: 0.7.0 → 0.7.1

---

## Weeks 2–3 (June 21 – June 30) ✅ Published as 0.9.0

### Commit 6b937bc — June 29
**Backlog:** A1.07–A1.12, A1.15–A1.16, A1.18, A3.06, A3.09–A3.10, A4.01, A6.01–A6.05
- `PaymentTimeoutError` + `ProviderUnavailableError` error classes
- `requestId` field on all unified responses + PaymentError
- `debug()` utility + `getProviderInfo()` + client methods
- Actionable credential errors for Stripe + Razorpay
- Refund + customer param validation
- `PaymentRouter.resolveAdapter()` made public with region support
- `MockAdapter` with in-memory storage + `createMockCharge/Refund/Customer/WebhookEvent` factories
- `CurrencyConverter` interface + `getProviderCurrencies()`
- Currency validation warning in charges.create
- 343 tests total
- Version: 0.7.1 → 0.9.0

---

## npm Publishes

| Date | Version | What |
|------|---------|------|
| June 29 | 0.9.0 | All Month 1 features consolidated |

---

## Blog Schedule

| Target Date | Title | Status |
|-------------|-------|--------|
| June 22 | "Introducing PayKit" | Pending |
| June 29 | "PayKit vs Stripe SDK: When You Need Both" | Pending |

---

## Month 1 Actuals

| Metric | Result |
|--------|--------|
| npm publishes | 1 (consolidated) |
| Version range | 0.6.0 → 0.9.0 |
| Tests | 343 passing |
| New error classes | 3 (ValidationError, PaymentTimeoutError, ProviderUnavailableError) |
| New utility functions | 6 (formatAmount, getCurrencyInfo, debug, getProviderInfo, resolveAdapter, getProviderCurrencies) |
| Testing utilities | MockAdapter + 4 factories |

### Backlog Items Completed

| ID | Item | Status |
|----|------|--------|
| A1.01 | Typed error codes | ✅ |
| A1.02 | Error suggestion field | ✅ |
| A1.03 | Stripe error code mapping | ✅ |
| A1.04 | Razorpay error code mapping | ✅ |
| A1.05 | `retryable` field | ✅ |
| A1.06 | `provider` field | ✅ |
| A1.07 | PaymentTimeoutError | ✅ |
| A1.08 | ProviderUnavailableError | ✅ |
| A1.09 | Request ID tracking | ✅ |
| A1.10 | debug() utility | ✅ |
| A1.11 | getProviderInfo() | ✅ |
| A1.12 | Better missing credential errors | ✅ |
| A1.13 | ValidationError class | ✅ |
| A1.14 | charges.create validation | ✅ |
| A1.15 | refunds.create validation | ✅ |
| A1.16 | customers.create validation | ✅ |
| A1.18 | idempotencyKey support | ✅ |
| A2.04 | WebhookEventType union | ✅ |
| A2.05 | ProviderName union | ✅ |
| A2.06 | CurrencyCode type | ✅ |
| A2.07 | getCurrencyInfo utility | ✅ |
| A3.01 | formatAmount display formatter | ✅ |
| A3.03 | Zero-decimal currency support | ✅ |
| A3.04 | Three-decimal currency support | ✅ |
| A3.06 | CurrencyConverter interface | ✅ |
| A3.09 | getProviderCurrencies() | ✅ |
| A3.10 | Currency validation in charges.create | ✅ |
| A4.01 | router.resolveAdapter() | ✅ |
| A5.01 | Webhook event type normalization | ✅ |
| A5.02 | WEBHOOK_EVENTS constants | ✅ |
| A6.01 | MockAdapter | ✅ |
| A6.02 | createMockCharge | ✅ |
| A6.03 | createMockRefund | ✅ |
| A6.04 | createMockCustomer | ✅ |
| A6.05 | createMockWebhookEvent | ✅ |
