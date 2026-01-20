# API Migration Guide

Mapping from Spring Boot controllers to Next.js API routes.

---

## Endpoint Mapping

### Authentication Endpoints

| Spring Boot | Next.js | Method |
|-------------|---------|--------|
| `/auth/register` | `/api/auth/register` | POST |
| `/auth/login` | `/api/auth/[...nextauth]` | POST |
| `/auth/me` | `/api/auth/session` | GET |
| `PATCH /auth/me` | `/api/user/profile` | PATCH |

### Product Endpoints

| Spring Boot | Next.js | Method |
|-------------|---------|--------|
| `GET /api/products` | `GET /api/products` | GET |
| `GET /api/products/{id}` | `GET /api/products/[id]` | GET |
| `POST /api/products` | `POST /api/products` | POST |
| `PUT /api/products/{id}` | `PUT /api/products/[id]` | PUT |
| `DELETE /api/products/{id}` | `DELETE /api/products/[id]` | DELETE |

### Cart Endpoints

| Spring Boot | Next.js | Method |
|-------------|---------|--------|
| `GET /api/cart/{userId}` | `GET /api/cart` | GET |
| `POST /api/cart/{userId}` | `POST /api/cart` | POST |
| `DELETE /api/cart/{userId}/{itemId}` | `DELETE /api/cart?id={itemId}` | DELETE |

### Order Endpoints

| Spring Boot | Next.js | Method |
|-------------|---------|--------|
| `GET /api/orders/user/{userId}` | `GET /api/orders` | GET |
| `POST /api/orders/user/{userId}` | `POST /api/orders` | POST |
| `GET /api/orders/{orderId}` | `GET /api/orders/[id]` | GET |
| `GET /api/orders` (admin) | `GET /api/admin/orders` | GET |
| `PATCH /api/orders/{orderId}/status` | `PATCH /api/orders/[id]` | PATCH |

---

## Code Examples

### Products API

**Spring Boot (ProductController.java):**
```java
@RestController
@RequestMapping("/api/products")
public class ProductController {
    
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }
}
```

**Next.js (src/app/api/products/route.ts):**
```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true }
  })
  return NextResponse.json(products)
}
```

**Next.js (src/app/api/products/[id]/route.ts):**
```typescript
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(params.id) },
    include: { category: true }
  })
  
  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    )
  }
  
  return NextResponse.json(product)
}
```

---

### Cart API

**Spring Boot (CartController.java):**
```java
@RestController
@RequestMapping("/api/cart")
public class CartController {
    
    @GetMapping("/{userId}")
    public ResponseEntity<List<CartItemResponseDTO>> getCart(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getCartItems(userId));
    }
    
    @PostMapping("/{userId}")
    public ResponseEntity<CartItemResponseDTO> addToCart(
        @PathVariable Long userId,
        @RequestBody AddToCartRequestDTO dto
    ) {
        return ResponseEntity.ok(cartService.addToCart(userId, dto));
    }
}
```

**Next.js (src/app/api/cart/route.ts):**
```typescript
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: parseInt(session.user.id) },
    include: { product: { include: { category: true } } }
  })
  
  return NextResponse.json(cartItems)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  
  const { productId, quantity } = await req.json()
  
  const cartItem = await prisma.cartItem.upsert({
    where: {
      userId_productId: {
        userId: parseInt(session.user.id),
        productId
      }
    },
    update: {
      quantity: { increment: quantity }
    },
    create: {
      userId: parseInt(session.user.id),
      productId,
      quantity
    },
    include: { product: true }
  })
  
  return NextResponse.json(cartItem)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  
  const { searchParams } = new URL(req.url)
  const itemId = searchParams.get('id')
  
  await prisma.cartItem.delete({
    where: { id: parseInt(itemId!) }
  })
  
  return NextResponse.json({ success: true })
}
```

---

### Orders API

**Next.js (src/app/api/orders/route.ts):**
```typescript
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  
  // Regular users see only their orders
  // Admins see all orders (handled in /api/admin/orders)
  const orders = await prisma.order.findMany({
    where: { userId: parseInt(session.user.id) },
    include: {
      items: { include: { product: true } },
      address: true
    },
    orderBy: { createdAt: 'desc' }
  })
  
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  
  const { addressId } = await req.json()
  const userId = parseInt(session.user.id)
  
  // Get cart items
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true }
  })
  
  if (cartItems.length === 0) {
    return NextResponse.json(
      { error: "Cart is empty" },
      { status: 400 }
    )
  }
  
  // Calculate total
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (Number(item.product.price) * item.quantity),
    0
  )
  
  // Create order with transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId,
        addressId,
        totalPrice,
        status: 'PAYMENT_RECEIVED',
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }))
        }
      },
      include: {
        items: { include: { product: true } },
        address: true
      }
    })
    
    // Update stock
    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      })
    }
    
    // Clear cart
    await tx.cartItem.deleteMany({ where: { userId } })
    
    return newOrder
  })
  
  return NextResponse.json(order)
}
```

---

## Key Differences

### 1. Authentication
- **Spring Boot:** Uses `@PreAuthorize` annotations
- **Next.js:** Uses `await auth()` to get session

### 2. Path Parameters
- **Spring Boot:** `@PathVariable Long id`
- **Next.js:** `{ params }: { params: { id: string } }`

### 3. Request Body
- **Spring Boot:** `@RequestBody DTO dto`
- **Next.js:** `await req.json()`

### 4. Response
- **Spring Boot:** `ResponseEntity.ok(data)`
- **Next.js:** `NextResponse.json(data)`

### 5. Error Handling
- **Spring Boot:** Throws exceptions, handled by `@ControllerAdvice`
- **Next.js:** Return error responses directly

---

## File Structure

```
src/app/api/
├── auth/
│   ├── [...nextauth]/
│   │   └── route.ts
│   └── register/
│       └── route.ts
├── products/
│   ├── route.ts          # GET, POST
│   └── [id]/
│       └── route.ts      # GET, PUT, DELETE
├── cart/
│   └── route.ts          # GET, POST, DELETE
├── orders/
│   ├── route.ts          # GET, POST
│   └── [id]/
│       └── route.ts      # GET, PATCH
├── addresses/
│   ├── route.ts          # GET, POST
│   └── [id]/
│       └── route.ts      # PUT, DELETE
├── wishlist/
│   └── route.ts          # GET, POST, DELETE
├── categories/
│   └── route.ts          # GET, POST
├── contact/
│   └── route.ts          # POST
└── admin/
    └── orders/
        └── route.ts      # GET (all orders)
```

---

## Testing API Routes

### Using curl
```bash
# Get products
curl http://localhost:3000/api/products

# Get specific product
curl http://localhost:3000/api/products/1

# Add to cart (requires auth)
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 1}'
```

### Using browser
```
http://localhost:3000/api/products
http://localhost:3000/api/products/1
```

### Using Postman/Insomnia
Import endpoints and test with authentication headers.

---

## Next Steps

1. Implement authentication (NextAuth.js)
2. Create API routes one by one
3. Test each endpoint
4. Update frontend to use new endpoints
