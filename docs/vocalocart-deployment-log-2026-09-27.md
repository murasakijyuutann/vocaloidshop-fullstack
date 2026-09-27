# VocaloCart Production Deployment Log — 2026-09-27

Record of the session that took `vocalocart-nextjs` from "code-side ready" to live on Vercel. Open follow-up items are tracked in [`vocalocart-deployment-checklist.md`](./vocalocart-deployment-checklist.md).

**Result:** live at https://vocalocart-dev.vercel.app, running Stripe in test mode. Registration, login, admin product creation with image upload, and a full test checkout were confirmed working by hand.

No secrets are recorded in this file. Every credential lives only in Vercel environment variables, Neon, Stripe, or Resend.

---

## 1. Pre-deploy readiness audit

Checks run locally in `vocalocart-nextjs/` before anything was provisioned:

| Check | Result |
|---|---|
| `npm run build` | Pass. 39 routes, all dynamic, plus the proxy (middleware). |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass. 3 pre-existing warnings, 0 errors. |
| `npm test` | Pass. 40/40 tests. |
| Git state | Clean, in sync with `origin/main` |

Vercel-specific items that were already correct: `postinstall: prisma generate` is present, no route uses the Edge runtime, uploads go to Vercel Blob, the Stripe webhook reads the raw request body, `.env` files have never been committed, and the database connection uses Neon's pooled endpoint.

Build-time constraints found:
- `src/lib/stripe.ts` throws when it loads if `STRIPE_SECRET_KEY` is missing, so the key must exist in Vercel before any build.
- `src/app/api/contact/route.ts` creates the Resend client when it loads, so `RESEND_API_KEY` is also needed at build time.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is inlined into the client bundle at build time, so changing it requires a redeploy.

## 2. Production database (Neon)

- Installed and authenticated `neonctl` globally.
- Created the project **`vocalocart-production`** (`wispy-moon-24215406`) in **`aws-us-east-1`**. This region was chosen to sit next to Vercel's default function region, `iad1`.
- A first attempt, `vocalocart-prod` in `aws-ap-southeast-1`, was deleted to avoid confusion. The pre-existing dev project `vocaloidShop` (Singapore) was left untouched.
- Applied all 3 migrations with `prisma migrate deploy` over the pooled connection:
  - `20260227020953_init`
  - `20260227030000_add_coupon_and_order_payment_fields`
  - `20260816045020_add_order_tax_amount`
- **Decision: migrations are run manually**, not as part of the Vercel build.
- **Decision: the seed script is not run in production**, because it creates `admin@vocalocart.com / admin123` and `test@vocalocart.com / user123`. Instead:
  - Categories were inserted by hand in the Neon SQL Editor: Figures, Music, Apparel and Goods.
  - The admin account was created by registering on the live site, then running `UPDATE "user" SET is_admin = true WHERE email = '<owner email>'`.
- The SQL Editor's default sample queries were accidentally run once, creating a `playing_with_neon` demo table. It was dropped afterwards.
- `neonctl` wrote a `.neon` context file (the default org ID) into `vocalocart-nextjs/`. It was added to `vocalocart-nextjs/.gitignore`.

## 3. Vercel project

- Vercel CLI updated from 60.0.1 to 60.1.3 and already authenticated.
- `vercel link` run from the **repo root**:
  - project **`vocalocart-dev`** (`prj_bt7fwb63RzqR1NKCrgrEUGru40qz`)
  - Root Directory **`vocalocart-nextjs`**, Next.js preset, Node 24.x, region **`iad1`**
  - GitHub repo `murasakijyuutann/vocaloidshop-fullstack` connected, so pushes to `main` deploy to production
- `vercel link` appended `.vercel` and `.env*` to the root `.gitignore`. `!.env.example` was added after them so example files stay committable.
- The old Vercel project **`vocaloidshop-fullstack`** (retired Vite frontend, root `vocaloid_front`) was still connected to the same repo and failed a deploy on every push. It was **disconnected from Git**, and its historical deployments were kept.

### Environment variables (Production only)

