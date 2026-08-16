# Month 12 — May 2027

> **Theme:** 2.0 preview, year in review, Year 2 planning, celebration
> **Publish cadence:** Weekly on Sundays
> **Starting version:** 1.15.0
> **Target version:** 2.0.0-preview.1

---

## Week 1 (May 2 – May 8) → Publish Sunday May 8

**Tasks:**
- 2.0 design documents:
  - `docs/v2/breaking-changes.md` — audit entire public API, propose changes with rationale + migration path
  - `docs/v2/plugin-system.md` — plugin architecture (middleware, logging, metrics, caching, rate limiting)
  - `docs/v2/provider-extensions.md` — type-safe provider-specific features (Stripe Connect, Razorpay Route, Klarna BNPL)
- 2.0 implementation — Plugin system:
  - `PayKitPlugin` interface: `onBeforeRequest`, `onAfterResponse`, `onError`, `onCharge`, `onRefund`, `onWebhook`
  - `paykit.use(plugin)` registration
  - Built-in `loggingPlugin()` example
- 2.0 implementation — Rate limiting plugin:
  - `rateLimitPlugin({ maxRequests, windowMs })` — token bucket, per-adapter
  - `RateLimitError` extends `PaymentError`
- 2.0 implementation — Caching plugin:
  - `cachingPlugin({ ttl })` — in-memory LRU for retrieve operations
  - Invalidates on write operations
- 2.0 implementation — Metrics plugin:
  - `metricsPlugin({ onMetric })` — request count, success/failure rate, avg/P95 latency

**Bump:** 1.15.0 → **1.16.0**

---

## Week 2 (May 9 – May 15) → Publish Sunday May 15

**Tasks:**
- 2.0 implementation — Provider extensions (Stripe):
  - `adapter.extensions` property on `StripeAdapter`
  - `extensions.createTransfer()`, `extensions.createConnectAccount()`, `extensions.listPaymentMethods()`
- 2.0 implementation — Provider extensions (Razorpay):
  - `extensions.createRoute()` (marketplace splits)
  - `extensions.createVirtualAccount()`, `extensions.createQRCode()`
- 2.0 implementation — Multi-tenant support:
  - `PayKit.forTenant(tenantId, config)` — isolated instance with tenant-specific credentials
  - `tenantId` in `_meta` on all responses
- 2.0 preview release:
  - Create `2.0-preview` branch, cherry-pick all 2.0 features
  - `docs/v2/migration-guide.md` — all breaking changes with before/after code
  - Tag as `2.0.0-preview.1`

**Bump:** **2.0.0-preview.1** (prerelease)

---

## Week 3 (May 16 – May 22) → No publish (planning + feedback week)

**Tasks:**
- Blog: "PayKit Year in Review" (finalize + publish with final metrics)
- Blog: "PayKit 2.0 Preview: Plugins, Extensions, Multi-Tenant"
- HN + Reddit announcements for 2.0 preview
- 2.0 preview feedback collection + critical fixes (preview.2/3 if needed)
- Year 2 planning:
  - `docs/year-2/adapter-roadmap.md` — dLocal, Xendit, Midtrans, PayFast, Plaid, etc.
  - `docs/year-2/feature-roadmap.md` — fraud detection, dispute management, invoices, metered billing
  - `docs/year-2/growth-analysis.md` — Year 1 adoption and community growth review

**No version bump** — planning + content week

---

## Week 4 (May 23 – May 31) → Publish Sunday May 30

**Tasks:**
- Audits:
  - Documentation completeness audit (`docs/audit/docs-completeness.md`)
  - Test coverage review (`docs/audit/test-coverage.md`)
  - Bundle size review with `size-limit` (`docs/audit/bundle-sizes.md`)
  - SEO audit for squaredr.tech (meta tags, structured data, sitemap)
  - Lighthouse performance audit (target: 90+ across all scores)
- Final polish:
  - E4.07 — "Used by" / "Trusted by" section update with real users
  - Final README overhaul for all packages (accurate counts, badges, examples)
  - Dependency update sweep (`pnpm update -r`)
- 1.x LTS designation:
  - `docs/v1/lts-policy.md` — security fixes 12 months, critical bugs 6 months
  - Tag latest 1.x as LTS
- Year 1 wrap-up:
  - `docs/year-2/master-backlog.md` — seed for Month 13+ planning
  - `docs/year-1-summary.md` — total publishes, version progression, all 26 adapters, downloads, stars

**Bump:** patch → **1.17.x** (final 1.x release)

---

## Month 12 Summary

| Metric | Target |
|--------|--------|
| npm publishes | 3 |
| Version range | 1.15.0 → 1.17.x + 2.0.0-preview.1 |
| New adapters | 0 (all 26 complete — focus on 2.0) |
| 2.0 features | Plugin system (4 plugins), provider extensions (Stripe, Razorpay), multi-tenant |
| Blog posts | 2 (year in review, 2.0 preview) |
| Planning | Year 2 adapter roadmap, feature roadmap, growth analysis, master backlog |
| Audits | Docs completeness, test coverage, bundle sizes, SEO, performance |
| Infrastructure | LTS designation, dependency updates |
| **Milestone** | **Year 1 complete — 2.0 preview shipped — Year 2 planned** |

---

## Year 1 Cumulative Stats (Target)

| Metric | Total |
|--------|-------|
| npm publishes | ~48 (weekly) |
| Adapters shipped | 26 |
| Version range | 0.6.0 → 1.17.x + 2.0.0-preview |
| Blog posts | ~24 (biweekly) |
| Docs pages | ~35 |
| React components | 8 |
| JS SDK bridges | 3 |
| Plugins | 4 (logging, rate limit, cache, metrics) |
| Infrastructure | CI/CD, Changesets, pnpm, Vercel Analytics, GitHub Sponsors |
| Community | Discord, CONTRIBUTING.md, issue templates, conformance suite |
| Funding | GitHub Sponsors, community contributions |
