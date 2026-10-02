# Redesign Plan — PayKit v2 "Glass" + Blog Migration

> **Status**: PLAN — awaiting approval. Nothing implemented.
> **Created**: October 1, 2026
> **Inputs received**: `A:\products\payments\design-system` (v2 Glass, replaced 2026-10-01 22:55) · `A:\products\portfolio\portfolio`
> **Supersedes ordering in**: `.plan/website-migration-redesign.md` §4 (user reordered: redesign before redirect)
> **Related**: `.plan/website-claims-audit.md`, `.plan/runtime-split.md`

---

## 1. Headline findings from reviewing both inputs

### 1.1 The design system was replaced, not extended

`design-system/` no longer contains Blueprint. The old structure (`tokens/`, `components/`,
`guidelines/`, `slides/`) is gone, replaced at 22:55 today by **PayKit v2 "Glass"**:

```
styles.css          8.3 KB — all tokens, dark default, light via [data-theme="light"]
foundations.html    269 lines — visual reference
ui_kits/marketing/  577 lines — the product page reference
ui_kits/docs/       434 lines — API reference page reference
assets/logo/        new rounded glass mark + favicon
assets/grid.svg     the portfolio's 64px tile
```

### 1.2 ⚠️ Rule M5 is now obsolete and MUST be rewritten

This answers the open question from the previous plan. **v2 inverts almost every Blueprint rule:**

| Rule M5 (Blueprint) | v2 Glass | Verdict |
|---------------------|----------|---------|
| "Zero border-radius — all `--radius-*` are `0px`" | `--radius-sm:6px … --radius-xl:24px`, `--radius-pill:9999px`. **"Never use square corners in v2."** | ⛔ **Direct contradiction** |
| "No shadows anywhere" | `--shadow-chip`, `--shadow-glow`; "elevation is a 1px ring plus a faint shadow" | ⛔ **Direct contradiction** |
| "One accent color — electric blue hue 258" | cyan accent + cyan→blue gradient + teal links + 5 state colors | ⛔ **Direct contradiction** |
| "Three fonts: Space Grotesk / Instrument Sans / JetBrains Mono" | **Four**: Sora / Inter / Fira Code / JetBrains Mono | ⛔ **Changed** |
| "Dark by default" | Dark by default | ✅ Survives |
| "4px spacing grid" | 48px gutter, 112px section gap — 4px-divisible | ✅ Compatible |

**M5 cannot be "followed" — it must be formally replaced** before any redesign code is written,
or every single component violates the stated rules. This is a documentation change, not a
negotiation: the user has chosen v2.

Also affected: **Rule M4** (`pk-` prefix) still holds and v2 doesn't conflict — keep it.

### 1.3 The portfolio has a complete blog engine — but content is **JSON, not MDX**

This is the finding that determines Workstream C's cost. It is **not** the cheap case I hoped for,
nor the expensive one.

| | PayKit (now) | Portfolio |
|---|---|---|
| Format | **MDX** (7 files) | **JSON** block AST (5 articles) |
| Route | `/blog/<slug>` | `/articles/<slug>` |
| Engine | Fumadocs MDX | custom `src/lib/blog-engine/` (722 lines) |
| Components | 34 files | `src/components/blog/` — full set |

**Good news — the infrastructure is all there and is richer than PayKit's:**
- `blog-engine/types.ts` (378 lines) defines **21 block types**: `paragraph`, `heading`, `code`,
  `callout`, `table`, `list`, `blockquote`, `image`, `mermaid`, `accordion`, `tabs`,
  `before-after`, `image-gallery`, `embed`, `divider`, `custom-component` + 6 inline types.
- `CodeBlock` supports `language`, `filename`, `showLineNumbers`, `highlightLines`, `diffLines`,
  `caption`, `collapsible` — **everything PayKit's code-heavy posts need.**
- `ArticleMeta` includes **`canonicalUrl`** — exactly what cross-domain SEO needs.
- A **`payment-systems` category already exists** in `src/lib/categories.ts`. The portfolio was
  built anticipating this content.
- A **`tutorial` layout template** exists, suited to PayKit's how-to posts.

**The cost — MDX → JSON conversion.** PayKit's 7 MDX posts must be converted into the block AST.
This is mechanical but not a copy: every heading, paragraph, code fence, table and callout becomes
a typed JSON node, and `toc` + `readingTime` + `anchor` values must be generated. Estimate
**~1 post per focused pass**, 7 posts total. No component porting needed — that's the ~10× saving.

**Stacks align**: both Next.js 16 + Tailwind 4 + React 19 + Shiki. No version conflicts.

### 1.4 The v2 design system has NO blog kit — confirms blog-first ordering

`README.md` §"Not yet built in v2": *"Checkout, dashboard, blog and slides."*
`ui_kits/` contains only `marketing/` and `docs/`.

