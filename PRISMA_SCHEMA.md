# Prisma Schema for VocaloCart

Complete database schema matching your existing MySQL database.

---

## Full Schema

Copy this into `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER MODEL
// ============================================
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String
  name      String?
  birthday  DateTime?
  isAdmin   Boolean   @default(false)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  // Relations
  orders    Order[]
  cartItems CartItem[]
  addresses Address[]
  wishlist  WishlistItem[]
  
  @@map("user")
}

// ============================================
// CATEGORY MODEL
// ============================================
model Category {
  id          Int       @id @default(autoincrement())
  name        String    @unique
  description String?   @db.Text
  createdAt   DateTime  @default(now())
  
  // Relations
  products    Product[]
  
  @@map("category")
}

// ============================================
// PRODUCT MODEL
// ============================================
model Product {
  id          Int       @id @default(autoincrement())
  name        String
  description String?   @db.Text
  price       Decimal   @db.Decimal(10, 2)
  stock       Int       @default(0)
  imageUrl    String?
  categoryId  Int
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  category    Category  @relation(fields: [categoryId], references: [id])
  cartItems   CartItem[]
  orderItems  OrderItem[]
  wishlist    WishlistItem[]
  
  @@map("product")
}

// ============================================
// CART ITEM MODEL
// ============================================
model CartItem {
  id        Int      @id @default(autoincrement())
  userId    Int
  productId Int
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  
  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  // Unique constraint: one product per user in cart
  @@unique([userId, productId])
  @@map("cart_item")
}

// ============================================
// ORDER MODEL
// ============================================
model Order {
  id         Int         @id @default(autoincrement())
  userId     Int
  status     OrderStatus @default(PAYMENT_RECEIVED)
  totalPrice Decimal     @db.Decimal(10, 2)
  addressId  Int?
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  
  // Relations
  user       User        @relation(fields: [userId], references: [id])
  address    Address?    @relation(fields: [addressId], references: [id])
  items      OrderItem[]
  
  @@map("order")
}

// ============================================
// ORDER STATUS ENUM
// ============================================
enum OrderStatus {
  PAYMENT_RECEIVED
  PROCESSING
  PREPARING
  READY_FOR_DELIVERY
  IN_DELIVERY
  DELIVERED
  CANCELED
}

// ============================================
// ORDER ITEM MODEL
// ============================================
model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int
  productId Int
  quantity  Int
  price     Decimal @db.Decimal(10, 2)
  
  // Relations
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])
  
  @@map("order_item")
}

// ============================================
// ADDRESS MODEL
// ============================================
model Address {
  id            Int      @id @default(autoincrement())
  userId        Int
  recipientName String
  phone         String
  address       String   @db.Text
  isDefault     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders        Order[]
  
  @@map("address")
}

// ============================================
// WISHLIST ITEM MODEL
// ============================================
model WishlistItem {
  id        Int      @id @default(autoincrement())
  userId    Int
  productId Int
  createdAt DateTime @default(now())
  
  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  // Unique constraint: one product per user in wishlist
  @@unique([userId, productId])
  @@map("wishlist_item")
}
```

---

## Schema Features

### Relations
- **User** has many: Orders, CartItems, Addresses, WishlistItems
- **Product** belongs to: Category
- **Product** has many: CartItems, OrderItems, WishlistItems
- **Order** has many: OrderItems
- **Order** belongs to: User, Address (optional)

### Cascade Deletes
- Deleting a user deletes their cart, wishlist, and addresses
- Deleting a product removes it from carts and wishlists
- Deleting an order deletes its items

### Unique Constraints
- User email must be unique
- Category name must be unique
- One product per user in cart (userId + productId)
- One product per user in wishlist (userId + productId)

### Indexes
Prisma automatically creates indexes for:
- Primary keys (@id)
- Unique fields (@unique)
- Foreign keys (relation fields)

---

## Usage Examples

### Query Users
```typescript
// Find user by email
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
})

// Get user with orders
const userWithOrders = await prisma.user.findUnique({
  where: { id: 1 },
  include: { orders: true }
})
```

### Query Products
```typescript
// Get all products with category
const products = await prisma.product.findMany({
  include: { category: true }
})

// Get products by category
const products = await prisma.product.findMany({
  where: { categoryId: 1 },
  include: { category: true }
})
```

### Create Order
```typescript
const order = await prisma.order.create({
  data: {
    userId: 1,
    totalPrice: 99.99,
    status: 'PAYMENT_RECEIVED',
    addressId: 1,
    items: {
      create: [
        { productId: 1, quantity: 2, price: 29.99 },
        { productId: 2, quantity: 1, price: 39.99 }
      ]
    }
  },
  include: {
    items: { include: { product: true } },
    address: true
  }
})
```

### Update Cart
```typescript
// Add or update cart item
const cartItem = await prisma.cartItem.upsert({
  where: {
    userId_productId: { userId: 1, productId: 1 }
  },
  update: {
    quantity: { increment: 1 }
  },
  create: {
    userId: 1,
    productId: 1,
    quantity: 1
  }
})
```

---

## Migration Commands

```bash
# Pull schema from existing database
npx prisma db pull

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Create migration (if making schema changes)
npx prisma migrate dev --name description_of_change

# Apply migrations to production
npx prisma migrate deploy
```

---

## Next Steps

After setting up the schema:
1. Generate Prisma Client: `npx prisma generate`
2. Test database connection
3. Proceed to Phase 2: Authentication Setup
