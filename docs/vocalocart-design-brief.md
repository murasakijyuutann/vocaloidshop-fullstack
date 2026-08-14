# VocaloCart Frontend Redesign — Design Brief

## Scope (read this first)

This is a **visual/presentation-only redesign**. Do not touch:

- Data fetching logic (`fetch` + `useEffect`, Zustand stores) — keep pages as
  `'use client'` exactly as they are now
- Backend, API routes, Prisma schema, NextAuth, Stripe integration
- Rendering architecture (no RSC conversion, no server actions)

Do not port dependencies, tokens, or config from any external template or
starter (Medusa, Shopify, StyleLoom, etc). Only shadcn/ui + Radix + the
existing Tailwind v4 setup. **No new npm dependencies** — everything needed
is already installed (see "Current state" below).

**Explicitly in scope, despite being structural:** extracting repeated inline
JSX into shared presentational components (`ProductCard`, `Card`, `PageHeader`,
etc). The "consistent card shape across the grid" goal is unachievable by
styling alone — the card markup is currently duplicated inline. This is a
presentational refactor with no data-layer impact, and it is allowed.

## Current state — verified facts, read before prompting

These were checked against the codebase. Earlier drafts of this brief were
wrong about some of them.

**The design-token layer does not exist and must be built first.**
`tailwind.config.ts` is written in Tailwind v3 style and maps `bg-primary`,
`text-foreground`, `border-input` etc. to CSS variables. It is **dead code**:

- The project is Tailwind v4 (`globals.css` is `@import "tailwindcss"`), and
  v4 does not auto-load `tailwind.config.ts` — that needs an `@config`
  directive, which exists nowhere in `src/`.
- The CSS variables it references (`--background`, `--primary`, `--radius`, …)
  are defined in no file.

So `bg-primary` and friends currently resolve to nothing. **Delete
`tailwind.config.ts`** and define tokens in a `@theme` block in `globals.css`
(v4 syntax). Any shadcn component added before this exists will render
unstyled.

**shadcn/ui is not really installed.** The *dependencies* are all present —
15 `@radix-ui/*` packages, `class-variance-authority`, `clsx`,
`tailwind-merge`, `lucide-react`, `next-themes` — so "no new dependencies"
holds. But the only component file is `src/components/ui/button.tsx`, and it
is imported nowhere (it would render invisible, per above). Everything else
gets copied in via the shadcn CLI. `lucide-react` is imported zero times.

**The light theme is hardcoded in three places** beyond Navbar/Footer:

- `src/app/globals.css` — `body { background: #f9fafb; color: #1f2937 }`
- `src/app/layout.tsx` — `<body className="… bg-gray-50">`
- `src/components/Providers.tsx` — `next-themes` with
  `defaultTheme="light" enableSystem`

**Repetition to consolidate:** `bg-white rounded-2xl shadow-md` appears ~30
times; the `from-indigo-500 to-purple-600` gradient ~33 times across 15 files.
Both must become tokens/shared components, or every future tweak is a
15-file find-and-replace.

## Design direction

**Mood: mature, not playful.** This is a Vocaloid fan shop that should read as
a real retail brand — the fandom is the subject matter, not the visual
register. Professional first; identity in the details.

**Density through rhythm, not through filling.** The goal is "no leftover
empty space, nothing crowded," and the mechanism is consistency, not adding
content:

- One container width used on every page (no per-page `max-w-*` drift)
- A fixed spacing scale — use only a small set of step values, never
  arbitrary one-off margins
- Identical image aspect ratios on every product card so grid rows align
- Full-bleed sections that run edge-to-edge, rather than every section being
  an isolated floating rounded card

That last point is the biggest change from today. Right now each section on
the home page is a separate `rounded-2xl` white panel with a shadow, which
reads as disconnected blocks with dead gaps between them. Sections should
share a background and be separated by spacing and hairline rules.

**No emoji as UI.** Every nav item, button, badge, loading state, empty state,
and image placeholder is currently an emoji (🎵 🏠 ❤️ 📬 🛒 📦 👤 ⚙️ 🛍️ ⏳ 😢).
This is the single largest contributor to the playful feel. Replace with
`lucide-react` icons:

| Current | Replacement |
|---|---|
| 🛒 cart | `ShoppingCart` / `ShoppingBag` |
| ❤️ wishlist | `Heart` (filled state when active) |
| 🏠 📬 📦 👤 ⚙️ 🛍️ nav | `Home` `Mail` `Package` `User` `Settings` `Store` |
| ☰ ✕ mobile menu | `Menu` / `X` |
| ⏳ loading | skeleton cards matching the product-card shape |
| 😢 empty state | typographic empty state — heading + one line + one action |
| 🎵 image placeholder | neutral tonal block with a small wordmark/monogram |
| 🔍 in search input | `Search` icon positioned inside the field |

Icons should be consistent in size and stroke weight, and visually
subordinate to text — not decorative stickers.

**Color — warm dark, restrained accent.**

