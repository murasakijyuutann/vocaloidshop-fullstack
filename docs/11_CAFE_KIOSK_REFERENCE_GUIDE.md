# 🍰 Cafe Kiosk Reference Guide
## UI Components & System Design from Vocaloid Shop Project

**Target Project:** Simple Cafe Kiosk App  
**Reference Project:** Vocaloid E-commerce Platform  
**Created:** November 6, 2025

---

## 📋 Table of Contents

1. [Overview - What to Reference](#overview)
2. [UI/UX Components for Kiosk](#ui-components)
3. [System Architecture Patterns](#system-architecture)
4. [Frontend Design Patterns](#frontend-patterns)
5. [Backend API Design](#backend-api)
6. [Database Schema Reference](#database-schema)
7. [Code Snippets to Reuse](#code-snippets)
8. [What NOT to Copy](#what-not-to-copy)

---

## 🎯 Overview - What to Reference

### Perfect Match for Cafe Kiosk

| Vocaloid Shop Feature | Cafe Kiosk Equivalent | Reference File |
|----------------------|----------------------|----------------|
| **Product Catalog** | Menu Items Display | `HomePage.tsx` |
| **Category Filter** | Coffee/Dessert/Drinks Filter | `HomePage.tsx` (lines 60-110) |
| **Product Detail** | Item Customization Page | `ProductDetail.tsx` |
| **Shopping Cart** | Order Cart | `CartPage.tsx` |
| **Checkout Flow** | Payment & Order Confirmation | `CheckoutPage.tsx` |
| **Order Management** | Kitchen Order Display | `OrderController.java` |

---

## 🎨 UI Components for Kiosk

### 1. **Product Grid Display** ⭐⭐⭐⭐⭐
**Perfect for:** Cafe menu items display

**Location:** `vocaloid_front/src/pages/HomePage.tsx`

**Key Features:**
- ✅ Responsive grid layout (desktop/tablet/mobile)
- ✅ Product cards with image, name, price
- ✅ Search functionality
- ✅ Category filtering
- ✅ Sort by price
- ✅ Hover animations

**Code Reference:**
```tsx
// Grid Layout - Auto-responsive
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
`;

// Product Card with Hover Effect
const ProductCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.15);
  }
`;
```

**Kiosk Adaptation:**
```
Coffee Items     →  Product Cards with Coffee Images
Category Filter  →  Coffee/Dessert/Drinks tabs
Search Bar       →  Quick search for menu items
Price Display    →  ₩4,500 format
```

---

### 2. **Shopping Cart UI** ⭐⭐⭐⭐⭐
**Perfect for:** Order summary in cafe kiosk

**Location:** `vocaloid_front/src/pages/CartPage.tsx`

**Key Features:**
- ✅ Item list with image + name + quantity
- ✅ Quantity increment/decrement buttons
- ✅ Item removal
- ✅ Real-time total calculation
- ✅ Empty cart state

**Code Reference:**
```tsx
// Cart Layout - Main content + Summary sidebar
const CartLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;  // Items | Summary
  gap: 2rem;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;  // Stack on mobile
  }
`;

// Quantity Controls
const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f7fafc;
  border-radius: 10px;
  padding: 0.5rem;
`;
```

**Kiosk Adaptation:**
```
Cart Items       →  Current Order Items
Quantity Buttons →  +/- buttons (larger for touch)
Total Calculation →  Real-time order total
Checkout Button  →  "Proceed to Payment"
```

---

### 3. **Checkout Flow with Progress Bar** ⭐⭐⭐⭐
**Perfect for:** Multi-step order process

**Location:** `vocaloid_front/src/pages/CheckoutPage.tsx`

**Key Features:**
- ✅ Visual progress indicator (Step 1 → 2 → 3)
- ✅ Form validation
- ✅ Order summary review
- ✅ Confirmation page

**Code Reference:**
```tsx
// Progress Bar Component
const ProgressBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 10%;
    right: 10%;
    height: 2px;
    background: #e2e8f0;
    z-index: 0;
  }
`;

const StepCircle = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => 
    props.$completed ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' :
    props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
    '#e2e8f0'
  };
  color: ${props => props.$active || props.$completed ? 'white' : '#a0aec0'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
`;
```

**Kiosk Adaptation:**
```
Step 1: Select Items     →  Menu browsing
Step 2: Review Order     →  Cart review
Step 3: Payment          →  Payment method selection
Step 4: Confirmation     →  Order number display
```

---

### 4. **Product Detail Modal** ⭐⭐⭐⭐
**Perfect for:** Drink customization (size, shots, milk type)

**Location:** `vocaloid_front/src/pages/ProductDetail.tsx`

**Key Features:**
- ✅ Large product image
- ✅ Product name + description
- ✅ Price display
- ✅ Quantity selector
- ✅ Add to cart button
- ✅ Category badge

**Code Reference:**
```tsx
// Product Layout - Image + Info side-by-side
const ProductLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;  // Stack on mobile
    gap: 2rem;
  }
`;

// Quantity Selector
const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f7fafc;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  width: fit-content;
`;
```

**Kiosk Adaptation:**
```
Product Image    →  Drink/Food Photo
Category Badge   →  "Coffee", "Dessert", "Drinks"
Description      →  Ingredients/Customization Options
Quantity +/-     →  Order quantity (1-99)
Add to Cart      →  "Add to Order" (large button)
```

---

### 5. **Navigation & Cart Badge** ⭐⭐⭐⭐⭐
**Perfect for:** Kiosk header with cart counter

**Location:** `vocaloid_front/src/components/Navbar.tsx`

**Key Features:**
- ✅ Sticky navigation bar
- ✅ Cart icon with item count badge
- ✅ Animated badge (pulse effect)
- ✅ Gradient background

**Code Reference:**
```tsx
// Sticky Navigation
const Nav = styled.nav`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 0;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

// Cart Badge with Animation
const CartBadge = styled.span`
  background: #ff4757;
  color: white;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;
```

**Kiosk Adaptation:**
```
Logo             →  Cafe Logo/Name
Cart Badge       →  Order item count (e.g., "3")
Nav Items        →  "Menu", "My Order", "Call Staff"
```

---

### 6. **Toast Notifications** ⭐⭐⭐⭐⭐
**Perfect for:** User feedback (item added, payment success)

**Location:** `vocaloid_front/src/components/ToastProvider.tsx`

**Key Features:**
- ✅ Non-intrusive notifications
- ✅ Success/Error types
- ✅ Auto-dismiss (3 seconds)
- ✅ Slide-in animation
- ✅ Stacked notifications

**Code Reference:**
```tsx
const ToastItem = styled(motion.div)<{ type?: Toast["type"] }>`
  background: ${({ type }) => 
    type === "error" ? "#e74c3c" : 
    type === "success" ? "#48bb78" : 
    "#333"
  };
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  max-width: 320px;
`;

// Usage
show("Item added to cart!", "success");
show("Payment failed", "error");
```

**Kiosk Adaptation:**
```
Success Toast    →  "Americano added to order!"
Error Toast      →  "Payment declined. Try again."
Info Toast       →  "Preparing your order..."
```

---

## 🏗️ System Architecture Patterns

### 1. **Three-Tier Architecture** ⭐⭐⭐⭐⭐

```
┌─────────────────────────────────────────┐
│         PRESENTATION LAYER              │
│  (React + TypeScript + Styled Components)│
│  - HomePage.tsx (Menu Display)          │
│  - CartPage.tsx (Order Cart)            │
│  - CheckoutPage.tsx (Payment)           │
└──────────────┬──────────────────────────┘
               │ REST API (Axios)
┌──────────────▼──────────────────────────┐
│         APPLICATION LAYER               │
│  (Spring Boot + Java 21)                │
│  - ProductController (Menu API)         │
│  - CartController (Cart Management)     │
│  - OrderController (Order Processing)   │
│  - ProductService (Business Logic)      │
└──────────────┬──────────────────────────┘
               │ JPA/Hibernate
┌──────────────▼──────────────────────────┐
│            DATA LAYER                   │
│  (MySQL 8.0 on AWS RDS)                 │
│  - products (Menu Items)                │
│  - cart_items (Current Orders)          │
│  - orders (Completed Orders)            │
└─────────────────────────────────────────┘
```

**For Cafe Kiosk:**
- Frontend: React (touch-friendly UI)
- Backend: Spring Boot (order processing)
- Database: MySQL (menu + orders)

---

### 2. **RESTful API Design** ⭐⭐⭐⭐⭐

**Reference:** `vocaloidshop/src/main/java/mjyuu/vocaloidshop/controller/`

| Endpoint | Method | Purpose | Kiosk Equivalent |
|----------|--------|---------|------------------|
| `/api/products` | GET | List all products | Get menu items |
| `/api/products/{id}` | GET | Get product detail | Get item details |
| `/api/cart/{userId}` | GET | Get user's cart | Get current order |
| `/api/cart` | POST | Add to cart | Add item to order |
| `/api/cart/{id}` | DELETE | Remove from cart | Remove from order |
| `/api/orders` | POST | Place order | Submit order |
| `/api/orders/{userId}` | GET | Get user orders | Order history |

**Standard Response Format:**
```json
// Success
{
  "status": 200,
  "data": { ... }
}

// Error (from GlobalExceptionHandler)
{
  "status": 404,
  "message": "Product not found with id: 999",
  "path": "/api/products/999",
  "timestamp": "2025-11-06T09:47:44"
}
```

---

### 3. **State Management Pattern** ⭐⭐⭐⭐

**Reference:** `vocaloid_front/src/context/CartContext.tsx`

**React Context + Custom Hooks Pattern:**

```tsx
// 1. Context Definition (CartContextBase.tsx)
export const CartContext = createContext<CartContextType>(undefined!);

// 2. Provider with State Logic (CartContext.tsx)
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const fetchCart = async () => { /* API call */ };
  const addToCart = async (productId, quantity) => { /* API call */ };
  const removeFromCart = async (cartItemId) => { /* API call */ };
  
  return (
    <CartContext.Provider value={{ cart, fetchCart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

// 3. Custom Hook for Easy Access (useCart.ts)
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

// 4. Usage in Components
const { cart, addToCart } = useCart();
```

**For Cafe Kiosk:**
```
OrderContext  →  Current order state
MenuContext   →  Menu items (with caching)
PaymentContext → Payment processing state
```

---

## 🎨 Frontend Design Patterns

### 1. **Styled Components Pattern** ⭐⭐⭐⭐

**Why This is Great for Kiosk:**
- ✅ Component-scoped styling (no CSS conflicts)
- ✅ Dynamic styling with props
- ✅ Built-in theming support
- ✅ TypeScript support

**Reference:** All `.tsx` files in `vocaloid_front/src/pages/`

```tsx
// Dynamic Styling Based on Props
const Button = styled.button<{ $primary?: boolean }>`
  background: ${props => props.$primary ? '#667eea' : '#e2e8f0'};
  color: ${props => props.$primary ? 'white' : '#2d3748'};
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Usage
<Button $primary onClick={handleCheckout}>Checkout</Button>
<Button onClick={handleCancel}>Cancel</Button>
```

---

### 2. **Responsive Design Strategy** ⭐⭐⭐⭐⭐

**Mobile-First Approach:**

```tsx
// Base styles for mobile (smallest screen)
const Card = styled.div`
  padding: 1rem;
  font-size: 1rem;
  
  // Tablet (768px+)
  @media (min-width: 768px) {
    padding: 1.5rem;
    font-size: 1.1rem;
  }
  
  // Desktop (968px+)
  @media (min-width: 968px) {
    padding: 2rem;
    font-size: 1.2rem;
  }
`;
```

**Kiosk Considerations:**
- Tablet mode: 1024x768 or 1280x800 (most kiosks)
- Touch targets: Minimum 44x44px (Apple HIG)
- Font size: 1.2rem minimum for readability

---

### 3. **Animation & Transitions** ⭐⭐⭐⭐

**Smooth User Experience:**

```tsx
// Page Transition (PageTransition.tsx)
const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

// Fade-in Animation
const Wrapper = styled.div`
  animation: fadeInUp 0.5s ease;
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
```

**For Kiosk:**
- Page transitions (menu → cart → payment)
- Button feedback (press animations)
- Loading states (spinner, skeleton)

---

## 🔧 Backend API Design

### 1. **Controller Layer Pattern** ⭐⭐⭐⭐⭐

**Reference:** `vocaloidshop/src/main/java/mjyuu/vocaloidshop/controller/OrderController.java`

```java
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin
public class OrderController {
    
    private final OrderService orderService;
    
    // Get user's order history
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        List<Order> orders = orderService.listUserOrders(userId);
        return ResponseEntity.ok(orders);
    }
    
    // Place new order
    @PostMapping("/user/{userId}")
    public ResponseEntity<Order> placeOrder(
        @PathVariable Long userId, 
        @RequestParam(required = false) Long addressId
    ) {
        Order order = orderService.placeOrder(userId, addressId);
        return ResponseEntity.ok(order);
    }
}
```

**Kiosk Adaptation:**
```java
@RestController
@RequestMapping("/api/kiosk")
public class KioskController {
    
    // Get menu items
    @GetMapping("/menu")
    public ResponseEntity<List<MenuItem>> getMenu() { ... }
    
    // Submit order
    @PostMapping("/orders")
    public ResponseEntity<Order> submitOrder(@RequestBody OrderRequest request) { ... }
    
    // Get order status
    @GetMapping("/orders/{orderId}/status")
    public ResponseEntity<OrderStatus> getOrderStatus(@PathVariable Long orderId) { ... }
}
```

---

### 2. **Service Layer Pattern** ⭐⭐⭐⭐⭐

**Reference:** `vocaloidshop/src/main/java/mjyuu/vocaloidshop/service/OrderService.java`

**Key Concepts:**
- ✅ Business logic separation
- ✅ Transaction management with `@Transactional`
- ✅ Error handling with custom exceptions
- ✅ Stock validation

```java
@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    
    @Transactional
    public Order placeOrder(Long userId, Long addressId) {
        // 1. Validate cart not empty
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        // 2. Check stock availability
        for (CartItem cart : cartItems) {
            if (product.getStockQuantity() < cart.getQuantity()) {
                throw new RuntimeException("Insufficient stock: " + product.getName());
            }
        }
        
        // 3. Create order items and reduce stock
        for (CartItem cart : cartItems) {
            product.setStockQuantity(product.getStockQuantity() - cart.getQuantity());
            // Create order item...
        }
        
        // 4. Save order and clear cart
        Order order = orderRepository.save(order);
        cartItemRepository.deleteAll(cartItems);
        
        return order;
    }
}
```

**Kiosk Adaptation:**
```java
@Service
public class KioskOrderService {
    
    @Transactional
    public Order processOrder(OrderRequest request) {
        // 1. Validate order items
        // 2. Calculate total (with discounts if any)
        // 3. Process payment
        // 4. Create order record
        // 5. Send to kitchen display
        // 6. Return order number
    }
}
```

---

### 3. **Exception Handling Pattern** ⭐⭐⭐⭐⭐

**Reference:** `vocaloidshop/src/main/java/mjyuu/vocaloidshop/exception/GlobalExceptionHandler.java`

**Centralized Error Handling:**

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    // Handle resource not found (404)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
        ResourceNotFoundException ex,
        HttpServletRequest request
    ) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    // Handle validation errors (400)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
        MethodArgumentNotValidException ex,
        HttpServletRequest request
    ) {
        // Extract validation error messages...
        return ResponseEntity.badRequest().body(error);
    }
}
```

**Error Response Format:**
```json
{
  "status": 404,
  "message": "Product not found with id: 999",
  "path": "/api/products/999",
  "timestamp": "2025-11-06T09:47:44"
}
```

---

## 🗄️ Database Schema Reference

### Full Schema Documentation
**See:** `docs/10_DATABASE_SCHEMA.md` for complete details

### Key Tables for Cafe Kiosk

#### 1. **Menu Items Table** (equivalent to `products`)

```sql
CREATE TABLE menu_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INT NOT NULL,                    -- Price in cents (e.g., 4500 = ₩4,500)
    category_id BIGINT,                    -- Foreign key to categories
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,     -- Out of stock flag
    
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_category (category_id),
    INDEX idx_available (is_available),
    CHECK (price >= 0)
);
```

**Sample Data:**
```sql
INSERT INTO menu_items (name, description, price, category_id, image_url) VALUES
('Americano', 'Hot or Iced', 4500, 1, '/images/americano.jpg'),
('Cafe Latte', 'Smooth espresso with steamed milk', 5000, 1, '/images/latte.jpg'),
('Croissant', 'Buttery French pastry', 3500, 2, '/images/croissant.jpg');
```

#### 2. **Categories Table**

```sql
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_order INT DEFAULT 0,           -- For ordering tabs
    
    INDEX idx_display_order (display_order)
);

INSERT INTO categories (name, display_order) VALUES
('Coffee', 1),
('Desserts', 2),
('Beverages', 3),
('Bakery', 4);
```

#### 3. **Orders Table**

```sql
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE,       -- Display number (e.g., "K-001")
    total_amount INT NOT NULL,
    status VARCHAR(50) NOT NULL,           -- PENDING, PREPARING, READY, COMPLETED
    payment_method VARCHAR(50),            -- CARD, CASH, MOBILE
    ordered_at DATETIME,
    completed_at DATETIME,
    
    INDEX idx_status (status),
    INDEX idx_ordered_at (ordered_at),
    CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')),
    CHECK (total_amount >= 0)
);
```

#### 4. **Order Items Table**

```sql
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price INT NOT NULL,                    -- Price at order time
    customization TEXT,                    -- JSON: {"size": "Large", "shots": 2, "milk": "Oat"}
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    CHECK (quantity > 0),
    CHECK (price >= 0)
);
```

### Entity Relationships for Kiosk

```
categories (1) ──< (N) menu_items
                         │
                         │ (N)
                         ▼