So there is **no v2 design for a PayKit blog** — because the blog is leaving. This independently
confirms: **migrate the blog out before redesigning**, otherwise we'd be inventing a v2 blog design
for 34 components scheduled for deletion.

---

## 2. Agreed order (user-revised)

```
0. Rewrite Rule M5 (+ M12 pnpm fix)       ← blocks everything; docs-only
1. SITE_URL extraction                     ← small; redesign inherits it
2. Claims audit Batch 1 (docs only)        ← parallel-safe; skip blog files
3. Blog → portfolio (Workstream C)         ← deletes 34 components
4. Redesign to v2 Glass (Workstream B)     ← on reduced surface
5. redirects() rule                        ← user's choice: last
6. runtime-split.md                        ← after docs settle
```

**Why `SITE_URL` stays ahead of the redesign** (the one deviation worth keeping): 3 of the 8
hardcoded domain strings live in `app/layout.tsx` and `lib/og-image.tsx` — files the redesign
rewrites. Extracting first means the redesign inherits the correct pattern instead of being edited
twice. `og-image.tsx` renders the domain **into the image artwork**, so a stale value there bakes
into a PNG. ~10 minutes, cannot be invalidated later.

---

## 3. Workstream C — Blog → portfolio

### 3.1 Per-post disposition

The user must confirm. **Recommendation**: not all 7 belong on a personal portfolio.

| Post | Recommendation |
|------|----------------|
| `introducing-paykit.mdx` | → portfolio, `payment-systems` |
| `why-payment-abstraction.mdx` | → portfolio, `payment-systems` |
| `adapter-pattern-explained.mdx` | → portfolio, `backend-architecture` |
| `payment-webhook-handling.mdx` | → portfolio, `payment-systems` |
| `payment-error-handling.mdx` | → portfolio, `payment-systems` |
| `getting-started-paykit.mdx` | ⚠️ **Consider → `/docs` instead** — it is a product tutorial, duplicating quick-start |
| `multi-provider-routing.mdx` | ⚠️ **Consider → `/docs` instead** — duplicates `guides/multi-provider.md` |

⚠️ **The last two contain the non-compiling code from the claims audit (C2).** Fix during
conversion — do not migrate broken code to a higher-traffic domain.

### 3.2 Conversion contract (MDX → JSON)

Per post, produce `content/articles/<slug>.json` in the portfolio:
```
meta: { title, description, author: 'Ravi Ranjan', date, category, tags,
        readingTime (computed), ogImage, canonicalUrl, layoutConfig, toc (generated) }
content: ContentBlock[]
```
Mapping: `##`→`heading`, prose→`paragraph` with inline children, fences→`code`
(carry `filename`/`language`), `>` →`blockquote`, tables→`table`, admonitions→`callout`.
Every `heading` needs an `anchor`, and `toc` must mirror them.

### 3.3 Redirect map (SEO equity)

7 posts carry search equity. Each needs a permanent redirect:
```
paykit.squaredr.tech/blog/<slug>  →  ravi-ranjan.in/articles/<slug>
paykit.squaredr.tech/blog         →  ravi-ranjan.in/articles
```
Set `canonicalUrl` on each migrated article. These rules live in the **same**
`next.config.mjs` `redirects()` added in step 5 — write them together.

### 3.4 Deletions from PayKit website

`content/blog/` (7) · `app/(marketing)/blog/` (4 routes) · `components/blog/` (34 files) ·
`lib/blog.ts` (119) · `lib/authors.ts` (32) · nav/footer links (3) · sitemap blog entries.
Check `components/blog/SubscribeCta`, `ShareButton`, `CodeFigure` for reuse elsewhere before deleting.

---

## 4. Workstream B — Redesign to v2 Glass

### 4.1 What the design system gives us

| Surface | Reference | Status |
|---------|-----------|--------|
| Marketing | `ui_kits/marketing/index.html` (577 lines) | ✅ full reference |
| Docs | `ui_kits/docs/index.html` (434 lines) | ✅ full reference |
| Foundations | `foundations.html` | ✅ logo/color/type/radius/effects/controls/code/motion |
| Tokens | `styles.css` | ✅ complete, both themes |
| Blog | — | ❌ not built (intentionally — blog leaves) |
| Checkout / dashboard | — | ❌ not built |

**This answers the earlier open question: the redesign covers docs too.** A docs kit exists, so
`/docs` is in scope — and it is the larger surface (Fumadocs-themed, sidebar + TOC + search).

### 4.2 Structural shifts the redesign must implement

Not a reskin — the page shell changes:
1. **Fixed background layer**: gradient + three 384px blobs (blur 64, 7s loop, 2s stagger) + grid
   tile masked to 70% height.
2. **Glass panel shell**: `max-w-7xl − 64px`, `/80` + blur, 1px ring, full height. Content never
   sits directly on the page background. Inner column 1024px, 48px gutters.
