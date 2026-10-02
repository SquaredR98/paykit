# PayKit Deep Audit Results & Full Shipping Schedule
> Generated: 2026-08-23 | Covers: Aug 25 – Dec 31, 2026 (~90 working days)

---

## Audit Summary

| Package | Critical/High | Medium | Low | Total |
|---------|--------------|--------|-----|-------|
| core | 7 | 9 | 8 | 24 |
| sdk-js | 4 | 6 | 6 | 16 |
| react | 3 | 7 | 3 | 13 |
| **Total** | **14** | **22** | **17** | **53** |

Combined with existing backlog (285 items), the full pool is **338 deliverables**.

---

## Audit Findings (new issues from deep review)

### Priority 1 — CRITICAL / HIGH

| # | Pkg | Issue | File | Category |
|---|-----|-------|------|----------|
| C1 | core | PayPal webhook verification is structural-only, no crypto | adapters/paypal/adapter.ts:394-450 | Security |
| C2 | core | Unsafe `as` casts on Stripe API responses | adapters/stripe/adapter.ts:198,235 | Type/Bug |
| C3 | core | Extensive `any` in Razorpay adapter+mappers | adapters/razorpay/ | Type |
| C4 | core | Pagination cursor parsing treats IDs as offsets | adapters/razorpay/adapter.ts:141,172,219,357 | Bug |
| C5 | core | Stripe webhook unmapped events cast to `never` | adapters/stripe/adapter.ts:290-300 | Bug |
| C6 | core | PayPal amount ignores 3-decimal currencies | adapters/paypal/adapter.ts:155-159 | Bug |
| C7 | core | Razorpay error handler no type guard | adapters/razorpay/adapter.ts:90-95 | Bug |
| J1 | js | `confirmCardPayment()` deprecated | providers/stripe.ts:121 | API |
| J2 | js | PayPal race condition on concurrent confirm | providers/paypal.ts:239-241 | Bug |
| J3 | js | Stripe listeners not cleaned up properly | providers/stripe.ts:72-77 | Leak |
| J4 | js | Stripe bridge all `any` types | providers/stripe.ts:19-21 | Type |
| R1 | react | CardInput listener leak | CardInput.tsx:32-36 | Leak |
| R2 | react | CardInput useEffect missing deps | CardInput.tsx:20-41 | React |
| R3 | react | usePaymentStatus timeout race | usePaymentStatus.ts:39-63 | Bug |

### Priority 2 — MEDIUM

| # | Pkg | Issue | Category |
|---|-----|-------|----------|
| C8 | core | Razorpay customer name empty string | DX |
| C9 | core | Razorpay charge mapper NaN risk | Bug |
| C10 | core | Subscription totalCount silent 0 default | Bug |
| C11 | core | Razorpay webhook silent null fallback | DX |
| C12 | core | PayPal subscriptions.update runtime throw | DX |
| C13 | core | Stripe metadata unsafe null cast | Type |
| C14 | core | Timeout option never implemented | Gap |
| C15 | core | Empty routing rules silently ignored | DX |
| C16 | core | Duplicated webhook header mapping | Quality |
| J5 | js | PayPal buttons no timeout | Bug |
| J6 | js | Razorpay unsafe window.Razorpay | Security |
| J7 | js | ClientEvent data too permissive | Type |
| J8 | js | Razorpay dismiss throws plain object | DX |
| J9 | js | Bad error msg for HTMLElement target | DX |
| J10 | js | PayPal mount doesn't clean state | Edge |
| R4 | react | Error state never cleared on retry | Bug |
| R5 | react | CheckoutForm missing onChange prop | DX |
| R6 | react | PayKitProvider silent init failure | DX |
| R7 | react | CardInput no clientSecret warning | DX |
| R8 | react | No AbortController on unmount | React |
| R9 | react | Unsafe cast on onChange data | Type |
| R10 | react | Button enabled during errors | DX |

### Priority 3 — LOW

