# Docs Retheme — Incremental Plan

> **Status**: PLAN — not started.
> **Created**: October 2, 2026
> **Prerequisite**: v2 homepage is live at `/` (commit 94e0c3b); docs still on v1 in `app/(old)/docs/`.
> **Constraint**: the user needs to start SDK gap-fix work, so this must proceed in small
> independently-shippable steps, never leaving docs broken between sessions.

---

## 1. Why this cannot be a simple move

`@reference` is **compile-time only**. It tells Tailwind which theme to resolve `@apply` against;
it does **not** emit the tokens. All ten `components/docs/*` stylesheets reference
`app/globals.css` (v1 Blueprint), and that file is imported only by `app/(old)/layout.tsx`.

So the moment a docs route moves into `(main)`, its CSS still *compiles* but every
`var(--surface-page)`, `var(--type-body-sm)` etc. resolves to nothing at runtime — unstyled docs.

A first attempt at "move the shell first, convert content later" was reverted for exactly this
reason. There is no halfway state for a single page: a page is either fully converted or left
in `(old)`.

**But individual pages can move independently.** That is what makes this incremental.

---

## 2. What makes per-page migration safe

Verified October 2, 2026:

| Route | Components it needs |
|-------|---------------------|
| `/docs/capabilities` | `CapabilityMatrix` only |
| `/docs/api-explorer` | `ApiExplorer` only |
| `/docs/[[...slug]]` | `ArchitectureDiagram`, `DocsCodeBlock`, `DocsPagination`, `DocsToc`, `docs-nav`, `docs-prose` |

The two secondary routes need **one component each**. The catch-all generates its params from MDX
content only (`source.generateParams()`), so the two static routes take precedence and do not
collide with it — they can live in a different route group from the catch-all while it is still
on v1.

Both groups may hold `/docs/*` routes at once, as long as no two resolve the *same* path.
`(main)/docs/layout.tsx` and `(old)/docs/layout.tsx` are separate layouts for separate pages.

---

## 3. Token mapping (done once, used by every step)

Measured from `components/docs/`: 33 distinct v1 tokens, mostly from a few families.

### Type — the only non-mechanical part

v1's `--type-*` are CSS `font` **shorthands** (`font: weight size/leading family`). v2 has no
shorthand equivalent, so each becomes separate utilities:

| v1 | v2 |
|----|-----|
| `--type-display-1` | `font-pk-heading text-pk-4xl font-bold tracking-pk-heading` |
| `--type-display-2` | `font-pk-heading text-pk-3xl font-semibold` |
| `--type-body-lg` | `text-pk-lg` |
| `--type-body` | `text-pk-base` |
| `--type-body-sm` | `text-pk-sm` |
| `--type-label` | `text-pk-sm font-medium` |
| `--type-eyebrow` | `font-pk-mono text-xs font-semibold` |
| `--type-code` | `font-pk-code text-pk-sm` |
| `--type-code-sm` | `font-pk-code text-xs` |

### Everything else — mechanical

