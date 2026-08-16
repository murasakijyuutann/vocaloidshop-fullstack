# VocaloCart — Next.js Full-Stack

E-commerce app migrated from Spring Boot + Vite/React to a full-stack Next.js monorepo.

**Stack:** Next.js 16 · TypeScript · Prisma · PostgreSQL · NextAuth v5 · Tailwind CSS · Stripe · Resend · Vercel Blob

---

## Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Provision a PostgreSQL database
Create a free database on [Neon](https://neon.tech) or [Supabase](https://supabase.com) and copy the connection string.

### 3. Configure environment variables
```bash
cp .env.example .env.local
```
Fill in `.env.local` — at minimum you need `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` to run locally.
Generate a secret with:
```bash
openssl rand -base64 32
```

### 4. Run database migrations
```bash
npx prisma migrate dev
```

### 5. (Optional) Seed the database with test data
```bash
npx prisma db seed
```

### 6. Start the dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## Testing

```bash
npm test           # run once
npm run test:watch # watch mode
npm run test:coverage
```

---

## Project Structure

```
src/
  app/
    api/          # All API route handlers (Next.js Route Handlers)
    (pages)/      # App Router pages
  components/     # Shared UI components
  hooks/          # Client-side hooks
  lib/
    auth.ts       # NextAuth configuration
    prisma.ts     # Prisma client singleton
  types/          # TypeScript type extensions
prisma/
  schema.prisma   # Database schema
  seed.ts         # Test data seeder
```

---

## Environment Variables

See `.env.example` for all required variables and where to get them.

## Deploy on Vercel

See [`../docs/vocalocart-deployment-checklist.md`](../docs/vocalocart-deployment-checklist.md) for the full deploy readiness checklist — required env vars, the Stripe webhook, Vercel Blob setup, and the migration strategy decision — before deploying.