orders (1) ──< (N) order_items
```

---

## 💻 Code Snippets to Reuse

### 1. **Axios API Client Setup**

```typescript
// api/client.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

### 2. **Quantity Selector Component**

```tsx
// components/QuantitySelector.tsx
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f7fafc;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  width: fit-content;
`;

const Button = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e2e8f0;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Quantity = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
`;

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const QuantitySelector: React.FC<Props> = ({ 
  value, 
  onChange, 
  min = 1, 
  max = 99 
}) => {
  return (
    <Container>
      <Button onClick={() => onChange(value - 1)} disabled={value <= min}>
        −
      </Button>
      <Quantity>{value}</Quantity>
      <Button onClick={() => onChange(value + 1)} disabled={value >= max}>
        +
      </Button>
    </Container>
  );
};
```

---

### 3. **Price Formatter Utility**

```typescript
// utils/formatPrice.ts

/**
 * Format price for display
 * @param price - Price in cents (e.g., 4500)
 * @returns Formatted string (e.g., "₩4,500")
 */
export const formatPrice = (price: number): string => {
  return `₩${price.toLocaleString('ko-KR')}`;
};

/**
 * Calculate total from cart items
 */
export const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};
```

---

### 4. **Loading Skeleton Component**

```tsx
// components/LoadingSkeleton.tsx
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

export const Skeleton = styled.div<{ width?: string; height?: string }>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '20px'};
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 8px;
`;