| # | Pkg | Issue | Category |
|---|-----|-------|----------|
| C17 | core | Email regex too permissive | Security |
| C18 | core | No safe integer check on amounts | Edge |
| C19 | core | Redaction list incomplete | Security |
| C20 | core | Idempotency uses Math.random | Security |
| C21 | core | Redundant `?? undefined` | Quality |
| C22 | core | Razorpay plan fetch swallows errors | Quality |
| C23 | core | Unknown interval defaults to month | Bug |
| C24 | core | Unused params in Stripe PM create | DX |
| J11 | js | No public key validation | DX |
| J12 | js | Duplicated listener pattern | Quality |
| J13 | js | Locale option unused | Gap |
| J14 | js | colorSuccess not mapped | Gap |
| J15 | js | No bridge deregistration | Design |
| J16 | js | Razorpay placeholder hardcoded EN | i18n |
| R11 | react | Hardcoded terminal status strings | Quality |
| R12 | react | Missing JSDoc on public API | DX |
| R13 | react | Context default confusion | DX |

---

## Full Shipping Schedule: Aug 25 – Dec 31, 2026

Legend:
- **🔧 Fix** = audit finding or G-category bug fix → patch bump
- **⚡ Feat** = backlog feature item → patch or minor bump
- **🧱 Adapter** = new adapter build day → minor bump on completion
- **📝 Docs** = docs/blog/README update
- **📦 Publish** = npm publish

---

### WEEK 1 — Aug 25-29: Critical Audit Fixes

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Aug 25 | 🔧 Fix PayPal webhook crypto verification | C1 |
| Tue | Aug 26 | 🔧 Fix PayPal 3-decimal currencies + Razorpay error type guard | C6, C7 |
| Wed | Aug 27 | 🔧 Replace Stripe unsafe casts + fix unmapped webhook events | C2, C5 |
| Thu | Aug 28 | 🔧 Replace `any` in Razorpay adapter with typed interfaces | C3 |
| Fri | Aug 29 | 🔧 Fix pagination cursor parsing in Razorpay | C4 |

### WEEK 2 — Sep 1-5: Frontend Critical Fixes

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Sep 1 | 🔧 Fix CardInput listener leak + missing deps | R1, R2 |
| Tue | Sep 2 | 🔧 Fix Stripe bridge listener cleanup + type `any` | J3, J4 |
| Wed | Sep 3 | 🔧 Migrate confirmCardPayment → confirmPayment | J1 |
| Thu | Sep 4 | 🔧 Fix PayPal race condition + usePaymentStatus timeout | J2, R3 |
| Fri | Sep 5 | 🔧 Fix G-category critical: Stripe fake billing, RZ webhook sig | G1.01, G2.01 |

### WEEK 3 — Sep 8-12: G-Category High + Medium Audit Fixes

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Sep 8 | 🔧 RZ subscription mapper (amount:0, total_count:12) | G2.02, G2.03 |
| Tue | Sep 9 | 🔧 RZ charge refunded status + refund mapper + pagination | G2.04, G2.05, G2.07 |
| Wed | Sep 10 | 🔧 Stripe charge mapper + refund mapper + webhook mapper | G1.02, G1.05, G1.06 |
| Thu | Sep 11 | 🔧 SDK-JS: innerHTML→DOM, PayPal mount validation | G4.01, G4.02, G4.03 |
| Fri | Sep 12 | 🔧 Medium audit: C8-C11 (RZ customer, NaN, totalCount, webhook) | C8, C9, C10, C11 |

### WEEK 4 — Sep 15-19: Medium Audit + Core Features Start

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Sep 15 | 🔧 Medium audit: C12-C16 (PayPal sub, timeout, routing, headers) | C12-C16 |
| Tue | Sep 16 | 🔧 Medium audit: J5-J10 (PayPal timeout, RZ window, events) | J5-J10 |
| Wed | Sep 17 | 🔧 Medium audit: R4-R10 (error clear, onChange, provider, abort) | R4-R10 |
| Thu | Sep 18 | ⚡ Typed error codes enum + suggestion field | A1.01, A1.02 |
| Fri | Sep 19 | ⚡ Map Stripe + Razorpay error codes | A1.03, A1.04 |

