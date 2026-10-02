# v2 Marketing — Parallel Setup Plan

> **Status**: PLAN — awaiting approval. Nothing implemented.
> **Created**: October 1, 2026
> **Scope**: Marketing homepage only. Docs later. Blog later. Redirect last.
> **Guiding rule from user**: *"keep the implementation so simple that anybody can understand what is going on"* — and **no spaghetti**: build v2 beside v1, swap one page, then delete v1.

---

## 1. The one idea behind this plan

**v1 and v2 never mix.** They sit in separate folders, and exactly one line decides which one the
site renders.

```
components/homepage/     ← v1 (today's site, untouched)
components/v2/homepage/  ← v2 (new, built fresh)
```

The switch is `app/(marketing)/page.tsx`:

```tsx
// v2 swap: change this one import to go back and forth.
import { HomepageView } from '@/components/v2/homepage/HomepageView';
```

That is the entire mechanism. No feature flags, no env vars, no conditional rendering, no
`if (v2)` branches anywhere. One import line. Anyone can read it and see what is going on.

**When v2 is approved**, delete `components/homepage/` and the v1 layout. Until then v1 still runs
and is a working fallback.

---

## 2. Why not a route like `/v2`

Rejected on purpose. A `/v2` route would need its own layout, get indexed by search engines,
duplicate the metadata and JSON-LD, and then need deleting plus a redirect. The one-import swap
needs none of that, and the page URL never changes.

---

## 2.5 CSS isolation via route groups (supersedes §3.1)

> **Revised October 1, 2026** after the user corrected the approach twice. This section replaces the
> "pass-through layout" idea in §3.1 and the "scope tokens under a `.pk-v2` class" idea.

### The problem with importing v2 tokens globally

`design-system/styles.css` and `app/globals.css` define **52 of the same token names with
incompatible values** — measured, not guessed:

| Token | v1 (Blueprint) | v2 (Glass) |
|-------|----------------|------------|
| `--radius-sm` | `0px` | `6px` |
| `--radius-md` | `0px` | `8px` |
| `--radius-lg` | `0px` | `16px` |
| `--surface-card` | `var(--slate-800)` | `rgb(15 23 42 / .60)` |
| `--text-strong` | `oklch(0.970 0.005 255)` | `var(--zinc-100)` |
| `--border-strong` | `oklch(0.980 0.005 255 / 0.28)` | `var(--zinc-700)` |

v2 also ships global element resets (`*`, `html`, `body`, `a`, `code`) that would restyle v1.

### Why a route-group import alone is not enough

`globals.css` is imported in the **root** `app/layout.tsx:5`, which wraps every route. Route-group
CSS imports **add** to the cascade, they don't replace it. So a v2 group that imports its own tokens
would still load v1's, and v2 would win the 52 collisions only by source order — fragile and exactly
the spaghetti we are avoiding.

### The structure that actually isolates (user's solution)

**Move v1 into an `(old)` group and give it ownership of `globals.css`.** Then v1's stylesheet never
loads on v2 routes at all.

```
app/
├─ layout.tsx          ← ONLY <html>, <body>, RootProvider. No CSS. No fonts.
├─ globals.css         ← stays here as a file; imported by (old), not by root
├─ robots.ts           ← must stay at root (Next requirement)
├─ sitemap.ts          ← must stay at root (Next requirement)
│
├─ (old)/              ← today's site, moved wholesale
│  ├─ layout.tsx       ← imports globals.css + the 3 Blueprint fonts, renders <Nav/><Footer/>
│  ├─ (marketing)/     ← page.tsx, blog, changelog, contact, demo
│  ├─ docs/
│  └─ (dev)/
│
└─ (main)/             ← v2
   ├─ layout.tsx       ← imports styles/v2-tokens.css + Sora/Inter/Fira/JetBrains, renders <Shell/>
   └─ page.tsx         ← the new marketing homepage
```

**Why this is right:**
1. **True isolation.** v1 CSS loads only under `(old)`; v2 CSS only under `(main)`. Zero collisions,
   no `.pk-v2` wrapper class, no source-order luck, no `!important`.
2. **Route groups don't change URLs.** `(old)` and `(main)` are both invisible in the path, so every
   existing URL keeps working while v2 is built.
3. **Fonts get scoped too.** Blueprint's three fonts stop downloading on v2 routes; v2's four stop
   downloading on v1 routes.
4. **Deletion is one `rm -rf`.** When v2 is approved, delete `app/(old)/` and `components/{homepage,layout}/`.
   Nothing to untangle.

**What must stay in the root layout:** `<html>`, `<body>`, and `RootProvider` — Next requires a root
layout with the html/body tags, and the theme provider has to wrap both versions so the toggle works
either side. `robots.ts` and `sitemap.ts` must also stay at root.

