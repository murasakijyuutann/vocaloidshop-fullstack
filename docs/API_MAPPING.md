# 🗺️ Spring Boot to Node.js API Mapping

**Purpose:** Direct mapping of your existing Java Spring Boot endpoints to new Node.js Express implementation

---

## 📡 API Endpoints Mapping

### 🔐 Authentication

| Spring Boot | Node.js Express | Method | Auth |
|-------------|-----------------|--------|------|
| `/api/auth/register` | `/api/auth/register` | POST | Public |
| `/api/auth/login` | `/api/auth/login` | POST | Public |

**Request/Response:** Identical format, no changes needed in frontend

---

### 👤 Users

| Spring Boot | Node.js Express | Method | Auth |
|-------------|-----------------|--------|------|
| `/api/users/{id}` | `/api/users/:id` | GET | User/Admin |
| `/api/users/{id}` | `/api/users/:id` | PUT | User/Admin |
| `/api/users/{id}` | `/api/users/:id` | DELETE | Admin |

**Changes:** Path param syntax `{id}` → `:id` (Express convention)

---

### 📦 Products

| Spring Boot | Node.js Express | Method | Auth |
|-------------|-----------------|--------|------|
| `/api/products` | `/api/products` | GET | Public |
| `/api/products/{id}` | `/api/products/:id` | GET | Public |
| `/api/products` | `/api/products` | POST | Admin |
| `/api/products/{id}` | `/api/products/:id` | PUT | Admin |
| `/api/products/{id}` | `/api/products/:id` | DELETE | Admin |
| `/api/products/category/{id}` | `/api/products/category/:id` | GET | Public |
| `/api/products/search?q={query}` | `/api/products/search?q=query` | GET | Public |

---

### 📂 Categories

| Spring Boot | Node.js Express | Method | Auth |
|-------------|-----------------|--------|------|
| `/api/categories` | `/api/categories` | GET | Public |
| `/api/categories/{id}` | `/api/categories/:id` | GET | Public |
| `/api/categories` | `/api/categories` | POST | Admin |
| `/api/categories/{id}` | `/api/categories/:id` | PUT | Admin |
| `/api/categories/{id}` | `/api/categories/:id` | DELETE | Admin |

---

### 🛒 Cart

| Spring Boot | Node.js Express | Method | Auth |
|-------------|-----------------|--------|------|
| `/api/cart/user/{userId}` | `/api/cart` | GET | User |
| `/api/cart/user/{userId}/product/{productId}` | `/api/cart` | POST | User |
| `/api/cart/{id}` | `/api/cart/:id` | PUT | User |
| `/api/cart/{id}` | `/api/cart/:id` | DELETE | User |
| `/api/cart/user/{userId}/clear` | `/api/cart` | DELETE | User |

**Changes:** 
- User ID now from JWT token, not URL
- Simplified endpoints using authenticated user context

---

### ❤️ Wishlist

| Spring Boot | Node.js Express | Method | Auth |
|-------------|-----------------|--------|------|
| `/api/wishlist/user/{userId}` | `/api/wishlist` | GET | User |
| `/api/wishlist/user/{userId}/product/{productId}` | `/api/wishlist` | POST | User |
| `/api/wishlist/{id}` | `/api/wishlist/:id` | DELETE | User |

**Changes:** User ID from JWT, not URL

---

### 📍 Addresses

| Spring Boot | Node.js Express | Method | Auth |
|-------------|-----------------|--------|------|
| `/api/addresses/user/{userId}` | `/api/addresses` | GET | User |
| `/api/addresses/{id}` | `/api/addresses/:id` | GET | User |
| `/api/addresses/user/{userId}` | `/api/addresses` | POST | User |
| `/api/addresses/{id}` | `/api/addresses/:id` | PUT | User |
| `/api/addresses/{id}` | `/api/addresses/:id` | DELETE | User |
| `/api/addresses/{id}/default` | `/api/addresses/:id/default` | PUT | User |

**Changes:** User ID from JWT, not URL

---

### 📦 Orders

| Spring Boot | Node.js Express | Method | Auth |
|-------------|-----------------|--------|------|
| `/api/orders/user/{userId}` | `/api/orders` | GET | User |
| `/api/orders/{id}` | `/api/orders/:id` | GET | User |
| `/api/orders/user/{userId}` | `/api/orders` | POST | User |
| `/api/orders/{id}/status` | `/api/orders/:id/status` | PUT | Admin |
| `/api/orders/{id}/cancel` | `/api/orders/:id/cancel` | PUT | User |
| `/api/orders` | `/api/orders/all` | GET | Admin |

**Changes:** User ID from JWT, not URL

---

### 📧 Contact

| Spring Boot | Node.js Express | Method | Auth |
|-------------|-----------------|--------|------|
| `/api/contact` | `/api/contact` | POST | Public |

---

## 🔄 Frontend Changes Required

### Update axios baseURL

