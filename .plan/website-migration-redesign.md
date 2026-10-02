# Website Migration & Redesign — Understanding + Plan Skeleton

> **Status**: UNDERSTANDING CAPTURED — awaiting design file + portfolio directory before full plan.
> **Created**: October 1, 2026
> **Depends on**: `.plan/website-claims-audit.md` (claim fixes), `.plan/runtime-split.md` (package refactor)
> **Order**: this doc's Workstream A can proceed immediately; B and C are blocked on inputs from user.

---

## 1. What the user asked for (three workstreams)

### A. Domain migration — `paykit.squaredr.tech` → `paykit.ravi-ranjan.in`
Every route on the old host must permanently redirect to the same route on the new host,
automatically, without hand-writing per-route rules. User will point **both domains to the same IP**.

### B. Redesign
Design file to be supplied. Design is **inherited from the user's portfolio website**; the
portfolio project directory can also be shared as reference.

### C. Move the blog to the portfolio site
Blog leaves PayKit entirely and lives on the main portfolio site, to concentrate traffic there and
remove the conflict between the two domains.

---

## 2. ⚠️ Critical technical correction — "same IP" does NOT give you redirects

**The user's stated plan has a gap that must be resolved before Workstream A.**

Pointing both domains at the same IP makes both domains **serve the site** — it does not make one
redirect to the other. The result would be the **opposite** of the goal: the identical site
answering on two hostnames simultaneously = **duplicate content**, split SEO authority, and two
canonical URLs competing. That is the exact "conflict between two domains" the user wants to remove.

A redirect requires something to **inspect the inbound `Host` header** and return `308`. Same-IP
DNS cannot do that on its own.

### Where the Host-based redirect can live — pick one

| Option | How | Verdict |
|--------|-----|---------|
| **`next.config.mjs` `redirects()` with a `host` condition** | One rule, `source: '/:path*'`, `has: [{ type: 'host', value: 'paykit.squaredr.tech' }]`, `destination: 'https://paykit.ravi-ranjan.in/:path*'`, `permanent: true` | ✅ **Recommended.** Exactly the "no hard work" the user asked for — one rule covers every route, in-codebase, version-controlled. |
| `middleware.ts` | Read `request.headers.get('host')`, `NextResponse.redirect(…, 308)` | Works; needed only if logic must be dynamic. Runs on every request — unnecessary cost here. |
| Reverse proxy (nginx/Caddy) | `server_name` block returning 308 | Fastest, but lives **outside** the repo. User explicitly wants it in the codebase. |

**Recommendation**: `next.config.mjs` `redirects()`. It satisfies "every route automatically,
no hard work" with a single rule and requires no per-route work ever.

**Prerequisite the user must still handle**: the new domain needs its own TLS certificate, and
whatever terminates TLS must accept **both** hostnames (otherwise the old domain fails the
handshake before Next.js ever sees the request and the redirect never fires).

---

## 3. Scope discovered in the codebase (verified October 1, 2026)

### 3.1 The domain is hardcoded in 8 places — no env var exists

| File | Line | Content |
|------|------|---------|
| `app/layout.tsx` | 29 | `metadataBase: new URL('https://paykit.squaredr.tech')` |
| `app/layout.tsx` | 40 | `url: 'https://paykit.squaredr.tech'` (OpenGraph) |
| `app/(marketing)/page.tsx` | 16 | `url: 'https://paykit.squaredr.tech'` (JSON-LD schema) |
| `app/sitemap.ts` | 4 | `const BASE = 'https://paykit.squaredr.tech'` |
| `app/robots.ts` | 12 | `sitemap: 'https://paykit.squaredr.tech/sitemap.xml'` |
| `lib/og-image.tsx` | 74, 158 | Domain rendered **into the OG image artwork** |
| `app/actions/contact.ts` | 38 | `"Sent from paykit.squaredr.tech via FieldCraft"` |

Plus **unrelated** `squaredr.tech` references that are a **separate decision** (not automatic
renames — the user must confirm each):
- `app/actions/contact.ts:14` — `CONTACT_EMAIL` fallback `hello@squaredr.tech`
- `app/actions/contact.ts:44` — email `from:` `noreply@squaredr.tech`
- `fieldcraft.squaredr.tech` links × 3 (`ContactForm`, `Providers`, `ProviderRequestModal`)
- `packages/{core,react,sdk-js}/package.json` → `"homepage": "https://squaredr.tech/products/paykit"`
  (⚠️ changing these requires an npm republish to take effect)

**Action**: introduce a single `SITE_URL` (env var + `lib/site.ts` constant) and replace all 8.
Hardcoding a second domain would just recreate the problem.

### 3.2 Blog footprint to migrate (Workstream C)

| Asset | Count / size |
|-------|--------------|
| MDX posts | **7** (`content/blog/*.mdx`) |
| Route files | 4 (`blog/page.tsx`, `blog/[slug]/page.tsx`, 2 × `opengraph-image.tsx`) |
| Components | **34 files** across 15 dirs (`components/blog/`) |
| Libs | `lib/blog.ts` (119 lines), `lib/authors.ts` (32 lines) |
| Nav/Footer links | 3 (`Nav/index.tsx:12`, `NavMobile.tsx:12`, `Footer/index.tsx:21`) |
| Sitemap entries | `/blog` + one per post (`app/sitemap.ts:11,31`) |

**The 7 posts carry SEO equity.** Moving them without per-post redirects discards it. Each
`paykit.squaredr.tech/blog/<slug>` needs a 308 to its new portfolio URL — and the slug mapping
depends on the portfolio's blog route shape (unknown until the portfolio dir is shared).

