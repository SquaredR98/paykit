# Month 3 — August 2026

> **Theme:** Adapter bug fixes & security hardening, then India adapters (PhonePe + Cashfree)
> **Publish cadence:** Weekly on Sundays
> **Blog cadence:** Publish on squaredr.tech only (no 3rd-party cross-posting)
> **Starting version:** 0.13.0
> **Target version:** 0.18.0

---

## Week 1 (Aug 2 – Aug 9) → Publish Sunday Aug 9

**Tasks:**
- A1.20 — Retry logic with exponential backoff (`options.retries`, `options.retryDelay`)
- A7.01 — Structured logging for adapter calls (Logger interface, redacted params, durationMs)
- A7.02–A7.04 — Lifecycle hooks: `onRequest`, `onResponse`, `onError`
- A7.05 — Request duration tracking (`_meta.durationMs` on all responses)

**Bump:** 0.13.0 → **0.14.0**

---

## Week 2 (Aug 10 – Aug 16) → Publish Sunday Aug 16

> **Bug Fix Sprint — Tier 1 (Ship Blockers) + Tier 2 (Security Hardening)**
>
> These are CRITICAL and HIGH severity issues found during the cross-adapter
> security review. Must be fixed before building new adapters on a broken foundation.

**Tier 1 — Ship Blockers (CRITICAL):**
- G1.01 — Remove hardcoded fake billing details from Stripe minimal mode
- G2.01 — Razorpay webhook parse: enforce signature validation return value
- G2.02 — Razorpay subscription mapper: fetch plan amount instead of hardcoded 0
- G2.03 — Razorpay subscription create: make `total_count` configurable
- G2.04 — Razorpay charge mapper: fix `refunded` → `succeeded` status mapping
- G5.01 — Create typed ProviderCredentials per provider

**Tier 2 — Security Hardening (HIGH):**
- G4.01 — Replace innerHTML with DOM creation in SDK-JS (XSS prevention)
- G4.02 — PayPal SDK-JS: add mount validation to confirmPayment()
- G4.03 — PayPal SDK-JS: fix approvePromise race condition
- G4.04 — Add SRI hashes to all provider script loads
- G4.05 — Stripe SDK-JS: fix event listener memory leak on unmount
- G4.06 — Script loader: verify global exists after onload
- G4.07 — Razorpay SDK-JS: check window.Razorpay before instantiation
- G4.08 — All SDK-JS bridges: prevent double-mount

**Bump:** 0.14.0 → **0.14.1**

---

## Week 3 (Aug 17 – Aug 23) → Publish Sunday Aug 23

> **Bug Fix Sprint — Tier 3 (Data Integrity) + Tier 4 (Completeness)**

**Tier 3 — Data Integrity (HIGH):**
- G1.02 — Stripe charge mapper: extract last4, brand, type from PaymentIntent
- G1.05 — Stripe refund mapper: handle missing payment_intent properly
- G1.06 — Stripe webhook mapper: add missing event type mappings
- G2.05 — Razorpay refund mapper: throw on missing payment_id
- G2.06 — Razorpay subscription mapper: throw on missing customer_id
- G2.07 — Razorpay: fix pagination (use skip parameter)
- G2.08 — Razorpay: cleanup orphaned plan on subscription creation failure
- G3.09 — PayPal: extract zero-decimal currencies to shared constant
- G3.10 — PayPal: fix metadata round-tripping (parse JSON from customId)

**Tier 4 — Type & Interface Completeness:**
- G5.02 — Add `refundedAmount` to UnifiedCharge
- G5.03 — Add missing webhook event types (chargeback, dispute_resolved, captured)
- G5.04 — Add `failureReason` to UnifiedPayout
- G5.05 — Add `'paypal'` to ProviderName union
- G5.06 — Add `trialDays` to CreateSubscriptionParams
- G5.07 — Add `'expired'` to SubscriptionStatus

**Remaining MEDIUM fixes:**
- G1.07 — Stripe PM mapper: sepa_debit, ideal, bancontact, us_bank_account
- G1.08 — Stripe subscription mapper: handle empty items.data
- G1.09 — Stripe error mapper: add missing codes
- G2.09 — Razorpay client loadScript race condition
- G2.10 — Razorpay error mapper null checks
- G2.11 — Razorpay: fix payouts capability flag
- G3.11 — PayPal: replace example.com default URLs
- G3.12 — PayPal: map ensureProduct() errors through mapPayPalError
- G4.09 — Razorpay SDK-JS: clear rzpInstance on dismiss
- G4.10 — PayPal SDK-JS: reject approvePromise on destroy
- G4.11 — All bridges: enforce lifecycle methods

**Bump:** 0.14.1 → **0.15.0**

---

## Week 4 (Aug 24 – Aug 30) → Publish Sunday Aug 30

**Tasks:**
- B2.01 — PhonePe adapter (full build):
  - Scaffolding + SHA256 checksum auth
  - `charges.create/retrieve` (StandardCheckout + UPI intent)
  - `refunds.create/retrieve`
  - `webhooks.verify/parse`
  - Register in registry, add to `ProviderName` union, tests

**Bump:** 0.15.0 → **0.16.0**

---

## Week 5 (Aug 31) — No publish (content week)

**Tasks:**
- PhonePe docs page (squaredr.tech)
- Update landing page with PhonePe
- E2.06 — Blog: "How PayKit's PaymentRouter Works"

---

## Month 3 Summary

| Metric | Target |
|--------|--------|
| npm publishes | 4 (weekly Sundays) |
| Version range | 0.13.0 → 0.16.0 |
| Bug fixes | 53 items across Stripe, Razorpay, PayPal, SDK-JS, shared types |
| New adapters | PhonePe (India: 1 of 5) |
| Blog posts | 1 on squaredr.tech |
| Core features | Retry logic, structured logging, lifecycle hooks |

### What moved to Month 4

| Original Week | Item | New Location |
|---------------|------|-------------|
| Week 2 | B2.01 PhonePe | → Month 3 Week 4 |
| Week 3 | B2.02 Cashfree | → Month 4 Week 1 |
| Week 4 | C1.06-C1.15 React improvements | → Month 4 Week 2 |
| Week 5 | Cashfree docs + India blog | → Month 4 Week 3 |
