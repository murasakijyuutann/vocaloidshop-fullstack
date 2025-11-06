# 🚀 Quick Tryout Guide - VocaloCart

**Want to see the app in action? Follow this 5-minute guide!**

This guide is for anyone who wants to explore the application features without setting up the development environment.

---

## 🌐 Option 1: Live Demo (Fastest)

### Access the Deployed Application

**Frontend:** http://3.38.164.27:5173  
**Backend API:** http://3.38.164.27:8081

> ⚠️ **Note:** This is a demo instance. Data may be reset periodically.

### Ready to Explore!

Jump to [Exploration Guide](#-exploration-guide) below 👇

---

## 💻 Option 2: Local Setup (10 minutes)

If the live demo is down or you want to run locally:

### Prerequisites
- Node.js 18+ installed
- Java 21 installed
- MySQL 8.0 running

### Quick Start Commands

```bash
# 1. Clone the repository
git clone <repository-url>
cd v_shop

# 2. Setup Database (MySQL)
mysql -u root -p
CREATE DATABASE vocalocart;
exit

# 3. Start Backend (Terminal 1)
cd vocaloidshop
./mvnw spring-boot:run
# Wait for "Started VocaloidshopApplication" message

# 4. Start Frontend (Terminal 2)
cd vocaloid_front
npm install
npm run dev
```

**Access:** http://localhost:5173

---

## 🎯 Exploration Guide

### 1️⃣ **Browse Products (No Login Required)**

#### What to Try:
- 🏠 **Homepage** - View product catalog
  - Search for products (try "Miku")
  - Filter by category dropdown
  - Sort by price (Low to High / High to Low)
  - Click on any product card

- 📦 **Product Detail Page**
  - View product images
  - Read descriptions
  - See pricing and stock
  - Try quantity selector (+/-)

**Estimated time:** 2 minutes

---

### 2️⃣ **Create an Account**

#### Steps:
1. Click **"Register"** in the top navigation
2. Fill in the form:
   ```
   Email:    demo@example.com
   Password: Demo123!
   Name:     Demo User
   ```
3. Click **"Sign Up"**
4. You'll be auto-logged in ✅

**What happens:**
- You receive a JWT token (24-hour validity)
- Cart badge appears in navigation
- "My Page" link becomes available

**Estimated time:** 1 minute

---

### 3️⃣ **Shopping Experience**

#### Add to Cart:
1. Browse products on homepage
2. Click a product → Product detail page
3. Adjust quantity with **+/-** buttons
4. Click **"Add to Cart"** button
5. Watch for success toast notification 🎉
6. Notice cart badge count increases

#### Manage Cart:
1. Click **🛒 Cart (2)** in navigation
2. Try these actions:
   - **Increase/Decrease** quantity with +/- buttons
   - **Remove individual items** with trash icon
   - **Clear entire cart** with "Clear Cart" button
   - Watch **total price update** in real-time

#### View Cart Summary:
- Right sidebar shows:
  - Subtotal
  - Item count
  - "Proceed to Checkout" button

**Estimated time:** 3 minutes

---

### 4️⃣ **Wishlist Feature**

#### Save Products:
1. Go to any product detail page
2. Click the **❤️ heart icon** (top right of image)
3. Icon fills with color = Added to wishlist ✅
4. Toast notification confirms

#### View Wishlist:
1. Click **"Wishlist"** in navigation
2. See all saved products
3. Click **"View Details"** to go back to product
4. Click **❌** to remove from wishlist
5. Click **"Add to Cart"** to purchase

**Use case:** Save items for later!

**Estimated time:** 2 minutes

---

### 5️⃣ **Checkout & Orders**

#### Add Shipping Address:
1. Click **"Addresses"** in navigation
2. Click **"+ Add New Address"**
3. Fill in address form:
   ```
   Recipient:   Your Name
   Address 1:   123 Main Street
   City:        Seoul
   Postal Code: 12345
   Country:     South Korea
   Phone:       010-1234-5678
   ```
4. Check **"Set as default"**
5. Click **"Save Address"**

#### Complete Checkout:
1. Go to **Cart** page
2. Click **"Proceed to Checkout"**
3. See **Progress Bar**: Shipping → Review → Payment → Complete
4. **Step 1:** Select/confirm your address
5. **Step 2:** Review order summary
6. Click **"Place Order"**
7. See order confirmation with order number 🎉

#### View Order History:
1. Click **"Orders"** in navigation
2. See your order with status: **"Payment Received"**
3. Click order card to expand details:
   - Order items
   - Shipping address
   - Total amount
   - Order date

**Real-world simulation:**
- Stock quantity decreases
- Cart clears after checkout
- Order status can be updated by admin

**Estimated time:** 4 minutes

---

### 6️⃣ **User Profile**

#### Update Profile:
1. Click **"My Page"** in navigation
2. View your profile information
3. Try updating:
   - Name
   - Phone number
   - Address (legacy field)
4. Click **"Update Profile"**
5. See success message

**Note:** Email cannot be changed (used for login)

**Estimated time:** 1 minute

---

### 7️⃣ **Contact Form**

#### Send a Message:
1. Click **"Contact"** in footer or navigation
2. Fill out the form:
   ```
   Name:    Your Name
   Email:   your@email.com
   Subject: Product Question
   Message: Hello, I have a question about...
   ```
3. Click **"Send Message"**
4. Success notification appears
5. Email sent to shop admin ✉️

**Use case:** Customer support inquiries

**Estimated time:** 1 minute

---

### 8️⃣ **Admin Panel** (Admin Only)

#### Become Admin:
To test admin features, you need to manually promote your user in the database:

```sql
-- In MySQL
UPDATE user SET is_admin = 1 WHERE email = 'demo@example.com';
```

Then **logout and login again**.

#### Admin Features:
1. **"Admin"** link appears in navigation
2. Click to access admin panel
3. View all orders across all users
4. Update order status:
   - Payment Received
   - Processing
   - Preparing
   - Ready for Delivery
   - In Delivery
   - Delivered
   - Canceled
5. Filter orders by status
6. See customer details per order

**Use case:** Shop owner managing orders

**Estimated time:** 3 minutes

---

### 9️⃣ **Dark Mode Toggle**

#### Try Theme Switching:
1. Look for **🌙 Moon icon** in navigation (or ☀️ Sun)
2. Click to toggle dark/light mode
3. Notice entire app theme changes
4. Preference saved in browser (persists on refresh)

**Color schemes:**
- **Light Mode:** White backgrounds, dark text
- **Dark Mode:** Dark backgrounds, light text, purple accents

**Estimated time:** 30 seconds

---

### 🔟 **Responsive Design Test**

#### Mobile Simulation:
1. Open browser DevTools (F12)
2. Click **device toolbar** icon (phone/tablet)
3. Select devices to test:
   - iPhone 12/13/14
   - iPad
   - Samsung Galaxy
4. Navigate through the app
5. Notice responsive layouts:
   - Navigation collapses to hamburger menu
   - Product grid adjusts columns
   - Cart sidebar stacks below
   - Touch-friendly buttons

**Estimated time:** 2 minutes

---

## 🎨 UI/UX Features to Notice

### 🌈 Visual Polish
- ✨ **Smooth animations** - Page transitions, button hover effects
- 🎨 **Gradient headers** - Purple gradient navigation bar
- 💳 **Product cards** - Hover effects with shadow lift
- 📱 **Responsive grid** - Auto-adjusts to screen size
- 🎯 **Loading states** - Spinners during API calls (may be fast!)

### 🔔 User Feedback
- 🎉 **Toast notifications** - Green (success), Red (error)
- 🔢 **Cart badge** - Real-time item count with pulse animation
- ❤️ **Wishlist indicator** - Filled/unfilled heart icons
- 📊 **Progress bar** - Visual checkout steps
- ⚠️ **Validation messages** - Form error hints

### 🎭 Micro-interactions
- Hover effects on buttons and cards
- Quantity selector animations
- Page fade-in transitions
- Cart badge pulse effect
- Theme toggle animation

---

## 🧪 Test Scenarios

### Scenario 1: Complete Shopping Journey
```
1. Browse products → 2. Add 3 items to cart → 3. Update quantities
→ 4. Add shipping address → 5. Complete checkout → 6. View order history
```
**Time:** ~8 minutes

### Scenario 2: Wishlist & Compare
```
1. Add 5 products to wishlist → 2. View wishlist page
→ 3. Compare details → 4. Move 2 to cart → 5. Checkout
```
**Time:** ~6 minutes

### Scenario 3: Admin Workflow
```
1. Promote to admin → 2. Login → 3. View all orders
→ 4. Update order statuses → 5. Filter by status
```
**Time:** ~5 minutes

### Scenario 4: Mobile Experience
```
1. Switch to mobile view → 2. Browse products → 3. Add to cart
→ 4. Complete checkout → 5. Test all features
```
**Time:** ~10 minutes

---

## 🎯 Key Features Checklist

Try to complete this checklist as you explore:

### Authentication
- [ ] Register new account
- [ ] Login with credentials
- [ ] View profile in "My Page"
- [ ] Update profile information
- [ ] Logout and login again

### Shopping
- [ ] Browse product catalog
- [ ] Search for products
- [ ] Filter by category
- [ ] Sort by price
- [ ] View product details
- [ ] Add items to cart
- [ ] Modify cart quantities
- [ ] Remove items from cart

### Wishlist
- [ ] Add products to wishlist
- [ ] View wishlist page
- [ ] Remove from wishlist
- [ ] Move wishlist items to cart

### Checkout
- [ ] Add shipping address
- [ ] Set default address
- [ ] Complete order
- [ ] View order confirmation
- [ ] Check order history

### Admin (if promoted)
- [ ] Access admin panel
- [ ] View all orders
- [ ] Update order status
- [ ] Filter orders

### UI/UX
- [ ] Toggle dark/light mode
- [ ] Test responsive design
- [ ] Notice animations
- [ ] See toast notifications
- [ ] Try contact form

---

## 🐛 What to Look For

### ✅ Things That Should Work:
- All buttons should be clickable
- Forms should validate input
- Cart should update in real-time
- Images should load (if URLs are valid)
- Toast messages should appear briefly
- Navigation should work smoothly
- Logout should clear user data

### 🔍 Known Limitations (Demo):
- No actual payment processing (simulated)
- Email notifications may not work (depends on SMTP config)
- Product images might be placeholder URLs
- Stock doesn't actually decrement inventory
- No real order fulfillment

---

## 💡 Pro Tips

### For Best Experience:
1. **Use Chrome or Firefox** for best compatibility
2. **Enable JavaScript** (required)
3. **Allow browser storage** (for JWT token)
4. **Test on multiple devices** to see responsive design
5. **Clear cart between tests** to reset

### Keyboard Shortcuts:
- **Tab** - Navigate form fields
- **Enter** - Submit forms
- **Esc** - Close modals (future feature)

### Performance:
- First page load may be slower (cold start)
- Subsequent navigation is instant (SPA)
- API calls typically < 200ms on local network

---

## 📊 Expected Behavior

### Data Persistence:
- ✅ **User accounts** - Saved in database
- ✅ **Cart items** - Saved per user
- ✅ **Orders** - Permanent records
- ✅ **Addresses** - Saved per user
- ✅ **Wishlist** - Saved per user
- ⚠️ **Theme preference** - Browser local storage (cleared on logout)

### Session Management:
- JWT token valid for **24 hours**
- Auto-logout after token expiration
- Token stored in browser localStorage
- Refresh page = stay logged in (if token valid)

---

## 🆘 Troubleshooting

### Can't Login?
- Check email format (must contain @)
- Password must be entered correctly
- Clear browser cache and try again
- Check browser console for errors (F12)

### Cart Not Updating?
- Ensure you're logged in
- Check network tab for API errors
- Refresh page and try again

### 404 Errors?
- Backend server must be running
- Check backend URL in browser console
- Verify MySQL database is running

### Images Not Loading?
- This is normal for demo data
- Product image URLs may be placeholders
- Real deployment would use CDN/storage

---

## 🎉 That's It!

You've completed the quick tryout guide. You should now have a good feel for:

- ✅ E-commerce shopping flow
- ✅ User account management
- ✅ Cart and wishlist features
- ✅ Checkout process
- ✅ Order tracking
- ✅ Admin capabilities
- ✅ Modern UI/UX design

---

## 📚 Next Steps

### Want to Learn More?

1. **Read the Code:**
   - Frontend: `vocaloid_front/src/`
   - Backend: `vocaloidshop/src/main/java/`

2. **Review Documentation:**
   - Setup Guides: `/docs/guides/`
   - API Docs: `/docs/reference/05_API_DOCUMENTATION.md`
   - Database Schema: `/docs/reference/10_DATABASE_SCHEMA.md`

3. **Customize & Extend:**
   - Add new product categories
   - Implement payment gateway
   - Add product reviews
   - Create discount codes
   - Build analytics dashboard

---

## 💬 Feedback

Did this guide help? Found any issues?

- 📧 Email: support@vocalocart.com
- 🐛 Report bugs: GitHub Issues
- ⭐ Star the repo if you like it!

---

**Happy exploring! 🚀**

*Last updated: November 6, 2025*
