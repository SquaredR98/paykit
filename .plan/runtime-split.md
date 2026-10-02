# Architecture Plan — Runtime Split (core / js / react)

> **Status**: PLAN — awaiting approval. Nothing implemented yet.
> **Created**: October 1, 2026
> **Rule**: M14 (document first, then implement). Each phase below is gated on explicit user approval per Rule M16.

---

## 1. Goal

Split the packages by **runtime**, not by "backend vs frontend":

| Package | Runtime | Contains |
|---------|---------|----------|
| `@squaredr/paykit` | **Node only** | Types, `PaymentAdapter`, `UnifiedPayments`, routing, retry/logging, server adapters |
| `@squaredr/paykit-js` | **Browser only** | `ClientAdapter` contract + the 3 hosted implementations, `PayKitClient` facade |
| `@squaredr/paykit-react` | **React only** | Thin wrapper over `paykit-js` |

Dependency direction is one-way: `core ← js ← react`. Core never imports DOM types. `paykit-js` never imports React.

---

## 2. Findings that shaped this plan

Verified against source on October 1, 2026 — not assumed.

### 2.1 Adapters do NOT contain React code

**The original premise was wrong.** There are zero React imports anywhere in `packages/core/`.
What lives in `core/src/adapters/*/client/` is **framework-agnostic browser DOM code** —
`loadScript()`, `mount(container: HTMLElement)`, `confirmPayment()`. React exists only in
`packages/react/` (344 lines).

So this is not an "untangle React from adapters" job. It is a "move browser code to the browser
package, and kill the duplicate implementation" job.

### 2.2 The browser code is already near-zero-coupled

`core/src/adapters/*/client/` imports **only** two type files plus its own siblings:

- `../../../types/client-adapter.js`
- `../../../types/appearance.js`

Nothing else from core. This is why the move is mechanical rather than a rewrite.

### 2.3 `PaymentAdapter.client` is dead code

`adapter.ts:147` declares `client?: ClientAdapter`. **No adapter sets it** (verified by grep).
It is the single reason the server-side contract references browser types.

### 2.4 There are two competing browser implementations

| Implementation | Status |
|---|---|
| `core/src/adapters/*/client/*-hosted.ts` | **The good one.** Modern Stripe Payment Element, passes `clientSecret`. |
| `sdk-js/src/providers/*.ts` (bridges) | **Broken.** Core's own source documents why. |

`core/src/adapters/stripe/client/stripe-hosted.ts:16-22` says the bridge
"used the deprecated Card Element and `confirmCardPayment()` which didn't work because it never
passed `clientSecret` to `elements()`."

Yet `sdk-js` ships at 1.1.0 and React is built on it — **React currently sits on the
implementation core calls broken.** Fixing this fork is the main value of this refactor.

### 2.5 `PayKitClient` already supports the target path

`sdk-js/src/client.ts` accepts `{ clientAdapter }` and wraps it in a `ClientAdapterBridge`
shim to fit the legacy `ProviderBridge` interface. So the migration is a **reversal of an
existing adapter layer**, not new work: delete the bridges, make `ClientAdapter` the native
path, drop the shim.

### 2.6 `sdk-js` → `core` dependency is type-only

The only non-type import is `export type { PaymentMethodType }`. There is **no runtime
coupling**, so moving types between the two packages cannot break runtime behavior.

### 2.7 `sdk-js` duplicates core's types instead of re-exporting

`sdk-js/src/types.ts` redeclares `AppearanceConfig`, `ThemeVariables`, `MountOptions`,
`TokenizeResult`, `PaymentConfirmResult`, `ClientEvent*`. These drift already:

- core `MountOptions` has **required** `clientSecret`
- sdk-js `MountOptions` has **no** `clientSecret` at all

That is exactly the bug in 2.4, encoded in the type system. After the split there must be
**one** definition, owned by `paykit-js`.

### 2.8 ⚠️ PayPal secret-leak risk in the browser entry point

`core/src/adapters/paypal/client/paypal-client.ts` is **misfiled**. Despite living under
`client/`, it is a **server-side REST client**: it holds `clientSecret` and uses `Buffer`.

It is currently exported from the **browser** entry `@squaredr/paykit/paypal/client`.
**The public API therefore invites putting a PayPal client secret into browser code.**

Moving the `client/` folder wholesale would carry this flaw into `paykit-js`. It must be
split out — see Phase 4.

---

## 3. Why React stays its own package

Rejecting the "merge react into paykit-js" option, for four reasons:

1. **Don't force React on non-React users.** Vue/Svelte/Angular/vanilla users would install a
   package containing React components and get peer-dep warnings for a framework they don't use.
   That taxes the widest audience.
2. **Independent release cadence.** React 19→20 breaking changes should not force a major bump
   on vanilla users. (react and sdk-js are both coincidentally 1.1.0 today; merging would lock
   their versions together permanently.)
3. **Wrong direction of travel.** `paykit-vue` / `paykit-svelte` are the likely future. Keeping
   `paykit-js` framework-neutral makes every framework wrapper symmetric and cheap (~300 lines,
   same as React today). Burying React inside `paykit-js` makes every other framework
   second-class.
4. **Toolchain.** `paykit-js` is pure TS/DOM with no JSX. React needs JSX transform and
   `"use client"` boundaries. Merging means one package with two toolchain modes, for no gain.

---

## 4. File-level migration map

### Move to `paykit-js` (1,079 lines)

| From | To |
|------|-----|
| `core/src/types/client-adapter.ts` (142) | `sdk-js/src/types/client-adapter.ts` |
| `core/src/adapters/stripe/client/stripe-hosted.ts` (322) | `sdk-js/src/providers/stripe/hosted.ts` |
| `core/src/adapters/stripe/client/index.ts` (1) | `sdk-js/src/providers/stripe/index.ts` |
| `core/src/adapters/razorpay/client/razorpay-hosted.ts` (181) | `sdk-js/src/providers/razorpay/hosted.ts` |
| `core/src/adapters/razorpay/client/index.ts` (1) | `sdk-js/src/providers/razorpay/index.ts` |
| `core/src/adapters/paypal/client/paypal-hosted.ts` (406) | `sdk-js/src/providers/paypal/hosted.ts` |
| `core/src/adapters/paypal/client/index.ts` (5) | `sdk-js/src/providers/paypal/index.ts` |

### Duplicate deliberately (21 lines)

| File | Reason |
|------|--------|
| `core/src/types/appearance.ts` | Keep in core **and** re-export from `paykit-js`. 21 lines of pure types; the server needs it for hosted-checkout params, the browser needs it for theming. Core keeps ownership; `paykit-js` re-exports. |

### Stays in core, but relocated (133 lines)

| From | To | Reason |
|------|-----|--------|
| `core/src/adapters/paypal/client/paypal-client.ts` | `core/src/adapters/paypal/rest-client.ts` | **Server-side**, holds `clientSecret`. Must leave the browser entry point. See 2.8. |

### Delete from `sdk-js` (776 source + 412 test = 1,188 lines)

| File | Lines |
|------|-------|
| `sdk-js/src/providers/stripe.ts` | 207 |
| `sdk-js/src/providers/razorpay.ts` | 199 |
| `sdk-js/src/providers/paypal.ts` | 303 |
| `sdk-js/src/providers/provider-bridge.ts` | 46 |
| `sdk-js/src/providers/registry.ts` | 21 |
| `sdk-js/__tests__/providers/stripe.test.ts` | 232 |
| `sdk-js/__tests__/providers/razorpay.test.ts` | 180 |

⚠️ The 412 test lines must be **ported onto the hosted adapters**, not dropped. Net test
coverage must not decrease.

### Remove from core

- `adapter.ts:147` — `client?: ClientAdapter` field (dead; see 2.3)
- `adapter.ts:19` — its `import type { ClientAdapter }`
- `index.ts:70-81` — the `ClientAdapter`-family type re-exports
- `tsup.config.ts` — 3 `adapters/*/client/index` entries
- `package.json` — 3 `./[provider]/client` export entries

---

## 5. Phased execution

Each phase ends in a green `tsc --noEmit` + `vitest run`. **Stop for approval after each.**

### Phase 1 — Move the contract (non-breaking)
1. Copy `client-adapter.ts` into `sdk-js/src/types/`.
2. `paykit-js` re-exports `AppearanceConfig` / `ThemeVariables` from core.
3. Delete the duplicated type declarations in `sdk-js/src/types.ts` (2.7); re-point to the moved
   contract. **This is where the missing-`clientSecret` drift gets fixed.**
4. Core keeps its copy for now → nothing breaks yet.

### Phase 2 — Move the hosted adapters (non-breaking)
1. Move the 3 `*-hosted.ts` into `sdk-js/src/providers/<name>/hosted.ts`.
2. Add `./stripe` / `./razorpay` / `./paypal` subpath exports to `sdk-js/package.json` + `tsup`.
3. Core's `./[provider]/client` paths become **deprecated shims** that re-export from `paykit-js`.
4. Verify: core still builds; both entry points resolve.

