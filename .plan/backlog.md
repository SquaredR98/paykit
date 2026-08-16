# PayKit — Development Backlog

> Every shippable item for the next 12 months. Monthly docs pull from this list.
> Each item is an executable task with a clear deliverable and npm publish outcome.

---

## Category A: Core SDK Improvements

### A1. Error Handling & DX (20 items)

| # | Item | Deliverable | Version Bump |
|---|------|-------------|-------------|
| A1.01 | Add typed error codes enum to PaymentError | `src/errors.ts` — `PaymentErrorCode` enum with `CARD_DECLINED`, `INSUFFICIENT_FUNDS`, `EXPIRED_CARD`, `INVALID_CVV`, `PROCESSING_ERROR`, `RATE_LIMITED`, `NETWORK_ERROR`, `PROVIDER_ERROR` | patch |
| A1.02 | Add `error.suggestion` field with human-readable fix hints | `PaymentError.suggestion: string` — e.g. "Check the card number and try again" | patch |
| A1.03 | Map Stripe error codes to PaymentErrorCode | `adapters/stripe/mappers/error.ts` — map `card_declined`, `expired_card`, etc. | patch |
| A1.04 | Map Razorpay error codes to PaymentErrorCode | `adapters/razorpay/mappers/error.ts` — map `BAD_REQUEST_ERROR`, etc. | patch |
| A1.05 | Add `error.retryable: boolean` field | Indicates if the error is transient and can be retried | patch |
| A1.06 | Add `error.provider` field showing which adapter threw | Always includes provider name in error context | patch |
| A1.07 | Add `PaymentTimeoutError` class | Extends `PaymentError`, thrown when adapter exceeds timeout | patch |
| A1.08 | Add `ProviderUnavailableError` class | Extends `PaymentError`, thrown when healthCheck fails | patch |
| A1.09 | Add request ID tracking to all adapter calls | `requestId` field on all responses + errors for debugging | patch |
| A1.10 | Add `debug()` utility that pretty-prints adapter state | `import { debug } from '@squaredr/paykit'` — logs config, adapter name, capabilities | patch |
| A1.11 | Add `paykit.getProviderInfo()` method | Returns adapter name, version, capabilities, health status | patch |
| A1.12 | Improve error messages for missing credentials | Instead of generic "secretKey required", show exactly which env var to set | patch |
| A1.13 | Add `ValidationError` for invalid params before hitting provider | Validates amount > 0, currency is ISO 4217, etc. locally | patch |
| A1.14 | Add param validation for `charges.create` | Validate required fields before network call | patch |
| A1.15 | Add param validation for `refunds.create` | Validate chargeId not empty, amount > 0 | patch |
| A1.16 | Add param validation for `customers.create` | Validate email format if provided | patch |
| A1.17 | Add param validation for `subscriptions.create` | Validate interval, amount, currency | patch |
| A1.18 | Add `idempotencyKey` support to `charges.create` | Pass through to Stripe/Razorpay idempotency headers | patch |
| A1.19 | Add `idempotencyKey` support to `refunds.create` | Same pattern as charges | patch |
| A1.20 | Add retry logic with exponential backoff for transient errors | `options.retries` config, only retries on `retryable: true` errors | minor |

### A2. Type System & Exports (15 items)

| # | Item | Deliverable | Version Bump |
|---|------|-------------|-------------|
| A2.01 | Export all mapper types from subpath exports | Each adapter's `index.ts` re-exports mapper input/output types | patch |
| A2.02 | Add `ChargeStatus` union type export | `'pending' \| 'succeeded' \| 'failed' \| 'canceled' \| 'requires_action'` | patch |
| A2.03 | Add `RefundStatus` union type export | `'pending' \| 'succeeded' \| 'failed'` | patch |
| A2.04 | Add `SubscriptionStatus` union type export | `'active' \| 'past_due' \| 'canceled' \| 'trialing' \| 'paused'` | patch |
| A2.05 | Add `WebhookEventType` union type export | `'charge.succeeded' \| 'charge.failed' \| 'refund.created' \| ...` | patch |
| A2.06 | Add `ProviderName` union type | `'stripe' \| 'razorpay' \| 'paypal' \| ...` — grows with adapters | patch |
| A2.07 | Add `CurrencyCode` type (ISO 4217 subset) | `'USD' \| 'EUR' \| 'INR' \| 'GBP' \| ...` for type safety | patch |
| A2.08 | Add strict generics to `PaymentRouter` | `PaymentRouter<TProviders extends string>` for type-safe provider names | minor |
| A2.09 | Add `PayKitConfig` type alias for constructor params | Union of `AdapterConfig \| SingleProviderConfig \| MultiProviderConfig` | patch |
| A2.10 | Export `CreateChargeParams` from root | Currently only from `types/charge.ts`, should be top-level | patch |
| A2.11 | Export `CreateRefundParams` from root | Same pattern | patch |
| A2.12 | Export `CreateCustomerParams` from root | Same pattern | patch |
| A2.13 | Export `CreateSubscriptionParams` from root | Same pattern | patch |
| A2.14 | Add JSDoc comments to all exported types | Every public type gets `@description`, `@example` | patch |
| A2.15 | Add `@since` tags to all public APIs | Track which version introduced each API | patch |