| Variable | Source / value notes |
|---|---|
| `DATABASE_URL` | Neon pooled connection string, piped directly from `neonctl` and never printed |
| `NEXTAUTH_SECRET` | Freshly generated (`openssl rand -base64 32`), separate from dev |
| `NEXTAUTH_URL` | `https://vocalocart-dev.vercel.app`, added after the first deploy |
| `STRIPE_SECRET_KEY` | Stripe test-mode `sk_test_` key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe test-mode `pk_test_` key |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the production webhook endpoint (see §4) |
| `RESEND_API_KEY` | Resend `re_` key |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` (Resend's shared test sender) |
| `SUPPORT_EMAIL` | The Resend account owner's email, the only address the test sender can deliver to |
| `BLOB_READ_WRITE_TOKEN` | Added automatically by creating the Blob store |

The first attempt at the Stripe variables stored only the literal prefix `sk_test_` in both, and the publishable-key variable held the wrong key type. Both were caught by checking value lengths before pushing, deleted, and re-added with full keys: 107 characters for the secret key and a full `pk_test_` key for the publishable key.

### Blob storage

Created with `vercel blob create-store vocalocart-images --access public --region iad1 --environment production`. The store is public because `/api/admin/upload` uploads with `access: 'public'`.

## 4. Stripe webhook

- Installed the Stripe CLI 1.52.0 with `winget install Stripe.StripeCli`. Cursor's terminals needed a PATH export, or a full Cursor restart, before `stripe` was recognised.
- `stripe login` was paired to the `vocalocart` sandbox account (`acct_1UK6jb3sP4vYw3Ag`), which matches the `sk_test_` key.
- Created the endpoint **`we_1UK73P3sP4vYw3AgaB0cV3kZ`**:
  - URL: `https://vocalocart-dev.vercel.app/api/payments/webhook`
  - event: `payment_intent.succeeded` only
  - mode: test

## 5. Deployments

| Deployment | Trigger | Result |
|---|---|---|
| `vocalocart-4c0u1yq4a` | Push of commit `55288ea` (first deploy) | Ready in 48s |
| `vocalocart-6qu6tlfpn` | `vercel --prod` after adding `NEXTAUTH_URL`, Blob and the webhook secret | Ready in 40s |
| `vocalocart-rkijqhmde` | Push of commit `e0b4bc8` (login fix) | Ready in 33s |

## 6. Bugs found and fixed after deployment

### Login treated failed sign-in as success (fixed, commit `e0b4bc8`)

- **Symptom:** a wrong password showed the "Welcome back" toast and redirected to the home page, but the user was not actually logged in.
- **Cause:** in `next-auth` 5.0.0-beta.30, `signIn('credentials', { redirect: false })` returns `ok: true` (HTTP 200) even for bad credentials. The failure is reported only in `res.error`. `src/app/login/page.tsx` checked only `res?.ok`.
- **Fix:** the page now treats the result as a success only when `res && !res.error`.
- **Security impact:** none. The server correctly refused the session; only the UI message was wrong.

### Empty category dropdown in admin (not a code bug)

The production database had no categories, because the seed script was deliberately not run. It was resolved by inserting categories through SQL (§2). There is still no admin UI for managing categories.

## 7. Verification performed

**Automated checks against production:**

| Check | Result |
|---|---|
| `/`, `/login`, `/api/products`, `/api/categories`, `/api/auth/session` | 200 |
| Anonymous GET on `/api/cart`, `/api/orders`, `/api/addresses`, `/api/wishlist`, `/api/users/me`, `/api/admin/orders` | 401 |
| Anonymous POST `/api/categories` (admin write) | 403 |
| Forged session cookie on `/api/admin/orders` | 403 |
| `http://` to `https://` | 308 redirect |
| Webhook without a signature | 400, `Missing signature or secret` |
| Webhook with a forged signature | 400, `Invalid signature` |
| Real signed event (`stripe trigger payment_intent.succeeded`) | Passed signature verification. The handler logged "no userId in metadata", which is expected because the triggered payment wasn't created by the app's checkout. |

**Manual checks by the owner:**
- registration and login, with admin access after promotion
- creating a product with an image upload to Blob
- a full test checkout with `4242 4242 4242 4242`

## 8. Commits made during the session

| Commit | Change |
|---|---|
| `3ba1455` | Ignore `.neon` (neonctl context file) in `vocalocart-nextjs/.gitignore` |
| `55288ea` | Keep `.env.example` tracked in the root `.gitignore` after `vercel link` added `.env*` |
| `e0b4bc8` | Fix login treating failed sign-in as success |

## 9. Housekeeping notes

- The Neon connection URIs (including passwords) and the webhook signing secret were printed in plain text in the local terminal while running `neonctl projects create` and `stripe webhook_endpoints create`. Both are test or low-exposure credentials, but the terminal history should not be shared. Rotate the Neon password or roll the webhook secret if it ever is.
- `vercel link` created a root-level `.env.local` containing a `VERCEL_OIDC_TOKEN`. It is gitignored.
- Open items (post-deploy tests, `/dev/tokens` removal, live Stripe keys, a Resend domain, and optional hardening) are tracked in the checklist.
