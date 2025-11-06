# API Documentation

## Base URL
- **Production:** `http://16.184.51.237:8081/api`
- **Local:** `http://localhost:8081/api`

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Authentication Endpoints

### Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com"
}
```

**Response:** `201 Created`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "testuser"
}
```

**Errors:**
- `400 Bad Request` - Username already exists
- `400 Bad Request` - Invalid email format

**cURL Example:**
```bash
curl -X POST http://16.184.51.237:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com"
  }'
```

---

### Login
Authenticate user and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "testuser"
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials

**cURL Example:**
```bash
curl -X POST http://16.184.51.237:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

---

## Product Endpoints

### Get All Products
Retrieve all products in the catalog.

**Endpoint:** `GET /api/products`

**Authentication:** Optional (public endpoint)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "미쿠 셔츠",
    "price": 4200,
    "imageUrl": "https://example.com/miku-shirt.png",
    "categoryName": "의류"
  },
  {
    "id": 2,
    "name": "Magical Mirai 2025 Blu ray",
    "price": 39000,
    "imageUrl": "https://example.com/magicalmirai2025.png",
    "categoryName": "Music"
  }
]
```

**cURL Example:**
```bash
curl http://16.184.51.237:8081/api/products
```

---

### Get Product by ID
Retrieve a specific product.

**Endpoint:** `GET /api/products/{id}`

**Authentication:** Optional

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "미쿠 셔츠",
  "price": 4200,
  "imageUrl": "https://example.com/miku-shirt.png",
  "categoryName": "의류"
}
```

**Errors:**
- `404 Not Found` - Product does not exist

**cURL Example:**
```bash
curl http://16.184.51.237:8081/api/products/1
```

---

### Create Product
Add a new product to the catalog.

**Endpoint:** `POST /api/products`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Luka Hoodie",
  "price": 6600,
  "imageUrl": "https://example.com/luka-hoodie.png",
  "categoryId": 1
}
```

**Response:** `201 Created`
```json
{
  "id": 25,
  "name": "Luka Hoodie",
  "price": 6600,
  "imageUrl": "https://example.com/luka-hoodie.png",
  "categoryName": "fashion"
}
```

**Errors:**
- `401 Unauthorized` - No JWT token
- `403 Forbidden` - User is not admin
- `400 Bad Request` - Invalid category ID

**cURL Example:**
```bash
curl -X POST http://16.184.51.237:8081/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Luka Hoodie",
    "price": 6600,
    "imageUrl": "https://example.com/luka-hoodie.png",
    "categoryId": 1
  }'
```

---

### Update Product
Update an existing product.

**Endpoint:** `PUT /api/products/{id}`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Luka Hoodie (Updated)",
  "price": 7000,
  "imageUrl": "https://example.com/luka-hoodie-v2.png",
  "categoryId": 1
}
```

**Response:** `200 OK`
```json
{
  "id": 25,
  "name": "Luka Hoodie (Updated)",
  "price": 7000,
  "imageUrl": "https://example.com/luka-hoodie-v2.png",
  "categoryName": "fashion"
}
```

**Errors:**
- `404 Not Found` - Product does not exist

**cURL Example:**
```bash
curl -X PUT http://16.184.51.237:8081/api/products/25 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Luka Hoodie (Updated)",
    "price": 7000,
    "imageUrl": "https://example.com/luka-hoodie-v2.png",
    "categoryId": 1
  }'
```

---

### Delete Product
Remove a product from the catalog.

**Endpoint:** `DELETE /api/products/{id}`

**Authentication:** Required (Admin only)

**Response:** `204 No Content`

**Errors:**
- `404 Not Found` - Product does not exist

**cURL Example:**
```bash
curl -X DELETE http://16.184.51.237:8081/api/products/25 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Category Endpoints

### Get All Categories
Retrieve all product categories.

**Endpoint:** `GET /api/categories`

**Authentication:** Optional

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "fashion"
  },
  {
    "id": 2,
    "name": "Music"
  },
  {
    "id": 3,
    "name": "의류"
  }
]
```

**cURL Example:**
```bash
curl http://16.184.51.237:8081/api/categories
```

---

### Create Category
Add a new category.

**Endpoint:** `POST /api/categories`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Accessories"
}
```

