# Backend Setup Guide

## Prerequisites
- Java 17 or higher
- Maven 3.6+
- Docker Desktop
- MySQL 8.0 (or AWS RDS)
- Git

## Initial Setup

### 1. Clone/Verify Project
```bash
cd C:/Users/rwoo1/Documents/VSCodeProjects/v_shop/vocaloidshop
```

### 2. Configure Database

**Option A: Local MySQL**
```yaml
# src/main/resources/application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/vocalocart?serverTimezone=Asia/Seoul
    username: root
    password: your_password
```

**Option B: AWS RDS (Current Setup)**
```yaml
spring:
  datasource:
    url: jdbc:mysql://mydb.czwaweqgeexp.ap-northeast-2.rds.amazonaws.com:3306/vocalocart?serverTimezone=Asia/Seoul
    username: root
    password: DoodyDanks48
```

### 3. Build Project
```bash
# Clean and build
mvn clean package

# Skip tests if needed
mvn clean package -DskipTests
```

**Expected Output:**
```
[INFO] BUILD SUCCESS
[INFO] Total time: 45 s
[INFO] ------------------------------------------------------------------------
```

### 4. Run Locally
```bash
# Run JAR file
java -jar target/vocaloidshop-0.0.1-SNAPSHOT.jar

# Or use Maven
mvn spring-boot:run
```

**Application should start on:** `http://localhost:8081`

### 5. Verify Installation
```bash
# Test health endpoint (if configured)
curl http://localhost:8081/actuator/health

# Test products API
curl http://localhost:8081/api/products

# Test categories API
curl http://localhost:8081/api/categories
```

## Project Structure Explained

### Configuration (`config/`)
- **AppConfig.java** - General application configuration, bean definitions
- **SecurityConfig.java** - Spring Security setup, JWT configuration, CORS

### Controllers (`controller/`)
REST API endpoints:
- **AuthController.java** - `/api/auth/*` - Login, Register
- **ProductController.java** - `/api/products/*` - Product CRUD
- **CategoryController.java** - `/api/categories/*` - Category management
- **CartController.java** - `/api/cart/*` - Shopping cart operations
- **OrderController.java** - `/api/orders/*` - Order processing
- **UserController.java** - `/api/users/*` - User management

### DTOs (`dto/`)
Data Transfer Objects for API requests/responses:
- **AuthRequestDTO.java** - Login credentials
- **AuthResponseDTO.java** - JWT token response
- **ProductRequestDTO.java** - Product creation/update
- **ProductResponseDTO.java** - Product data for frontend
- **CartItemResponseDTO.java** - Cart item data
- **CategoryRequestDTO.java / CategoryResponseDTO.java** - Category data

### Entities (`entity/`)
JPA database entities:
- **User.java** - User accounts table
- **Product.java** - Products table
- **Category.java** - Categories table
- **CartItem.java** - Shopping cart table
- **Order.java** - Orders table
- **OrderItem.java** - Order items (line items) table

### Repositories (`repository/`)
Spring Data JPA repositories for database access:
- **UserRepository.java** - User queries
- **ProductRepository.java** - Product queries
- **CategoryRepository.java** - Category queries
- **CartItemRepository.java** - Cart operations
- **OrderRepository.java** - Order queries
- **OrderItemRepository.java** - Order item queries

### Security (`security/`)
JWT and authentication components:
- JWT token generation and validation
- Custom authentication filters
- User details service

### Services (`service/`)
Business logic layer:
- **AuthService.java** - Authentication logic
- **ProductService.java** - Product operations
- **CategoryService.java** - Category management
- **CartService.java** - Cart operations
- **OrderService.java** - Order processing
- **UserService.java** - User management

## Key Dependencies (pom.xml)

```xml
<!-- Spring Boot -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- Spring Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- MySQL Driver -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
</dependency>

<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
</dependency>

<!-- Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- Lombok (Optional) -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
```

## Docker Setup

### 1. Dockerfile
```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/vocaloidshop-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 2. Build Docker Image
```bash
# Build the project first
mvn clean package -DskipTests

# Build Docker image
docker build -t vocaloidshop-backend:latest .

# Verify image
docker images | grep vocaloidshop-backend
```

**Expected Output:**
```
vocaloidshop-backend   latest   86b278986c38   6 hours ago   809MB
```

### 3. Run Docker Container Locally
```bash
# Run with environment variables
docker run -d \
  -p 8081:8081 \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://host.docker.internal:3306/vocalocart" \
  -e SPRING_DATASOURCE_USERNAME="root" \
  -e SPRING_DATASOURCE_PASSWORD="your_password" \
  --name vocaloidshop-backend \
  vocaloidshop-backend:latest

# Check logs
docker logs -f vocaloidshop-backend

# Stop container
docker stop vocaloidshop-backend
docker rm vocaloidshop-backend
```

## Database Schema Initialization

### Auto-Creation (Current Setup)
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # Automatically creates/updates tables
```

### Manual Schema (Alternative)
Create database and tables manually:
```sql
CREATE DATABASE vocalocart;
USE vocalocart;

-- Tables will be created by Hibernate on first run
```

## Testing the API

### Using cURL

**1. Register User**
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com"
  }'
```

**2. Login**
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "testuser"
}
```

**3. Get Products (with JWT)**
```bash
curl -X GET http://localhost:8081/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**4. Create Product (Admin)**
```bash
curl -X POST http://localhost:8081/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Miku Figure",
    "price": 5000,
    "imageUrl": "https://example.com/miku.jpg",
    "categoryId": 1
  }'
```

## Common Issues & Solutions

### Issue 1: Build Fails - JWT Dependency
**Error:** `Cannot resolve io.jsonwebtoken:jjwt-api`

**Solution:** Check JWT version in pom.xml:
```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
```

### Issue 2: Database Connection Failed
**Error:** `Could not open JDBC Connection`

**Solution:**
1. Verify MySQL is running: `mysql -u root -p`
2. Check database exists: `SHOW DATABASES;`
3. Verify credentials in `application.yml`
4. Check firewall allows port 3306

### Issue 3: Port 8081 Already in Use
**Error:** `Port 8081 was already in use`

**Solution:**
```bash
# Windows - Kill process on port 8081
netstat -ano | findstr :8081
taskkill /PID <process_id> /F

# Or change port in application.yml
server:
  port: 8082
```

### Issue 4: CORS Errors
**Error:** `Access-Control-Allow-Origin` errors in browser

**Solution:** Verify CORS configuration in `SecurityConfig.java`:
```java
@CrossOrigin(origins = "*")  // Or specific frontend URL
```

### Issue 5: Docker Cannot Connect to Host MySQL
**Error:** `Connection refused` when Docker tries to connect to local MySQL

**Solution:** Use `host.docker.internal` instead of `localhost`:
```bash
-e SPRING_DATASOURCE_URL="jdbc:mysql://host.docker.internal:3306/vocalocart"
```

## Development Workflow

### 1. Make Code Changes
Edit files in `src/main/java/mjyuu/vocaloidshop/`

### 2. Rebuild
```bash
mvn clean package -DskipTests
```

### 3. Restart Application
```bash
# If running locally
Ctrl+C  # Stop
java -jar target/vocaloidshop-0.0.1-SNAPSHOT.jar  # Restart

# If using Docker
docker-compose restart backend
```

### 4. Test Changes
```bash
curl http://localhost:8081/api/your-endpoint
```

## Next Steps
- See `04_AWS_DEPLOYMENT.md` for deploying to AWS ECS Fargate
- See `05_API_DOCUMENTATION.md` for complete API reference
