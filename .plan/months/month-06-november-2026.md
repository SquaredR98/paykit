# Month 6 — November 2026

> **Theme:** Enterprise adapters (PayU, Airwallex, GoCardless), 1.0 stable release, launch
> **Publish cadence:** Weekly on Sundays
> **Starting version:** 1.0.0-beta.1
> **Target version:** 1.0.0

---

## Week 1 (Nov 1 – Nov 8) → Publish Sunday Nov 8

**Tasks:**
- B4.01 — PayU adapter (full build: auth, charges, refunds, webhooks)
- B4.02 — Airwallex adapter (full build: auth, charges, refunds, webhooks)
- Both registered in registry, tests

**Bump:** 1.0.0-beta.1 → **1.0.0-beta.2**

---

## Week 2 (Nov 9 – Nov 15) → Publish Sunday Nov 15

**Tasks:**
- B4.03 — GoCardless adapter (full build: auth, direct debit charges, refunds, webhooks)
- Bug fixes from beta feedback
- Full provider matrix documentation
- Regional configuration support

**Bump:** 1.0.0-beta.2 → **1.0.0-rc.1**

---

## Week 3 (Nov 16 – Nov 22) → Publish Sunday Nov 22

**Tasks:**
- 1.0.0 release preparation:
  - Final API review, all breaking changes resolved
  - CHANGELOG.md for 1.0.0
  - Migration guide from 0.x → 1.0
  - All adapter docs pages complete
  - All adapter subpath exports validated
- Blog: "PayKit 1.0: Unified Payments for Every Provider"

**Bump:** 1.0.0-rc.1 → **1.0.0** 🎉

---

## Week 4 (Nov 23 – Nov 30) — Launch week

**Tasks:**
- Product Hunt launch
- Submit to awesome-node, awesome-typescript lists
- Blog: "Why We Built PayKit: The Story Behind Unified Payments"
- Update landing page with 1.0 badge + full provider matrix

**No version bump** — launch & marketing week

---

## Month 6 Summary

| Metric | Target |
|--------|--------|
| npm publishes | 3 (beta.2, rc.1, 1.0.0) |
| Version range | 1.0.0-beta.1 → 1.0.0 |
| New adapters | PayU, Airwallex, GoCardless (total: 15) |
| Blog posts | 2 |
| **Milestone** | **1.0.0 stable release + Product Hunt launch** |
