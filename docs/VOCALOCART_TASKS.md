# VocaloCart — Engineering Task Spec

## Context (read first, do not re-decide these)

- Stack: Next.js 15 (App Router), TypeScript, Prisma + PostgreSQL (Neon), NextAuth v5, Stripe, Zustand, Tailwind CSS
- Repo: github.com/murasakijyuutann/vocaloidshop-fullstack
- Backend/architecture is considered solid and should **not** be restructured. No RSC migration, no server-action architecture changes, no template-coupled backend swap (Shopify/Medusa etc.) unless explicitly asked.
- Current focus is a **visual/presentation-layer redesign** using shadcn/ui on top of the existing Tailwind setup — warm dark theme (near-black background, warm off-white text, single sparingly-used accent color, teal/cyan as starting point), inspired by the structural/spacing discipline of a template called StyleLoom but with VocaloCart's own identity, not its literal palette.
- This is a portfolio project for job search in Japan's IT market, so anything with 特定商取引法 (Japan e-commerce legal disclosure) or interview-narrative value should be flagged as high priority even if small.

## How to use this doc

Each task below is scoped to be IDE-actionable — i.e., something you can implement, test, and verify without leaving the editor/terminal. Items that require an external dashboard, account, or non-code decision are intentionally excluded from this file (tracked separately). Work top to bottom within each section unless a task is marked `[blocked-by: X]`.

For each task: implement, add/update tests where noted, and report back what was changed and any decisions made (e.g., library choice, schema change) before moving to the next section if the change touches shared state (schema, auth, payment flow).

---

## Section 1 — Core Functional Requirements (Discovery, PDP, Cart, Checkout, Account)

### 1.1 Product discovery
- [ ] Search with filters (category, price range, availability) and sort (price asc/desc, popularity, newest)
- [ ] Category hierarchy with breadcrumb navigation on category/product pages
- [ ] Product image gallery: multiple images per product, zoom-on-hover or lightbox, variant selection swaps the displayed image

### 1.2 Product detail page
- [ ] Price, stock status, and variant selector (size/color/etc.) clearly separated from the "Add to Cart" action
- [ ] Reviews/ratings display block (even if review submission isn't built yet, the read/display UI should exist)
- [ ] Shipping estimate and return policy shown near the CTA, not buried
- [ ] "Related products" section (simple same-category query is sufficient)

### 1.3 Cart & checkout
- [ ] Persistent cart that survives reload/session (Zustand + sync strategy — confirm whether DB-backed or localStorage-backed for guest carts)
- [ ] Guest checkout path — do not force account creation before purchase
- [ ] Multi-step checkout UI with a visible progress indicator (cart → shipping → payment → confirm)
- [ ] Address autofill / saved addresses for returning authenticated users
- [ ] Full order total (items + shipping + tax) shown before the final payment step
- [ ] Order confirmation page after successful payment
- [ ] Trigger confirmation email on order success (email service call — assume provider is already configured; if not, stub the call and flag it)

### 1.4 Account / order management
- [ ] Order history page showing past orders and status
- [ ] Cancel/return request flow — UI + API route (can be a status-change request, doesn't need full RMA logic)

### 1.5 Performance / SEO (functional baseline)
- [ ] Confirm `next/image` is used for all product imagery, with lazy loading
- [ ] Add meta tags and schema.org `Product` structured data to product pages
- [ ] Confirm clean, stable dynamic routes per product (`/products/[slug]` pattern or equivalent)

---

## Section 2 — Professional-Grade Hardening

### 2.1 Reliability & error handling
- [ ] Idempotency key on Stripe payment intent/session creation calls
- [ ] DB-level unique constraint or equivalent guard preventing duplicate order creation on retry
- [ ] Inventory race condition handling — wrap stock decrement + order creation in a DB transaction; consider optimistic locking on stock count
- [ ] Stripe webhook signature verification on the webhook handler route
- [ ] Webhook handler is idempotent/replay-safe (safe to receive the same event twice)
- [ ] Fallback UI states for third-party service failures (payment provider timeout, etc.) — no silent failures or raw error dumps to the user

### 2.2 Security hardening
- [ ] Rate limiting middleware on auth endpoints, checkout, and search routes
- [ ] Zod (or equivalent) server-side validation on every API route / server action — do not trust client-side validation alone
- [ ] Review NextAuth session/cookie config for CSRF protection correctness
- [ ] Confirm checkout flow never handles raw card data server-side (Stripe Elements/Checkout only)

### 2.3 Testing
- [ ] Unit tests (Vitest/Jest) for checkout logic, cart logic, price/tax calculation
- [ ] Integration tests for key API routes (order creation, webhook handler, auth)
- [ ] E2E test (Playwright) covering the full guest purchase flow, cart → confirmation

### 2.4 Accessibility
- [ ] Semantic HTML and ARIA labels across cart, checkout, and product forms
- [ ] Full keyboard navigability through the purchase flow (tab order, focus states, no keyboard traps)
- [ ] Color contrast check on the new dark theme, especially price text and CTA buttons — target WCAG AA minimum

### 2.5 Internationalization (Japan-specific)
- [ ] Currency and 消費税 (consumption tax) formatting/calculation logic
- [ ] Japan-appropriate address form fields (postal code lookup pattern, prefecture/city/ward structure)
- [ ] If feasible: integrate an additional Japan-common payment method available through Stripe (konbini payment)

### 2.6 Data integrity
- [ ] Review Prisma schema for the order/inventory flow — confirm migrations are structured and reversible
- [ ] Wrap all critical multi-step writes (order + inventory + payment record) in DB transactions

### 2.7 Performance (professional tier)
- [ ] Apply ISR or SSG where product content doesn't need real-time freshness (product listing/category pages)
- [ ] Set appropriate cache headers / `revalidate` values per route type

### 2.8 CI (code-side only)
- [ ] Add GitHub Actions workflow: run lint, typecheck, and test suite on every PR

---

## Explicitly out of scope for this pass

Do not implement or configure the following — these require dashboard/account access outside the IDE and are tracked separately: Sentry/analytics setup, Vercel env/staging config, Neon backup scheduling, Stripe dashboard product/webhook registration, domain/DNS, legal policy text (特定商取引法, privacy policy, ToS), cookie consent policy decisions, CDN cache policy at the platform level, screen-reader/cross-browser manual QA.

## Priority note for this project specifically

Given the job-search framing, prioritize in this order if time-constrained: webhook idempotency (2.1) → basic transaction safety on order/inventory (2.1/2.6) → guest checkout + full-cost-before-payment (1.3) → accessibility pass on checkout (2.4) → E2E test on purchase flow (2.3). These are the items most likely to come up as concrete talking points in an interview.