// Usage
<Skeleton width="200px" height="24px" />
```

---

### 5. **Empty State Component**

```tsx
// components/EmptyState.tsx
import styled from 'styled-components';

const Container = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const Message = styled.p`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const Hint = styled.p`
  font-size: 1rem;
  opacity: 0.7;
`;

interface Props {
  icon: string;
  message: string;
  hint?: string;
}

export const EmptyState: React.FC<Props> = ({ icon, message, hint }) => (
  <Container>
    <Icon>{icon}</Icon>
    <Message>{message}</Message>
    {hint && <Hint>{hint}</Hint>}
  </Container>
);

// Usage
<EmptyState 
  icon="🛒" 
  message="Your cart is empty" 
  hint="Browse our menu to add items"
/>
```

---

## ❌ What NOT to Copy

### 1. **User Authentication System**
**Why:** Kiosk is single-user, no login needed
- ❌ AuthController.java
- ❌ JWT token handling
- ❌ User registration/login pages
- ❌ Password encryption

**Instead:** Use session-based orders (session ID or order number)

---

### 2. **Wishlist Feature**
**Why:** Not relevant for kiosk ordering
- ❌ WishlistController
- ❌ WishlistPage.tsx
- ❌ wishlist_items table

---

### 3. **Shipping/Address Management**
**Why:** In-store pickup only
- ❌ AddressController
- ❌ AddressesPage.tsx
- ❌ addresses table
- ❌ Shipping form in checkout