### A3. Currency & Localization (10 items)

| # | Item | Deliverable | Version Bump |
|---|------|-------------|-------------|
| A3.01 | Add `formatAmount(amount, currency)` display formatter | Returns locale-aware string: `formatAmount(4900, 'USD')` → `'$49.00'` | patch |
| A3.02 | Add `getCurrencyInfo(code)` metadata lookup | Returns `{ code, symbol, name, decimalPlaces, country }` | patch |
| A3.03 | Add zero-decimal currency list | JPY, KRW, etc. — used by `toSmallestUnit` to skip multiplication | patch |
| A3.04 | Add three-decimal currency support | BHD, KWD, OMR — 1000 fils per unit | patch |
| A3.05 | Add `isSupportedCurrency(code)` validator | Checks against ISO 4217 list | patch |
| A3.06 | Add currency conversion stub interface | `CurrencyConverter` interface for pluggable FX | patch |
| A3.07 | Add `convertAmount(amount, from, to, rate)` utility | Pure function, no API calls — user provides rate | patch |
| A3.08 | Export currency data as JSON for frontend use | `@squaredr/paykit/currencies` subpath export | minor |
| A3.09 | Add `getProviderCurrencies(providerName)` | Returns list of currencies supported by a specific adapter | patch |
| A3.10 | Add currency validation to `charges.create` | Warn if currency not supported by the active adapter | patch |

### A4. PaymentRouter Enhancements (10 items)

| # | Item | Deliverable | Version Bump |
|---|------|-------------|-------------|
| A4.01 | Add `router.resolveAdapter(currency, region?)` public method | Exposes routing decision without creating a charge | patch |
| A4.02 | Add `region` routing support to PaymentRouter | Match by region in addition to currency | patch |
| A4.03 | Add `paymentMethod` routing support | Route UPI to Razorpay, cards to Stripe, etc. | patch |
| A4.04 | Add `router.listAdapters()` method | Returns all registered adapters with their routing rules | patch |
| A4.05 | Add `onRoute` callback to PaymentRouter | `onRoute: (provider, currency, region) => void` for logging/analytics | patch |
| A4.06 | Add fallback adapter support | If primary adapter fails, try fallback adapter | minor |
| A4.07 | Add weighted routing (percentage-based) | Route 80% to Stripe, 20% to Adyen for A/B testing | minor |
| A4.08 | Add `router.refunds.create()` | Route refunds to the adapter that created the original charge | patch |
| A4.09 | Add `router.customers.create()` | Route customer creation based on region/currency | patch |
| A4.10 | Add cost-based routing | Route to cheapest provider for a given currency/amount | minor |

### A5. Webhook Enhancements (10 items)

| # | Item | Deliverable | Version Bump |
|---|------|-------------|-------------|
| A5.01 | Add `WebhookEvent.type` normalization | Normalize Stripe's `payment_intent.succeeded` and Razorpay's `payment.captured` to `charge.succeeded` | patch |
| A5.02 | Add webhook event type constants | `WEBHOOK_EVENTS.CHARGE_SUCCEEDED`, etc. | patch |
| A5.03 | Add `webhooks.isValid()` — boolean-only signature check | Returns `true/false` without parsing the full event | patch |
| A5.04 | Add webhook timestamp validation | Reject events older than configurable threshold (default 5 min) | patch |
| A5.05 | Add webhook replay protection | Track event IDs to prevent duplicate processing | patch |
| A5.06 | Add `webhooks.parseHeaders(headers)` — extract provider from headers | Auto-detect which provider sent the webhook from headers alone | patch |
| A5.07 | Add `WebhookHandler` class for Express/Next.js | `new WebhookHandler({ stripe: stripeAdapter, razorpay: razorpayAdapter })` — auto-routes | minor |
| A5.08 | Add Next.js App Router webhook handler helper | `createWebhookHandler(config)` returns a Route Handler | patch |
| A5.09 | Add Express middleware for webhooks | `paykit.webhookMiddleware()` for Express apps | patch |
| A5.10 | Add webhook event logging utility | `webhooks.log(event)` — structured JSON output for debugging | patch |

### A6. Testing Utilities (10 items)

| # | Item | Deliverable | Version Bump |
|---|------|-------------|-------------|
| A6.01 | Add `MockAdapter` to testing subpath | `@squaredr/paykit/testing` — full mock adapter for unit tests | patch |
| A6.02 | Add `createMockCharge()` factory | Returns a valid `UnifiedCharge` with sensible defaults | patch |
| A6.03 | Add `createMockRefund()` factory | Same pattern | patch |
| A6.04 | Add `createMockCustomer()` factory | Same pattern | patch |
| A6.05 | Add `createMockWebhookEvent()` factory | Returns a valid `UnifiedWebhookEvent` | patch |
| A6.06 | Add `createMockSubscription()` factory | Same pattern | patch |
| A6.07 | Add `assertCharge()` test helper | Validates a charge object has required fields | patch |
| A6.08 | Add `assertRefund()` test helper | Same pattern | patch |
| A6.09 | Add test card numbers export | `TEST_CARDS.VISA_SUCCESS`, `TEST_CARDS.DECLINE`, etc. | patch |
| A6.10 | Add conformance test suite for adapter authors | Run against any adapter to verify it meets the interface contract | minor |