⚠️ **Two of the 7 posts are referenced by the claims audit** as containing non-compiling code
(`getting-started-paykit.mdx`, `multi-provider-routing.mdx`). Decide: fix before moving, or move
then fix. **Recommend fixing before the move** — migrating known-broken code to a
higher-traffic site makes the problem worse.

---

## 4. Dependency order (this is the key planning question)

Three plans now exist and they **overlap on the same files**. Doing them in the wrong order means
redoing work:

```
website-claims-audit.md   → edits content/docs/*, content/blog/*, components/*
website-migration-redesign.md → replaces components/*, deletes content/blog/*
runtime-split.md          → changes package APIs that the docs describe
```

### Recommended order, with reasoning

1. **Workstream A (domain redirect + `SITE_URL`)** — do **first**, independently.
   Small, isolated, touches ~8 lines in files the redesign won't rewrite (config, sitemap, robots).
   Zero conflict with anything else. Unblocks the user's DNS work immediately.

2. **Claims audit Batch 1 — but ONLY the docs, not the blog.**
   The 4 critical/high fixes (C1 webhook security, C2 non-compiling code, H1 missing package,
   H2 PayPal SDK) live in `content/docs/*`, which the redesign does **not** touch (redesign =
   components + CSS; docs = MDX content). Safe to do in parallel with design work.
   ⚠️ Skip the 2 blog files here — fold them into Workstream C instead, so they're fixed once.

3. **Workstream C (blog → portfolio)** — before the redesign.
   Removes 34 components + 4 routes + 2 libs. Doing this first means the redesign never has to
   style blog components that are about to be deleted. **Needs the portfolio directory first.**

4. **Workstream B (redesign)** — after C, on the reduced surface.
   **Needs the design file first.**

5. **`runtime-split.md`** — last.
   It changes the public API the docs describe (`PaymentAdapter.client` removal, `paykit-js`
   promotion). Running it before the docs settle means documenting an API twice.

**Rationale**: order by *blast radius on shared files*, smallest first, and never style something
scheduled for deletion.

---

## 5. Quota / effort planning

The user explicitly raised quota. Rough shape of each workstream:

| Workstream | Effort | Parallelizable? | Blocked on |
|------------|--------|-----------------|------------|
| A — redirect + `SITE_URL` | **Small** — 1 config rule + 8 line edits + 1 new `lib/site.ts` | — | nothing |
| Claims Batch 1 (docs only) | **Medium** — 7 doc files, mechanical, repetitive pattern | yes | nothing |
| C — blog migration | **Large** — depends entirely on portfolio structure; 34 components may be portable or may need rewriting to portfolio conventions | no | **portfolio dir** |
| B — redesign | **Largest** — unknown until design file seen | no | **design file** |

### How to keep quota efficient
- **Do A now** — it is cheap, unblocks the user's DNS/TLS work, and cannot be invalidated by later work.
- **Do not start B or C** until the inputs land. Planning a redesign against an unseen design, or a
  blog move against an unseen portfolio, produces throwaway work — the single biggest quota risk here.
- **Batch the repetitive doc fixes** (C2 is the same two-line correction × 9 files) into one pass
  rather than one-at-a-time, since Rule M16's per-item gate is about *sprint items*, not
  individual find/replace edits within one approved item.
- **Blog components may be reusable as-is.** If the portfolio already has blog infrastructure, the
  move is "copy 7 MDX files + add redirects", not "port 34 components". That is a ~10× effort
  difference and is unknowable until the portfolio dir is shared. **Determine this before planning C.**

---

## 6. Open questions — needed before B and C can be planned

**For Workstream A (can start without these, but confirm):**
1. Does anything *other than* this Next.js app serve `paykit.squaredr.tech`? If a proxy/CDN sits in
   front, the redirect may be better placed there.
2. Keep the old domain alive indefinitely, or sunset it after N months? (Affects whether redirects
   are permanent-forever or time-boxed.)
3. Change the three packages' npm `homepage` fields? Requires republish to take effect.
4. Change `noreply@squaredr.tech` / `hello@squaredr.tech`, or keep email on the old domain?

**For Workstream C (blocking):**
5. Portfolio directory path.
6. Portfolio's blog route shape (`/blog/<slug>`? `/posts/<slug>`? `/writing/<slug>`?) — determines
   the redirect map.
7. Does the portfolio already render MDX with the same frontmatter contract
   (`title`, `slug`, `date`, `description`, `tags` per Rule W6)?
8. Do all 7 posts move, or only the non-PayKit-specific ones? (Several are PayKit tutorials —
   arguably they belong in `/docs`, not a portfolio blog.)

**For Workstream B (blocking):**
9. Design file.
10. Does the redesign **replace** the Blueprint design system (`design-system/`, Rule M5: dark by
    default, zero border-radius, no shadows, one accent, 4px grid, 3 fonts), or adapt it? Rule M5
    forbids inventing tokens — if the portfolio design conflicts, **M5 must be formally amended**,
    not silently violated.
11. Does the redesign cover `/docs` too, or marketing pages only? (Docs are Fumadocs-themed —
    much larger surface.)

---

## 7. Proposed next action

**Start Workstream A now** — it is unblocked, cheap, independent, and the user needs it to proceed
with DNS. Deliverables:
1. `lib/site.ts` exporting `SITE_URL` from `process.env.NEXT_PUBLIC_SITE_URL` with a default.
2. `next.config.mjs` — one host-conditioned `redirects()` rule covering `/:path*`.
3. Replace the 8 hardcoded occurrences with `SITE_URL`.
4. Document the TLS prerequisite for the user.

Then pause for the design file + portfolio directory before B and C.
