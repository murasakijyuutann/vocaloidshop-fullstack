-- ============================================
-- Vocaloid Shopping Mall Database Schema
-- MySQL 8.0 DDL Script
-- Generated: November 6, 2025
-- ============================================

-- Set SQL Mode for consistency
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- Use database (create if not exists)
CREATE DATABASE IF NOT EXISTS vocalocart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vocalocart;

-- ============================================
-- Drop tables if exists (for fresh install)
-- ============================================
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
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'User login email',
    password VARCHAR(255) NOT NULL COMMENT 'BCrypt hashed password',
    name VARCHAR(255) NOT NULL COMMENT 'User full name',
    phone VARCHAR(255) COMMENT 'Contact phone number',
    address VARCHAR(255) COMMENT 'User address (deprecated, use addresses table)',
    role VARCHAR(20) NOT NULL DEFAULT 'USER' COMMENT 'USER or ADMIN',
    created_at DATETIME COMMENT 'Account creation timestamp',
    updated_at DATETIME COMMENT 'Last update timestamp',
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    CHECK (role IN ('USER', 'ADMIN'))
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci 
  COMMENT='User accounts with authentication';

-- ============================================
-- 2. Categories Table
-- ============================================
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Category name',
    description TEXT COMMENT 'Category description',
    created_at DATETIME COMMENT 'Creation timestamp',
    updated_at DATETIME COMMENT 'Last update timestamp',
    
    INDEX idx_name (name)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci 
  COMMENT='Product categories';

