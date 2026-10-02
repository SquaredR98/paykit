# Website Claims Audit — Verified Against Source

> **Status**: AUDIT — findings only, nothing fixed yet.
> **Created**: October 1, 2026
> **Method**: Every claim checked against `packages/*/src/`, built `dist/`, and a live `tsc` typecheck of documented code samples. No claim accepted from memory (Rule M3).
> **Blocks**: `.plan/runtime-split.md` — fix claims before refactoring.

---

## Verdict

The website is **more honest than expected on provider counts** — the feared "25+ providers"
overclaim is correctly written as "25+ providers **planned**" with a clear Shipped (3) vs
Planned (5) split. That is fine as-is.

The real problems are elsewhere: **documented code that does not compile**, a **false security
claim**, a **capability flag that lies**, and **bundle sizes stated on three different bases**.

| Severity | Count | Theme |
|----------|-------|-------|
| 🔴 Critical | 3 | False security claim; broken quick-start code; capability that crashes |
| 🟠 High | 3 | Missing package from install docs; wrong PayPal install claim; bundle-size contradictions |
| 🟡 Medium | 3 | Hardcoded capability matrix (M3); test-count claim; FAQ overstatement |
| 🟢 Low | 2 | Stale version drift; `paykit-js` barely documented |

---

## 🔴 CRITICAL

### C1 — FAQ falsely claims all webhook signatures are cryptographically verified

**File**: `content/docs/reference/faq.md:61-63`

> "**Are webhook signatures verified?** Yes. Every adapter verifies webhook signatures using the
> provider's official verification method before parsing the event. Invalid signatures throw an error."

**Reality** — `packages/core/src/adapters/paypal/adapter.ts:396-410`. The adapter's own JSDoc says:

```
Structural validation only — checks that all required PayPal webhook
headers are present and non-empty. Does NOT perform cryptographic
signature verification (PayPal requires an async API call for that).
```

PayPal's `verify()` only loops `REQUIRED_WEBHOOK_HEADERS` checking presence. **An attacker who
sends the five header names with arbitrary values passes verification.**

This is a **security claim that is false for 1 of 3 shipped providers**. Users will trust it and
ship a forgeable webhook endpoint.

Compounding it: the real verifier `verifyWebhookAsync()` exists (`adapter.ts:465`) but is
**not exported** from `adapters/paypal/index.ts`, and is documented nowhere on the site.

**Fix**:
1. Rewrite the FAQ answer to state per-provider truth: Stripe and Razorpay verify
   cryptographically; **PayPal's sync `verify()` is structural only** and requires
   `verifyWebhookAsync()` for real verification.
2. Export `verifyWebhookAsync` from the PayPal adapter index.
3. Add a prominent warning to `content/docs/guides/paypal.md` and `guides/webhooks.md`.
4. Cross-reference: this is audit item **C1** in `active-sprint.md` (already known, still open).

---

### C2 — Quick-start React code does not compile

**Files**: `content/docs/getting-started/quick-start.md:77-86` **+ 8 other files**

Verified by typechecking the documented snippet against the real built packages. Two errors:

**(a) `clientSecret` is passed to `PayKitProvider`, which has no such prop.**
`PayKitProvider` accepts only `{ config | clientAdapter, children }`
(`packages/react/src/context/PayKitProvider.tsx:6-19`). `clientSecret` belongs on
**`CheckoutForm`**, where it is **required** (`CheckoutForm.tsx:8`).

Live `tsc` output for the documented pattern:
```
error TS2741: Property 'clientSecret' is missing in type
'{ onSuccess: ... }' but required in type 'CheckoutFormProps'.
```

**(b) `onSuccess` result uses `.id`, which does not exist.**
`onSuccess` receives `PaymentConfirmResult`
(`{ status, chargeId?, redirectUrl?, error? }` — `types/client-adapter.ts:51-56`).
There is **no `id` field**. The correct property is **`chargeId`**.

**Blast radius** — `clientSecret`-on-Provider appears **8 times**, `result.id` appears **8 times**:

| File | Both bugs |
|------|-----------|
| `content/docs/getting-started/quick-start.md` | ✓ |
| `content/docs/guides/stripe.md` | ✓ |
| `content/docs/guides/razorpay.md` | ✓ |
| `content/docs/guides/paypal.md` | ✓ |
| `content/docs/guides/migration.md` | ✓ |
| `content/docs/guides/multi-provider.md` | ✓ |
| `content/docs/index.md` | ✓ |
| `content/blog/getting-started-paykit.mdx` | ✓ |
| `content/blog/multi-provider-routing.mdx` | ✓ |

**This is the first code a new user copies.** It fails to compile immediately.

**Fix**: correct all 9 files to:
```tsx
<PayKitProvider clientAdapter={stripeClient}>
  <CheckoutForm
    clientSecret={clientSecret}
    onSuccess={(result) => console.log('Paid:', result.chargeId)}
  />
</PayKitProvider>
```

---

### C3 — `payouts: true` is declared but no adapter implements payouts

**Files**: `components/docs/CapabilityMatrix/index.tsx:103,115` + the adapters themselves

Stripe and PayPal both declare `payouts: true`
(`adapters/stripe/adapter.ts:43`, `adapters/paypal/adapter.ts:69`), and the website's capability
matrix renders ✓ for both — with a **copyable snippet**:

```ts
const payout = await paykit.payouts.create({ amount: 10000, currency: 'USD', destination: 'ba_xxx' });
```

**Reality**: `grep -rn "PayoutOperations" packages/core/src/` finds only the *interface* and the
*optional field*. **Zero adapters implement `payouts`.**

Because `client.ts:344` gates on `capabilities.payouts && defaultAdapter.payouts`, the result is
the worst failure mode: `paykit.payouts` is silently `undefined`, so the documented snippet throws
`TypeError: Cannot read properties of undefined (reading 'create')` — **not** the
`NotSupportedError` the FAQ promises (`faq.md:53`).

**Fix** — pick one:
- **(preferred, honest)** Set `payouts: false` in Stripe + PayPal adapters until implemented;
  matrix follows automatically once C6 is done.
- Or implement `PayoutOperations` for both (much larger scope — belongs in the backlog, not here).

Also fix the matrix's payout snippet to not be copyable while unsupported.

---

## 🟠 HIGH

### H1 — Installation docs omit `@squaredr/paykit-js` entirely

**File**: `content/docs/getting-started/installation.md:14-19`

The "Package overview" table lists only `@squaredr/paykit` and `@squaredr/paykit-react`.
**`@squaredr/paykit-js` is missing** — yet it is a **required peer dependency** of
`paykit-react`:

```json
"peerDependencies": {
  "@squaredr/paykit": ">=0.2.0",
  "@squaredr/paykit-js": ">=1.0.0",   ← undocumented
  "react": "^18.0.0 || ^19.0.0"
}
```

The frontend install section says only `npm install @squaredr/paykit-react`, which will emit an
unmet-peer-dependency warning and fail at runtime.

**Fix**: add `@squaredr/paykit-js` to the table and to the React install command:
`npm install @squaredr/paykit-react @squaredr/paykit-js`.

> Note: the runtime-split plan (Phase 3) makes `paykit-js` a first-class package. Document it
> correctly now so the split does not have to also introduce it.

---

### H2 — "PayPal does not require a separate SDK" is false

**File**: `content/docs/getting-started/installation.md:36-40`

> "PayPal does not require a separate SDK — the PayPal adapter uses the PayPal REST API directly."

**Reality**: `@paypal/paypal-server-sdk@^2.4.0` is a **hard `dependency`** of core
(`packages/core/package.json`), and `adapters/paypal/adapter.ts:37` imports from it. Its own
header comment says *"Uses @paypal/paypal-server-sdk v2.4.0 for type-safe API access."*

The statement is half-true in a misleading way: users do not install it **separately** because
core installs it **for everyone** — including Stripe-only users. That is the opposite of the
"install only what you use" promise in `faq.md:49`.