### WEEK 5 — Sep 22-26: Error Handling + PhonePe Adapter Start 🧱

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Sep 22 | ⚡ error.retryable + error.provider fields | A1.05, A1.06 |
| Tue | Sep 23 | 🧱 PhonePe: scaffold, auth, types | B2.01 (day 1) |
| Wed | Sep 24 | 🧱 PhonePe: charges.create, retrieve, list | B2.01 (day 2) |
| Thu | Sep 25 | 🧱 PhonePe: refunds, customers | B2.01 (day 3) |
| Fri | Sep 26 | 🧱 PhonePe: webhooks, tests, edge cases | B2.01 (day 4) |

### WEEK 6 — Sep 29 – Oct 3: PhonePe Finish + Validation

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Sep 29 | 🧱 PhonePe: mapper hardening, final tests | B2.01 (day 5) |
| Tue | Sep 30 | 🧱📦 PhonePe: docs, README, publish | B2.01 (day 6) |
| Wed | Oct 1 | ⚡ PaymentTimeoutError + ProviderUnavailableError | A1.07, A1.08 |
| Thu | Oct 2 | ⚡ Request ID tracking on all adapter calls | A1.09 |
| Fri | Oct 3 | ⚡ Param validation for charges.create + refunds.create | A1.14, A1.15 |

### WEEK 7 — Oct 6-10: Type Exports + Cashfree Adapter 🧱

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Oct 6 | ⚡ Export ChargeStatus, RefundStatus, SubscriptionStatus unions | A2.02, A2.03, A2.04 |
| Tue | Oct 7 | 🧱 Cashfree: scaffold, auth, types | B2.02 (day 1) |
| Wed | Oct 8 | 🧱 Cashfree: charges.create, retrieve, list | B2.02 (day 2) |
| Thu | Oct 9 | 🧱 Cashfree: refunds, customers, webhooks | B2.02 (day 3) |
| Fri | Oct 10 | 🧱 Cashfree: tests, edge cases, mapper hardening | B2.02 (day 4) |

### WEEK 8 — Oct 13-17: Cashfree Finish + Currency Utils

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Oct 13 | 🧱📦 Cashfree: docs, README, publish | B2.02 (day 5) |
| Tue | Oct 14 | ⚡ formatAmount + getCurrencyInfo utilities | A3.01, A3.02 |
| Wed | Oct 15 | ⚡ Zero-decimal + three-decimal currency lists | A3.03, A3.04 |
| Thu | Oct 16 | ⚡ isSupportedCurrency + currency validation in charges.create | A3.05, A3.10 |
| Fri | Oct 17 | ⚡ Param validation for customers + subscriptions | A1.16, A1.17 |

### WEEK 9 — Oct 20-24: Webhook Enhancements + Square Adapter 🧱

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Oct 20 | ⚡ Webhook event type normalization + constants | A5.01, A5.02 |
| Tue | Oct 21 | 🧱 Square: scaffold, auth (OAuth), types | B3.01 (day 1) |
| Wed | Oct 22 | 🧱 Square: charges, refunds | B3.01 (day 2) |
| Thu | Oct 23 | 🧱 Square: customers, webhooks | B3.01 (day 3) |
| Fri | Oct 24 | 🧱 Square: tests, mapper hardening | B3.01 (day 4) |

### WEEK 10 — Oct 27-31: Square Finish + Router Enhancements

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Oct 27 | 🧱📦 Square: docs, publish | B3.01 (day 5) |
| Tue | Oct 28 | ⚡ Router resolveAdapter + region routing | A4.01, A4.02 |
| Wed | Oct 29 | ⚡ Router paymentMethod routing + listAdapters | A4.03, A4.04 |
| Thu | Oct 30 | ⚡ webhooks.isValid + timestamp validation | A5.03, A5.04 |
| Fri | Oct 31 | ⚡ Idempotency key for charges + refunds | A1.18, A1.19 |

### WEEK 11 — Nov 3-7: Adyen Adapter 🧱 + Low Audit Fixes

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Nov 3 | 🧱 Adyen: scaffold, auth, types | B3.02 (day 1) |
| Tue | Nov 4 | 🧱 Adyen: charges (auth+capture), refunds | B3.02 (day 2) |
| Wed | Nov 5 | 🧱 Adyen: customers, payment methods, webhooks | B3.02 (day 3) |
| Thu | Nov 6 | 🧱 Adyen: subscriptions, tests | B3.02 (day 4) |
| Fri | Nov 7 | 🧱📦 Adyen: docs, publish | B3.02 (day 5) |