**The one conflict to resolve:** both groups would claim `/` (`(old)/(marketing)/page.tsx` and
`(main)/page.tsx`). Next treats that as a duplicate-route error. So during the parallel phase only
**one** group may own `/` — see §6 step 4 for the swap.

---

## 3. Folder layout

```
website/
├─ app/(marketing)/
│  ├─ layout.tsx              ← v1 layout (Nav + Footer)
│  ├─ layout-v2.tsx.unused    ✗ NO — see §3.1
│  └─ page.tsx                ← the ONE import that selects v1 or v2
│
├─ components/
│  ├─ homepage/               ← v1, untouched, deleted at the end
│  ├─ layout/                 ← v1 Nav/Footer/ThemeToggle, deleted at the end
│  │
│  └─ v2/                     ← everything new lives here
│     ├─ shell/
│     │  ├─ Background/       (blobs + gradient + grid)
│     │  ├─ GlassPanel/       (the panel the content sits on)
│     │  ├─ Header/           (logo · nav pill · toggle · CTA chip)
│     │  ├─ ScrollProgress/   (3px gradient bar)
│     │  ├─ Footer/           (links + copyright)
│     │  └─ Shell/            (assembles all of the above)
│     ├─ ui/
│     │  ├─ Button/           (pill)
│     │  ├─ Card/             (12px + hover overlay)
│     │  ├─ Section/          (112px gap + eyebrow/title/subtitle)
│     │  └─ Eyebrow/
│     └─ homepage/
│        ├─ HomepageView.tsx  ← lists the sections, like v1 does
│        ├─ Hero/
│        ├─ Demo/
│        ├─ Providers/
│        ├─ Compare/
│        ├─ Features/
│        ├─ Faq/
│        └─ Cta/
│
├─ styles/
│  └─ v2-tokens.css           ← copied from design-system/styles.css
└─ public/v2/                 ← mark.svg, favicon.svg, grid.svg
```

### 3.1 How the layout gets swapped (the one tricky bit)

Next.js gives a route group **one** `layout.tsx` — you cannot have two. v1's layout hardcodes
`<Nav>` and `<Footer>`, which v2 replaces.

**Simplest answer**: v2's `<Shell>` is rendered **by the page**, not by the layout. So during the
parallel phase:

```tsx
// app/(marketing)/layout.tsx — make it a pass-through during the v2 build
export default function MarketingLayout({ children }) {
  return <>{children}</>;
}
```

…and v1's `HomepageView` and v2's `HomepageView` each render their own shell. One file changes,
both versions keep working, and no layout is duplicated.

> ⚠️ `(marketing)` also holds `/blog`, `/changelog`, `/contact`, `/demo`. Making the layout a
> pass-through means those four pages must render a shell too. **Cheapest fix**: wrap each of those
> four `page.tsx` files in the v1 `<Nav/><Footer/>` pair for the duration. Four small edits,
> reverted when v1 is deleted. Flagged because it is the only place this plan touches v1 files.

---

## 4. What gets copied from the portfolio

These port directly — both projects are **Next 16 + Tailwind 4 + React 19**, and both already use
`Component/index.tsx` + `styles.css` (Rule W2).

| From portfolio | To PayKit | Change needed |
|---|---|---|
| `components/layout/Layout/BackgroundBlobs.tsx` | `v2/shell/Background/Blobs.tsx` | rename classes `layout-*` → `pk-v2-*` |
| `components/layout/Layout/styles.css` | `v2/shell/Background/styles.css` + `GlassPanel/styles.css` | split; swap `dark:` for tokens (§5) |
| `hooks/useMotionPreference.ts` | `lib/use-motion-preference.ts` | copy as-is |
| `components/layout/Header/ScrollProgress.tsx` | `v2/shell/ScrollProgress/` | copy, retheme to gradient |
| `components/layout/Header/ThemeToggle.tsx` | `v2/shell/Header/ThemeToggle.tsx` | reshape to 40px glass chip |
| `components/shared/{Button,Card,Container,Section}` | `v2/ui/*` | pills + 12px radius |
| `src/styles/tailwind.css` | reference only | tokens come from design-system instead |

**`useMotionPreference` is worth copying verbatim** — it already gates the blobs on reduced-motion
*and* device capability, with good comments. It satisfies the design system's
`prefers-reduced-motion` rule for free.

---

## 5. The one real technical decision: `dark:` vs `[data-theme]`

The two sources disagree, so pick one and apply it everywhere.

| Source | Mechanism |
|---|---|
| Portfolio CSS | Tailwind `dark:` variants (`dark:bg-slate-900/80`) |
| v2 design system | CSS custom properties, light via `[data-theme="light"]` |

**Already solved in our favour**: `app/layout.tsx:71` sets
`attribute: ['class', 'data-theme']`, so Fumadocs' provider writes **both**. Either mechanism works
today with no provider change.

