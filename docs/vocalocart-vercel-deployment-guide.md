# VocaloCart — Vercel Deployment Guide

Step-by-step guide to deploy `vocalocart-nextjs` to Vercel. Written against the repo state as of 2026-08-18 — see [`vocalocart-deployment-checklist.md`](./vocalocart-deployment-checklist.md) for the code-side audit this guide builds on.

## Context

- The Next.js app lives in the `vocalocart-nextjs/` subfolder, **not** the repo root. Vercel's "Root Directory" setting must point there.
- GitHub remote: `github.com/murasakijyuutann/vocaloidshop-fullstack`.
- Code-side blockers (missing `postinstall: "prisma generate"`, a `NEXTAUTH_SECRET` leak via `next.config.ts`, a missing `.env.example`) were already fixed on 2026-08-16.
- **Use a separate production Neon database** — don't reuse the dev database (`vocaloidshop`). Mixing dev/prod risks seed/test data ending up in production, or a bad migration hitting real data later.

---

## Step 1 — Push latest code to GitHub

```bash
git status --short
```

Make sure this is clean (or commit/push anything pending) before importing into Vercel — Vercel deploys whatever's on the branch you connect.

---

## Step 2 — Create a production database on Neon

1. Open your Neon project (host `ep-blue-cloud-a1t1jl35-pooler.ap-southeast-1.aws.neon.tech`).
2. Create a new **branch** named `production` off the default branch (Dashboard → Branches → Create branch). This gives you an isolated database with its own connection string.
3. Open **Connect** on that branch, keep **Connection pooling** ON, and copy the pooled connection string:

```
postgresql://<user>:<password>@<new-endpoint>-pooler.ap-southeast-1.aws.neon.tech/<dbname>?sslmode=require&channel_binding=require
```

Save it — you'll need it in Steps 3 and 6.

---

## Step 3 — Run migrations against the production database

Confirm the migration history is clean first:

```bash
cd vocalocart-nextjs
npx prisma migrate status
```

Then apply all migrations to the **new production** database, without touching your local `.env` files (inline env var override):

```bash
cd vocalocart-nextjs
DATABASE_URL="postgresql://<user>:<password>@<new-prod-endpoint>/<dbname>?sslmode=require&channel_binding=require" npx prisma migrate deploy
```

`migrate deploy` never asks questions and never drops data — safe for first-time setup or any future re-run.

Optionally seed demo data:

```bash
DATABASE_URL="<same-prod-connection-string>" npx prisma db seed
```

---

## Step 4 — Gather the other service credentials

| Service | What to get | Where |
|---|---|---|
| Stripe | Secret key + publishable key (live or test) | dashboard.stripe.com → Developers → API keys |
| Resend | API key + a verified sending domain | resend.com → API Keys |
| NextAuth | A fresh production secret (don't reuse dev) | Generate below |

```bash
openssl rand -base64 32
```

---

## Step 5 — Import the project into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import `murasakijyuutann/vocaloidshop-fullstack`.
2. Set **Root Directory** to `vocalocart-nextjs` — this is the critical step since the app isn't at the repo root.
3. Framework Preset should auto-detect as **Next.js**.
4. Leave Build Command / Output Directory as defaults — `postinstall: "prisma generate"` runs automatically via `npm install`.
5. Don't deploy yet — add environment variables first (next step), or the first build will crash on missing `DATABASE_URL`.

---

## Step 6 — Add environment variables

Add these under **Production** (Vercel import screen, or later via Project → Settings → Environment Variables):

| Variable | Value |
|---|---|
| `DATABASE_URL` | The Neon production connection string from Step 2 |
| `NEXTAUTH_URL` | `https://<your-vercel-domain>.vercel.app` (or custom domain) |
| `NEXTAUTH_SECRET` | Value generated in Step 4 |
| `STRIPE_SECRET_KEY` | From Stripe dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | From Stripe dashboard — exact name matters, the checkout page reads this, not `STRIPE_PUBLISHABLE_KEY` |
| `STRIPE_WEBHOOK_SECRET` | Placeholder for now — real value comes in Step 8 |
| `RESEND_API_KEY` | From Resend dashboard |
| `RESEND_FROM_EMAIL` | e.g. `noreply@yourdomain.com` (verified Resend domain) |
| `SUPPORT_EMAIL` | Where contact-form emails are forwarded |
| `BLOB_READ_WRITE_TOKEN` | Leave blank — Step 7 generates this automatically |

---

## Step 7 — Attach Vercel Blob storage

Product images and admin uploads go to Vercel Blob (local disk is ephemeral on Vercel and would lose files every deploy).

1. Vercel project → **Storage** → **Create Database** → **Blob**.
2. Connect it to this project — Vercel automatically injects `BLOB_READ_WRITE_TOKEN`.

---

## Step 8 — Deploy

Click **Deploy**. Watch the build log for `prisma generate` during `postinstall` and a successful compile.

Common failure causes: malformed `DATABASE_URL` (missing `?sslmode=require`), or a missing required env var (the log will name it).

---

## Step 9 — Set up the production Stripe webhook

Do this after you have a real domain:

1. Note your live URL (e.g. `https://vocaloidshop-fullstack.vercel.app`, or a custom domain via Settings → Domains).
2. Stripe dashboard → **Developers → Webhooks → Add endpoint**.
3. Endpoint URL: `https://<your-domain>/api/payments/webhook`.
4. Select the events handled by `src/app/api/payments/webhook/route.ts` (at minimum `payment_intent.succeeded`).
5. Copy the **Signing secret** (`whsec_...`).
6. Update `STRIPE_WEBHOOK_SECRET` in Vercel with this value (different from your local Stripe CLI secret).
7. Redeploy (Deployments → ⋯ → Redeploy) so the new env var takes effect.

---

## Step 10 — Post-deploy verification checklist

- [ ] Home page loads and shows products (Prisma → Neon prod connection works)
- [ ] Register a new account, log in/out (NextAuth + `NEXTAUTH_URL`/`NEXTAUTH_SECRET`)
- [ ] Checkout with a Stripe test card (`4242 4242 4242 4242`) if using test keys
- [ ] Submit the contact form (Resend)
- [ ] Grant yourself admin and upload a product image (Vercel Blob):

  ```sql
  UPDATE "user" SET is_admin = true WHERE email = 'your@email.com';
  ```

  Run against the **production** DB (Neon SQL editor or `psql`), then log out/in on the live site.

- [ ] Complete a real test checkout and confirm the order status updates (proves `STRIPE_WEBHOOK_SECRET` is correct).

---

## Ongoing: future schema changes

This project uses a **manual** migration strategy (deliberate tradeoff for a solo project — see the checklist doc). Whenever `prisma/schema.prisma` changes:

```bash
cd vocalocart-nextjs
npx prisma migrate dev --name your_change   # against dev DB, generates the migration file
git add prisma/migrations && git commit -m "..." && git push
DATABASE_URL="<prod-connection-string>" npx prisma migrate deploy   # apply to prod
```

Alternative (automated, not currently used): set the Vercel build command to `prisma generate && prisma migrate deploy && next build`. Runs migrations on every push with no manual gate — faster, but no safety gap between a bad migration and production.
