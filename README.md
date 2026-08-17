# VocaloCart

English | [日本語](README.ja.md)

**Full-stack Vocaloid merchandise e-commerce platform.**

Built with Next.js 16 (App Router), Prisma, PostgreSQL, NextAuth.js v5, and Stripe — a single application handling both the storefront and the backend API, migrated from an earlier Spring Boot + Vite/React implementation.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)]()
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791)]()
[![Vitest](https://img.shields.io/badge/tests-Vitest-6E9F18)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## Features

### User management
- Registration and login (credentials-based), JWT sessions via NextAuth.js v5
- Role-based access (admin / regular user)
- Profile editing, saved addresses (multiple, with a default)

### Shopping
- Product catalog with search, category filter, sort, and pagination
- Product detail pages with a related-products section and shipping/returns copy near the CTA
- Per-product metadata and `schema.org` `Product` JSON-LD for search/social previews
- Shopping cart and wishlist, both DB-backed for logged-in users
- Free shipping threshold (¥5,000+) and 消費税 (10% consumption tax) calculated on every total

### Orders & checkout
- Stripe-powered checkout (Payment Element), including konbini (Japanese convenience-store payment)
- Coupon/discount code support
- Idempotent payment intent creation and an idempotent, replay-safe webhook that finalizes orders as a safety net if the client never completes the redirect
- Inventory race protection: stock decrements are conditioned on available stock inside the order transaction, so two concurrent orders can't oversell the same item
- Order history with 7-stage status tracking and a full price breakdown (subtotal, shipping, coupon, tax, total)

### Admin panel
- Product and category CRUD with image upload to Vercel Blob
- View and update order status across all users

### Engineering
- Rate limiting on auth, checkout, and search routes
- Zod validation on API routes that accept user input
- Accessibility pass on cart/checkout/address forms (labels, ARIA, focus states)
- Unit tests (Vitest) for pricing/tax/shipping math and cart totals
- GitHub Actions CI running lint, typecheck, and tests on every PR

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Auth | NextAuth.js v5 (beta) — credentials + JWT |
| ORM | Prisma with `@prisma/adapter-pg` |
| Database | PostgreSQL (Neon / Supabase) |
| Client state | Zustand (cart store) |
| Payments | Stripe (card + konbini) |
| Email | Resend |
| File storage | Vercel Blob |
| UI | Tailwind CSS v4, shadcn/ui + Radix primitives, lucide-react icons |
| Validation | Zod |
| Testing | Vitest |
| CI | GitHub Actions |

---

## Project structure

```
vocalocart-nextjs/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Prisma migration history
│   └── seed.ts                # Test data seeder
├── src/
│   ├── app/
│   │   ├── api/                 # API route handlers
│   │   │   ├── auth/            # NextAuth + register
│   │   │   ├── cart/            # Cart CRUD
│   │   │   ├── wishlist/        # Wishlist CRUD
│   │   │   ├── orders/          # Order management
│   │   │   ├── products/        # Product listing + detail (+ related products)
│   │   │   ├── categories/      # Category management
│   │   │   ├── addresses/       # Address management
│   │   │   ├── payments/        # Stripe intents + webhook
│   │   │   ├── coupons/         # Coupon validation
│   │   │   ├── contact/         # Contact form (Resend)
│   │   │   └── admin/           # Admin upload + order management
│   │   ├── product/[id]/        # Product detail page + metadata/JSON-LD layout
│   │   ├── cart/, checkout/     # Cart and checkout (+ completion) pages
│   │   ├── orders/               # Order history
│   │   ├── admin/                # Admin orders + products
│   │   ├── my/, addresses/       # Profile and address management pages
│   │   ├── login/, register/     # Auth pages
│   │   ├── contact/              # Contact form
│   │   ├── layout.tsx            # Root layout (Navbar, Footer, Providers)
│   │   └── page.tsx              # Home / product listing
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives (button, input, select, ...)
│   │   ├── ProductCard.tsx, PriceTag.tsx, QuantityStepper.tsx
│   │   ├── PageHeader.tsx, EmptyState.tsx, OrderStatusBadge.tsx
│   │   ├── Navbar.tsx, Footer.tsx
│   │   └── Providers.tsx         # SessionProvider + ThemeProvider (dark theme only)
│   ├── hooks/
│   │   └── use-cart.ts           # Zustand cart store
│   ├── lib/
│   │   ├── auth.ts               # NextAuth configuration
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── pricing.ts            # Shipping/tax/discount math (unit tested)
│   │   ├── create-order-from-cart.ts  # Shared order-creation transaction
│   │   ├── rate-limit.ts         # In-memory rate limiter used by proxy.ts
│   │   └── order-status.ts       # Order status enum + display metadata
│   ├── proxy.ts                  # Auth fast-fail + rate limiting for API routes (formerly middleware.ts)
│   └── types/
│       └── next-auth.d.ts        # Session type augmentation
```

---

## Getting started

### Prerequisites

- **Node.js** 18+
- A **PostgreSQL** database ([Neon](https://neon.tech) or [Supabase](https://supabase.com) both work)
- A **Stripe** account (for payments)

### 1. Clone & install

```bash
git clone https://github.com/murasakijyuutann/vocaloidshop-fullstack.git
cd vocaloidshop-fullstack/vocalocart-nextjs
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local` — see [`.env.example`](vocalocart-nextjs/.env.example) for the full list (database, NextAuth, Stripe, Resend, Vercel Blob) and where to get each value.

> Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`

### 3. Set up the database

```bash
npx prisma migrate dev
```

### 4. (Optional) Seed test data

```bash
npx prisma db seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Testing

```bash
npm test           # run once
npm run test:watch # watch mode
```

---

## Database schema

Key models: `User`, `Product`, `Category`, `CartItem`, `WishlistItem`, `Order`, `OrderItem`, `Address`, `Coupon`. `Order` tracks `discountAmount`, `taxAmount`, `couponCode`, and `stripePaymentIntentId` (unique, used for idempotent order creation).

See [`prisma/schema.prisma`](vocalocart-nextjs/prisma/schema.prisma) for the full schema.

---

## API routes

All routes are under `src/app/api/`. Protected routes require a valid session cookie — `src/proxy.ts` fast-fails unauthenticated requests before they reach route handlers, and also rate-limits auth, checkout, and search endpoints.

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public (rate-limited) |
| GET | `/api/products` | List products (search, filter, sort, paginate) | Public (rate-limited) |
| GET | `/api/products/[id]` | Product detail + related products | Public |
| GET | `/api/categories` | List categories | Public |
| GET/POST/DELETE | `/api/cart` | Get / add / clear cart | Required |
| PATCH/DELETE | `/api/cart/[id]` | Update quantity / remove item | Required |
| GET/POST | `/api/wishlist` | Get / add to wishlist | Required |
| DELETE | `/api/wishlist/[productId]` | Remove from wishlist | Required |
| GET/POST | `/api/orders` | Order history / place order | Required (rate-limited) |
| GET/PATCH | `/api/orders/[id]` | Order detail / status update | Required |
| GET/POST/DELETE | `/api/addresses` | Manage addresses | Required |
| POST | `/api/payments/create-intent` | Create Stripe payment intent | Required (rate-limited) |
| POST | `/api/payments/webhook` | Stripe webhook handler | Stripe signature |
| POST | `/api/coupons/validate` | Validate coupon code | Required |
| POST | `/api/contact` | Contact form (sends via Resend) | Public |
| GET/POST | `/api/admin/orders` | Admin — all orders | Admin |
| PATCH | `/api/admin/orders/[id]` | Admin — update order status | Admin |
| POST | `/api/admin/upload` | Admin — image upload (Vercel Blob) | Admin |
| GET/POST/PATCH/DELETE | `/api/users/me` | Profile management | Required |

---

## Admin access

To grant admin access, update the user record directly in your database:

```sql
UPDATE "user" SET is_admin = true WHERE email = 'your@email.com';
```

Then log out and back in. The admin links (Orders, Products) will appear in the navbar.

---

## Deploying

The app is set up to deploy on [Vercel](https://vercel.com). See [`docs/vocalocart-deployment-checklist.md`](docs/vocalocart-deployment-checklist.md) for the full readiness checklist (env vars, Stripe webhook, Vercel Blob, migration strategy) — it also documents a migration-history drift issue that was found and fixed, worth reading before a first deploy.

```bash
npm run build
npm start
```

---

## Project docs

- [`docs/vocalocart-design-brief.md`](docs/vocalocart-design-brief.md) — the visual redesign brief (dark theme, shadcn/ui, no-emoji UI)
- [`docs/vocalocart-task-audit.md`](docs/vocalocart-task-audit.md) — audit of the original task spec against the codebase
- [`docs/vocalocart-execution-log.md`](docs/vocalocart-execution-log.md) — what was actually implemented, in order, with verification notes
- [`docs/vocalocart-deployment-checklist.md`](docs/vocalocart-deployment-checklist.md) — Vercel deploy readiness

---

## Author

- **Fishyboyxx** — [GitHub](https://github.com/murasakijyuutann)

---

## License

MIT
