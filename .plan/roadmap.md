# PayKit Roadmap

> **Last updated**: August 25, 2026
> **Scope**: Aug 25, 2026 through May 2027 (~45 weeks)
> **Source of truth**: This file + `active-sprint.md` + `backlog.md`

---

## How to Use This Directory

```
.plan/
  active-sprint.md   <-- READ THIS FIRST. Current week's daily tasks.
  roadmap.md          <-- THIS FILE. Strategic overview, all weeks, blog schedule.
  backlog.md          <-- Item catalog. 300+ items with IDs (A1.01, B2.01, G4.03, etc.)
  archive/            <-- Completed weeks and old plan files. Reference only.
```

**At session start**: Read `active-sprint.md`. That's it. If you need the big picture, read this file. If you need item details, read `backlog.md`.

---

## Cadence Rules

1. **Ship daily** — every working day produces a commit + npm publish
2. **Adapters biweekly** — 1 new adapter every 1-2 weeks alongside daily bug/feature work
3. **Blog weekly** — 1 blog post per week (see schedule below)
4. **Version bumps**: `patch` for fixes/types/DX, `minor` for new adapters/features, `major` for breaking changes
5. **Publish command**: `pnpm --filter @squaredr/paykit publish --access public --no-git-checks` (only packages that changed)
6. **Commit format**: `type: description` — `fix:`, `feat:`, `chore:`, `refactor:`
7. **Never include Co-Authored-By in commits**
8. **No parallel agents** — sequential execution only

---

## Completed Work (reference only)

### Shipped Product
- **3 adapters**: Stripe, Razorpay, PayPal (all MIT, all free)
- **Core version**: 0.15.0 (includes retry, logging, hooks, 53 G-category fixes)
- **React**: 1.0.1 | **SDK-JS**: 1.0.1
- **516+ tests** passing (vitest)

### Completed Phases
- **Website**: All 11 phases complete (landing page, docs, blog, demos, API explorer, capabilities matrix, responsive polish, Shiki diff rewrite)
- **Dev Workbench**: Complete (dev-only page at `/dev/workbench`)
- **Deep Audit**: 53 issues found across core/sdk-js/react (14 critical/high, 22 medium, 17 low)
- **Month 1 sprint** (June 2026): Error handling (A1.01-A1.18), type exports (A2.04-A2.07), currency utils (A3.01-A3.10), testing utils (A6.01-A6.05), router (A4.01), webhooks (A5.01-A5.02)
- **Month 2 sprint** (July 2026): PayPal adapter (B1.01), PayPal bug fixes (G3.01-G3.08), subscription validation (A1.17), PaymentRouter generics (A2.08-A2.09), JSDoc (A2.14), webhook enhancements (A5.03-A5.07), testing (A6.06, A6.09), CI/CD (F.01-F.02, F.05-F.06), blog post (E2.03)
- **Month 3 Weeks 1-3** (Aug 2-23): Retry logic (A1.20), structured logging (A7.01-A7.05), lifecycle hooks (A7.02-A7.04), all 53 G-category fixes (G1.01-G1.15, G2.01-G2.14, G3.09-G3.12, G4.01-G4.12, G5.01-G5.08)
- **Adapter Research**: Track B complete — 8 new providers qualified (Braintree, Amazon Pay, Instamojo, Xendit, Midtrans, PayTabs, eWay, Paystack)

### Backlog Items Completed (by ID)
**A1**: .01-.18, .20 (19/20) | **A2**: .04-.09, .14 (7/15) | **A3**: .01, .03-.06, .09-.10 (7/10)
**A4**: .01 (1/10) | **A5**: .01-.07 (7/10) | **A6**: .01-.06, .09 (7/10) | **A7**: .01-.05 (5/8)
**B1**: .01 (1/1) | **G**: ALL (G1-G5 complete, 53 items)
**C2**: .01 (1/15) | **E1**: .01, .08 (2/20) | **E2**: .03 (1/20) | **E3**: .01 (1/12)
**F**: .01, .02, .05, .06 (4/10)

---

## 2026 Schedule: Aug 25 – Dec 31 (Weeks 1-19)

### Phase 3A — Critical Audit Fixes (Weeks 1-3)

