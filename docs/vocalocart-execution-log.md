# VocaloCart Task Execution Log

Tracks actual execution against the [recommended order](./vocalocart-task-audit.md#recommended-execution-order) from the task audit. Each entry lists what changed, why, and how it was verified. Update this file as further steps are executed.

**Status: 14 of 14 steps complete.**

---

## Completed

### 1. Fix inventory race condition — `2.1` / `2.6`

Stock decrement inside the order-creation transaction now uses a conditional `updateMany` (`where: { stock: { gte: quantity } }`) instead of an unconditional `update`. Two concurrent orders racing on the same product's last units can no longer both succeed — the loser sees `count === 0` and rolls back its entire transaction instead of driving stock negative. A new `InsufficientStockError` distinguishes this from a generic 500.

- `vocalocart-nextjs/src/app/api/orders/route.ts`

### 2. Add a Stripe idempotency key on PaymentIntent creation — `2.1`

`create-intent` now passes a deterministic SHA-256 idempotency key (hash of `userId` + sorted cart contents + coupon + total) to `stripe.paymentIntents.create`. A double-click, network retry, or checkout page remount before payment collapses onto the same PaymentIntent; any real change to cart/coupon/total naturally produces a new key and a fresh, correctly-priced PaymentIntent.

- `vocalocart-nextjs/src/app/api/payments/create-intent/route.ts`

### 3. Make the webhook idempotent and finalize orders — `2.1`

Extracted order creation (stock transaction, coupon, cart clear) out of the orders route into a shared helper, used by both the client-driven `POST /api/orders` path and the Stripe webhook. The webhook no longer just logs — it now creates the order itself as a safety net if the client never reached `/checkout/complete` (closed browser, failed redirect, etc.), using `addressId` stashed in PaymentIntent metadata. Repeated event delivery or a race with the client path both resolve to a no-op via the `stripePaymentIntentId` unique constraint. No schema change was required.

- `vocalocart-nextjs/src/lib/create-order-from-cart.ts` (new)
- `vocalocart-nextjs/src/app/api/orders/route.ts`
- `vocalocart-nextjs/src/app/api/payments/create-intent/route.ts` (added `addressId` to metadata)
- `vocalocart-nextjs/src/app/api/payments/webhook/route.ts`

### 4. Add Zod validation to remaining API routes — `2.2`

Added validation to routes that had a genuine gap:

- `vocalocart-nextjs/src/app/api/products/route.ts` — query params (`q`, `categoryId`, `sort`, `dir`, `page`, `size`) and the create-product body. Also fixed a bug where `!price`/`!stock` truthy checks rejected legitimate `0` values.
- `vocalocart-nextjs/src/app/api/wishlist/route.ts` — `productId` body validation.
- `vocalocart-nextjs/src/app/api/orders/[id]/route.ts` — `id` route param validated as a positive integer.

Deliberately left unchanged: `admin/upload` (file upload, not a JSON body — existing manual MIME/size checks are the right tool), `admin/orders` (no user input to validate), `webhook` (already validated by Stripe's cryptographic signature check, a stronger guarantee than Zod).

### 5. Accessibility pass on cart/checkout/address forms — `2.4`

- `vocalocart-nextjs/src/app/addresses/page.tsx` — every field now has a proper `htmlFor`/`id` pairing between label and input.
- `vocalocart-nextjs/src/app/checkout/page.tsx` — address selector converted to a semantic `<fieldset>`/`<legend>` radio group; coupon input got a proper (visually-hidden) label plus `aria-invalid`/`aria-describedby`/`role="alert"` on its error message.
- `vocalocart-nextjs/src/components/QuantityStepper.tsx` — wrapped in `role="group" aria-label="Quantity"`; the numeric readout is now `aria-live="polite"` so screen readers announce changes (benefits cart page and PDP automatically).

### 6. Add GitHub Actions CI for lint + typecheck — `2.8`

- `.github/workflows/ci.yml` (new) — runs on every PR and push to `main`: install, `prisma generate`, lint, typecheck (later extended with a test step in Step 7).
- Added a `typecheck` script to `package.json`.
- Fixed 3 pre-existing lint errors that were blocking a green build (unrelated to earlier steps, but CI needs to actually pass):
  - `src/lib/auth.ts` — removed an unnecessary `as any` cast (`User.isAdmin` is already typed via `next-auth.d.ts`).
  - `src/components/Navbar.tsx` — replaced a `setState`-in-effect pattern (closing the mobile menu on route change) with React's documented "adjust state during render" pattern.
  - `src/app/checkout/complete/page.tsx` — moved a synchronous `setState('error')` out of the effect body into the `useState` initializer, since the validity of the redirect params is knowable synchronously from the URL.

### 7. Add Vitest and unit tests for cart/shipping/discount logic — `2.3`

Extracted the shipping-threshold and coupon-discount math (previously duplicated with slight drift across 4 files) into a pure module, then added tests against it:

- `vocalocart-nextjs/src/lib/pricing.ts` (new) — `calculateShipping`, `isCouponApplicable`, `calculateDiscount`, `calculateOrderTotal`.
- Wired into `create-order-from-cart.ts`, `create-intent/route.ts` (also fixed a missing `.toUpperCase()` on coupon lookup), `cart/page.tsx`, `checkout/page.tsx`.
- `vocalocart-nextjs/vitest.config.mts`, `package.json` (`test`, `test:watch`, `test:coverage` scripts).
- `vocalocart-nextjs/src/lib/pricing.test.ts` — 15 tests (shipping boundary, coupon expiry/max-uses/min-order, percentage/fixed discount math, total clamping).
- `vocalocart-nextjs/src/hooks/use-cart.test.ts` — 4 tests on cart totals.
- Added a `Unit tests` step to `ci.yml`.

True consumption-tax logic doesn't exist yet as of this step (Step 9 below, schema checkpoint) — tax tests will slot into `pricing.ts` once that lands.

**Verification applied to every step above:** `tsc --noEmit`, `ReadLints` on touched files, and either `npm test` or a dev-server smoke test (`curl` against affected routes) before moving to the next step.

### 8. Swap product `<img>` tags for `next/image` — `1.5`

Converted every raw `<img>` rendering product/order imagery to `next/image`, matching each container's actual sizing: `fill` + a `sizes` prop for the responsive grid/PDP images (`ProductCard`, PDP hero) and cart/checkout/order-history thumbnails (fixed pixel sizes, now with a `relative` wrapper), and explicit `width`/`height` for the two admin-panel thumbnails that aren't in a sized wrapper. Removed the now-unneeded `eslint-disable-next-line @next/next/no-img-element` comments.

- `vocalocart-nextjs/src/components/ProductCard.tsx`
- `vocalocart-nextjs/src/app/product/[id]/page.tsx`
- `vocalocart-nextjs/src/app/cart/page.tsx`
- `vocalocart-nextjs/src/app/checkout/page.tsx`
- `vocalocart-nextjs/src/app/orders/page.tsx`
- `vocalocart-nextjs/src/app/admin/products/page.tsx`

### 9. Add 消費税 (10%) tax line to cart, checkout, and order totals — `1.3` / `2.5`

Added `Order.taxAmount` after explicit go-ahead (schema change, per the doc's own "report back before moving on" rule). Tax is 10% of (item subtotal − discount), computed by a new `calculateTax` in `pricing.ts` and floored to the nearest yen; shipping is charged on top and isn't itself taxed. `calculateOrderTotal`'s signature grew a `tax` parameter, threaded through every call site. Both cart and checkout summaries now show a `消費税 (10%)` line, and the order-history expanded view now shows a full subtotal/shipping/coupon/tax/total breakdown per order (shipping and subtotal are derived at render time from the order's line items rather than newly persisted, consistent with how shipping was never persisted before this).

**Incidental but important discovery while adding this migration:** `prisma migrate dev` refused to run, reporting the dev database had drifted from migration history — the `coupon` table and three `order` columns (`coupon_code`, `discount_amount`, `stripe_payment_intent_id`) existed live but were never captured in a migration file (almost certainly applied via `prisma db push` during the original coupon feature work, before this execution log existed). Left unfixed, `prisma migrate deploy` against a fresh production database would have silently produced a database missing the entire coupon feature. Fixed by hand-authoring the missing migration from the actual live schema (verified via `prisma db pull --print`) and marking it applied on the dev DB with `prisma migrate resolve --applied` (no data loss, nothing re-executed), *then* generating the real `taxAmount` migration on top of a now-consistent history. See `docs/vocalocart-deployment-checklist.md` — this directly affects deploy readiness.

- `vocalocart-nextjs/prisma/schema.prisma` (`Order.taxAmount`)
- `vocalocart-nextjs/prisma/migrations/20260227030000_add_coupon_and_order_payment_fields/` (new — backfilled, not a new schema change)
- `vocalocart-nextjs/prisma/migrations/20260816045020_add_order_tax_amount/` (new)
- `vocalocart-nextjs/src/lib/pricing.ts` (`TAX_RATE`, `calculateTax`, `calculateOrderTotal` signature)
- `vocalocart-nextjs/src/lib/pricing.test.ts` (new `calculateTax` tests, updated `calculateOrderTotal` tests)
- `vocalocart-nextjs/src/lib/create-order-from-cart.ts`
- `vocalocart-nextjs/src/app/api/payments/create-intent/route.ts`
- `vocalocart-nextjs/src/app/cart/page.tsx`
- `vocalocart-nextjs/src/app/checkout/page.tsx`
- `vocalocart-nextjs/src/app/orders/page.tsx`

### 10. Add rate limiting to auth, checkout, and search routes — `2.2`

Added a fixed-window in-memory limiter (`src/lib/rate-limit.ts`) wired into the existing `middleware.ts` fast-fail layer, scoped narrowly to exact path+method rather than whole-prefix bans — `POST /api/auth/register` and `POST /api/auth/callback/credentials` (10/min), `POST /api/payments/create-intent` and `POST /api/orders` (20/min), `GET /api/products` (60/min) — so read-only calls like `/api/auth/session` (fired on every page load) are never caught by a limiter meant for brute force. Documented the known tradeoff directly in the code: state is per warm serverless/edge instance, not a shared store, so it blunts single-source abuse but doesn't hold under a distributed attacker; noted the swap-in point (Upstash Redis / Vercel KV) if that's ever needed.

- `vocalocart-nextjs/src/lib/rate-limit.ts` (new)
- `vocalocart-nextjs/src/lib/rate-limit.test.ts` (new — 4 tests: allow-under-limit, block-over-limit, window-reset via fake timers, independent keys)
- `vocalocart-nextjs/src/middleware.ts`

### 11. Add a related-products section on the PDP — `1.2`

`GET /api/products/[id]` now also returns up to 4 same-category products (excluding the current one, in-stock first) in a single response — no extra round trip from the page. Rendered as a "You might also like" grid below the main product using the existing shared `ProductCard`.

- `vocalocart-nextjs/src/app/api/products/[id]/route.ts`
- `vocalocart-nextjs/src/app/product/[id]/page.tsx`

### 12. Add shipping estimate + return-policy copy near the Add to Cart CTA — `1.2`

Added a short shipping-threshold line (reusing `FREE_SHIPPING_THRESHOLD` from `pricing.ts` so it can't drift from the real logic) and a 30-day-returns line directly under the Add to Cart / wishlist buttons on the PDP.

- `vocalocart-nextjs/src/app/product/[id]/page.tsx`

### 13. Add per-product metadata + JSON-LD — `1.5`

Added `src/app/product/[id]/layout.tsx` — a Server Component segment layout wrapping the existing `'use client'` PDP unchanged, per the "no RSC migration" constraint. It exports `generateMetadata` (per-product `<title>`/description/OG tags) and renders a `schema.org` `Product` JSON-LD `<script>` block. Both do their own small server-side product lookup rather than touching the client page's data flow. Verified server-rendered output directly with `curl` (title tag and JSON-LD both present in the HTML).

- `vocalocart-nextjs/src/app/product/[id]/layout.tsx` (new)

### 14. Enable Stripe konbini as a payment method — `2.5`

Confirmed the account-side requirement first: since Stripe's August 2023 payment-methods migration, `automatic_payment_methods` defaults to `true` when `payment_method_types` isn't set, so eligible methods (including konbini, JPY-only) surface automatically once enabled in the Stripe Dashboard — no code was strictly required. Made it explicit anyway rather than relying on an implicit API default, and set a Japan-appropriate `product_description` for the convenience-store receipt instead of Stripe's generic placeholder.

- `vocalocart-nextjs/src/app/api/payments/create-intent/route.ts`

**Remaining external step (not IDE-executable):** konbini must still be turned on in the Stripe Dashboard (Settings → Payment methods) for it to actually appear to customers — flagged in `docs/vocalocart-deployment-checklist.md`.

**Verification applied to steps 8–14:** `tsc --noEmit`, `npm run lint`, `npm test` (26 tests passing, up from 19), and a full `npm run build` after every step; live-verified the related-products API shape, PDP metadata/JSON-LD HTML output, and the `taxAmount` column via direct Prisma queries against the dev database with a running dev server.

---

## Incidental fixes made along the way

- Turbopack dev-server crash (generic `/_error` fallback page, HTTP 500) after heavy file churn across Steps 1–7 — fixed by killing the stuck process and clearing `.next`, no code change needed.
