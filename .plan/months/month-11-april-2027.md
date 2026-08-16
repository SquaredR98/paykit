# Month 11 — April 2027

> **Theme:** Infrastructure hardening, advanced routing, performance optimization, community growth
> **Publish cadence:** Weekly on Sundays
> **Starting version:** 1.12.0
> **Target version:** 1.15.0

---

## Week 1 (Apr 4 – Apr 10) → Publish Sunday Apr 10

**Tasks:**
- F.15 — pnpm workspace migration:
  - Create `pnpm-workspace.yaml`, update all scripts + CI workflows
  - Verify all packages build, tests pass, subpath exports resolve
- F.03 — Changesets for version management:
  - Set up `@changesets/cli`, access `public`, baseBranch `main`
  - CI: bot comments version preview on PRs, "Version Packages" PR on merge
- F.02 — Automated npm publish on `v*` tags:
  - GitHub Actions workflow using `pnpm publish -r --access public`
- A3.08 — Currency data subpath export:
  - `@squaredr/paykit/currencies` — ISO 4217 codes, symbols, names, decimal places, countries
  - Tree-shakeable, add subpath to package.json
- A4.02 + A4.03 — Region + paymentMethod routing:
  - `{ region: 'EU', adapter: adyen }` route matching
  - `{ paymentMethod: 'upi', adapter: razorpay }` route matching
- A4.04 + A4.05 — `router.listAdapters()` + `onRoute` callback:
  - `listAdapters()` → array of route configs
  - `onRoute: (decision) => void` for analytics/logging

**Bump:** 1.12.0 → **1.13.0**

---

## Week 2 (Apr 11 – Apr 17) → Publish Sunday Apr 17

**Tasks:**
- A7.07 + A7.08 — pino + winston logger adapters:
  - `pinoLogger` + `winstonLogger` implementing `PayKitLogger` interface
  - Optional subpath exports from `@squaredr/paykit/logging`
- C2.02 + C2.03 — Headless Stripe + Razorpay tokenization:
  - Headless `confirmPayment` without mounted Elements
  - `tokenize()` for Razorpay tokens API
- C2.08 — `bridge.getPaymentMethod()`:
  - Returns current payment method type: `'card'`, `'upi'`, `'wallet'`, etc.
- C2.11 — UPI intent support in RazorpayProviderBridge:
  - `initiateUPI(vpa)` method, polling for confirmation
- Performance optimization — Tree-shaking audit:
  - Verify per-adapter imports don't pull in other adapters
  - Fix any barrel export issues
- Performance optimization — Lazy adapter loading:
  - `createLazyAdapter(importFn)` utility for deferred module loading
- Performance optimization — HTTP client audit:
  - Connection reuse, request timeouts, abort controllers
  - Add `timeout` option to adapter constructor

**Bump:** 1.13.0 → **1.14.0**, sdk-js → **2.4.0**

---

## Week 3 (Apr 18 – Apr 24) → Publish Sunday Apr 24

**Tasks:**
- Community contribution support:
  - `.github/ISSUE_TEMPLATE/bug_report.md` + `feature_request.md`
  - `.github/PULL_REQUEST_TEMPLATE.md` with checklist
  - "Good first issue" labels on 5-10 issues, "Help Wanted" in README
  - "Your First PR" section in CONTRIBUTING.md
- C2.15 — iframe security headers config:
  - `securityHeaders` option for `PayKit.createCheckout()` and provider bridges
  - Recommended CSP headers for Stripe, Razorpay, PayPal
- D.09 — Comprehensive currency utility edge case tests
- Security audit:
  - `npm audit`, no secrets in source, constant-time webhook comparison, built-in crypto only
  - Document findings in `docs/security-audit-month-11.md`

**Bump:** 1.14.0 → **1.14.1** (patch)

---

## Week 4 (Apr 25 – Apr 30) — Content + infra week

**Tasks:**
- Blog: "PayKit Year in Review: Downloads, Growth, Lessons" (draft)
- Blog: "PayKit 2.0 Roadmap: What's Next"
- E1.06 + E1.07 — Square + Adyen adapter guides
- E4.03 — Provider comparison matrix update (all 26 adapters, new columns)
- G.09 — Collect + display OSS user testimonials
- F.04 — Vercel Analytics on squaredr.tech
- F.05 — npm download tracking dashboard (GitHub Action, weekly stats)

**No version bump** — content + infra week

---

## Month 11 Summary

| Metric | Target |
|--------|--------|
| npm publishes | 3 |
| Version range | 1.12.0 → 1.15.0 |
| New adapters | 0 (all 26 complete — focus on polish) |
| Infrastructure | pnpm migration, Changesets, automated publish, Vercel Analytics, download tracking |
| Core features | Currency data export, region/paymentMethod routing, lazy adapters, logger adapters |
| JS SDK | Headless mode, tokenization, UPI intent, getPaymentMethod, security headers |
| Performance | Tree-shaking audit, lazy loading, HTTP optimization |
| Community | Issue templates, PR template, good first issues, testimonials |
| Blog posts | 2 |
| Docs pages | Square guide, Adyen guide, updated comparison matrix |