| Week | Dates | Theme | Key Deliverables |
|------|-------|-------|-----------------|
| **1** | Aug 25-29 | Critical audit (core) | C1: PayPal webhook crypto, C2: Stripe unsafe casts, C3: Razorpay `any` types, C4: pagination cursors, C5: unmapped webhook events, C6: 3-decimal currencies, C7: error type guard |
| **2** | Sep 1-5 | Critical audit (frontend) | R1-R3: CardInput leaks + timeout race, J1: deprecated confirmCardPayment, J2-J4: PayPal/Stripe fixes, G1.01: fake billing, G2.01: webhook sig |
| **3** | Sep 8-12 | G-category high + medium | G2.02-G2.07: Razorpay fixes, G1.02/G1.05/G1.06: Stripe mappers, G4.01-G4.03: SDK-JS, C8-C11: medium audit |

### Phase 3B — Medium Fixes + Core Features (Weeks 4-6)

> **Note**: Many A-category items were completed in Months 1-2 (June-July 2026).
> Items marked ✅ below are already done — the schedule fills those slots with remaining backlog work.

| Week | Dates | Theme | Key Deliverables |
|------|-------|-------|-----------------|
| **4** | Sep 15-19 | Medium audit + exports | C12-C16, J5-J10, R4-R10: medium audit batch, A2.01: export mapper types, A2.10-A2.11: export CreateChargeParams/RefundParams from root |
| **5** | Sep 22-26 | Remaining exports + **PhonePe start** | A2.12-A2.13: export CreateCustomerParams/SubscriptionParams, A2.15: @since tags, B2.01 days 1-4: PhonePe scaffold through webhooks |
| **6** | Sep 29-Oct 3 | **PhonePe finish** + currency | B2.01 days 5-6: PhonePe publish, A3.02: getCurrencyInfo metadata, A3.07: convertAmount utility, A1.19: idempotency for refunds |

### Phase 3C — Types + Adapters (Weeks 7-10)

| Week | Dates | Theme | Key Deliverables |
|------|-------|-------|-----------------|
| **7** | Oct 6-10 | Currency export + **Cashfree start** | A3.08: currency data subpath export, B2.02 days 1-4: Cashfree scaffold through tests |
| **8** | Oct 13-17 | **Cashfree finish** + router | B2.02 day 5: Cashfree publish, A4.02-A4.03: region + paymentMethod routing, A4.04-A4.05: listAdapters + onRoute callback |
| **9** | Oct 20-24 | Webhooks + **Square start** | A5.08-A5.09: Next.js + Express webhook helpers, B3.01 days 1-4: Square scaffold through tests |
| **10** | Oct 27-31 | **Square finish** + advanced features | B3.01 day 5: Square publish, A4.06: fallback adapter support, A5.10: webhook event logging, A5.04-A5.05: timestamp validation + replay protection |

### Phase 3D — Enterprise Adapters + Testing (Weeks 11-14)

| Week | Dates | Theme | Key Deliverables |
|------|-------|-------|-----------------|
| **11** | Nov 3-7 | **Adyen adapter** | B3.02 days 1-5: Adyen full build + publish |
| **12** | Nov 10-14 | Low audit + testing utils | C17-C24, J11-J16, R11-R13: low audit batch, A6.07-A6.08: assertCharge/assertRefund helpers, A6.10: conformance test suite |
| **13** | Nov 17-21 | **Mollie adapter** | B3.03 days 1-5: Mollie full build + publish |
| **14** | Nov 24-28 | Subscriptions + observability | A8.01-A8.07: subscription lifecycle (update, cancel, pause, resume, list), A7.06: provider API version tracking |

### Phase 3E — Regional Adapters + React (Weeks 15-19)

| Week | Dates | Theme | Key Deliverables |
|------|-------|-------|-----------------|
| **15** | Dec 1-5 | **MercadoPago adapter** | B3.04 days 1-5: MercadoPago full build + publish |
| **16** | Dec 8-12 | **Flutterwave adapter** | B3.05 days 1-5: Flutterwave full build + publish |
| **17** | Dec 15-19 | Logger adapters + **PayU start** | A7.07-A7.08: pino + winston logger adapters, B4.01 days 1-3: PayU scaffold |
| **18** | Dec 22-26 | **PayU finish** + React | B4.01 days 4-5: PayU publish, C1.01-C1.02: PaymentStatus + useHeadlessCheckout, C1.07/C1.09: theme presets + onReady |
| **19** | Dec 29-31 | Year-end: subscriptions + advanced routing | A8.08: trial period support, A4.07: weighted routing, A4.08-A4.09: router refunds/customers routing |

