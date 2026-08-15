# VocaloCart Task Audit

Every checklist item in [`VOCALOCART_TASKS.md`](./VOCALOCART_TASKS.md) checked against the `vocalocart-nextjs` codebase as of 2026-08-16.

**Totals: 43 items audited — 5 Done, 20 Partial, 18 Missing.**

| Area | Done | Partial | Missing |
|---|---|---|---|
| 1.1 Product discovery | 0 | 1 | 2 |
| 1.2 Product detail page | 0 | 1 | 3 |
| 1.3 Cart & checkout | 1 | 4 | 2 |
| 1.4 Account / order management | 1 | 1 | 0 |
| 1.5 Performance / SEO baseline | 0 | 1 | 2 |
| 2.1 Reliability & error handling | 2 | 3 | 1 |
| 2.2 Security hardening | 1 | 2 | 1 |
| 2.3 Testing | 0 | 0 | 3 |
| 2.4 Accessibility | 0 | 3 | 0 |
| 2.5 Internationalization (Japan) | 0 | 2 | 1 |
| 2.6 Data integrity | 0 | 2 | 0 |
| 2.7 Performance (professional tier) | 0 | 0 | 2 |
| 2.8 CI | 0 | 0 | 1 |

---

## Section 1 — Core Functional Requirements

### 1.1 Product discovery

| Task | Status | What's left |
|---|---|---|
| Search filters (category/price/availability) + sort | Partial | Category + text search and price/name/date sort exist; no price-range or availability filter, no popularity sort. |
| Category hierarchy + breadcrumbs | Missing | Category model is flat (no parent/child); no breadcrumb UI anywhere. |
| Product image gallery + variant image swap | Missing | Product has a single `imageUrl`; no variant model; no gallery or lightbox. |

### 1.2 Product detail page

| Task | Status | What's left |
|---|---|---|
| Price/stock/variant separated from Add to Cart | Partial | Price, stock badge, and qty stepper are separated; no variant selector since no variants exist yet. |
| Reviews/ratings display block | Missing | No `Review` model or UI, read-only or otherwise. |
| Shipping estimate + return policy near CTA | Missing | No shipping/returns copy anywhere on the PDP. |
| Related products section | Missing | No same-category query or related-products grid on PDP. |

### 1.3 Cart & checkout

| Task | Status | What's left |
|---|---|---|
| Persistent cart across reload | Partial | DB-backed cart survives reload only for logged-in users; no guest/localStorage cart. |
| Guest checkout path | Missing | Cart and checkout pages both redirect unauthenticated users to `/login`. |
| Multi-step checkout with progress indicator | Partial | Address → summary → payment flow exists; no numbered step/progress UI. |
| Saved address selection at checkout | Partial | Saved addresses are selectable and default-aware; no native autofill attributes. |
| Full total (items + shipping + tax) before payment | Partial | Subtotal, shipping, and coupon are shown; no tax line anywhere. |
| Order confirmation page | Done | `checkout/complete` page shows a success state with the order ID. |
| Order confirmation email on success | Missing | Resend is wired for the contact form only, not order success. |

### 1.4 Account / order management

| Task | Status | What's left |
|---|---|---|
| Order history page | Done | Lists past orders with status badges and expandable line items. |
| Cancel/return request flow | Partial | Cancel exists (status → `CANCELED`); no dedicated return/RMA flow. |

### 1.5 Performance / SEO baseline

| Task | Status | What's left |
|---|---|---|
| `next/image` for product imagery | Missing | Raw `<img>` tags (with eslint-disable) used throughout product, cart, and order UI. |
| Meta tags + schema.org Product JSON-LD | Missing | PDP is a client component with no `generateMetadata` or JSON-LD block. |
| Clean, stable per-product dynamic route | Partial | `/product/[id]` works but uses a numeric id, not an SEO-friendly slug. |

---

## Section 2 — Professional-Grade Hardening

### 2.1 Reliability & error handling

| Task | Status | What's left |
|---|---|---|
| Stripe idempotency key on PaymentIntent creation | Missing | No `idempotencyKey` passed to `stripe.paymentIntents.create`. |
| Guard against duplicate order on retry | Done | `stripePaymentIntentId` is `@unique`; route returns the existing order if the PI was already used. |
| Inventory race condition handling | Partial | Stock is checked before the transaction; the decrement inside it is unconditional (no `stock >= qty` guard). |
| Stripe webhook signature verification | Done | `stripe.webhooks.constructEvent` verifies the `stripe-signature` header. |
| Webhook idempotent / replay-safe | Partial | Handler looks up the order by PI but only logs — no event-id dedup store, no status mutation yet. |
| Fallback UI for third-party failures | Partial | Checkout has skeleton/toast/error states; home product and checkout address fetches fail silently. |

### 2.2 Security hardening

| Task | Status | What's left |
|---|---|---|
| Rate limiting on auth/checkout/search | Missing | No rate-limit logic in middleware or any route. |
| Zod validation on every API route | Partial | ~14 routes validated; products, wishlist, admin upload, orders/[id], webhook, admin orders are not. |
| NextAuth cookie/CSRF config | Partial | Standard v5 JWT defaults; no explicit secure-cookie/`trustHost` config for production. |
| No raw card data handled server-side | Done | Stripe PaymentElement + client-side `confirmPayment` only; server only creates the PI. |