---

### 4. **User Profile & History**
**Why:** Anonymous kiosk users
- ❌ MyPage.tsx
- ❌ UserController
- ❌ Order history page

**Instead:** Order tracking by order number only

---

### 5. **OAuth Integration**
**Why:** No external login for kiosk
- ❌ OAuthCallbackPage.tsx
- ❌ Google/Social login

---

### 6. **Admin Panel**
**Why:** Use separate admin dashboard
- ❌ AdminOrdersPage.tsx (in frontend)

**Instead:** Build dedicated admin app or use existing POS system

---

## 🎯 Recommended Kiosk Architecture

### Simplified Stack

```
Frontend:  React + TypeScript + Styled Components
Backend:   Spring Boot (REST API)
Database:  MySQL
Hosting:   Local server + Tablet kiosk
```

### Core Features to Implement

✅ **Must Have:**
1. Menu display with categories
2. Item detail with customization
3. Shopping cart
4. Order checkout
5. Payment integration (card reader API)
6. Order number display
7. Kitchen order sync

✅ **Nice to Have:**
1. Order status tracking
2. Receipt printing
3. Daily sales dashboard
4. Inventory alerts

❌ **Not Needed:**
1. User accounts
2. Wishlist
3. Reviews/ratings
4. Shipping
5. Email notifications

