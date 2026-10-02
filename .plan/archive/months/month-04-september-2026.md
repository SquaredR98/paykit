# Month 4 — September 2026

> **Theme:** Cashfree + overflow from Month 3, React improvements, India complete (Paytm + CCAvenue), subscription lifecycle, testing
> **Publish cadence:** Weekly on Sundays
> **Blog cadence:** Publish on squaredr.tech only (no 3rd-party cross-posting)
> **Starting version:** 0.16.0
> **Target version:** 0.22.0

---

## Week 1 (Sep 6 – Sep 13) → Publish Sunday Sep 13

> Overflow from Month 3: Cashfree adapter (was Month 3 Week 3)

**Tasks:**
- B2.02 — Cashfree adapter (full build):
  - Scaffolding + API key auth
  - `charges.create/retrieve/capture` (Orders API)
  - `refunds.create/retrieve`
  - `webhooks.verify/parse`
  - `subscriptions.create` (Cashfree Subscription API)
  - Register in registry, add to `ProviderName` union, tests

**Bump:** 0.16.0 → **0.17.0**

---

## Week 2 (Sep 14 – Sep 20) → Publish Sunday Sep 20

> Overflow from Month 3: React improvements (was Month 3 Week 4)

**Tasks:**
- C1.06 — CSS variables theming for CheckoutForm
- C1.07 — Theme prop presets (`light`, `dark`, `auto`, `minimal`)
- C1.09 + C1.10 — `onReady` and `onValidationChange` callbacks
- C1.11 — Loading skeleton for CheckoutForm
- C2.04 + C2.05 — `destroy()` and `isReady()` methods for JS SDK
- C1.15 — SSR-safe provider detection

**Bump:** paykit-react → 1.0.6, paykit-js → 1.0.3

---

## Week 3 (Sep 21 – Sep 27) → Publish Sunday Sep 27

> Overflow content + Paytm + CCAvenue adapters

**Tasks:**
- Cashfree docs page (squaredr.tech)
- E2.05 — Blog: "The Complete India Payments Stack"
- B2.03 — Paytm adapter (full build):
  - Scaffolding + checksum auth (merchant ID + merchant key)
  - `charges.create/retrieve/capture` (initiateTransaction API)
  - `refunds.create` + `webhooks.verify/parse`
  - Register in registry, docs page, tests
- B2.04 — CCAvenue adapter (full build):
  - Scaffolding + AES-128-CBC encryption auth
  - `charges.create/retrieve` (redirect flow, response decryption)
  - `refunds.create` + `webhooks.verify/parse`
  - Register in registry, docs page, tests

**Bump:** 0.17.0 → **0.19.0**

---

## Week 4 (Sep 28 – Oct 4) → Publish Sunday Oct 4

**Tasks:**
- A8.01–A8.05 — Stripe subscription operations (update, cancel, pause, resume, list)
- A8.06 + A8.07 — Razorpay subscription update + cancel
- A8.08 — Trial period support (`trialDays` param)
- A4.02 + A4.03 — Region and paymentMethod routing in PaymentRouter

**Bump:** 0.19.0 → **0.20.0**

---

## Content (no publish — spread across the month)

- E1.09 — PaymentRouter guide (squaredr.tech)
- E1.10 — Currency handling guide (squaredr.tech)
- E1.11 — Subscription management guide (squaredr.tech)
- E4.02 — Update landing page with India adapters
- E2.07 — Blog: "Webhook Normalization: One Handler for Every Provider"

---

## What moved to Month 5

| Original Month 4 Item | New Location |
|------------------------|-------------|
| D.01-D.02 Stripe integration tests | → Month 5 Week 1 |
| D.05-D.06 Razorpay integration tests | → Month 5 Week 1 |
| D.08 PaymentRouter integration tests | → Month 5 Week 1 |
| D.13-D.15 Bundle size, strict mode, coverage | → Month 5 Week 2 |
| A4.04-A4.06 Router enhancements (listAdapters, onRoute, fallback) | → Month 5 Week 2 |
| D.17, D.20 Package validation, Node matrix | → Month 5 Week 2 |

---

## Month 4 Summary

| Metric | Target |
|--------|--------|
| npm publishes | 4 (weekly Sundays) |
| Version range | 0.16.0 → 0.20.0 |
| New adapters | Cashfree, Paytm, CCAvenue (India coverage complete: 5/5 with Razorpay + PhonePe) |
| Cumulative adapters | 7 (Stripe, Razorpay, PayPal, PhonePe, Cashfree, Paytm, CCAvenue) |
| Blog posts | 2 on squaredr.tech |
| React improvements | 5 (theming, presets, callbacks, skeleton, SSR) |
| Subscription lifecycle | Full CRUD for Stripe + Razorpay, trial period support |
| **Milestone** | **India coverage complete** |
