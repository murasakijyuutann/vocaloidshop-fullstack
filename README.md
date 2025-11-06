# 🛍️ VocaloCart

**Modern Full-Stack E-Commerce Platform**

A production-ready e-commerce application built with React + Vite (frontend) and Spring Boot (backend). Features include JWT authentication, admin order management, shopping cart, wishlist, address management, dark mode theming, and automated email notifications.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Java](https://img.shields.io/badge/Java-21-orange)]()
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-green)]()
[![React](https://img.shields.io/badge/React-18-blue)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture--design)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-overview-selected)
- [Admin Access](#admin-access)
- [Database Migrations](#database-migrations-flyway)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Lightning-fast build tool
- **styled-components v6** - CSS-in-JS with theming (light/dark modes)
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Framer Motion** - Smooth animations and toasts

### Backend
- **Spring Boot 3.5.6** (Java 21)
- **Spring Security** - JWT-based authentication
- **Spring Data JPA** with Hibernate
- **MySQL 8.0** - Relational database
- **Spring Mail** - Email integration (SendGrid/SMTP)
- **Flyway** - Database migration management
- **Lombok** - Boilerplate reduction
- **SpringDoc OpenAPI** - API documentation

### DevOps & Tools
- **Maven** - Dependency management
- **Docker** - Containerization (optional)
- **Git** - Version control

## 🏗️ Architecture & Design

### System Architecture
```
┌─────────────────┐      HTTP/REST      ┌──────────────────┐      JDBC       ┌─────────┐
│  React Frontend │ ─────────────────▶│  Spring Boot API │ ────────────▶ │  MySQL  │
│   (Vite Dev)    │    (Proxy :8081)    │     (:8081)      │                 │ (:3306) │
└─────────────────┘                     └──────────────────┘                 └─────────┘
         │                                       │
         │                                       │
         ▼                                       ▼
  styled-components                      Spring Mail
   (Theme Context)                      (SMTP/SendGrid)
```

### Design Principles

#### **Authentication & Security**
- **JWT Tokens**: Issued on login/register, stored in `localStorage`
- **Automatic Headers**: Axios interceptors inject `Authorization: Bearer <token>`
- **Role-Based Access**: `ROLE_ADMIN` flag controls admin features
- **Secure Endpoints**: Spring Security protects all non-public routes

#### **Order Management**
- **Status Workflow**: 
  - Forward progression: `PAYMENT_RECEIVED` → `PROCESSING` → `PREPARING` → `READY_FOR_DELIVERY` → `IN_DELIVERY` → `DELIVERED`
  - Can be `CANCELED` at any stage
- **Stock Management**: Automatic inventory decrement on order placement
- **Transaction Safety**: All order operations wrapped in `@Transactional`

#### **Address Management**
- Full CRUD operations for shipping/billing addresses
- Default address selection with auto-unset of previous defaults
- Checkout auto-preselects default address

#### **User Experience**
- **Wishlist**: Quick-add products with navigation to detail pages
- **Theming**: Persistent light/dark mode via Context API and localStorage
- **Notifications**: Toast messages for user actions (success/error)
- **Contact Form**: Direct email integration for customer inquiries

## ✨ Features

### 👤 User Management
- ✅ User registration with email validation
- ✅ JWT-based authentication (24-hour token expiration)
- ✅ My Page profile editing (nickname, birthday restrictions)
- ✅ Persistent login across sessions

### 🛒 Shopping Experience
- ✅ Product catalog with categories
- ✅ Detailed product pages with images
- ✅ Shopping cart (add, update quantity, remove items)
- ✅ Cart subtotal and total calculations
- ✅ One-click checkout with address selection
- ✅ Wishlist functionality with product quick access

### 📦 Order Management
- ✅ Complete order placement workflow
- ✅ Order history with status tracking
- ✅ Real-time stock validation
- ✅ Automatic cart clearing post-checkout
- ✅ Order status updates (7-stage workflow)

### 📍 Address Management
- ✅ Multiple shipping/billing addresses
- ✅ Set default address
- ✅ Full CRUD operations
- ✅ Auto-selection at checkout

### 🔐 Admin Panel
- ✅ View all orders across users
- ✅ Update order status
- ✅ Product and category management
- ✅ Role-based access control

### 🎨 UI/UX
- ✅ Dark mode with persistent preference
- ✅ Responsive design (mobile-friendly)
- ✅ Toast notifications for user feedback
- ✅ Smooth animations with Framer Motion
- ✅ Loading states and error handling

### 📧 Communication
- ✅ Contact form with email integration
- ✅ SendGrid/SMTP support
- ✅ Automated confirmation emails

## Project structure

```
v_shop/
├─ vocaloid_front/                # React + Vite frontend
│  ├─ src/
│  │  ├─ api/axiosConfig.ts
│  │  ├─ components/
│  │  ├─ context/ (Auth, Cart, Theme, Toast)
│  │  ├─ hooks/
│  │  ├─ pages/ (Home, ProductDetail, Cart, Checkout, Orders, Wishlist, Addresses, Admin, Contact, Login, Register, MyPage)
│  │  └─ styles/ (GlobalStyle, theme)
│  ├─ vite.config.ts              # Proxy to backend (default 8081)
│  └─ package.json
└─ vocaloidshop/                  # Spring Boot backend
	 ├─ src/main/java/mjyuu/vocaloidshop/
	 │  ├─ controller/ (Auth, Product, Category, Cart, Order, Address, Contact)
	 │  ├─ entity/ (User, Product, Order, OrderItem, CartItem, Address, ...)
	 │  ├─ repository/ (JPA Repos)
	 │  ├─ service/
	 │  ├─ security/ (JwtAuthFilter)
	 │  └─ util/ (JwtUtil, OrderStatusConverter)
	 └─ src/main/resources/application.yml
```

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** 18+ and npm ([Download](https://nodejs.org/))
- **Java JDK** 21 ([Download](https://www.oracle.com/java/technologies/downloads/))
- **MySQL** 8.0+ ([Download](https://dev.mysql.com/downloads/))
- **Maven** (included as wrapper `./mvnw`)

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd v_shop
```

#### 2️⃣ Set Up MySQL Database

Before running the application, you **must create a MySQL database**.

**Step 1: Create Database**

Connect to your MySQL server and create a new database:

```sql
-- Option 1: Using MySQL command line
mysql -u root -p

-- Then run:
CREATE DATABASE vocalocart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant permissions (if using a specific user)
CREATE USER 'vocalocart_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON vocalocart.* TO 'vocalocart_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify database was created
SHOW DATABASES;
```

**Step 2: Verify Connection**

Test your database connection:
```bash
mysql -u vocalocart_user -p vocalocart
# Enter your password when prompted
# If successful, you'll see: mysql>
```

> 💡 **Note**: 
> - The database name `vocalocart` can be changed, but update the JDBC URL accordingly
> - Spring Boot will automatically create tables on first run (via Hibernate `ddl-auto: update`)
> - No need to manually create tables - JPA handles schema generation

**Alternative: Using MySQL Workbench or phpMyAdmin**
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Right-click "Schemas" → "Create Schema"
4. Name: `vocalocart`
5. Character Set: `utf8mb4`
6. Collation: `utf8mb4_unicode_ci`
7. Click "Apply"

#### 3️⃣ Configure Backend

**Option A: Using `application.yml` (Quick Start)**

Edit `vocaloidshop/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/vocalocart?serverTimezone=UTC
    username: vocalocart_user  # Use YOUR database username
    password: your_secure_password  # Use YOUR database password
  mail:
    host: smtp.gmail.com  # or smtp.sendgrid.net
    port: 587
    username: your_email@gmail.com
    password: your_app_password
```

> ⚠️ **Important**: Replace these with YOUR actual database credentials created in Step 2!

**Option B: Using Environment Variables (Recommended for Production)**

Set the following environment variables with YOUR database credentials:
```bash
export DB_URL=jdbc:mysql://localhost:3306/vocalocart
export DB_USERNAME=vocalocart_user  # YOUR database username
export DB_PASSWORD=your_secure_password  # YOUR database password
export MAIL_HOST=smtp.gmail.com
export MAIL_USERNAME=your_email@gmail.com
export MAIL_PASSWORD=your_app_password
```

Then activate the `env` profile when running.

> ⚠️ **Security Note**: Never commit credentials to version control. Use environment variables or `.env` files (add to `.gitignore`).

#### 3️⃣ Start the Backend

```bash
cd vocaloidshop

# Option A: Using application.yml
./mvnw spring-boot:run

# Option B: Using environment variables
SPRING_PROFILES_ACTIVE=env ./mvnw spring-boot:run
```

Backend will start on **http://localhost:8081**

#### 4️⃣ Start the Frontend

```bash
cd vocaloid_front
npm install
npm run dev
```

Frontend will start on **http://localhost:5173**

> 💡 **Note**: Vite automatically proxies API requests from `/api` and `/auth` to the backend at `localhost:8081`.

### 🎉 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8081
- **API Health Check**: http://localhost:8081/actuator/health
- **API Documentation**: http://localhost:8081/swagger-ui.html (if enabled)

### 🏗️ Building for Production

#### Frontend Build
```bash
cd vocaloid_front
npm run build
# Output: dist/ folder
```

#### Backend Build
```bash
cd vocaloidshop
./mvnw clean package -DskipTests
# Output: target/vocaloidshoppingmall-0.0.1-SNAPSHOT.jar
```

#### Run Production Backend
```bash
java -jar target/vocaloidshoppingmall-0.0.1-SNAPSHOT.jar
```

## ⚙️ Configuration

### Port Configuration

| Service | Port | Configurable Via |
|---------|------|------------------|
| Backend | 8081 | `application.yml` or `--server.port=<port>` |
| Frontend | 5173 | `vite.config.ts` → `server.port` |
| MySQL | 3306 | Standard MySQL port |

### Frontend Configuration (`vite.config.ts`)

```typescript
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8081',  // Backend API proxy
      '/auth': 'http://localhost:8081'  // Auth endpoint proxy
    }
  }
})
```

> ⚠️ If you change the backend port, update the proxy URLs accordingly.

### Backend Configuration

#### Database Configuration (`application.yml`)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/vocalocart?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:password}
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update  # Use 'validate' in production with Flyway
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQLDialect
```

#### Mail Configuration (`application.yml`)

**For Gmail:**
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password  # Generate at Google Account Security
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

**For SendGrid:**
```yaml
spring:
  mail:
    host: smtp.sendgrid.net
    port: 587
    username: apikey  # Literal string "apikey"
    password: YOUR_SENDGRID_API_KEY
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

#### Environment Variables (Recommended)

> ⚠️ **IMPORTANT**: The `.env` file is NOT included in this repository for security reasons. You MUST create your own!

Create a `.env` file in the project root directory:

```bash
# Database - USE YOUR OWN CREDENTIALS!
DB_URL=jdbc:mysql://localhost:3306/vocalocart
DB_USERNAME=vocalocart_user  # Your MySQL username
DB_PASSWORD=your_secure_password  # Your MySQL password

# Mail - USE YOUR OWN EMAIL CREDENTIALS!
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# JWT Secret (optional, defaults to hardcoded)
JWT_SECRET=your-256-bit-secret-key-here
```

Activate with `SPRING_PROFILES_ACTIVE=env`

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login and get JWT | ❌ |
| GET | `/auth/me` | Get current user info | ✅ |
| PATCH | `/auth/me` | Update user profile | ✅ |

**Example: Register**
```json
POST /auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}

Response: { "token": "eyJhbG...", "email": "user@example.com", "role": "USER" }
```

### Product & Category Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | List all products | ❌ |
| GET | `/api/products/{id}` | Get product details | ❌ |
| POST | `/api/products` | Create product (Admin) | ✅ Admin |
| PUT | `/api/products/{id}` | Update product (Admin) | ✅ Admin |
| DELETE | `/api/products/{id}` | Delete product (Admin) | ✅ Admin |
| GET | `/api/categories` | List all categories | ❌ |
| POST | `/api/categories` | Create category (Admin) | ✅ Admin |

### Shopping Cart Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cart/{userId}` | Get user's cart | ✅ |
| POST | `/api/cart/{userId}` | Add item to cart | ✅ |
| DELETE | `/api/cart/{userId}/{itemId}` | Remove item | ✅ |

### Order Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/orders/user/{userId}?addressId={id}` | Place order | ✅ |
| GET | `/api/orders/user/{userId}` | Get order history | ✅ |
| GET | `/api/orders/{orderId}` | Get order details | ✅ |
| GET | `/api/orders` | List all orders (Admin) | ✅ Admin |
| PATCH | `/api/orders/{orderId}/status?status={status}` | Update order status (Admin) | ✅ Admin |

**Order Status Values:**
- `PAYMENT_RECEIVED`
- `PROCESSING`
- `PREPARING`
- `READY_FOR_DELIVERY`
- `IN_DELIVERY`
- `DELIVERED`
- `CANCELED`

### Address Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/addresses/user/{userId}` | List user addresses | ✅ |
| POST | `/api/addresses/user/{userId}` | Create address | ✅ |
| PUT | `/api/addresses/{id}` | Update address | ✅ |
| DELETE | `/api/addresses/{id}` | Delete address | ✅ |
| PUT | `/api/addresses/{id}/default/user/{userId}` | Set default address | ✅ |

### Wishlist Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/wishlist/user/{userId}` | Get wishlist | ✅ |
| POST | `/api/wishlist/user/{userId}/product/{productId}` | Add to wishlist | ✅ |
| DELETE | `/api/wishlist/user/{userId}/product/{productId}` | Remove from wishlist | ✅ |

### Contact Endpoint

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/contact` | Submit contact form | ❌ |

**Example: Contact Form**
```json
POST /api/contact
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Product Inquiry",
  "message": "I have a question about..."
}
```

### Health & Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/actuator/health` | Application health status |
| GET | `/actuator/info` | Application information |
| GET | `/actuator/metrics` | Application metrics |

## 🔑 Admin Access

### Setting Up Admin User

1. **Promote User in Database**

   Execute this SQL query in MySQL:

   ```sql
   -- Update existing user to admin
   UPDATE user SET is_admin = 1 WHERE email = 'admin@example.com';
   
   -- Or create new admin user (after registering normally)
   UPDATE user SET is_admin = 1 WHERE email = 'your@email.com';
   ```

2. **Verify Admin Role**

   Login and check the response from `/auth/me`:
   ```json
   {
     "id": 1,
     "email": "admin@example.com",
     "isAdmin": true  // ← Should be true
   }
   ```

3. **Access Admin Panel**

   - The "Admin" link will appear in the navigation header
   - Navigate to: **http://localhost:5173/admin**
   - Available features:
     - View all orders across users
     - Update order status
     - Manage products and categories

### Admin Permissions

| Feature | Regular User | Admin |
|---------|-------------|-------|
| View own orders | ✅ | ✅ |
| Place orders | ✅ | ✅ |
| View all orders | ❌ | ✅ |
| Update order status | ❌ | ✅ |
| Create/Edit products | ❌ | ✅ |
| Create/Edit categories | ❌ | ✅ |
| Delete products | ❌ | ✅ |

## 🗄️ Database Migrations (Flyway)

### Migration Management

Flyway automatically runs migrations on application startup. Migrations are located in:
```
vocaloidshop/src/main/resources/db/migration/
```

### Existing Migrations

**V1__order_status_length_and_normalize.sql**
- Ensures `order.status` column supports longer enum names (`varchar(32)`)
- Normalizes legacy status values:
  - `PAID` → `PAYMENT_RECEIVED`
  - `SHIPPED` → `IN_DELIVERY`
  - `CANCELLED` → `CANCELED`

### Creating New Migrations

1. **Naming Convention**: `V{version}__{description}.sql`
   - Example: `V2__add_product_ratings.sql`

2. **Location**: Place files in `src/main/resources/db/migration/`

3. **Best Practices**:
   - Use sequential version numbers (V1, V2, V3...)
   - Keep migrations idempotent when possible
   - Never modify existing migration files
   - Test migrations on a copy of production data

**Example Migration:**
```sql
-- V2__add_product_ratings.sql
ALTER TABLE product ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE product ADD COLUMN review_count INT DEFAULT 0;
CREATE INDEX idx_product_rating ON product(rating DESC);
```

### Flyway Commands

```bash
# Check migration status
./mvnw flyway:info

# Validate migrations
./mvnw flyway:validate

# Repair failed migrations (use with caution)
./mvnw flyway:repair
```

## Screenshots (optional)

Place images under `docs/screenshots/` and reference them here, for example:

![Home](docs/screenshots/home.png)
![Product Detail](docs/screenshots/product.png)
![Cart](docs/screenshots/cart.png)
![Checkout](docs/screenshots/checkout.png)
![Orders](docs/screenshots/orders.png)
![Admin Orders](docs/screenshots/admin-orders.png)

## 🔧 Troubleshooting

### Common Issues

#### Backend port in use (8081)
	- Another process is on 8081. Kill it or run on a different port:
		```bash
		# Find and kill on Windows
		netstat -ano | grep 8081
		taskkill /PID <pid> /F
		# Or run on 8082
		./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=8082
		```
	- Update frontend proxy if you change the backend port.

- 401/403 on `/auth/me`
	- Accessing directly in the browser (without Authorization header) will 403. Use the app (login) so Axios sends the token.
	- If you recently promoted a user to admin, hard refresh or re-login so `/auth/me` updates the client state.

- Order status DB errors
	- Ensure the status column can store longer enum names:
		```sql
		ALTER TABLE `order` MODIFY `status` varchar(32) NOT NULL DEFAULT 'PAYMENT_RECEIVED';
		```
	- Backend includes a converter to tolerate legacy synonyms.

- Checkout issues
	- “Failed to place order”: the UI now shows specific backend messages (e.g., empty cart, stock shortage, permission on address).
	- Addresses: make sure you’re logged in; checkout loads `/api/addresses/{userId}` and preselects the default.

	### More common issues

	- Dev proxy not working (CORS errors or 404s to API)
		- Ensure the Vite dev server is running and the proxy in `vocaloid_front/vite.config.ts` points to the correct backend port.
		- Calls must start with `/api` or `/auth` to be proxied. Absolute URLs (http://localhost:8081/...) bypass the proxy.

	- SPA route 404 on browser refresh
		- In dev, Vite handles routes; in production you need the server to serve `index.html` for unknown paths.
		- For local testing, always use the Vite dev server URL (http://localhost:5173) and navigate via links.

	- Stale token or logout after page refresh
		- The token is restored from localStorage and `/auth/me` is requested. If the backend is down or the token expired (24h default), you’ll see 401 → log in again.
		- If `/admin` redirects to login on refresh, wait a moment; the page now defers redirect until `/auth/me` completes.

	- Admin endpoints returning 403
		- Verify your user row has `is_admin = 1` (or the correct admin column for your schema).
		- Confirm `/auth/me` response JSON contains `"isAdmin": true`.
		- Ensure requests include `Authorization: Bearer <token>` (check DevTools → Network).

	- Database connection issues (MySQL)
		- **"Access denied for user"**: Your database credentials are incorrect. Verify username/password in `application.yml`
		- **"Unknown database 'vocalocart'"**: You haven't created the database. Follow Step 2 in Getting Started to create it:
			```sql
			CREATE DATABASE vocalocart;
			```
		- **"Communications link failure"**: MySQL server isn't running. Start MySQL service:
			```bash
			# Windows
			net start MySQL80
			
			# macOS/Linux
			sudo service mysql start
			# or
			brew services start mysql
			```
		- **Wrong port**: Default MySQL port is 3306. If yours is different, update the JDBC URL
		- **Timezone issues**: Add `?serverTimezone=UTC` to your JDBC URL
		- Check timezone/encoding in JDBC URL: `?serverTimezone=Asia/Seoul&characterEncoding=UTF-8`.
		- Verify credentials and that the DB host is reachable from your machine.
		- If using Flyway and `ddl-auto=update`, avoid conflicts: prefer Flyway for structural changes in shared environments.

	- Mail sending failures (Contact page)
		- Double-check SMTP host/port/user/password.
		- If using SendGrid, username is typically `apikey` and password is the API key.
		- Some providers require from-address to be verified; check sender domain settings.

	- Mixed content / HTTPS issues
		- If you serve the frontend over HTTPS but backend is HTTP, browsers may block requests. Use HTTPS for both or configure a reverse proxy.

	- Images not loading / broken URLs
		- Ensure product image URLs are valid and reachable. For local files, consider hosting via the frontend `public/` folder or a CDN.

	- Vite dev port conflict (5173)
		- Change the dev port in `vite.config.ts`: `server: { port: 5174 }` and restart.

	- Build is green but type errors are missed
		- Vite’s prod build doesn’t perform a full `tsc` type-check by default. Run it manually:
			```bash
			cd vocaloid_front
			npx tsc --noEmit
			```

	### Common errors and fixes

	| Symptom / Message | Where | Probable cause | Fix |
	|---|---|---|---|
	| `Web server failed to start. Port 8081 was already in use.` | Backend start | Another process is using 8081 | Kill the process (netstat/taskkill) or run backend on another port and update Vite proxy |
	| Whitelabel 403 on `/auth/me` in browser | Hitting endpoint directly | No Authorization header | Use the app (login). Axios sends `Authorization: Bearer <token>` automatically |
	| `Data truncated for column 'status'` | Placing order | `order.status` column too short | Run the provided DDL or Flyway migration to `varchar(32)` |
	| `No enum constant ... OrderStatus` | Loading orders | Legacy/variant status values in DB | Converter + migration normalize synonyms; run backend to apply and consider V1 migration |
	| Admin page redirects to Login after refresh | Frontend | User not yet loaded while token exists | Fixed: page now waits for `/auth/me`. If still happens, re-login and ensure backend is up |
	| Checkout fails with specific message | Frontend toast | Empty cart, stock shortage, or address permission | Follow the message; add stock / ensure you select your own address; re-login if 401 |
	| CORS or 404 to API during dev | Frontend dev | Proxy not pointing to backend or using absolute URLs | Ensure `/api` & `/auth` proxy to the right port; avoid hard-coded full URLs |
	| Mail sending fails (535/550) | Contact | Wrong SMTP creds, unverified from-address | Check SMTP settings. For SendGrid, username=apikey, password=API key; verify sender |
	| Images not showing | Product detail | Invalid/broken URLs | Host images in `public/` or via a reliable CDN, ensure URLs are reachable |
	| SPA refresh 404 in production | Frontend hosting | Server not configured to fallback to index.html | Configure server to serve `index.html` for unknown routes |

	## Health check script

	A tiny environment health script is included to catch common setup issues (ports, config files, tools).

	```bash
	# From repo root
	node scripts/healthcheck.mjs
	```

	What it checks:
	- Node/npm/java presence
	- Maven wrapper presence
	- Frontend vite.config.ts and proxy target
	- Backend application.yml / application-env.yml
	- Backend port 8081 listening
	- Flyway migration directory presence

## Notes & conventions

- Contexts are split (base + provider) to play nicely with Fast Refresh.
- Theme toggle saves to localStorage and sets an HTML data attribute.
- Axios Authorization header is kept in sync with the JWT token.

## 📸 Screenshots

Place screenshots in `docs/screenshots/` directory:

| Feature | Screenshot |
|---------|-----------|
| Homepage | ![Home](docs/screenshots/home.png) |
| Product Detail | ![Product](docs/screenshots/product.png) |
| Shopping Cart | ![Cart](docs/screenshots/cart.png) |
| Checkout | ![Checkout](docs/screenshots/checkout.png) |
| Order History | ![Orders](docs/screenshots/orders.png) |
| Admin Panel | ![Admin](docs/screenshots/admin.png) |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Disclaimer**: This application is for demonstration and learning purposes. Use at your own risk in production environments.

---

## � Documentation

All project documentation is organized in the `/docs` folder:

### 📂 Documentation Structure

| Folder | Contents |
|--------|----------|
| **`/docs/guides/`** | Setup and how-to guides |
| **`/docs/architecture/`** | Project structure and quality roadmaps |
| **`/docs/deployment/`** | AWS deployment and troubleshooting |
| **`/docs/reference/`** | API docs, database schema, SQL scripts |
| **`/docs/deployment-history/`** | Historical deployment records |
| **`/docs/analysis/`** | Technical analysis and guides |

### 📖 Key Documents

- **[Documentation Index](docs/README.md)** - Complete documentation guide
- **[Project Overview](docs/architecture/01_PROJECT_OVERVIEW.md)** - High-level architecture
- **[Backend Setup](docs/guides/02_BACKEND_SETUP.md)** - Spring Boot setup guide
- **[Frontend Setup](docs/guides/03_FRONTEND_SETUP.md)** - React setup guide
- **[AWS Deployment](docs/deployment/04_AWS_DEPLOYMENT.md)** - Complete deployment guide
- **[API Documentation](docs/reference/05_API_DOCUMENTATION.md)** - Detailed API reference
- **[Database Schema](docs/reference/10_DATABASE_SCHEMA.md)** - Complete schema with ER diagrams
- **[Improvement Summary](docs/architecture/08_IMPROVEMENT_SUMMARY.md)** - Recent improvements (tests, exceptions)
- **[Path to Excellence](docs/architecture/09_PATH_TO_EXCELLENCE.md)** - Quality improvement roadmap

See **[/docs/README.md](docs/README.md)** for the complete documentation index.

---

## �👥 Authors

- **Fishyboyxx** - *Initial work* - [MyGitHub](https://github.com/murasakijyuutann)

---

## 🙏 Acknowledgments

- Spring Boot framework and ecosystem
- React and Vite communities
- All open-source contributors

---

## 📞 Support

For questions or issues:
- **Email**: support@vocalocart.com
- **Issues**: [GitHub Issues](https://github.com/murasakijyuutann/v_shop/issues)
- **Documentation**: See this README and inline code documentation

---

**Made with ❤️ using Spring Boot & React**
