# VocaloCart — Manual Edge-Case & Security Testing Guide

A hands-on test plan for the six risk areas below, written against the actual `vocalocart-nextjs` codebase (not generic advice). Each section says exactly what to do, what file/logic governs the expected outcome, and what a real bug would look like versus expected/acceptable behavior.

**Read this first — one finding from code review, before you even start testing:**

> Section 3's first test (failed payment vs. inventory) is flagged by the brief as the highest-stakes one. Having read `src/app/checkout/page.tsx`, `src/app/api/payments/create-intent/route.ts`, and `src/lib/create-order-from-cart.ts` directly, I can tell you what you will almost certainly observe before you test it: **stock is never checked before Stripe charges the customer.** The stock check only happens *after* payment succeeds, when the order is created. If stock hits zero in that window, the customer has already been charged and no order/refund happens automatically — this is even called out in an existing code comment (`create-order-from-cart.ts`, webhook path): *"Payment already succeeded but stock ran out... No automatic remedy here (no refund/notification wiring yet)."* Test 3.1 below is written to prove this precisely and show you the exact reproduction. This is a real, reproducible gap, not a hypothetical — treat a "charged, no order, no refund" result as **the expected finding**, and treat "somehow it refunded or blocked the charge" as the surprise.

---

## Setup you'll need before starting

- **Two test accounts.** Seeded ones already exist: `test@vocalocart.com` / `user123`, and `admin@vocalocart.com` / `admin123` (from `prisma/seed.ts`). Register a third (`userB@test.com`) via `/register` for the two-account authorization tests in Section 5.
- **A way to send raw HTTP requests with custom cookies** — `curl` (examples below) or Postman/Insomnia. You'll need this to bypass the UI and hit API routes directly.
- **Direct DB access**, to manipulate stock/data behind the app's back. Easiest: a throwaway Node script using the same `DATABASE_URL` from `.env`/`.env.local`, e.g.:
  ```bash
  cd vocalocart-nextjs
  node -e "
  require('dotenv').config();
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  pool.query('UPDATE product SET stock_quantity = 0 WHERE id = 1').then(() => pool.end());
  "
  ```
  Or use Neon's own SQL editor in the dashboard (Connect → SQL Editor) if you prefer a GUI over raw psql/scripts.
- **Stripe test mode.** Confirm `STRIPE_SECRET_KEY` in `.env.local` starts with `sk_test_`. Never do these tests with live keys.
- **Two browser sessions** for the multi-tab/multi-device tests — easiest is one normal window + one Incognito/private window, logged in as the same or different accounts as each test specifies.
- Run the app against your **local dev database**, not production — several of these tests intentionally corrupt data (set stock to 0, delete products) or hammer endpoints (concurrency test).

---

## 1. Auth / session edge cases

### Background you need
Sessions are JWT-based (`src/lib/auth.ts`), `maxAge: 24 * 60 * 60` (24h), stored in the `authjs.session-token` cookie (or `__Secure-authjs.session-token` over HTTPS). There's **no server-side session table** — the JWT itself is the whole session, self-verified by signature (`NEXTAUTH_SECRET`). This matters: there's no way to force-expire *one specific* session from the server; you can only wait out `maxAge`, or invalidate every session at once by rotating `NEXTAUTH_SECRET`.

`src/proxy.ts` protects **API routes only** (`matcher: ['/api/:path*']`) — it checks for the session cookie's mere presence on `/api/cart`, `/api/orders`, `/api/addresses`, `/api/wishlist`, `/api/users/me`, `/api/admin/*`, returning 401 if absent, before the request even reaches the route handler. Full JWT signature/expiry verification happens inside each handler via `auth()`. **Page routes** (`/cart`, `/wishlist`, `/my`, `/addresses`, `/checkout`, `/orders`, `/admin/*`) are *not* covered by this proxy matcher — every one of them is a client component that calls `useSession()` and redirects to `/login` in a `useEffect` if `status === 'unauthenticated'` (confirmed in each page's source). This is a real thing to test: protection there is client-side only.

