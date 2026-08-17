// Naive in-memory fixed-window rate limiter for `proxy.ts` (the renamed
// `middleware.ts` — Next.js 16 deprecated that convention; proxy now always
// runs on the Node.js runtime, Edge is no longer an option for it).
//
// Known tradeoff: state lives per warm Node.js instance, not in a shared
// store. On Vercel, concurrent invocations can land on different instances,
// so a distributed attacker could exceed the nominal limit by a multiple of
// the instance count, and a cold start resets the count to zero. This is
// still real protection against the common case (a single script hammering
// one endpoint) and costs nothing to run. If this ever needs to hold under
// real adversarial traffic, swap the `buckets` Map below for a shared store
// (Upstash Redis / Vercel KV) — the call sites in `proxy.ts` wouldn't need
// to change.
interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Opportunistic cleanup so long-lived warm instances don't leak memory for
// IPs that stop sending requests. Cheap relative to how rarely it runs.
const MAX_BUCKETS_BEFORE_SWEEP = 5000

function sweepExpired(now: number) {
  if (buckets.size < MAX_BUCKETS_BEFORE_SWEEP) return
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key)
  }
}

/** Returns true if `key` has exceeded `limit` requests within the current `windowMs` window. */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  sweepExpired(now)

  const bucket = buckets.get(key)
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  bucket.count += 1
  return bucket.count > limit
}
