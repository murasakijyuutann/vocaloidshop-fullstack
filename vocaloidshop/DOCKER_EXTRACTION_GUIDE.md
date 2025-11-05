# Docker Container/Image Extraction Guide

## Yes, Docker is EXTREMELY Useful for Accidents Like This! 🛟

### Why Docker Saves You:

1. **Immutable Snapshots:** Once built, the image preserves everything
2. **Self-Contained:** All code, dependencies, config files are packaged
3. **Recoverable:** You can extract files from containers/images anytime
4. **Version Control:** Each image is a point-in-time backup

---

## What I Just Extracted From Your Running Container

### Successfully Recovered:

✅ **Compiled Application:** `app.jar` (73.8 MB)  
✅ **Configuration Files:** `application.yml`, `application-env.yml`  
✅ **All Compiled Classes:** 50+ `.class` files  
✅ **Dependencies:** All JAR files in `BOOT-INF/lib/`

### Files Found in Container:

```
extracted-jar/
├── BOOT-INF/
│   ├── classes/
│   │   ├── application.yml          ✅ Configuration
│   │   ├── application-env.yml      ✅ Environment config
│   │   ├── db/                      ✅ Database scripts (if any)
│   │   └── mjyuu/vocaloidshop/      ✅ All compiled classes
│   │       ├── config/
│   │       │   ├── AppConfig.class
│   │       │   └── SecurityConfig.class
│   │       ├── controller/
│   │       │   ├── AuthController.class
│   │       │   ├── ProductController.class
│   │       │   ├── CategoryController.class
│   │       │   ├── CartController.class
│   │       │   ├── OrderController.class
│   │       │   ├── UserController.class
│   │       │   ├── AddressController.class      ⚠️ NEW! (not in regenerated code)
│   │       │   ├── ContactController.class      ⚠️ NEW!
│   │       │   └── WishlistController.class     ⚠️ NEW!
│   │       ├── dto/
│   │       │   ├── AddressRequestDTO.class      ⚠️ NEW!
│   │       │   ├── AddressResponseDTO.class     ⚠️ NEW!
│   │       │   └── ... (all other DTOs)
│   │       ├── entity/
│   │       ├── repository/
│   │       ├── service/                         ⚠️ May contain service classes!
│   │       └── util/                            ⚠️ May contain utilities!
│   └── lib/                         ✅ All dependencies (Spring Boot, MySQL, etc.)
├── META-INF/
└── org/                             ✅ Spring Boot loader classes
```

---

## 🚨 IMPORTANT DISCOVERY: Your Old Backend Had MORE Features!

Looking at the extracted files, I found **controllers that weren't in my regeneration:**

### Additional Controllers Found:
1. **AddressController.class** - User address management
2. **ContactController.class** - Contact form handling
3. **WishlistController.class** - Wishlist functionality

### Additional DTOs Found:
1. **AddressRequestDTO.class** / **AddressResponseDTO.class**
2. Possibly more contact/wishlist DTOs

**This means the old backend had MORE features than what I recreated!**

---

## Methods to Extract Files from Docker

### Method 1: Extract from Running Container (What I Just Did)

```bash
# Copy files from container to local machine
docker cp vocalocart-backend:/app/app.jar ./extracted-app.jar

# Extract the JAR contents
jar -xf extracted-app.jar

# Now you have access to:
# - Configuration files (application.yml)
# - Compiled classes (.class files)
# - All dependencies
```

### Method 2: Save Entire Docker Image

```bash
# Save image to a tar file (for backup/transfer)
docker save vocaloidshop-backend:latest -o vocaloidshop-backup.tar

# Later, load it back
docker load -i vocaloidshop-backup.tar

# Or transfer to another machine
scp vocaloidshop-backup.tar user@other-machine:/path/
```

### Method 3: Inspect Container File System

```bash
# Browse files inside running container
docker exec vocalocart-backend sh -c "ls -la"
docker exec vocalocart-backend sh -c "cat /app/application.yml"

# Interactive shell access
docker exec -it vocalocart-backend sh
# Now you can explore the entire file system
```

### Method 4: Export Container as Tar

```bash
# Export entire container filesystem
docker export vocalocart-backend -o container-backup.tar

# Extract to see all files
tar -xf container-backup.tar
```

### Method 5: Use Docker Commit (Create New Image from Container)

```bash
# Create a new image from running container (preserves any runtime changes)
docker commit vocalocart-backend vocaloidshop-backup:manual

# Now you have a backup image
docker images | grep backup
```

---

## Decompiling Class Files to Java Source

### Option 1: Use JD-GUI (Graphical)
```bash
# Download from: http://java-decompiler.github.io/
# Open JD-GUI and load the .class files
# View/export decompiled Java source code
```