---

## 📊 Component Reusability Matrix

| Component | Direct Copy | Modify | Don't Use |
|-----------|------------|---------|-----------|
| Product Grid | ✅ 90% | Category filter | N/A |
| Product Card | ✅ 95% | Remove wishlist icon | N/A |
| Cart Layout | ✅ 85% | Remove "Continue Shopping" | N/A |
| Quantity Selector | ✅ 100% | None | N/A |
| Checkout Flow | 🔧 50% | Remove shipping step | Address form |
| Progress Bar | ✅ 100% | Adjust step labels | N/A |
| Toast Notifications | ✅ 100% | None | N/A |
| Navbar | 🔧 60% | Remove auth links | Login/Register |
| OrderController | ✅ 80% | Remove addressId param | N/A |
| OrderService | ✅ 75% | Simplify validation | User checks |
| Database Schema | ✅ 70% | Remove user FK | users, addresses |

**Legend:**
- ✅ Direct Copy: Use as-is with minimal changes
- 🔧 Modify: Significant changes needed
- ❌ Don't Use: Not applicable for kiosk

---

## 🚀 Quick Start Checklist for Your Team

### Week 1: Setup & UI
- [ ] Review HomePage.tsx for menu display
- [ ] Review CartPage.tsx for order cart
- [ ] Copy QuantitySelector component
- [ ] Copy Toast notification system
- [ ] Setup styled-components theme