### A7. Logging & Observability (8 items)

| # | Item | Deliverable | Version Bump |
|---|------|-------------|-------------|
| A7.01 | Add structured logging to all adapter calls | `options.logging: 'debug'` logs request/response | patch |
| A7.02 | Add `onRequest` hook | Callback before every provider API call | patch |
| A7.03 | Add `onResponse` hook | Callback after every provider API call with timing | patch |
| A7.04 | Add `onError` hook | Global error callback across all operations | patch |
| A7.05 | Add request duration tracking | `response._meta.durationMs` on all responses | patch |
| A7.06 | Add provider API version tracking | `response._meta.providerApiVersion` | patch |
| A7.07 | Add pino logger adapter | `import { pinoLogger } from '@squaredr/paykit/logging'` | patch |
| A7.08 | Add winston logger adapter | Same pattern for winston | patch |

### A8. Subscription Enhancements (8 items)

| # | Item | Deliverable | Version Bump |
|---|------|-------------|-------------|
| A8.01 | Add `subscriptions.update()` to Stripe adapter | Update plan, quantity, billing cycle | patch |
| A8.02 | Add `subscriptions.cancel()` to Stripe adapter | Cancel immediately or at period end | patch |
| A8.03 | Add `subscriptions.pause()` to Stripe adapter | Pause collection | patch |
| A8.04 | Add `subscriptions.resume()` to Stripe adapter | Resume paused subscription | patch |
| A8.05 | Add `subscriptions.list()` to Stripe adapter | List subscriptions with filters | patch |
| A8.06 | Add `subscriptions.update()` to Razorpay adapter | Update plan | patch |
| A8.07 | Add `subscriptions.cancel()` to Razorpay adapter | Cancel subscription | patch |
| A8.08 | Add trial period support to subscription creation | `trialDays` param in `subscriptions.create()` | patch |

---

## Category B: New Adapters (24 items)

### B1. Free Adapters (1 item)

| # | Item | Deliverable | Version Bump |
|---|------|-------------|-------------|
| B1.01 | ✅ PayPal adapter | `adapters/paypal/` — OAuth 2.0, Orders API, capture flow, refunds, webhooks | minor |

### B2. India Adapters (4 items)

| # | Item | Deliverable | Version Bump |
|---|------|-------------|-------------|
| B2.01 | PhonePe adapter | `adapters/phonepe/` — StandardCheckout API, UPI intent, S2S callback | minor |
| B2.02 | Cashfree adapter | `adapters/cashfree/` — Order flow, session token, UPI AutoPay | minor |
| B2.03 | Paytm adapter | `adapters/paytm/` — txnToken flow, wallet support | minor |
| B2.04 | CCAvenue adapter | `adapters/ccavenue/` — encrypted POST redirect, 200+ banks | minor |

### B3. Global Adapters (5 items)

| # | Item | Deliverable | Version Bump |
|---|------|-------------|-------------|
| B3.01 | Square adapter | `adapters/square/` — Payments + Orders API, OAuth | minor |
| B3.02 | Adyen adapter | `adapters/adyen/` — 250+ methods, auth+capture, drop-in | minor |
| B3.03 | Mollie adapter | `adapters/mollie/` — iDEAL, SOFORT, Bancontact, SEPA | minor |
| B3.04 | MercadoPago adapter | `adapters/mercadopago/` — PIX, Boleto, OXXO | minor |
| B3.05 | Flutterwave adapter | `adapters/flutterwave/` — M-Pesa, mobile money, USSD | minor |

### B4. Enterprise Adapters (14 items)

| # | Item | Deliverable | Version Bump |
|---|------|-------------|-------------|
| B4.01 | PayU adapter | `adapters/payu/` — multi-region (India, EU, LatAm) | minor |
| B4.02 | Airwallex adapter | `adapters/airwallex/` — cross-border FX, multi-currency | minor |
| B4.03 | GoCardless adapter | `adapters/gocardless/` — SEPA, ACH, Bacs direct debit | minor |
| B4.04 | Worldpay adapter | `adapters/worldpay/` — enterprise, 175+ countries | minor |
| B4.05 | Authorize.net adapter | `adapters/authorizenet/` — legacy US merchants | minor |
| B4.06 | Nuvei adapter | `adapters/nuvei/` — gaming, crypto, high-risk | minor |
| B4.07 | Alipay adapter | `adapters/alipay/` — domestic + cross-border, RSA | minor |
| B4.08 | WeChat Pay adapter | `adapters/wechatpay/` — QR, mini-programs | minor |
| B4.09 | UnionPay adapter | `adapters/unionpay/` — China domestic card network | minor |
| B4.10 | 2Checkout adapter | `adapters/2checkout/` — digital goods, SaaS | minor |
| B4.11 | Payoneer adapter | `adapters/payoneer/` — marketplace payouts | minor |
| B4.12 | Worldline adapter | `adapters/worldline/` — EU enterprise (Ingenico) | minor |
| B4.13 | Checkout.com adapter | `adapters/checkoutcom/` — hosted payments, network tokens | minor |
| B4.14 | Klarna adapter | `adapters/klarna/` — BNPL, pay later, pay in 4 | minor |