### 1.1 — Expired session mid-action
Since 24h is impractical to wait out, simulate it two ways — they exercise different code paths:

**(a) Cookie naturally expired/removed** (the common real case — e.g. user closes laptop for a day):
1. Temporarily lower the session lifetime for this test only — in `src/lib/auth.ts`, change `maxAge: 24 * 60 * 60` to `maxAge: 15` (15 seconds). Restart the dev server.
2. Log in, open the cart page so `items` are loaded, wait 20+ seconds without navigating.
3. Try to add an item to cart, or go to checkout.
4. **Expected:** the cookie is gone once expired, so this behaves exactly like "no session" (see 1.2) — `GET /api/cart` etc. return 401, and the client-side `useCart` hook's `addItem` throws `Error('Failed to add to cart')` (caught by the calling page and shown as a toast), or the page's own `useSession` effect fires `router.push('/login')`. It should **not** silently fail or leave the UI showing stale cart contents as if the action succeeded.
5. **Revert the `maxAge` change** before moving on — don't ship the test value.

**(b) Tampered/invalid token still present** (simulates cookie theft/corruption, a different failure mode than natural expiry):
1. Log in normally (with the real 24h `maxAge`).
2. Open browser DevTools → Application/Storage → Cookies → find `authjs.session-token` (or the `__Secure-` prefixed one) → edit the value, flip a few characters in the middle.
3. Try to add to cart / load `/my`.
4. **Expected:** NextAuth's JWT decode fails signature verification → `auth()` returns `null` → every protected route treats this identically to no session (401 from the API, redirect from the page). It should **not** throw an unhandled 500, and should **not** partially trust the malformed token.