### 2026 Totals

| Metric | Target |
|--------|--------|
| New adapters | 8 (PhonePe, Cashfree, Square, Adyen, Mollie, MercadoPago, Flutterwave, PayU) |
| Total adapters | 11 (3 existing + 8 new) |
| Audit fixes | 53 (14 critical + 22 medium + 17 low — G-category already done) |
| Features | ~45 (exports, currency, router, webhooks, testing, observability, subscriptions, React) |
| npm publishes | ~60 (patches + 8 minors) |

---

## 2027 Q1 Schedule: Jan – Mar (Weeks 20-31)

India completion + Track B starts + enterprise adapters.

| Week | Dates | Adapter | Track | Difficulty | Alongside |
|------|-------|---------|-------|-----------|-----------|
| **20** | Jan 5-9 | **Paytm** | A | 3/5 | txnToken flow, wallet |
| **21** | Jan 12-16 | **CCAvenue** | A | 5/5 | AES encryption, redirect, no SDK |
| **22** | Jan 19-23 | **Braintree** | B | 4/5 | Client/server split, Drop-In UI |
| **23** | Jan 26-30 | **Authorize.net** | A | 3/5 | Legacy US merchants |
| **24** | Feb 2-6 | **Amazon Pay** | B | 5/5 | RSA key auth, checkout sessions |
| **25** | Feb 9-13 | **Airwallex** | A | 3/5 | Cross-border FX, multi-currency |
| **26** | Feb 16-20 | **Xendit** | B | 3/5 | SEA e-wallets, per-country methods |
| **27** | Feb 23-27 | **Midtrans** | B | 3/5 | Indonesia, 3 product lines |
| **28** | Mar 2-6 | **GoCardless** | A | 3/5 | SEPA, ACH, Bacs direct debit |
| **29** | Mar 9-13 | **Paystack** | B | 2/5 | Africa, unifies with Stripe |
| **30** | Mar 16-20 | **Nuvei** | A | 3/5 | Gaming, crypto, high-risk |
| **31** | Mar 23-27 | **Instamojo** | B | 3/5 | India SMB, payment links |

**Q1 features to interleave** (from backlog + monthly plans):
- A5.08-A5.09: Next.js + Express webhook handlers
- A5.04-A5.05: Webhook timestamp validation + replay protection
- C1.02-C1.05: React hooks (useHeadlessCheckout, usePaymentMethods, SavedCards)
- C2.12-C2.13: Vanilla JS checkout widget + CDN bundle
- D.12, D.21-D.22: E2E tests, browser compat, React 18/19 matrix
- A5.10, A5.06: Webhook logging + provider auto-detection

**Q1 totals**: 12 adapters (6 Track A + 6 Track B) = 23 total

---

## 2027 Q2 Schedule: Apr – Jun (Weeks 32-45)

Remaining adapters + 1.0 + 2.0 preview.

| Week | Dates | Adapter | Track | Notes |
|------|-------|---------|-------|-------|
| **32-33** | Mar 31-Apr 11 | **Worldpay** | A | 5/5, abandoned Node SDK |
| **34-35** | Apr 14-25 | **Alipay + WeChat Pay** | A | China domestic, RSA signing |
| **36-37** | Apr 28-May 9 | **UnionPay** | A | China card network |
| **38-39** | May 12-23 | **PayTabs** | B | MENA region |
| **40-41** | May 26-Jun 6 | **eWay** | B | AU/NZ |
| **42-43** | Jun 9-20 | **2Checkout + Payoneer** | A | Digital goods, marketplace |
| **44-45** | Jun 23-Jul 4 | **Worldline + Checkout.com + Klarna** | A | EU enterprise, BNPL |