**Response:** `201 Created`
```json
{
  "id": 4,
  "name": "Accessories"
}
```

**Errors:**
- `400 Bad Request` - Category already exists

**cURL Example:**
```bash
curl -X POST http://16.184.51.237:8081/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "Accessories"}'
```

---

### Update Category
Update an existing category.

**Endpoint:** `PUT /api/categories/{id}`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Accessories (Updated)"
}
```

**Response:** `200 OK`
```json
{
  "id": 4,
  "name": "Accessories (Updated)"
}
```

**cURL Example:**
```bash
curl -X PUT http://16.184.51.237:8081/api/categories/4 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "Accessories (Updated)"}'
```

---

### Delete Category
Remove a category.

**Endpoint:** `DELETE /api/categories/{id}`

**Authentication:** Required (Admin only)

**Response:** `204 No Content`

**Errors:**
- `400 Bad Request` - Category has associated products

**cURL Example:**
```bash
curl -X DELETE http://16.184.51.237:8081/api/categories/4 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Cart Endpoints

### Get User Cart
Retrieve current user's shopping cart.

**Endpoint:** `GET /api/cart`

**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "productId": 1,
    "productName": "미쿠 셔츠",
    "quantity": 2,
    "price": 4200,
    "imageUrl": "https://example.com/miku-shirt.png"
  },
  {
    "id": 2,
    "productId": 3,
    "productName": "Luka Hoodie",
    "quantity": 1,
    "price": 6600,
    "imageUrl": "https://example.com/luka-hoodie.png"
  }
]
```

**cURL Example:**
```bash
curl http://16.184.51.237:8081/api/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Add to Cart
Add a product to the shopping cart.

**Endpoint:** `POST /api/cart`

**Authentication:** Required

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "productId": 1,
  "productName": "미쿠 셔츠",
  "quantity": 2,
  "price": 4200,
  "imageUrl": "https://example.com/miku-shirt.png"
}
```

**Errors:**
- `404 Not Found` - Product does not exist
- `400 Bad Request` - Invalid quantity

**cURL Example:**
```bash
curl -X POST http://16.184.51.237:8081/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productId": 1,
    "quantity": 2
  }'
```

---

### Update Cart Item
Update quantity of a cart item.

**Endpoint:** `PUT /api/cart/{cartItemId}`

**Authentication:** Required

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "productId": 1,
  "productName": "미쿠 셔츠",
  "quantity": 3,
  "price": 4200,
  "imageUrl": "https://example.com/miku-shirt.png"
}
```

**cURL Example:**
```bash
curl -X PUT http://16.184.51.237:8081/api/cart/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"quantity": 3}'
```

---

### Remove from Cart
Remove an item from the shopping cart.

**Endpoint:** `DELETE /api/cart/{cartItemId}`

**Authentication:** Required

**Response:** `204 No Content`

**cURL Example:**
```bash
curl -X DELETE http://16.184.51.237:8081/api/cart/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Clear Cart
Remove all items from the shopping cart.

**Endpoint:** `DELETE /api/cart`

**Authentication:** Required

**Response:** `204 No Content`

**cURL Example:**
```bash
curl -X DELETE http://16.184.51.237:8081/api/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Order Endpoints

### Create Order
Create an order from cart items.

**Endpoint:** `POST /api/orders`

**Authentication:** Required

**Request Body:**
```json
{
  "shippingAddress": "123 Main St, Seoul, South Korea",
  "paymentMethod": "CREDIT_CARD"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "orderDate": "2025-11-05T17:30:00",
  "totalAmount": 15000,
  "status": "PENDING",
  "shippingAddress": "123 Main St, Seoul, South Korea",
  "items": [
    {
      "productId": 1,
      "productName": "미쿠 셔츠",
      "quantity": 2,
      "price": 4200
    },
    {
      "productId": 3,
      "productName": "Luka Hoodie",
      "quantity": 1,
      "price": 6600
    }
  ]
}
```

**Errors:**
- `400 Bad Request` - Cart is empty

**cURL Example:**
```bash
curl -X POST http://16.184.51.237:8081/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "shippingAddress": "123 Main St, Seoul, South Korea",
    "paymentMethod": "CREDIT_CARD"
  }'
```