- Background: near-black but *warm*, never pure `#000`; one or two elevated
  surface steps for cards/inputs
- Text: warm off-white/cream, with a clearly dimmer muted tone for secondary
  text. Strong contrast between the two — no mid-gray mush.
- **Primary accent: warm bone/off-white** for primary buttons and highlights,
  as in the reference. This is what makes the reference read as mature.
- **Secondary accent: a Vocaloid-appropriate teal/cyan, used in at most three
  roles** — active nav state, focus rings, and price emphasis. Never as a
  large fill, never as a gradient.

The reason for this split: a saturated cyan used as the dominant accent on
near-black is exactly the "neon fan-site" register we're avoiding. Identity
should come from product photography, typography, and copy — not color
saturation. Verify the accent meets contrast requirements against the dark
background before committing.

**Type.** Bold, heavy headlines paired with noticeably lighter and smaller
body text — strong hierarchy, no muddy middle. Section headings in the
reference are uppercase with tight letter-spacing; that's worth adopting.
Define a small type scale as tokens and use only those steps.

**Retire the gradient.** The indigo→purple gradient is the current brand and
it is going away. It should not be replaced with a different gradient —
solid surfaces and one accent.

## Design system to build (step 0 deliverable)

1. `@theme` block in `globals.css`: background + surface steps, foreground +
   muted foreground, primary, secondary/accent, border, destructive, radius
   scale, type scale
2. Delete `tailwind.config.ts`
3. Fix the three hardcoded light-theme locations; set `next-themes` to dark
   (or remove theme switching entirely if a light theme isn't shipping —
   decide this explicitly rather than leaving it half-wired)
4. Set `<Toaster theme="dark" />` in `layout.tsx` — `richColors` on the
   current default will render light toasts on a dark page
5. Prove it works: render the existing `ui/button.tsx` and confirm all
   variants are visible and correct before touching any page

## Components to add (copy in via shadcn CLI — no new deps)

`card`, `input`, `select`, `badge`, `separator`, `skeleton`, `dialog`,
`dropdown-menu`, `accordion`.

**`select` is not optional.** The home page filter bar uses three native
`<select>` elements. Native dropdown panels stay OS-light on a dark page and
cannot be styled. `@radix-ui/react-select` is already installed.

Then project-specific presentational components: `ProductCard` (used by home
and wishlist — currently duplicated inline), `PageHeader`, `EmptyState`,
`PriceTag`, `QuantityStepper`.

## Page priority

0. **Design system + shared shell** — `globals.css`, `tailwind.config.ts`
   (delete), `layout.tsx`, `Providers.tsx`. Invisible but load-bearing;
   verify before continuing.
1. **Navbar + Footer** — `src/components/Navbar.tsx`, `Footer.tsx`
2. **Home / product listing** — `src/app/page.tsx` + extracted `ProductCard`
   (hero, filter bar, product grid, pagination)
3. **Product detail** — `src/app/product/[id]/page.tsx`
4. **Cart** — `src/app/cart/page.tsx`
5. **Checkout** — `src/app/checkout/` — conversion-critical; prioritise
   clarity and trust over expressiveness

Lower priority, functional-first for now: wishlist (but it consumes
`ProductCard`, so it gets partial benefit free), order history, my page,
addresses, admin panel, login/register.

## Every page needs the non-happy paths designed

Loading, empty, error, and disabled states appear on every page and are
currently emoji-based or unstyled. Loading should be skeletons shaped like
the real content, not a spinner.

## Prompting approach

Run **one step at a time**, reviewing between each. Do not bundle step 0 with
visible work — it is invisible, everything depends on it, and bundling means
it gets reviewed by eyeball instead of verified.

Suggested step 0 prompt:

> "Set up a Tailwind v4 design token layer in `src/app/globals.css` using an
> `@theme` block: warm near-black background with one or two elevated surface
> steps, warm off-white foreground plus a dimmer muted foreground, a warm
> bone/off-white primary accent, a teal secondary accent, border, destructive,
> radius and type scales. Delete `tailwind.config.ts` (it's v3-style and is
> not being loaded by v4). Remove the hardcoded light background from
> `globals.css` body and the `bg-gray-50` class in `layout.tsx`, set
> `next-themes` to dark in `Providers.tsx`, and set `<Toaster theme="dark" />`.
> Then render every variant of the existing `src/components/ui/button.tsx` on
> a scratch page so I can confirm the tokens resolve. Do not change any page
> content, data fetching, routes, or the `'use client'` pattern."

## Guardrail if scope changes are proposed

If a future prompt/response suggests architecture changes — RSC migration,
server actions, adopting a template's data layer, installing a template's UI
package as a dependency, changing API routes or the Prisma schema — decline
and re-scope. This redesign is visual only. Architecture changes are a
separate decision to be made deliberately later, not bundled into a
component/style task.

Extracting duplicated presentational markup into shared components is **not**
an architecture change and is explicitly permitted (see Scope).