---

## Category C: Frontend SDK (sdk-js + react) (30 items)

### C1. React Components (15 items)

| # | Item | Deliverable | Version Bump |
|---|------|-------------|-------------|
| C1.01 | Add `<PaymentStatus>` polling component | Shows real-time payment status with auto-refresh | minor |
| C1.02 | Add `useHeadlessCheckout()` hook | Raw payment flow without any UI — for custom UIs | minor |
| C1.03 | Add `<SavedCards>` component | Display and select saved payment methods | minor |
| C1.04 | Add `<AddressForm>` component | Billing/shipping address collection | patch |
| C1.05 | Add `usePaymentMethods()` hook | Fetch and manage saved payment methods | patch |
| C1.06 | Add CSS variables theming to CheckoutForm | Document all `--paykit-*` CSS custom properties | patch |
| C1.07 | Add `theme` prop presets | `theme="light" \| "dark" \| "auto" \| "minimal"` | patch |
| C1.08 | Add `<PayKitElements>` — Stripe Elements-style primitives | `<CardNumber>`, `<CardExpiry>`, `<CardCvc>` as individual components | minor |
| C1.09 | Add `onReady` callback to CheckoutForm | Fires when the payment form is fully mounted and interactive | patch |
| C1.10 | Add `onValidationChange` callback | Fires when form validation state changes | patch |
| C1.11 | Add loading skeleton to CheckoutForm | Shows placeholder while adapter loads | patch |
| C1.12 | Add `<UPIInput>` component for Razorpay UPI | VPA input field with validation | patch |
| C1.13 | Add `<NetBankingSelect>` component | Bank selection dropdown for Razorpay | patch |
| C1.14 | Add `<WalletButtons>` component | Apple Pay, Google Pay, PayPal buttons | minor |
| C1.15 | Add SSR-safe provider detection | `useIsClient()` hook, avoid hydration mismatches | patch |

### C2. JS SDK (15 items)

| # | Item | Deliverable | Version Bump |
|---|------|-------------|-------------|
| C2.01 | ✅ Add PayPal provider bridge | `PayPalProviderBridge` — PayPal JS SDK integration | minor |
| C2.02 | Add headless mode to StripeProviderBridge | Allow programmatic payment without mounted elements | patch |
| C2.03 | Add `tokenize()` to RazorpayProviderBridge | Save card for future use | patch |
| C2.04 | Add `destroy()` cleanup method | Properly unmount and clean up provider SDKs | patch |
| C2.05 | Add `isReady()` method | Check if provider SDK is fully loaded | patch |
| C2.06 | Add custom styling API | `bridge.setStyle({ ... })` for consistent theming | patch |
| C2.07 | Add error event emitter | `bridge.on('error', handler)` for async errors | patch |
| C2.08 | Add `bridge.getPaymentMethod()` | Return current payment method type selected by user | patch |
| C2.09 | Add Apple Pay support to StripeProviderBridge | `bridge.canMakePayment('apple_pay')` check + flow | minor |
| C2.10 | Add Google Pay support to StripeProviderBridge | Same pattern for Google Pay | minor |
| C2.11 | Add UPI intent support in RazorpayProviderBridge | VPA-based UPI payment flow | patch |
| C2.12 | Add vanilla JS checkout widget | `PayKit.createCheckout(container, options)` — no React needed | minor |
| C2.13 | Add CDN bundle build | UMD build for `<script>` tag usage | minor |
| C2.14 | Add event-based payment flow | `bridge.on('success')`, `bridge.on('error')`, `bridge.on('cancel')` | patch |
| C2.15 | Add iframe security headers config | CSP, frame-ancestors for embedded checkout | patch |

---

## Category D: Testing & Quality (25 items)