**Fix**: state plainly that the PayPal adapter depends on `@paypal/paypal-server-sdk`, which
currently ships as a core dependency. (The structural fix — making it an optional peer like
Stripe/Razorpay — is tracked in `runtime-split.md` §8.)

---

### H3 — Bundle sizes stated on three contradictory bases

Measured with `esbuild --minify --bundle` against built `dist/` on October 1, 2026:

| Entry | **Measured (min)** | FAQ claim | Features claim |
|-------|--------------------|-----------|----------------|
| core | **20.0 KB** | "under 11 KB minified" ❌ | "26 KB" ❌ |
| stripe adapter | **12.5 KB** | "15–16 KB per adapter" ≈ | — |
| razorpay adapter | **12.1 KB** | "15–16 KB" ❌ | — |
| paypal adapter | **17.6 KB** | "15–16 KB" ≈ | — |
| stripe client | **4.0 KB** | "4–6 KB" ✓ | — |
| razorpay client | **2.3 KB** | "4–6 KB" ❌ | — |
| paypal client | **7.0 KB** | "4–6 KB" ❌ | — |
| react | 7.3 KB **raw** | — | "7 KB" (raw) ⚠️ |
| sdk-js | 4.4 KB **raw** | — | "4 KB" (raw) ⚠️ |

Three problems:
1. **FAQ and Features contradict each other** on core: 11 KB vs 26 KB. Neither is right (20.0 KB).
2. **Features uses raw unminified sizes** for react/sdk-js while the FAQ says "minified" — so the
   site mixes measurement bases without saying so.
3. **"Zero runtime dependencies" (`Features/index.tsx:46`) is false.** Core has
   `@paypal/paypal-server-sdk` as a hard dependency, and because tsup's `external` list is
   `['stripe','razorpay']` only, the PayPal SDK is **bundled inline** into
   `dist/adapters/paypal/index.js` (verified).

**Fix**: pick one basis (recommend **minified + gzipped**, the industry norm), state it explicitly,
regenerate all numbers from `dist/`, and drop or qualify "zero runtime dependencies".
Add a script so these are generated, not hand-typed.

---

## 🟡 MEDIUM

### M1 — CapabilityMatrix hardcodes capability flags (violates Rule M3)

**File**: `components/docs/CapabilityMatrix/index.tsx:99-118`

`PROVIDER_CAPS` duplicates all 13 flags × 3 providers as literals. Rule M3 requires counting from
source. Today it happens to match the adapters — but it is a copy that will silently drift, and it
is **already propagating the C3 payouts error** into the UI.

**Fix**: import the real adapter capabilities at build time (server component reading
`StripeAdapter.prototype.capabilities` or a generated JSON), so the matrix cannot drift.

---

### M2 — "400+ tests" is true in total but 14 tests currently fail

**File**: `components/homepage/Hero/index.tsx:38`

Measured:

| Package | Tests | Status |
|---------|-------|--------|
| core | 402 | ✅ all pass |
| sdk-js | 49 | ❌ **14 fail** (3 files) |
| react | 19 | ✅ all pass |
| **Total** | **470** | **14 failing** |

So "400+ tests" is literally accurate (470). But advertising test count while 14 fail is a
credibility risk if anyone clones and runs `pnpm test`.

11 of the 14 failures are in `providers/{stripe,razorpay}.test.ts` — **the broken bridges that
`runtime-split.md` Phase 3 deletes**. The other 3 are real `script-loader` failures
("Stripe script loaded but global not available").

**Fix**: either fix the 3 script-loader tests and let Phase 3 remove the other 11, or do Phase 3
first. Do not change the Hero number — 470 is genuine. Consider "470 tests" once green.

---

### M3 — FAQ claims unsupported ops throw `NotSupportedError`; sometimes they `TypeError`

**File**: `content/docs/reference/faq.md:53`

> "It throws a `NotSupportedError`."

True when an adapter *implements* the op group and the capability is false. **False** when the
group is absent entirely — then `paykit.payouts` is `undefined` and you get a `TypeError`
(see C3). The optional-group gating in `client.ts:303-344` only attaches `subscriptions`/`payouts`
when both the flag **and** the implementation exist.