**Decision — use the design system's tokens** (`var(--surface-card)`, not `dark:bg-slate-900/80`):
1. `design-system/styles.css` is authored, complete and covers both themes — copy it, don't re-derive.
2. One source of truth. A token change updates every component.
3. Rule M4's `pk-` prefix and `@apply`-first (Rule W4) still hold; only the *colour values* come
   from tokens.

So copied portfolio CSS gets its `dark:*` colour utilities swapped for `var(--token)`. Layout
utilities (`@apply fixed inset-0 -z-10`) stay exactly as they are.

---

## 6. Build order (each step ends with a working site)

| Step | Deliverable | Gate |
|---|---|---|
| **1** | `styles/v2-tokens.css` copied from design-system; `public/v2/` assets | tokens resolve |
| **2** | `v2/shell/*` — Background, GlassPanel, Header, ScrollProgress, Footer, Shell | shell renders with placeholder content |
| **3** | `v2/ui/*` — Button, Card, Section, Eyebrow | the primitives every section uses |
| **4** | `v2/homepage/Hero` + `HomepageView` + **the one-import swap** | **first real v2 page visible** |
| **5** | Remaining sections, one at a time | each reviewed before the next |
| **6** | Delete `components/homepage/`, `components/layout/`, restore layout | v1 gone |

**Step 4 is the milestone** — the shell plus one section, live. Everything after is repetition.

Per Rule M16, one step at a time with a stop for approval.

---

## 7. Content questions the design kit raises

The marketing kit has sections the current site does **not**, and some carry claims. Flagging rather
than inventing — we just finished a claims audit.

| Kit section | Kit says | Problem |
|---|---|---|
| `#providers` | *"Eleven providers, one interface."* | **Three exist.** Reuse v1's honest Shipped/Planned split. |
| `#pricing` | *"The SDK is free. The dashboard is optional."* | Implies a **paid dashboard** that does not exist. Build, or omit? |
| `#quotes` | *"Teams that stopped maintaining two SDKs."* | **Testimonials.** I will not fabricate these. Real quotes, or omit? |

**Recommended mapping** (v1 content → v2 layout, nothing invented):

| v2 section | Source |
|---|---|
| Hero | v1 `Hero` — keep "400+ tests" (470 real, see audit M2) |
| Demo | v1 `LiveDemo` / `TryIt` |
| Providers | v1 `Providers` — keep the honest 3-shipped/5-planned split |
| Compare | v1 `BeforeAfter` |
| Features | v1 `Features` — minus the wrong bundle sizes (audit H3) |
| Faq | new, sourced from `content/docs/reference/faq.md` |
| Cta | v1 `GetStarted` |
| ~~Pricing~~ | **omit** pending your answer |
| ~~Quotes~~ | **omit** pending real quotes |

---

## 8. Theme toggle — answering your question directly

You asked: footer, or exactly as the design system shows?

**The design system puts it in the header**, not the footer
(`ui_kits/marketing/index.html:274`):

```html
<div class="hr">
  <button class="toggle chip-glass" id="theme" aria-label="Toggle theme">…</button>
  <a class="cta-chip" href="#pricing">Get API key</a>
</div>
```

A 40px glass chip at header-right, beside the gradient CTA. The kit's footer is links + copyright
only — no toggle.

**Decision: follow the kit — header-right glass chip**, since you said to keep toggles exactly as
shown. Footer stays links + copyright. Say so if you would rather override the kit.

---

## 9. Rule changes this requires

| Rule | Action |
|------|--------|
| **M5** (Blueprint: zero radius, no shadows, one accent, 3 fonts) | **Must be rewritten** — v2 contradicts every clause. Blocks step 1. |
| **M12** (claims npm) | Fix: repo is pnpm. |
| **W1/W2** (3-layer, `Component/index.tsx`) | **No change** — this plan follows them. |
| **W4** (`pk-` prefix, `@apply` first) | **No change** — v2 classes are `pk-v2-*`. |
| **W8** (plan per component group) | This doc covers the architecture. Confirm whether you want per-section plan files for step 5. |

---

## 10. Open questions

1. **Pricing section** — build it (needs real pricing), or omit?
2. **Testimonials** — do real quotes exist, or omit?
3. **Per-section plan files** for step 5, or is this doc enough (Rule W8)?
4. The four other `(marketing)` pages (`blog`, `changelog`, `contact`, `demo`) — confirm the §3.1
   pass-through approach is acceptable for the parallel phase.

---

## 11. Next action

**Step 0**: rewrite Rule M5 for v2 Glass (+ fix M12). Docs-only, blocks everything else.
**Then step 1**: copy tokens + assets.

Both are small. I will stop after each for your approval.
