# 🎨 Frontend Testing Guide - For Developers

**Complete guide for testing the VocaloCart frontend after cloning from GitHub**

This guide walks you through installing all dependencies, understanding the tech stack, and testing the React + TypeScript + Vite frontend locally.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start Installation](#quick-start-installation)
3. [Understanding the Tech Stack](#understanding-the-tech-stack)
4. [Dependency Breakdown](#dependency-breakdown)
5. [Testing the Frontend](#testing-the-frontend)
6. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before you begin, ensure you have:

### Required Software:
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Git** (to clone the repository)
- **Code Editor** (VS Code recommended)

### Verify Installation:
```bash
node --version   # Should show v18.x.x or higher
npm --version    # Should show 9.x.x or higher
git --version    # Should show 2.x.x or higher
```

### Backend Running:
The frontend needs the backend API running on `http://localhost:8081`. See `/docs/guides/02_BACKEND_SETUP.md` for backend setup.

---

## 🚀 Quick Start Installation

### 1️⃣ Clone the Repository

```bash
# Clone from GitHub
git clone <your-repository-url>
cd v_shop

# Navigate to frontend folder
cd vocaloid_front
```

### 2️⃣ Install All Dependencies

```bash
# This installs EVERYTHING from package.json
npm install
```

**What this installs:**
- Vite build tool
- React 19 + TypeScript
- Styled Components (CSS-in-JS)
- Framer Motion (animations)
- React Icons (icon library)
- React Router (navigation)
- Axios (API calls)
- And all dev dependencies (ESLint, TypeScript compiler, etc.)

**Expected output:**
```
added 245 packages in 30s
```

### 3️⃣ Start Development Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v7.1.7  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 4️⃣ Open in Browser

Navigate to: **http://localhost:5173**

You should see the VocaloCart homepage! 🎉

---

## 🔧 Understanding the Tech Stack

### Core Technologies:

#### **1. Vite (Build Tool)**
- **Version:** 7.1.7
- **What it does:** Ultra-fast build tool and dev server
- **Why we use it:** Instant HMR (Hot Module Replacement), faster than Create React App
- **Config file:** `vite.config.ts`

**Key Vite Features Used:**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],        // React support with Fast Refresh
  server: {
    port: 5173,              // Dev server port
    proxy: {                 // API proxy to avoid CORS issues
      '/api': 'http://localhost:8081',
      '/auth': 'http://localhost:8081'
    }
  }
})
```

#### **2. React 19 + TypeScript**
- **React Version:** 19.1.1 (Latest)
- **TypeScript Version:** 5.9.3
- **Why TypeScript:** Type safety, better IDE support, fewer runtime errors

**TypeScript Config:**
- `tsconfig.json` - Base config
- `tsconfig.app.json` - App-specific config
- `tsconfig.node.json` - Node/Vite config

#### **3. Styled Components 6.1.19**
- **What it is:** CSS-in-JS library for component-level styling
- **Why we use it:** Scoped styles, dynamic theming, TypeScript support

**Example Usage:**
```typescript
import styled from 'styled-components';

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;
```

**Where we use it:**
- All component styling
- Theme provider for dark/light mode
- Global styles (`GlobalStyle.ts`)
- Responsive media queries

#### **4. Framer Motion 12.23.24**
- **What it is:** Production-ready animation library for React
- **Why we use it:** Smooth page transitions, hover effects, toast animations

**Example Usage:**
```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}    // Start state
  animate={{ opacity: 1, y: 0 }}      // End state
  transition={{ duration: 0.5 }}      // Animation timing
>
  Content here
</motion.div>
```

**Where we use it:**
- Page transitions (`PageTransition.tsx`)
- Toast notifications (`ToastProvider.tsx`)
- Form animations (`ContactPage.tsx`)
- Button hover effects
- Card entrance animations

#### **5. React Icons 5.5.0**
- **What it is:** Popular icon library with 10,000+ icons
- **Icon Sets Used:** Font Awesome (fa, fa6)

**Icons We Use:**
```typescript
import { FaYoutube, FaGithub, FaHeart } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