| # | Item | Deliverable | Version Bump |
|---|------|-------------|-------------|
| D.01 | Add integration tests for Stripe charges | Real Stripe test mode API calls in CI | patch |
| D.02 | Add integration tests for Stripe refunds | Same | patch |
| D.03 | Add integration tests for Stripe subscriptions | Same | patch |
| D.04 | Add integration tests for Stripe webhooks | Construct + verify test webhooks | patch |
| D.05 | Add integration tests for Razorpay charges | Real Razorpay test mode API calls | patch |
| D.06 | Add integration tests for Razorpay refunds | Same | patch |
| D.07 | Add integration tests for Razorpay webhooks | Same | patch |
| D.08 | Add PaymentRouter integration tests | Multi-adapter routing with mock adapters | patch |
| D.09 | Add currency utility tests | Edge cases: zero-decimal, three-decimal | patch |
| D.10 | Add error mapping tests for Stripe | Verify all Stripe error codes map correctly | patch |
| D.11 | Add error mapping tests for Razorpay | Same | patch |
| D.12 | Add E2E test for React CheckoutForm | Playwright/Cypress test with Stripe test card | patch |
| D.13 | Add E2E test for Razorpay modal flow | Same | patch |
| D.14 | Add bundle size tracking | `size-limit` config, fail CI if bundle exceeds threshold | patch |
| D.15 | Add TypeScript strict mode compliance | Enable `strict: true`, fix all errors | patch |
| D.16 | Add ESLint rule for no-any | Ban `any` types in public API surface | patch |
| D.17 | Add test coverage reporting | Istanbul/c8 coverage with threshold (>90%) | patch |
| D.18 | Add mutation testing | Stryker or similar — ensure tests actually catch bugs | patch |
| D.19 | Add snapshot tests for all mapper outputs | Ensure mapper output shape doesn't change unexpectedly | patch |
| D.20 | Add compatibility tests for Node 18/20/22 | CI matrix testing across Node versions | patch |
| D.21 | Add browser compatibility tests for sdk-js | Test in Chrome, Firefox, Safari | patch |
| D.22 | Add React 18 + React 19 compatibility tests | CI matrix for both React versions | patch |
| D.23 | Add package.json exports validation | Ensure all subpath exports resolve correctly | patch |
| D.24 | Add CJS/ESM dual-format validation | Test both `import` and `require` paths | patch |
| D.25 | Add benchmarks for adapter operations | Track charge creation time per adapter | patch |

---

## Category E: Documentation & Website

### E1. Docs Pages (20 items)

| # | Item | Deliverable |
|---|------|-------------|
| E1.01 | PayPal adapter guide | `/docs/guides/paypal` |
| E1.02 | PhonePe adapter guide | `/docs/guides/phonepe` |
| E1.03 | Cashfree adapter guide | `/docs/guides/cashfree` |
| E1.04 | Paytm adapter guide | `/docs/guides/paytm` |
| E1.05 | CCAvenue adapter guide | `/docs/guides/ccavenue` |
| E1.06 | Square adapter guide | `/docs/guides/square` |
| E1.07 | Adyen adapter guide | `/docs/guides/adyen` |
| E1.08 | Error handling guide | `/docs/guides/error-handling` |
| E1.09 | PaymentRouter guide | `/docs/guides/payment-router` |
| E1.10 | Currency handling guide | `/docs/guides/currencies` |
| E1.11 | Subscription management guide | `/docs/guides/subscriptions` |
| E1.12 | Saved payment methods guide | `/docs/guides/saved-cards` |
| E1.13 | React components API reference | `/docs/reference/react` |
| E1.14 | JS SDK API reference | `/docs/reference/js-sdk` |
| E1.15 | TypeScript types reference | `/docs/reference/types` |
| E1.16 | Environment variables reference | `/docs/reference/env-vars` |
| E1.17 | Security best practices guide | `/docs/guides/security` |
| E1.18 | Deployment guide (Vercel/Railway/Docker) | `/docs/guides/deployment` |
| E1.19 | Upgrade / changelog page | `/docs/changelog` |
| E1.20 | Provider comparison matrix page | `/docs/providers` |

### E2. Blog Posts (biweekly cadence)

| # | Item | Title |
|---|------|-------|
| E2.01 | Cross-post "Introducing PayKit" | Dev.to, Reddit |
| E2.02 | "PayKit vs Stripe SDK: When You Need Both" | squaredr.tech/blog |
| E2.03 | "Building a Multi-Provider Checkout with PayKit" | squaredr.tech/blog |
| E2.04 | "Deep India Coverage: PhonePe, Cashfree + UPI" | squaredr.tech/blog |
| E2.05 | "The Complete India Payments Stack" | squaredr.tech/blog |
| E2.06 | "How PayKit's PaymentRouter Works" | squaredr.tech/blog |
| E2.07 | "Webhook Normalization: One Handler for Every Provider" | squaredr.tech/blog |
| E2.08 | "PayKit Beta: 8 Providers, Production-Ready" | squaredr.tech/blog |
| E2.09 | "PayKit Goes Global: Europe, LatAm, Africa" | squaredr.tech/blog |
| E2.10 | "PayKit 1.0: One API for Every Payment Provider" | squaredr.tech/blog |
| E2.11 | "Building a SaaS Billing System with PayKit" | squaredr.tech/blog |
| E2.12 | "React Checkout Components That Actually Work" | squaredr.tech/blog |
| E2.13 | "Currency-Based Payment Routing in Node.js" | squaredr.tech/blog |
| E2.14 | "Testing Payment Integrations Without Real Money" | squaredr.tech/blog |
| E2.15 | "The China Payments Stack: Alipay, WeChat, UnionPay" | squaredr.tech/blog |
| E2.16 | "TypeScript-First Payment SDK Design" | squaredr.tech/blog |
| E2.17 | "25 Providers, One API: The Complete PayKit" | squaredr.tech/blog |
| E2.18 | "Open Source Payments: Why We Built PayKit" | squaredr.tech/blog |
| E2.19 | "Direct Debit with GoCardless + PayKit" | squaredr.tech/blog |
| E2.20 | "Error Handling Patterns for Payment SDKs" | squaredr.tech/blog |

