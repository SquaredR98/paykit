# PayKit Website — Architecture Rules

## Rule W1: Component Architecture

Strict three-layer system. Every route follows this pattern:

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Layer 1: Components** | `components/` | Small, focused UI pieces. Receive all data via props. No data fetching, no side effects. |
| **Layer 2: Views** | `components/*/` | Assemble Layer 1 components into a full page section. One view per route. Receive data from page.tsx. |
| **Layer 3: page.tsx** | `app/**/page.tsx` | Thin Next.js route file. Calls exactly one view component. Handles data fetching (server components) and passes data down. |

**Examples:**
- `app/(marketing)/page.tsx` → renders `<HomepageView />` → assembles `<Hero />`, `<Features />`, etc.
- `app/docs/[[...slug]]/page.tsx` → renders doc content via Fumadocs

## Rule W2: Component Directory Pattern

Every component is a **directory** with `index.tsx` as the main export and `styles.css` for co-located styles:

```
components/layout/Nav/index.tsx        ← main component
components/layout/Nav/NavMobile.tsx    ← sub-component (if needed)
components/layout/Nav/styles.css       ← co-located styles
```

**Rules:**
- `index.tsx` is always the main export
- `styles.css` lives alongside `index.tsx` in the same directory
- Complex components may have additional `.tsx` files for sub-components (e.g., `HeroTabs.tsx`, `SchemaPanel.tsx`)
- Never use flat files like `Nav.tsx` — always `Nav/index.tsx`

## Rule W3: Shared Layouts via Route Groups

- `app/layout.tsx` — Root layout. Only `<html>`, `<body>`, `<RootProvider>`, globals.css import. No Nav/Footer here.
- `app/(marketing)/layout.tsx` — Marketing layout. Wraps with `<Nav />` + `<Footer />`. Shared across homepage, blog, etc.
- `app/docs/layout.tsx` — Docs layout. Wraps with docs-specific sidebar/topbar.

Nav and Footer are defined **once** in their layout and never duplicated across routes.

## Rule W4: CSS Organization

- All custom CSS classes use the `pk-` prefix (e.g., `.pk-nav__link`, `.pk-hero__title`)
- Each component directory has its own `styles.css`:
  - `components/layout/Nav/styles.css` — Nav styles
  - `components/layout/Footer/styles.css` — Footer styles
  - `components/homepage/Hero/styles.css` — Hero section styles
  - `components/shared/Logo/styles.css` — Logo styles
- **No CSS files in `app/` route directories** — styles belong with their components
- `app/globals.css` is the only CSS file in `app/` — contains Tailwind imports, design tokens, base resets
- Import component `styles.css` from `index.tsx` (e.g., `import './styles.css'`)
- **`@apply` first** — Use `@apply` with Tailwind utility classes wherever possible instead of raw CSS properties. Only use raw CSS for values that have no Tailwind equivalent (e.g., `font: var(--type-body)`, `background: color-mix(...)`, `box-shadow: var(--marker-accent)`, `transition: var(--transition-control)`). Layout properties (`flex`, `grid`, `sticky`, `hidden`, `items-center`, `gap-*`, `p-*`, `m-*`, etc.) must always use `@apply`.
- **Multiple `@apply` lines** — Never cram all properties onto one `@apply` line. Use multiple `@apply` directives for readability — group by concern (layout, color, responsive, etc.).
- **Tailwind responsive** — Use Tailwind screen variants (`max-lg:`, `max-md:`, `max-sm:`) instead of raw `@media (max-width: ...)` blocks. Breakpoints: `max-sm:` (≤639px), `max-md:` (≤767px), `max-lg:` (≤1023px), `max-xl:` (≤1199px).
- **Raw CSS + responsive ordering** — When a rule has both raw CSS (e.g., `grid-template-columns`) and responsive `@apply` variants, put responsive `@apply` lines AFTER the raw property so they override correctly.

## Rule W5: Data Flow

```
page.tsx (fetches data) → View (assembles components) → Component (renders UI)
```

