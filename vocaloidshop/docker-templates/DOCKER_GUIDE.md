# 🐳 Docker Deployment Guide for VocaloCart Backend

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose (comes with Docker Desktop)
- `.env` file with your configuration

## 🏗️ Build Options

### Option 1: Build Docker Image Only

```bash
# Navigate to the backend directory
cd vocaloidshop

# Build the Docker image
docker build -t vocalocart-backend:latest .

# Build with a specific tag
docker build -t vocalocart-backend:v1.0.0 .
```

### Option 2: Using Docker Compose (Recommended)

#### For Development (with local MySQL):
```bash
# Build and start all services (backend + MySQL)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v
```

#### For Production (with AWS RDS):
```bash
# Build and start backend only (uses external RDS)
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Stop service
docker-compose -f docker-compose.prod.yml down
```

## 🚀 Running the Docker Container

### Method 1: Using Docker Run (with AWS RDS)

```bash
# Make sure your .env file is loaded
docker run -d \
  --name vocalocart-backend \
  -p 8081:8081 \
  --env-file .env \
  vocalocart-backend:latest
```

### Method 2: With Manual Environment Variables

```bash
docker run -d \
  --name vocalocart-backend \
  -p 8081:8081 \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://mydb.czwaweqgeexp.ap-northeast-2.rds.amazonaws.com:3306/vocalocart?serverTimezone=Asia/Seoul&characterEncoding=UTF-8" \
  -e SPRING_DATASOURCE_USERNAME="root" \
  -e SPRING_DATASOURCE_PASSWORD="DoodyDanks48" \
  -e MAIL_PASSWORD="YOUR_SENDGRID_API_KEY" \
  -e FRONTEND_BASE_URL="http://localhost:5173" \
  vocalocart-backend:latest
```

## 🔍 Monitoring & Debugging

### View Container Logs
```bash
# Follow logs in real-time
docker logs -f vocalocart-backend

# View last 100 lines
docker logs --tail 100 vocalocart-backend
```

### Check Container Status
```bash
# List running containers
docker ps

# Check health status
docker inspect vocalocart-backend | grep -A 5 Health
```

### Access Container Shell
```bash
# Enter the running container
docker exec -it vocalocart-backend bash

# Check Java process
docker exec -it vocalocart-backend ps aux
```

### View Container Resource Usage
```bash
docker stats vocalocart-backend
```

## 🧪 Testing the Application

```bash
# Health check endpoint
curl http://localhost:8081/actuator/health

# API documentation
curl http://localhost:8081/swagger-ui.html

# Test a simple endpoint
curl http://localhost:8081/api/products
```

## 🛠️ Troubleshooting

### Issue: Container exits immediately

**Check logs:**
```bash
docker logs vocalocart-backend
```

**Common causes:**
- Missing environment variables
- Database connection failure
- Port already in use

### Issue: Database connection refused

**If using Docker MySQL:**
- Make sure MySQL container is healthy: `docker ps`
- Check if containers are on the same network: `docker network inspect vocalocart-network`

**If using AWS RDS:**
- Verify RDS security group allows connections from your IP
- Check RDS endpoint is correct in `.env`
- Ensure credentials are correct

### Issue: Port 8081 already in use

```bash
# Find process using port 8081
# On Windows (PowerShell)
netstat -ano | findstr :8081

# On Linux/Mac
lsof -i :8081

# Kill the process or use a different port
docker run -d -p 8082:8081 ...
```

### Issue: Build fails

```bash
# Clean build with no cache
docker build --no-cache -t vocalocart-backend:latest .

# Check Docker disk space
docker system df

# Clean up unused resources
docker system prune -a
```

## 🔄 Update & Rebuild

```bash
# Stop and remove old container
docker stop vocalocart-backend
docker rm vocalocart-backend

# Rebuild image
docker build -t vocalocart-backend:latest .

# Run new container
docker run -d --name vocalocart-backend -p 8081:8081 --env-file .env vocalocart-backend:latest
```

### Using Docker Compose:
```bash
# Rebuild and restart
docker-compose up -d --build

# Force recreate containers
docker-compose up -d --force-recreate
```

## 📦 Push to Docker Hub (Optional)

```bash
# Login to Docker Hub
docker login

# Tag your image
docker tag vocalocart-backend:latest yourusername/vocalocart-backend:latest
docker tag vocalocart-backend:latest yourusername/vocalocart-backend:v1.0.0

# Push to Docker Hub
docker push yourusername/vocalocart-backend:latest
docker push yourusername/vocalocart-backend:v1.0.0
```

## 🗑️ Cleanup Commands

```bash
# Stop all containers
docker stop $(docker ps -aq)

# Remove all containers
docker rm $(docker ps -aq)

# Remove all images
docker rmi $(docker images -q)

# Remove all unused resources (careful!)
docker system prune -a --volumes

# Remove only this project's resources
docker-compose down -v --rmi all
```

## 🌐 Deployment to Cloud

### AWS ECS/EKS:
1. Push image to ECR (Elastic Container Registry)
2. Create ECS task definition
3. Deploy to ECS cluster or EKS

### Azure Container Instances:
```bash
az container create \
  --resource-group myResourceGroup \
  --name vocalocart-backend \
  --image yourusername/vocalocart-backend:latest \
  --ports 8081 \
  --environment-variables \
    SPRING_DATASOURCE_URL="jdbc:mysql://..." \
    SPRING_DATASOURCE_USERNAME="root" \
    SPRING_DATASOURCE_PASSWORD="..." 
```

### Google Cloud Run:
```bash
gcloud run deploy vocalocart-backend \
  --image gcr.io/project-id/vocalocart-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | Database JDBC URL | `jdbc:mysql://host:3306/db` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | `yourpassword` |
| `MAIL_HOST` | SMTP host | `smtp.sendgrid.net` |
| `MAIL_PORT` | SMTP port | `587` |
| `MAIL_USERNAME` | SMTP username | `apikey` |
| `MAIL_PASSWORD` | SendGrid API key | `SG.xxx` |
| `FRONTEND_BASE_URL` | Frontend URL | `http://localhost:5173` |
| `SERVER_PORT` | Server port | `8081` |
| `JPA_DDL_AUTO` | Hibernate DDL mode | `update` |

## 🎯 Quick Start Commands

```bash
# 1. Navigate to backend directory
cd vocaloidshop

# 2. Build the image
docker build -t vocalocart-backend .

# 3. Run with docker-compose (recommended)
docker-compose -f docker-compose.prod.yml up -d

# 4. Check logs
docker-compose logs -f backend

# 5. Test the application
curl http://localhost:8081/actuator/health
```

## ✅ Verification Checklist

- [ ] Docker image builds successfully
- [ ] Container starts without errors
- [ ] Health check endpoint returns UP
- [ ] Application connects to database
- [ ] Frontend can communicate with backend
- [ ] Environment variables are loaded correctly
- [ ] Logs show no errors
- [ ] API endpoints respond correctly

---

**Need help?** Check the logs first: `docker logs vocalocart-backend`
