# PayKit Shipping Schedule

## Overview

11-week plan to ship `@squaredr/paykit` from initial launch to 25+ provider coverage. Adapters + docs + blog each week.

**Architecture:**
- **All adapters** are subpath exports of `@squaredr/paykit` (e.g. `@squaredr/paykit/stripe`, `@squaredr/paykit/phonepe`)
- Provider SDKs (`stripe`, `razorpay`, etc.) are optional peer dependencies
- **3 npm packages total**: `@squaredr/paykit` (core + all adapters), `@squaredr/paykit-react`, `@squaredr/paykit-js`

---

## Week 1 — SHIPPED: Core + Stripe + Razorpay

### Code
- [x] Monorepo setup (Turborepo, Biome, Changesets)
- [x] `@squaredr/paykit` core — types, interfaces, client, router
- [x] 252 unit tests passing
- [x] Stripe adapter — charges, refunds, customers, subscriptions, webhooks
- [x] Razorpay adapter — charges, refunds, customers, subscriptions, webhooks
- [x] `@squaredr/paykit-js` — Vanilla JS frontend SDK
- [x] `@squaredr/paykit-react` — React components + hooks
- [x] Demo app (Next.js)
- [x] Package consolidation: subpath exports, 3 packages total

### npm — PUBLISHED
- `@squaredr/paykit@0.4.0`
- `@squaredr/paykit-js@1.0.0`
- `@squaredr/paykit-react@1.0.0`

### SDK API Alignment — SHIPPED (v0.4.0)
- [x] `PayKit` alias for `UnifiedPayments`
- [x] `AdapterConfig` — `new PayKit({ adapter })` pattern
- [x] Constructor sugar on adapters — `new StripeAdapter({ secretKey })`
- [x] `webhooks.construct({ payload, signature, secret })`
- [x] `PaymentRouter` class

### Website — SHIPPED
- [x] Landing page at `/products/paykit`
- [x] 12 docs pages (intro, installation, quick start, core concepts, guides, API reference, FAQ, migration)
- [x] Blog post: "Introducing PayKit"

### Results
- 200+ npm downloads within first day

### Still TODO from Week 1
- [ ] Add Vercel Analytics to squaredr.tech

---

## Week 2 — PayPal + Infrastructure

### Adapter
- [x] `@squaredr/paykit/paypal` — OAuth 2.0, Order → Capture flow
  - `adapters/paypal/adapter.ts` — `PayPalAdapter`, OAuth token management
  - `adapters/paypal/mappers/` — charge, refund, customer, subscription, webhook, error
  - Unit tests (47/47 mapper tests passing, 75/105 adapter tests passing)
- [x] PayPal client adapter — dual-mode Buttons + Card Fields (`paypal-hosted.ts` rewrite)
- [x] PayPal SDK-JS provider bridge (`packages/sdk-js/src/providers/paypal.ts`)
- [x] PayPal added to `SupportedProvider` type
- [x] PayPal added to website LiveDemo

### Bug Fixes (from cross-adapter review)
- [x] PayPal webhook verification — postback API integration
- [x] PayPal refund currency extraction fix
- [x] PayPal partial capture support
- [x] PayPal subscription status mapping (SDK type workaround)
- [x] PayPal charges.cancel error type fix
- [x] PayPal subscription productId — auto-create catalog product
- [x] PayPal cancelAtPeriodEnd — suspend instead of cancel
- [x] PayPal paymentSource wiring for vault
- [x] PayPal embeddableUI capability flag → true
- [x] PayPal mapper test data fixed (snake_case → camelCase for SDK v2.4.0)

### Infrastructure
- [ ] License key validation module
- [ ] `PAYKIT_LICENSE_KEY` env var support

### Website
- [x] Update provider table (PayPal → LiveDemo tab added)

### Blog
- Cross-post "Introducing PayKit" to Dev.to, Reddit (r/webdev, r/node), Twitter/X

### Docs
- [ ] PayPal adapter guide

### npm Release
- `@squaredr/paykit@0.5.0`

---

## Week 3 — PhonePe + Cashfree

### Adapters
- [ ] `@squaredr/paykit/phonepe` — redirect flow, UPI intent, StandardCheckout API
  - `PhonePeAdapter` — redirect-heavy, UPI intent, S2S callback
  - Mappers + unit tests
- [ ] `@squaredr/paykit/cashfree` — Order-based, JS SDK token, UPI AutoPay
  - `CashfreeAdapter` — order flow, session token for frontend
  - Mappers + unit tests

### Website
- [ ] India section on landing page: "5 Indian Providers. One API."
- [ ] Update provider table

### Blog
**"Deep India Coverage: PhonePe, Cashfree + UPI Done Right"**
- India's UPI-first landscape
- How PhonePe redirect flow differs from Razorpay modal
- Code: switch providers by changing config

### Docs
- [ ] PhonePe adapter guide
- [ ] Cashfree adapter guide

### npm Release
- `@squaredr/paykit@0.6.0`

---

## Week 4 — Paytm + CCAvenue

