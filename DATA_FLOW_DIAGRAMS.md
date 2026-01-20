# Data Flow Diagrams

Visual representation of how data flows through the application.

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant L as Login Page
    participant NA as NextAuth API
    participant P as Prisma
    participant DB as MySQL Database
    
    U->>L: Enter email & password
    L->>NA: POST /api/auth/callback/credentials
    NA->>P: prisma.user.findUnique({ email })
    P->>DB: SELECT * FROM user WHERE email = ?
    DB-->>P: User record
    P-->>NA: User object
    NA->>NA: bcrypt.compare(password, hash)
    
    alt Password Valid
        NA->>NA: Generate JWT token
        NA-->>L: Session with token
        L-->>U: Redirect to home page
    else Password Invalid
        NA-->>L: Error: Invalid credentials
        L-->>U: Show error message
    end
```

---

## Registration Flow

```mermaid
sequenceDiagram
    participant U as User
    participant R as Register Page
    participant API as /api/auth/register
    participant P as Prisma
    participant DB as MySQL Database
    
    U->>R: Enter email, password, name
    R->>API: POST { email, password, name }
    API->>API: Validate input
    
    API->>P: prisma.user.findUnique({ email })
    P->>DB: SELECT * FROM user WHERE email = ?
    DB-->>P: null (user doesn't exist)
    P-->>API: null
    
    API->>API: bcrypt.hash(password, 10)
    API->>P: prisma.user.create({ data })
    P->>DB: INSERT INTO user (email, password, name)
    DB-->>P: New user record
    P-->>API: User object
    API-->>R: Success response
    R-->>U: Redirect to login page
```

---

## Add to Cart Flow

```mermaid
sequenceDiagram
    participant U as User
    participant PD as Product Detail Page
    participant API as /api/cart
    participant Auth as NextAuth
    participant P as Prisma
    participant DB as MySQL Database
    
    U->>PD: Click "Add to Cart"
    PD->>API: POST { productId, quantity }
    API->>Auth: await auth()
    Auth-->>API: Session { user.id }
    
    API->>P: prisma.cartItem.upsert()
    P->>DB: INSERT INTO cart_item ... ON DUPLICATE KEY UPDATE
    DB-->>P: Cart item record
    P-->>API: CartItem object
    
    API-->>PD: Success response
    PD->>PD: router.refresh()
    PD-->>U: Show success message
```

---

## Checkout & Order Creation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Checkout Page
    participant API as /api/orders
    participant Auth as NextAuth
    participant P as Prisma
    participant DB as MySQL Database
    participant E as Email Service
    
    U->>C: Click "Place Order"
    C->>API: POST { addressId }
    API->>Auth: await auth()
    Auth-->>API: Session { user.id }
    
    API->>P: Get cart items
    P->>DB: SELECT * FROM cart_item WHERE userId = ?
    DB-->>P: Cart items
    P-->>API: CartItem[]
    
    API->>API: Calculate total price
    
    API->>P: Start transaction
    
    rect rgb(200, 220, 240)
        Note over P,DB: Transaction Block
        P->>DB: INSERT INTO order (userId, totalPrice, addressId)
        DB-->>P: Order ID
        
        loop For each cart item
            P->>DB: INSERT INTO order_item (orderId, productId, quantity, price)
            P->>DB: UPDATE product SET stock = stock - quantity
        end
        
        P->>DB: DELETE FROM cart_item WHERE userId = ?
        P->>P: Commit transaction
    end
    
    P-->>API: Order object with items
    
    API->>E: Send order confirmation email
    E-->>API: Email sent
    
    API-->>C: Order created successfully
    C-->>U: Redirect to order confirmation page
```

---

## Product Listing Flow (Server-Side)

```mermaid
sequenceDiagram
    participant B as Browser
    participant NS as Next.js Server
    participant P as Prisma
    participant DB as MySQL Database
    
    B->>NS: GET /
    NS->>NS: Render HomePage (Server Component)
    NS->>P: prisma.product.findMany({ include: { category } })
    P->>DB: SELECT * FROM product JOIN category
    DB-->>P: Product records with categories
    P-->>NS: Product[]
    NS->>NS: Generate HTML with products
    NS-->>B: Fully rendered HTML page
    
    Note over B,NS: No client-side data fetching needed!
```

---

## Admin Order Status Update Flow

```mermaid
sequenceDiagram
    participant A as Admin User
    participant AP as Admin Page
    participant API as /api/orders/[id]
    participant Auth as NextAuth
    participant P as Prisma
    participant DB as MySQL Database
    participant E as Email Service
    
    A->>AP: Select new status
    AP->>API: PATCH /api/orders/123 { status: "SHIPPED" }
    API->>Auth: await auth()
    Auth-->>API: Session { user.isAdmin: true }
    
    alt User is Admin
        API->>P: prisma.order.update({ where: { id }, data: { status } })
        P->>DB: UPDATE order SET status = ? WHERE id = ?
        DB-->>P: Updated order
        P-->>API: Order object
        
        API->>E: Send status update email to customer
        E-->>API: Email sent
        
        API-->>AP: Success response
        AP->>AP: router.refresh()
        AP-->>A: Show updated status
    else User is not Admin
        API-->>AP: 403 Forbidden
        AP-->>A: Show error message
    end
```

---

## Wishlist Management Flow

```mermaid
sequenceDiagram
    participant U as User
    participant P as Product Page
    participant API as /api/wishlist
    participant Auth as NextAuth
    participant Prisma as Prisma Client
    participant DB as MySQL Database
    
    U->>P: Click "Add to Wishlist" ❤️
    P->>API: POST { productId }
    API->>Auth: await auth()
    Auth-->>API: Session { user.id }
    
    API->>Prisma: prisma.wishlistItem.create()
    Prisma->>DB: INSERT INTO wishlist_item (userId, productId)
    
    alt Success
        DB-->>Prisma: Wishlist item created
        Prisma-->>API: WishlistItem object
        API-->>P: Success
        P-->>U: ❤️ (filled heart)
    else Already in wishlist (unique constraint)
        DB-->>Prisma: Error: Duplicate entry
        Prisma-->>API: Error
        API-->>P: Already in wishlist
        P-->>U: Show message
    end
```

---

## Session Management Flow

```mermaid
graph TB
    A[User visits protected page] --> B{Session exists?}
    B -->|No| C[Middleware redirects to /login]
    B -->|Yes| D{Session valid?}
    D -->|No| C
    D -->|Yes| E[Decode JWT token]
    E --> F{Token expired?}
    F -->|Yes| C
    F -->|No| G[Extract user info from token]
    G --> H[Attach session to request]
    H --> I[Render protected page]
    
    style C fill:#ff6b6b
    style I fill:#51cf66
```

---

## API Route Protection Pattern

```mermaid
flowchart TD
    A[API Request] --> B[API Route Handler]
    B --> C{Requires Auth?}
    
    C -->|No| D[Execute business logic]
    C -->|Yes| E[await auth()]
    
    E --> F{Session exists?}
    F -->|No| G[Return 401 Unauthorized]
    F -->|Yes| H{Admin required?}
    
    H -->|No| D
    H -->|Yes| I{User is Admin?}
    
    I -->|No| J[Return 403 Forbidden]
    I -->|Yes| D
    
    D --> K[Prisma query]
    K --> L[Return response]
    
    style G fill:#ff6b6b
    style J fill:#ff6b6b
    style L fill:#51cf66
```

---

## Component Rendering Strategy

```mermaid
graph TB
    subgraph "Server Components (Default)"
        A[Page.tsx] --> B[Fetch data from Prisma]
        B --> C[Render HTML on server]
        C --> D[Send to browser]
    end
    
    subgraph "Client Components ('use client')"
        E[AddToCartButton.tsx] --> F[Handle user interactions]
        F --> G[Make API calls]
        G --> H[Update UI]
    end
    
    subgraph "Hybrid Approach"
        I[ProductDetailPage] --> J[Server: Fetch product data]
        J --> K[Server: Render product info]
        K --> L[Client: AddToCartButton]
        L --> M[Client: Handle cart actions]
    end
    
    style A fill:#61dafb
    style E fill:#ffd43b
    style I fill:#a9e34b
```

---

## Database Query Optimization

### N+1 Query Problem (Avoided with Prisma)

**Bad (Spring Boot - Potential N+1):**
```java
// 1 query to get orders
List<Order> orders = orderRepository.findAll();

// N queries to get items for each order
for (Order order : orders) {
    List<OrderItem> items = order.getItems(); // Lazy loading triggers query
}
```

**Good (Next.js with Prisma):**
```typescript
// Single query with JOIN
const orders = await prisma.order.findMany({
  include: {
    items: {
      include: { product: true }
    },
    address: true,
    user: true
  }
})
```

### Query Flow Diagram

```mermaid
sequenceDiagram
    participant API as API Route
    participant P as Prisma Client
    participant DB as MySQL
    
    Note over API,DB: Efficient Query with Includes
    
    API->>P: prisma.order.findMany({ include: { items, address } })
    P->>DB: SELECT * FROM order<br/>LEFT JOIN order_item<br/>LEFT JOIN address
    DB-->>P: Combined result set
    P->>P: Transform to nested objects
    P-->>API: Order[] with nested items & address
    
    Note over API,DB: Single database round-trip!
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Vercel Edge Network"
        A[CDN / Edge Functions]
    end
    
    subgraph "Vercel Serverless"
        B[Next.js Server]
        C[API Routes]
        D[Server Components]
    end
    
    subgraph "Database"
        E[(MySQL on AWS RDS)]
    end
    
    subgraph "External Services"
        F[Resend Email API]
    end
    
    G[User Browser] --> A
    A --> B
    B --> C
    B --> D
    C --> E
    D --> E
    C --> F
    
    style A fill:#000000,color:#ffffff
    style B fill:#000000,color:#ffffff
    style E fill:#4479a1
```

---

## Migration Data Flow

```mermaid
graph LR
    subgraph "Current System"
        A[React Frontend] --> B[Spring Boot API]
        B --> C[(MySQL Database)]
    end
    
    subgraph "Migration Process"
        D[Prisma Introspection] --> C
        D --> E[Generate Prisma Schema]
        E --> F[Prisma Client]
    end
    
    subgraph "New System"
        G[Next.js Pages] --> H[API Routes]
        H --> F
        F --> C
    end
    
    style C fill:#4479a1
    style F fill:#2d3748,color:#ffffff
```

---

## Performance Comparison

### Current Stack Request Flow
```mermaid
sequenceDiagram
    participant B as Browser
    participant V as Vite Dev Server
    participant SB as Spring Boot
    participant DB as MySQL
    
    B->>V: Request page
    V-->>B: Empty HTML + JS bundle
    B->>B: Parse & execute JS
    B->>V: API request (proxied)
    V->>SB: Forward to Spring Boot
    SB->>DB: Query database
    DB-->>SB: Data
    SB-->>V: JSON response
    V-->>B: JSON data
    B->>B: Render with React
    
    Note over B,DB: Multiple round trips, client-side rendering
```

### Next.js Request Flow
```mermaid
sequenceDiagram
    participant B as Browser
    participant NS as Next.js Server
    participant DB as MySQL
    
    B->>NS: Request page
    NS->>DB: Query database
    DB-->>NS: Data
    NS->>NS: Render React to HTML
    NS-->>B: Fully rendered HTML
    B->>B: Hydrate (make interactive)
    
    Note over B,DB: Single round trip, server-side rendering
```

---

## Key Takeaways

1. **Simplified Architecture**: One server instead of two
2. **Better Performance**: Server-side rendering reduces client work
3. **Type Safety**: End-to-end TypeScript
4. **Efficient Queries**: Prisma prevents N+1 problems
5. **Modern Auth**: NextAuth.js handles sessions seamlessly
6. **Scalable**: Vercel edge network for global distribution