// Usage
<FaHeart size={20} color="#e53e3e" />
<FaGithub size={24} />
```

**Where we use it:**
- Footer social media icons (YouTube, X/Twitter, GitHub)
- Heart icon for wishlist
- Cart icons
- User profile icons
- Navigation icons

#### **6. React Router Dom 7.9.5**
- **What it is:** Client-side routing for React SPAs
- **Why we use it:** Multi-page navigation without full page reloads

**Routes Defined:**
```typescript
// router/index.tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/cart" element={<CartPage />} />
  <Route path="/wishlist" element={<WishlistPage />} />
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/orders" element={<OrdersPage />} />
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="/admin" element={<AdminOrdersPage />} />
  <Route path="/contact" element={<ContactPage />} />
</Routes>
```

#### **7. Axios 1.13.1**
- **What it is:** Promise-based HTTP client for API calls
- **Why we use it:** Better error handling than fetch, request/response interceptors

**Example Usage:**
```typescript
import axios from 'axios';

// GET request
const response = await axios.get('/api/products');

// POST request with auth token
const response = await axios.post('/api/cart', data, {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Where we use it:**
- All API calls to backend
- Authentication requests
- Product fetching
- Cart operations
- Order management

---

## 📦 Dependency Breakdown

### Production Dependencies (Required for Running)

| Package | Version | Purpose | Used In |
|---------|---------|---------|---------|
| **axios** | 1.13.1 | HTTP client for API calls | All pages making backend requests |
| **framer-motion** | 12.23.24 | Animation library | PageTransition, ToastProvider, ContactPage |
| **react** | 19.1.1 | Core React library | Entire application |
| **react-dom** | 19.1.1 | React DOM rendering | Entry point (main.tsx) |
| **react-icons** | 5.5.0 | Icon library | Footer (social icons), Wishlist (heart) |
| **react-router-dom** | 7.9.5 | Client-side routing | Navigation between pages |
| **styled-components** | 6.1.19 | CSS-in-JS styling | All component styling |

### Development Dependencies (Only for Development)

| Package | Version | Purpose | Used When |
|---------|---------|---------|-----------|
| **@vitejs/plugin-react** | 5.0.4 | Vite React plugin | Build time |
| **vite** | 7.1.7 | Build tool & dev server | `npm run dev`, `npm run build` |
| **typescript** | 5.9.3 | TypeScript compiler | Build time |
| **eslint** | 9.36.0 | Code linting | `npm run lint` |
| **@types/react** | 19.1.16 | React type definitions | TypeScript development |
| **@types/react-dom** | 19.1.9 | React DOM types | TypeScript development |
| **@types/node** | 24.6.0 | Node.js types | TypeScript development |

---

## 🧪 Testing the Frontend

### 1️⃣ **Verify Vite Dev Server**

```bash
npm run dev
```

**Should see:**
- Dev server running on `http://localhost:5173`
- No compilation errors
- Fast refresh enabled

**Test Hot Reload:**
1. Open `src/App.tsx`
2. Change some text
3. Save file
4. Browser updates instantly without refresh ✨

---

### 2️⃣ **Test Styled Components**

**Check if styles are applied:**
1. Open browser DevTools (F12)
2. Inspect any element
3. Look for class names like: `sc-iBYQkv`, `sc-fnGiBr`
4. These are Styled Components' generated classes ✅

**Test Theme Context:**
1. Click the theme toggle (🌙/☀️ icon in nav)
2. Background should change from light to dark
3. Check console - no errors
4. Theme persists on page refresh

**Theme Implementation:**
```typescript
// context/ThemeContext.tsx
import { ThemeProvider } from 'styled-components';

const lightTheme = {
  background: '#ffffff',
  text: '#1a202c',
  // ... more colors
};

const darkTheme = {
  background: '#1a202c',
  text: '#f7fafc',
  // ... more colors
};
```

---

### 3️⃣ **Test Framer Motion Animations**

#### **Test Page Transitions:**
1. Navigate between pages (Home → Cart → Profile)
2. Watch for smooth fade-in/fade-up animations
3. Each page should animate in with `opacity: 0 → 1` and `y: 20 → 0`

#### **Test Toast Notifications:**
1. Add item to cart
2. Success toast should slide in from top
3. Auto-dismiss after 3 seconds
4. Multiple toasts should stack

**Animation Code:**
```typescript
// components/ToastProvider.tsx
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.3 }}
>
  {toast.message}
</motion.div>
```

#### **Test Contact Form Animations:**
1. Go to `/contact` page
2. Each form field should fade in sequentially
3. Hover effects on submit button

---

### 4️⃣ **Test React Icons**

#### **Footer Social Icons:**
1. Scroll to bottom of page
2. See icons: YouTube, X (Twitter), GitHub, Heart
3. Icons should be sharp (vector graphics)
4. Hover effects should work

**Implementation:**
```typescript
// components/Footer.tsx
import { FaYoutube, FaGithub, FaHeart } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

<FaYoutube size={24} />      // YouTube icon
<FaXTwitter size={24} />     // X/Twitter icon
<FaGithub size={24} />       // GitHub icon
<FaHeart size={16} />        // Heart icon
```

#### **Wishlist Heart Icon:**
1. Go to product detail page
2. Click heart icon (top right of image)
3. Icon should fill with color
4. Animation should be smooth

---

### 5️⃣ **Test React Router Navigation**

#### **Test All Routes:**

```bash
# Manual testing checklist:
✅ / (Homepage)
✅ /login (Login page)
✅ /register (Register page)
✅ /cart (Cart page)
✅ /wishlist (Wishlist page)
✅ /checkout (Checkout page - must be logged in)
✅ /orders (Order history - must be logged in)
✅ /profile (User profile - must be logged in)
✅ /admin (Admin panel - must be admin)
✅ /contact (Contact form)
```

#### **Test Navigation Methods:**
1. **Navbar links** - Click all links in header
2. **Footer links** - Click footer navigation
3. **Button navigation** - "View Cart" button, "Checkout" button
4. **Browser back/forward** - Should work correctly
5. **Direct URL** - Type `/contact` in address bar

#### **Test Protected Routes:**
1. Try accessing `/checkout` without login
2. Should redirect to `/login`
3. After login, should redirect back to original page

---

### 6️⃣ **Test Axios API Integration**

#### **Test Backend Connection:**

```bash
# Make sure backend is running first!
cd vocaloidshop
./mvnw spring-boot:run
```

Then in frontend:
1. **Homepage** - Products should load
2. **Login** - Should authenticate successfully
3. **Cart** - Should save/load cart items
4. **Orders** - Should fetch order history

#### **Check Network Tab:**
1. Open DevTools → Network tab
2. Filter by `Fetch/XHR`
3. Navigate to homepage
4. Should see requests like:
   - `GET http://localhost:8081/api/products`
   - Status: `200 OK`
   - Response: JSON data

#### **Test API Errors:**
1. Stop backend server
2. Try adding item to cart
3. Should see error toast notification
4. Console should show axios error (not crash)

---

### 7️⃣ **Test TypeScript Compilation**

```bash
# Build TypeScript to check for type errors
npm run build
```

**Should see:**
```
vite v7.1.7 building for production...
✓ 234 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-abc123.css     12.34 kB │ gzip:  3.45 kB
dist/assets/index-def456.js     156.78 kB │ gzip: 52.34 kB
✓ built in 3.45s
```

**If there are TypeScript errors:**
- Fix them in the source code
- TypeScript provides type safety
- Prevents runtime errors

---

### 8️⃣ **Test Responsive Design**

#### **Test Breakpoints:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test these screen sizes:
   - **Mobile:** 375px (iPhone)
   - **Tablet:** 768px (iPad)
   - **Desktop:** 1440px (laptop)

#### **Check Responsive Features:**
- Navigation bar collapses on mobile
- Product grid adjusts columns (4 → 2 → 1)
- Footer stacks vertically on mobile
- Forms scale appropriately
- Images resize properly

---

### 9️⃣ **Test Build for Production**

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

**Preview server:**
```
  ➜  Local:   http://localhost:4173/
  ➜  Network: use --host to expose
```

**Production build features:**
- Code minification
- Tree shaking (remove unused code)
- CSS optimization
- Asset hashing (cache busting)
- Smaller bundle sizes

**Check dist/ folder:**
```
dist/
├── index.html          # Entry point
├── assets/
│   ├── index-[hash].js   # Minified JavaScript
│   └── index-[hash].css  # Minified CSS
└── favicon.ico
```

---

## 🎨 Component-Specific Testing

### **Test GlobalStyle.ts**

**Global styles applied:**
1. Box-sizing: border-box (all elements)
2. Font family: 'Segoe UI', system fonts
3. Smooth scrolling enabled
4. No default margins/paddings

```typescript
// styles/GlobalStyle.ts
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: ${props => props.theme.background};
    color: ${props => props.theme.text};
  }
`;
```

**How to verify:**
1. Inspect `<body>` element
2. Check computed styles
3. Font should be Segoe UI
4. Background/text colors should match theme

---

### **Test PageTransition.tsx**

**Page transition wrapper:**
```typescript
// components/PageTransition.tsx
import { motion } from 'framer-motion';

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
};

export const PageTransition = ({ children }) => (
  <motion.div
    variants={variants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
);
```

**Test it:**
1. Navigate between pages
2. Watch for smooth fade + vertical movement
3. Duration: 0.5 seconds
4. No jarring transitions

---

### **Test ToastProvider.tsx**

**Toast notification system:**
1. Add item to cart → Success toast (green)
2. Try invalid login → Error toast (red)
3. Multiple toasts stack vertically
4. Auto-dismiss after 3 seconds
5. Can manually dismiss with X button

**Toast animations:**
```typescript
initial={{ opacity: 0, y: -10 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -10 }}
```

---

## 🐛 Troubleshooting

### **Issue: npm install fails**

**Error:** `ERESOLVE unable to resolve dependency tree`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

### **Issue: Port 5173 already in use**

**Error:** `Port 5173 is already in use`

**Solution 1:** Kill existing process
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9
```

**Solution 2:** Use different port
```bash
npm run dev -- --port 3000
```

---

### **Issue: Styled Components not working**

**Symptoms:**
- No styles applied
- Plain HTML elements

**Check:**
1. `styled-components` installed: `npm list styled-components`
2. Import statement correct: `import styled from 'styled-components'`
3. ThemeProvider wrapping app
4. No CSS conflicts

---

### **Issue: Framer Motion animations not working**

**Symptoms:**
- No page transitions
- Instant appearance (no fade-in)

**Check:**
1. `framer-motion` installed: `npm list framer-motion`
2. Import statement: `import { motion } from 'framer-motion'`
3. Using `motion.div` not regular `div`
4. `initial`, `animate`, `exit` props set

---

### **Issue: Icons not showing**

**Symptoms:**
- Missing icons
- Broken icon placeholders

**Check:**
1. `react-icons` installed: `npm list react-icons`
2. Correct import path: `from 'react-icons/fa'` (not `from 'react-icons'`)
3. Icon name exists in library
4. Size prop provided

---

### **Issue: API calls failing (CORS errors)**

**Error:** `Access to XMLHttpRequest blocked by CORS`

**Solution:** Check Vite proxy config
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:8081',
    '/auth': 'http://localhost:8081'
  }
}
```

**Verify backend is running:**
```bash
curl http://localhost:8081/api/products
```

---

### **Issue: TypeScript errors in VS Code**

**Symptoms:**
- Red squiggly lines
- Type errors

**Solutions:**
```bash
# Reload VS Code window
Ctrl+Shift+P → "Reload Window"