### Phase 3 — Delete the broken bridges (BREAKING — `paykit-js` major)
1. Make `ClientAdapter` the native path in `PayKitClient`; delete `ClientAdapterBridge`.
2. Delete `providers/{stripe,razorpay,paypal,provider-bridge,registry}.ts`.
3. **Port the 412 lines of bridge tests onto the hosted adapters.**
4. Drop `provider` + `publicKey` from `PayKitClientConfig`; `clientAdapter` becomes the only form.
5. Update React's 5 import sites (mostly no-ops — they already import from `@squaredr/paykit-js`).
6. Simplify `PayKitProvider`'s dual legacy/new prop union to the single `clientAdapter` path.

### Phase 4 — Fix the PayPal secret leak (BREAKING — core major)
1. Move `paypal-client.ts` → `core/src/adapters/paypal/rest-client.ts`.
2. Remove it from the `./paypal/client` browser entry.
3. Update `paypal/adapter.ts` import path.

### Phase 5 — Make core Node-only (BREAKING — core major)
1. Remove `client?` from `PaymentAdapter` + its import.
2. Remove `ClientAdapter`-family re-exports from `core/src/index.ts`.
3. Delete `core/src/types/client-adapter.ts` and the 3 `adapters/*/client/` dirs.
4. Remove the 6 client entries from `tsup.config.ts` + `package.json` exports.
5. Confirm: zero DOM references in core. `grep -rn "HTMLElement\|window\|document" packages/core/src/`

### Phase 6 — Docs & rules
1. **Rewrite Rule M1** to state the chain `core ← js ← react` and that react→js is *correct*.
   (Today M1 forbids react→js, but all 5 react files do it — the rule is what's wrong, not the code.)
2. Fix **Rule M12**: repo is **pnpm**, not npm (`pnpm-workspace.yaml`, `pnpm-lock.yaml`,
   `packageManager: pnpm@9.12.0`). The sprint file's own publish command already uses `pnpm --filter`.
3. Reconcile version drift: `active-sprint.md` claims core 0.15.0; `package.json` says **0.10.0**.
4. Migration guide + changesets for the two major bumps.

---

## 6. Breaking-change summary

| Change | Package | Bump |
|--------|---------|------|
| Phases 1–2 | — | none (shims) |
| Bridges deleted, `PayKitClientConfig` narrowed | `paykit-js` | **major** → 2.0.0 |
| `PaymentAdapter.client` removed, client exports dropped | `paykit` | **major** → 1.0.0 |
| Import paths updated | `paykit-react` | minor |

---

## 7. Open questions — ANSWER BEFORE PHASE 3

1. **Does anyone depend on `@squaredr/paykit-js` 1.x's `{ provider, publicKey }` config?**
   It is published at 1.1.0. If yes → Phase 3 needs a compat shim behind the old surface
   instead of a clean delete.
2. **Keep `PayKitClient` as the public browser facade?**
   *Recommendation: yes.* It is the nicer DX surface and React already wires into it.
   The alternative — `ClientAdapter` as the direct public API — is more churn for React.

---

## 8. Deliberately out of scope

Noted so they are not forgotten, but **not** part of this refactor:

- **PayPal hard dependency.** `@paypal/paypal-server-sdk` is in core's `dependencies` while
  Stripe/Razorpay are *optional* `peerDependencies` — every install pulls PayPal's SDK. It is
  also absent from tsup's `external` list. Worth folding in, since Phase 4/5 touches core's deps
  anyway. Raises the larger question of whether providers should be separate packages.
- **Routing applies only to `charges.create`.** A live bug: in multi-provider mode,
  `charges.retrieve(id)` for an INR charge created on Razorpay hits the *default* provider.
  Refunds have no provider resolution at all.
- **Capability detection instantiates uninitialized adapters** (`client.ts:381,421`).
- **Two overlapping routers** with divergent AND/OR match semantics.
- **Hardcoded webhook header mapping**, duplicated in `client.ts:300-311` and
  `payment-router.ts:110-118`.
- **Test gaps**: no tests for `client.ts` (632 lines), the PayPal adapter (668 lines),
  `retry.ts`, `logger.ts`, `payment-router.ts`.
- **"25+ providers"** claimed in package description/README; only 3 adapters exist (violates M3).

---

## 9. Baseline (verified October 1, 2026)

```
core     0.10.0   tsc --noEmit clean   402 tests passing / 11 files
sdk-js   1.1.0
react    1.1.0
```

Any regression from this baseline blocks the next phase.
