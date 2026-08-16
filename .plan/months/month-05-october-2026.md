# Month 5 — October 2026

> **Theme:** Global adapters (Square, Adyen, Mollie, MercadoPago, Flutterwave), React headless hooks, beta milestone
> **Publish cadence:** Weekly on Sundays
> **Starting version:** 0.22.0
> **Target version:** 1.0.0-beta.1

---

## Week 1 (Oct 4 – Oct 11) → Publish Sunday Oct 11

**Tasks:**
- B3.01 — Square adapter (full build: auth, charges, refunds, webhooks)
- B3.02 — Adyen adapter (full build: auth, charges, refunds, webhooks, subscriptions)
- Registered in registry, tests

**Bump:** 0.22.0 → **0.23.0**

---

## Week 2 (Oct 12 – Oct 18) → Publish Sunday Oct 18

**Tasks:**
- B3.03 — Mollie adapter (full build: auth, charges, refunds, webhooks)
- B3.04 — MercadoPago adapter (full build: auth, charges, refunds, webhooks)
- B3.05 — Flutterwave adapter (full build: auth, charges, refunds, webhooks)
- All registered in registry, tests

**Bump:** 0.23.0 → **0.24.0**

---

## Week 3 (Oct 19 – Oct 25) → Publish Sunday Oct 25

**Tasks:**
- C1.12 — `useHeadlessCheckout` hook (React)
- C1.13 — `PaymentStatus` component (React)
- C1.14 — `SavedCards` component (React)
- A6.10 — Conformance test suite for adapter authors
- Docs pages for all 5 new adapters

**Bump:** 0.24.0 → **0.25.0** + paykit-react → 1.1.0

---

## Week 4 (Oct 26 – Nov 1) → Publish Sunday Nov 1

**Tasks:**
- Beta preparation: review all public APIs, freeze breaking changes
- D.19 — Snapshot tests for all mapper outputs
- D.23 + D.24 — Package exports validation (ESM + CJS)
- Update README with full provider matrix
- Blog: "PayKit Reaches 12 Providers: Global Coverage"

**Bump:** 0.25.0 → **1.0.0-beta.1**

---

## Month 5 Summary

| Metric | Target |
|--------|--------|
| npm publishes | 4 |
| Version range | 0.22.0 → 1.0.0-beta.1 |
| New adapters | Square, Adyen, Mollie, MercadoPago, Flutterwave (total: 12) |
| Blog posts | 1 |
| React components | 3 (useHeadlessCheckout, PaymentStatus, SavedCards) |
| **Milestone** | **1.0.0-beta.1 — feature freeze** |