| v1 | v2 |
|----|-----|
| `--surface-page` / `-card` / `-sunken` / `-accent-soft` | `bg-pk-page` / `bg-pk-card` / `bg-pk-sunken` / `bg-pk-accent-soft` |
| `--border-default` / `--border-hairline` | `border-pk-border` / `border-pk-border-hairline` |
| `--text-strong` / `--text-subtle` / `--text-ok` | `text-pk-strong` / `text-pk-meta` / `text-pk-ok` |
| `--space-3/4/6/8` | `gap-3` / `p-4` / `gap-6` / `mt-8` — **identical 4px scale, same numbers** |
| `--control-h-md` (36px) | `h-9` |
| `--ring-focus` | `ring-2 ring-(--accent-ring)` |
| `--marker-accent` | `inset 2px 0 0 var(--accent)` |
| `--transition-control` | `transition-colors duration-150` |
| `--blue-500` | `--cyan-500` (v2's accent) |
| `--sidebar-w` 264px | `--docs-sidebar` 256px |
| `--onpage-w` 220px | `--docs-toc` 224px |

---

## 4. Steps — each one ships green

Every step ends with `tsc` clean, both audit scripts passing, and **every docs URL working**.
Stop after any step; nothing is left half-done.

### Step 1 — Shell docs variant (no routes move)
Add `variant="docs"` to `Shell`, `wide` to `GlassPanel`, and the docs header (search pill,
version pill, route-aware nav). Add `--container-docs`, `--docs-sidebar`, `--docs-toc`,
`--docs-prose` tokens. **Nothing consumes it yet**, so docs are untouched and the homepage is
unaffected.

⚠️ When adding any `.css` file under `app/(main)/`, the `@source` glob must be
`"./**/*.{tsx,css}"` — it is currently `.tsx` only. A `.css` file that is not scanned makes
`globals.css` fail to parse, which removes **every** utility and breaks unrelated pages with a
confusing "unknown utility class" error. This is what broke the first attempt.

### Step 2 — `/docs/capabilities` (smallest real page)
Convert `CapabilityMatrix/styles.css` (91 lines), move the route to `(main)/docs/capabilities/`,
add `(main)/docs/layout.tsx` with the three-column grid. The other two routes stay in `(old)`
with their existing layout.

Also fixes audit finding M1 while here: the matrix hardcodes all 13 capability flags × 3
providers instead of reading them from the adapters (violates Rule M3), and is currently
propagating the `payouts: true` error.

### Step 3 — `/docs/api-explorer`
Convert `ApiExplorer/styles.css` (120 lines) and move the route. Still one component.

### Step 4 — Sidebar + TOC
Convert `DocsSidebar` (39), `DocsToc` (27), `DocsMobileSidebar` (18) to the kit's rails: 1px rail
with a cyan active segment, `fn`/`new` pills on API items, help card under the TOC. These are
shared by both layouts, so they must work under v1 and v2 simultaneously — convert them to v2 and
have `(old)`'s layout keep the old copies until step 5 retires them.

### Step 5 — `/docs/[[...slug]]` (the big one)
Convert `docs-prose.css` (156), `architecture-diagram.css` (52), `DocsPagination` (35), move the
catch-all. At this point `(old)/docs/` is empty and its layout, `DocsTopBar` (52 lines, replaced
by the shell header) and `docs-shell.css` (22) are deleted.

### Step 6 — Retire v1 entirely
`components/layout/old/` finally goes: its `ThemeToggle` was the last docs dependency. Then
`app/(old)/` holds only blog, changelog, contact and demo — which the blog migration and a later
pass handle.

---

## 5. Deliberately out of scope

- **⌘K search.** The kit shows a search pill, but there is no search backend in this app — no
  `fumadocs-core/search` route and no index. Building one is a feature, not a retheme. Until then
  the pill links to `/docs` and carries no ⌘K hint, so it does not promise a shortcut that is not
  bound.
- **Content fixes from the claims audit** (C1 webhook security, C2 non-compiling React code, H1
  missing package, H2 PayPal SDK). Those are MDX edits, independent of styling, and should be a
  separate pass so a styling regression and a content fix never share a commit.

---

## 6. Order relative to other work

The user is starting SDK gap-fix work. This plan is designed to be picked up and put down between
those sessions — each step is an hour or two and leaves the site shippable.

1. **Docs steps 1-6** as time allows, interleaved with SDK work.
2. Blog migration.
3. `runtime-split.md`.
4. **`SITE_URL` extraction + `redirects()` LAST.**

> **The domain work goes at the very end — decided by the user, do not reorder it.**
> The reasoning is not about effort: changing the canonical domain while the site is
> mid-transition means a redirect and a half-migrated site are live at the same time, and any
> problem then has two possible causes instead of one. The site must be fully on v2, with the
> blog moved, before the domain moves. Earlier versions of these plans argued for doing it first
> because it is cheap and unblocks DNS — that argument is overruled.
