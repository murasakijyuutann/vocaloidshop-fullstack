# ⚡ Quick Start: Node.js Backend Setup

**Goal:** Get your new Node.js backend running in 30 minutes

---

## 🎯 Prerequisites Checklist

```bash
# Check if you have these installed:
node --version   # Need v20+ 
npm --version    # Need v10+
git --version

# If missing, install Node.js from: https://nodejs.org/
```

---

## 🚀 Step-by-Step Setup (30 Minutes)

### 1️⃣ Create Backend Project (5 min)

```bash
# Navigate to your project
cd c:/Users/rwoo1/Documents/VSCodeProjects/Archived/v_shop

# Create and enter backend directory
mkdir backend
cd backend

# Initialize project
npm init -y

# Install all dependencies at once
npm install express cors dotenv bcryptjs jsonwebtoken @prisma/client nodemailer winston morgan zod

# Install dev dependencies
npm install -D typescript @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/nodemailer @types/morgan ts-node nodemon tsx prisma
```

### 2️⃣ Initialize TypeScript & Prisma (3 min)

```bash
# Initialize TypeScript
npx tsc --init

# Initialize Prisma
npx prisma init
```

### 3️⃣ Configure Files (5 min)

**Update `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

**Update `package.json` scripts:**
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

**Create `.env` file:**
```env
NODE_ENV=development
PORT=8081
API_PREFIX=/api

# Database - Choose PostgreSQL OR MySQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/vocalocart"
# DATABASE_URL="mysql://root:password@localhost:3306/vocalocart"

JWT_SECRET=your-super-secret-key-change-this-minimum-32-characters
JWT_EXPIRES_IN=7d

MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_FROM=noreply@vocalocart.com

ALLOWED_ORIGINS=http://localhost:5173
```

### 4️⃣ Create Folder Structure (2 min)

```bash
# Create all folders at once
mkdir -p src/config src/middleware src/modules/auth src/modules/products src/modules/cart src/modules/orders src/modules/users src/modules/categories src/modules/wishlist src/modules/addresses src/types src/utils
```

### 5️⃣ Copy Prisma Schema (3 min)

Copy the Prisma schema from `MIGRATION_GUIDE.md` Phase 2.2 into `prisma/schema.prisma`, then:

```bash
# Generate Prisma client
npx prisma generate

# If you have existing MySQL data, introspect first:
npx prisma db pull
npx prisma generate

# OR create fresh database:
npx prisma migrate dev --name init
```

### 6️⃣ Create Core Files (12 min)

Create these essential files (copy from `MIGRATION_GUIDE.md` Phase 3-5):

**Required files:**
1. `src/config/env.ts` - Environment validation
2. `src/config/logger.ts` - Winston logger
3. `src/config/database.ts` - Prisma client
4. `src/middleware/errorHandler.ts` - Error handling
5. `src/middleware/asyncHandler.ts` - Async wrapper
6. `src/middleware/auth.ts` - JWT authentication
7. `src/middleware/validation.ts` - Request validation
8. `src/utils/jwt.ts` - JWT utilities
9. `src/app.ts` - Express app
10. `src/server.ts` - Server entry

**Quick tip:** Copy these from the detailed examples in `MIGRATION_GUIDE.md`

### 7️⃣ Implement Auth Module First (Add remaining modules incrementally)

Start with authentication since everything depends on it:

1. Create `src/modules/auth/auth.service.ts`
2. Create `src/modules/auth/auth.controller.ts`
3. Create `src/modules/auth/auth.routes.ts`
4. Create `src/modules/auth/auth.validation.ts`

See `MIGRATION_GUIDE.md` Phase 5 for complete code.

---

## 🎮 Running Your Backend

```bash
# Development mode with hot reload
npm run dev

# Should see:
# 🚀 Server running on port 8081
# 📝 Environment: development
# 🌐 API Base: http://localhost:8081/api
```

Test it:
```bash
# Health check
curl http://localhost:8081/health

# Should return: {"status":"OK","timestamp":"..."}
```

---

## 🧪 Test Authentication

### Register a User:
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "phone": "1234567890"
  }'
```

### Login:
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

You should get back a JWT token!

---

## 📝 Implementation Order

After auth is working, implement modules in this order:

1. ✅ **Auth** (Done first)
2. **Categories** (Simple, no dependencies)
3. **Products** (Depends on categories)
4. **Cart** (Depends on products & auth)
5. **Wishlist** (Depends on products & auth)
6. **Addresses** (Depends on auth)
7. **Orders** (Depends on everything)
8. **Users** (Profile management)

---

## 🔗 Connect Frontend

Once auth is working, update your frontend:

**`vocaloid_front/src/api/axiosConfig.ts`:**
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api', // ← Change to your new backend
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot find module 'express'"
```bash
npm install express
```

### Issue: "Prisma Client not found"
```bash
npx prisma generate
```

### Issue: Database connection error
- Check `DATABASE_URL` in `.env`
- Make sure PostgreSQL/MySQL is running
- Test connection: `npx prisma db pull`

### Issue: JWT errors
- Make sure `JWT_SECRET` is at least 32 characters
- Don't use spaces in the secret

### Issue: Port 8081 already in use
```bash
# Find process using port
netstat -ano | findstr :8081

# Kill it
taskkill /PID <process_id> /F

# Or change port in .env
PORT=3000
```

---

## 📚 Next Steps

1. ✅ Get auth working
2. Implement remaining modules (see `MIGRATION_GUIDE.md`)
3. Test each endpoint with Postman or curl
4. Connect frontend
5. Test full flow
6. Deploy!

---

## 🎯 Progress Tracking

- [ ] Backend folder created
- [ ] Dependencies installed
- [ ] TypeScript configured
- [ ] Prisma schema created
- [ ] Database migrated
- [ ] Core files created
- [ ] Auth module working
- [ ] Can register user
- [ ] Can login user
- [ ] Frontend connected
- [ ] Products module done
- [ ] Cart module done
- [ ] Orders module done
- [ ] All modules complete
- [ ] Ready for production

---

**Time Estimate:** 
- Initial setup: 30 minutes
- Auth module: 1 hour
- Each additional module: 30-60 minutes
- Total backend: 6-8 hours

**Need help?** Refer to detailed examples in `MIGRATION_GUIDE.md`