### Adapters
- [ ] `@squaredr/paykit/paytm` — txnToken flow, Paytm wallet
  - `PaytmAdapter` — initiateTransaction, txnToken flow
  - Mappers + unit tests
- [ ] `@squaredr/paykit/ccavenue` — POST-based, encryption, widest Indian bank support
  - `CCAvenueAdapter` — encrypted POST redirect flow
  - Mappers + unit tests

### India Coverage Complete
All 5 Indian providers covered (Razorpay + PhonePe + Cashfree + Paytm + CCAvenue).

### Blog
**"The Complete India Payments Stack: Every Provider, One SDK"**
- All 5 Indian providers covered
- UPI, netbanking, wallets — all mapped to unified types

### Docs
- [ ] Paytm adapter guide
- [ ] CCAvenue adapter guide
- [ ] India payments guide (UPI, netbanking, wallets)

### npm Release
- `@squaredr/paykit@0.7.0`

---

## Week 5 — Square + Adyen

### Adapters
- [ ] `@squaredr/paykit/square` — POS + online, OAuth, Cash App Pay
  - `SquareAdapter` — Payments + Orders API
  - Mappers + unit tests
- [ ] `@squaredr/paykit/adyen` — enterprise, 250+ methods, auth+capture
  - `AdyenAdapter` — full-featured, auth+capture, drop-in support
  - Mappers + unit tests

### Website
- [ ] Update provider table

### Blog
**"PayKit Beta: 8 Providers, Production-Ready"**
- Recap: what shipped in 5 weeks
- Enterprise capability (Adyen)

### Docs
- [ ] Square adapter guide
- [ ] Adyen adapter guide
- [ ] Production deployment guide

### npm Release
- `@squaredr/paykit@1.0.0-beta.1` — beta milestone

---

## Week 6 — Mollie + MercadoPago + Flutterwave

### Adapters
- [ ] `@squaredr/paykit/mollie` — EU local methods (iDEAL, SOFORT, Bancontact)
  - `MollieAdapter` — subscriptions, refunds, multicurrency
  - Mappers + unit tests
- [ ] `@squaredr/paykit/mercadopago` — LatAm (PIX, Boleto, OXXO)
  - `MercadoPagoAdapter` — OAuth, preference-based checkout
  - Mappers + unit tests
- [ ] `@squaredr/paykit/flutterwave` — Africa (M-Pesa, mobile money, USSD)
  - `FlutterwaveAdapter` — inline + redirect flows
  - Mappers + unit tests

### Website
- [ ] Update provider comparison table (11 providers)

### Blog
**"PayKit Goes Global: Europe, LatAm, Africa"**
- Mollie for Europe (iDEAL, SOFORT)
- MercadoPago for LatAm (PIX, Boleto)
- Flutterwave for Africa (M-Pesa, mobile money)

### Docs
- [ ] Mollie adapter guide
- [ ] MercadoPago adapter guide
- [ ] Flutterwave adapter guide

### npm Release
- `@squaredr/paykit@1.0.0-beta.2`

---

## Week 7 — 1.0 Release: PayU + Airwallex + GoCardless

### Adapters
- [ ] `@squaredr/paykit/payu` — India, LatAm, Europe (multi-region)
  - `PayUAdapter` — multi-region, bolt checkout
  - Mappers + unit tests
- [ ] `@squaredr/paykit/airwallex` — cross-border, multi-currency FX
  - `AirwallexAdapter` — payment intent flow, multi-currency
  - Mappers + unit tests
- [ ] `@squaredr/paykit/gocardless` — Direct debit (SEPA, ACH, Bacs)
  - `GoCardlessAdapter` — mandate-based, subscription-heavy
  - Mappers + unit tests

### 1.0 Release
- [ ] Conformance test pass on all 14 adapters
- [ ] Update all examples to 1.0 API

### Website
- [ ] Remove Beta badge → stable
- [ ] **Product Hunt submission**

### Blog
**"PayKit 1.0: 14 Providers, One API, Production-Ready"**
- The journey: 7 weeks, solo dev, idea to 1.0
- By the numbers: adapters, downloads, stars
- Submit to Hacker News

### Docs
- [ ] PayU adapter guide
- [ ] Airwallex adapter guide
- [ ] GoCardless adapter guide
- [ ] Troubleshooting guide
- [ ] FAQ (updated)

### npm Release
- **`@squaredr/paykit@1.0.0`** — stable

---

## Week 8 — Worldpay + Authorize.net + Nuvei

### Adapters
- [ ] `@squaredr/paykit/worldpay` — enterprise, 175+ countries
  - `WorldpayAdapter` — REST + certificate auth
  - Mappers + unit tests
- [ ] `@squaredr/paykit/authorizenet` — Authorize.net, legacy US merchants
  - `AuthorizeNetAdapter` — API Login + Transaction Key
  - Mappers + unit tests
- [ ] `@squaredr/paykit/nuvei` — gaming, crypto, high-risk
  - `NuveiAdapter` — APMs, alternative payments
  - Mappers + unit tests