### WEEK 12 — Nov 10-14: Low Audit Fixes + Testing Utils

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Nov 10 | 🔧 Low audit: C17-C20 (email regex, safe int, redaction, crypto) | C17-C20 |
| Tue | Nov 11 | 🔧 Low audit: C21-C24, J11-J12 (quality, listeners) | C21-C24, J11-J12 |
| Wed | Nov 12 | 🔧 Low audit: J13-J16, R11-R13 (locale, JSDoc, context) | J13-J16, R11-R13 |
| Thu | Nov 13 | ⚡ MockAdapter + createMockCharge + createMockRefund | A6.01, A6.02, A6.03 |
| Fri | Nov 14 | ⚡ createMockCustomer + createMockWebhookEvent | A6.04, A6.05 |

### WEEK 13 — Nov 17-21: Mollie Adapter 🧱 + G-Category Remaining

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Nov 17 | 🧱 Mollie: scaffold, auth, types | B3.03 (day 1) |
| Tue | Nov 18 | 🧱 Mollie: charges (iDEAL, SOFORT, Bancontact) | B3.03 (day 2) |
| Wed | Nov 19 | 🧱 Mollie: refunds, customers, webhooks | B3.03 (day 3) |
| Thu | Nov 20 | 🧱 Mollie: subscriptions, SEPA, tests | B3.03 (day 4) |
| Fri | Nov 21 | 🧱📦 Mollie: docs, publish | B3.03 (day 5) |

### WEEK 14 — Nov 24-28: G-Category Cleanup + Subscription Enhancements

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Nov 24 | 🔧 Stripe G-fixes: payment method mapper, subscription mapper | G1.07, G1.08 |
| Tue | Nov 25 | 🔧 Stripe G-fixes: error mapper, idempotency, input validation | G1.09-G1.12 |
| Wed | Nov 26 | 🔧 RZ G-fixes: subscription cleanup, loadScript race, error mapper | G2.08-G2.11 |
| Thu | Nov 27 | ⚡ Stripe subscription update + cancel + pause + resume | A8.01-A8.04 |
| Fri | Nov 28 | ⚡ Stripe subscription list + RZ subscription update/cancel | A8.05-A8.07 |

### WEEK 15 — Dec 1-5: MercadoPago Adapter 🧱 + React Components

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Dec 1 | 🧱 MercadoPago: scaffold, auth, types | B3.04 (day 1) |
| Tue | Dec 2 | 🧱 MercadoPago: charges (PIX, Boleto, OXXO) | B3.04 (day 2) |
| Wed | Dec 3 | 🧱 MercadoPago: refunds, customers, webhooks | B3.04 (day 3) |
| Thu | Dec 4 | 🧱 MercadoPago: tests, mapper hardening | B3.04 (day 4) |
| Fri | Dec 5 | 🧱📦 MercadoPago: docs, publish | B3.04 (day 5) |

### WEEK 16 — Dec 8-12: Flutterwave Adapter 🧱 + Observability

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Dec 8 | 🧱 Flutterwave: scaffold, auth, types | B3.05 (day 1) |
| Tue | Dec 9 | 🧱 Flutterwave: charges (M-Pesa, mobile money) | B3.05 (day 2) |
| Wed | Dec 10 | 🧱 Flutterwave: refunds, customers, webhooks | B3.05 (day 3) |
| Thu | Dec 11 | 🧱 Flutterwave: tests, mapper hardening | B3.05 (day 4) |
| Fri | Dec 12 | 🧱📦 Flutterwave: docs, publish | B3.05 (day 5) |

### WEEK 17 — Dec 15-19: Logging/Hooks + PayU Adapter Start 🧱

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Dec 15 | ⚡ Structured logging + onRequest/onResponse hooks | A7.01-A7.03 |
| Tue | Dec 16 | ⚡ onError hook + request duration tracking | A7.04, A7.05 |
| Wed | Dec 17 | 🧱 PayU: scaffold, auth, types | B4.01 (day 1) |
| Thu | Dec 18 | 🧱 PayU: charges, refunds | B4.01 (day 2) |
| Fri | Dec 19 | 🧱 PayU: customers, webhooks, tests | B4.01 (day 3) |

