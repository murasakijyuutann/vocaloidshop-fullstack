# VocaloCart — Scale & Failure-Mode Audit Brief (for IDE agent)

## Purpose
This is NOT a redesign or a feature build. The goal is to find where VocaloCart
*actually* breaks under load, and identify (without necessarily implementing)
where real caching/scale decisions would matter — so I can talk about this
honestly in system design interviews, backed by real data instead of
decorative patterns.

**Ground rule: do not add infrastructure (Redis, message queues, read
replicas, sharding) speculatively "to demonstrate the pattern." Only propose
or implement something if the audit below shows a concrete bottleneck it
would fix. If nothing in this app justifies a given pattern, say so plainly
instead of adding it anyway.**

Stack (confirm against actual repo, don't assume): Next.js 15 App Router,
TypeScript, Prisma + PostgreSQL (Neon), NextAuth v5, Stripe, Zustand,
Tailwind/shadcn. Repo: github.com/murasakijyuutann/vocaloidshop-fullstack.

## Step 1 — Map the real routes first
Before touching anything, list every API route / server action in the
project (under `src/app/api/` and any server actions) with:
- HTTP method + path
- Whether it reads or writes to the DB (or both)
- Rough read/write classification (e.g. product listing = read-heavy,
  checkout = write-heavy, cart mutation = write-heavy but low volume)

Output this as a table. This becomes the reference point for everything
below — don't guess at routes, read the actual source.

## Step 2 — Load test to find the real first bottleneck
Use k6 or Artillery (pick whichever installs cleaner in this environment) to
simulate concurrent traffic against the local dev server or a staging
deployment — not production/Vercel prod directly.

Priority order to test:
1. Product listing / homepage endpoint (likely highest natural traffic)
2. Product detail endpoint
3. Cart add/update
4. Checkout flow (be careful — do NOT hit real Stripe endpoints repeatedly
   with live keys; use Stripe test mode keys only)

For each, ramp concurrent virtual users until something breaks or degrades
sharply, and report:
- At what concurrency does p95 latency degrade noticeably
- What actually fails first (DB connection pool exhaustion is likely given
  Neon's connection limits on lower tiers — confirm actual error)
- Whether the bottleneck is DB, Prisma connection handling, Next.js
  server-side rendering cost, or something else

## Step 3 — Classify what caching would legitimately help
Using the read/write map from Step 1 and the bottleneck data from Step 2,
identify which specific endpoints would benefit from caching, and what kind:
- Static/rarely-changing data (product catalog) → candidate for
  cache-aside or ISR/static regeneration
- Per-user data (cart, order history) → explain why this should NOT be
  naively cached, and what invalidation would require if it were
- Any endpoint where caching would NOT meaningfully help — say so, and why

Only implement caching where Step 2's data actually shows benefit. Use
Next.js's built-in caching (fetch cache, ISR revalidation) before reaching
for an external cache layer like Redis — only propose Redis if there's a
concrete reason built-in caching can't cover it.

## Step 4 — Idempotency check (real issue, not simulated)
Check the actual Stripe webhook handler in this repo:
- Does it handle duplicate webhook delivery correctly (Stripe can and does
  redeliver)?
- Is there an idempotency key or dedup check before mutating order/payment
  state?
If this is missing, this is a real bug worth fixing regardless of the
system-design-prep angle — flag it clearly as a correctness issue, not a
scale one.

## Step 5 — Write up findings, not infrastructure
Produce a short markdown report (`SCALE_AUDIT.md` in repo root) covering:
- The route map from Step 1
- The load test results and the actual first bottleneck found, with numbers
- What caching (if any) was justified and implemented, with reasoning
- What was deliberately NOT added (message queues, sharding, read
  replicas) and why it isn't justified at this project's real scale —
  written so I can use this reasoning directly in an interview answer
- If time allows: one paragraph on what WOULD justify each of those
  patterns if this app suddenly had real production traffic (hypothetical,
  clearly labeled as such — don't build it)

## What NOT to do
- Do not add Kafka/SQS/RabbitMQ or any message queue
- Do not add database sharding or read replicas
- Do not add Redis unless Step 3's data specifically justifies it over
  Next.js's built-in caching
- Do not modify the Stripe integration beyond the idempotency check in
  Step 4
- Do not touch the existing frontend redesign work already in progress
