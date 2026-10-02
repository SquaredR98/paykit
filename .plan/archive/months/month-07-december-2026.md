# Month 7 — December 2026

> **Theme:** Post-1.0 stabilization, Worldpay + Authorize.net + Nuvei, subscription lifecycle
> **Publish cadence:** Weekly on Sundays
> **Starting version:** 1.0.1
> **Target version:** 1.3.0

---

## Week 1 (Dec 6 – Dec 13) → Publish Sunday Dec 13

**Tasks:**
- B5.01 — Worldpay adapter (full build: auth, charges, refunds, webhooks)
- B5.02 — Authorize.net adapter (full build: auth, charges, refunds, webhooks)
- Both registered in registry, tests

**Bump:** 1.0.1 → **1.1.0**

---

## Week 2 (Dec 14 – Dec 20) → Publish Sunday Dec 20

**Tasks:**
- B5.03 — Nuvei adapter (full build: auth, charges, refunds, webhooks)
- A4.10 — Weighted routing (percentage-based traffic split)
- A4.11 — Cost-based routing (route to cheapest provider)

**Bump:** 1.1.0 → **1.2.0**

---

## Week 3 (Dec 21 – Dec 27) → Publish Sunday Dec 27

**Tasks:**
- Subscription lifecycle complete across all adapters that support it:
  - Pause/resume for PayPal, PhonePe, Cashfree
  - Trial periods for all subscription-capable adapters
  - Subscription webhook events normalization
- Bug fixes from 1.0 feedback

**Bump:** 1.2.0 → **1.3.0**

---

## Week 4 (Dec 28 – Jan 3) — Light week / year-end

**Tasks:**
- Blog: "PayKit Year in Review: From 0 to 18 Adapters"
- Blog: "Payment Routing Strategies for Multi-Provider Apps"
- Docs: Worldpay, Authorize.net, Nuvei adapter guides
- Update landing page provider count

**No version bump** — content week

---

## Month 7 Summary

| Metric | Target |
|--------|--------|
| npm publishes | 3 |
| Version range | 1.0.1 → 1.3.0 |
| New adapters | Worldpay, Authorize.net, Nuvei (total: 18) |
| Blog posts | 2 |
| Key features | Weighted routing, cost-based routing, subscription lifecycle |