**Q2 features to interleave** (from backlog + monthly plans):
- A4.06-A4.10: Advanced router (fallback, weighted, cost-based routing)
- A7.07-A7.08: pino + winston logger adapters
- A8.08: Trial period support
- C1.08, C1.04, C1.12-C1.14: React components (PayKitElements, AddressForm, UPIInput, NetBankingSelect, WalletButtons)
- C2.02-C2.03, C2.08-C2.11, C2.14-C2.15: JS SDK features (headless, tokenization, UPI, events, security)
- A6.10: Conformance test suite
- A3.08: Currency data subpath export
- F.03-F.04: Changesets, Vercel Analytics
- D.14-D.25: Testing infrastructure (bundle size, strict mode, coverage, mutation, snapshots, benchmarks)
- Plugin system (2.0 preview): logging, rate limit, cache, metrics plugins
- Provider extensions: Stripe Connect, Razorpay Route
- Multi-tenant support

**Q2 totals**: 11 adapters (9 Track A + 2 Track B) = 34 total

---

## Full Adapter Roadmap

| # | Adapter | Region | Track | Target | Difficulty |
|---|---------|--------|-------|--------|-----------|
| 1 | Stripe | Global | -- | **SHIPPED** | -- |
| 2 | Razorpay | India | -- | **SHIPPED** | -- |
| 3 | PayPal | Global | -- | **SHIPPED** | -- |
| 4 | PhonePe | India | A | Week 5-6 (Sep 22-30) | 3/5 |
| 5 | Cashfree | India | A | Week 7-8 (Oct 7-13) | 3/5 |
| 6 | Square | Global | A | Week 9-10 (Oct 21-27) | 3/5 |
| 7 | Adyen | Global | A | Week 11 (Nov 3-7) | 4/5 |
| 8 | Mollie | EU | A | Week 13 (Nov 17-21) | 3/5 |
| 9 | MercadoPago | LatAm | A | Week 15 (Dec 1-5) | 3/5 |
| 10 | Flutterwave | Africa | A | Week 16 (Dec 8-12) | 3/5 |
| 11 | PayU | Global | A | Week 17-18 (Dec 17-22) | 3/5 |
| 12 | Paytm | India | A | Week 20 (Jan 5-9) | 3/5 |
| 13 | CCAvenue | India | A | Week 21 (Jan 12-16) | 5/5 |
| 14 | Braintree | Global | B | Week 22 (Jan 19-23) | 4/5 |
| 15 | Authorize.net | US | A | Week 23 (Jan 26-30) | 3/5 |
| 16 | Amazon Pay | Global | B | Week 24 (Feb 2-6) | 5/5 |
| 17 | Airwallex | Global | A | Week 25 (Feb 9-13) | 3/5 |
| 18 | Xendit | SEA | B | Week 26 (Feb 16-20) | 3/5 |
| 19 | Midtrans | Indonesia | B | Week 27 (Feb 23-27) | 3/5 |
| 20 | GoCardless | EU | A | Week 28 (Mar 2-6) | 3/5 |
| 21 | Paystack | Africa | B | Week 29 (Mar 9-13) | 2/5 |
| 22 | Nuvei | Global | A | Week 30 (Mar 16-20) | 3/5 |
| 23 | Instamojo | India | B | Week 31 (Mar 23-27) | 3/5 |
| 24 | Worldpay | Global | A | Week 32-33 (Mar 31-Apr 11) | 5/5 |
| 25 | Alipay | China | A | Week 34-35 (Apr 14-25) | 4/5 |
| 26 | WeChat Pay | China | A | Week 34-35 (Apr 14-25) | 4/5 |
| 27 | UnionPay | China | A | Week 36-37 (Apr 28-May 9) | 4/5 |
| 28 | PayTabs | MENA | B | Week 38-39 (May 12-23) | 3/5 |
| 29 | eWay | AU/NZ | B | Week 40-41 (May 26-Jun 6) | 3/5 |
| 30 | 2Checkout | Global | A | Week 42-43 (Jun 9-20) | 3/5 |
| 31 | Payoneer | Global | A | Week 42-43 (Jun 9-20) | 3/5 |
| 32 | Worldline | EU | A | Week 44-45 (Jun 23-Jul 4) | 3/5 |
| 33 | Checkout.com | Global | A | Week 44-45 (Jun 23-Jul 4) | 3/5 |
| 34 | Klarna | EU | A | Week 44-45 (Jun 23-Jul 4) | 3/5 |

