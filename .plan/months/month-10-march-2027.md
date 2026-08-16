# Month 10 — March 2027

> **Theme:** Checkout.com + Klarna adapters, adapter author SDK, enterprise features, community growth
> **Publish cadence:** Weekly on Sundays
> **Starting version:** 1.9.0
> **Target version:** 1.12.0

---

## Week 1 (Mar 7 – Mar 13) → Publish Sunday Mar 13

**Tasks:**
- B4.13 — Checkout.com adapter (full build):
  - Scaffolding + Bearer token auth (secret key + public key for client-side)
  - `charges.create` (Payments API — card/token/network token)
  - `charges.retrieve`, `charges.capture` (separate auth + capture flow)
  - `refunds.create`
  - `webhooks.verify/parse` (HMAC-SHA256, maps `payment_approved/captured/refunded`)
  - Register in registry, tests
- B4.14 — Klarna adapter (full build):
  - Scaffolding + Basic auth (username + password)
  - `charges.create` (create session + create order, BNPL / Pay in 4 / Pay Now modes)
  - `charges.retrieve`, `refunds.create`
  - `webhooks.verify/parse` (maps `order.created/approved/captured`)
  - Register in registry, tests
  - All 26 planned adapters now complete

**Bump:** 1.9.0 → **1.10.0**

---

## Week 2 (Mar 14 – Mar 20) → Publish Sunday Mar 20

**Tasks:**
- A6.10 — Conformance test suite for adapter authors:
  - `runConformanceTests(adapter, testConfig)` exported from `@squaredr/paykit/testing`
  - Tests: charges CRUD, refunds, webhook verify/parse, error mapping, capability reporting
- A7.05 + A7.06 — Request metadata:
  - `_meta.durationMs` on all adapter responses
  - `_meta.providerApiVersion` (e.g., Stripe's `Stripe-Version`)
- D.03 — Integration tests for Stripe subscriptions (real test mode APIs)
- D.04 — Integration tests for Stripe webhooks (local signing secret)
- D.07 — Integration tests for Razorpay webhooks (HMAC-SHA256)
- E3.11 — CONTRIBUTING.md update for adapter authors

**Bump:** 1.10.0 → **1.11.0**

---

## Week 3 (Mar 21 – Mar 27) → Publish Sunday Mar 27

**Tasks:**
- E1.19 — Changelog page on squaredr.tech (aggregate 0.5.x → 1.11.x)
- E4.09 — Per-adapter detail pages (all 26 adapters):
  - URL pattern: `/products/paykit/adapters/{name}`
  - Each: supported operations, example code, setup guide, region coverage
- G.14 — "PayKit in 5 Minutes" video script + storyboard
- F.12 — GitHub Sponsors / funding setup
- F.13 — Automated README badge updates (GitHub Action)

**No version bump** — content + infra week

---

## Week 4 (Mar 28 – Mar 31) → Publish Sunday Mar 31

**Tasks:**
- Blog: "25+ Providers, One API: The Complete PayKit"
- Blog: "Error Handling Patterns for Payment SDKs"
- E4.08 — Video demo embed on landing page
- E4.11 — Regional content customization
- Update landing page with all 26 adapters

**No version bump** — content week

---

## Month 10 Summary

| Metric | Target |
|--------|--------|
| npm publishes | 2 |
| Version range | 1.9.0 → 1.12.0 |
| New adapters | Checkout.com, Klarna (total: **26 — all planned adapters complete**) |
| Blog posts | 2 |
| Core features | Conformance test suite, request metadata (_meta.durationMs, providerApiVersion) |
| Infrastructure | GitHub Sponsors, automated badges |
| Docs pages | Changelog, 26 adapter detail pages |
| Content | Video script |