### WEEK 18 — Dec 22-26: PayU Finish + React Enhancements + Holiday

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Dec 22 | 🧱📦 PayU: mapper hardening, docs, publish | B4.01 (day 4-5) |
| Tue | Dec 23 | ⚡ React: PaymentStatus component + useHeadlessCheckout | C1.01, C1.02 |
| Wed | Dec 24 | ⚡ React: theme presets + onReady callback | C1.07, C1.09 |
| Thu | Dec 25 | 🎄 Holiday buffer |  |
| Fri | Dec 26 | 🎄 Holiday buffer |  |

### WEEK 19 — Dec 29-31: Year-End Wrap + Remaining G-fixes

| Day | Date | Deliverable | Item |
|-----|------|-------------|------|
| Mon | Dec 29 | 🔧 PayPal G-fixes: zero-decimal dedup, metadata, URLs | G3.09-G3.12 |
| Tue | Dec 30 | 🔧 SDK-JS G-fixes: SRI hashes, script loader, lifecycle | G4.04-G4.08 |
| Wed | Dec 31 | 🔧 Shared types: ProviderCredentials, refundedAmount, webhook types | G5.01-G5.05 |

---

## Progress Tracking

### Adapter Delivery Target (Aug-Dec 2026)

| # | Adapter | Target Week | Status |
|---|---------|-------------|--------|
| 1 | PhonePe | Week 5-6 (Sep 22-30) | Pending |
| 2 | Cashfree | Week 7-8 (Oct 7-13) | Pending |
| 3 | Square | Week 9-10 (Oct 21-27) | Pending |
| 4 | Adyen | Week 11 (Nov 3-7) | Pending |
| 5 | Mollie | Week 13 (Nov 17-21) | Pending |
| 6 | MercadoPago | Week 15 (Dec 1-5) | Pending |
| 7 | Flutterwave | Week 16 (Dec 8-12) | Pending |
| 8 | PayU | Week 17-18 (Dec 17-22) | Pending |

**Total new adapters by Dec 31: 8** (bringing total to 11 with Stripe+Razorpay+PayPal)

### Bug Fix Delivery

| Block | Items | Weeks |
|-------|-------|-------|
| Critical audit (P1) | 14 | Weeks 1-2 |
| G-category critical/high | 20 | Weeks 3-4 |
| Medium audit (P2) | 22 | Weeks 4-5 |
| Low audit (P3) | 17 | Week 12 |
| G-category remaining | 15 | Weeks 14, 19 |
| **Total fixes** | **88** | |

### Feature Delivery

| Block | Items | Weeks |
|-------|-------|-------|
| Error handling (A1) | 12 | Weeks 4-6 |
| Type exports (A2) | 3 | Week 7 |
| Currency utils (A3) | 5 | Week 8 |
| Router (A4) | 4 | Week 10 |
| Webhooks (A5) | 4 | Weeks 9-10 |
| Testing utils (A6) | 5 | Week 12 |
| Observability (A7) | 5 | Week 17 |
| Subscriptions (A8) | 7 | Week 14 |
| React components (C1) | 3 | Week 18 |
| **Total features** | **53** | |

### Monthly npm Publish Count

| Month | Patches | Minors | Total |
|-------|---------|--------|-------|
| Aug (remaining) | 5 | 0 | 5 |
| Sep | 15 | 1 (PhonePe) | 16 |
| Oct | 12 | 2 (Cashfree, Square) | 14 |
| Nov | 14 | 2 (Adyen, Mollie) | 16 |
| Dec | 12 | 3 (MercadoPago, Flutterwave, PayU) | 15 |
| **Total** | **58** | **8** | **66** |

---

## Into 2027 — Q1 Schedule (Jan-Mar)

### WEEK 20-21 — Jan 5-16: Paytm + CCAvenue (India completion)

| Week | Adapter | Difficulty | Notes |
|------|---------|-----------|-------|
| 20 | Paytm | 3/5 | txnToken flow, wallet support |
| 21 | CCAvenue | 5/5 | No SDK, AES encryption, redirect-only, IP whitelisting |

### WEEK 22-23 — Jan 19-30: Braintree + Authorize.net (Track B + Track A)