---

## Remaining Backlog Items (not scheduled in Weeks 1-19)

Items from `backlog.md` that are NOT yet assigned to a specific week. These go into Q1/Q2 2027 feature days or get pulled forward if adapter weeks finish early.

### A — Core SDK (remaining after Weeks 1-19)
- A4.10: Cost-based routing (route to cheapest provider)

### C — Frontend SDK (remaining after Weeks 1-19)
- C1.03-C1.06: SavedCards, AddressForm, usePaymentMethods, CSS theming
- C1.08, C1.10-C1.15: PayKitElements, onValidationChange, loading skeleton, UPIInput, NetBankingSelect, WalletButtons, SSR-safe
- C2.02-C2.15: JS SDK features (headless Stripe, Razorpay tokenize, destroy, isReady, styling, error events, getPaymentMethod, Apple Pay, Google Pay, UPI intent, vanilla checkout, CDN bundle, event flow, security headers)

### D — Testing & Quality (remaining)
- D.01-D.25: All 25 items (integration tests, E2E, bundle size, strict mode, coverage, mutation, snapshots, Node matrix, browser tests, React 18/19 compat, exports validation, CJS/ESM, benchmarks)

### E — Docs & Content (remaining)
- E1.02-E1.07, E1.09-E1.20: Adapter guides, error handling, router, currency, subscriptions, saved cards, React ref, JS SDK ref, types ref, env vars, security, deployment, changelog, provider matrix
- E2.01-E2.02, E2.04-E2.20: Blog posts (see blog schedule below)
- E3.02-E3.12: README updates

### F — Infrastructure (remaining)
- F.03-F.04: Changesets, Vercel Analytics
- F.07-F.10: FUNDING.yml, GitHub Sponsors, Discord, pnpm workspace migration

---

## Weekly Blog Schedule (Aug 25, 2026 – Dec 31, 2026)

| Week | Publish Date | Title | SEO Keywords |
|------|-------------|-------|-------------|
| 1 | Aug 29 | How We Found 53 Bugs in Our Own Payment SDK | payment SDK bugs, code audit, PayKit |
| 2 | Sep 5 | XSS in Payment Forms: What We Fixed and What You Should Check | XSS payment forms, innerHTML security, SDK security |
| 3 | Sep 12 | Why Your Razorpay Webhook Might Be Silently Broken | Razorpay webhook, signature verification, Node.js |
| 4 | Sep 19 | Typed Error Codes: Making Payment Failures Actionable | payment error handling, TypeScript, error codes |
| 5 | Sep 26 | Integrating PhonePe UPI Payments in Node.js | PhonePe integration, UPI payments, Node.js |
| 6 | Oct 3 | One API for Five Indian Payment Providers | India payments, Razorpay PhonePe Cashfree, unified API |
| 7 | Oct 10 | Cashfree vs Razorpay: Integration Complexity Compared | Cashfree, Razorpay, payment gateway comparison |
| 8 | Oct 17 | Currency Handling in Payment Systems: Edge Cases That Break Things | currency conversion, zero-decimal, payment amounts |
| 9 | Oct 24 | Adding Square Payments to Your Node.js App in 10 Minutes | Square payments, Node.js, payment integration |
| 10 | Oct 31 | Smart Payment Routing: Send INR to Razorpay, USD to Stripe | payment routing, multi-provider, currency routing |
| 11 | Nov 7 | Adyen's 250 Payment Methods, One TypeScript Interface | Adyen integration, TypeScript, payment methods |
| 12 | Nov 14 | Testing Payment Integrations Without Spending Real Money | payment testing, mock adapter, test cards |
| 13 | Nov 21 | European Payments Made Simple: iDEAL, SOFORT, Bancontact | European payments, iDEAL, Mollie, SEPA |
| 14 | Nov 28 | Building SaaS Billing with Subscriptions Across 11 Providers | SaaS billing, subscriptions, payment providers |
| 15 | Dec 5 | PIX, Boleto, OXXO: Latin American Payments for Node.js | Latin America payments, PIX, MercadoPago |
| 16 | Dec 12 | M-Pesa and Mobile Money: African Payments in PayKit | M-Pesa, Flutterwave, African payments, mobile money |
| 17 | Dec 19 | PayKit at 14 Providers: The Multi-Region Payment Stack | multi-provider payments, global coverage |
| 18 | Dec 26 | Building Custom Checkout UIs with React Headless Hooks | React checkout, headless UI, payment components |
| 19 | Dec 31 | 2026 in Review: From 3 Adapters to 11 | year in review, PayKit, open source payments |

