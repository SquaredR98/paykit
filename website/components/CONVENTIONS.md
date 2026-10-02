# v2 Component Conventions

Every v2 component follows these. They are derived from Rules W1–W4 and M4–M5 plus what the
shell already does — if a new component disagrees with this file, the component is wrong.

## 1. File shape

One directory per component, always:

```
ComponentName/
├─ index.tsx        ← the main export, named (never default)
├─ styles.css       ← co-located styles
└─ SubPart.tsx      ← optional sub-components, same directory
```

- `export function ComponentName()` — **named exports only**, no `export default`.
- Sub-components import with a relative `'./SubPart'`; anything else uses the `@/` alias.
- A directory may also have an `index.ts` barrel (see `components/shell/index.ts`).

## 2. Stylesheet shape

First line is always the reference to the v2 stylesheet — and it must be `(main)`, never
`app/globals.css` (that one is v1's):

```css
@reference "../../../app/(main)/globals.css";
```

The depth is `../../../` from `components/<group>/<Component>/styles.css`.

## 3. Class naming (Rule M4)

- Every custom class is prefixed `pk-v2-`.
- Component-scoped with `__` for parts: `.pk-v2-hero__lede`.
- State with `is-`: `.pk-v2-navpill__link.is-active`.

## 4. `@apply` first (Rule W4)

Use `@apply` with utilities wherever one exists. The v2 spacing scale **is** the Tailwind scale
(both 4px-based), so `--space-6: 24px` is just `gap-6` — do not write raw `gap: var(--space-6)`.

Token utilities are registered in `app/(main)/globals.css` under `@theme inline`:

| Need | Utility |
|------|---------|
| colors | `bg-pk-card`, `text-pk-body`, `border-pk-border`, `text-pk-accent` |
| radii | `rounded-pk-card`, `rounded-pk-pill`, `rounded-pk-lg` |
| type | `text-pk-sm` … `text-pk-7xl` (line-height paired) |
| fonts | `font-pk-heading`, `font-pk-sans`, `font-pk-code` |
| tracking | `tracking-pk-heading` |
| widths | `max-w-pk-inner`, `max-w-pk-prose` |
| glass | `bg-pk-glass-panel`, `bg-pk-glass-chip` |

Raw CSS is only for things with **no** utility equivalent. The complete list of acceptable cases:
gradients (`background: var(--grad-brand)`), `mix-blend-mode`, keyframe `animation`,
`mask-image`, `calc()` widths, and stacked multi-layer `box-shadow`.

Reference an arbitrary token inline with the v4 syntax: `bg-(--blob-cyan)`,
`bg-(image:--grad-brand)`, `border-(--accent-ring)`.

## 5. Layout containers

Every page section sits inside the shared pair, defined in `components/shell/Header/styles.css`:

```tsx
<div className="pk-v2-wrap">     {/* glass-panel width, 48px gutter */}
  <div className="pk-v2-inner">  {/* 1024px content column */}
```

Sections are `--section-gap` apart — use `mt-28` (112px). Anchor targets need `scroll-mt-25`
so the sticky header does not cover the heading.

## 6. Design rules that are easy to break (Rule M5)

1. **Nothing is square.** Controls are pills, cards are `rounded-pk-card` (12px).
2. **The gradient is cyan→blue, two stops, primary actions only** — primary button, header CTA,
   progress bar, "Kit" wordmark. Gradient **text** at most **once per page**, in the hero.
   Never add a new gradient; never restore the purple third stop.
3. **Code is always dark**, in both themes.
4. **Accent is cyan; prose links are teal.**
5. **≥48px gaps between cards** so hover overlays don't collide.
6. **`prefers-reduced-motion` kills all motion** — use `useMotionPreference` for anything
   expensive and decorative.

## 7. Numbers in copy (Rule M3)

Never hardcode a count from memory or from the design mockups — the mockups are wrong
(they say 11 adapters, 23 events). Count from source. Verified 2026-10-02:

| Thing | Value | Source |
|-------|-------|--------|
| provider adapters | **3** | `packages/core/src/adapters/*/` |
| webhook event types | **22** | `WEBHOOK_EVENTS` in `types/webhook.ts` |
| unified error codes | **19** | `ERROR_SUGGESTIONS` in `types/error.ts` |
| capability flags | **13** | `ProviderCapabilities` in `capabilities.ts` |
| tests | **470** (14 failing in sdk-js) | `vitest run` per package |

There is **no pricing tier and no dashboard** — PayKit is MIT, free. The design kit's pricing
and testimonial sections are deliberately not built.

## 8. Gotchas already hit

- **Turbopack glob parser rejects character ranges.** Never write `[A-Z]*` in an `@source` —
  it panics with "invalid character range". Use `@source not "path/**"` to exclude.
- **Never run `next build` or delete `.next`** — the dev server is usually running and it
  breaks the browser. `npx tsc --noEmit` is safe.
