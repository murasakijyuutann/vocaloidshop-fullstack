# VocaloCart — Scale & Failure-Mode Audit

Findings from a local load test against a **production build** (`next build && next start`) of `vocalocart-nextjs`, run 2026-09-06. Stack confirmed against the actual repo: Next.js 16.1.6 (App Router), TypeScript, Prisma 7 + `@prisma/adapter-pg` + `pg`, PostgreSQL on Neon (`ap-southeast-1`), NextAuth v5, Stripe, Zustand, Tailwind/shadcn.

Ground rule followed: no infrastructure (Redis, queues, replicas, sharding) was added speculatively. Where something wasn't justified by real data, that's stated plainly below instead.

---

## Step 1 — Route map

| Method | Route | DB? | Read/write classification |
|---|---|---|---|
| GET | `/api/products` | read | **Read-heavy** — hit on every catalog view, supports search/filter/sort/paginate |
| POST | `/api/products` | write | Admin, very low volume |
| GET | `/api/products/[id]` | read | **Read-heavy** — product detail + related products |
| PUT/DELETE | `/api/products/[id]` | write | Admin, very low volume |
| GET | `/api/categories` | read | Read-heavy, near-static (admin-only writes) |
| POST/PUT/DELETE | `/api/categories(/[id])` | write | Admin, very low volume |
| GET/POST/DELETE | `/api/cart` | read+write | Per-user, low absolute volume |
| PATCH/DELETE | `/api/cart/[id]` | write | Per-user, low volume |
| GET/POST | `/api/wishlist`, DELETE `/api/wishlist/[productId]` | read+write | Per-user, low volume |
| GET/POST | `/api/orders`, GET/PATCH `/api/orders/[id]` | read+write | POST = checkout write path (order + stock decrement transaction) |
| GET/POST/PUT/DELETE | `/api/addresses(/[id])` | read+write | Per-user, low volume |
| POST | `/api/payments/create-intent` | light write | Calls Stripe API + reads cart/coupon |
| POST | `/api/payments/webhook` | write | Stripe-driven; see Step 4 |
| POST | `/api/coupons/validate` | read | Low volume |
| POST | `/api/contact` | none | Resend only, no DB |
| GET | `/api/admin/orders`, PATCH `/api/admin/orders/[id]` | read+write | Admin-only |
| POST | `/api/admin/upload` | none | Vercel Blob only |
| POST | `/api/auth/register` | write | One-time per user |
| GET/PATCH | `/api/users/me` | read+write | Per-user |
| `/api/auth/[...nextauth]` | read | Session/credentials check on every authenticated request |

Highest natural traffic, matching Step 2's priority order: `/api/products`, `/api/products/[id]`, `/api/categories`.

**Architectural note that shapes everything below:** `src/app/page.tsx` is a **client component**. The server-rendered `/` route does *no* data fetching — it renders an empty shell, then the browser calls `/api/products` and `/api/categories` after hydration. So "homepage load" from the database's perspective *is* `/api/products` + `/api/categories`, not `GET /`. An initial test against `/` gave a misleadingly fast ~4ms median — that's real, but it's not testing what matters.

---

## Step 2 — Load test results and the actual first bottleneck

### Methodology note (worth stating plainly)
The first test run was against `next dev`. It showed p97.5 latency spiking to 4.6s at only 10 concurrent connections — but the dev server log showed this was Turbopack compiling each route lazily on first hit (`compile: 3.8s` per request), not a backend issue. After warm-up, dev-mode latency dropped to ~50ms and stayed flat. **`next dev` is not representative of production and was discarded** — all numbers below are from `next build && next start`.

### Raw DB latency baseline
Direct `pg` round-trip to the Neon endpoint (`ap-southeast-1`) from the dev machine: **~79ms per query** once warm (first connection includes a ~1.7s TLS handshake). This is the physical floor for any DB-touching request from this location — worth knowing before judging any endpoint's latency.

### First thing that actually failed: the app's own rate limiter (working as designed)
A naive `autocannon -c 10` run against `/api/products` returned **19,942 HTTP 429s out of 20,000 requests**. This is *not* a bug — `src/proxy.ts` rate-limits `GET /api/products` to 60 req/min per IP (documented in the README as intentional). The reason it triggered almost instantly in this local test: `autocannon` sends no `X-Forwarded-For` header, so every request collapsed into one `"unknown"` IP bucket. On a real Vercel deployment, Vercel's edge populates `X-Forwarded-For` with the real client IP, so distinct users get distinct buckets — the limiter's design is correct. The known tradeoff is already documented in `rate-limit.ts` itself (per-warm-instance in-memory state; a cold start resets it; a distributed attacker could exceed the nominal limit by the instance count) — nothing to add there.

To find the *real* infrastructure ceiling underneath the rate limiter, I re-ran the test simulating many distinct users (unique `X-Forwarded-For` per virtual connection) — i.e. the traffic pattern real concurrent users actually produce.

