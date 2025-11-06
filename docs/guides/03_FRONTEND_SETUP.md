# Frontend Setup Guide

## Prerequisites
- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)

## Initial Setup

### 1. Navigate to Frontend Directory
```bash
cd C:/Users/rwoo1/Documents/VSCodeProjects/v_shop/vocaloid_front
```

### 2. Install Dependencies
```bash
npm install
```

**Expected Output:**
```
added 250 packages in 15s
```

### 3. Configure Backend URL

Edit `src/api/axiosConfig.ts`:
```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "http://16.184.51.237:8081/api"  // AWS backend URL
  // Or for local development:
  // baseURL: "http://localhost:8081/api"
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### 4. Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
VITE v7.1.12  ready in 433 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 5. Open in Browser
Navigate to: `http://localhost:5173/`

## Project Structure Explained

```
vocaloid_front/
├── public/                          # Static assets
├── src/
│   ├── api/
│   │   └── axiosConfig.ts          # Axios instance with JWT interceptor
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── Header.tsx              # Navigation header
│   │   ├── ProductCard.tsx         # Product display card
│   │   ├── CartItem.tsx            # Shopping cart item
│   │   └── ...
│   │
│   ├── context/                     # React Context for state management
│   │   ├── AuthContext.tsx         # User authentication state
│   │   ├── CartContext.tsx         # Shopping cart state
│   │   └── ...
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.ts              # Authentication hook
│   │   ├── useCart.ts              # Cart operations hook
│   │   └── ...
│   │
│   ├── pages/                       # Page components (routes)
│   │   ├── HomePage.tsx            # Main landing page
│   │   ├── LoginPage.tsx           # Login form
│   │   ├── RegisterPage.tsx        # Registration form
│   │   ├── CartPage.tsx            # Shopping cart
│   │   └── ...
│   │
│   ├── router/
│   │   └── index.tsx               # React Router configuration
│   │
│   ├── services/                    # API service layer
│   │   ├── authService.ts          # Authentication API calls
│   │   ├── productService.ts       # Product API calls
│   │   ├── cartService.ts          # Cart API calls
│   │   └── ...
│   │
│   ├── styles/
│   │   └── GlobalStyle.ts          # Global CSS/styled-components
│   │
│   ├── App.tsx                      # Root component
│   ├── App.css                      # App styles
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles
│
├── index.html                       # HTML template
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite build config
└── eslint.config.js                 # ESLint config
```

## Key Files Explained