**Fix**: document that optional groups are `undefined` when unsupported, and show the
`if (paykit.payouts)` guard — or make `client.ts` attach always-throwing stubs so the documented
behavior becomes true. (Second option is the better API; needs a core change.)

---

## 🟢 LOW

### L1 — Version drift between plan and package

`.plan/active-sprint.md` says "Current versions: core 0.15.0 | react 1.0.1 | sdk-js 1.0.1".
Actual: **core 0.10.0 | react 1.1.0 | sdk-js 1.1.0**. Not user-facing, but it is how wrong
numbers reach the site.

### L2 — `paykit-js` is mentioned in only 5 doc locations

Despite being a published package (1.1.0) and a required peer of react, it has no install section,
no API page, and no guide. Phase 3 of the split promotes it to the primary browser package — it
needs real documentation.

---

## Recommended fix order

Sequenced so the highest-risk falsehoods go first and nothing depends on the refactor:

**Batch 1 — Safety & correctness (do first, no code changes to packages)**
1. **C1** — rewrite the webhook-verification FAQ answer + PayPal guide warning.
2. **C2** — fix the 9 files with non-compiling React code.
3. **H1** — add `@squaredr/paykit-js` to installation docs.
4. **H2** — correct the PayPal "no separate SDK" claim.

**Batch 2 — Numbers (needs a measurement script)**
5. **H3** — regenerate all bundle sizes on one basis; drop "zero runtime dependencies".
6. **M2** — fix the 3 script-loader tests; decide on Hero number.

**Batch 3 — Needs package source changes**
7. **C3** — set `payouts: false` in Stripe + PayPal adapters; fix matrix snippet.
8. **M1** — make CapabilityMatrix read from source.
9. **M3** — document optional-group `undefined` behavior (or add throwing stubs).
10. **L1/L2** — reconcile versions; document `paykit-js`.

Batches 1–2 are pure website work and safe to do immediately.
Batch 3 touches `packages/core/src/`, so per Rule M2 it needs a patch bump, and per Rule M16 one
item at a time.

---

## Things that are correct — do not "fix"

Verified accurate, listed so they are not churned:

- ✅ **"25+ providers planned"** with Shipped(3)/Planned(5) split — `Providers/index.tsx:51`. Honest.
- ✅ **19 unified error codes** — matches `ERROR_SUGGESTIONS` exactly.
- ✅ **22 webhook event types** — matches `WEBHOOK_EVENTS` exactly.
- ✅ **13 capability flags** — matches `ProviderCapabilities` exactly.
- ✅ **"Stripe, Razorpay, PayPal"** everywhere — never overclaims shipped adapters.
- ✅ **`charge.clientSecret`** exists on `UnifiedCharge` (`types/charge.ts:51`).
- ✅ **`StripeClientAdapter(publishableKey)`** takes a plain string — matches `stripe-hosted.ts:75`.
- ✅ **Architecture table** in `docs/index.md` correctly describes all three packages.
- ✅ **Node >= 20** — matches `engines`.
- ✅ **Server/client entry separation** — real, via subpath exports.

---

## Verification commands

```bash
# Error codes / events / capability flags
grep -c "^  [a-z_]*:" packages/core/src/types/error.ts        # 19
grep -c "^  [A-Z_]*:" packages/core/src/types/webhook.ts      # 22
grep -c "^  [a-z]" packages/core/src/capabilities.ts          # 13

# Tests
cd packages/core && npx vitest run      # 402 pass
cd packages/sdk-js && npx vitest run    # 14 FAIL / 35 pass
cd packages/react && npx vitest run     # 19 pass

# Bundle sizes (one basis, minified)
npx esbuild packages/core/dist/index.js --minify --bundle --format=esm \
  --platform=neutral --external:stripe --external:razorpay \
  --external:@paypal/paypal-server-sdk | wc -c

# Payouts reality check
grep -rn "PayoutOperations" packages/core/src/   # interface + optional field only
```
