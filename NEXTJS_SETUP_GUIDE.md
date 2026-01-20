# Next.js Setup Guide

Step-by-step instructions for Phase 1 of the migration.

---

## Step 1: Create Next.js Project

```bash
cd c:\Users\rwoo1\Documents\VSCodeProjects\v_shop

npx create-next-app@latest vocalocart-nextjs \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git
```

**Options explained:**
- `--typescript` - Use TypeScript
- `--tailwind` - Include Tailwind CSS
- `--app` - Use App Router (not Pages Router)
- `--src-dir` - Put code in `src/` directory
- `--import-alias "@/*"` - Use `@/` for imports
- `--no-git` - Don't initialize git (already in parent)

---

## Step 2: Install Dependencies

```bash
cd vocalocart-nextjs

# Core dependencies
npm install next-auth@beta @prisma/client bcryptjs resend zod

# Dev dependencies
npm install -D prisma @types/bcryptjs

# Optional: UI components
npm install framer-motion react-icons
```

**Package purposes:**
- `next-auth@beta` - Authentication (v5)
- `@prisma/client` - Database ORM client
- `bcryptjs` - Password hashing
- `resend` - Email service
- `zod` - Schema validation
- `prisma` - Database toolkit (dev)
- `framer-motion` - Animations (optional)
- `react-icons` - Icon library (optional)

---

## Step 3: Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema file
- `.env` - Environment variables file

---

## Step 4: Configure Environment Variables

Edit `.env`:

```env
# Database (use your existing MySQL database)
DATABASE_URL="mysql://root:DoodyDanks48@mydb.czwaweqgeexp.ap-northeast-2.rds.amazonaws.com:3306/vocalocart"

# NextAuth.js
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_your_api_key_here"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## Step 5: Introspect Existing Database

```bash
# Pull schema from existing MySQL database
npx prisma db pull

# This generates schema.prisma based on your current tables
```

---

## Step 6: Review and Adjust Prisma Schema

The auto-generated schema may need adjustments. Replace `prisma/schema.prisma` with the optimized version from `PRISMA_SCHEMA.md`.

---

## Step 7: Generate Prisma Client

```bash
npx prisma generate
```

This creates the TypeScript client for database access.

---

## Step 8: Create Prisma Client Singleton

Create `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

**Why singleton?** Prevents multiple Prisma instances in development (hot reload).

---

## Step 9: Test Database Connection

Create `src/app/api/test-db/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()
    
    return NextResponse.json({
      success: true,
      users: userCount,
      products: productCount
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
```

**Test it:**
```bash
npm run dev
# Visit: http://localhost:3000/api/test-db
```

---

## Step 10: Verify Setup

Checklist:
- [ ] Next.js dev server runs (`npm run dev`)
- [ ] No TypeScript errors
- [ ] Prisma client generated
- [ ] Database connection works
- [ ] Test API route returns data

---

## Project Structure

After setup, you should have:

```
vocalocart-nextjs/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── test-db/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── lib/
│       └── prisma.ts
├── prisma/
│   └── schema.prisma
├── .env
├── .env.local (create this for local overrides)
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Common Issues

### Issue: "Can't reach database server"
**Solution:** Check DATABASE_URL, ensure MySQL is running, verify network access

### Issue: "Prisma Client not generated"
**Solution:** Run `npx prisma generate`

### Issue: "Module not found: @/lib/prisma"
**Solution:** Check `tsconfig.json` has correct paths configuration

### Issue: Port 3000 already in use
**Solution:** Kill process or change port in `package.json`:
```json
"dev": "next dev -p 3001"
```

---

## Next Steps

Once setup is complete, proceed to:
- **Phase 2:** Authentication Setup (see `AUTH_SETUP_GUIDE.md`)
