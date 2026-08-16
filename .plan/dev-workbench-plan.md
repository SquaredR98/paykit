# Dev Workbench Page — Implementation Plan

> **Status**: IN PROGRESS
> **Started**: August 14, 2026

## Context

Weeks 1-3 of the Month 3 sprint are complete (retry, logging, hooks, 60 bug fixes). The developer needs an interactive dev-only page in the website where they can inspect and test all PayKit features in one place — adapters, operations, retry logic, logging, hooks, currency utilities — without reading source code. This page is gated to `NODE_ENV === 'development'` only.

The website is a Next.js 16 app with a custom "Blueprint" design system (OKLCH colors, `pk-` prefixed classes, 0px radii, hairline borders). Server actions already exist for creating test payments via PayKit adapters (`app/actions/demo-payment.ts`). Env vars for all 3 providers are configured.

---

## Architecture

**Route**: `/dev/workbench` — a standalone route group `(dev)` outside `(marketing)`, with its own minimal layout (no marketing Nav/Footer, just a simple dev header).

**Dev gate**: The `(dev)/layout.tsx` checks `process.env.NODE_ENV !== 'development'` and calls `notFound()` — the entire route group vanishes in production.

**Pattern**: Server actions handle all PayKit adapter operations (they need secret keys). Client components handle the interactive UI. Each workbench section is a self-contained client component that calls server actions and displays results.

**Response viewer**: A reusable `<ResponseViewer>` component renders any JSON response in the `pk-term` code frame style, with tabs for "Unified" (the mapped response) and "Raw" (`_raw` provider response) and "Meta" (`_meta` instrumentation data).

---

## File Structure

```
website/
├── app/
│   └── (dev)/
│       ├── layout.tsx              ← Dev gate + minimal layout
│       └── workbench/
│           └── page.tsx            ← Workbench page (server component)
├── components/
│   └── workbench/
│       ├── WorkbenchShell.tsx      ← Client shell with sidebar nav + section rendering
│       ├── Section.tsx             ← Collapsible section wrapper
│       ├── ResponseViewer.tsx      ← JSON response viewer (pk-term style)
│       ├── FieldRow.tsx            ← Label + input row for forms
│       ├── StatusBadge.tsx         ← Status indicator badge (pk-bdg)
│       ├── sections/
│       │   ├── ProviderStatus.tsx  ← Provider dashboard
│       │   ├── ChargesSection.tsx  ← Charges CRUD
│       │   ├── RefundsSection.tsx  ← Refunds CRUD
│       │   ├── CustomersSection.tsx← Customers CRUD
│       │   ├── SubscriptionsSection.tsx ← Subscriptions CRUD
│       │   ├── CurrencyTools.tsx   ← Currency converter + info
│       │   ├── RetryInspector.tsx  ← Retry & logging inspector
│       │   └── ErrorCatalog.tsx    ← Error code reference
│       └── workbench.css           ← Workbench-specific styles
└── app/
    └── actions/
        └── workbench.ts            ← Server actions for all workbench operations
```

---

## Files to Create

### 1. `app/actions/workbench.ts` — Server Actions

All PayKit operations the workbench needs, executed server-side:

```
'use server'
- getProviderStatuses() → for each provider (stripe/razorpay/paypal):
    - Check if env vars are configured
    - If yes: instantiate adapter, call healthCheck(), return capabilities + health
    - Returns: { provider, configured, health?, capabilities?, error? }[]

- executeOperation(provider, resource, operation, params) → generic executor:
    - Instantiates the correct adapter based on provider
    - Calls the operation (e.g. charges.create, refunds.list)
    - Returns the full unified response as serializable JSON (including _meta, _raw)
    - Catches PaymentError and returns structured error info

- getCurrencyInfo(code) → returns currency info from PayKit's getCurrencyInfo()
- convertCurrency(amount, currency, direction) → toSmallestUnit / fromSmallestUnit
- getErrorCatalog() → returns all PaymentErrorCode values with ERROR_SUGGESTIONS
```

Reuses existing patterns from `app/actions/demo-payment.ts`: StripeAdapter, RazorpayAdapter, PayPalAdapter imports, env var reading, adapter initialization.

### 2. `app/(dev)/layout.tsx` — Dev Gate Layout

- Checks `process.env.NODE_ENV !== 'development'` and calls `notFound()`
- Simple header: "PayKit Dev Workbench" with link back to home
- Uses `pk-frame` layout wrapper
- No marketing Nav/Footer

### 3. `app/(dev)/workbench/page.tsx` — Page Entry

Server component that renders `<WorkbenchShell />` and passes initial provider status data (fetched server-side for instant load).

### 4. `components/workbench/WorkbenchShell.tsx` — Client Shell

`'use client'` — The main layout component:
- Left sidebar with section nav links (sticky)
- Right content area with sections
- Sections are rendered with intersection observer for sidebar active state
- Sections: Providers, Charges, Refunds, Customers, Subscriptions, Currency, Retry, Errors

### 5. `components/workbench/Section.tsx` — Collapsible Section

Reusable wrapper: eyebrow label, title, collapsible body. Uses `pk-blk` and `pk-sechead` patterns.

### 6. `components/workbench/ResponseViewer.tsx` — JSON Response Viewer

Renders JSON in `pk-term` code frame with tabs:
- **Result**: The unified response (without `_raw` and `_meta`)
- **Raw**: The `_raw` provider-specific response
- **Meta**: The `_meta` instrumentation data (duration, attempt, requestId)

