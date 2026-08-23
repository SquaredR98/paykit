# Daily Shipping Cadence

> **Effective**: August 23, 2026
> **End date**: December 31, 2026 (~130 working days)
> **Goal**: Every day produces a meaningful commit + npm publish

---

## Rules

### 1. Every day ships something

Each day has at least one concrete deliverable:
- A bug fix (patch bump)
- A backlog item (patch or minor bump)
- An adapter milestone (part of weekly adapter work)
- A docs/blog update (website deploy)

### 2. Adapter weeks

One new adapter every 1-2 weeks. Adapter work spans multiple days:
- **Day 1**: Scaffold adapter, auth, types
- **Day 2**: Core operations (charges.create, charges.retrieve, charges.list)
- **Day 3**: Refunds, customers
- **Day 4**: Subscriptions, webhooks
- **Day 5**: Tests, edge cases, mapper hardening
- **Day 6**: Docs page, website update, README
- **Day 7**: Version bump, publish, changelog

During adapter weeks, the daily bug fix still ships alongside adapter work.

### 3. Version bumping

- **patch**: bug fixes, type additions, mapper improvements, docs
- **minor**: new adapter, new feature (retry, hooks, etc.), new exports
- **major**: breaking changes (avoid unless necessary)

Bump in the relevant `package.json` immediately after the code change. Don't batch.

### 4. npm publish

After each version bump:
```bash
pnpm --filter @squaredr/paykit publish --access public --no-git-checks
pnpm --filter @squaredr/paykit-js publish --access public --no-git-checks
pnpm --filter @squaredr/paykit-react publish --access public --no-git-checks
```
Only publish packages that actually changed.

### 5. Commit messages

Format: `type: description`
- `fix:` — bug fix (patch)
- `feat:` — new feature or adapter (minor)
- `chore:` — tooling, deps, docs, tests (no bump usually)
- `refactor:` — code restructuring (patch if behavior unchanged)

**Never include Co-Authored-By.**

---

## Schedule Structure

### Phase 1 Block (Website Completion)
> No npm publishes during this phase — website-only work

| Day | Deliverable |
|-----|-------------|
| TBD | Phase 10a: `/docs/api-explorer` |
| TBD | Phase 10b: `/docs/capabilities` |
| TBD | Phase 11: Responsive audit |
| TBD | Phase 11: a11y audit |
| TBD | Phase 11: Performance audit |
| TBD | Phase 11: Cross-browser testing |
| TBD | Fix remaining known issues |

### Phase 2 Block (Deep Audit)
> Produces issue list, no npm publishes yet

| Day | Deliverable |
|-----|-------------|
| TBD | Audit: core types + client |
| TBD | Audit: Stripe adapter |
| TBD | Audit: Razorpay adapter |
| TBD | Audit: PayPal adapter |
| TBD | Audit: SDK-JS bridges |
| TBD | Audit: React package |
| TBD | Adapter research (hard-to-integrate providers) |
| TBD | Restructure backlog into daily schedule |

### Phase 3 Block (Daily Shipping)
> Every day: commit + npm publish
> Every 1-2 weeks: new adapter

Schedule to be filled after Phase 2 audit produces the issue list. The daily schedule will interleave:
- Audit findings (bug fixes)
- Backlog items (categories A-F)
- Adapter builds (1 per 1-2 weeks)
- Docs and blog as needed

---

## Tracking

Progress is tracked in:
- `active-sprint.md` — current sprint items with `[x]`/`[ ]` checkboxes
- `backlog.md` — master item list with completion status
- `current-priorities.md` — phase-level status
- Git log — daily commits as proof of shipping

At the end of each week, update `active-sprint.md` with what shipped and what's next.