---

### Get User Orders
Retrieve all orders for current user.

**Endpoint:** `GET /api/orders`

**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "orderDate": "2025-11-05T17:30:00",
    "totalAmount": 15000,
    "status": "PENDING",
    "shippingAddress": "123 Main St, Seoul, South Korea",
    "items": [...]
  }
]
```

**cURL Example:**
```bash
curl http://16.184.51.237:8081/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Get Order by ID
Retrieve a specific order.

**Endpoint:** `GET /api/orders/{orderId}`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": 1,
  "orderDate": "2025-11-05T17:30:00",
  "totalAmount": 15000,
  "status": "PENDING",
  "shippingAddress": "123 Main St, Seoul, South Korea",
  "items": [
    {
      "productId": 1,
      "productName": "미쿠 셔츠",
      "quantity": 2,
      "price": 4200
    }
  ]
}
```

**Errors:**
- `404 Not Found` - Order does not exist
- `403 Forbidden` - Order belongs to another user

**cURL Example:**
```bash
curl http://16.184.51.237:8081/api/orders/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Update Order Status
Update the status of an order (Admin only).

**Endpoint:** `PUT /api/orders/{orderId}/status`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "status": "SHIPPED"
}
```

**Valid statuses:** `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`

**Response:** `200 OK`
```json
{
  "id": 1,
  "status": "SHIPPED"
}
```

**cURL Example:**
```bash
curl -X PUT http://16.184.51.237:8081/api/orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"status": "SHIPPED"}'
```

---

## User Endpoints

### Get Current User
Get currently authenticated user's information.

**Endpoint:** `GET /api/users/me`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "role": "USER",
  "createdAt": "2025-11-01T10:00:00"
}
```

**cURL Example:**
```bash
curl http://16.184.51.237:8081/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Update User Profile
Update current user's profile.

**Endpoint:** `PUT /api/users/me`

**Authentication:** Required

**Request Body:**
```json
{
  "email": "newemail@example.com"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "testuser",
  "email": "newemail@example.com",
  "role": "USER"
}
```

**cURL Example:**
```bash
curl -X PUT http://16.184.51.237:8081/api/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"email": "newemail@example.com"}'
```

---

## Error Responses

All endpoints may return these standard error responses:

### 400 Bad Request
```json
{
  "timestamp": "2025-11-05T17:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid input data",
  "path": "/api/products"
}
```

### 401 Unauthorized
```json
{
  "timestamp": "2025-11-05T17:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or missing JWT token",
  "path": "/api/cart"
}
```

### 403 Forbidden
```json
{
  "timestamp": "2025-11-05T17:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied",
  "path": "/api/products"
}
```

### 404 Not Found
```json
{
  "timestamp": "2025-11-05T17:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Product not found",
  "path": "/api/products/999"
}
```

### 500 Internal Server Error
```json
{
  "timestamp": "2025-11-05T17:30:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "path": "/api/orders"
}
```

---

## Testing with Postman

### 1. Import Collection
Create a new Postman collection with the base URL as a variable:
- Variable: `baseUrl`
- Value: `http://16.184.51.237:8081/api`

### 2. Setup Environment
Create environment variables:
- `jwt_token` - Store JWT after login
- `username` - Store username
- `password` - Store password

### 3. Test Flow
1. **Register** → Save JWT token
2. **Login** → Update JWT token
3. **Get Products** → View catalog
4. **Add to Cart** → Add items
5. **View Cart** → Check cart
6. **Create Order** → Place order
7. **View Orders** → Check order history

---

## Rate Limiting
Currently no rate limiting implemented. Recommended for production:
- 100 requests per minute per IP
- 1000 requests per hour per user

---

## Versioning
Current API version: `v1` (no version prefix in URL yet)

Future versions will use: `/api/v2/...`

---

## CORS Configuration
Backend allows requests from all origins (`*`).

For production, configure specific frontend domains:
```java
@CrossOrigin(origins = "https://yourfrontend.com")
```

---

**Last Updated:** 2025-11-05  
**API Status:** ✅ Online at `http://16.184.51.237:8081/api`
