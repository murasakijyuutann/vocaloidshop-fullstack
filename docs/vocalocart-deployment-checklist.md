# VocaloCart Vercel Deployment Checklist

Assessment of `vocalocart-nextjs` deploy-readiness for Vercel, done 2026-08-16. Update this file as items are completed.

**Status: code-side blockers fixed. Dashboard/account setup still required before first deploy.**

---

## Code-side findings (fixed in commit `9432192`)

| # | Issue | Fix |
|---|---|---|
| 1 | No `postinstall: "prisma generate"` in `package.json` — Vercel can restore `node_modules` from cache without regenerating the Prisma Client, causing runtime crashes on every DB route even though the build itself succeeds. | Added `"postinstall": "prisma generate"`. |
| 2 | `next.config.ts` re-exposed `NEXTAUTH_SECRET` via the `env` block, which inlines the value into any compiled JS that references it (including client bundles), with no functional benefit since server code already reads `process.env` directly on Vercel. | Removed the `env` block entirely. |
| 3 | `.env.example` was excluded from git by the blanket `.env*` `.gitignore` rule, so the documented list of required env vars didn't actually exist in the repo. | Added `!.env.example` to `.gitignore`. |
| 4 | `.env.example` listed `STRIPE_PUBLISHABLE_KEY` but the code reads `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (it's read in a client component). | Corrected the variable name in `.env.example`. |

Verified after fixes: `npm run build` and `npm run lint` both pass clean (3 pre-existing lint warnings only, no errors).

## Migration history drift — found and fixed 2026-08-16

While adding the tax-line migration (execution log step 9), `prisma migrate dev` refused to run: the dev database had a `coupon` table and three `order` columns that existed live but were never captured in any migration file — almost certainly applied via `prisma db push` at some earlier point. Left as-is, `prisma migrate deploy` against a fresh production database would have silently produced a database **missing the entire coupon feature**, breaking checkout the moment a coupon code was used.

Fixed by hand-authoring the missing migration from the actual live schema (`prisma db pull --print`) and marking it applied on the dev database via `prisma migrate resolve --applied` (no data loss, nothing re-executed against dev), then generating the real tax-column migration on top of a now-consistent history. `prisma migrate status` now reports a clean, drift-free history — this was the last known correctness risk in the migration path to production.

## What was already correct (no action needed)

- Database is PostgreSQL via `@prisma/adapter-pg` (Neon/Supabase-compatible) — not SQLite.
- File uploads go to Vercel Blob (`@vercel/blob`), not local disk (which is ephemeral/read-only on Vercel).
- All API routes run on the default Node.js runtime — none accidentally declare `edge`, which would break Prisma/`pg`.
- Stripe webhook reads the raw request body before parsing, required for signature verification.
- `.env`, `.env.local` are correctly gitignored and were never committed.

---

## Remaining steps — dashboard/account work, not code

These can't be fixed by editing files; they require the Vercel/Neon/Stripe dashboards.

- [ ] Provision a production PostgreSQL database (separate from the dev one).
- [ ] Run `npx prisma migrate deploy` against the production database (decide manual vs. automated — see note below).
- [ ] Set these environment variables in the Vercel project settings, with **production** values:
  - `DATABASE_URL`
  - `NEXTAUTH_URL` (the real production domain)
  - `NEXTAUTH_SECRET`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
  - `SUPPORT_EMAIL`
  - `BLOB_READ_WRITE_TOKEN`
- [ ] Attach a Vercel Blob store to the project (this generates `BLOB_READ_WRITE_TOKEN`).
- [ ] Register a production Stripe webhook endpoint (`https://<domain>/api/payments/webhook`) and use *its* signing secret for `STRIPE_WEBHOOK_SECRET` — it's different from the local Stripe CLI secret.

### Migration strategy — undecided, revisit before first deploy

Two options, tradeoff not yet resolved:

- **Automated**: set the Vercel build command to `prisma generate && prisma migrate deploy && next build`. Zero manual steps, but every push to `main` runs migrations against production with no manual gate, and `DATABASE_URL` must be available at build time.
- **Manual** (leaning this way for now, given low migration frequency — 1 migration total as of this writing): run `npx prisma migrate deploy` by hand whenever schema changes, e.g. right after Step 9 below lands. Safer default for a solo project, costs one extra manual step per schema change.