-- ============================================
-- 3. Products Table
-- ============================================
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Product name',
    description TEXT COMMENT 'Product description',
    price INT NOT NULL COMMENT 'Price in cents/smallest currency unit',
    stock_quantity INT NOT NULL DEFAULT 0 COMMENT 'Available inventory',
    image_url VARCHAR(255) COMMENT 'Product image URL',
    category_id BIGINT COMMENT 'Product category FK',
    
    FOREIGN KEY (category_id) 
        REFERENCES categories(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    
    INDEX idx_category (category_id),
    INDEX idx_name (name),
    INDEX idx_price (price),
    
    CHECK (price >= 0),
    CHECK (stock_quantity >= 0)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci 
  COMMENT='Product catalog';

-- ============================================
-- 4. Cart Items Table
-- ============================================
CREATE TABLE cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT 'Cart owner FK',
    product_id BIGINT NOT NULL COMMENT 'Product in cart FK',
    quantity INT NOT NULL DEFAULT 1 COMMENT 'Item quantity',
    price INT NOT NULL COMMENT 'Price at time of add',
    
    FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    UNIQUE KEY uk_user_product (user_id, product_id),
    
    CHECK (quantity > 0),
    CHECK (price >= 0)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci 
  COMMENT='Shopping cart line items';

-- ============================================
-- 5. Wishlist Items Table
-- ============================================
CREATE TABLE wishlist_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT 'Wishlist owner FK',
    product_id BIGINT NOT NULL COMMENT 'Saved product FK',
    created_at DATETIME COMMENT 'Date added to wishlist',
    
    FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    UNIQUE KEY uk_user_product (user_id, product_id)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci 
  COMMENT='User saved products for later';

-- ============================================
-- 6. Addresses Table
-- ============================================
CREATE TABLE addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT 'Address owner FK',
    recipient_name VARCHAR(255) NOT NULL COMMENT 'Recipient full name',
    line1 VARCHAR(255) NOT NULL COMMENT 'Address line 1',
    line2 VARCHAR(255) COMMENT 'Address line 2 (optional)',
    city VARCHAR(255) NOT NULL COMMENT 'City name',
    state VARCHAR(255) COMMENT 'State/Province',
    postal_code VARCHAR(255) NOT NULL COMMENT 'ZIP/Postal code',
    country VARCHAR(255) NOT NULL COMMENT 'Country name',
    phone VARCHAR(255) NOT NULL COMMENT 'Contact phone',
    is_default BOOLEAN DEFAULT FALSE COMMENT 'Default shipping address flag',
    
    FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (user_id, is_default)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci 
  COMMENT='User shipping addresses';

-- ============================================
-- 7. Orders Table
-- ============================================
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT 'Order customer FK',
    total_amount INT NOT NULL COMMENT 'Total order amount',
    status VARCHAR(50) NOT NULL COMMENT 'Order status enum',
    ordered_at DATETIME COMMENT 'Order placement timestamp',
    ship_recipient_name VARCHAR(255) COMMENT 'Shipping: recipient name',
    ship_line1 VARCHAR(255) COMMENT 'Shipping: address line 1',
    ship_line2 VARCHAR(255) COMMENT 'Shipping: address line 2',
    ship_city VARCHAR(255) COMMENT 'Shipping: city',
    ship_state VARCHAR(255) COMMENT 'Shipping: state',
    ship_postal_code VARCHAR(255) COMMENT 'Shipping: postal code',
    ship_country VARCHAR(255) COMMENT 'Shipping: country',
    ship_phone VARCHAR(255) COMMENT 'Shipping: phone',
    
    FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_ordered_at (ordered_at),
    
    CHECK (status IN ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    CHECK (total_amount >= 0)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci 
  COMMENT='Completed purchase orders';

-- ============================================
-- 8. Order Items Table
-- ============================================
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL COMMENT 'Parent order FK',
    product_id BIGINT NOT NULL COMMENT 'Purchased product FK',
    quantity INT NOT NULL COMMENT 'Quantity purchased',
    price INT NOT NULL COMMENT 'Price at purchase time',
    
    FOREIGN KEY (order_id) 
        REFERENCES orders(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id),
    
    CHECK (quantity > 0),
    CHECK (price >= 0)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci 
  COMMENT='Order line items (immutable)';

-- ============================================
-- Sample Data (Optional - Comment out if not needed)
-- ============================================

-- Insert sample categories
INSERT INTO categories (name, description, created_at, updated_at) VALUES
('Vocaloid Software', 'Vocaloid voice synthesis software packages', NOW(), NOW()),
('Figures & Merchandise', 'Official figures and collectibles', NOW(), NOW()),
('Music Albums', 'Vocaloid music CDs and digital albums', NOW(), NOW()),
('Accessories', 'Vocaloid-themed accessories and goods', NOW(), NOW());

-- Insert sample products
INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES
('Hatsune Miku V4X', 'Latest Vocaloid software for Hatsune Miku with enhanced voice bank', 15000, 50, 1, 'https://example.com/miku-v4x.jpg'),
('Kagamine Rin/Len V4X', 'Twin Vocaloid software package with dual voice banks', 15000, 30, 1, 'https://example.com/rin-len.jpg'),
('Megurine Luka V4X', 'Bilingual Vocaloid software supporting Japanese and English', 15000, 25, 1, 'https://example.com/luka.jpg'),
('Miku Figma Action Figure', 'Highly detailed poseable Hatsune Miku figure', 5000, 100, 2, 'https://example.com/miku-figma.jpg'),
('Miku Nendoroid', 'Cute chibi-style Hatsune Miku collectible figure', 4000, 150, 2, 'https://example.com/miku-nendo.jpg'),
('Magical Mirai 2024 Album', 'Official Magical Mirai concert album', 3000, 200, 3, 'https://example.com/mirai-album.jpg');

-- Insert sample admin user (password: admin123 - BCrypt hash)
-- Note: This is a sample hash, replace with actual BCrypt hash in production
INSERT INTO users (email, password, name, role, created_at, updated_at) VALUES
('admin@vocalocart.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin User', 'ADMIN', NOW(), NOW()),
('user@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Test User', 'USER', NOW(), NOW());

-- ============================================
-- Verification Queries
-- ============================================

-- Show all tables
SHOW TABLES;

-- Show table structures
-- DESCRIBE users;
-- DESCRIBE categories;
-- DESCRIBE products;
-- DESCRIBE cart_items;
-- DESCRIBE wishlist_items;
-- DESCRIBE addresses;
-- DESCRIBE orders;
-- DESCRIBE order_items;

-- Show foreign key constraints
-- SELECT 
--     TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, 
--     REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
-- FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
-- WHERE TABLE_SCHEMA = 'vocalocart' 
--   AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Count records in each table
-- SELECT 'users' as table_name, COUNT(*) as record_count FROM users
-- UNION ALL
-- SELECT 'categories', COUNT(*) FROM categories
-- UNION ALL
-- SELECT 'products', COUNT(*) FROM products
-- UNION ALL
-- SELECT 'cart_items', COUNT(*) FROM cart_items
-- UNION ALL
-- SELECT 'wishlist_items', COUNT(*) FROM wishlist_items
-- UNION ALL
-- SELECT 'addresses', COUNT(*) FROM addresses
-- UNION ALL
-- SELECT 'orders', COUNT(*) FROM orders
-- UNION ALL
-- SELECT 'order_items', COUNT(*) FROM order_items;

-- ============================================
-- End of Schema Script
-- ============================================

COMMIT;
