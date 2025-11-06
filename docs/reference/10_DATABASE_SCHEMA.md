# 📊 Database Schema Documentation

**Project:** Vocaloid Shopping Mall (VocaloCart)  
**Database:** MySQL 8.0  
**ORM:** JPA/Hibernate  
**Generated:** November 6, 2025

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Table Definitions](#table-definitions)
4. [SQL DDL Statements](#sql-ddl-statements)
5. [Indexes & Constraints](#indexes--constraints)
6. [Relationships](#relationships)

---

## 🎯 Overview

This database schema supports a full-featured e-commerce platform with:
- **User Management** (authentication, roles, addresses)
- **Product Catalog** (products, categories)
- **Shopping Features** (cart, wishlist)
- **Order Processing** (orders, order items, shipping)

**Total Tables:** 8  
**Total Relationships:** 11 foreign keys

---

## 🗺️ Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
│─────────────────│
│ PK id           │◄───┐
│    email (UQ)   │    │
│    password     │    │
│    name         │    │
│    phone        │    │
│    address      │    │
│    role (ENUM)  │    │
│    created_at   │    │
│    updated_at   │    │
└─────────────────┘    │
         △             │
         │             │
         │ (1:N)       │ (1:N)
         │             │
┌────────┴─────────┐   │          ┌─────────────────┐
│   addresses      │   │          │   cart_items    │
│──────────────────│   │          │─────────────────│
│ PK id            │   │          │ PK id           │
│ FK user_id       ├───┘          │ FK user_id      ├───┐
│    recipient_name│               │ FK product_id   │   │
│    line1         │               │    quantity     │   │
│    line2         │               │    price        │   │
│    city          │               └─────────────────┘   │
│    state         │                        │            │
│    postal_code   │                        │            │
│    country       │                        │            │
│    phone         │                        │ (N:1)      │
│    is_default    │                        │            │
└──────────────────┘                        │            │
         △                                  │            │
         │                                  │            │
         │ (1:N)                            │            │
         │                                  │            │
┌────────┴──────────┐               ┌──────▼────────┐   │
│    orders         │               │   products    │   │
│───────────────────│               │───────────────│   │
│ PK id             │               │ PK id         │◄──┤
│ FK user_id        ├───┐           │    name       │   │
│    total_amount   │   │           │    description│   │
│    status (ENUM)  │   │           │    price      │   │
│    ordered_at     │   │           │    stock_qty  │   │
│    ship_*         │   │           │    image_url  │   │
│    (8 fields)     │   │           │ FK category_id├─┐ │
└───────────────────┘   │           └───────────────┘ │ │
         △              │                    △         │ │
         │              │                    │         │ │
         │ (1:N)        │                    │ (N:1)   │ │
         │              │                    │         │ │
┌────────┴─────────┐    │           ┌────────┴──────┐ │ │
│   order_items    │    │           │  categories   │ │ │
│──────────────────│    │           │───────────────│ │ │
│ PK id            │    │           │ PK id         │◄┘ │
│ FK order_id      ├────┘           │    name (UQ)  │   │
│ FK product_id    ├────────────────┤    description│   │
│    quantity      │                │    created_at │   │
│    price         │                │    updated_at │   │
└──────────────────┘                └───────────────┘   │
                                             △           │
                                             │           │
                                             │           │
                                             │           │
                                    ┌────────┴─────────┐ │
                                    │ wishlist_items   │ │
                                    │──────────────────│ │
                                    │ PK id            │ │
                                    │ FK user_id       ├─┘
                                    │ FK product_id    │
                                    │    created_at    │
                                    └──────────────────┘
```

**Legend:**
- `PK` = Primary Key
- `FK` = Foreign Key
- `UQ` = Unique Constraint
- `△` = One (parent)
- `├─` = Many (child)
- `(1:N)` = One-to-Many relationship

---

## 📊 Table Definitions

### 1. users
**Purpose:** Store user accounts with authentication and profile information

| Column      | Type          | Nullable | Default | Constraints    | Description                |
|-------------|---------------|----------|---------|----------------|----------------------------|
| id          | BIGINT        | NO       | AUTO    | PK, AUTO_INC   | Unique user identifier     |
| email       | VARCHAR(255)  | NO       | -       | UNIQUE         | User login email           |
| password    | VARCHAR(255)  | NO       | -       | -              | BCrypt hashed password     |
| name        | VARCHAR(255)  | NO       | -       | -              | User full name             |
| phone       | VARCHAR(255)  | YES      | NULL    | -              | Contact phone number       |
| address     | VARCHAR(255)  | YES      | NULL    | -              | User address (deprecated)  |
| role        | VARCHAR(20)   | NO       | 'USER'  | ENUM           | USER or ADMIN              |
| created_at  | DATETIME      | YES      | NULL    | -              | Account creation timestamp |
| updated_at  | DATETIME      | YES      | NULL    | -              | Last update timestamp      |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE INDEX: `email`

---

### 2. categories
**Purpose:** Product category hierarchy

| Column      | Type          | Nullable | Default | Constraints    | Description                |
|-------------|---------------|----------|---------|----------------|----------------------------|
| id          | BIGINT        | NO       | AUTO    | PK, AUTO_INC   | Unique category identifier |
| name        | VARCHAR(255)  | NO       | -       | UNIQUE         | Category name              |
| description | TEXT          | YES      | NULL    | -              | Category description       |
| created_at  | DATETIME      | YES      | NULL    | -              | Creation timestamp         |
| updated_at  | DATETIME      | YES      | NULL    | -              | Last update timestamp      |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE INDEX: `name`

---

### 3. products
**Purpose:** Product catalog with inventory

| Column         | Type          | Nullable | Default | Constraints    | Description                |
|----------------|---------------|----------|---------|----------------|----------------------------|
| id             | BIGINT        | NO       | AUTO    | PK, AUTO_INC   | Unique product identifier  |
| name           | VARCHAR(255)  | NO       | -       | -              | Product name               |
| description    | TEXT          | YES      | NULL    | -              | Product description        |
| price          | INT           | NO       | -       | -              | Price in cents/smallest unit|
| stock_quantity | INT           | NO       | -       | -              | Available inventory        |
| image_url      | VARCHAR(255)  | YES      | NULL    | -              | Product image URL          |
| category_id    | BIGINT        | YES      | NULL    | FK → categories| Product category           |

**Indexes:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `category_id` → `categories(id)`
- INDEX: `category_id` (for query performance)

---

### 4. cart_items
**Purpose:** Shopping cart line items (temporary)

| Column      | Type     | Nullable | Default | Constraints       | Description                |
|-------------|----------|----------|---------|-------------------|----------------------------|
| id          | BIGINT   | NO       | AUTO    | PK, AUTO_INC      | Unique cart item identifier|
| user_id     | BIGINT   | NO       | -       | FK → users        | Cart owner                 |
| product_id  | BIGINT   | NO       | -       | FK → products     | Product in cart            |
| quantity    | INT      | NO       | -       | -                 | Item quantity              |
| price       | INT      | NO       | -       | -                 | Price at time of add       |

**Indexes:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` → `users(id)`
- FOREIGN KEY: `product_id` → `products(id)`
- INDEX: `user_id` (for query performance)
- INDEX: `product_id`

**Notes:**
- Price is captured at add-to-cart time to handle price changes
- Items deleted when user completes purchase

---

### 5. wishlist_items
**Purpose:** User's saved products for later

| Column      | Type     | Nullable | Default | Constraints       | Description                |
|-------------|----------|----------|---------|-------------------|----------------------------|
| id          | BIGINT   | NO       | AUTO    | PK, AUTO_INC      | Unique wishlist identifier |
| user_id     | BIGINT   | NO       | -       | FK → users        | Wishlist owner             |
| product_id  | BIGINT   | NO       | -       | FK → products     | Saved product              |
| created_at  | DATETIME | YES      | NULL    | -                 | Date added to wishlist     |

**Indexes:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` → `users(id)`
- FOREIGN KEY: `product_id` → `products(id)`
- UNIQUE INDEX: `(user_id, product_id)` (prevents duplicates)

---

### 6. addresses
**Purpose:** User's saved shipping addresses

| Column         | Type         | Nullable | Default | Constraints    | Description                |
|----------------|--------------|----------|---------|----------------|----------------------------|
| id             | BIGINT       | NO       | AUTO    | PK, AUTO_INC   | Unique address identifier  |
| user_id        | BIGINT       | NO       | -       | FK → users     | Address owner              |
| recipient_name | VARCHAR(255) | NO       | -       | -              | Recipient full name        |
| line1          | VARCHAR(255) | NO       | -       | -              | Address line 1             |
| line2          | VARCHAR(255) | YES      | NULL    | -              | Address line 2 (optional)  |
| city           | VARCHAR(255) | NO       | -       | -              | City name                  |
| state          | VARCHAR(255) | YES      | NULL    | -              | State/Province             |
| postal_code    | VARCHAR(255) | NO       | -       | -              | ZIP/Postal code            |
| country        | VARCHAR(255) | NO       | -       | -              | Country name               |
| phone          | VARCHAR(255) | NO       | -       | -              | Contact phone              |
| is_default     | BOOLEAN      | YES      | FALSE   | -              | Default shipping address   |

**Indexes:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` → `users(id)`
- INDEX: `user_id`

---

### 7. orders
**Purpose:** Completed purchase orders

| Column             | Type         | Nullable | Default | Constraints    | Description                |
|--------------------|--------------|----------|---------|----------------|----------------------------|
| id                 | BIGINT       | NO       | AUTO    | PK, AUTO_INC   | Unique order identifier    |
| user_id            | BIGINT       | NO       | -       | FK → users     | Order customer             |
| total_amount       | INT          | NO       | -       | -              | Total order amount         |
| status             | VARCHAR(50)  | NO       | -       | ENUM           | Order status               |
| ordered_at         | DATETIME     | YES      | NULL    | -              | Order placement timestamp  |
| ship_recipient_name| VARCHAR(255) | YES      | NULL    | -              | Shipping: recipient name   |
| ship_line1         | VARCHAR(255) | YES      | NULL    | -              | Shipping: address line 1   |
| ship_line2         | VARCHAR(255) | YES      | NULL    | -              | Shipping: address line 2   |
| ship_city          | VARCHAR(255) | YES      | NULL    | -              | Shipping: city             |
| ship_state         | VARCHAR(255) | YES      | NULL    | -              | Shipping: state            |
| ship_postal_code   | VARCHAR(255) | YES      | NULL    | -              | Shipping: postal code      |
| ship_country       | VARCHAR(255) | YES      | NULL    | -              | Shipping: country          |
| ship_phone         | VARCHAR(255) | YES      | NULL    | -              | Shipping: phone            |

**Indexes:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` → `users(id)`
- INDEX: `user_id` (for order history queries)
- INDEX: `status` (for admin order filtering)
- INDEX: `ordered_at` (for date range queries)

**Order Status ENUM:**
- `PENDING` - Order placed, awaiting payment
- `PAID` - Payment received
- `PROCESSING` - Being prepared for shipment
- `SHIPPED` - Sent to customer
- `DELIVERED` - Successfully delivered
- `CANCELLED` - Order cancelled

---

### 8. order_items
**Purpose:** Line items for each order (immutable)

| Column      | Type     | Nullable | Default | Constraints       | Description                |
|-------------|----------|----------|---------|-------------------|----------------------------|
| id          | BIGINT   | NO       | AUTO    | PK, AUTO_INC      | Unique order item identifier|
| order_id    | BIGINT   | NO       | -       | FK → orders       | Parent order               |
| product_id  | BIGINT   | NO       | -       | FK → products     | Purchased product          |
| quantity    | INT      | NO       | -       | -                 | Quantity purchased         |
| price       | INT      | NO       | -       | -                 | Price at purchase time     |

**Indexes:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `order_id` → `orders(id)` ON DELETE CASCADE
- FOREIGN KEY: `product_id` → `products(id)`
- INDEX: `order_id`

**Notes:**
- Price captured at purchase time (historical record)
- Quantity and price are immutable after order placement

---

## 💾 SQL DDL Statements

### Complete Database Creation Script

```sql
-- ============================================
-- Vocaloid Shopping Mall Database Schema
-- MySQL 8.0
-- ============================================

-- Drop tables if exists (for fresh install)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS wishlist_items;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- ============================================
-- 1. Users Table
-- ============================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    address VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at DATETIME,
    updated_at DATETIME,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    CHECK (role IN ('USER', 'ADMIN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. Categories Table
-- ============================================
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. Products Table
-- ============================================
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    image_url VARCHAR(255),
    category_id BIGINT,
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_name (name),
    INDEX idx_price (price),
    CHECK (price >= 0),
    CHECK (stock_quantity >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. Cart Items Table
-- ============================================
CREATE TABLE cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price INT NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    UNIQUE KEY uk_user_product (user_id, product_id),
    CHECK (quantity > 0),
    CHECK (price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. Wishlist Items Table
-- ============================================
CREATE TABLE wishlist_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at DATETIME,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    UNIQUE KEY uk_user_product (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. Addresses Table
-- ============================================
CREATE TABLE addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255),
    postal_code VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (user_id, is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. Orders Table
-- ============================================
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_amount INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    ordered_at DATETIME,
    ship_recipient_name VARCHAR(255),
    ship_line1 VARCHAR(255),
    ship_line2 VARCHAR(255),
    ship_city VARCHAR(255),
    ship_state VARCHAR(255),
    ship_postal_code VARCHAR(255),
    ship_country VARCHAR(255),
    ship_phone VARCHAR(255),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_ordered_at (ordered_at),
    CHECK (status IN ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    CHECK (total_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. Order Items Table
-- ============================================
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price INT NOT NULL,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id),
    CHECK (quantity > 0),
    CHECK (price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔗 Relationships Summary

### Foreign Key Constraints

| Child Table     | Column       | Parent Table | Parent Column | On Delete    | Relationship |
|-----------------|--------------|--------------|---------------|--------------|--------------|
| products        | category_id  | categories   | id            | SET NULL     | Many-to-One  |
| cart_items      | user_id      | users        | id            | CASCADE      | Many-to-One  |
| cart_items      | product_id   | products     | id            | CASCADE      | Many-to-One  |
| wishlist_items  | user_id      | users        | id            | CASCADE      | Many-to-One  |
| wishlist_items  | product_id   | products     | id            | CASCADE      | Many-to-One  |
| addresses       | user_id      | users        | id            | CASCADE      | Many-to-One  |
| orders          | user_id      | users        | id            | RESTRICT     | Many-to-One  |
| order_items     | order_id     | orders       | id            | CASCADE      | Many-to-One  |
| order_items     | product_id   | products     | id            | RESTRICT     | Many-to-One  |

### Delete Behavior:
- **CASCADE**: Delete child records when parent is deleted (cart_items, wishlist_items, addresses)
- **RESTRICT**: Prevent parent deletion if children exist (orders, order_items)
- **SET NULL**: Set foreign key to NULL when parent is deleted (products.category_id)

---

## 📈 Performance Considerations

### Recommended Indexes (Already Included)

```sql
-- User queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Product search
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_price ON products(price);

-- Cart operations
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE UNIQUE INDEX uk_cart_user_product ON cart_items(user_id, product_id);

-- Wishlist operations
CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);
CREATE UNIQUE INDEX uk_wishlist_user_product ON wishlist_items(user_id, product_id);

-- Order queries
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(ordered_at);

-- Order item queries
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### Query Optimization Tips

1. **Product Listing:** Index on `category_id`, `price` for filtering
2. **User Cart:** Compound index on `(user_id, product_id)` prevents duplicates
3. **Order History:** Index on `(user_id, ordered_at)` for date-sorted queries
4. **Admin Dashboard:** Index on `status` for order filtering

---

## 🛡️ Data Integrity

### Constraints Applied

1. **NOT NULL:** Critical fields cannot be empty
2. **UNIQUE:** Email, category names must be unique
3. **CHECK:** Validates data ranges (price >= 0, quantity > 0)
4. **FOREIGN KEY:** Enforces referential integrity
5. **CASCADE/RESTRICT:** Controls deletion behavior

### Business Rules Enforced

- Users must have unique email addresses
- Products must belong to valid categories
- Cart items cannot have duplicate products per user
- Order prices and quantities must be positive
- Order status must be valid enum value

---

## 📝 Sample Data (Optional)

```sql
-- Insert sample categories
INSERT INTO categories (name, description, created_at, updated_at) VALUES
('Vocaloid Software', 'Vocaloid voice synthesis software', NOW(), NOW()),
('Figures & Merchandise', 'Official figures and collectibles', NOW(), NOW()),
('Music Albums', 'Vocaloid music CDs and digital albums', NOW(), NOW());

-- Insert sample products
INSERT INTO products (name, description, price, stock_quantity, category_id) VALUES
('Hatsune Miku V4X', 'Latest Vocaloid software for Hatsune Miku', 15000, 50, 1),
('Kagamine Rin/Len V4X', 'Twin Vocaloid software package', 15000, 30, 1),
('Miku Figma', 'Poseable Hatsune Miku figure', 5000, 100, 2);

-- Insert sample admin user
INSERT INTO users (email, password, name, role, created_at, updated_at) VALUES
('admin@vocalocart.com', '$2a$10$encodedpassword', 'Admin User', 'ADMIN', NOW(), NOW());
```

---

## 🔄 Migration History

**Version 1 (Initial):**
- Created all 8 tables
- Established foreign key relationships
- Added performance indexes

**Future Migrations:**
- Add product reviews table
- Add payment transactions table
- Add product images table (multiple images per product)
- Add coupon/discount codes table

---

## 📚 Additional Resources

- **JPA Entities:** `src/main/java/mjyuu/vocaloidshop/entity/`
- **Repositories:** `src/main/java/mjyuu/vocaloidshop/repository/`
- **API Documentation:** See `05_API_DOCUMENTATION.md`
- **Deployment Guide:** See `04_AWS_DEPLOYMENT.md`

---

**Generated by:** Database Schema Analyzer  
**Based on:** JPA Entity Classes  
**Last Updated:** November 6, 2025
