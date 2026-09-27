# VocaloCart Vercel Deployment Checklist

Assessment of `vocalocart-nextjs` deploy-readiness for Vercel, done 2026-08-16. Update this file as items are completed.

**Status (2026-09-27): deployed to production at https://vocalocart-dev.vercel.app. All setup steps below are done; post-deploy verification tests are still open.** Full record of the deployment session: [`vocalocart-deployment-log-2026-09-27.md`](./vocalocart-deployment-log-2026-09-27.md).

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

- [x] Provision a production PostgreSQL database (separate from the dev one). — Neon project `vocalocart-production` (`wispy-moon-24215406`), region `aws-us-east-1`.
- [x] Run `npx prisma migrate deploy` against the production database. — All 3 migrations applied manually on 2026-09-27.
- [x] Create the Vercel project with Root Directory `vocalocart-nextjs`. — Project `vocalocart-dev`, function region `iad1`, connected to GitHub (`main` auto-deploys).
- [x] Set these environment variables in the Vercel project settings, with **production** values:
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
- [x] Attach a Vercel Blob store to the project (this generates `BLOB_READ_WRITE_TOKEN`). — Public store `vocalocart-images`, `iad1`.
- [x] Register a production Stripe webhook endpoint (`https://<domain>/api/payments/webhook`) and use *its* signing secret for `STRIPE_WEBHOOK_SECRET` — it's different from the local Stripe CLI secret. — Test-mode endpoint `we_1UK73P3sP4vYw3AgaB0cV3kZ`, event `payment_intent.succeeded`.
- [x] Create categories and an admin account in production (the seed script is **not** run in production — it creates `admin123`/`user123` accounts).
- [x] Manual smoke test: register, log in, create a product with an image, complete a test purchase with `4242 4242 4242 4242`.

### Migration strategy — decided 2026-09-27: manual

Migrations are run by hand (`DATABASE_URL="<prod url>" npx prisma migrate deploy` from `vocalocart-nextjs/`) whenever the schema changes, **before** pushing the code that depends on them. The Vercel build command is unchanged (`next build`). Options that were considered:

- **Automated**: set the Vercel build command to `prisma generate && prisma migrate deploy && next build`. Zero manual steps, but every push to `main` runs migrations against production with no manual gate, and `DATABASE_URL` must be available at build time.
- **Manual** (chosen): run `npx prisma migrate deploy` by hand whenever the schema changes. Safer default for a solo project with infrequent migrations; costs one extra manual step per schema change.

---

## Post-deploy verification tests — to do

Run against https://vocalocart-dev.vercel.app with Stripe test cards (any future expiry, any CVC). Tests 1, 3, 4 and 6 are the critical ones — they cover money, stock, and other customers' data. Detailed procedures for some of these are in [`vocalocart-nextjs/docs/vocalocart-edge-case-testing-guide.md`](../vocalocart-nextjs/docs/vocalocart-edge-case-testing-guide.md).

- [ ] **1. Declined payment** — pay with `4000 0000 0000 0002`. Expect an error message, no new order in `/orders`, and the product's stock unchanged in `/admin/products`.
- [ ] **2. 3D Secure card** — pay with `4000 0027 6000 3184` and approve the test popup. Expect a normal redirect back to the order-complete page and an order in `/orders`.
- [ ] **3. Browser closed mid-payment** — pay with `4242 4242 4242 4242` and close the tab immediately after clicking pay, before the confirmation page loads. Expect the order to appear in `/orders` within a few seconds (created by the Stripe webhook safety net). Guide §3.3.
- [ ] **4. Stock decrement** — after a successful order, the product's stock in `/admin/products` drops by exactly the quantity bought.
- [ ] **5. Contact form** — submit `/contact`; the message arrives at the Resend account email (`SUPPORT_EMAIL`). While `RESEND_FROM_EMAIL` is `onboarding@resend.dev`, Resend only delivers to the account owner's address.
- [ ] **6. Cross-user data access** — register a second account in a private window and try to open the first account's order/address/cart URLs (e.g. `/orders/1`). Expect not-found or forbidden, never the other user's data. Guide §5.
- [ ] **7. Non-admin blocked from admin** — log in as the second (non-admin) account; `/admin/products` and `/admin/orders` must not be usable.

Already verified automatically on 2026-09-27 (see deployment log): anonymous requests to all account/admin APIs return 401, admin writes without a valid session return 403, HTTP redirects to HTTPS, and the Stripe webhook accepts correctly signed events and rejects forged ones.

## Remaining before real customers — not blockers for the test deployment

- [ ] Delete the `/dev/tokens` scratch page (`vocalocart-nextjs/src/app/dev/tokens/page.tsx`) — still publicly reachable.
- [ ] Switch Stripe to live keys (`sk_live_` / `pk_live_`) and create a separate live-mode webhook endpoint with its own `STRIPE_WEBHOOK_SECRET`.
- [ ] Verify a sending domain in Resend and change `RESEND_FROM_EMAIL` from `onboarding@resend.dev`.
- [ ] Optional: custom domain in Vercel (then update `NEXTAUTH_URL` and the Stripe webhook URL).
- [ ] Optional: restrict `images.remotePatterns` in `next.config.ts` to the Blob host instead of `**`.
- [ ] Optional: admin UI for categories (currently only creatable via SQL or the `/api/categories` API).