### Week 2: Backend & Database
- [ ] Review database schema (`10_DATABASE_SCHEMA.md`)
- [ ] Create simplified schema (remove users, addresses, wishlist)
- [ ] Review OrderController.java
- [ ] Review OrderService.java
- [ ] Setup Spring Boot project

### Week 3: Integration
- [ ] Connect frontend to backend
- [ ] Implement cart functionality
- [ ] Add order placement
- [ ] Test payment flow

### Week 4: Polish
- [ ] Add loading states
- [ ] Error handling
- [ ] Touch optimization (larger buttons)
- [ ] Kitchen display sync

---

## 📚 Additional Resources

### From This Project:
1. **Database Schema:** `docs/10_DATABASE_SCHEMA.md`
2. **API Testing:** Use existing Swagger docs (if configured)
3. **Frontend Examples:** All files in `vocaloid_front/src/pages/`
4. **Backend Logic:** All files in `vocaloidshop/src/main/java/.../service/`

### External References:
1. **React + TypeScript:** https://react-typescript-cheatsheet.netlify.app/
2. **Styled Components:** https://styled-components.com/docs
3. **Spring Boot REST:** https://spring.io/guides/tutorials/rest/
4. **Touch UI Guidelines:** Apple Human Interface Guidelines (HIG)

