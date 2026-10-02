# Current Priorities — Master Plan

> **Last updated**: August 23, 2026
> **Read this file at every session start.** This governs all work order and decisions.

---

## Priority Order (strict sequence)

### Phase 1: Complete the Website

**Status**: ✅ COMPLETE

All website work done:
- [x] Phase 10a — `/docs/api-explorer` (interactive API console)
- [x] Phase 10b — `/docs/capabilities` (provider capability matrix)
- [x] Phase 11 — Polish (responsive audit, BeforeAfter Shiki rewrite, hero title fix)
- [x] Fix known issues #2 (TOC IDs), #3 (nav height), #4 (progress bar)
- [x] Dev workbench production gate verified
- [x] Favicon added

---

### Phase 2: Deep Audit of Existing Codebase

**Status**: ✅ COMPLETE

Full audit across all 3 packages. Results in `.plan/audit-results.md`.

**Findings**: 53 new issues (14 critical/high, 22 medium, 17 low)
- core: 24 issues (security, type safety, logic bugs)
- sdk-js: 16 issues (deprecated API, race conditions, memory leaks)
- react: 13 issues (hook bugs, missing deps, DX gaps)

---

### Phase 3: Daily Shipping + Weekly Adapters

**Status**: IN PROGRESS — starts Aug 25, 2026

**Full schedule**: `.plan/audit-results.md` (19 weeks through Dec 31)

**Daily cadence:**
- Every day: ship 1+ meaningful bug fix / backlog item with npm publish
- Every 1-2 weeks: ship 1 new adapter

**Adapter target for 2026:**
8 new adapters: PhonePe, Cashfree, Square, Adyen, Mollie, MercadoPago, Flutterwave, PayU

**Sequence:**
1. Weeks 1-4: Critical + high audit fixes (all 14 P1 + G-category critical)
2. Weeks 4-5: Medium audit fixes + core feature start (error handling)
3. Weeks 5+: Interleaved adapter builds + backlog features + remaining fixes

**Adapter strategy (two tracks):**

**Track A — Listed adapters (24 confirmed):**
The 24 adapters from `backlog.md` Category B. Build in order from schedule.

**Track B — Hard-to-integrate, high-demand providers:**
Research in `.plan/adapter-research.md`. Find providers with bad Node.js DX that would benefit from PayKit wrapping. These become additional adapters.

---

## Key Rules (from user directives)

1. **Website first.** ✅ Done.
2. **Audit before shipping.** ✅ Done.
3. **Ship daily.** Every day produces a meaningful commit + npm publish.
4. **Adapters weekly.** 1 new adapter every 1-2 weeks alongside daily bug work.
5. **Find hard providers.** Beyond the 24 listed, find difficult-to-integrate providers.
6. **Test account required.** Only build adapters where we can get sandbox/test keys.
7. **No Co-Authored-By.** Never in commit messages.
8. **No parallel agents.** Sequential execution only.
