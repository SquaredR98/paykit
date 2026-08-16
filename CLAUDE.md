# PayKit Monorepo — Development Rules

@AGENTS.md

## Monorepo Structure

```
paykit/
├── packages/
│   ├── core          @squaredr/paykit         — unified payment types, client, router, errors
│   ├── sdk-js        @squaredr/paykit-js      — browser/server JS helpers
│   └── react         @squaredr/paykit-react   — React hooks & components
├── website/          @squaredr/paykit-website  — Next.js 16 docs + marketing site (CLAUDE.md inside)
├── .plan/
│   ├── shipping-schedule.md   — 11-week adapter rollout timeline
│   ├── backlog.md             — full development backlog (285 items, categories A–G)
│   ├── active-sprint.md       — CURRENT WORK: Month 3 Weeks 1-3 (read at every session start)
│   ├── website.md             — website development plan (phases 1–6)
│   └── months/                — month-by-month shipping plans (month-01 through month-12)
├── turbo.json
├── biome.json
└── package.json      npm workspaces root
```

## External References

- **Design system**: `A:\products\payments\design-system\` — Blueprint design system (tokens, components, UI kits)
- **Website plan**: `.plan/website.md` — phased website build plan referencing the design system
- **Shipping plans**: `.plan/months/` — monthly development schedules
- **Active sprint**: `.plan/active-sprint.md` — **CURRENT WORK** — Month 3 Weeks 1-3 implementation plan (retry logic, structured logging, 53 bug fixes across all adapters). Read this file at every session start to resume work without losing context.
- **Backlog**: `.plan/backlog.md` — full development backlog (285 items, categories A–G). Category G contains the cross-adapter bug fix items with severity, file paths, and line numbers.

## Rule M1: Package Boundaries

| Package | Can depend on | Cannot depend on |
|---------|---------------|------------------|
| core | nothing (zero deps) | sdk-js, react, website |
| sdk-js | core | react, website |
| react | core | sdk-js, website |
| website | core, react | sdk-js (unless needed) |

Core has **zero UI dependencies**. It is framework-agnostic. React depends only on core. Website depends on core + react for live demos.

## Rule M2: Version Bumping

After any source code change under `packages/*/src/`:
- **patch** for bug fixes
- **minor** for new features (new exports, new adapter capabilities)
- **major** for breaking changes (type signature changes, removed exports)

Bump version in the relevant `package.json` before committing. Use changesets for coordinated releases.

## Rule M3: Source of Truth for Numbers

When referencing counts in docs, READMEs, or comments — always count from source:
- **Adapter count**: count files in `packages/core/src/adapters/`
- **Test count**: run `npm test` and read the total
- **Capability flags**: count fields in `ProviderCapabilities` interface
- **Error codes**: count entries in `ERROR_SUGGESTIONS` map

Never hardcode stale numbers. Always verify from code.

## Rule M4: CSS Class Naming

All custom CSS classes use the `pk-` prefix:
- `.pk-grid-bg`, `.pk-eyebrow`, `.pk-section`, `.pk-container`
- Component-scoped: `.pk-nav__link`, `.pk-docs__sidebar`
- State: `.pk-option-active`, `.pk-error-bg`

This mirrors the `fc-` convention in FieldCraft. Never use unprefixed custom class names.

## Rule M5: Design System (Blueprint)

The website uses the Blueprint design system at `A:\products\payments\design-system\`. Key constraints:

- **Dark by default** — `--surface-page: var(--slate-900)`. Docs pages use light theme.
- **Zero border-radius** — all `--radius-*` tokens are `0px`. Structure comes from 1px hairlines, never corners.
- **No shadows** — borders carry all structure. No `box-shadow` anywhere.
- **One accent color** — electric blue hue 258. No other accent colors.
- **4px spacing grid** — use `--space-*` tokens, never arbitrary pixel values.
- **Three fonts**: Space Grotesk (display/headlines), Instrument Sans (body/UI), JetBrains Mono (code/amounts).
- **Token files** live in `design-system/tokens/` (colors, typography, spacing, motion, elevation, code).
- **UI kits** in `design-system/ui_kits/` (marketing, docs, dashboard, checkout) are HTML mockups showing expected layouts.

Never invent colors, fonts, spacing, or radii. Always use tokens from the design system.

## Rule M6: Build Verification

Before committing:
1. `npm run build` must pass (all packages + website)
2. `npm test` must pass (all test suites)

Do not commit broken builds.

## Rule M7: Website Architecture

The website follows a strict 3-layer component system (see `website/CLAUDE.md` for full rules):
- **Layer 1 (Components)**: Small UI pieces, all data via props
- **Layer 2 (Views)**: Assemble components, one view per route
- **Layer 3 (page.tsx)**: Thin Next.js route file, calls exactly one view

See `.plan/website.md` for the phased build plan.

## Rule M8: No Co-Authored-By

Never add `Co-Authored-By` lines to commit messages.

## Rule M9: No Parallel Agents

Never spawn parallel agents. Always run them one at a time, sequentially. Wait for each to complete before starting the next.

## Rule M10: Blog

Publish blog posts only on squaredr.tech. No cross-posting to third-party platforms.

## Rule M11: Publish Cadence

npm publishes happen weekly on Sundays. Consolidate work into a single version bump per week.

## Rule M12: Package Manager

This repo uses **npm** workspaces (not pnpm, not yarn). Use `npm install`, `npm run build`, `npm test`.

## Rule M13: Session Start & Context Recovery

At the start of every session (including after context exhaustion), do the following before any work:
1. Read this `CLAUDE.md` file
2. Read `.plan/active-sprint.md` — this is the current implementation plan with progress checkboxes
3. Check which items are marked `[x]` (done) vs `[ ]` (pending) to understand where you left off
4. Resume from the first unchecked item — do NOT restart from scratch
5. Never assume rules or progress from memory — always verify from the plan files

## Rule M14: Document First, Then Implement

When making bulk changes across multiple files:
1. Create implementation plan documents first.
2. Wait for user review/approval before implementing.
3. Do NOT move to the next section without explicit user confirmation.

## Rule M15: Next.js 15+ Async APIs

The website uses Next.js 16. In Next.js 15+, `params` and `searchParams` are Promises and must be awaited. Never access `params.slug` directly — always `const { slug } = await params`.

## Rule M16: Incremental Execution

When implementing items from the active sprint plan, complete ONE item at a time. After finishing each item:
1. Mark it as `[x]` in `active-sprint.md`
2. Inform the user what was completed
3. **STOP and wait** for the user's explicit green signal before starting the next item

Never batch multiple items. Never proceed to the next item without user approval.

## Checklist — Before Every Commit

- [ ] Version bumped in affected package(s)
- [ ] `npm run build` passes
- [ ] `npm test` passes
- [ ] No hardcoded stale numbers in docs
- [ ] CSS classes use `pk-` prefix
- [ ] No `Co-Authored-By` in commit message