### 2027 Blog Schedule (Q1)

| Week | Publish Date | Title |
|------|-------------|-------|
| 20 | Jan 9 | Integrating Paytm in Node.js: The Complete Guide |
| 21 | Jan 16 | CCAvenue: The Hardest Indian Payment Integration (And How We Tamed It) |
| 22 | Jan 23 | Braintree vs Stripe: When PayPal's Gateway Makes Sense |
| 23 | Jan 30 | Authorize.net in 2027: Legacy Gateway, Modern SDK |
| 24 | Feb 6 | Amazon Pay's RSA Authentication: A Developer's Survival Guide |
| 25 | Feb 13 | Cross-Border Payments with Airwallex and PayKit |
| 26 | Feb 20 | Southeast Asian Payments: GoPay, OVO, Dana Under One API |
| 27 | Feb 27 | Midtrans: Unifying Indonesia's Three Payment Products |
| 28 | Mar 6 | Direct Debit with GoCardless: SEPA, ACH, and Bacs |
| 29 | Mar 13 | Paystack: Bringing African Payments Into the Unified API |
| 30 | Mar 20 | High-Risk Payments with Nuvei: Gaming, Crypto, and Beyond |
| 31 | Mar 27 | India SMB Payments: Instamojo Integration Guide |

---

## Version Milestones

| Version | Target | What |
|---------|--------|------|
| 0.16.0 | Week 6 (Oct 3) | PhonePe adapter |
| 0.17.0 | Week 8 (Oct 13) | Cashfree adapter |
| 0.18.0 | Week 10 (Oct 27) | Square adapter |
| 0.19.0 | Week 11 (Nov 7) | Adyen adapter |
| 0.20.0 | Week 13 (Nov 21) | Mollie adapter |
| 0.21.0 | Week 15 (Dec 5) | MercadoPago adapter |
| 0.22.0 | Week 16 (Dec 12) | Flutterwave adapter |
| 0.23.0 | Week 18 (Dec 22) | PayU adapter |
| 1.0.0-beta.1 | Q1 2027 | 20+ adapters, API freeze |
| 1.0.0 | Q2 2027 | Stable release, all 34 adapters |

---

## Audit Findings Reference

53 issues found during Phase 2 deep audit. All assigned to specific weeks in the schedule above.

### Critical/High (14 items) — Weeks 1-3
C1-C7 (core), J1-J4 (sdk-js), R1-R3 (react)

### Medium (22 items) — Weeks 3-5
C8-C16 (core), J5-J10 (sdk-js), R4-R10 (react)

### Low (17 items) — Week 12
C17-C24 (core), J11-J16 (sdk-js), R11-R13 (react)

Full details of each finding are in `backlog.md` under Category G and the audit section.

---

## Track B Adapter Research Summary

Providers with poor Node.js DX that benefit most from PayKit wrapping:

| Provider | Region | Difficulty | Why PayKit adds value |
|----------|--------|-----------|----------------------|
| Braintree | Global | 4/5 | Fragmented client/server SDK, multiple payment method configs |
| Amazon Pay | Global | 5/5 | RSA key auth, checkout sessions, completely different model |
| Instamojo | India SMB | 3/5 | No official SDK, payment links model, webhook delays |
| Xendit | Southeast Asia | 3/5 | Fragmented regional payment methods, per-country differences |
| Midtrans | Indonesia | 3/5 | Three separate products with different integration approaches |
| PayTabs | MENA | 3/5 | Lightly maintained SDK, underserved region |
| eWay | AU/NZ | 3/5 | Small community, lightly maintained SDK |
| Paystack | Africa | 2/5 | Separate from Stripe despite acquisition, unifies African payments |

**Skipped**: Paddle (good SDK, MoR model), SumUp (POS focus), Iyzico (decent SDK)
**Deferred**: Billdesk (no test account without business verification)
