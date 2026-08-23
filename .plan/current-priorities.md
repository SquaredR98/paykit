# Current Priorities — Master Plan

> **Last updated**: August 23, 2026
> **Read this file at every session start.** This governs all work order and decisions.

---

## Priority Order (strict sequence)

### Phase 1: Complete the Website

**Status**: IN PROGRESS

Finish everything remaining on the website before moving to SDK/adapter work.

**What's left:**
- [ ] Phase 10a — `/docs/api-explorer` (interactive API console)
- [ ] Phase 10b — `/docs/capabilities` (provider capability matrix)
- [ ] Phase 11 — Polish & verification (responsive audit, a11y, perf, cross-browser)
- [ ] Fix remaining known issues from `.plan/website.md` (items #2, #3, #4, #6)
- [ ] Verify dev workbench production gate works

**Definition of done:** Every page is responsive, all links work, dark/light toggle works everywhere, build passes, Lighthouse 90+. No placeholder content anywhere.

---

### Phase 2: Deep Audit of Existing Codebase

**Status**: NOT STARTED

Thorough review of all existing packages. Find everything the G-category review missed.

**Scope:**
- `packages/core` — all adapters (Stripe, Razorpay, PayPal), client, router, types, errors, retry, logger
- `packages/sdk-js` — all provider bridges, script loader, types
- `packages/react` — all components, hooks, types

**What to look for:**
- Bugs and edge cases
- DX friction (confusing APIs, poor error messages, missing conveniences)
- API design inconsistencies across adapters
- Type gaps and `any` leaks
- Security concerns beyond what G-category caught
- Missing test coverage for critical paths
- Coding structure issues (dead code, unnecessary abstractions, missing abstractions)
- Documentation gaps (JSDoc, README accuracy)
- Performance concerns

**Output:** New issue list added to `backlog.md` (or a new category H), with severity, file paths, and descriptions. Each item must be a single-day deliverable.

---

### Phase 3: Daily Shipping + Weekly Adapters

**Status**: NOT STARTED (begins after Phase 1 + 2)

**Daily cadence:**
- Every day: ship 1+ meaningful bug fix / backlog item with npm publish (patch or minor bump)
- Every 1-2 weeks: ship 1 new adapter

**Adapter strategy (two tracks):**

**Track A — Listed adapters (24 confirmed):**
The 24 adapters from `backlog.md` Category B are confirmed. Build them in the order from `shipping-schedule.md`, adjusted for test account availability.

**Track B — Hard-to-integrate, high-demand providers:**
Research and find payment providers that:
1. Are heavily used but have terrible Node.js/React developer experience
2. Have lots of complaints in the community (bad SDKs, poor docs, weird APIs)
3. Are genuinely difficult to integrate — PayKit wrapping them provides massive value
4. Offer test/sandbox accounts without requiring business verification
5. Are NOT already in the 24 listed adapters

These become additional adapters that make PayKit the answer to "I hate integrating with X."

Research goes in `.plan/adapter-research.md`.

**Backlog restructure:**
Pack every remaining day in 2026 (~130 days from Aug 24) with a concrete deliverable. Interleave:
- Adapter work (weekly blocks)
- Bug fixes from Phase 2 audit (daily)
- Backlog items from categories A-F (daily)
- Docs and blog as needed

See `.plan/daily-cadence.md` for the schedule structure.

---

## Key Rules (from user directives)

1. **Website first.** No adapter or SDK work until the website is fully complete.
2. **Ship daily.** Every day produces a meaningful commit + npm publish.
3. **Adapters weekly.** 1 new adapter every 1-2 weeks alongside daily bug work.
4. **Find hard providers.** Beyond the 24 listed, find high-demand difficult-to-integrate providers.
5. **Test account required.** Only build adapters where we can get sandbox/test API keys without business verification.
6. **Audit before shipping.** Deep code review before restructuring the daily backlog.
7. **No Co-Authored-By.** Never in commit messages.
8. **No parallel agents.** Sequential execution only.
