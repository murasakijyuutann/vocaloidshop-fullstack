import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // `pg`'s default pool size is 10 if `max` isn't set. SCALE_AUDIT.md (Step 2,
  // 2026-09-06) measured this as the app's actual first bottleneck under load:
  // GET /api/products needs 2 simultaneous connections (count + list run via
  // Promise.all), so ~5 concurrent requests already saturate a 10-connection
  // pool — throughput plateaued at ~36-40 req/s with latency scaling linearly
  // past that point. Neon's pooled/PgBouncer endpoint (the `-pooler` host in
  // DATABASE_URL) comfortably handles far more than this, so the ceiling was
  // entirely this in-process pool, not the database. Raised to 25 as a direct
  // fix for that measured constraint, not a speculative increase.
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 25 })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
