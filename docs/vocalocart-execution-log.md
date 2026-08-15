# VocaloCart Task Execution Log

Tracks actual execution against the [recommended order](./vocalocart-task-audit.md#recommended-execution-order) from the task audit. Each entry lists what changed, why, and how it was verified. Update this file as further steps are executed.

**Status: 7 of 14 steps complete.**

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

True consumption-tax logic doesn't exist yet (Step 9 below, schema checkpoint) — tax tests will slot into `pricing.ts` once that lands.

**Verification applied to every step above:** `tsc --noEmit`, `ReadLints` on touched files, and either `npm test` or a dev-server smoke test (`curl` against affected routes) before moving to the next step.

---

## Remaining (not yet started)

| # | Task | Section | Effort | Touches schema? |
|---|---|---|---|---|
| 8 | Swap product `<img>` tags for `next/image` | 1.5 | Medium | No |
| 9 | Add 消費税 (10%) tax line to cart, checkout, and order totals | 1.3 / 2.5 | Medium | Yes (`Order.taxAmount`) |
| 10 | Add rate limiting to auth, checkout, and search routes | 2.2 | Medium | No |
| 11 | Add a related-products section on the PDP | 1.2 | Low | No |
| 12 | Add shipping estimate + return-policy copy near the Add to Cart CTA | 1.2 | Low | No |
| 13 | Add per-product metadata + JSON-LD (via a segment layout, no full RSC migration) | 1.5 | Medium | No |
| 14 | Enable Stripe konbini as a payment method | 2.5 | Low | No (verify Stripe account setting) |

Step 9 needs a go-ahead before starting since it adds a column to `Order`. See the audit's ["Larger, architecture-touching items"](./vocalocart-task-audit.md#larger-architecture-touching-items) and ["Conflict to resolve"](./vocalocart-task-audit.md#conflict-to-resolve-isrssg-27-vs-no-rsc-migration) sections for items intentionally left out of this ordered list.

---

## Incidental fixes made along the way

- Turbopack dev-server crash (generic `/_error` fallback page, HTTP 500) after heavy file churn across Steps 1–7 — fixed by killing the stuck process and clearing `.next`, no code change needed.