**File:** `vocaloid_front/src/api/axiosConfig.ts`

```typescript
// OLD
const api = axios.create({
  baseURL: 'http://localhost:8081/api', // Spring Boot
});

// NEW - Same port, just pointing to new backend
const api = axios.create({
  baseURL: 'http://localhost:8081/api', // Node.js Express
});
```

### Update API Calls

Most endpoints stay the same! Only user-scoped endpoints change:

#### ❌ OLD (Spring Boot)
```typescript
// Cart
api.get(`/cart/user/${userId}`);
api.post(`/cart/user/${userId}/product/${productId}`);

// Wishlist
api.get(`/wishlist/user/${userId}`);
api.post(`/wishlist/user/${userId}/product/${productId}`);

// Orders
api.get(`/orders/user/${userId}`);
api.post(`/orders/user/${userId}`);

// Addresses
api.get(`/addresses/user/${userId}`);
api.post(`/addresses/user/${userId}`);
```

#### ✅ NEW (Node.js)
```typescript
// Cart - User ID from JWT
api.get('/cart');
api.post('/cart', { productId, quantity });

// Wishlist
api.get('/wishlist');
api.post('/wishlist', { productId });

// Orders
api.get('/orders');
api.post('/orders', orderData);

// Addresses
api.get('/addresses');
api.post('/addresses', addressData);
```

---

## 📝 Request/Response Format Changes

### Authentication

**No changes!** Same format:

```typescript
// Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "1234567890"
}

// Response
{
  "token": "eyJhbGc...",
  "user": {
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

### Products

**No changes!** Same format:

```typescript
// Get Products
GET /api/products

// Response
[
  {
    "id": 1,
    "name": "Product Name",
    "description": "Description",
    "price": 2999,
    "stockQuantity": 100,
    "imageUrl": "https://...",
    "category": {
      "id": 1,
      "name": "Category"
    }
  }
]
```

### Cart

**Minor changes:**

```typescript
// OLD - Spring Boot
POST /api/cart/user/123/product/456
{
  "quantity": 2
}

// NEW - Node.js
POST /api/cart
{
  "productId": 456,
  "quantity": 2
}
```

---

## 🔧 Implementation Strategy

### Phase 1: Get Auth Working
1. Implement auth endpoints
2. Test login/register
3. Verify JWT generation

### Phase 2: Public Endpoints
1. Products
2. Categories
3. Contact

### Phase 3: User Endpoints
1. Cart
2. Wishlist
3. Addresses

### Phase 4: Complex Endpoints
1. Orders
2. User management
3. Admin features

---

## ✅ Testing Checklist

### Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] JWT token generated
- [ ] Token stored in frontend
- [ ] Token sent with requests

### Products
- [ ] List all products
- [ ] Get single product
- [ ] Create product (admin)
- [ ] Update product (admin)
- [ ] Delete product (admin)
- [ ] Search products
- [ ] Filter by category

### Cart
- [ ] View cart
- [ ] Add to cart
- [ ] Update quantity
- [ ] Remove from cart
- [ ] Clear cart

### Wishlist
- [ ] View wishlist
- [ ] Add to wishlist
- [ ] Remove from wishlist

### Orders
- [ ] Create order
- [ ] View orders
- [ ] View order details
- [ ] Update order status (admin)
- [ ] Cancel order

### Addresses
- [ ] List addresses
- [ ] Add address
- [ ] Update address
- [ ] Delete address
- [ ] Set default

---

## 🚨 Breaking Changes

### User Context from JWT

**Old way:** Pass `userId` in URL
```
/api/cart/user/123
```

**New way:** User ID extracted from JWT token
```
/api/cart
Authorization: Bearer <token>
```

### Benefit
✅ More secure - users can't access other users' data  
✅ Cleaner URLs  
✅ Standard REST practices

### Frontend Update Required
Update components that fetch user-specific data:
- CartContext
- WishlistContext  
- Order pages
- Address management

---

## 📱 Postman Collection

Import this collection to test all endpoints:

```json
{
  "info": {
    "name": "VocaloCart API - Node.js",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8081/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}"
      }
    ]
  }
}
```

---

## 🎯 Migration Priority

1. **High Priority** (Core functionality)
   - Auth (login/register)
   - Products (listing/details)
   - Cart (add/remove/checkout)

2. **Medium Priority** (User experience)
   - Orders (create/view)
   - Addresses (manage)
   - Categories (browse)

3. **Low Priority** (Nice to have)
   - Wishlist
   - User profile
   - Admin features
   - Contact form

---

## 💡 Tips

1. **Test endpoints individually** before connecting frontend
2. **Use Postman** or curl to verify responses
3. **Check JWT tokens** are being sent correctly
4. **Compare responses** with old Spring Boot API
5. **Update one module at a time** in frontend

---

**Questions?** Refer to complete implementation examples in `MIGRATION_GUIDE.md`