---

## 💡 Pro Tips for Kiosk Development

### 1. **Touch-Friendly Design**
```tsx
// Minimum touch target: 44x44px
const Button = styled.button`
  min-width: 120px;
  min-height: 60px;
  font-size: 1.2rem;
  padding: 1rem 2rem;
`;
```

### 2. **Auto-Reset Timeout**
```typescript
// Reset to home page after 2 minutes of inactivity
useEffect(() => {
  const timeout = setTimeout(() => {
    navigate('/');
    clearCart();
  }, 120000); // 2 minutes
  
  return () => clearTimeout(timeout);
}, [navigate]);
```

### 3. **Prevent Screen Sleep**
```typescript
// Use NoSleep.js library
import NoSleep from 'nosleep.js';

const noSleep = new NoSleep();
noSleep.enable();
```

### 4. **Large, Clear Fonts**
```tsx
const Text = styled.p`
  font-size: 1.2rem;  // Minimum for kiosk
  line-height: 1.5;
  font-weight: 500;
`;
```

### 5. **Error Recovery**
```tsx
// Always provide a way out
<Button onClick={() => navigate('/')}>
  ← Back to Menu
</Button>
```

---

## 📞 Questions?

If your team has questions about specific components or patterns:

1. **UI Components:** Check `vocaloid_front/src/pages/` and `vocaloid_front/src/components/`
2. **Backend Logic:** Check `vocaloidshop/src/main/java/mjyuu/vocaloidshop/`
3. **Database:** Check `docs/10_DATABASE_SCHEMA.md` or `schema.sql`
4. **API Endpoints:** Check controller files (e.g., `ProductController.java`)

**Good luck with your cafe kiosk project! 🎉**

---

**Document Version:** 1.0  
**Last Updated:** November 6, 2025  
**Project:** Vocaloid Shop (Portfolio Reference for Cafe Kiosk)