### Blog
**"Legacy Enterprise: Worldpay, Authorize.net, and Nuvei"**
- Enterprise migration path
- PayKit as a bridge from legacy to modern DX

### Docs
- [ ] Worldpay adapter guide
- [ ] Authorize.net adapter guide
- [ ] Nuvei adapter guide

### npm Release
- `@squaredr/paykit@1.1.0`

---

## Week 9 — Alipay + WeChat Pay + UnionPay

### Adapters
- [ ] `@squaredr/paykit/alipay` — domestic + cross-border, RSA signature
  - `AlipayAdapter` — merchant ID auth, RSA signing
  - Mappers + unit tests
- [ ] `@squaredr/paykit/wechatpay` — WeChat Pay, QR, mini-programs
  - `WeChatPayAdapter` — certificate-based, RSA
  - Mappers + unit tests
- [ ] `@squaredr/paykit/unionpay` — UnionPay International
  - `UnionPayAdapter` — certificate + RSA
  - Mappers + unit tests

### Blog
**"The China Payments Stack: Alipay, WeChat Pay, UnionPay"**
- QR-code-first vs card-first
- Cross-border payment flows
- RSA webhook verification

### Docs
- [ ] Alipay adapter guide
- [ ] WeChat Pay adapter guide
- [ ] UnionPay adapter guide

### npm Release
- `@squaredr/paykit@1.2.0`

---

## Week 10 — 2Checkout + Payoneer + Worldline

### Adapters
- [ ] `@squaredr/paykit/2checkout` — digital goods, SaaS, Verifone
  - `TwoCheckoutAdapter`
  - Mappers + unit tests
- [ ] `@squaredr/paykit/payoneer` — B2B, marketplace payouts
  - `PayoneerAdapter` — REST API, payout-heavy
  - Mappers + unit tests
- [ ] `@squaredr/paykit/worldline` — EU enterprise, Ingenico
  - `WorldlineAdapter` — certificate auth
  - Mappers + unit tests

### 25 Providers Milestone

### Website
- [ ] "25 Providers" hero badge
- [ ] Full provider comparison matrix page

### Blog
**"25 Providers, One API: The Complete PayKit"**
- The full provider matrix
- When to use which provider

### Docs
- [ ] 2Checkout adapter guide
- [ ] Payoneer adapter guide
- [ ] Worldline adapter guide
- [ ] Provider selection guide

### npm Release
- `@squaredr/paykit@1.3.0`

---

## Week 11 — Polish, Frontend v2, Community

### Frontend SDK Enhancements
- [ ] `<PaymentStatus>` — polling-based status display
- [ ] Headless mode hooks (`useHeadlessCheckout`)
- [ ] Theming engine (CSS variables, presets)
- [ ] Example: `examples/react-checkout/`

### Polish
- [ ] Conformance test suite for all 25 adapters
- [ ] Bug fixes from community feedback
- [ ] Contributing guide (community adapter contributions)
- [ ] Video tutorial: "Getting started with PayKit in 5 minutes"

### npm Release
- `@squaredr/paykit-react@2.0.0`
- `@squaredr/paykit-js@2.0.0`

---

## Weekly Summary

| Week | Adapters | Cumulative | Milestone |
|------|----------|------------|-----------|
| **1** | Stripe, Razorpay | 2 | **SHIPPED** — 200+ downloads |
| **2** | PayPal | 3 | Infrastructure, cross-post blog |
| **3** | PhonePe, Cashfree | 5 | India coverage starts |
| **4** | Paytm, CCAvenue | 7 | India coverage complete |
| **5** | Square, Adyen | 9 | Beta milestone |
| **6** | Mollie, MercadoPago, Flutterwave | 12 | Global coverage |
| **7** | PayU, Airwallex, GoCardless | 15 | **1.0 release**, Product Hunt |
| **8** | Worldpay, Authorize.net, Nuvei | 18 | Enterprise adapters |
| **9** | Alipay, WeChat Pay, UnionPay | 21 | China coverage |
| **10** | 2Checkout, Payoneer, Worldline | 24 | **25 providers** |
| **11** | — (frontend v2) | 24 | Polish, community, frontend v2 |

**Totals:**
- 3 free adapters (Stripe, Razorpay, PayPal)
- 21 additional adapters
- 3 npm packages (`@squaredr/paykit`, `@squaredr/paykit-react`, `@squaredr/paykit-js`)
- 10 blog posts
- 24 adapter guide pages

---

## Blog Post Cadence

| Week | Title |
|------|-------|
| 2 | Cross-post "Introducing PayKit" |
| 3 | Deep India Coverage: PhonePe, Cashfree + UPI |
| 4 | The Complete India Payments Stack |
| 5 | PayKit Beta: 8 Providers, Production-Ready |
| 6 | PayKit Goes Global: Europe, LatAm, Africa |
| 7 | PayKit 1.0: 14 Providers, One API |
| 8 | Legacy Enterprise: Worldpay, Authorize.net, Nuvei |
| 9 | The China Payments Stack |
| 10 | 25 Providers, One API: The Complete PayKit |