### E3. README Updates (monthly)

| # | Item | Deliverable |
|---|------|-------------|
| E3.01 | Update core README with PayPal examples | Add PayPal quick start to README |
| E3.02 | Update core README with error handling section | Add error codes, suggestions |
| E3.03 | Update core README with PaymentRouter examples | Add currency-based routing snippet |
| E3.04 | Update core README with new adapter count | "X providers, one API" header |
| E3.05 | Update react README with new components | Add PaymentStatus, SavedCards docs |
| E3.06 | Update react README with theming guide | CSS variables, presets |
| E3.07 | Update sdk-js README with PayPal bridge | Add PayPal provider bridge usage |
| E3.08 | Update sdk-js README with Apple Pay/Google Pay | Add wallet payment docs |
| E3.09 | Update root README with download badges | Dynamic npm download count badges |
| E3.10 | Update root README with provider matrix | Visual table of all adapters |
| E3.11 | Add CONTRIBUTING.md | How to add a new adapter, coding standards |
| E3.12 | Add SECURITY.md | Vulnerability reporting process |

---

## Category F: Infrastructure & DevOps (10 items)

| # | Item | Deliverable |
|---|------|-------------|
| F.01 | Set up GitHub Actions CI | Build + test on push/PR for all packages |
| F.02 | Set up automated npm publish on tag | `v*` tags trigger publish workflow |
| F.03 | Set up Changesets for version management | Automate version bumps and changelogs |
| F.04 | Add Vercel Analytics to squaredr.tech | Track page views, referrals |
| F.05 | Set up npm download tracking dashboard | Weekly download stats |
| F.06 | Set up automated README badge updates | Dynamic download count, test status, coverage |
| F.07 | Add `FUNDING.yml` to GitHub repo | GitHub Sponsors links |
| F.08 | Set up GitHub Sponsors | Monthly sponsorship tiers |
| F.09 | Set up Discord server for PayKit | Community channel |
| F.10 | Set up pnpm workspace migration | Better monorepo management, faster installs |

---

## Category G: Adapter Bug Fixes & Security (Cross-Adapter Review)

> Findings from the comprehensive cross-adapter security and correctness review (August 2026).
> Items marked ✅ were already fixed during the PayPal adapter sprint.

### G1. Stripe Adapter Fixes (15 items)

| # | Item | Severity | File(s) | Version Bump |
|---|------|----------|---------|-------------|
| G1.01 | **Remove hardcoded fake billing details in minimal mode** — "John Doe", "john@example.com", "123 Main St" submitted to Stripe API | CRITICAL | `adapters/stripe/client/stripe-hosted.ts:184-199` | patch |
| G1.02 | Charge mapper: extract payment method details (last4, brand, type) from PaymentIntent | HIGH | `adapters/stripe/mappers/charge.ts:31-37` | patch |
| G1.03 | Webhook mapper: replace `type: event.type as never` with proper type narrowing | HIGH | `adapters/stripe/mappers/webhook.ts` | patch |
| G1.04 | SDK-JS bridge: migrate from deprecated `createToken()` + `confirmCardPayment()` to Payment Element API | HIGH | `sdk-js/src/providers/stripe.ts` | minor |
| G1.05 | Refund mapper: handle missing `payment_intent` — don't fallback to empty string chargeId | HIGH | `adapters/stripe/mappers/refund.ts` | patch |
| G1.06 | Webhook mapper: add missing event type mappings (dispute, payout, subscription lifecycle) | HIGH | `adapters/stripe/mappers/webhook.ts` | patch |
| G1.07 | Payment method mapper: add mappings for `sepa_debit`, `ideal`, `bancontact`, `us_bank_account` | MEDIUM | `adapters/stripe/mappers/payment-method.ts` | patch |
| G1.08 | Subscription mapper: handle empty `items.data` array without crashing | MEDIUM | `adapters/stripe/mappers/subscription.ts` | patch |
| G1.09 | Error mapper: add `amount_too_large`, `balance_insufficient`, `email_invalid` codes | MEDIUM | `adapters/stripe/mappers/error.ts` | patch |
| G1.10 | Add idempotency key to `subscriptions.create` | MEDIUM | `adapters/stripe/adapter.ts` | patch |
| G1.11 | Add idempotency key to `charges.cancel` | MEDIUM | `adapters/stripe/adapter.ts` | patch |
| G1.12 | Add input validation for amount/currency before Stripe API calls | MEDIUM | `adapters/stripe/adapter.ts` | patch |
| G1.13 | Subscription create: use existing product/price if metadata matches instead of always creating new ones | MEDIUM | `adapters/stripe/adapter.ts:309-318` | patch |
| G1.14 | Customer retrieve: improve deleted customer error message | LOW | `adapters/stripe/adapter.ts:197` | patch |
| G1.15 | Webhook verify: return false consistently instead of throwing on malformed signatures | LOW | `adapters/stripe/adapter.ts:270-280` | patch |

