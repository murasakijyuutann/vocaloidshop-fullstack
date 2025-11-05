# 📋 Prerequisites for Docker Image Build

## ✅ Before You Start

### 1. **Software Requirements**
- [ ] Docker Desktop installed and running
  - Windows: [Download Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
  - Mac: [Download Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
  - Linux: [Install Docker Engine](https://docs.docker.com/engine/install/)
- [ ] Docker Compose (included with Docker Desktop)
- [ ] Git (optional, for version control)

### 2. **Project Structure Required**
Your Spring Boot project must have:
- [ ] `pom.xml` (Maven) or `build.gradle` (Gradle) at root
- [ ] `src/main/java` directory with application code
- [ ] `src/main/resources/application.yml` or `application.properties`
- [ ] Maven wrapper (`mvnw`, `mvnw.cmd`, `.mvn/` folder) OR system Maven installed

### 3. **Environment Configuration**
- [ ] `.env` file created with required variables (see below)
- [ ] Database connection details available
- [ ] Mail service credentials (if using email features)
- [ ] OAuth credentials (if using social login)

### 4. **Dependencies in pom.xml**
Must include:
- [ ] `spring-boot-starter-web`
- [ ] `spring-boot-starter-data-jpa`
- [ ] Database driver (e.g., `mysql-connector-j`)
- [ ] `spring-boot-starter-actuator` (for health checks)

## 📁 Required Files for Dockerization

### Core Files (Must Create)

#### 1. `Dockerfile`
**Purpose:** Defines how to build your Docker image

**Location:** Project root (`vocaloidshop/Dockerfile`)

**Key Components:**
- Multi-stage build (builder + runtime)
- Base image (e.g., `eclipse-temurin:21-jdk-jammy`)
- WORKDIR setup
- Copy source code
- Build command (Maven/Gradle)
- Runtime configuration
- EXPOSE port
- ENTRYPOINT command

#### 2. `.dockerignore`
**Purpose:** Excludes unnecessary files from Docker build context

**Location:** Project root (`vocaloidshop/.dockerignore`)

**Must Exclude:**
- `target/` (build artifacts)
- `.git/` (version control)
- `.env` files (secrets)
- IDE folders (`.idea/`, `.vscode/`)
- `*.log` files
- Documentation files

#### 3. `docker-compose.yml`
**Purpose:** Orchestrates multi-container setup (optional but recommended)

**Location:** Project root (`vocaloidshop/docker-compose.yml`)

**Defines:**
- Services (backend, database, etc.)
- Networks
- Volumes
- Environment variables
- Port mappings
- Health checks
- Dependencies between services

#### 4. `.env` File
**Purpose:** Stores environment variables

**Location:** Project root (`vocaloidshop/.env`)

**Must Include:**
```properties
# Database
DB_URL=jdbc:mysql://host:3306/database
DB_USERNAME=root
DB_PASSWORD=yourpassword

# Mail (if applicable)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-api-key

# Application
SERVER_PORT=8081
FRONTEND_BASE_URL=http://localhost:5173
JPA_DDL_AUTO=update
```

### Configuration Files (Must Update)

#### 5. `pom.xml` Updates
Add Actuator dependency:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

#### 6. `application.yml` Updates
Add health check endpoints:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when-authorized
```

### Optional Helper Files

#### 7. `docker-compose.prod.yml`
**Purpose:** Production-specific configuration (without local DB)

#### 8. `docker-run.bat` / `docker-run.sh`
**Purpose:** Interactive helper scripts for building/running

#### 9. Documentation Files
- `DOCKER_GUIDE.md` - Comprehensive guide
- `DOCKER_QUICKSTART.md` - Quick reference
- `DOCKER_SETUP_COMPLETE.md` - Setup summary

## 🔍 Pre-Build Checklist

### Before Running `docker build`:

1. **Verify Project Structure**
   ```bash
   # Must exist:
   ls -la pom.xml
   ls -la src/main/java
   ls -la src/main/resources/application.yml
   ls -la mvnw  # or have Maven installed
   ```

2. **Check Environment Variables**
   ```bash
   # Verify .env file exists and has values
   cat .env | grep -v '^#' | grep -v '^$'
   ```

3. **Test Local Build First (Optional but Recommended)**
   ```bash
   # Maven
   ./mvnw clean package -DskipTests
   
   # Should create target/*.jar file
   ls -la target/*.jar
   ```

4. **Verify Docker is Running**
   ```bash
   docker --version
   docker ps
   ```

5. **Check Port Availability**
   ```bash
   # Make sure port 8081 is free
   # Windows:
   netstat -ano | findstr :8081
   
   # Linux/Mac:
   lsof -i :8081
   ```

## 🚀 Build Process Flow

### Step 1: Prepare Files
```bash
cd your-project-directory

# Create required files if missing:
touch Dockerfile
touch .dockerignore
touch docker-compose.yml
touch .env
```

### Step 2: Configure Files
- Copy Dockerfile template (see archive)
- Copy .dockerignore template (see archive)
- Fill in .env with your values
- Update pom.xml with actuator
- Update application.yml with health endpoints

### Step 3: Build
```bash
# Option A: Docker build
docker build -t your-app-name:latest .

# Option B: Docker Compose
docker-compose build

# Option C: Docker Compose Production
docker-compose -f docker-compose.prod.yml build
```

### Step 4: Run
```bash
# Option A: Docker run
docker run -d -p 8081:8081 --env-file .env your-app-name

# Option B: Docker Compose
docker-compose up -d

# Option C: Docker Compose Production
docker-compose -f docker-compose.prod.yml up -d
```

### Step 5: Verify
```bash
# Check container is running
docker ps

# Check logs
docker logs container-name

# Test health endpoint
curl http://localhost:8081/actuator/health

# Test your API
curl http://localhost:8081/api/your-endpoint
```

## ⚠️ Common Issues & Solutions

### Issue 1: "Cannot find Maven wrapper"
**Solution:** Either:
- Commit `.mvn/` folder to git
- Install Maven system-wide
- Use Gradle instead

### Issue 2: "Port already in use"
**Solution:**
```bash
# Find and kill process using port
# Windows:
netstat -ano | findstr :8081
taskkill /PID <pid> /F

# Linux/Mac:
lsof -i :8081
kill -9 <pid>
```

### Issue 3: "Database connection failed"
**Solution:**
- Check DB_URL in .env
- Verify database is accessible from Docker
- For localhost DB, use `host.docker.internal` instead of `localhost`
- Check firewall rules

### Issue 4: "Build fails - Out of memory"
**Solution:**
```bash
# Increase Docker memory in Docker Desktop settings
# Or add to Dockerfile:
ENV MAVEN_OPTS="-Xmx512m"
```

### Issue 5: ".env file not loaded"
**Solution:**
```bash
# Use --env-file flag explicitly
docker run --env-file .env ...

# Or in docker-compose.yml, add:
env_file:
  - .env
```

## 📦 What Gets Included in Docker Image

### Included:
✅ Compiled JAR file (application)
✅ JRE (Java Runtime Environment)
✅ Application dependencies (from Maven)
✅ Configuration files (application.yml)

### NOT Included (via .dockerignore):
❌ Source code (.java files)
❌ Build artifacts (target/ folder)
❌ .env files (use environment variables instead)
❌ Git history
❌ IDE configurations
❌ Test files
❌ Documentation

## 🔐 Security Best Practices

1. **Never commit .env to Git**
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use non-root user in Dockerfile**
   ```dockerfile
   RUN groupadd -r spring && useradd -r -g spring spring
   USER spring:spring
   ```

3. **Scan for vulnerabilities**
   ```bash
   docker scan your-app-name:latest
   ```

4. **Use specific base image versions**
   ```dockerfile
   # Good: Specific version
   FROM eclipse-temurin:21-jre-jammy
   
   # Bad: Latest (unpredictable)
   FROM openjdk:latest
   ```

5. **Minimize image layers**
   - Combine RUN commands
   - Clean up in same layer
   - Use multi-stage builds

## 📝 Environment Variables Reference

### Required for All Spring Boot Apps:
```properties
SERVER_PORT=8081
SPRING_PROFILES_ACTIVE=prod
```

### Required for Database:
```properties
SPRING_DATASOURCE_URL=jdbc:mysql://host:3306/db
SPRING_DATASOURCE_USERNAME=user
SPRING_DATASOURCE_PASSWORD=pass
SPRING_JPA_HIBERNATE_DDL_AUTO=update
```

### Optional - Mail Service:
```properties
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your@email.com
SPRING_MAIL_PASSWORD=app-password
```

### Optional - OAuth:
```properties
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
```

## 🎯 Quick Start Template

For future projects, use this checklist:

1. [ ] Install Docker Desktop
2. [ ] Create `Dockerfile` (copy from archive)
3. [ ] Create `.dockerignore` (copy from archive)
4. [ ] Create `docker-compose.yml` (copy from archive)
5. [ ] Create `.env` with your values
6. [ ] Add actuator to `pom.xml`
7. [ ] Add management endpoints to `application.yml`
8. [ ] Build: `docker build -t myapp .`
9. [ ] Run: `docker run -d -p 8081:8081 --env-file .env myapp`
10. [ ] Test: `curl http://localhost:8081/actuator/health`

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Spring Boot with Docker](https://spring.io/guides/gs/spring-boot-docker/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Best Practices for Dockerfile](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

---

**Save this file for future projects!** 🚀

All templates are in the `/docker-templates/` archive folder.
