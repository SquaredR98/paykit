# PayKit Website Development Plan

> Build the website at `paykit.squaredr.tech` using the Blueprint design system.
> Full open-source model — no paid tiers, no license keys.

---

## Design System Reference

All visual decisions come from `A:\products\payments\design-system\`. The UI kits (`ui_kits/marketing/`, `ui_kits/blog/`, `ui_kits/docs/`) are **design references only** — they define visual language, component patterns, and token usage. They are NOT the source of truth for content, copy, or business model. Content is decided separately.

**Key design rules:**
- **Dark by default** — `--surface-page: var(--slate-900)`
- **Zero border-radius** — every `--radius-*` token is `0px`. Structure comes from 1px hairlines, never corners
- **No shadows** — borders carry all structure (`--border-hairline`, `--border-default`, `--border-strong`)
- **One accent** — electric blue hue 258 (`--blue-500: oklch(0.640 0.185 258)`)
- **4px spacing grid** — `--space-1` through `--space-32`
- **Three fonts**: Space Grotesk (display), Instrument Sans (body), JetBrains Mono (code)
- **OKLCH color system** — dark-first with `[data-theme="light"]` overrides
- **Code tokens** — keyword (hue 258), string (hue 155), number (hue 82), fn (hue 200), type (hue 300), prop (slate-200), comment (slate-400)

### Token files
| Token | File | Purpose |
|-------|------|---------|
| Colors | `tokens/colors.css` | Slate ramp, blue accent, status colors, semantic aliases |
| Typography | `tokens/typography.css` | Font families, scale, line heights, tracking, composed roles |
| Spacing | `tokens/spacing.css` | 4px grid, zero radii, container widths, control heights |
| Motion | `tokens/motion.css` | Duration and easing tokens |
| Elevation | `tokens/elevation.css` | Elevation system (borders, no shadows) |
| Code | `tokens/code.css` | Code block styling tokens |

### UI Kit References (design only, not content)
| Kit | File | What it shows |
|-----|------|---------------|
| Marketing | `ui_kits/marketing/index.html` | Page structure, section layout patterns, component styling |
| Blog listing | `ui_kits/blog/index.html` | Blog grid, rail, filter chips, pagination |
| Blog post | `ui_kits/blog/post.html` | Prose typography, TOC rail, article layout |
| Docs | `ui_kits/docs/index.html` | 3-column layout, sidebar, prose, on-page nav |

---

## Coding Guidelines

| # | Rule | Detail |
|---|------|--------|
| 1 | **Per-component directories** | Every component is a directory: `ComponentName/index.tsx` + `styles.css`. Never flat files like `Component.tsx`. |
| 2 | **Co-located CSS** | Each component directory has its own `styles.css`. No shared style files across components. Import from `index.tsx` with `import './styles.css'`. |
| 3 | **`pk-` CSS prefix** | All custom CSS classes use `pk-` prefix with BEM-ish naming: `.pk-nav__link`, `.pk-hero__title`, `.pk-footer__col`. |
| 4 | **3-layer architecture** | Layer 1: Component (props only) → Layer 2: View (assembles components) → Layer 3: `page.tsx` (thin, calls one view). |
| 5 | **Views are flat files** | Layer 2 views (`HomepageView.tsx`) are flat `.tsx` files in their component group directory — not directories with `index.tsx`. Exception: blog views are `BlogList/index.tsx` and `BlogPost/index.tsx` (directory-based due to sub-component count). |
| 6 | **No CSS in `app/`** | Only `globals.css` lives in `app/`. All component styles live with their components. |
| 7 | **Design tokens only** | No hardcoded colors, fonts, spacing, or radii. Everything references Blueprint design system tokens via CSS custom properties. |
| 8 | **Zero border-radius** | No `border-radius` anywhere. Structure comes from 1px hairline borders. |
| 9 | **Sub-components** | Complex components can have additional `.tsx` files in their directory (e.g., `Nav/NavMobile.tsx`, `CodeFigure/CopyButton.tsx`). |
| 10 | **Shared components** | Reusable components across pages go in `components/shared/`. Page-specific components go in their group (`components/homepage/`, `components/blog/`, `components/docs/`). |
| 11 | **`@apply` first** | Use `@apply` with Tailwind utility classes wherever possible. Only use raw CSS for values that have no Tailwind equivalent (`font: var(--type-body)`, `box-shadow:`, `transition:`, complex grid, code tokens). |
| 12 | **Tailwind responsive** | Use Tailwind screen variants (`max-lg:`, `max-md:`, `max-sm:`) instead of raw `@media` blocks. |
| 13 | **`@reference` for tokens** | Component CSS files use `@reference "../../../app/globals.css"` (adjust depth) to access design system tokens without duplicating them. |
| 14 | **Syntax highlighting** | All code blocks use PayKit CSS variables theme (`--pk-code-*` → `--code-*` tokens). Homepage uses shiki `codeToHtml()` via `lib/shiki.ts`. Blog uses `rehype-pretty-code`. Docs use Fumadocs with `createCssVariablesTheme({ variablePrefix: '--pk-code-' })` in `source.config.ts`. |

---

## Current State — What Exists Today

### Directory Structure (actual)

```
website/
├── CLAUDE.md                                    # Website-specific rules
├── package.json                                 # @squaredr/paykit-website
├── tsconfig.json
├── next.config.mjs
├── postcss.config.mjs
├── source.config.ts                             # Fumadocs MDX config
├── next-env.d.ts
│
├── app/
│   ├── layout.tsx                               # Root layout: metadata, RootProvider, Google Fonts
│   ├── globals.css                              # Tailwind v4 + full Blueprint token system
│   ├── actions/
│   │   └── demo-payment.ts                      # Server actions: Stripe + Razorpay test payments
│   ├── api/
│   │   └── demo-payment/
│   │       └── route.ts                         # POST handler for demo payments
│   ├── (marketing)/
│   │   ├── layout.tsx                           # Marketing layout: Nav + Footer
│   │   ├── page.tsx                             # Homepage → <HomepageView />
│   │   └── blog/
│   │       ├── page.tsx                         # Blog listing → <BlogList />
│   │       └── [slug]/
│   │           └── page.tsx                     # Blog post → <BlogPost />
│   └── docs/
│       ├── layout.tsx                           # Docs layout: DocsTopBar + DocsSidebar + DocsMobileSidebar
│       └── [[...slug]]/
│           └── page.tsx                         # Fumadocs catch-all
│
├── components/
│   ├── layout/
│   │   ├── Nav/
│   │   │   ├── index.tsx                        # Sticky nav: logo, links, theme toggle, CTA
│   │   │   ├── NavMobile.tsx                    # Mobile hamburger drawer
│   │   │   └── styles.css
│   │   ├── Footer/
│   │   │   ├── index.tsx                        # 5-column footer with subscribe form
│   │   │   └── styles.css
│   │   └── ThemeToggle/
│   │       ├── index.tsx                        # Dark/light toggle switch
│   │       └── styles.css
│   │
│   ├── homepage/
│   │   ├── HomepageView.tsx                     # Layer 2 view — assembles all 9 sections
│   │   ├── Hero/
│   │   │   ├── index.tsx                        # Split: headline + CTAs | code frame with caret
│   │   │   └── styles.css
│   │   ├── LiveDemo/
│   │   │   ├── index.tsx                        # Real checkout: Stripe + Razorpay test payments
│   │   │   └── styles.css
│   │   ├── HowItWorks/
│   │   │   ├── index.tsx                        # Adapter chain diagram with animated path
│   │   │   └── styles.css
│   │   ├── BeforeAfter/
│   │   │   ├── index.tsx                        # Diff view: raw provider vs PayKit code
│   │   │   └── styles.css
│   │   ├── Features/
│   │   │   ├── index.tsx                        # 6-cell grid with Lucide icons
│   │   │   └── styles.css
│   │   ├── Providers/
│   │   │   ├── index.tsx                        # Provider grid: shipped + up next
│   │   │   └── styles.css
│   │   ├── WhyPaykit/
│   │   │   ├── index.tsx                        # 3-column comparison: DIY vs PayKit vs platforms
│   │   │   └── styles.css
│   │   ├── TryIt/
│   │   │   ├── index.tsx                        # Code tabs: Backend / Frontend / Webhook
│   │   │   └── styles.css
│   │   └── GetStarted/
│   │       ├── index.tsx                        # Install command + dual CTA
│   │       └── styles.css
│   │
│   ├── blog/
│   │   ├── BlogCard/
│   │   │   ├── index.tsx                        # Post card with title, desc, byline
│   │   │   └── styles.css
│   │   ├── BlogHeader/
│   │   │   ├── index.tsx                        # Article header: tags, title, standfirst, byline
│   │   │   └── styles.css
│   │   ├── PostGrid/
│   │   │   ├── index.tsx                        # 2-column bordered grid
│   │   │   └── styles.css
│   │   ├── TagFilter/
│   │   │   ├── index.tsx                        # Filter chips with active state
│   │   │   └── styles.css
│   │   ├── SubscribeCta/
│   │   │   ├── index.tsx                        # Subscribe form: eyebrow + email input
│   │   │   └── styles.css
│   │   ├── BlogList/
│   │   │   ├── index.tsx                        # Blog listing view
│   │   │   ├── styles.css
│   │   │   ├── FeaturedPost/
│   │   │   │   ├── index.tsx                    # Featured post with code frame
│   │   │   │   └── styles.css
│   │   │   └── BlogRail/
│   │   │       ├── index.tsx                    # Right rail: releases + most read + CTA
│   │   │       └── styles.css
│   │   └── BlogPost/
│   │       ├── index.tsx                        # Blog post view with MDXRemote
│   │       ├── styles.css                       # Prose + layout + shiki token mapping
│   │       ├── ArticleToc/
│   │       │   ├── index.tsx                    # Sticky TOC with IntersectionObserver
│   │       │   └── styles.css
│   │       ├── AuthorBio/
│   │       │   ├── index.tsx                    # Author avatar + bio + "All posts →"
│   │       │   └── styles.css
│   │       ├── Breadcrumbs/
│   │       │   ├── index.tsx                    # Breadcrumb navigation
│   │       │   └── styles.css
│   │       ├── Callout/
│   │       │   ├── index.tsx                    # Callout box with icon + title + body
│   │       │   └── styles.css
│   │       ├── CodeFigure/
│   │       │   ├── index.tsx                    # Manual code block with terminal chrome
│   │       │   ├── CopyButton.tsx               # Copy to clipboard button
│   │       │   └── styles.css
│   │       ├── ReadingProgress/
│   │       │   ├── index.tsx                    # Scroll progress bar (fixed, accent-solid)
│   │       │   └── styles.css
│   │       ├── RelatedPosts/
│   │       │   ├── index.tsx                    # 3-column related posts grid
│   │       │   └── styles.css
│   │       └── ShareButton/
│   │           └── index.tsx                    # Copy link + share icon button
│   │
│   ├── docs/
│   │   ├── docs-shell.css                       # Docs layout grid styles
│   │   ├── docs-prose.css                       # Docs prose typography (pk-docs__prose)
│   │   ├── docs-nav.ts                          # Sidebar navigation data
│   │   ├── docs-types.ts                        # Docs type definitions
│   │   ├── DocsTopBar/
│   │   │   ├── index.tsx                        # Docs header bar (separate from marketing Nav)
│   │   │   └── styles.css
│   │   ├── DocsSidebar/
│   │   │   ├── index.tsx                        # Sticky sidebar with active states
│   │   │   └── styles.css
│   │   ├── DocsMobileSidebar/
│   │   │   ├── index.tsx                        # Mobile sidebar drawer
│   │   │   └── styles.css
│   │   ├── DocsToc/
│   │   │   ├── index.tsx                        # On-page nav with scroll tracking
│   │   │   └── styles.css
│   │   └── DocsPagination/
│   │       ├── index.tsx                        # Prev/next page links
│   │       └── styles.css
│   │
│   └── shared/
│       └── Logo/
│           ├── index.tsx                        # PayKit logo mark + wordmark
│           └── styles.css
│
├── content/
│   ├── docs/                                    # 13 docs pages
│   │   ├── meta.json                            # Fumadocs page ordering
│   │   ├── index.md                             # Introduction
│   │   ├── getting-started/
│   │   │   ├── installation.md
│   │   │   └── quick-start.md
│   │   ├── core-concepts/
│   │   │   └── architecture.md
│   │   ├── guides/
│   │   │   ├── stripe.md
│   │   │   ├── razorpay.md
│   │   │   ├── webhooks.md
│   │   │   ├── multi-provider.md
│   │   │   ├── testing.md
│   │   │   ├── custom-adapter.md
│   │   │   └── migration.md
│   │   └── reference/
│   │       ├── api-reference.md
│   │       └── faq.md
│   └── blog/                                    # 7 blog posts
│       ├── introducing-paykit.mdx
│       ├── why-payment-abstraction.mdx
│       ├── adapter-pattern-explained.mdx
│       ├── getting-started-paykit.mdx
│       ├── payment-webhook-handling.mdx
│       ├── multi-provider-routing.mdx
│       └── payment-error-handling.mdx
│
├── lib/
│   ├── source.ts                                # Fumadocs source loader
│   ├── blog.ts                                  # Blog utilities: loading, parsing, TOC extraction
│   └── authors.ts                               # Author metadata
│
└── public/
```

### Dependencies (installed)
- `next` 16.2.2, `react` 19.2.4, `react-dom` 19.2.4
- `fumadocs-core`, `fumadocs-ui`, `fumadocs-mdx` (docs engine)
- `next-mdx-remote` (blog MDX rendering)
- `rehype-pretty-code`, `rehype-slug`, `remark-gfm` (blog prose processing)
- `shiki` (syntax highlighting — blog uses `createCssVariablesTheme`)
- `next-themes` (dark/light toggle)
- `@squaredr/paykit`, `@squaredr/paykit-react` (live demo)
- `tailwindcss` v4, `@tailwindcss/postcss`

### SDK capabilities (what PayKit actually ships)

The marketing site should accurately represent what the SDK does. Current SDK state:

**3 production adapters:** Stripe, Razorpay, PayPal (all MIT, all free)

**Unified operations:**
- `paykit.charges` — create, retrieve, capture, cancel, list
- `paykit.refunds` — create, retrieve, list
- `paykit.customers` — create, retrieve, update, delete, list
- `paykit.paymentMethods` — create, retrieve, delete, list
- `paykit.subscriptions` — create, retrieve, update, cancel, list
- `paykit.payouts` — create, retrieve, list
- `paykit.webhooks` — construct (verify + parse unified events)

**Built-in features:**
- 19 unified error codes with human-readable suggestions and `retryable` flag
- 22 unified webhook event types across all providers
- `PaymentRouter` — route by currency, region, or custom rules
- `generateIdempotencyKey()` — built-in idempotency
- 13 capability flags per adapter (charges, auth+capture, refunds, partial refunds, subscriptions, saved payment methods, hosted checkout, embeddable UI, payouts, multi-currency, direct debit, webhooks, 3DS)
- `adapter.healthCheck()` — provider health monitoring
- Mock testing adapter for local development

**Packages:** core (26 KB), react (7 KB), sdk-js (4 KB)

**Test count:** 516 total tests (vitest)

---

## Completed Phases

### Phase 1: Foundation ✅

Blueprint design system fully integrated in `globals.css`:
- Complete OKLCH color system (dark-first + light theme)
- Zero border-radius tokens
- Typography tokens (Space Grotesk, Instrument Sans, JetBrains Mono)
- 4px spacing grid
- Motion tokens
- Border-based elevation
- `pk-` prefixed utility classes
- Tailwind v4 `@theme inline` configuration
- Fumadocs dark/neutral theme integration
- Code syntax tokens (keyword, string, number, fn, type, prop, comment, punct)
- Terminal chrome styles (`.pk-term`, `.pk-term__bar`, `.pk-term__code`)

### Phase 2: Shared Layout ✅

**Nav** — Sticky, blurred background, 60px height, border-bottom. Logo + wordmark (left), section nav links (Live demo #demo, How it works #how, Providers #providers, Docs /docs), ThemeToggle, GitHub icon button, "Get started" CTA. NavMobile for mobile hamburger drawer.

**Footer** — 5-column bordered grid (Product, Adapters, Resources, Community, Subscribe). MIT license + test count line. Inline subscribe form.

**ThemeToggle** — Sun/moon toggle switch with `next-themes`. Hydration-safe.

**Logo** — SVG mark (4 squares, bottom-right filled with accent) + wordmark.

### Phase 3: Marketing Homepage ✅

All 9 sections built and assembled in `HomepageView.tsx`:

1. **Hero** — Split grid: headline ("Stop juggling payment APIs. Use one.") + MIT badge + mono proof row (732 tests / TypeScript-first / MIT licensed) + dual CTA (Get started, View on GitHub) | code frame with typed caret animation showing PayKit usage.

2. **LiveDemo** — **Working checkout with real test credentials.** Order summary (PayKit All Access $149) | segmented control (Choose provider / Smart routing) → provider picker (Stripe USD, Razorpay INR) → real `<CheckoutForm>` from `@squaredr/paykit-react` → success/error states with reset. Smart routing mode shows `PaymentRouter` rules (INR→razorpay, fallback→stripe). Server actions in `app/actions/demo-payment.ts`. API route at `app/api/demo-payment/route.ts`.

3. **HowItWorks** — Adapter chain diagram: Your app → PayKit core → Stripe adapter → Stripe API. Animated blue path. "Swap for" pills: razorpay, paypal, cashfree, +21 more.

4. **BeforeAfter** — Side-by-side diff: removed lines (raw provider if/else) vs added lines (PayKit unified). Animated counter (0→29 lines eliminated) triggered by IntersectionObserver.

5. **Features** — 9-cell grid (3×3) with 20px inline SVG icons (layers, shield-check, puzzle, route, webhook, alert-circle, lock, server, feather). Hover tint. Titles: Unified API, TypeScript-first, Extensible adapters, Provider routing, Webhook normalization, Error normalization, Auth & capture, Node.js + React, Lightweight.

6. **Providers** — Two bands: "Shipped" (Stripe, Razorpay, PayPal with tags) + "Up next" (Square, Adyen, Cashfree, PhonePe, Mollie dimmed) + "Request a provider" CTA card.

7. **WhyPaykit** — 3-column comparison: DIY integration (all negative) | PayKit (all positive, highlighted `.pk-ccol--win`) | Orchestration platforms (all negative).

8. **TryIt** — Terminal chrome with 3 tabs: Backend (PayKit init + charge creation), Frontend (PayKitProvider + CheckoutForm), Webhook (unified event handler switch). Manual HTML spans for syntax highlighting.

9. **GetStarted** — `$ npm install @squaredr/paykit stripe` in terminal style. Dual CTA: "Read the docs" + "Star on GitHub".

### Phase 4: Docs Site ✅

- 3-column layout: 264px sticky sidebar | fluid prose | on-page nav (hidden < 1200px)
- `DocsTopBar` — separate from marketing Nav, 56px height, GitHub link
- `DocsSidebar` — sticky, `aria-current` active state, category grouping
- `DocsMobileSidebar` — toggle drawer for mobile
- `DocsToc` — scroll-based active heading tracking
- `DocsPagination` — prev/next links
- Prose styles in `docs-prose.css` (`.pk-docs__prose` — separate from blog `.pk-prose`)
- Fumadocs integration: `source.config.ts`, `lib/source.ts`, `content/docs/`, `[[...slug]]` catch-all
- Docs code blocks use PayKit CSS variables theme (switched from vitesse to `createCssVariablesTheme` with `--pk-code-` prefix)

### Phase 5: Blog ✅

**Blog listing** (`/blog`):
- Page head: 2-column grid — headline + lede | sunken subscribe rail
- TagFilter chips with `aria-pressed` active state + accent bottom marker
- FeaturedPost: 2-column grid — post text | code frame (webhooks.ts)
- PostGrid: 2-column bordered grid (`.pk-g2`) with hover states
- Pagination bar with page numbers
- BlogRail (340px): Latest releases changelog + Most read list + "Write with us" CTA
- SubscribeCta at bottom

**Blog post** (`/blog/[slug]`):
- ReadingProgress bar (fixed, 2px, accent-solid, scroll-driven)
- Breadcrumbs bar (sunken bg)
- BlogHeader: tags + display-font title (5xl) + standfirst (body-lg) + byline with avatar
- 2-column split: prose body (68ch max) | sticky TOC rail (300px)
- Prose: rehype-pretty-code + createCssVariablesTheme mapping --pk-code-* to --code-* tokens, remark-gfm, rehype-slug
- MdxFigure: intercepts rehype-pretty-code `<figure>` output, wraps in pk-term chrome with CopyButton
- CodeFigure: manual code blocks with diff view support
- Callout: bordered card with icon + title + body
- ArticleToc: IntersectionObserver scroll-spy, active state with accent marker
- ShareButton: "Copy link" text button + share icon button (Web Share API fallback)
- AuthorBio: avatar + bio + "All posts →" link
- RelatedPosts: 3-column grid matched by tags
- SubscribeCta at bottom
- Rail blocks: TOC, Share, Referenced (with external links)

---

## Phase 6: Content Audit & Fixes ✅

All placeholder and design-system-copied content fixed. Build passes.

### Fake content inventory

**BlogRail "Latest releases"** — `BlogRail/index.tsx` has hardcoded fake releases:
- `v2.4.0` "Adyen adapter GA, idempotency keys" — Adyen adapter doesn't exist
- `v2.3.2` "Fix Razorpay refund status mapping" — fake version
- `v2.3.0` "React 19 support, useCharge hook" — `useCharge` hook doesn't exist (SDK has `usePayKit` and `usePaymentStatus`)
- `v2.2.1` "Webhook replay tolerance window" — fake version

**Fix:** Replace with real releases from the SDK, or source from `package.json` versions. Current actual version is `core@0.10.0`, `react@1.0.1`, `sdk-js@1.0.1`.

**BlogRail "Most read"** — Links to posts that don't exist:
- `webhooks-normalization` — no such blog post
- `type-safe-adapters` — no such blog post
- `stripe-migration` — no such blog post

Actual blog posts are: `introducing-paykit`, `why-payment-abstraction`, `adapter-pattern-explained`.

**Fix:** Either link to actual posts, or remove the "Most read" section until there are enough posts.

**BlogRail "Write with us"** — Links to `mailto:blog@paykit.dev`. Domain `paykit.dev` may not be real.

**Fix:** Use actual contact method or remove.

**Hero proof row** — Shows "732 tests". Actual vitest output: 516 tests.

**Fix:** Update to real count, or dynamically source from test runner.

**Footer bottom line** — Shows "732 tests". Same issue.

**GitHub URLs** — Two different usernames used:
- Most places: `https://github.com/nickkray/paykit` (Nav, NavMobile, Hero, GetStarted, DocsTopBar)
- BlogPost rail: `https://github.com/nicofraisse/paykit/discussions` and `https://github.com/nicofraisse/paykit`

