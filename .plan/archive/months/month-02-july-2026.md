# Month 2 — July 2026

> **Theme:** PayPal adapter, subscription validation, webhook enhancements, license key system, CI/CD
> **Publish cadence:** Weekly on Sundays
> **Blog cadence:** Publish on squaredr.tech only (no 3rd-party cross-posting)
> **Starting version:** 0.9.0
> **Target version:** 0.13.0

---

## Week 1 (July 1 – July 5) → Publish Sunday July 5

**Tasks:**
- A1.17 — Param validation for `subscriptions.create` (amount > 0, currency valid, interval valid, customer non-empty)
- A2.08 — Strict generics on `PaymentRouter<TProviders>`
- A2.09 — `PayKitConfig` type alias
- A2.14 — JSDoc comments on all exported types

**Bump:** 0.9.0 → **0.10.0**

---

## Week 2 (July 6 – July 12) → Publish Sunday July 12 ✅

**Tasks:**
- ✅ B1.01 — PayPal adapter (full build):
  - ✅ Scaffolding + OAuth 2.0 auth + `initialize()` + `healthCheck()`
  - ✅ `charges.create/retrieve/capture` (Orders API v2) + mappers
  - ✅ `refunds.create/retrieve` + `customers` mapping
  - ✅ `webhooks.verify/parse` (signature verification, event mapping)
  - ✅ `subscriptions.create/retrieve/cancel` + register in registry + tests
- ✅ C2.01 — PayPal provider bridge (SDK-JS)
- ✅ PayPal client adapter — dual-mode Buttons + Card Fields
- ✅ PayPal added to LiveDemo on website
- ✅ 10 PayPal bug fixes (see Category G in backlog — G3.01–G3.08)

**Bump:** 0.10.0 → **0.11.0**

---

## Week 3 (July 13 – July 19) → Publish Sunday July 19

**Tasks:**
- F.01 — GitHub Actions CI (build + test on push/PR)
- F.02 — Automated npm publish on `v*` tags
- F.05 — npm download badge + `FUNDING.yml`
- F.06 — License key validation module (`license.ts`, `LicenseRequiredError`, env var support)
- E2.03 — Blog: "Building a Multi-Provider Checkout with PayKit"

**Bump:** 0.11.0 → **0.12.0**

---

## Week 4 (July 20 – July 27) → Publish Sunday July 27

**Tasks:**
- A5.03 — `webhooks.isValid()` boolean check method
- A5.04 — Webhook timestamp validation (`maxAge` option, `WebhookExpiredError`)
- A5.06 — Auto-detect provider from webhook headers (`detectProvider()`)
- A5.07 — `WebhookHandler` class (multi-provider, auto-detect, verify, parse)
- A6.06 — `createMockSubscription()` factory
- A6.09 — `TEST_CARDS` export (Visa, Mastercard, Amex, decline, 3DS)

**Bump:** 0.12.0 → **0.13.0**

---

## Week 5 (July 28 – July 31) — No publish (docs/content week)

**Tasks:**
- E1.01 — PayPal adapter docs page (squaredr.tech)
- E1.08 — Error handling guide (squaredr.tech)
- E3.01 — Update core README with PayPal examples
- E4.02 — Update landing page providers section
- E2.04 — Blog: "Deep India Coverage: PhonePe, Cashfree + UPI" (preview)

---

## Month 2 Summary

| Metric | Target |
|--------|--------|
| npm publishes | 4 (weekly Sundays) |
| Version range | 0.9.0 → 0.13.0 |
| New adapter | PayPal (complete) |
| Blog posts | 2 on squaredr.tech |
| Docs pages | 2 (PayPal guide, error handling guide) |
| Infrastructure | CI/CD pipeline, license key system, FUNDING.yml |
| Testing utilities | 2 (createMockSubscription, TEST_CARDS) |

### Backlog Items

| ID | Item | Status |
|----|------|--------|
| A1.17 | subscriptions.create validation | Week 1 |
| A2.08 | Strict generics on PaymentRouter | Week 1 |
| A2.09 | PayKitConfig type alias | Week 1 |
| A2.14 | JSDoc on all exported types | Week 1 |
| A5.03 | webhooks.isValid() | Week 4 |
| A5.04 | Webhook timestamp validation | Week 4 |
| A5.06 | detectProvider() | Week 4 |
| A5.07 | WebhookHandler class | Week 4 |
| A6.06 | createMockSubscription | Week 4 |
| A6.09 | TEST_CARDS | Week 4 |
| B1.01 | PayPal adapter | Week 2 ✅ |
| C2.01 | PayPal provider bridge | Week 2 ✅ |
| G3.01–G3.08 | PayPal bug fixes (10 items) | Week 2 ✅ |
| E1.01 | PayPal docs | Week 5 |
| E1.08 | Error handling guide | Week 5 |
| E2.03 | Blog: Multi-provider checkout | Week 3 |
| E2.04 | Blog: India coverage preview | Week 5 |
| E3.01 | README: PayPal examples | Week 5 |
| E4.02 | Landing page update | Week 5 |
| F.01 | GitHub Actions CI | Week 3 |
| F.02 | Automated publish on tags | Week 3 |
| F.05 | Download badge + FUNDING.yml | Week 3 |
| F.06 | License key system | Week 3 |