Pretty-prints with syntax coloring using the existing code token CSS vars.

### 7. `components/workbench/FieldRow.tsx` — Form Input Row

Simple label + input layout for operation parameter forms. Uses existing control height tokens (`--control-h-md`).

### 8. `components/workbench/StatusBadge.tsx` — Status Badge

Renders a `pk-bdg` with color based on status: green for healthy/succeeded, yellow for processing, red for failed.

### 9. Section Components (in `components/workbench/sections/`)

**ProviderStatus.tsx**:
- Cards for Stripe, Razorpay, PayPal
- Each shows: configured (yes/no), health status, latency, capability flags as a grid of `pk-tag` elements
- "Refresh" button to re-check health

**ChargesSection.tsx**:
- Provider selector (dropdown)
- "Create Charge" form: amount, currency, description, metadata
- "Retrieve Charge" input: charge ID
- "List Charges" with limit input
- Results shown in `<ResponseViewer>`

**RefundsSection.tsx**:
- "Create Refund" form: charge ID, amount (optional for full refund)
- "Retrieve / List" inputs
- Results in `<ResponseViewer>`

**CustomersSection.tsx**:
- Create: email, name, metadata
- Retrieve by ID, Update, Delete, List
- Results in `<ResponseViewer>`

**SubscriptionsSection.tsx**:
- Create: customer, amount, currency, interval, intervalCount
- Retrieve, Update, Cancel, List
- Results in `<ResponseViewer>`

**CurrencyTools.tsx**:
- Input: amount + currency code
- Shows: toSmallestUnit result, fromSmallestUnit result, currency info (symbol, decimal places, name)
- Client-side only (imports PayKit currency utils directly — they don't need server)

**RetryInspector.tsx**:
- Configure: retries (0-5), retryDelay (ms), logging level (none/debug/info/warn/error)
- "Trigger Operation" button — fires a charge create via server action with those settings
- Displays the hook callbacks (onRequest, onResponse, onError) in a timeline/log view
- Shows retry attempts, delays, final result

**ErrorCatalog.tsx**:
- Table of all PaymentErrorCode values
- Columns: Code, Description, Suggestion, Retryable?
- Uses `ERROR_SUGGESTIONS` from PayKit core
- Client-side only (static data, imported directly)

### 10. `components/workbench/workbench.css` — Workbench Styles

Minimal additional CSS for:
- Sidebar layout (sticky, 220px width)
- Form grid layout
- Active section indicator
- Timeline/log view for retry inspector

All built on top of existing Blueprint tokens — no new colors, fonts, or design decisions.

---

## Execution Order

1. Server actions (`app/actions/workbench.ts`)
2. Dev layout + page (`app/(dev)/layout.tsx`, `app/(dev)/workbench/page.tsx`)
3. Shared components (`Section`, `ResponseViewer`, `FieldRow`, `StatusBadge`)
4. Workbench CSS (`workbench.css`)
5. Shell component (`WorkbenchShell.tsx`)
6. Section components — one at a time:
   a. ProviderStatus (most foundational — verifies server actions work)
   b. ChargesSection (core operation)
   c. RefundsSection
   d. CustomersSection
   e. SubscriptionsSection
   f. CurrencyTools (client-only, quick)
   g. ErrorCatalog (client-only, quick)
   h. RetryInspector (most complex — last)

---

## Implementation Progress

- [x] Server actions (`app/actions/workbench.ts`)
- [x] Dev layout (`app/(dev)/layout.tsx`)
- [x] Workbench page (`app/(dev)/workbench/page.tsx`)
- [x] Section component
- [x] ResponseViewer component
- [x] FieldRow component
- [x] StatusBadge component
- [x] Workbench CSS
- [x] WorkbenchShell component
- [x] ProviderStatus section
- [x] ChargesSection
- [x] RefundsSection
- [x] CustomersSection
- [x] SubscriptionsSection
- [x] CurrencyTools section
- [x] ErrorCatalog section
- [x] RetryInspector section
- [x] TypeScript compilation: 0 errors
- [ ] Verification: dev server + production gate (manual)

---

## Key Files Referenced

| Existing File | What We Reuse |
|---|---|
| `app/actions/demo-payment.ts` | Adapter instantiation pattern, env var reading |
| `packages/core/src/index.ts` | All PayKit exports: types, utilities, error classes |
| `packages/core/src/debug.ts` | `getProviderInfo()`, `debug()` for provider dashboard |
| `packages/core/src/capabilities.ts` | `ProviderCapabilities` interface (13 flags) |
| `packages/core/src/currency.ts` | `toSmallestUnit`, `fromSmallestUnit`, `getCurrencyInfo`, `formatAmount` |
| `packages/core/src/types/error.ts` | `PaymentErrorCode`, `ERROR_SUGGESTIONS` |
| `packages/core/src/retry.ts` | `withRetry`, `RetryOptions` for retry inspector |
| `app/globals.css` | Blueprint design system — all `pk-*` classes, tokens |
| `components/layout/Nav/index.tsx` | Link patterns for dev header |

---

## Verification

1. `cd website && npm run dev` — page loads at `localhost:3000/dev/workbench`
2. Provider status shows configured/unconfigured providers correctly
3. Create a test charge (Stripe test mode) — see unified + raw response
4. Currency tools work client-side — no server round-trip
5. Error catalog renders all error codes
6. `npm run build` — page does NOT appear in production build (dev gate works)
7. Navigating to `/dev/workbench` in production returns 404
