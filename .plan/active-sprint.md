# ACTIVE SPRINT — Week 1: Critical Audit Fixes (Core)

> **LLM INSTRUCTION**: This is the ONLY file you need to read for today's work.
> Do NOT read `roadmap.md` or `backlog.md` unless specifically asked about future weeks, the big picture, or item details.
> Everything you need for this week is right here.

> **Dates**: August 25-29, 2026
> **Theme**: Fix all 7 critical/high audit findings in core package
> **Blog**: "How We Found 53 Bugs in Our Own Payment SDK" (publish Friday Aug 29)
> **Publish**: Patch bump daily, npm publish end of week
> **Commit format**: `fix: description` (no Co-Authored-By, ever)

---

## Context

Phase 2 deep audit found 53 issues across core/sdk-js/react. This week tackles the 7 critical core findings (C1-C7). These are security, type safety, and logic bugs that must be fixed before building new adapters on top.

**Current versions**: core 0.15.0 | react 1.0.1 | sdk-js 1.0.1

---

## Monday Aug 25

### C1 — PayPal webhook verification: add crypto verification
- **File**: `adapters/paypal/adapter.ts:394-450`
- **Issue**: PayPal webhook verification is structural-only (checks event fields exist) but doesn't do cryptographic signature verification. PayPal provides a postback verification API that should be called.
- **Fix**: Implement PayPal's notification verification endpoint call. POST the webhook event back to PayPal's verification URL with `webhook_id`, verify the response says `VERIFIED`.
- **Severity**: CRITICAL (security)
- [ ] Implement crypto verification
- [ ] Update tests
- [ ] Verify `tsc --noEmit` passes

---

## Tuesday Aug 26

### C6 — PayPal amount: handle 3-decimal currencies
- **File**: `adapters/paypal/adapter.ts:155-159`
- **Issue**: Amount conversion assumes 2-decimal currencies. BHD, KWD, OMR use 3 decimals (1000 fils per unit). These will be off by 10x.
- **Fix**: Use the shared `ZERO_DECIMAL_CURRENCIES` set (already exists from G3.09 fix) and add `THREE_DECIMAL_CURRENCIES` set. Apply correct divisor/multiplier based on currency.
- **Severity**: CRITICAL (bug)
- [ ] Add THREE_DECIMAL_CURRENCIES to constants
- [ ] Fix amount conversion in PayPal adapter
- [ ] Verify with BHD, KWD, OMR test cases

### C7 — Razorpay error handler: add type guard
- **File**: `adapters/razorpay/adapter.ts:90-95`
- **Issue**: Error handler catches `unknown` but casts directly without type checking. If the error isn't a Razorpay error object, it'll crash trying to read `.error.code`.
- **Fix**: Add type guard: `if (err && typeof err === 'object' && 'error' in err && ...)` before accessing nested properties. Fall through to generic `PaymentError` if not a recognized shape.
- **Severity**: HIGH (bug)
- [ ] Add type guard to error handler
- [ ] Add test for non-Razorpay error shapes

---

## Wednesday Aug 27

### C2 — Stripe adapter: replace unsafe `as` casts
- **File**: `adapters/stripe/adapter.ts:198,235`
- **Issue**: Stripe API responses are cast with `as` to expected types without runtime validation. If Stripe changes their response shape, errors will be silent type mismatches instead of clear failures.
- **Fix**: Add runtime shape checks on critical fields before casting. Use optional chaining with fallback throws: `const pi = response.data; if (!pi?.id) throw new PaymentError(...)`.
- **Severity**: HIGH (type safety)
- [ ] Add runtime checks for charge/refund responses
- [ ] Remove or narrow unsafe casts

### C5 — Stripe webhook: fix unmapped event cast to `never`
- **File**: `adapters/stripe/adapter.ts:290-300`
- **Issue**: Unmapped Stripe webhook events are cast to `type: event.type as never`, which makes the type system think they're impossible. Should use a passthrough type or skip them.
- **Fix**: For unmapped events, either skip them (return null and document which events are supported) or pass through with `type: event.type as string` and mark as `'unknown'` in the unified type.
- **Severity**: HIGH (bug)
- [ ] Fix unmapped event handling
- [ ] Add tests for unknown event types

---

## Thursday Aug 28

### C3 — Razorpay adapter: replace `any` with typed interfaces
- **File**: `adapters/razorpay/` (adapter.ts + all mappers)
- **Issue**: Extensive use of `any` throughout the Razorpay adapter and mapper files. This defeats TypeScript's purpose and hides bugs.
- **Fix**: Create typed interfaces for Razorpay API response shapes: `RazorpayPayment`, `RazorpayRefund`, `RazorpayCustomer`, `RazorpaySubscription`, `RazorpayPlan`, `RazorpayWebhookEvent`. Replace all `any` usages. Put in `adapters/razorpay/types.ts`.
- **Severity**: HIGH (type safety)
- [ ] Create Razorpay response type interfaces
- [ ] Replace `any` in adapter.ts
- [ ] Replace `any` in all mapper files
- [ ] Verify `tsc --noEmit` passes

---

## Friday Aug 29

### C4 — Razorpay pagination: fix cursor parsing
- **File**: `adapters/razorpay/adapter.ts:141,172,219,357`
- **Issue**: Pagination uses `startingAfter` as if it's an offset number (passes to `skip`), but `startingAfter` is meant to be a cursor (an entity ID). Razorpay's API uses `skip` (numeric offset) not cursor-based pagination. The adapter treats IDs as numbers, which breaks.
- **Fix**: Accept `startingAfter` as a numeric offset string (e.g., `"20"`) and parse with `parseInt`. If it's not a valid number, default to 0. Document that Razorpay uses offset-based pagination, not cursor-based.
- **Severity**: HIGH (bug)
- [ ] Fix pagination cursor → offset conversion
- [ ] Add tests for pagination edge cases
- [ ] Update JSDoc on ListParams

### Blog post
- [ ] Write "How We Found 53 Bugs in Our Own Payment SDK"
  - What we audited (3 packages, 53 issues)
  - Categories: security, type safety, logic bugs, DX gaps
  - Examples: the innerHTML XSS, fake billing details, silent webhook failures
  - What we learned about reviewing your own code
  - CTA: try PayKit, star on GitHub
- [ ] Create MDX file in `content/blog/`
- [ ] Publish to website

### End of week
- [ ] Version bump: 0.15.0 → 0.15.1 (patch)
- [ ] `pnpm --filter @squaredr/paykit publish --access public --no-git-checks`
- [ ] Verify all tests pass
- [ ] Move this file to `archive/week-01-aug25.md`
- [ ] Create new `active-sprint.md` from roadmap Week 2

---

## Verification Checklist (run daily)

```bash
cd packages/core && npx tsc --noEmit        # 0 type errors
cd packages/sdk-js && npx tsc --noEmit      # 0 type errors
npx vitest run                               # all tests pass
```

---

## Week 2 Preview (Sep 1-5): Critical Audit Fixes (Frontend)

R1-R2 (CardInput leaks), J1-J4 (Stripe/PayPal SDK-JS fixes), G1.01 (fake billing), G2.01 (webhook sig).
See `roadmap.md` for full schedule.