# Restart TypeScript server
Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Check tsconfig.json is valid
npx tsc --noEmit
```

---

### **Issue: Hot reload not working**

**Symptoms:**
- Changes not reflecting
- Must refresh manually

**Solutions:**
1. Check Vite dev server is running
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Clear browser cache (Ctrl+Shift+R)
4. Check file watching limits (Linux):
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

### **Issue: Build fails**

**Error:** `Build failed with 1 error`

**Check:**
1. TypeScript compilation errors: `npx tsc`
2. ESLint errors: `npm run lint`
3. Import paths correct (case-sensitive on Linux)
4. All dependencies installed

---

## 📚 NPM Scripts Reference

```json
{
  "scripts": {
    "dev": "vite",                    // Start dev server
    "build": "tsc -b && vite build",  // Build for production
    "lint": "eslint .",               // Run ESLint
    "preview": "vite preview"         // Preview production build
  }
}
```

### Script Usage:

```bash
# Development
npm run dev         # Start dev server (http://localhost:5173)

# Production Build
npm run build       # Create optimized build in dist/
npm run preview     # Preview production build

# Code Quality
npm run lint        # Check for linting errors
npm run lint -- --fix  # Auto-fix linting issues
```

---

## 🎯 Complete Testing Checklist

### Installation & Setup:
- [ ] Node.js 18+ installed
- [ ] npm install completed successfully
- [ ] No dependency warnings
- [ ] Dev server starts without errors

### Core Libraries:
- [ ] Vite dev server running on port 5173
- [ ] React components rendering
- [ ] TypeScript compilation successful
- [ ] Styled Components styles applied
- [ ] Framer Motion animations working
- [ ] React Icons displaying correctly
- [ ] React Router navigation working
- [ ] Axios API calls successful

### Features:
- [ ] Theme toggle (dark/light) working
- [ ] Toast notifications appearing
- [ ] Page transitions smooth
- [ ] Forms validating input
- [ ] Images loading (if available)
- [ ] Cart functionality working
- [ ] User authentication working

### Responsive Design:
- [ ] Mobile view (375px) looks good
- [ ] Tablet view (768px) looks good
- [ ] Desktop view (1440px) looks good
- [ ] Navigation responsive
- [ ] Product grid responsive

### Production Build:
- [ ] `npm run build` successful
- [ ] Bundle sizes reasonable
- [ ] Preview server works
- [ ] No console errors in production

---

## 🚀 Next Steps After Testing

### 1. **Start Developing**
- Make changes to components
- Test with hot reload
- Build new features

### 2. **Learn the Codebase**
- Explore `/src/components`
- Read `/src/pages` files
- Understand routing in `/src/router`

### 3. **Customize**
- Change theme colors in `ThemeContext.tsx`
- Modify animations in components
- Add new icons from `react-icons`

### 4. **Deploy**
- Build production bundle: `npm run build`
- Deploy `dist/` folder to hosting (Netlify, Vercel, etc.)
- See `/docs/deployment/` for AWS deployment

---

## 💡 Pro Tips

### **Fast Workflow:**
1. Keep terminal open with `npm run dev` running
2. Use VS Code split view (code + browser)
3. Install React Developer Tools extension
4. Use browser DevTools for debugging

### **Debugging:**
- Check browser console for errors (F12)
- Use Network tab to inspect API calls
- Use React DevTools to inspect component state
- Use `console.log()` liberally while developing

### **Performance:**
- Vite dev server is extremely fast (<100ms reload)
- First load may take 1-2 seconds
- Subsequent reloads are instant
- Build time ~3-5 seconds

---

## 📖 Additional Resources

### **Official Documentation:**
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Styled Components](https://styled-components.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [React Icons](https://react-icons.github.io/react-icons/)
- [React Router](https://reactrouter.com/)

### **Project Documentation:**
- Backend Setup: `/docs/guides/02_BACKEND_SETUP.md`
- API Documentation: `/docs/reference/05_API_DOCUMENTATION.md`
- Database Schema: `/docs/reference/10_DATABASE_SCHEMA.md`

---

## ✅ Success!

If you've completed this guide, you should now have:
- ✅ All dependencies installed
- ✅ Dev server running
- ✅ Understanding of tech stack
- ✅ Tested all major features
- ✅ Troubleshooting knowledge

**Happy coding! 🎉**

---

*Last updated: November 6, 2025*