### 2.3 Testing

| Task | Status | What's left |
|---|---|---|
| Unit tests (cart/tax/checkout logic) | Missing | No test framework installed; zero test files in the repo. |
| Integration tests (orders, webhook, auth) | Missing | None present. |
| E2E Playwright guest purchase flow | Missing | No Playwright config; also blocked by guest checkout not existing yet. |

### 2.4 Accessibility

| Task | Status | What's left |
|---|---|---|
| Semantic HTML / ARIA on cart, checkout, forms | Partial | Some labels/aria exist; the coupon input and address form labels lack proper association. |
| Full keyboard navigability through purchase flow | Partial | Controls are focusable by default; no documented tab-order or focus-management audit. |
| WCAG AA color contrast on dark theme | Partial | Theme tokens are defined; no automated contrast check has been run on price text/CTAs. |

### 2.5 Internationalization (Japan)

| Task | Status | What's left |
|---|---|---|
| 消費税 (10%) calculation + display | Partial | JPY currency formatting exists; no tax calculation or line-item anywhere. |
| Japan-appropriate address fields | Partial | Generic City/State/Postal fields; no prefecture dropdown or postal-code lookup. |
| Konbini payment via Stripe | Missing | Only the default PaymentElement is configured; no `payment_method_types` entry. |

### 2.6 Data integrity

| Task | Status | What's left |
|---|---|---|
| Structured / reversible migrations | Partial | Single init migration exists; Prisma has no native down-migrations. |
| Multi-step writes wrapped in DB transactions | Partial | Order + stock + coupon + cart-clear are transactional; Stripe PI confirmation happens outside it. |

### 2.7 Performance (professional tier)

| Task | Status | What's left |
|---|---|---|
| ISR/SSG on product listing/detail | Missing | Both routes are `'use client'` with client-side fetch — see conflict flagged below. |
| Cache headers / revalidate per route | Missing | No `revalidate` exports or cache-control config found. |

### 2.8 CI

| Task | Status | What's left |
|---|---|---|
| GitHub Actions: lint + typecheck + test on PR | Missing | No `.github/workflows` directory; `package.json` has a `lint` script only. |

---

## Recommended execution order

Ranked by effort vs. interview/portfolio value, refined from the priority note at the bottom of `VOCALOCART_TASKS.md`. All rows below are executable in-IDE without any external dashboard.

| # | Task | Section | Effort | Touches schema? |
|---|---|---|---|---|
| 1 | Fix inventory race condition (conditional stock decrement in the existing transaction) | 2.1 / 2.6 | Low | No |
| 2 | Add a Stripe idempotency key on PaymentIntent creation | 2.1 | Low | No |
| 3 | Make the webhook handler finalize orders and dedupe by event id | 2.1 | Medium | Optional |
| 4 | Add Zod validation to the remaining unvalidated API routes | 2.2 | Low | No |
| 5 | Accessibility pass on cart/checkout/address forms (labels, ARIA, focus) | 2.4 | Low | No |
| 6 | Add GitHub Actions CI running lint + typecheck now, test step once tests exist | 2.8 | Low | No |
| 7 | Stand up Vitest and unit-test cart/shipping/tax math | 2.3 | Medium | No |
| 8 | Swap product `<img>` tags for `next/image` | 1.5 | Medium | No |
| 9 | Add 消費税 (10%) tax line to cart, checkout, and order totals | 1.3 / 2.5 | Medium | Yes (`Order.taxAmount`) |
| 10 | Add rate limiting to auth, checkout, and search routes | 2.2 | Medium | No |
| 11 | Add a related-products section on the PDP | 1.2 | Low | No |
| 12 | Add shipping estimate + return-policy copy near the Add to Cart CTA | 1.2 | Low | No |
| 13 | Add per-product metadata + JSON-LD (via a segment layout, no full RSC migration) | 1.5 | Medium | No |
| 14 | Enable Stripe konbini as a payment method | 2.5 | Low | No (verify Stripe account setting) |

### Larger, architecture-touching items

Still fully IDE-executable, just bigger in scope or requiring a schema change worth a go-ahead first (per the doc's own "report back before moving on if the change touches shared state" rule):

- Guest checkout path (cart + checkout without forced login)
- Category hierarchy with breadcrumb navigation
- Product image gallery with variants
- Reviews/ratings model and display
- Japan address fields (prefecture dropdown, postal-code lookup)
- Dedicated return/RMA flow beyond simple cancel
- E2E Playwright purchase flow (best done after guest checkout exists)

### Conflict to resolve: ISR/SSG (2.7) vs. "no RSC migration"

Section 2.7 asks for ISR/SSG on product listing/detail pages, but both are currently `'use client'` pages, and the task doc's own context section rules out an RSC migration unless explicitly requested. ISR/SSG fundamentally needs a server-rendered route. Options:

1. Allow a scoped RSC conversion for just the product listing/detail routes.
2. Drop 2.7 as out of scope for this pass.
3. Keep client components and rely on HTTP cache headers on the API routes instead.

This was flagged rather than decided silently — pick one before starting on 2.7.
