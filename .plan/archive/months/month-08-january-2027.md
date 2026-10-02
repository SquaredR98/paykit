# Month 8 — January 2027

> **Theme:** China payments stack (Alipay, WeChat Pay, UnionPay), React hooks, WebhookHandler class, E2E testing
> **Publish cadence:** Weekly on Sundays
> **Starting version:** 1.3.1
> **Target version:** 1.6.0

---

## Week 1 (Jan 4 – Jan 10) → Publish Sunday Jan 10

**Tasks:**
- B4.07 — Alipay adapter (full build):
  - Scaffolding + RSA-2048 auth (app ID + merchant private key)
  - `charges.create` (`alipay.trade.page.pay` web, `alipay.trade.app.pay` mobile)
  - `charges.retrieve` (`alipay.trade.query`)
  - `refunds.create` (`alipay.trade.refund`)
  - `webhooks.verify/parse` (RSA signature verification with Alipay public key)
  - Support both domestic China and cross-border modes
  - Register in registry, add to `ProviderName`, tests
- B4.08 — WeChat Pay adapter (full build):
  - Scaffolding + WeChat Pay V3 auth (merchant ID + API key + certificate, WECHATPAY2-SHA256-RSA2048 signature)
  - `charges.create` (JSAPI / Native QR / H5 / Mini Program flows)
  - `charges.retrieve`, `refunds.create`
  - `webhooks.verify/parse` (AEAD_AES_256_GCM decryption + RSA signature)
  - Register in registry, tests

**Bump:** 1.3.1 → **1.4.0**

---

## Week 2 (Jan 11 – Jan 17) → Publish Sunday Jan 17

**Tasks:**
- B4.09 — UnionPay adapter (full build):
  - Scaffolding + RSA signature auth (merchant ID + certificate)
  - `charges.create` (UnionPay gateway payment, redirect form data)
  - `charges.retrieve`, `refunds.create`
  - `webhooks.verify/parse` (RSA notification signature)
  - Register in registry, tests
  - China coverage now complete (Alipay + WeChat Pay + UnionPay)
- A5.07 — `WebhookHandler` class:
  - Constructor: `new WebhookHandler({ stripe, razorpay, ... })`
  - `handle(request)` — auto-detect provider from headers, verify, parse, return `UnifiedWebhookEvent`
- A5.08 + A5.09 — Next.js + Express webhook helpers:
  - `createWebhookHandler(config)` → Next.js App Router Route Handler
  - `webhookMiddleware(config)` → Express middleware
- A5.04 + A5.05 — Webhook timestamp validation + replay protection:
  - Reject events older than configurable `maxAge` (default 5 min)
  - In-memory LRU Set of processed event IDs (`replayProtection: boolean`)

**Bump:** 1.4.0 → **1.5.0**

---

## Week 3 (Jan 18 – Jan 24) → Publish Sunday Jan 24

**Tasks:**
- C1.02 — `useHeadlessCheckout()` React hook:
  - Returns `{ createPayment, confirmPayment, status, error, isLoading, reset }`
  - No UI rendered — full control for custom checkout UIs
- C1.05 — `usePaymentMethods()` React hook:
  - Returns `{ methods, isLoading, error, remove, setDefault }`
  - Fetches saved payment methods for a customer
- C1.03 — `<SavedCards>` component:
  - Uses `usePaymentMethods()` internally
  - Renders list of saved cards with last 4, brand icon, expiry, default badge, remove button
  - Props: `customerId`, `onSelect`, `onRemove`, `allowRemove`
- D.12 — E2E test for React CheckoutForm (Playwright)
- D.21 — Browser compatibility tests for sdk-js (Chromium, Firefox, WebKit)
- D.22 — React 18 + React 19 compatibility tests

**Bump:** react → **2.2.0**, sdk-js patch

---

## Week 4 (Jan 25 – Jan 31) → Publish Sunday Jan 31

**Tasks:**
- C2.01 — PayPal provider bridge in `@squaredr/paykit-js`:
  - Loads PayPal JS SDK, mounts Smart Payment Buttons
  - Methods: `mount(container)`, `confirmPayment()`, `destroy()`
  - Handles `onApprove`, `onCancel`, `onError`
- C1.15 — SSR-safe provider detection:
  - `useIsClient()` hook, `PayKitProvider` SSR-safe rendering
- Blog: "The China Payments Stack: Alipay, WeChat, UnionPay"
- Blog: "How We Handle Webhook Verification Across Providers"
- Docs: Alipay, WeChat Pay, UnionPay adapter guides
- Docs: Saved payment methods guide
- Docs: React components API reference
- Docs: JS SDK API reference
- Update landing page with China adapters + provider count (21)

**No version bump** — content + docs week

---

## Month 8 Summary

| Metric | Target |
|--------|--------|
| npm publishes | 3 |
| Version range | 1.3.1 → 1.6.0 |
| New adapters | Alipay, WeChat Pay, UnionPay (China coverage complete, total: 21) |
| Blog posts | 2 |
| React components | SavedCards, useHeadlessCheckout, usePaymentMethods, SSR-safe |
| JS SDK | PayPal bridge |
| Webhook system | WebhookHandler class, Next.js + Express helpers, timestamp validation, replay protection |
| Testing | E2E Playwright, browser compat, React 18/19 matrix |