| Week | Adapter | Difficulty | Notes |
|------|---------|-----------|-------|
| 22 | **Braintree** (Track B) | 4/5 | Fragmented client/server, Drop-In vs Hosted Fields |
| 23 | Authorize.net | 3/5 | Legacy US merchants, version lag in SDK |

### WEEK 24-25 — Feb 2-13: Amazon Pay + Airwallex (Track B + Track A)

| Week | Adapter | Difficulty | Notes |
|------|---------|-----------|-------|
| 24 | **Amazon Pay** (Track B) | 5/5 | RSA key auth, checkout sessions, hardest integration |
| 25 | Airwallex | 3/5 | Cross-border FX, multi-currency |

### WEEK 26-27 — Feb 16-27: Xendit + Midtrans (Southeast Asia block)

| Week | Adapter | Difficulty | Notes |
|------|---------|-----------|-------|
| 26 | **Xendit** (Track B) | 3/5 | SEA e-wallets, per-country payment methods |
| 27 | **Midtrans** (Track B) | 3/5 | Indonesia, three product lines to unify |

### WEEK 28-29 — Mar 2-13: GoCardless + Paystack (Direct debit + Africa)

| Week | Adapter | Difficulty | Notes |
|------|---------|-----------|-------|
| 28 | GoCardless | 3/5 | SEPA, ACH, Bacs direct debit |
| 29 | **Paystack** (Track B) | 2/5 | Africa, unifies with Stripe adapter |

### WEEK 30-31 — Mar 16-27: Nuvei + Instamojo (Enterprise + India SMB)

| Week | Adapter | Difficulty | Notes |
|------|---------|-----------|-------|
| 30 | Nuvei | 3/5 | Gaming, crypto, high-risk |
| 31 | **Instamojo** (Track B) | 3/5 | India SMB, no official SDK, payment links model |

### Q1 2027 Summary

- **Track A adapters**: 6 (Paytm, CCAvenue, Authorize.net, Airwallex, GoCardless, Nuvei)
- **Track B adapters**: 6 (Braintree, Amazon Pay, Xendit, Midtrans, Paystack, Instamojo)
- **Total new adapters Q1**: 12
- **Running total**: 23 adapters (3 built + 8 from 2026 + 12 from Q1)

---

## Q2 2027 — Remaining Adapters (Apr-Jun)

| Week | Adapter | Track | Notes |
|------|---------|-------|-------|
| 32-33 | Worldpay | A | 5/5 difficulty, abandoned Node SDK |
| 34-35 | Alipay + WeChat Pay | A | China domestic, RSA signing |
| 36-37 | UnionPay | A | China card network |
| 38-39 | **PayTabs** (Track B) | B | MENA region |
| 40-41 | **eWay** (Track B) | B | AU/NZ |
| 42-43 | 2Checkout + Payoneer | A | Digital goods, marketplace payouts |
| 44-45 | Worldline + Checkout.com + Klarna | A | EU enterprise, BNPL |

### Q2 Totals
- **Track A**: 9 adapters
- **Track B**: 2 adapters
- **Running total by Jun 2027**: 34 adapters

---

## Full Year Adapter Roadmap

| Quarter | Adapters | Running Total |
|---------|----------|---------------|
| Q3 2026 (Aug-Sep) | 1 (PhonePe) | 4 |
| Q4 2026 (Oct-Dec) | 7 (Cashfree, Square, Adyen, Mollie, MercadoPago, Flutterwave, PayU) | 11 |
| Q1 2027 (Jan-Mar) | 12 (6 Track A + 6 Track B) | 23 |
| Q2 2027 (Apr-Jun) | 11 (9 Track A + 2 Track B) | 34 |
| **1.0.0 target** | **Mid-2027** | **34 adapters** |

---

## Remaining Backlog (into 2027)

After all adapters are built, remaining work:
- **~180 backlog items** from categories C2 (JS SDK features), D (testing), E (docs/blog), F (infrastructure)
- **React component library** expansion (C1 remaining items)
- **Advanced router features** (A4 remaining: fallback, weighted, cost-based routing)
- **1.0.0 stabilization**: API freeze, migration guides, breaking change review
