# Month 9 — February 2027

> **Theme:** 2Checkout + Payoneer + Worldline adapters, vanilla JS checkout widget, CDN bundle, advanced React components
> **Publish cadence:** Weekly on Sundays
> **Starting version:** 1.6.0
> **Target version:** 1.9.0

---

## Week 1 (Feb 7 – Feb 13) → Publish Sunday Feb 13

**Tasks:**
- B4.10 — 2Checkout adapter (full build):
  - Scaffolding + HMAC-MD5 signature auth (merchant code + secret key)
  - `charges.create` (ConvertPlus inline checkout, returns signature + token)
  - `charges.retrieve`, `refunds.create`
  - `subscriptions.create` (2Checkout recurring billing)
  - `webhooks.verify/parse` (IPN HMAC verification)
  - Register in registry, tests
- B4.11 — Payoneer adapter (full build):
  - Scaffolding + Basic auth (merchant code + API key)
  - `charges.create` (LIST request, returns redirect URL)
  - `charges.retrieve`, `refunds.create`
  - `webhooks.verify/parse` (notification verification)
  - Register in registry, tests
- B4.12 — Worldline adapter (full build):
  - Scaffolding + HMAC-SHA256 signature auth (API key ID + secret)
  - `charges.create` (hosted checkout or server-to-server)
  - `charges.retrieve`, `refunds.create`
  - `webhooks.verify/parse` (HMAC-SHA256 verification)
  - Register in registry, tests

**Bump:** 1.6.0 → **1.7.0**

---

## Week 2 (Feb 14 – Feb 20) → Publish Sunday Feb 20

**Tasks:**
- C2.12 — Vanilla JS checkout widget:
  - `PayKit.createCheckout(container, options)` — no-React, no-framework
  - Options: `{ provider, clientSecret, theme, onSuccess, onError }`
  - Renders card input form using appropriate provider bridge
  - Self-contained CSS
- C2.13 — CDN bundle build:
  - UMD output: `dist/paykit.umd.js` + `dist/paykit.umd.min.js`
  - `unpkg` + `jsdelivr` fields in package.json
  - Usage: `<script src="https://unpkg.com/@squaredr/paykit-js"></script>` → `window.PayKit.createCheckout(...)`
- C1.08 — `<PayKitElements>` primitives:
  - `<CardNumber>`, `<CardExpiry>`, `<CardCvc>` individual components
  - Wraps Stripe Elements (or Razorpay equivalent)
  - Props: `className`, `style`, `onReady`, `onChange`, `onError`
- C1.04 — `<AddressForm>` component:
  - Fields: name, line1, line2, city, state, postalCode, country
  - Props: `defaultValues`, `requiredFields`, `countries`, `onSubmit`, `onChange`

**Bump:** react → **2.3.0**, sdk-js → **2.3.0**

---

## Week 3 (Feb 21 – Feb 27) → Publish Sunday Feb 27

**Tasks:**
- C1.12 + C1.13 — India-specific React components:
  - `<UPIInput>` — VPA input field with format validation
  - `<NetBankingSelect>` — bank selection dropdown from Razorpay bank list
- C1.14 — `<WalletButtons>` component:
  - Apple Pay + Google Pay buttons based on browser/device support
  - Uses Stripe Payment Request API
  - Props: `onPaymentMethod`, `amount`, `currency`, `country`
- C2.09 + C2.10 — Apple Pay + Google Pay in StripeProviderBridge:
  - `canMakePayment(type)` check
  - `requestWalletPayment(options)` → triggers Apple Pay / Google Pay sheet
- A5.10 — Webhook event logging utility:
  - `webhooks.log(event)` → structured JSON output
- A5.06 — `WebhookHandler.detectProvider(headers)` static method
- C2.14 — Standardized event-based flow across all provider bridges:
  - Events: `ready`, `change`, `error`, `success`, `cancel`
- D.18 — Mutation testing (Stryker, 70% threshold)
- D.25 — Benchmarks (tinybench)

**Bump:** react patch, sdk-js patch, core → **1.8.0**

---

## Week 4 (Feb 28) — Content week

**Tasks:**
- Blog: "Open Source Payments: Why We Built PayKit"
- Blog: "Testing Payment Integrations Without Real Money"
- Docs: 2Checkout, Payoneer, Worldline adapter guides
- Docs: TypeScript types reference
- Docs: Environment variables reference
- Update README with adapter count (24)
- Update landing page providers section

**No version bump** — content week

---

## Month 9 Summary

| Metric | Target |
|--------|--------|
| npm publishes | 3 |
| Version range | 1.6.0 → 1.9.0 |
| New adapters | 2Checkout, Payoneer, Worldline (total: 24) |
| Blog posts | 2 |
| React components | PayKitElements, AddressForm, UPIInput, NetBankingSelect, WalletButtons |
| JS SDK | Vanilla checkout widget, CDN/UMD bundle, Apple Pay + Google Pay, event-based flow |
| Webhook system | Event logging, provider auto-detection |
| Testing | Mutation testing (Stryker), benchmarks |