3. **Sticky header**: 24px from top; logo left, glass nav pill centre, theme toggle + gradient CTA
   chip right, 3px gradient progress bar pinned to viewport top.
4. **Light theme**: `[data-theme="light"]` — the site currently has a `ThemeToggle`; verify it
   drives `data-theme` and not a Tailwind `dark:` class.
5. **Docs shell**: panel widens to 1376px — 256px sidebar / 760px prose / 224px TOC, with ⌘K search.
6. **New logo + favicon** from `assets/logo/`.

### 4.3 Rules that are easy to get wrong (from SKILL.md)

1. Controls are **pills**; cards are **12px**. Never square.
2. Gradient is **primary actions only** — primary button, header CTA, progress bar, "Kit" wordmark.
   Gradient **text** at most **once per page** (hero).
3. Content always on the glass panel.
4. Accent **cyan**; prose links **teal**; states emerald/amber/red/blue/cyan.
5. Code is **always dark** in both themes. Fira Code for code, JetBrains Mono for tokens/IDs.
6. Card hover = overlay at −24px scaling 0.95→1; **≥48px gaps** between cards so overlays don't collide.
7. `prefers-reduced-motion` disables all motion.

### 4.4 Component inventory to retheme

Marketing (keep, retheme): `Hero` (+`HeroCardStack`, `TrustSignals`), `Features`, `Providers`
(+`ProviderRequestModal`), `LiveDemo`, `HowItWorks`, `BeforeAfter`, `WhyPaykit`, `TryIt`,
`GetStarted`, `HomepageView`.
Layout: `Nav` (+`NavMobile`), `Footer`, `ThemeToggle` → new header/nav-pill/CTA structure.
Shared: `Logo` (**new mark**), `CodeBlock`, `CopyInstall` (pill).
Docs: `DocsSidebar`, `DocsToc`, `CapabilityMatrix`, `api-explorer`, mdx-components → v2 docs shell.
Delete: all of `components/blog/`.

---

## 5. Quota strategy

Largest risk is now **conversion volume** (7 posts) and **docs retheme breadth**, not uncertainty.

| Step | Effort | Notes |
|------|--------|-------|
| 0. Rewrite M5/M12 | **XS** | docs only, unblocks everything |
| 1. `SITE_URL` | **S** | 1 new file + 8 edits |
| 2. Claims Batch 1 (docs) | **M** | 7 files; C2 is the same 2-line fix × 7 |
| 3a. Blog conversion | **L** | ~1 post/pass × 7; the bulk of C |
| 3b. Blog deletion + redirects | **S** | mechanical once 3a lands |
| 4a. Shell + tokens + header | **M** | background, glass panel, header, logo, theme |
| 4b. Marketing retheme | **L** | ~10 component groups |
| 4c. Docs retheme | **L** | sidebar + TOC + ⌘K + prose + code tabs |
| 5. `redirects()` | **XS** | one host rule + 8 blog rules |

**Efficiency recommendations**
- Do **0 + 1 + 2 in one pass** — all small, all docs/config, no design dependency. Cheap win.
- **Port `styles.css` wholesale** rather than re-deriving tokens; it is authored and complete.
- Convert posts **one at a time with a reviewed first example** — get post #1's JSON approved, then
  the remaining 6 follow the established shape. Avoids 7× rework.
- Do **4a before 4b/4c**. Shell + tokens land once; every component then inherits. Rethemeing
  components before the shell exists means doing it twice.
- **Defer `/docs` (4c) as its own gate.** It is the largest single surface; don't bundle with 4b.

---

## 6. Open questions

**Blocking Workstream C:**
1. Confirm per-post disposition (§3.1) — especially the 2 tutorials: portfolio or `/docs`?
2. Portfolio is a **separate git repo**. Do I commit there, or hand over generated JSON files?
3. Author attribution — all as "Ravi Ranjan"? (`lib/authors.ts` may hold other names.)

**Blocking Workstream B:**
4. Does the existing `ThemeToggle` write `[data-theme]`? If it uses Tailwind `dark:`, the theme
   layer needs rework (v2 keys off `[data-theme="light"]`).
5. `/docs` in the same pass as marketing, or a separate gate? (**Recommend separate.**)
6. The `(dev)/workbench` route and `api-explorer` — retheme, or leave as internal tools?

**Process:**
7. Rule M14/W8 want plan docs before bulk changes. This doc covers the architecture; do you want
   **per-component-group** plan files for step 4b/4c as Rule W8 literally requires, or is this
   sufficient?

---

## 7. Proposed next action

**Step 0 + 1 + 2 in one pass** — rewrite Rule M5 (and fix M12's pnpm error), extract `SITE_URL`,
and fix the 4 critical/high doc claims. All small, all unblocked, none invalidated by the redesign,
and M5 must land before any v2 code is written.

Then gate on the §6 answers before starting blog conversion.
