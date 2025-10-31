# VocaloCart (v_shop)

Full‑stack e‑commerce demo built with React + Vite (frontend) and Spring Boot (backend). It includes JWT auth, admin order management, cart/checkout, wishlist, address book, dark mode, and a contact form that emails inquiries.

## Contents

- Tech stack
- Architecture & design
- Features
- Project structure
- Getting started (run locally)
- Configuration
- API overview (selected)
- Admin access
- Troubleshooting

---

## Tech stack

- Frontend
	- React 18 + TypeScript + Vite
	- styled-components v6 (light/dark themes)
	- React Router, Axios, Framer Motion (toasts/animations)
- Backend
	- Spring Boot 3.5.x (Java 21)
	- Spring Security (JWT), JPA/Hibernate
	- MySQL
	- Spring Mail (SendGrid or SMTP)

## Architecture & design

```
React (Vite dev server)  ──proxy──▶  Spring Boot API  ──▶  MySQL
				│                                   │
				└──▶ styled-components Theme        └──▶ Mail (SMTP/SendGrid)
```

- Auth: JWT on login/register; token stored in localStorage. Axios sets Authorization header automatically.
- Admin: ROLE_ADMIN injected from DB flag; UI conditionally exposes /admin route.
- Orders: Forward‑only status workflow (PAYMENT_RECEIVED → PROCESSING → PREPARING → READY_FOR_DELIVERY → IN_DELIVERY → DELIVERED; CANCELED anytime).
- Addresses: User can CRUD addresses and mark a default; checkout preselects default address.
- Wishlist: Items link to product detail pages.
- Theming: Light/dark toggle persisted; global styles via styled-components.
- Contact: Dedicated page posts to /api/contact to send an email.

## Features

- Account
	- Register/login (JWT), My Page edit (nickname anytime; birthday limited to once per year)
	- Dark mode toggle
- Catalog & Cart
	- Product detail page
	- Cart add/increment/decrement/remove
	- Checkout creates an order; clears cart
	- Address management; default preselect at checkout
	- Wishlist with clickable items to product details
- Orders
	- Order history for users
	- Admin orders page: list all orders, update status
- Contact
	- Contact page form (name/email/title/details) → email via backend

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

## Getting started

Prerequisites:
- Node.js 18+
- Java 21 (JDK)
- MySQL 8+ (local or reachable remote)

1) Backend: configure DB and mail

- Update `vocaloidshop/src/main/resources/application.yml` with your own MySQL and mail settings.
- Recommended: don’t commit secrets; use environment variables or a local override file.

2) Start the backend

```bash
cd vocaloidshop
# Option A: run with default application.yml
./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=8081

# Option B: run with env-based config (application-env.yml)
# Set environment variables then activate the profile:
#   DB_URL, DB_USERNAME, DB_PASSWORD
#   MAIL_HOST, MAIL_USERNAME, MAIL_PASSWORD, MAIL_PORT (optional)
SPRING_PROFILES_ACTIVE=env ./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

3) Frontend: install and run

```bash
cd ../vocaloid_front
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies API requests to http://localhost:8081 by default (see `vite.config.ts`).

Builds:

```bash
# Frontend build
cd vocaloid_front && npm run build

# Backend build (skip tests)
cd ../vocaloidshop && ./mvnw -DskipTests=true clean package
```

## Configuration

- Ports
	- Backend: 8081 (configurable via `--server.port` or application.yml)
	- Frontend: 5173 (Vite dev server)
- Vite proxy (frontend `vite.config.ts`)
	- `/api` and `/auth` → `http://localhost:8081`
	- If you change the backend port, update this proxy accordingly
- Database (backend `application.yml`)
	- `spring.datasource.url`: set to your MySQL instance
	- `spring.jpa.hibernate.ddl-auto`: `update` is convenient for dev; use migrations for prod
- Alternative: environment variables via `application-env.yml`
	- Activate with `SPRING_PROFILES_ACTIVE=env`
	- Provide: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
	- Mail: `MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD`, (`MAIL_PORT` optional)
- Mail (backend `application.yml`)
	- `spring.mail.*`: host, port, username, password, TLS
	- The contact endpoint sends mail using these settings

## API overview (selected)

- Auth
	- POST `/auth/register` { email, password, nickname?, birthday? } → JWT
	- POST `/auth/login` { email, password } → JWT
	- GET `/auth/me` → { id, email, name, isAdmin, nickname, birthday }
	- PATCH `/auth/me` { nickname?, birthday? } → updated user
- Products & Categories
	- GET `/api/products`, `/api/products/{id}`
	- GET `/api/categories`
- Cart
	- GET `/api/cart/{userId}`
	- POST `/api/cart` { userId, productId, quantity }
	- PATCH `/api/cart/{cartItemId}/decrement`
	- DELETE `/api/cart/{cartItemId}`
- Addresses
	- GET `/api/addresses/{userId}`
	- POST `/api/addresses/{userId}` (create, supports isDefault)
	- PUT `/api/addresses/{userId}/{addressId}` (e.g. set isDefault)
	- DELETE `/api/addresses/{userId}/{addressId}`
- Orders
	- POST `/api/orders/place/{userId}?addressId=`
	- GET `/api/orders/user/{userId}` (order history)
	- Admin: GET `/api/orders` (all)
	- Admin: PATCH `/api/orders/{orderId}/status?status=...` (friendly synonyms supported)
- Wishlist
	- GET `/api/wishlist/{userId}`
	- DELETE `/api/wishlist/{userId}/{productId}`
- Contact
	- POST `/api/contact` { senderName, senderEmail, title, details }

## Admin access

1) Promote a user in MySQL (pick the correct column name for your schema):

```sql
-- Example: snake_case column name
UPDATE user SET is_admin = 1 WHERE email = 'you@example.com';
```

2) Refresh the frontend session (hard reload or re-login). The header will reveal the “Admin” link.

3) Open http://localhost:5173/admin to manage orders (list + status updates).

## Database migrations (Flyway)

- Flyway runs on startup if present. Initial script provided:
	- `V1__order_status_length_and_normalize.sql`
		- Ensures `order.status` column length (varchar(32))
		- Normalizes legacy status values (PAID/SHIPPED/CANCELLED → canonical)
	- Place additional SQL migrations under `vocaloidshop/src/main/resources/db/migration/` with names like `V2__*.sql`.

## Screenshots (optional)

Place images under `docs/screenshots/` and reference them here, for example:

![Home](docs/screenshots/home.png)
![Product Detail](docs/screenshots/product.png)
![Cart](docs/screenshots/cart.png)
![Checkout](docs/screenshots/checkout.png)
![Orders](docs/screenshots/orders.png)
![Admin Orders](docs/screenshots/admin-orders.png)

## Troubleshooting

- Backend port in use (8081)
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

## License

This repository is for demonstration/learning purposes. Replace credentials with your own secrets and use at your own risk.