### Real bottleneck: the app's own DB connection pool, not Neon

| Endpoint | Concurrency | Median latency | Throughput | Errors |
|---|---|---|---|---|
| `/api/products` | 10 | 242 ms | 38 req/s | 0 |
| `/api/products` | 30 | 720 ms | 37.5 req/s | 0 |
| `/api/products` | 100 | 2,410 ms | 36.3 req/s | 0 |
| `/api/products/[id]` | 10 | 322 ms | 27 req/s | 0 |
| `/api/products/[id]` | 30 | 956 ms | 30 req/s | 0 |

The signature is unambiguous: **throughput is flat (~36–40 req/s) regardless of concurrency, while latency scales linearly with it, and error count stays at zero.** That's textbook queuing behavior against a fixed-size resource, not a crash.

**Root cause, confirmed in code:** `src/lib/prisma.ts` creates `new Pool({ connectionString: process.env.DATABASE_URL })` with no `max` set — `pg`'s default pool size is **10 connections**, per warm server instance. `GET /api/products` runs its count+list queries in parallel via `Promise.all`, so each request needs 2 simultaneous connections; ~5 concurrent requests already saturate the pool. Because `pg`'s default `connectionTimeoutMillis` is 0 (wait forever for a free client), requests never error — they just queue and get progressively slower.

Neon itself is not the constraint here: the connection string already uses the pooled/PgBouncer endpoint (`-pooler` in the hostname), which comfortably handles far more than 10 concurrent connections even on lower tiers. The ceiling is entirely this app's own in-process pool size, not the database.

On Vercel, this translates to: each serverless function instance gets its own 10-connection pool; the effective ceiling scales with how many instances Vercel spins up, but every individual instance still queues past ~5 concurrent product-listing requests until autoscaling catches up.

---

## Step 3 — What caching would legitimately help

- **Product catalog (`/api/products`) and categories (`/api/categories`)** — legitimate caching candidates. Data changes only via low-volume admin writes; the build output confirms **zero routes currently use ISR or any caching** (every route in `next build`'s output was marked `ƒ` / fully dynamic). Given Step 2's data — real, measured latency degradation starting under modest concurrency, entirely attributable to a fixed connection-pool ceiling — caching these reads would directly help: a cache hit needs zero DB connections, freeing the pool for writes and uncached reads. Next.js's built-in caching (`unstable_cache` around the Prisma calls, keyed by the query params, with `revalidateTag` invalidation wired into the admin product/category mutation routes) can fully cover this — no external cache layer needed.
- **Per-user data (cart, wishlist, order history, addresses)** — should **not** be naively cached. It's session-specific (a shared cache key risks leaking one user's cart to another — a real correctness bug, not just a performance one), and read volume per user is inherently low, so there's little to gain. If ever cached, it would need a cache key scoped per-user and invalidation on every mutation (add/remove/update) — more invalidation complexity than the low read volume justifies.
- **Checkout / payments (`create-intent`, `orders` POST, the webhook)** — must never be cached; correctness depends on reading current stock/cart state at the moment of the write.
- **Coupon validation** — read-only, but caching risks serving a stale "valid" response for a code that just expired or hit its usage limit. Called rarely (once per checkout); not worth the risk for the volume involved.

**Redis was considered and is not justified right now.** The one legitimate caching candidate (product/category reads) is fully served by Next's built-in in-process caching — there's a single Postgres instance as the source of truth, one deployment, and no cross-instance cache-consistency problem to solve. Reaching for Redis here would add a new dependency, a new network hop, and a new secret to manage, in exchange for saving the same ~80ms Neon round-trip that in-process caching already eliminates on a hit.

---

## Step 4 — Idempotency check (real correctness issue, not a scale one) — already correct, no fix needed

Read `src/app/api/payments/webhook/route.ts` in full. Stripe webhook redelivery is handled correctly, at two layers:

1. **Explicit pre-check:** `handlePaymentIntentSucceeded` looks up `prisma.order.findUnique({ where: { stripePaymentIntentId: pi.id } })` before doing anything; if an order already exists for that PaymentIntent, it's a no-op.
2. **DB-enforced backstop:** `stripePaymentIntentId` is a `@unique` column, so even a race between two redeliveries (or a redelivery racing the client's own `POST /api/orders`) fails the second writer with a unique-constraint violation, caught explicitly via `isUniqueConstraintViolation` and treated as a no-op rather than an error.

No fix was made here because none was needed — flagging this in the report as a verified-correct finding rather than a bug, per the brief's instruction to treat this as a real check, not a simulated one.

---

## Step 5 — What was deliberately NOT added, and why

- **Redis** — not justified. See Step 3: the one caching-worthy read path is fully covered by Next's built-in caching; there's no multi-instance cache-consistency problem or QPS level that in-process/DB-level performance can't handle at this project's real scale (a solo/portfolio project, not live production traffic).
- **Message queues (Kafka/SQS/RabbitMQ)** — not justified. Checkout's only side effect beyond the DB write is a synchronous Resend email call for the contact form (unrelated to checkout) — there is no slow, queueable downstream side effect (e.g. fulfillment webhook, inventory sync to a separate system, analytics pipeline) in the current checkout flow that would benefit from decoupling via a queue.
- **Read replicas** — not justified. Read traffic (product catalog) is nowhere near a single Postgres primary's read capacity; the actual bottleneck found (Step 2) is the app's own 10-connection pool size, which a read replica wouldn't fix — raising `max` on the existing pool, or caching, addresses the *actual* measured problem more directly and for free.
- **Database sharding** — not remotely justified. This is a handful of tables with a small catalog; nowhere near the data volume where a single Postgres instance becomes the constraint.

### Hypothetical: what would justify each pattern (labeled explicitly as hypothetical — not built)

- **Redis** would become justified if the app ran on multiple long-lived server instances that each needed a *consistent* view of a frequently-invalidated cache (e.g. real-time inventory counts shown across many concurrent shoppers), or if read QPS on the catalog grew high enough that even a fully warmed in-process cache per instance couldn't avoid redundant computation across instances cheaply.
- **Read replicas** would become justified if read traffic (catalog browsing, order history) grew to a volume where it measurably competed with write traffic (checkout, stock decrements) for the primary's connection/IO capacity — i.e. if raising the pool size and adding caching were no longer enough headroom.
- **Message queues** would become justified if checkout needed to trigger multiple slow, independent downstream effects — e.g. a real fulfillment/shipping API call, a separate inventory system sync, or an analytics event pipeline — where synchronous execution would meaningfully slow down the checkout response or where a downstream failure shouldn't be allowed to fail the whole checkout.
- **Sharding** would become justified only at a data volume or write-throughput level far beyond what a single well-tuned Postgres instance (even a large Neon compute) can hold or serve — multiple orders of magnitude past anything relevant here.

### Fixes implemented and verified (2026-09-06)

Both changes below were applied after the findings above, then re-verified with the same load-test methodology (production build, `next start`, distinct simulated client IPs to isolate the effect from the rate limiter).

**1. Raised the connection pool ceiling** — `src/lib/prisma.ts`: `pg.Pool`'s `max` raised from the implicit default of 10 to 25, since Neon's pooled/PgBouncer endpoint — not the app — has real headroom here.

**2. Added tag-based caching for the catalog read path** — new `src/lib/catalog-cache.ts`, using `unstable_cache` (Next's built-in cache, no Redis) with a 60s revalidation window and a shared `'catalog'` tag:
- `getCachedProductList`, `getCachedProduct`, `getCachedCategories` wrap the Prisma queries behind `GET /api/products`, `GET /api/products/[id]`, and `GET /api/categories`.
- `invalidateCatalogCache()` (calls `revalidateTag('catalog', 'max')` — Next.js 16 requires the explicit `'max'` profile argument) is wired into every product/category mutation: `POST /api/products`, `PUT`/`DELETE /api/products/[id]`, `POST /api/categories`, `PUT`/`DELETE /api/categories/[id]`.
- Per-user routes (cart, orders, wishlist, addresses) were **not touched** — consistent with Step 3's reasoning that per-user data must not be cached this way.
- One shared tag rather than separate `products`/`categories` tags, since product listings embed category names and category listings embed product counts — either mutation can stale the other, and admin write volume is low enough that finer-grained invalidation isn't worth the added complexity.

**Verification — `/api/products/[id]`** (chosen for a clean comparison because it isn't subject to the search rate limiter, unlike `/api/products`):

| Concurrency | Before: median latency | Before: throughput | After: median latency | After: throughput |
|---|---|---|---|---|
| 10 | 322 ms | 27 req/s | 10 ms | ~890 req/s |
| 30 | 956 ms | 30 req/s | 32 ms | ~910 req/s |
| 100 | *(not tested before fix)* | — | 104 ms | ~870 req/s |

Roughly a **30x throughput improvement** and a 20-30x latency drop, with zero errors at any concurrency tested.

Re-testing `/api/products` itself surfaced a secondary, expected effect: once responses got fast, a handful of simulated IPs blew past the 60 req/min search rate limit within a second (previously, the slow ~36 req/s ceiling meant a single IP took ~15s+ to hit that cap, so it rarely triggered during a short burst test). This is the two protections working independently and correctly, not a bug: the rate limiter still caps sustained single-IP abuse regardless of how fast the backend is, while caching is what lets *legitimate distributed traffic* (many different real users, each well under the per-IP cap) scale from ~36 req/s aggregate to potentially thousands.
