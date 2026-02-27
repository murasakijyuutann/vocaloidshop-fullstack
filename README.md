# 🎵 VocaloCart

**Full-Stack Vocaloid Merchandise E-Commerce Platform**

Built with Next.js 15 (App Router), Prisma, PostgreSQL (Neon), and NextAuth.js v5. A single unified application handling both the storefront and backend API.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)]()
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## ✨ Features

### 👤 User Management
- User registration and login (credentials-based)
- JWT session management via NextAuth.js v5
- My Page — profile editing
- Role-based access (admin / regular user)

### 🛒 Shopping
- Product catalog with search, category filter, sort, and pagination
- Product detail pages with quantity selection
- Shopping cart — add, update quantity, remove, clear
- Wishlist — save items for later, add directly to cart
- Free shipping threshold (¥5,000+)

### 📦 Orders & Checkout
- Stripe-powered checkout with payment intent
- Coupon/discount code support
- Order history with 7-stage status tracking
- Address management (multiple addresses, set default)

### 🔐 Admin Panel
- Product and category CRUD with image upload
- View and update all orders across users

### 🎨 UI/UX
- Responsive design (mobile-first)
- Light/dark mode toggle (next-themes)
- Toast notifications (Sonner)
- Loading states throughout

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Auth | NextAuth.js v5 (beta) — credentials + JWT |
| ORM | Prisma with `@prisma/adapter-pg` |
| Database | PostgreSQL via Neon (serverless) |
| Client state | Zustand (cart store) |
| Payments | Stripe |
| Styling | Tailwind CSS |
| Toasts | Sonner |
| Theming | next-themes |
| Validation | Zod |

---

## 📁 Project Structure

```
vocalocart-nextjs/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Prisma migration history
├── src/
│   ├── app/
│   │   ├── api/               # API route handlers
│   │   │   ├── auth/          # NextAuth + register
│   │   │   ├── cart/          # Cart CRUD
│   │   │   ├── wishlist/      # Wishlist CRUD
│   │   │   ├── orders/        # Order management
│   │   │   ├── products/      # Product listing + detail
│   │   │   ├── categories/    # Category management
│   │   │   ├── addresses/     # Address management
│   │   │   ├── payments/      # Stripe intents + webhook
│   │   │   ├── coupons/       # Coupon validation
│   │   │   └── admin/         # Admin upload
│   │   ├── cart/              # Cart page
│   │   ├── wishlist/          # Wishlist page
│   │   ├── checkout/          # Checkout + completion
│   │   ├── orders/            # Order history
│   │   ├── product/[id]/      # Product detail page
│   │   ├── admin/             # Admin orders + products
│   │   ├── my/                # My Page (profile)
│   │   ├── addresses/         # Address management page
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   ├── contact/           # Contact form
│   │   ├── layout.tsx         # Root layout (Navbar, Footer, Providers)
│   │   └── page.tsx           # Home / product listing
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Providers.tsx      # SessionProvider + ThemeProvider
│   ├── hooks/
│   │   └── use-cart.ts        # Zustand cart store
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   └── prisma.ts          # Prisma client singleton
│   ├── middleware.ts           # Fast-fail auth guard for API routes
│   └── types/
│       └── next-auth.d.ts     # Session type augmentation
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** 18+
- A **PostgreSQL** database (project uses [Neon](https://neon.tech) serverless Postgres)
- A **Stripe** account (for payments)

### 1. Clone & install

```bash
git clone https://github.com/murasakijyuutann/vocaloidshop-fullstack.git
cd vocaloidshop-fullstack/vocalocart-nextjs
npm install
```

### 2. Configure environment

Create a `.env` file in `vocalocart-nextjs/`:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
NEXTAUTH_SECRET="your-random-32-char-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

> Generate `NEXTAUTH_SECRET` with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`

### 3. Set up the database

```bash
npx prisma migrate deploy
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database Schema

Key models: `User`, `Product`, `Category`, `CartItem`, `WishlistItem`, `Order`, `OrderItem`, `Address`, `Coupon`

See [`prisma/schema.prisma`](vocalocart-nextjs/prisma/schema.prisma) for the full schema.

---

## 📡 API Routes

All routes are under `src/app/api/`. Protected routes require a valid session cookie — the middleware at `src/middleware.ts` fast-fails unauthenticated requests before they reach route handlers.

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| GET | `/api/products` | List products (search, filter, sort, paginate) | Public |
| GET | `/api/products/[id]` | Product detail | Public |
| GET | `/api/categories` | List categories | Public |
| GET/POST/DELETE | `/api/cart` | Get / add / clear cart | Required |
| PATCH/DELETE | `/api/cart/[id]` | Update quantity / remove item | Required |
| GET/POST | `/api/wishlist` | Get / add to wishlist | Required |
| DELETE | `/api/wishlist/[productId]` | Remove from wishlist | Required |
| GET/POST | `/api/orders` | Order history / place order | Required |
| GET/PATCH | `/api/orders/[id]` | Order detail / status update | Required |
| GET/POST/DELETE | `/api/addresses` | Manage addresses | Required |
| POST | `/api/payments/create-intent` | Create Stripe payment intent | Required |
| POST | `/api/payments/webhook` | Stripe webhook handler | Stripe sig |
| POST | `/api/coupons/validate` | Validate coupon code | Required |
| GET/POST | `/api/admin/orders` | Admin — all orders | Admin |
| PATCH | `/api/admin/orders/[id]` | Admin — update order status | Admin |
| POST | `/api/admin/upload` | Admin — image upload | Admin |
| GET/POST/PATCH/DELETE | `/api/users/me` | Profile management | Required |

---

## 🔑 Admin Access

To grant admin access, update the user record directly in your database:

```sql
UPDATE "user" SET is_admin = true WHERE email = 'your@email.com';
```

Then log out and back in. The admin links (⚙️ Orders, 🛍️ Products) will appear in the navbar.

---

## 🏗️ Building for Production

```bash
npm run build
npm start
```

---

## 👥 Author

- **Fishyboyxx** — [GitHub](https://github.com/murasakijyuutann)

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.