### G2. Razorpay Adapter Fixes (14 items)

| # | Item | Severity | File(s) | Version Bump |
|---|------|----------|---------|-------------|
| G2.01 | **Webhook parse: check validateWebhookSignature return value before parsing** | CRITICAL | `adapters/razorpay/adapter.ts:257-276` | patch |
| G2.02 | **Subscription mapper: fetch plan amount instead of hardcoding `amount: 0`** | CRITICAL | `adapters/razorpay/mappers/subscription.ts:25` | patch |
| G2.03 | **Subscription create: make `total_count` configurable instead of hardcoded 12** | CRITICAL | `adapters/razorpay/adapter.ts:304` | patch |
| G2.04 | Charge mapper: fix `refunded` status mapping to `'refunded'` instead of `'succeeded'` | HIGH | `adapters/razorpay/mappers/charge.ts:13` | patch |
| G2.05 | Refund mapper: throw error when `payment_id` is missing instead of empty string fallback | HIGH | `adapters/razorpay/mappers/refund.ts:18` | patch |
| G2.06 | Subscription mapper: throw error when `customer_id` is missing instead of empty string | HIGH | `adapters/razorpay/mappers/subscription.ts:23` | patch |
| G2.07 | Fix pagination: use `skip` parameter properly instead of hardcoded 0 in all list operations | HIGH | `adapters/razorpay/adapter.ts:141-148,169-177,213-223,334-343` | patch |
| G2.08 | Subscription create: cleanup orphaned plan if subscription creation fails | HIGH | `adapters/razorpay/adapter.ts:293-301` | patch |
| G2.09 | Client adapter: fix loadScript() race condition — use promise singleton pattern | MEDIUM | `adapters/razorpay/client/razorpay-hosted.ts:33-64` | patch |
| G2.10 | Error mapper: add defensive null checks on `errBody.reason` | MEDIUM | `adapters/razorpay/mappers/error.ts:44-74` | patch |
| G2.11 | Capabilities: set `payouts: false` or implement payout operations (currently declared true but unimplemented) | MEDIUM | `adapters/razorpay/adapter.ts:34-48` | patch |
| G2.12 | `charges.cancel` and `customers.delete`: return rejected promise instead of synchronous throw | LOW | `adapters/razorpay/adapter.ts:135-137,209-211` | patch |
| G2.13 | Webhook mapper: use Razorpay event ID field instead of generated `${event}_${created_at}` | LOW | `adapters/razorpay/adapter.ts:266` | patch |
| G2.14 | Client adapter: make placeholder text configurable for i18n | LOW | `adapters/razorpay/client/razorpay-hosted.ts:81-82` | patch |

### G3. PayPal Adapter Fixes (12 items)

> Items marked ✅ were already fixed in the PayPal adapter sprint.

| # | Item | Severity | File(s) | Version Bump |
|---|------|----------|---------|-------------|
| G3.01 | ✅ Webhook verification — postback API integration | CRITICAL | `adapters/paypal/adapter.ts` | — |
| G3.02 | ✅ Refund currency extraction | HIGH | `adapters/paypal/mappers/refund.ts` | — |
| G3.03 | ✅ Partial capture support | HIGH | `adapters/paypal/adapter.ts` | — |
| G3.04 | ✅ Subscription status mapping | HIGH | `adapters/paypal/mappers/subscription.ts` | — |
| G3.05 | ✅ Subscription productId auto-creation | HIGH | `adapters/paypal/adapter.ts` | — |
| G3.06 | ✅ cancelAtPeriodEnd → suspend | HIGH | `adapters/paypal/adapter.ts` | — |
| G3.07 | ✅ paymentSource vault wiring | HIGH | `adapters/paypal/adapter.ts` | — |
| G3.08 | ✅ embeddableUI capability flag | LOW | `adapters/paypal/adapter.ts` | — |
| G3.09 | Extract zero-decimal currencies to shared constant (duplicated 4 times) | HIGH | `adapter.ts`, `mappers/charge.ts`, `mappers/refund.ts`, `mappers/subscription.ts` | patch |
| G3.10 | Fix metadata round-tripping — parse JSON back from `customId` in charge mapper | HIGH | `adapters/paypal/adapter.ts:177`, `mappers/charge.ts:70` | patch |
| G3.11 | Replace hardcoded `example.com` return/cancel URLs with required params or sensible error | MEDIUM | `adapters/paypal/adapter.ts:584-585` | patch |
| G3.12 | `ensureProduct()` errors: map through `mapPayPalError()` instead of leaking raw fetch errors | MEDIUM | `adapters/paypal/adapter.ts:515-530` | patch |