### 1. axiosConfig.ts
Configures HTTP client with JWT authentication:
```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "http://16.184.51.237:8081/api"
});

// Automatically add JWT token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### 2. AuthContext.tsx (Typical Structure)
Manages user authentication state:
```typescript
import { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: User | null;
  login: (token: string, username: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (token: string, username: string) => {
    localStorage.setItem('token', token);
    setUser({ username });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### 3. Router Configuration (router/index.tsx)
Defines application routes:
```typescript
import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CartPage from '../pages/CartPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/cart',
    element: <CartPage />
  }
]);

export default router;
```

## Page Components

### HomePage.tsx
- Displays product catalog
- Filters by category
- Add to cart functionality

### LoginPage.tsx
- Login form
- Calls `/api/auth/login`
- Stores JWT token on success
- Redirects to home page

### RegisterPage.tsx
- Registration form
- Calls `/api/auth/register`
- Auto-login after registration

### CartPage.tsx
- Shows cart items
- Update quantities
- Remove items
- Checkout button

## API Service Layer

### authService.ts
```typescript
import api from '../api/axiosConfig';

export const login = async (username: string, password: string) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const register = async (username: string, password: string, email: string) => {
  const response = await api.post('/auth/register', { username, password, email });
  return response.data;
};
```

### productService.ts
```typescript
import api from '../api/axiosConfig';

export const getAllProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const getProductById = async (id: number) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (product: ProductRequest) => {
  const response = await api.post('/products', product);
  return response.data;
};
```

### cartService.ts
```typescript
import api from '../api/axiosConfig';

export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (productId: number, quantity: number) => {
  const response = await api.post('/cart', { productId, quantity });
  return response.data;
};

export const removeFromCart = async (cartItemId: number) => {
  await api.delete(`/cart/${cartItemId}`);
};
```

## State Management with Context

### Why Context API?
- Simpler than Redux for small/medium apps
- Share state across components without prop drilling
- Perfect for authentication and cart state

### Common Contexts
1. **AuthContext** - User authentication, login/logout
2. **CartContext** - Shopping cart items, add/remove
3. **ThemeContext** - Dark/light mode (if implemented)

## Styling Approach

### Option 1: CSS Modules
```typescript
import styles from './ProductCard.module.css';

function ProductCard({ product }) {
  return <div className={styles.card}>{product.name}</div>;
}
```

### Option 2: Styled Components
```typescript
import styled from 'styled-components';

const Card = styled.div`
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

function ProductCard({ product }) {
  return <Card>{product.name}</Card>;
}
```

### Option 3: Plain CSS (Current)
```css
/* App.css */
.product-card {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
```

## Development Workflow

### 1. Make Changes
Edit files in `src/`

### 2. Hot Reload
Vite automatically reloads changes in browser

### 3. Check Console
Open browser DevTools (F12) for errors

### 4. Test API Calls
Monitor Network tab in DevTools

## Building for Production

### 1. Build
```bash
npm run build
```

**Output:** Creates `dist/` folder with optimized files

### 2. Preview Production Build
```bash
npm run preview
```

### 3. Deploy
Upload `dist/` folder to:
- AWS S3 + CloudFront
- Netlify
- Vercel
- GitHub Pages

## Common Issues & Solutions

### Issue 1: CORS Errors
**Error:** `Access-Control-Allow-Origin` in console

**Solution:**
1. Backend must have CORS enabled (already configured)
2. Check backend URL in `axiosConfig.ts` is correct
3. Verify backend is running

### Issue 2: 401 Unauthorized
**Error:** API calls return 401

**Solution:**
1. Check if JWT token exists: `localStorage.getItem('token')`
2. Login again to get fresh token
3. Verify token is being sent in Authorization header

### Issue 3: Network Error
**Error:** `Network Error` or `ERR_CONNECTION_REFUSED`

**Solution:**
1. Verify backend is running
2. Check backend URL in `axiosConfig.ts`
3. For AWS: Verify ECS service is running

### Issue 4: Port 5173 Already in Use
**Error:** Port 5173 is already in use

**Solution:**
```bash
# Kill process on port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <process_id> /F

# Or change port in vite.config.ts
export default defineConfig({
  server: {
    port: 3000
  }
})
```

### Issue 5: Module Not Found
**Error:** `Cannot find module 'react'`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Testing the Application

### 1. Test Registration
1. Navigate to `/register`
2. Fill in username, email, password
3. Submit form
4. Should redirect to home page with JWT token stored

### 2. Test Login
1. Navigate to `/login`
2. Enter credentials
3. Submit
4. Should see "Welcome, [username]" or similar

### 3. Test Products
1. Home page should load products from API
2. Products should display with images, prices
3. Categories should filter products

### 4. Test Cart
1. Click "Add to Cart" on product
2. Navigate to `/cart`
3. Cart should show added items
4. Test quantity update
5. Test remove item

### 5. Test Logout
1. Click logout button
2. Should clear token from localStorage
3. Should redirect to login page

## Environment Variables

### For Different Environments

**Development (.env.development):**
```
VITE_API_URL=http://localhost:8081/api
```

**Production (.env.production):**
```
VITE_API_URL=http://16.184.51.237:8081/api
```

**Usage in Code:**
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});
```

## TypeScript Tips

### Type Definitions
```typescript
// types.ts
export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  categoryName: string;
}

export interface User {
  username: string;
  email?: string;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}
```

### Type-Safe API Calls
```typescript
import { Product } from './types';

export const getAllProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>('/products');
  return response.data;
};
```

## Performance Optimization

### 1. Code Splitting
```typescript
import { lazy, Suspense } from 'react';

const CartPage = lazy(() => import('./pages/CartPage'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CartPage />
    </Suspense>
  );
}
```

### 2. Memoization
```typescript
import { useMemo } from 'react';

function ProductList({ products }) {
  const sortedProducts = useMemo(
    () => products.sort((a, b) => a.price - b.price),
    [products]
  );
  
  return <div>{/* render sortedProducts */}</div>;
}
```

### 3. Image Optimization
- Use WebP format
- Lazy load images below fold
- Use CDN for product images

## Next Steps
- See `05_API_DOCUMENTATION.md` for complete API reference
- See `04_AWS_DEPLOYMENT.md` for deploying frontend to AWS S3