- Maximum 3 levels of prop drilling before introducing React Context
- Server components fetch data; client components receive via props
- No `useEffect` for data fetching — use server components or React Server Actions

## Rule W6: Blog Rules

- MDX files live in `content/blog/`
- Required frontmatter: `title`, `slug`, `date`, `description`, `tags`
- Blog listing and individual post pages live under `app/(marketing)/blog/`

## Component Groups

| Group | Directory | Contents |
|-------|-----------|----------|
| Layout | `components/layout/` | `Nav/`, `Footer/`, `ThemeToggle/` |
| Homepage | `components/homepage/` | `Hero/`, `LiveDemo/`, `HowItWorks/`, `BeforeAfter/`, `Features/`, `Providers/`, `WhyPaykit/`, `TryIt/`, `GetStarted/` + `HomepageView.tsx` |
| Shared | `components/shared/` | `Logo/`, `CodeBlock/`, `CopyInstall/` — reusable across pages |
| Docs | `components/docs/` | Docs sidebar, TOC, mdx-components |
| Blog | `components/blog/` | `BlogCard/`, `BlogHeader/`, `PostGrid/`, `TagFilter/` + `BlogListView.tsx`, `BlogPostView.tsx` |

## File Ownership

| File/Directory | Owner |
|----------------|-------|
| `app/layout.tsx` | Root layout (RootProvider, globals) |
| `app/(marketing)/layout.tsx` | Marketing layout (Nav + Footer) |
| `app/(marketing)/page.tsx` | Homepage |
| `app/(marketing)/blog/page.tsx` | Blog listing |
| `app/(marketing)/blog/[slug]/page.tsx` | Blog post |
| `app/docs/layout.tsx` | Docs layout (sidebar) |
| `app/docs/[[...slug]]/page.tsx` | Docs page (Fumadocs) |
| `components/layout/` | Nav/, Footer/, ThemeToggle/ |
| `components/homepage/` | Hero/, Features/, etc. + HomepageView.tsx |
| `components/shared/` | Logo/, CodeBlock/, CopyInstall/ |
| `components/docs/` | DocsSidebar, DocsToc, mdx-components |
| `components/blog/` | BlogCard/, BlogHeader/, etc. + views |
| `content/docs/` | Documentation MDX files |
| `content/blog/` | Blog MDX files |
| `lib/source.ts` | Fumadocs source loader |
| `lib/tokens.ts` | Design token helpers |
| `lib/site-theme.ts` | Theme configuration |
| `lib/use-site-theme.ts` | Theme hook |
| `lib/blog.ts` | Blog utilities |
| `lib/authors.ts` | Author metadata |
| `lib/utils.ts` | General utilities |
| `source.config.ts` | Fumadocs MDX config |

## Rule W7: Next.js 15+ Async APIs

This project uses Next.js 16. In Next.js 15+, `params` and `searchParams` are Promises.
Always `await` them before accessing properties:

```tsx
// ✅ Correct
interface Props { params: Promise<{ slug: string }> }
export default async function Page({ params }: Props) {
  const { slug } = await params;
}

// ❌ Wrong — will cause 404 or runtime error
interface Props { params: { slug: string } }
export default async function Page({ params }: Props) {
  const post = await getPost(params.slug);
}
```

## Rule W8: Workflow — Document First, Then Implement

When making bulk changes across multiple files or component groups:

1. **Create implementation plan files first** in `implementation-plan/` directory — one file per component/group detailing what needs to change and why.
2. **Wait for user review/approval** before implementing.
3. **Implement fixes** after approval.
4. **Do NOT move to the next group** without explicit user confirmation.
5. **Delete plan files** for completed groups to avoid confusion.

## Rule W9: Session Start

At the start of every session (including after context exhaustion):
- Read this `CLAUDE.md` file first before doing anything.
- Read `BLOG_IMPLEMENTATION_GUIDE.md` if working on CSS or blog components.
- Never assume rules from memory — always verify from the files.