**Fix:** Standardize to one correct GitHub URL across all components.

**BlogPost "Referenced" rail block** — Hardcoded links:
- "Webhooks API →" links to `/docs` (generic, not a specific webhooks page)
- "Event mapping matrix ↗" links to `github.com/nicofraisse/paykit` (wrong username)

**Fix:** Link to actual docs pages when they exist, or remove until real targets are available.

**FeaturedPost code frame** — Shows `webhooks.ts` with `paykit.webhooks.parse()`. The actual SDK method is `paykit.webhooks.construct()`, not `.parse()`.

**Fix:** Update to use real API method name.

**Footer link columns** — Multiple `href="#"` placeholder links:
- Product: Overview `#`, Changelog `#`
- Adapters: Stripe `#`, Razorpay `#`, PayPal `#`
- Legal: Privacy policy `#`, Terms of service `#`, MIT license `#`

**Fix:** Link to real pages or remove until pages exist.

**Nav links** — Only links to homepage anchors (#demo, #how, #providers) + /docs. No link to Blog.

**Fix:** Add Blog link to nav.

**LiveDemo order summary** — Shows "PayKit All Access $149.00" and "Every current and future adapter, forever". This references the old paid model.

**Fix:** Update product name and description to match OSS model. Could be a generic demo product or a real PayKit use case.

---

## Phase 7: Homepage Improvements ✅

### Hero rethink

Current hero: static code block on the right. Every SDK site does this.

**Option A: Checkout form IS the hero.** Replace the code block with a live `<CheckoutForm>` — the visitor lands and the first thing they see is a working payment form. "Try a test payment right now." The code becomes secondary.

**Option B: Keep the code block but add a prominent "Try it live →" CTA** that links to `/demo/checkout`. The hero stays clean but funnels people into the interactive experience.

Decide which direction when we get here.

### Features section expansion

The current 6 features (Unified API, Type-safe, Framework-agnostic, Provider routing, Webhook normalization, Lightweight) cover the basics but undersell the SDK. Consider adding or replacing:

- **Error normalization** — 19 unified error codes with suggestions and `retryable` flag
- **Payouts** — send money, not just receive it
- **Customer management** — full CRUD across providers
- **Payment method storage** — save and reuse cards
- **Auth & capture** — hold then charge (hotels, car rentals)
- **Idempotency** — built-in duplicate prevention
- **Health checks** — monitor provider status

### Trust signals

- **Package sizes** — "core: 26 KB / react: 7 KB / js: 4 KB" as a visual element
- **Framework logos** — Next.js, Express, Fastify, Hono, Bun, Deno icons in a row instead of just text
- **Zero runtime deps** — worth calling out visually

### Demo pages showcase section (new)

After LiveDemo (or replacing TryIt), add a section that teases the interactive pages:

- Cards linking to `/demo/checkout`, `/demo/webhooks`, `/demo/errors`, `/demo/routing`
- Each card: title, one-line description, a small preview/illustration
- Purpose: show depth — PayKit isn't just a code snippet, it's a tool you can explore

---

## Phase 8: Interactive Demo Pages ✅

4 demo pages built with shared components, sub-navigation, and index page:
- `/demo` — 2×2 card grid linking to all 4 demos
- `/demo/checkout` — Full purchase journey with SplitView (buyer experience | code panel)
- `/demo/webhooks` — Provider + event selector showing raw vs normalised webhooks
- `/demo/errors` — Provider + scenario selector showing raw vs normalised errors + 19-code reference table
- `/demo/routing` — Editable rule list + currency test + code generation

Components: `DemoPageHeader`, `SplitView`, `CodePanel`, `JsonViewer`, `DemoNav`
Data: `lib/demo-data/checkout-steps.ts`, `webhook-samples.ts`, `error-samples.ts`

### Original Plan (implemented)

Dedicated pages where visitors get hands-on with PayKit. These make people stay.

### `/demo/checkout` — Full Purchase Journey

**Goal:** Let a visitor go through a complete payment flow as a buyer, while seeing the developer code at each step.

**Route:** `app/(marketing)/demo/checkout/page.tsx`
**Components:** `components/demo/DemoCheckout/`

**Layout:** Full-page, split view. Left: the buyer experience. Right: the developer code panel showing what's happening server-side.

**Flow:**
1. **Product selection** — Pick a mock product or plan
2. **Provider selection** — Choose Stripe, Razorpay, or smart routing
3. **Payment form** — Real `<CheckoutForm>` from `@squaredr/paykit-react`
4. **Processing** — Loading state with real payment processing
5. **Success** — Receipt page showing the unified charge object
6. **Code reveal** — At each step, the right panel shows the exact PayKit code: adapter init, `charges.create()`, webhook handler, charge object structure

**Key difference from homepage LiveDemo:** Full-page journey with room to read the code and understand each step. Code panel scrolls in sync with the buyer flow.

**Infrastructure:** Reuse existing `app/actions/demo-payment.ts` and `@squaredr/paykit-react`. New page layout + step-by-step state machine.

### `/demo/webhooks` — Live Webhook Inspector

**Goal:** Make webhook normalization tangible. Pay → watch the webhook arrive → see the transformation.

**Route:** `app/(marketing)/demo/webhooks/page.tsx`
**Components:** `components/demo/DemoWebhooks/`

**Layout:** 3-panel. Top: trigger panel. Bottom-left: raw provider webhook. Bottom-right: PayKit normalized event.

**Flow:**
1. Visitor triggers a test payment (simplified — just a "Pay $1 with Stripe" button)
2. Webhook arrives (via SSE or polling from a webhook receiver endpoint)
3. Left panel shows the raw Stripe/Razorpay webhook JSON (nested, provider-specific)
4. Right panel shows the PayKit unified event (clean, typed, consistent)
5. Highlight the transformation: `charge.succeeded` ← `payment_intent.succeeded` (Stripe) or `payment.captured` (Razorpay)

**Shows:** The 22 unified event types in action. The value of `paykit.webhooks.construct()`.

**Infrastructure needed:**
- Webhook receiver route: `app/api/demo-webhooks/route.ts`
- SSE endpoint or polling route for real-time webhook display
- Test payment trigger (simplified version of LiveDemo)

### `/demo/errors` — Error Normalization Playground

**Goal:** Show how PayKit turns cryptic provider errors into actionable, typed errors.

**Route:** `app/(marketing)/demo/errors/page.tsx`
**Components:** `components/demo/DemoErrors/`

**Layout:** Split view. Left: raw provider error. Right: PayKit normalized error.

**Interaction:**
- Pick a test card number from a list (4000000000000002 = decline, 4000000000009995 = insufficient funds, 4000000000000069 = expired, etc.)
- Pick a provider (Stripe, Razorpay, PayPal)
- Hit "Attempt payment"
- Left: the raw provider error response (verbose, nested, provider-specific)
- Right: the PayKit `PayKitError` — clean code (`card_declined`), message, suggestion, `retryable: boolean`
- Bottom: the 19 error codes reference table

**Infrastructure:** Real test-mode payments with known-failing card numbers.

### `/demo/routing` — Multi-Provider Routing Playground

**Goal:** Show `PaymentRouter` in action — same code, different providers, automatic selection.

**Route:** `app/(marketing)/demo/routing/page.tsx`
**Components:** `components/demo/DemoRouting/`

**Layout:** Top: routing rules editor. Bottom: payment form that uses the configured rules.

**Interaction:**
- Default rules: INR → Razorpay, USD → Stripe, EUR → PayPal
- Visitor can toggle rules, add/remove routes
- Select a currency → the router picks the right provider automatically
- Shows which provider was selected and why
- "Execute" makes a real test payment via the selected provider
- Code panel shows the `PaymentRouter` configuration code

---

## Phase 9: Interactive Documentation Tools 🔜

### `/docs/api-explorer` — Interactive API Console

**Goal:** Stripe's API docs but for PayKit — works across providers.

**Route:** `app/docs/api-explorer/page.tsx`
**Components:** `components/demo/ApiExplorer/`

**Layout:** Split view. Left: operation selector + parameters. Right: response viewer.

**Features:**
- Operation dropdown: Create Charge, Retrieve Charge, Create Refund, List Customers, Create Subscription, Verify Webhook, etc.
- Provider dropdown: Stripe, Razorpay, PayPal
- Parameter inputs: amount, currency, customer ID, metadata (pre-filled with sensible defaults)
- "Execute" button — makes a **real test-mode API call** via server action
- Response viewer: syntax-highlighted JSON with expand/collapse
- Two response tabs: "Unified Response" (PayKit's normalized object) and "Raw Provider Response" (what the provider actually returned)
- Code snippet: shows the exact PayKit code you'd write to make this call

**Design:**
- Split view with hairline divider
- JSON viewer in `.pk-term` terminal chrome
- Response cards as `.pk-blk` sections
- Operation selector as segmented control or dropdown

### `/docs/capabilities` — Provider Capability Matrix

**Goal:** Interactive comparison of what each provider supports.

**Route:** `app/docs/capabilities/page.tsx`
**Components:** `components/demo/CapabilityMatrix/`

**Features:**
- Table: 13 capabilities (rows) × 3 providers (columns)
- Capabilities: Charges, Auth & Capture, Refunds, Partial Refunds, Subscriptions, Saved Payment Methods, Hosted Checkout, Embeddable UI, Payouts, Multi-Currency, Direct Debit, Webhooks, 3D Secure
- Cell states: ✅ Full support, ⚠️ Partial, ❌ Not available
- Click any supported cell → shows the code snippet for that operation with that provider
- Data sourced from adapter capability flags in the SDK (not hardcoded)

**Design:**
- Table with `.pk-prose table` styling
- Hover states on cells
- Code snippet in `.pk-term` popover or expandable row
- Status badges: `.pk-bdg--ok`, `.pk-bdg--neutral`, `.pk-bdg` (muted)

---

## Phase 10: Polish & Verification 🔜

- [ ] Responsive breakpoints (mobile, tablet, desktop) across all pages
- [ ] Verify all `pk-` class prefixes — no unprefixed custom classes
- [ ] Verify no hardcoded colors/fonts — everything via tokens
- [ ] Verify dark/light toggle works on all pages including demo pages
- [ ] `npm run build` passes cleanly
- [ ] Lighthouse performance audit (target 90+)
- [ ] Test on Chrome, Firefox, Safari
- [ ] Verify test count in Hero and Footer matches actual `vitest` output
- [ ] Verify all internal links use `<Link>`, all external links use `<a>` with `target="_blank"`
- [ ] Blog TOC ID generation matches `rehype-slug` output
- [ ] Demo pages work with test credentials in env
- [ ] All placeholder `href="#"` links resolved or removed

---

## Build Order

| Step | What | Status |
|------|------|--------|
| 1 | Foundation: tokens, fonts, globals.css | ✅ Done |
| 2 | Shared layout: Nav, Footer, ThemeToggle, Logo | ✅ Done |
| 3 | Marketing homepage: all 9 sections | ✅ Done |
| 4 | Docs site: layout, sidebar, prose, TOC, Fumadocs | ✅ Done |
| 5 | Blog: listing + post pages with full prose styling | ✅ Done |
| 6 | Content audit: fix fake data, wrong URLs, stale copy | ✅ Done |
| 7 | Homepage improvements: hero rethink, features expansion, trust signals | ✅ Done |
| 8 | Interactive demo pages: checkout, webhooks, errors, routing + index + sub-nav | ✅ Done |
| 9 | Pre-launch content sprint: docs migration (11 pages), 4 blog posts, SEO polish | ✅ Done |
| 10a | `/docs/api-explorer` — interactive API console | 🔜 Post-launch |
| 10b | `/docs/capabilities` — provider capability matrix | 🔜 Post-launch |
| 11 | Polish: responsive, a11y, perf, cross-browser | 🔜 Last |

---

## Known Issues (from last review)

| # | Severity | Location | Issue | Status |
|---|----------|----------|-------|--------|
| 1 | Low | `BlogPost/index.tsx` | `Link` used for external GitHub URL — should be `<a>` with `target="_blank"` | ✅ Fixed |
| 2 | Low | `lib/blog.ts` | TOC `extractTocItems` ID generation may mismatch `rehype-slug` for headings with special characters | Open |
| 3 | Cosmetic | `BlogPost/styles.css` | `--nav-height` fallback is `64px` but actual nav is `61px` (3px offset) | Open |
| 4 | Cosmetic | `ReadingProgress/styles.css` | Progress bar `top: 60px` overlaps nav's 1px bottom border | Open |
| 5 | Low | `TagFilter/index.tsx` | `useSearchParams()` without `<Suspense>` boundary — build error in Next.js 16 | ✅ Fixed |
| 6 | Info | `BlogRail/styles.css` + `BlogPost/styles.css` | Duplicate `.pk-rail` / `.pk-railblk` definitions (works because different routes, but fragile) | Open |
| 7 | Content | `BlogRail/index.tsx` | Fake release versions and descriptions (v2.4.0, v2.3.2, etc.) — SDK is at v0.10.0 | ✅ Fixed |
| 8 | Content | `BlogRail/index.tsx` | "Most read" links to non-existent blog posts | ✅ Fixed |
| 9 | Content | `Hero/index.tsx` + `Footer/index.tsx` | "732 tests" — actual count is 516 | ✅ Fixed |
| 10 | Content | Multiple files | Mixed GitHub usernames: `nickkray` vs `nicofraisse` | ✅ Fixed |
| 11 | Content | `LiveDemo/index.tsx` | Order summary says "PayKit All Access $149" — references old paid model | ✅ Fixed |
| 12 | Content | `FeaturedPost/index.tsx` | Uses `paykit.webhooks.parse()` — actual method is `.construct()` | ✅ Fixed |
| 13 | Content | `Footer/index.tsx` | Multiple `href="#"` placeholder links | ✅ Fixed |
| 14 | Content | `Nav/index.tsx` | No Blog link in navigation | ✅ Fixed |
| 15 | Content | `BlogRail/index.tsx` | `mailto:blog@paykit.dev` — domain may not exist | ✅ Fixed |
| 16 | Low | `DocsToc/index.tsx` | `TocItem.title` typed as `string` but Fumadocs sends `ReactNode` — build type error | ✅ Fixed |
| 17 | Low | `demo-payment/route.ts` | Stripe API version `2024-12-18.acacia` outdated — type error with installed Stripe SDK | ✅ Fixed |