### Option 2: Use CFR (Command Line)
```bash
# Download CFR decompiler
wget https://github.com/leibnitz27/cfr/releases/download/0.152/cfr-0.152.jar

# Decompile a single class
java -jar cfr-0.152.jar BOOT-INF/classes/mjyuu/vocaloidshop/controller/AddressController.class

# Decompile entire package
java -jar cfr-0.152.jar BOOT-INF/classes/mjyuu/vocaloidshop/ --outputdir src/
```

### Option 3: Use IntelliJ IDEA
```bash
# Open IntelliJ IDEA
# File → Open → Select the extracted-app.jar
# IntelliJ will automatically decompile and show source code
# You can even debug the JAR file!
```

---

## What You Can Recover vs. What You Can't

### ✅ CAN Recover:
- **Configuration files** (application.yml, .properties)
- **Static resources** (HTML, CSS, JS, images)
- **Database migration scripts** (Flyway/Liquibase)
- **Compiled logic** (via decompilation - ~90% accurate)
- **Dependencies** (all JAR files)
- **Runtime environment** (Java version, libraries)

### ⚠️ PARTIALLY Recoverable:
- **Source code** - Decompiled code loses:
  - Comments
  - Original variable names (some are preserved)
  - Code formatting
  - Annotations (mostly preserved)
  - Generics (mostly preserved)
  - Lambda expressions (may be complex)

### ❌ CANNOT Recover:
- **Git history** (commits, branches)
- **Documentation** (README, markdown files not in JAR)
- **Build scripts** (Maven/Gradle outside resources/)
- **Test files** (unless packaged in JAR)
- **Local environment configs** (.env files)
- **Docker files** (unless COPY'd into image)

---

## How to Use Extracted Files

### 1. Extract Configuration (Already Done)
```bash
# Copy application.yml from extracted JAR
cp extracted-jar/BOOT-INF/classes/application.yml src/main/resources/

# Found differences:
# - Old had springdoc/swagger config (I didn't regenerate this!)
# - Old had application-env.yml (environment-specific config)
```

### 2. Decompile Missing Controllers

I can decompile `AddressController`, `ContactController`, `WishlistController` to see what they did!

### 3. Compare with Regenerated Code

We can compare the decompiled code with what I regenerated to find differences.

### 4. Identify Missing Features

From the extracted classes, we can create a complete feature list.

---

## Recommended Next Steps

### Immediate Actions:

1. **Decompile the missing controllers:**
   ```bash
   java -jar cfr.jar BOOT-INF/classes/mjyuu/vocaloidshop/controller/AddressController.class
   java -jar cfr.jar BOOT-INF/classes/mjyuu/vocaloidshop/controller/ContactController.class
   java -jar cfr.jar BOOT-INF/classes/mjyuu/vocaloidshop/controller/WishlistController.class
   ```

2. **Check for service classes:**
   ```bash
   find BOOT-INF/classes/mjyuu/vocaloidshop/service -name "*.class"
   ```

3. **Compare application.yml:**
   - Old has Swagger/OpenAPI config
   - Old has application-env.yml
   - Should update regenerated version

4. **Backup the Docker image:**
   ```bash
   docker save vocaloidshop-backend:latest -o ~/vocaloidshop-backup-$(date +%Y%m%d).tar
   ```

---

## Docker as Disaster Recovery

### Benefits You Just Experienced:

1. **Instant Backup:** Every `docker build` creates a recoverable snapshot
2. **Zero Downtime:** Application kept running despite source deletion
3. **Forensics:** Can inspect what was actually deployed
4. **Rollback:** Can always go back to previous images
5. **Portability:** Can extract and run anywhere

### Best Practices Going Forward:

1. **Tag Images with Versions:**
   ```bash
   docker build -t vocaloidshop-backend:v1.0.0 .
   docker build -t vocaloidshop-backend:v1.1.0 .
   # Keep multiple versions
   ```

2. **Push to Docker Registry:**
   ```bash
   docker tag vocaloidshop-backend:latest username/vocaloidshop-backend:latest
   docker push username/vocaloidshop-backend:latest
   # Now it's backed up in the cloud (Docker Hub, AWS ECR, etc.)
   ```

3. **Automated Backups:**
   ```bash
   # Daily backup script
   docker save vocaloidshop-backend:latest | gzip > backup-$(date +%Y%m%d).tar.gz
   ```

4. **Multi-Stage Builds with Source:**
   ```dockerfile
   # Keep source code in a stage for recovery
   FROM maven:3.9-eclipse-temurin-21 AS source
   COPY . /source
   # This stage can be extracted later
   ```

---

## Conclusion

**Yes, Docker is EXTREMELY useful for accidents like this!** 

You can think of Docker images as:
- ✅ Automated application snapshots
- ✅ Deployable backups
- ✅ Version control for entire runtime environments
- ✅ Insurance against source code loss

**What you can do now:**
1. ✅ Keep running the old backend (it's safe in Docker)
2. ✅ Extract any missing code using decompilation
3. ✅ Compare old vs. regenerated to find differences
4. ✅ Build new images with improvements
5. ✅ Push images to registry for cloud backup

**The Docker image saved you from complete data loss!** 🎉