### G4. SDK-JS Fixes (12 items)

| # | Item | Severity | File(s) | Version Bump |
|---|------|----------|---------|-------------|
| G4.01 | **Replace innerHTML with DOM creation (XSS prevention)** — Razorpay + PayPal bridges | CRITICAL | `sdk-js/src/providers/razorpay.ts:47`, `sdk-js/src/providers/paypal.ts:141` | patch |
| G4.02 | **PayPal bridge: add mount validation to confirmPayment() — prevent infinite hang** | CRITICAL | `sdk-js/src/providers/paypal.ts:192-224` | patch |
| G4.03 | **PayPal bridge: fix approvePromise race condition between button click and confirmPayment()** | CRITICAL | `sdk-js/src/providers/paypal.ts:81-84,88-91,103-106` | patch |
| G4.04 | **Add SRI hashes to all provider script loads** (Stripe, Razorpay, PayPal) | HIGH | `sdk-js/src/providers/stripe.ts:31`, `razorpay.ts:30`, `paypal.ts:46` | patch |
| G4.05 | Stripe bridge: remove event listeners on unmount (memory leak) | HIGH | `sdk-js/src/providers/stripe.ts:56-60` | patch |
| G4.06 | Script loader: verify global variable exists after onload | HIGH | `sdk-js/src/script-loader.ts:35-44` | patch |
| G4.07 | Razorpay bridge: check `window.Razorpay` exists before instantiation | HIGH | `sdk-js/src/providers/razorpay.ts:82,115` | patch |
| G4.08 | All bridges: prevent double-mount (add mounting lock / unmount before re-mount) | HIGH | `sdk-js/src/providers/stripe.ts:39-61`, `razorpay.ts:38-50` | patch |
| G4.09 | Razorpay bridge: clear `rzpInstance` on modal dismiss | MEDIUM | `sdk-js/src/providers/razorpay.ts:106-110` | patch |
| G4.10 | PayPal bridge: reject pending approvePromise on destroy() | MEDIUM | `sdk-js/src/providers/paypal.ts:242-246` | patch |
| G4.11 | All bridges: enforce lifecycle (throw if calling methods before mount) | MEDIUM | all bridge files | patch |
| G4.12 | PayPal card fields: add ARIA attributes and labels for accessibility | LOW | `sdk-js/src/providers/paypal.ts:139-163` | patch |

### G5. Shared Types & Infrastructure Fixes (8 items)

| # | Item | Severity | File(s) | Version Bump |
|---|------|----------|---------|-------------|
| G5.01 | **Create typed ProviderCredentials per provider** instead of `Record<string, string>` | CRITICAL | `types/config.ts` | minor |
| G5.02 | Add `refundedAmount` field to `UnifiedCharge` | HIGH | `types/charge.ts` | patch |
| G5.03 | Add missing webhook event types: `charge.chargeback_created`, `charge.dispute_resolved`, `charge.captured` | HIGH | `types/webhook.ts` | patch |
| G5.04 | Add `failureReason` to `UnifiedPayout` | HIGH | `types/payout.ts` | patch |
| G5.05 | Add `'paypal'` to `ProviderName` union type | HIGH | `types/provider.ts` | patch |
| G5.06 | Add `trialDays` to `CreateSubscriptionParams` | MEDIUM | `types/subscription.ts` | patch |
| G5.07 | Add `'expired'` to `SubscriptionStatus` union | MEDIUM | `types/subscription.ts` | patch |
| G5.08 | Add `requestId` to `UnifiedPaymentMethod` and `UnifiedPayout` (consistency) | MEDIUM | `types/payment-method.ts`, `types/payout.ts` | patch |

---

## Item Count Summary

| Category | Count |
|----------|-------|
| A. Core SDK improvements | 91 |
| B. New adapters | 24 |
| C. Frontend SDK (react + js) | 30 |
| D. Testing & quality | 25 |
| E. Docs, blog, README | 52 |
| F. Infrastructure & DevOps | 10 |
| G. Adapter bug fixes & security | 61 (8 already fixed ✅, 53 remaining) |
| **Total** | **285** |

---

## Version Progression

| Phase | Version Range | Focus |
|-------|--------------|-------|
| Month 1-2 | 0.6.x → 0.9.x | Core improvements, PayPal, error handling, types |
| Month 3-4 | 0.10.x → 0.15.x | India adapters, subscription lifecycle |
| Month 5-6 | 0.16.x → 1.0.0-beta | Global adapters, PaymentRouter v2 |
| Month 7 | **1.0.0** | Stable release, Product Hunt |
| Month 8-9 | 1.1.x → 1.5.x | Enterprise adapters, frontend v2 |
| Month 10-11 | 1.6.x → 1.10.x | China/LatAm adapters, advanced routing |
| Month 12 | 2.0.0-preview | Breaking improvements, 2.0 roadmap |
