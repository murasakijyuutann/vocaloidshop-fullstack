# 🚀 Spring Boot to Node.js + Express + Prisma Migration Guide

**Project:** VocaloCart E-Commerce Platform  
**Migration Date:** December 8, 2025  
**Target Stack:** Node.js + Express + TypeScript + Prisma + PostgreSQL  
**Recommended Deployment:** Railway.app

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Technology Stack Comparison](#technology-stack-comparison)
3. [Prerequisites](#prerequisites)
4. [Phase 1: Project Setup](#phase-1-project-setup)
5. [Phase 2: Database Migration](#phase-2-database-migration)
6. [Phase 3: API Implementation](#phase-3-api-implementation)
7. [Phase 4: Authentication & Security](#phase-4-authentication--security)
8. [Phase 5: Testing & Validation](#phase-5-testing--validation)
9. [Phase 6: Deployment](#phase-6-deployment)
10. [API Endpoints Reference](#api-endpoints-reference)

---

## 🎯 Overview

### What We're Migrating FROM:
```
├── Spring Boot 3.5.6 (Java 21)
├── Spring Data JPA + Hibernate
├── Spring Security + JWT
├── MySQL 8.0
├── Maven
└── Spring Mail (SendGrid)
```

### What We're Migrating TO:
```
├── Node.js 20+ with TypeScript
├── Express 4.x
├── Prisma ORM
├── PostgreSQL 15+ (Railway)
├── JWT (jsonwebtoken)
├── Nodemailer
└── Railway.app (Deployment)
```

### Why This Migration?
✅ **Single Language** - TypeScript across frontend & backend  
✅ **Better DX** - Prisma's type-safety & migrations  
✅ **Faster Development** - Hot reload, simpler syntax  
✅ **Lower Resource Usage** - No JVM overhead  
✅ **Modern Ecosystem** - Better tooling & packages  
✅ **Simpler Deployment** - Railway's zero-config deployment  
✅ **87% Cost Savings** - $5/month vs $38/month on AWS

---

## 📊 Technology Stack Comparison

| Feature | Spring Boot | Node.js + Express |
|---------|-------------|-------------------|
| **Language** | Java 21 | TypeScript |
| **ORM** | JPA/Hibernate | Prisma |
| **Validation** | Jakarta Validation | Zod / express-validator |
| **Authentication** | Spring Security | Passport.js / express-jwt |
| **Email** | Spring Mail | Nodemailer |
| **Testing** | JUnit 5 | Jest / Vitest |
| **Build Tool** | Maven | npm / pnpm |
| **Hot Reload** | DevTools | Nodemon / tsx |

---

## ✅ Prerequisites

### Required Software:
- **Node.js 20+** (LTS recommended)
- **npm 10+** or **pnpm 8+**
- **PostgreSQL 15+** (for local development)
- **Git**
- **VS Code** (recommended)
- **Railway Account** (free tier available at railway.app)

### Install Node.js:
```bash
# Windows (using chocolatey)
choco install nodejs-lts

# Or download from: https://nodejs.org/
```

### Install Database (Local Development):
```bash
# PostgreSQL (recommended for local development)
choco install postgresql

# Start PostgreSQL service
net start postgresql-x64-15

# Create database
psql -U postgres
CREATE DATABASE vocalocart;
```

**Note:** For production, you'll use Railway's managed PostgreSQL (no manual setup needed).

### Verify Installation:
```bash
node --version  # Should be v20.x.x or higher
npm --version   # Should be v10.x.x or higher
```

---

## 🔧 Phase 1: Project Setup

### Step 1.1: Create New Backend Directory

```bash
# Navigate to project root
cd c:/Users/rwoo1/Documents/VSCodeProjects/Archived/v_shop

# Create new backend folder
mkdir backend
cd backend
```

### Step 1.2: Initialize Node.js Project

```bash
# Initialize package.json
npm init -y

# Install TypeScript & dependencies
npm install typescript @types/node ts-node nodemon tsx -D

# Initialize TypeScript
npx tsc --init
```

### Step 1.3: Install Core Dependencies

```bash
# Core
npm install express cors dotenv

# Types
npm install @types/express @types/cors -D

# Validation
npm install zod express-validator

# Authentication
npm install jsonwebtoken bcryptjs
npm install @types/jsonwebtoken @types/bcryptjs -D

# Email
npm install nodemailer
npm install @types/nodemailer -D

# Logging
npm install winston morgan
npm install @types/morgan -D

# Prisma ORM
npm install prisma @prisma/client -D
npx prisma init
```

### Step 1.4: Project Structure

Create the following structure:

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts        # DB connection
│   │   ├── env.ts             # Environment validation
│   │   └── logger.ts          # Winston setup
│   ├── middleware/
│   │   ├── auth.ts            # JWT verification
│   │   ├── errorHandler.ts   # Global error handler
│   │   ├── validation.ts      # Request validation
│   │   └── asyncHandler.ts   # Async wrapper
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.validation.ts
│   │   ├── products/
│   │   │   ├── product.controller.ts
│   │   │   ├── product.service.ts
│   │   │   ├── product.routes.ts
│   │   │   └── product.validation.ts
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── users/
│   │   ├── categories/
│   │   ├── wishlist/
│   │   └── addresses/
│   ├── types/
│   │   ├── express.d.ts       # Express type extensions
│   │   └── index.ts           # Shared types
│   ├── utils/
│   │   ├── jwt.ts             # JWT utilities
│   │   ├── email.ts           # Email sender
│   │   └── responses.ts       # Standard responses
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Auto-generated
├── .env                       # Environment variables
├── .env.example
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

### Step 1.5: Configure TypeScript

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node"],
    "sourceMap": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 1.6: Configure package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:push": "prisma db push",
    "lint": "eslint src --ext .ts",
    "test": "jest"
  }
}
```

### Step 1.7: Environment Variables

Create `.env`:

```env
# Server
NODE_ENV=development
PORT=8081
API_PREFIX=/api

# Database (PostgreSQL - Local Development)
DATABASE_URL="postgresql://postgres:password@localhost:5432/vocalocart"

# Railway will provide DATABASE_URL automatically in production

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email (SendGrid)
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_FROM=noreply@vocalocart.com

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Create `.env.example` (same but with placeholder values)

---

## 💾 Phase 2: Database Migration

### Step 2.1: Choose Database Strategy

**Option A: Fresh PostgreSQL Database (Recommended)**
- Start with clean PostgreSQL database
- Use Prisma migrations to create schema
- Manually migrate data if needed

**Option B: Migrate from Existing MySQL**
- Export data from MySQL
- Create PostgreSQL database
- Import data and update schema

```bash
# If migrating from existing MySQL
npx prisma db pull  # Introspect existing schema
```

### Step 2.2: Create Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model User {
  id        BigInt   @id @default(autoincrement())
  email     String   @unique @db.VarChar(255)
  password  String   @db.VarChar(255)
  name      String   @db.VarChar(255)
  phone     String?  @db.VarChar(255)
  address   String?  @db.VarChar(255)
  role      Role     @default(USER)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  addresses     Address[]
  cartItems     CartItem[]
  wishlistItems WishlistItem[]
  orders        Order[]

  @@index([email])
  @@index([role])
  @@map("users")
}

model Category {
  id          BigInt    @id @default(autoincrement())
  name        String    @unique @db.VarChar(255)
  description String?   @db.Text
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  products Product[]

  @@index([name])
  @@map("categories")
}

model Product {
  id            BigInt   @id @default(autoincrement())
  name          String   @db.VarChar(255)
  description   String?  @db.Text
  price         Int
  stockQuantity Int      @default(0) @map("stock_quantity")
  imageUrl      String?  @db.VarChar(255) @map("image_url")
  categoryId    BigInt?  @map("category_id")

  category      Category?      @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  cartItems     CartItem[]
  wishlistItems WishlistItem[]
  orderItems    OrderItem[]

  @@index([categoryId])
  @@index([name])
  @@index([price])
  @@map("products")
}

model CartItem {
  id        BigInt @id @default(autoincrement())
  userId    BigInt @map("user_id")
  productId BigInt @map("product_id")
  quantity  Int    @default(1)
  price     Int

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
  @@index([userId])
  @@index([productId])
  @@map("cart_items")
}

model WishlistItem {
  id        BigInt   @id @default(autoincrement())
  userId    BigInt   @map("user_id")
  productId BigInt   @map("product_id")
  addedAt   DateTime @default(now()) @map("added_at")

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
  @@index([userId])
  @@map("wishlist_items")
}

model Address {
  id            BigInt  @id @default(autoincrement())
  userId        BigInt  @map("user_id")
  recipientName String  @db.VarChar(255) @map("recipient_name")
  line1         String  @db.VarChar(255)
  line2         String? @db.VarChar(255)
  city          String  @db.VarChar(100)
  state         String  @db.VarChar(100)
  postalCode    String  @db.VarChar(20) @map("postal_code")
  country       String  @db.VarChar(100)
  phone         String  @db.VarChar(50)
  isDefault     Boolean @default(false) @map("is_default")

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders Order[]

  @@index([userId])
  @@map("addresses")
}

model Order {
  id             BigInt      @id @default(autoincrement())
  userId         BigInt      @map("user_id")
  totalAmount    Int         @map("total_amount")
  status         OrderStatus @default(PENDING)
  orderedAt      DateTime    @default(now()) @map("ordered_at")
  shippingMethod String?     @db.VarChar(100) @map("shipping_method")
  trackingNumber String?     @db.VarChar(255) @map("tracking_number")
  shippedAt      DateTime?   @map("shipped_at")
  deliveredAt    DateTime?   @map("delivered_at")
  addressId      BigInt?     @map("address_id")
  shipLine1      String?     @db.VarChar(255) @map("ship_line1")
  shipLine2      String?     @db.VarChar(255) @map("ship_line2")
  shipCity       String?     @db.VarChar(100) @map("ship_city")
  shipState      String?     @db.VarChar(100) @map("ship_state")
  shipZip        String?     @db.VarChar(20) @map("ship_zip")
  shipCountry    String?     @db.VarChar(100) @map("ship_country")

  user    User        @relation(fields: [userId], references: [id])
  address Address?    @relation(fields: [addressId], references: [id], onDelete: SetNull)
  items   OrderItem[]

  @@index([userId])
  @@index([status])
  @@map("orders")
}

model OrderItem {
  id        BigInt @id @default(autoincrement())
  orderId   BigInt @map("order_id")
  productId BigInt @map("product_id")
  quantity  Int
  price     Int

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@index([orderId])
  @@map("order_items")
}
```

### Step 2.3: Generate Prisma Client

```bash
# Generate types and client
npx prisma generate

# If using existing DB (introspect first)
npx prisma db pull
npx prisma generate

# Or create new migration
npx prisma migrate dev --name init
```

---

## 🛠️ Phase 3: API Implementation

### Step 3.1: Create Server Entry Point

`src/server.ts`:

```typescript
import app from './app';
import { env } from './config/env';
import logger from './config/logger';

const PORT = env.PORT || 8081;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${env.NODE_ENV}`);
  logger.info(`🌐 API Base: http://localhost:${PORT}${env.API_PREFIX}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
```

### Step 3.2: Create Express App

`src/app.ts`:

```typescript
import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import logger from './config/logger';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import productRoutes from './modules/products/product.routes';
import cartRoutes from './modules/cart/cart.routes';
import orderRoutes from './modules/orders/order.routes';
import userRoutes from './modules/users/user.routes';
import categoryRoutes from './modules/categories/category.routes';
import wishlistRoutes from './modules/wishlist/wishlist.routes';
import addressRoutes from './modules/addresses/address.routes';

const app: Application = express();

// Middleware
app.use(cors({
  origin: env.ALLOWED_ORIGINS.split(','),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
const API_PREFIX = env.API_PREFIX || '/api';
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/cart`, cartRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/wishlist`, wishlistRoutes);
app.use(`${API_PREFIX}/addresses`, addressRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error Handler (must be last)
app.use(errorHandler);

export default app;
```

### Step 3.3: Environment Configuration

`src/config/env.ts`:

```typescript
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('8081'),
  API_PREFIX: z.string().default('/api'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  MAIL_HOST: z.string(),
  MAIL_PORT: z.string().transform(Number),
  MAIL_USER: z.string(),
  MAIL_PASSWORD: z.string(),
  MAIL_FROM: z.string().email(),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173')
});

export const env = envSchema.parse(process.env);
```

### Step 3.4: Logger Configuration

`src/config/logger.ts`:

```typescript
import winston from 'winston';
import { env } from './env';

const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

export default logger;
```

### Step 3.5: Database Client

`src/config/database.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import logger from './logger';

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' }
  ]
});

prisma.$on('query', (e) => {
  logger.debug(`Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration}ms`);
});

export default prisma;
```

---

## 🔐 Phase 4: Authentication & Security

### Step 4.1: JWT Utilities

`src/utils/jwt.ts`:

```typescript
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
}

export const generateToken = (userId: bigint, email: string): string => {
  return jwt.sign(
    { userId: userId.toString(), email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
```

### Step 4.2: Auth Middleware

`src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import prisma from '../config/database';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: bigint;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: BigInt(decoded.userId) },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
```

### Step 4.3: Error Handler

`src/middleware/errorHandler.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`AppError: ${err.message}`, { statusCode: err.statusCode });
    return res.status(err.statusCode).json({
      error: err.message,
      status: err.statusCode
    });
  }

  logger.error('Unexpected Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
};
```

### Step 4.4: Async Handler

`src/middleware/asyncHandler.ts`:

```typescript
import { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

---

## 📡 Phase 5: Module Implementation

### Step 5.1: Auth Module

`src/modules/auth/auth.service.ts`:

```typescript
import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { generateToken } from '../../utils/jwt';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new AppError('Email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        address: data.address,
        role: 'USER'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    const token = generateToken(user.id, user.email);

    return {
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken(user.id, user.email);

    return {
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }
}
```

`src/modules/auth/auth.controller.ts`:

```typescript
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../middleware/asyncHandler';

const authService = new AuthService();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.json(result);
});
```

`src/modules/auth/auth.routes.ts`:

```typescript
import { Router } from 'express';
import { register, login } from './auth.controller';
import { validateRequest } from '../../middleware/validation';
import { registerSchema, loginSchema } from './auth.validation';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);

export default router;
```

`src/modules/auth/auth.validation.ts`:

```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    phone: z.string().optional(),
    address: z.string().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required')
  })
});
```

### Step 5.2: Validation Middleware

`src/middleware/validation.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
};
```

---

## 🧪 Phase 6: Testing

### Step 6.1: Install Testing Dependencies

```bash
npm install jest @types/jest ts-jest supertest @types/supertest -D
```

### Step 6.2: Configure Jest

`jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts'
  ]
};
```

---

## 📦 Phase 7: Deployment to Railway

### Why Railway?
- **Zero Configuration** - Automatic Node.js detection
- **Built-in PostgreSQL** - One-click database provisioning
- **Automatic Deployments** - Deploy on git push
- **Free SSL/HTTPS** - Automatic certificate management
- **87% Cheaper** - $5/month vs $38/month on AWS
- **No Server Management** - No SSH, no manual updates

### Step 7.1: Prepare for Deployment

**Add build script to package.json:**
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "prisma generate && tsc",
    "start": "node dist/server.js",
    "prisma:migrate:deploy": "prisma migrate deploy"
  }
}
```

**Create `.gitignore`:**
```
node_modules/
dist/
.env
logs/
*.log
```

**Commit your code:**
```bash
git add .
git commit -m "Prepare backend for Railway deployment"
git push origin main
```

### Step 7.2: Deploy to Railway

**1. Create Railway Account:**
- Go to https://railway.app
- Sign up with GitHub (recommended)
- Free tier includes $5 credit/month

**2. Create New Project:**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository (v_shop)
- Railway auto-detects Node.js

**3. Add PostgreSQL Database:**
- Click "+ New" in your project
- Select "Database" → "Add PostgreSQL"
- Railway automatically creates `DATABASE_URL` environment variable
- No manual connection string needed!

**4. Configure Backend Service:**

Click on your backend service → "Variables" tab:

```env
# Railway auto-provides DATABASE_URL
# Add these manually:
NODE_ENV=production
PORT=8081
API_PREFIX=/api

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_FROM=noreply@vocalocart.com

ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-domain.com
```

**5. Run Database Migrations:**

Railway doesn't run migrations automatically, so add a deploy script:

**Option A: Add to package.json (Recommended):**
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && tsc",
    "start": "node dist/server.js"
  }
}
```

**Option B: Manual migration via Railway CLI:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migration
railway run npx prisma migrate deploy
```

**6. Deploy:**
- Railway automatically deploys on every git push
- First deployment happens immediately
- View logs in Railway dashboard

**7. Get Your Backend URL:**
- Go to "Settings" tab in Railway
- Click "Generate Domain"
- Your backend will be at: `https://your-app.up.railway.app`
- Update frontend `VITE_API_URL` to this URL

### Step 7.3: Verify Deployment

**Check health endpoint:**
```bash
curl https://your-app.up.railway.app/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-12-08T..."
}
```

**Test API endpoint:**
```bash
curl https://your-app.up.railway.app/api/products
```

### Step 7.4: Configure Custom Domain (Optional)

**In Railway Dashboard:**
1. Go to "Settings" → "Domains"
2. Click "Custom Domain"
3. Add your domain: `api.vocalocart.com`
4. Update DNS records as instructed
5. Railway auto-provisions SSL certificate

### Step 7.5: Setup Continuous Deployment

**Automatic deployment is already configured!**

Every time you push to GitHub:
1. Railway detects the push
2. Runs `npm install`
3. Runs `npm run build` (includes migrations)
4. Runs `npm start`
5. Zero-downtime deployment

**Monitor deployments:**
- View real-time logs in Railway dashboard
- Get notified on deployment failures
- Rollback to previous version with one click

### Step 7.6: Database Management

**View Database:**
- Railway dashboard → PostgreSQL service
- Click "Data" tab to browse tables
- Or use connection string with any PostgreSQL client

**Backup Database:**
- Railway auto-backups daily (on paid plan)
- Manual backup: 
  ```bash
  railway run pg_dump > backup.sql
  ```

**Run Prisma Studio:**
```bash
# Locally connected to Railway DB
railway run npx prisma studio
```

### Step 7.7: Cost Optimization

**Railway Pricing:**
- **Free tier**: $5 credit/month (sufficient for small projects)
- **Hobby plan**: $5/month (500 hours execution time)
- **Pro plan**: $20/month (unlimited usage)

**Estimated costs for VocaloCart:**
- Backend service: ~$3-4/month
- PostgreSQL: Included in service cost
- **Total: ~$5/month** (vs $38/month on AWS)

### Step 7.8: Monitoring & Debugging

**View Logs:**
- Railway dashboard → Your service → "Logs" tab
- Real-time log streaming
- Filter by log level

**Metrics:**
- CPU usage
- Memory usage
- Request count
- Response times

**Health Checks:**
Railway automatically monitors your `/health` endpoint.

### Step 7.9: Environment-Specific Configuration

**Development vs Production:**

```typescript
// src/config/env.ts
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  // ... other vars
});

// Different behavior based on environment
if (env.NODE_ENV === 'production') {
  // Enable production optimizations
  // Disable verbose logging
  // Enable caching
}
```

### Step 7.10: Troubleshooting

**Build fails:**
- Check Railway logs for error messages
- Ensure all dependencies in package.json
- Verify TypeScript compiles locally: `npm run build`

**Database connection fails:**
- Verify PostgreSQL service is running in Railway
- Check DATABASE_URL is automatically set
- Ensure Prisma migrations ran: `railway run npx prisma migrate deploy`

**App crashes on startup:**
- Check environment variables are set
- View logs for error details
- Verify PORT is set to Railway's provided PORT

**502 Bad Gateway:**
- App might be crashing on startup
- Check logs for errors
- Ensure app listens on `process.env.PORT` or fallback to 8081

### Step 7.11: Deployment Checklist

- [ ] Code committed and pushed to GitHub
- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Environment variables configured
- [ ] Database migrations run successfully
- [ ] Backend deployed and health check passes
- [ ] Custom domain configured (optional)
- [ ] Frontend updated with production API URL
- [ ] CORS origins include frontend domain
- [ ] SSL certificate active
- [ ] Monitoring and alerts configured

---

## 🚀 Quick Deployment Summary

**From zero to deployed in 10 minutes:**

```bash
# 1. Push code
git push origin main

# 2. Railway setup (web interface)
# - Create project from GitHub repo
# - Add PostgreSQL
# - Add environment variables
# - Generate domain

# 3. Run migrations
railway run npx prisma migrate deploy

# 4. Done! 
# Backend live at: https://your-app.up.railway.app
```

**Compare to AWS EC2:**
- EC2: 30-60 min setup, manual RDS, security groups, SSH keys, ALB
- Railway: 5-10 min setup, automatic everything
- Cost: Railway 87% cheaper ($5 vs $38/month)

---

## 🗺️ API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:id` - Remove from wishlist

### Addresses
- `GET /api/addresses` - Get user's addresses
- `POST /api/addresses` - Create address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

---

## ✅ Migration Checklist

- [ ] Phase 1: Project Setup
  - [ ] Install Node.js & dependencies
  - [ ] Create folder structure
  - [ ] Configure TypeScript
  - [ ] Set up environment variables
- [ ] Phase 2: Database
  - [ ] Install Prisma
  - [ ] Create schema
  - [ ] Run migrations
  - [ ] Generate client
- [ ] Phase 3: Core Implementation
  - [ ] Server & app setup
  - [ ] Logger & error handling
  - [ ] Authentication middleware
  - [ ] Auth module
  - [ ] Product module
  - [ ] Cart module
  - [ ] Order module
  - [ ] User module
  - [ ] Category module
  - [ ] Wishlist module
  - [ ] Address module
- [ ] Phase 4: Testing
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] API testing
- [ ] Phase 5: Frontend Integration
  - [ ] Update axios baseURL
  - [ ] Test all features
- [ ] Phase 6: Deployment to Railway
  - [ ] Create Railway account
  - [ ] Push code to GitHub
  - [ ] Create Railway project from repo
  - [ ] Add PostgreSQL database
  - [ ] Configure environment variables
  - [ ] Run database migrations
  - [ ] Generate domain
  - [ ] Test production API
  - [ ] Update frontend with production URL
  - [ ] Configure custom domain (optional)

---

## 🎯 Next Steps

1. **Read this guide completely**
2. **Set up Node.js environment**
3. **Create backend structure**
4. **Implement authentication first** (it's needed for everything)
5. **Implement modules one by one**
6. **Test each module as you go**
7. **Update frontend to point to new backend**

---

**Questions? Issues?** Check the implementation examples in each phase or ask for help!