### 1.2 — Protected routes via direct URL, no session at all
1. Log out completely (clear cookies, or use a fresh Incognito window).
2. Visit these page URLs directly by typing them in the address bar: `/cart`, `/wishlist`, `/my`, `/addresses`, `/checkout`, `/orders`, `/admin/orders`, `/admin/products`.
3. **Expected:** each one should redirect to `/login` shortly after load (client-side redirect — you may see a brief flash of the page's loading skeleton first, since there's no server-side/SSR gate here; that's acceptable as long as no real data is ever fetched or shown). Confirm via the Network tab that any API calls those pages fire (e.g. `/api/cart`) return **401**, not real data — the redirect being client-side is fine *only if* the underlying data is never actually served.
4. Additionally, hit the APIs directly with no cookie at all, bypassing the UI:
   ```bash
   curl -i http://localhost:3000/api/cart
   curl -i http://localhost:3000/api/orders
   curl -i http://localhost:3000/api/addresses
   curl -i http://localhost:3000/api/admin/orders
   ```
   **Expected:** all four return `401 {"error":"Unauthorized"}` — this is `proxy.ts`'s fast-fail, and it should trigger before any DB query runs (fast response, no latency spike).

### 1.3 — Simultaneous sessions, concurrent cart edits
1. Log in as `test@vocalocart.com` in a normal window **and** in an Incognito window (two independent sessions, same account).
2. In Tab A, add Product 1 (quantity 1) to cart.
3. In Tab B (without refreshing first), add Product 1 (the *same* product) to cart too — try to fire both near-simultaneously (e.g. click "Add to cart" in both within a second of each other).
4. Refresh both tabs and check the final quantity for Product 1.
5. **Expected per current code** (`POST /api/cart` in `src/app/api/cart/route.ts`): the intended behavior is additive — each add should increment the stored quantity (`existing.quantity + quantity`), so two adds of 1 each should leave quantity = 2. **However**, this is implemented as a non-atomic read-then-write (`findUnique` → compute `existing.quantity + quantity` in JS → `update`), not Prisma's atomic `{ increment: quantity }`. If both requests's `findUnique` reads land before either's `update` writes, you can lose one of the increments (quantity ends at 2 total contributions but only reflects 1). **This is a real race condition to specifically try to catch** — fire the two adds as close together as possible (e.g. two `curl` calls launched in quick succession from separate terminals, both authenticated as the same user, both `POST /api/cart` with the same `productId`) to maximize the chance of overlapping reads:
   ```bash
   # terminal 1 and terminal 2, run within the same second, same session cookie
   curl -s -X POST http://localhost:3000/api/cart -H "Content-Type: application/json" \
     -b "authjs.session-token=<paste-token>" -d '{"productId":1,"quantity":1}'
   ```
   If the final quantity is less than the sum of what you sent (e.g. 1 instead of 2), that's the race — flag it as "cart never overwrites, but can drop an increment under concurrent adds" rather than "cart silently overwrites," since that's the mechanism actually present in the code.
6. Also test **different products** in each tab (Tab A adds Product 1, Tab B adds Product 2) — since these hit different DB rows (`@@unique([userId, productId])` on `productId`), there's no shared row to race on; both should reliably appear together. This isolates whether any issue is specific to same-product concurrent adds (as above) versus a broader merge problem.

---

## 2. Cart/state integrity under bad input

### 2.1 — Buying an item after it's zeroed out mid-cart
1. Log in, add Product 1 to cart (confirm it has stock > 0 first via `/api/products/1`).
2. In a second tab/session (or directly via DB), zero its stock:
   ```bash
   node -e "
   require('dotenv').config();
   const { Pool } = require('pg');
   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   pool.query('UPDATE product SET stock_quantity = 0 WHERE id = 1').then(() => pool.end());
   "
   ```
3. Go back to the first session's cart page, then attempt checkout (proceed all the way to "Place order" / Stripe payment).
4. **Expected, precisely, per code:**
   - The **cart page itself does not block this** — `GET /api/cart` returns the live `stock` field per item (so the UI *could* show a warning, but confirm whether it actually does — if it doesn't, that's a real UX gap worth flagging separately from the correctness question).
   - `POST /api/payments/create-intent` (`src/app/api/payments/create-intent/route.ts`) **does not check stock at all** — it will happily create a real Stripe PaymentIntent for the cart's total price regardless of current stock. Confirm this: you should be able to reach the Stripe payment form and see a valid amount.
   - **This is the critical part to actually verify** — go through with a successful test-mode payment (`4242 4242 4242 4242`). The payment will succeed. Then `POST /api/orders` (called by `/checkout/complete` right after Stripe redirects back) *should* reject the order creation with `409 {"error":"Insufficient stock for: <name>"}` (`InsufficientStockError` from `create-order-from-cart.ts`).
   - **The bug this proves:** at this point, Stripe has captured real money (test-mode, but the mechanism is identical to production), and no order exists. Check `/orders` — there should be no order for this payment. There is currently no automatic refund or alert for this — confirm that by checking your Stripe test dashboard: the PaymentIntent shows `succeeded`, permanently, with nothing pointing back to it. This is the reproduction of the Section-3-style bug, surfaced via a cart/stock path instead of a pure payment-decline path.

### 2.2 — Rapid-fire add-to-cart (double-submit)
1. On a product page, click "Add to cart" as fast as possible multiple times in a row (or, for a cleaner test, fire several concurrent `POST /api/cart` requests via `curl`/a small script, same session, same `productId`).
2. Check the resulting cart quantity.
3. **Expected:** same underlying mechanism as test 1.3 — each click *should* add its own quantity (no client-side debounce/disable-while-pending guard was found in `use-cart.ts`'s `addItem`, and no UI-level disable-on-click was found on the product page's add-to-cart button either — confirm this yourself by watching the Network tab for duplicate in-flight `POST /api/cart` calls from a burst of clicks). Whether the final quantity is correct (sum of all clicks) or under-counts (lost update) depends on exactly how much the requests overlap — same race as 1.3. Report both: (a) does the UI let you fire duplicate requests at all (missing debounce — a real, separate finding even if the count comes out correct), and (b) does the final count end up correct.

### 2.3 — Delete/deactivate the product directly from the DB while it's in a cart
1. Add Product X to your cart (confirm via `/api/cart` it's there).
2. Delete it directly from the DB, bypassing the app entirely:
   ```bash
   node -e "
   require('dotenv').config();
   const { Pool } = require('pg');
   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   pool.query('DELETE FROM product WHERE id = <X>').then(r => console.log(r), e => console.error(e.message)).finally(() => pool.end());
   "
   ```
3. **Expected, precisely, per `prisma/schema.prisma`:** `CartItem.product` has `onDelete: Cascade` (line ~92), so deleting the product should **cascade-delete the cart item too** — refresh `/cart` and the item should simply be gone, no ghost row, no crash. Same for `WishlistItem` (also `onDelete: Cascade`) — test the wishlist version of this too (add to wishlist, delete product directly, refresh `/wishlist`).
4. **The interesting counter-case:** repeat this with a product that has an existing **order** referencing it (e.g. product ID 1 or 2 from the seeded sample order in `prisma/seed.ts`, or any product a test checkout already ordered). `OrderItem.product` has **no** `onDelete` specified in the schema, which means the DB's real foreign-key constraint is enforced as-is (blocks the delete) rather than cascading.
   ```bash
   node -e "
   require('dotenv').config();
   const { Pool } = require('pg');
   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   pool.query('DELETE FROM product WHERE id = 1').then(r => console.log('deleted', r.rowCount), e => console.error('ERROR:', e.message)).finally(() => pool.end());
   "
   ```
   **Expected:** this should fail with a Postgres foreign-key violation (visible directly if you run the raw SQL above; if instead you delete via the *admin UI/API* — `DELETE /api/products/[id]` — it should surface as a generic `500 {"error":"Failed to delete product"}`, since that route's catch-all doesn't specifically detect this FK case). Confirm the admin UI doesn't crash the whole page and shows *some* error rather than silently doing nothing or appearing to succeed while leaving the product intact but the UI thinking it's deleted.

### 2.4 — Bad quantity input to cart update
```bash
# Negative quantity
curl -i -X PATCH http://localhost:3000/api/cart/<cartItemId> \
  -H "Content-Type: application/json" -b "authjs.session-token=<token>" \
  -d '{"quantity":-5}'

# Non-numeric quantity
curl -i -X PATCH http://localhost:3000/api/cart/<cartItemId> \
  -H "Content-Type: application/json" -b "authjs.session-token=<token>" \
  -d '{"quantity":"abc"}'

# Same for the add-to-cart endpoint
curl -i -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" -b "authjs.session-token=<token>" \
  -d '{"productId":1,"quantity":-3}'
```
**Expected:** all three should return `400` with a Zod validation message, not a 500 and not a silently-accepted bad value. `src/app/api/cart/[id]/route.ts`'s schema is `z.object({ quantity: z.number().int().min(0) })` (rejects negative, allows exactly `0` as the "remove item" signal — confirm quantity `0` actually removes the item rather than erroring). `src/app/api/cart/route.ts`'s add schema is `z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).default(1) })` (rejects `0` and negative outright). Non-numeric strings should fail Zod's `z.number()` type check before ever reaching a DB call.

---

## 3. Payment/Stripe boundary — highest real-world stakes

Use Stripe's official test cards (test mode only): `4242 4242 4242 4242` (success, any future expiry, any CVC), `4000 0000 0000 0002` (generic decline), `4000 0000 0000 9995` (insufficient funds decline). Full current list: https://stripe.com/docs/testing.

### 3.1 — Failed payment: does inventory get decremented anyway?
1. Add an item to cart, note the product's current stock (`GET /api/products/<id>`).
2. Go to checkout, use decline card `4000 0000 0000 0002`.
3. **Expected:** `stripe.confirmPayment()` returns an `error` client-side (`src/app/checkout/page.tsx`'s `handlePay`) — the code shows `toast.error(...)` and **never calls `POST /api/orders`** in this path (that only happens from `/checkout/complete`, which is only reached via Stripe's `return_url` redirect on completion — a hard decline at the Payment Element typically doesn't redirect at all). So the expected-correct outcome is: **no order created, no stock touched, user sees an error and can retry.** Confirm stock is unchanged via `GET /api/products/<id>` again.
4. This is the "sanity check" case — it should just work. The much more interesting version is 2.1/3.2 below, where payment *succeeds* but fulfillment can't happen — that's the direction the real risk lives in for this codebase, not the reverse.

### 3.2 — Payment succeeds but can order creation still fail? (This is where to focus — see the top-of-doc callout)
Same reproduction as test 2.1, restated as a pure payment-boundary test:
1. Add to cart, proceed to checkout, reach the Stripe Payment Element.
2. In a second session, zero the product's stock (or, alternative reproduction: delete the cart item's product from the DB entirely, mid-checkout, then let the payment succeed — this tests a slightly different failure inside `createOrderFromCart`, since the cart-items-with-product-include query would just return fewer items or the pre-check loop would behave differently depending on exact timing; worth trying both variants).
3. Pay with `4242 4242 4242 4242` (success).
4. Watch what happens at `/checkout/complete`: it calls `POST /api/orders` with the `paymentIntentId`. Expected response: `409 {"error":"Insufficient stock for: ..."}`.
5. **Check three things afterward:**
   - Stripe test dashboard → the PaymentIntent shows `succeeded` (money "captured").
   - `/orders` for this user → no matching order.
   - Server logs (`npm run dev`/`npm start` terminal) → you should see `console.error('Webhook: paid order could not be fulfilled —', ...)` *if* the Stripe webhook also fires and hits the same stock error via its safety-net path (only if you have `stripe listen --forward-to localhost:3000/api/payments/webhook` running, or a webhook configured) — confirming both the client path and the webhook safety-net path agree on this outcome, and that neither triggers a refund.
   - This confirms: no double-decrement (good — the atomic guard in `create-order-from-cart.ts` prevents that), but also no remedy for the customer who was already charged (the actual gap).

### 3.3 — Browser closed mid-checkout, after payment submits but before confirmation returns
1. Start checkout, submit payment with `4242 4242 4242 4242`.
2. Immediately after clicking pay (before the page can navigate to `/checkout/complete`), close the tab/browser entirely.
3. Wait ~10-30 seconds, then check `/orders` in a fresh session (same account).
4. **Expected:** if you have a Stripe webhook configured locally (`stripe listen --forward-to localhost:3000/api/payments/webhook` — see the comment atop `src/app/api/payments/webhook/route.ts`), the webhook's `payment_intent.succeeded` event should fire independently of the browser, and `handlePaymentIntentSucceeded` creates the order as a safety net — you should see the order appear in `/orders` even though the browser never got back to `/checkout/complete`. **If you don't have the webhook running locally, this is exactly the gap the safety net exists to cover** — without it, a browser closed at the wrong instant means payment succeeded with no order and no automatic recovery. Test this once **with** the CLI webhook listener running and once **without**, to see the difference directly — this demonstrates precisely why the webhook exists, not just that it exists.
5. Also worth confirming no **duplicate** order gets created if both the client (had it stayed open) and the webhook race to create the order for the same PaymentIntent — this is exactly what the idempotency check in Section 4 of `SCALE_AUDIT.md` already verified in code (unique constraint on `stripePaymentIntentId` + explicit pre-check), but confirming it live with two real concurrent creators (e.g. manually calling `POST /api/orders` right as a webhook event also fires) is a good practical double-check.

---

## 4. Input validation / injection basics

### Background
No `$queryRaw`/`$executeRaw` exists anywhere in `src/` — every DB query goes through Prisma's query builder, which parameterizes all values. **Classical SQL injection is not structurally possible here** regardless of what you type, because there's no code path that concatenates user input into a SQL string. The tests below are about confirming that, and about checking for XSS/oversized-input handling, which Prisma doesn't protect against on its own.

### 4.1 — SQL-meaningful characters and script tags in free-text fields
Try each of these in: the product search box (`?q=`), the contact form (`name`, `subject`, `message`), and an admin-created product's `name`/`description`:
```
' OR '1'='1
'; DROP TABLE product; --
<script>alert(document.cookie)</script>
<img src=x onerror=alert(1)>
```
**Expected:**
- Search (`GET /api/products?q=...`): the value flows into `prisma.product.findMany({ where: { name: { contains: q, mode: 'insensitive' } } } })` — Prisma parameterizes this, so it's treated as a literal substring to search for, not executable SQL. Expect zero results for garbage input, a normal `200` with an empty `products` array — not an error, not a crash.
- Contact form (`POST /api/contact`): goes straight into a **plain-text** email body (`text: `Name: ${name}...``, not `html:`) via Resend — a `<script>` tag would arrive literally as visible text in the email, not execute (mail clients don't execute script tags in plain-text emails, and this route doesn't even send an `html` body). Confirm by actually checking the received email in your Resend/Support inbox — you should see the literal tag text, not a popup or broken rendering.
- Product name/description (admin-created): stored as-is (no sanitization layer found), but every place these are later *rendered* is standard JSX (`{product.name}`, `{product.description}`) — React auto-escapes interpolated text, so a stored `<script>` should render as visible literal text on the product page, not execute. **The one place to specifically double check:** `src/app/product/[id]/layout.tsx` uses `dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}` to inject `schema.org` JSON-LD — if a product's `name`/`description` (which likely feed `jsonLd`) contain a literal `</script>` sequence, verify whether `JSON.stringify` alone is enough to prevent breaking out of the `<script>` tag it's injected into (it escapes `"` but not `</`, which is the classic JSON-in-script-tag escape gap) — view page source on a product with a deliberately crafted `</script><script>alert(1)</script>` in its name/description and confirm nothing executes.

### 4.2 — Absurdly long strings
Submit a 50,000-character string into the search box and the contact form's `message` field.
**Expected:** search should just return no results (Postgres `TEXT`/`VARCHAR` columns and Prisma have no built-in length cap on a `contains` filter — a giant string is just a giant literal to compare against, not a crash risk by itself, though check response time doesn't spike unreasonably). Contact form: `contactSchema` in `src/app/api/contact/route.ts` only has a `.min(10)` on `message` — **no `.max()`** — so a 50,000-char message will pass validation and attempt to send via Resend; confirm whether Resend itself rejects oversized emails (likely) and whether that failure is handled gracefully (`500 {"error":"Failed to send message"}`) rather than hanging or crashing the server.

### 4.3 — Bad quantity input
Already covered thoroughly in test 2.4 above (negative and non-numeric quantities to `/api/cart` and `/api/cart/[id]`) — no need to repeat, just cross-reference.

---

## 5. Authorization boundaries (object-level, not just "logged in")

This is the category the prompt correctly calls out as the most common real-world e-commerce vulnerability. Good news from code review: every user-owned resource route I checked **does** verify ownership (not just "is there a valid session") — but verify this yourself rather than trusting the summary, since this is exactly the kind of thing worth confirming hands-on.

### Setup
Log in as `test@vocalocart.com` (User A) and your new second account (User B) in two separate sessions. Get each one's real session cookie value from DevTools for use in `curl`.

### 5.1 — Cart items
1. As User A, add an item to cart, note the returned `cartItem.id`.
2. As **User B** (User B's session cookie), try:
   ```bash
   curl -i -X PATCH http://localhost:3000/api/cart/<userA_cartItemId> \
     -H "Content-Type: application/json" -b "authjs.session-token=<userB_token>" \
     -d '{"quantity":99}'
   curl -i -X DELETE http://localhost:3000/api/cart/<userA_cartItemId> \
     -b "authjs.session-token=<userB_token>"
   ```
3. **Expected:** `403 {"error":"Unauthorized"}` for both — `src/app/api/cart/[id]/route.ts` explicitly checks `cartItem.userId !== parseInt(session.user.id)` before allowing the mutation. Confirm User A's cart item is untouched afterward.

### 5.2 — Orders
1. As User A, place a real order (or use one from seed data — `test@vocalocart.com` has a seeded delivered order), note its `id`.
2. As User B:
   ```bash
   curl -i http://localhost:3000/api/orders/<userA_orderId> -b "authjs.session-token=<userB_token>"
   curl -i -X PATCH http://localhost:3000/api/orders/<userA_orderId> -b "authjs.session-token=<userB_token>"
   ```
3. **Expected:** both `403` — `src/app/api/orders/[id]/route.ts` checks `order.userId !== parseInt(session.user.id) && !session.user.isAdmin` on GET, and `order.userId !== parseInt(session.user.id)` on PATCH (note: PATCH has **no admin bypass**, unlike GET — worth confirming that's intentional, since it means even an admin can't cancel someone else's order through this specific endpoint; admins manage order status through the separate `/api/admin/orders/[id]` route instead).
4. **Also test the reverse — admin over-reach isn't the ask here, but confirm admin GET does work as intended:** as the seeded admin account, `GET /api/orders/<userA_orderId>` should succeed (`200`), since `!session.user.isAdmin` short-circuits the check.

### 5.3 — Addresses
1. As User A, create an address, note its `id`.
2. As User B:
   ```bash
   curl -i -X PUT http://localhost:3000/api/addresses/<userA_addressId> \
     -H "Content-Type: application/json" -b "authjs.session-token=<userB_token>" \
     -d '{"recipientName":"Hijacked"}'
   curl -i -X DELETE http://localhost:3000/api/addresses/<userA_addressId> -b "authjs.session-token=<userB_token>"
   ```
3. **Expected:** both `404 {"error":"Address not found"}` (not `403`) — `getOwnedAddress()` in `src/app/api/addresses/[id]/route.ts` returns `null` for a non-owned address, which the route then reports as "not found" rather than "forbidden." Functionally this is still correctly blocked; note the status-code difference from the cart/order routes (404 vs 403) as a minor inconsistency, not a security gap — either way User B cannot read or modify User A's address.

### 5.4 — Wishlist
`DELETE /api/wishlist/[productId]` is keyed by `productId`, not a wishlist-item ID — check `src/app/api/wishlist/[productId]/route.ts` to confirm it scopes the delete by the *current session's* `userId` + that `productId` (i.e. it can only ever delete the caller's own wishlist entry, because there's no way to target another user's row through this parameter shape at all — the query should be `where: { userId: <session>, productId: <param> }`, not a raw ID lookup). This is a different, actually simpler-to-get-right shape than the cart/order/address cases — confirm it in the source directly since it's worth understanding *why* this one has no possible cross-user vector by construction, rather than needing a runtime check to catch it.

### 5.5 — Admin routes
1. As **non-admin** User A (or B):
   ```bash
   curl -i http://localhost:3000/api/admin/orders -b "authjs.session-token=<userA_token>"
   curl -i -X PATCH http://localhost:3000/api/admin/orders/1 -b "authjs.session-token=<userA_token>"
   curl -i -X POST http://localhost:3000/api/admin/upload -b "authjs.session-token=<userA_token>"
   curl -i -X POST http://localhost:3000/api/products -H "Content-Type: application/json" \
     -b "authjs.session-token=<userA_token>" -d '{"name":"hack","price":1,"stock":1,"categoryId":1}'
   ```
2. **Expected:** all `403 {"error":"Unauthorized"}` (the `/api/admin/*` ones fail at `proxy.ts`'s session-presence check plus each handler's own `session?.user?.isAdmin` check; `/api/products` POST has no proxy-level protection since `/api/products` isn't in `protectedPrefixes`, so this one relies **entirely** on the in-handler `if (!session?.user?.isAdmin)` check in `src/app/api/products/route.ts` — worth confirming this one specifically works, since it's the only admin-gated route *not* backstopped by the proxy layer).

---

## 6. Data consistency under concurrency

### 6.1 — Two users buy the last unit simultaneously
This is the one genuine race-condition test where the code's defense is explicit and testable, not accidental.

1. Set a product's stock to exactly 1:
   ```bash
   node -e "
   require('dotenv').config();
   const { Pool } = require('pg');
   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   pool.query('UPDATE product SET stock_quantity = 1 WHERE id = 1').then(() => pool.end());
   "
   ```
2. As **both** User A and User B, add that product (quantity 1) to their respective carts.
3. Fire both checkouts' final `POST /api/orders` calls **as close to simultaneously as possible** — the cleanest way is two `curl` processes launched in the same shell command so they actually overlap:
   ```bash
   curl -s -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" \
     -b "authjs.session-token=<userA_token>" -d '{}' & \
   curl -s -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" \
     -b "authjs.session-token=<userB_token>" -d '{}' & \
   wait
   ```
   (No `paymentIntentId` needed for this test if you just want to exercise the stock guard directly — omitting it skips the Stripe-verification branch and goes straight to `createOrderFromCart`, which is exactly the logic under test here.)
4. **Expected, per `src/lib/create-order-from-cart.ts`:** exactly **one** request should succeed (`201`, order created, stock now `0`), and the other should get `409 {"error":"Insufficient stock for: <name>"}`. This is enforced by the atomic conditional update inside the transaction:
   ```
   tx.product.updateMany({ where: { id, stock: { gte: quantity } }, data: { stock: { decrement: quantity } } })
   ```
   Whichever transaction commits second sees `updated.count === 0` (the `WHERE stock >= quantity` no longer matches once the first transaction already dropped it to 0) and throws `InsufficientStockError` — it does **not** see a stale pre-transaction read, because the guard is inside the same atomic statement as the decrement, not a separate check-then-write.
5. **What a real bug would look like:** stock ending at `-1` (both succeeded — oversold), or stock still `1` (both failed — undersold/lost sale), or a `500` instead of a clean `409` for the loser. None of these should happen per the code as written; confirm they don't happen in practice, ideally repeating the race 5-10 times in a loop (network/timing jitter means a single run isn't fully conclusive either way):
   ```bash
   for i in $(seq 1 10); do
     node -e "require('dotenv').config(); const {Pool}=require('pg'); const p=new Pool({connectionString:process.env.DATABASE_URL}); p.query('UPDATE product SET stock_quantity=1 WHERE id=1').then(()=>p.end())"
     curl -s -o /tmp/a.json -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" -b "authjs.session-token=<userA_token>" -d '{}' &
     curl -s -o /tmp/b.json -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" -b "authjs.session-token=<userB_token>" -d '{}' &
     wait
     echo "round $i: A=$(cat /tmp/a.json | head -c 60) | B=$(cat /tmp/b.json | head -c 60)"
   done
   ```
   Note: this loop assumes both users' carts are re-populated with the product before each round if `createOrderFromCart` clears the cart on success — re-add the item to both carts each iteration if needed (`POST /api/cart`), and re-set stock to 1 each round as shown.

---

## Reporting results

For each test, note: **what you did**, **what happened**, and **whether it matched the "Expected" section above**. The most important one to write up in detail regardless of outcome is 3.2/2.1 (the charge-without-fulfillment gap) — that's a real, fixable issue (e.g. checking stock in `create-intent`, or holding/reserving stock at cart-add time, or wiring up an automatic refund in the webhook's failure branch) worth a follow-up conversation once you've confirmed it hands-on.
